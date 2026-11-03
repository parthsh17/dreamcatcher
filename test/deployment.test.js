import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { rm } from 'node:fs/promises';
import { join } from 'node:path';
import test from 'node:test';

const projectRoot = join(import.meta.dirname, '..');
const testDatabase = join(import.meta.dirname, 'deployment.db');
const port = 3217;

test('Render compatibility command starts the app and serves its health check', async (t) => {
  const server = spawn(process.execPath, ['start'], {
    cwd: projectRoot,
    env: {
      ...process.env,
      DATABASE_PATH: testDatabase,
      NODE_ENV: 'production',
      PORT: String(port),
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  let output = '';
  server.stdout.on('data', (chunk) => { output += chunk; });
  server.stderr.on('data', (chunk) => { output += chunk; });

  t.after(async () => {
    server.kill();
    await rm(testDatabase, { force: true });
  });

  await Promise.race([
    new Promise((resolve, reject) => {
      server.stdout.on('data', () => {
        if (output.includes(`Server running on http://localhost:${port}`)) resolve();
      });
      server.once('exit', (code) => reject(new Error(`Server exited with ${code}:\n${output}`)));
    }),
    new Promise((_, reject) => {
      setTimeout(() => reject(new Error(`Server did not start:\n${output}`)), 5000);
    }),
  ]);

  const response = await fetch(`http://127.0.0.1:${port}/api/health`);
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { status: 'ok' });
});
