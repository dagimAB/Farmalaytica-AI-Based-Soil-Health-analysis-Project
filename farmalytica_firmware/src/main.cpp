#include <Arduino.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include "secrets.h"

// RS485 (Modbus RTU) pins
#define RS485_RX_PIN 16
#define RS485_TX_PIN 17
#define DE_RE_PIN 4

// Modbus settings
const uint32_t MODBUS_BAUD = 9600;
const uint8_t MODBUS_SLAVE_ID = 1; // adjust to your device

// API endpoint
const char* API_URL = "http://10.172.3.65:3000/api/predict";

// Helper: CRC16 (Modbus)
uint16_t modbus_crc16(const uint8_t* data, size_t len) {
  uint16_t crc = 0xFFFF;
  for (size_t pos = 0; pos < len; pos++) {
    crc ^= (uint16_t)data[pos];
    for (int i = 0; i < 8; i++) {
      if (crc & 0x0001) crc = (crc >> 1) ^ 0xA001;
      else crc = (crc >> 1);
    }
  }
  return crc;
}

// Send Modbus RTU request (function 3 = read holding registers)
bool modbus_read_holding_regs(uint8_t slave, uint16_t startReg, uint16_t count, uint8_t* respBuf, size_t &respLen, unsigned long timeoutMs = 500) {
  // Build request: [slave][func][start hi][start lo][count hi][count lo][crc lo][crc hi]
  uint8_t req[8];
  req[0] = slave;
  req[1] = 0x03;
  req[2] = (startReg >> 8) & 0xFF;
  req[3] = startReg & 0xFF;
  req[4] = (count >> 8) & 0xFF;
  req[5] = count & 0xFF;
  uint16_t crc = modbus_crc16(req, 6);
  req[6] = crc & 0xFF;
  req[7] = (crc >> 8) & 0xFF;

  // Enable driver (DE/RE HIGH)
  digitalWrite(DE_RE_PIN, HIGH);
  delay(2);
  Serial2.write(req, sizeof(req));
  Serial2.flush();
  delay(2);
  // Set to receive
  digitalWrite(DE_RE_PIN, LOW);

  unsigned long start = millis();
  respLen = 0;
  while (millis() - start < timeoutMs) {
    while (Serial2.available()) {
      if (respLen < 256) respBuf[respLen++] = Serial2.read();
      else Serial2.read();
    }
    if (respLen >= 5) { // minimal response length
      // basic validation: slave & function
      if (respBuf[0] != slave) return false;
      if (respBuf[1] & 0x80) return false; // error
      size_t expected = 5 + respBuf[2]; // addr(1)+func(1)+bytecount(1)+data(bytecount)+crc(2)
      if (respLen >= expected) {
        // verify CRC
        uint16_t rcrc = modbus_crc16(respBuf, expected - 2);
        uint16_t recvCrc = respBuf[expected - 2] | (respBuf[expected - 1] << 8);
        if (rcrc == recvCrc) return true;
        else return false;
      }
    }
    delay(10);
  }
  return false; // timeout
}

// Read N,P,K registers from sensor. Assumptions:
// - N at register 0 (0x0000), P at 1, K at 2
// - Values are 16-bit unsigned integers. Adjust parsing if your sensor differs.
bool read_NPK(float &N, float &P, float &K) {
  uint8_t buf[256];
  size_t len = 0;
  // read 3 registers starting at 0
  if (!modbus_read_holding_regs(MODBUS_SLAVE_ID, 0x0000, 3, buf, len)) return false;
  // buf[0]=slave, buf[1]=func, buf[2]=bytecount, data..., crc
  if (len < 9) return false;
  uint8_t bytecount = buf[2];
  if (bytecount < 6) return false; // need 3 regs x 2 bytes
  size_t idx = 3;
  uint16_t rawN = (buf[idx] << 8) | buf[idx+1]; idx += 2;
  uint16_t rawP = (buf[idx] << 8) | buf[idx+1]; idx += 2;
  uint16_t rawK = (buf[idx] << 8) | buf[idx+1];

  // NOTE: adjust scaling if your sensor uses fixed point
  N = (float)rawN;
  P = (float)rawP;
  K = (float)rawK;
  return true;
}

// WiFi connect
void connectWiFi() {
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.printf("Connecting to WiFi '%s'...\n", WIFI_SSID);
  unsigned long start = millis();
  while (WiFi.status() != WL_CONNECTED) {
    if (millis() - start > 15000) {
      Serial.println("WiFi connect timeout, retrying...");
      start = millis();
    }
    delay(500);
    Serial.print('.');
  }
  Serial.println();
  Serial.print("Connected. IP: "); Serial.println(WiFi.localIP());
}

// Send JSON POST to API
bool send_prediction(float N, float P, float K) {
  if (WiFi.status() != WL_CONNECTED) connectWiFi();

  HTTPClient http;
  http.begin(API_URL);
  http.addHeader("Content-Type", "application/json");

  JsonDocument doc;
  doc["N"] = N;
  doc["P"] = P;
  doc["K"] = K;
  doc["pH"] = 6.5;
  String payload;
  serializeJson(doc, payload);

  Serial.println("POST payload: " + payload);
  int httpCode = http.POST(payload);
  if (httpCode > 0) {
    String resp = http.getString();
    Serial.printf("HTTP %d: %s\n", httpCode, resp.c_str());
    http.end();
    return (httpCode >= 200 && httpCode < 300);
  } else {
    Serial.printf("POST failed, error: %s\n", http.errorToString(httpCode).c_str());
    http.end();
    return false;
  }
}

void setup() {
  // Debug
  Serial.begin(115200);
  delay(500);

  // RS485 serial
  Serial2.begin(MODBUS_BAUD, SERIAL_8N1, RS485_RX_PIN, RS485_TX_PIN);
  pinMode(DE_RE_PIN, OUTPUT);
  digitalWrite(DE_RE_PIN, LOW); // receive

  // Connect WiFi
  connectWiFi();
}

unsigned long lastSend = 0;
const unsigned long SEND_INTERVAL_MS = 60UL * 1000UL; // send every 60s

void loop() {
  if (millis() - lastSend >= SEND_INTERVAL_MS) {
    lastSend = millis();
    float N, P, K;
    if (read_NPK(N, P, K)) {
      Serial.printf("Read N=%.2f, P=%.2f, K=%.2f\n", N, P, K);
      if (!send_prediction(N, P, K)) {
        Serial.println("Failed to send prediction");
      }
    } else {
      Serial.println("Failed to read NPK from sensor");
    }
  }
  delay(100);
}