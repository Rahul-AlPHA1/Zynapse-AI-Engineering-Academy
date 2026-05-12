import { spawn } from 'node:child_process';
import fs from 'node:fs';
import process from 'node:process';

const PORT = process.env.PORT || '3099';
const URL = `http://localhost:${PORT}`;

function run(command, args, options = {}) {
  return spawn(command, args, {
    stdio: 'inherit',
    shell: process.platform === 'win32',
    ...options,
  });
}

async function waitForServer(url, timeoutMs = 60_000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url);
      if (res.ok) return;
    } catch {
      // keep waiting
    }
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  throw new Error(`Timed out waiting for ${url}`);
}

const electronBin = process.platform === 'win32'
  ? 'node_modules\\.bin\\electron.cmd'
  : 'node_modules/.bin/electron';

const server = run('npx', ['tsx', 'server.ts'], {
  env: { ...process.env, PORT, DISABLE_HMR: 'true' },
});

const shutdown = () => {
  server.kill('SIGTERM');
};
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

try {
  await waitForServer(URL);
  if (!fs.existsSync(electronBin)) {
    throw new Error('Electron binary not found in node_modules.');
  }
  const electron = run(electronBin, ['.'], {
    env: { ...process.env, ZYNAPSE_ELECTRON_URL: URL },
  });
  electron.on('exit', (code) => {
    shutdown();
    process.exit(code ?? 0);
  });
} catch (err) {
  shutdown();
  console.error(err instanceof Error ? err.message : err);
  console.error('\nIf Electron is missing, install it with: npm install -D electron');
  process.exit(1);
}
