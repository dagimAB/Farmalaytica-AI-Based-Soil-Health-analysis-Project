# Farmalytica — AI-Based Soil Health Analysis (MERN + IoT)

Farmalytica is an integrated AgriTech platform that merges a highly usable MERN-style dashboard with field-grade IoT sensing and AI inference to give smallholder farmers practical, timely soil management advice.

---

## MERN + IoT integration (what makes Farmalytica special)

- **Firmware (ESP32)**: Reads soil N/P/K (and optionally pH/EC) via Modbus RS485 and sends readings to the web API.
- **Backend (Next.js)**: Receives sensor data, stores readings in MongoDB, and serves the dashboard and APIs.
- **AI inference (Python)**: A scikit-learn RandomForest model classifies soil health (Poor / Average / Optimal) and produces recommendations.
- **Workflow**: Sensor → API → DB → ML prediction → Dashboard → Recommendations → Tasks/Inventory (actionable ERP features).

This design provides a clear path from sensor measurement to farmer action while keeping components decoupled for scale and reliability.

---

## Tech Stack

- Frontend / Backend: Next.js (App Router, v15) + TypeScript
- Database: MongoDB (Mongoose)
- Machine Learning: Python (scikit-learn — RandomForest)
- Firmware / IoT: ESP32 (PlatformIO) communicating NPK via Modbus RS485
- External APIs: OpenWeather (localized weather-aware recommendations; calibrated for Addis Ababa use-case)

---

## Core Features

- Real-time IoT monitoring and telemetry (N/P/K readings)
- AI-driven soil classification and fertilizer recommendations
- Smart Weather integration to avoid applying fertilizer before heavy rain
- Professional Agri-ERP dashboard: Inventory, Task Scheduler, Farm Settings, responsive layout

---

## Repository layout

- `farmalytica/` — Next.js app (UI, APIs, ML scripts, model files)
- `farmalytica_firmware/` — ESP32 PlatformIO firmware (sensor read, network posting)

> Sensitive files (e.g., `.env` and `secrets.h`) are ignored. See `.gitignore`.

---

## Quick start (development)

1. Clone the repo and install web dependencies

```bash
git clone https://github.com/dagimAB/Farmalaytica-AI-Based-Soil-Health-analysis-Project.git
cd Farmalaytica-AI-Based-Soil-Health-analysis-Project/farmalytica
npm install
```

2. Copy sample env file and set secrets

```bash
cp .env.example .env.local
# Edit .env.local and set MONGODB_URI and OPENWEATHER_API_KEY
```

3. Start the Next.js app

```bash
npm run dev
```

4. Firmware (local development)

- Copy `farmalytica_firmware/src/secrets.h.example` to `farmalytica_firmware/include/secrets.h` and update WiFi and API settings.
- Build & upload using PlatformIO (`pio run -t upload -e <env>` or use VSCode PlatformIO).

---

## Files added as examples

- `farmalytica_firmware/src/secrets.h.example` — Safe template for firmware Wi-Fi and API values (do not commit real credentials)
- `.env.example` — Template for `MONGODB_URI` and `OPENWEATHER_API_KEY`

---

## Data Note

- The `training_data.csv` dataset is **excluded** from this repository to keep the repository lightweight and to avoid pushing very large files. The raw dataset is large and suitable for offline model training; it is intentionally omitted from version control.
- **Access**: The dataset can be provided upon request for legitimate research or collaboration purposes — contact the project owner to arrange secure transfer.

---

## Future Roadmap

1. **Migrating AI Inference to a FastAPI microservice (containerized with Docker)** — Load the model once in a persistent service to reduce latency, enable health checks, and make the inference layer easily deployable and scalable via containers.
2. Add authentication & per-farm multi-user support (JWT, roles)
3. CI for model checks and automated retraining pipelines
4. Offline-capable firmware (local buffering and retries, OTA updates)
5. Integrate calendaring & notifications for scheduled tasks

---

## Security & best practices

- Keep `.env.local` and `farmalytica_firmware/include/secrets.h` out of version control (they are in `.gitignore`).
- If you find a secret has been committed, rotate it and remove it from history (I can help with `git filter-repo`).

---

## Git commands to initialize & push (exact commands)

```bash
# From project root (where this README lives)
# 1. Initialize repo (if not already)
git init

# 2. Add remote (if you haven't already)
git remote add origin https://github.com/dagimAB/Farmalaytica-AI-Based-Soil-Health-analysis-Project.git

# 3. Stage new example files and updated README
git add .env.example farmalytica_firmware/src/secrets.h.example README.md
# or stage everything
git add .

# 4. Commit with a concise, professional message
git commit -m "chore: add env & firmware examples; highlight MERN+IoT integration and roadmap"

# 5. Push to main branch (create if needed)
git branch -M main
git push -u origin main
```

---

If you'd like, I can create the commit for you locally and push to your remote (I will need remote access or your consent to run the push). Otherwise you can run the commands above — let me know when you're ready and I'll provide any assistance for the push (or to add a PR branch instead).
