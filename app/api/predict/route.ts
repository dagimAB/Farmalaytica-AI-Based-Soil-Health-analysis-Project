export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { spawn } from "child_process";
import path from "node:path";

export async function POST(req: NextRequest) {
  try {
    const { N, P, K, pH } = await req.json();

    // Validation
    if (
      [N, P, K, pH].some(
        (v) => v === undefined || v === null || isNaN(Number(v))
      )
    ) {
      return NextResponse.json(
        { error: "Missing or invalid fields" },
        { status: 400 }
      );
    }

    const scriptPath = path.join(process.cwd(), "scripts", "predict_soil.py");

    const pythonExecutable = process.env.PYTHON_PATH || "python";

    // Spawn Python process WITHOUT shell and pass each argument as a separate string.
    // This ensures paths with spaces (e.g., 'D:\Tech Hub\...') are handled correctly.
    const pythonProcess = spawn(
      pythonExecutable,
      ["-u", scriptPath, String(N), String(P), String(K), String(pH)],
      {
        shell: false,
      }
    );

    let result = "";
    let errorOutput = "";

    // timeout (ms) for python prediction
    const PREDICT_TIMEOUT_MS = 15000;

    return new Promise((resolve) => {
      pythonProcess.stdout.on("data", (data: Buffer) => {
        result += data.toString();
      });

      pythonProcess.stderr.on("data", (data: Buffer) => {
        errorOutput += data.toString();
      });

      // kill the python process if it takes too long
      const killTimer = setTimeout(() => {
        try {
          pythonProcess.kill("SIGKILL");
        } catch (e) {
          /* ignore */
        }
        console.error("Prediction timed out (killed python process)");
        resolve(
          NextResponse.json({ error: "Prediction timed out" }, { status: 504 })
        );
      }, PREDICT_TIMEOUT_MS);

      pythonProcess.on("close", (code: number) => {
        clearTimeout(killTimer);
        // Prefer parsing JSON output from Python bridge (more robust)
        const out = result.trim();
        try {
          const parsed = JSON.parse(out);
          if (parsed && parsed.prediction) {
            resolve(
              NextResponse.json({
                success: true,
                prediction: parsed.prediction,
              })
            );
            return;
          }
        } catch (e) {
          // not JSON, fall back
        }

        if (code !== 0) {
          const detail = errorOutput || out || "Unknown Python error";
          console.error("Python Error:", detail);
          resolve(
            NextResponse.json(
              { error: "AI Prediction Failed", details: detail },
              { status: 500 }
            )
          );
        } else {
          resolve(NextResponse.json({ prediction: out }));
        }
      });
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
