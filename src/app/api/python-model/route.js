import { NextResponse } from 'next/server';
export const runtime = 'nodejs';
import path from 'path';
import fs from 'fs';
import os from 'os';
import { spawn } from 'child_process';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    if (!file || typeof file === 'string') {
      return NextResponse.json({ message: 'No file uploaded', status: 400 });
    }

    // Ensure tmp directory exists
    const tmpDir = os.tmpdir();
    if (!fs.existsSync(tmpDir)) {
      fs.mkdirSync(tmpDir, { recursive: true });
    }

    // Persist file to disk for the Python process
    const originalName = file.name || 'uploaded_file';
    const uniqueName = `${Date.now()}_${originalName}`;
    const savedPath = path.join(tmpDir, uniqueName);
    const buffer = Buffer.from(await file.arrayBuffer());
    fs.writeFileSync(savedPath, buffer);

    const pythonCmd = process.env.PYTHON_CMD || 'python';
    const scriptPath = process.env.PYTHON_MODEL_SCRIPT || 'model/run.py';
    const args = (process.env.PYTHON_MODEL_ARGS || '').split(' ').filter(Boolean);

    const fullArgs = [scriptPath, '--input', savedPath, ...args];

    const result = await new Promise((resolve) => {
      const child = spawn(pythonCmd, fullArgs, { shell: true });
      let stdout = '';
      let stderr = '';

      child.stdout.on('data', (data) => {
        stdout += data.toString();
      });
      child.stderr.on('data', (data) => {
        stderr += data.toString();
      });
      child.on('close', (code) => {
        // Cleanup file after process finishes
        try { fs.unlinkSync(savedPath); } catch (_) {}

        if (code !== 0) {
          resolve({ ok: false, error: `Python exited with code ${code}`, stderr, stdout });
          return;
        }
        // Try to parse JSON from stdout; if fails, return raw text
        let parsed;
        try {
          parsed = JSON.parse(stdout);
        } catch {
          parsed = { output: stdout };
        }
        resolve({ ok: true, data: parsed });
      });
    });

    if (!result.ok) {
      return NextResponse.json({ message: 'Model execution failed', details: result, status: 500 });
    }

    return NextResponse.json({ status: 200, result: result.data, fileName: originalName });
  } catch (error) {
    return NextResponse.json({ message: error.message, status: 500 });
  }
}


