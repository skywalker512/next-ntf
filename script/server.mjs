//@ts-check
import http from 'http';
import { URL } from 'url';
import { createRequire } from 'module'
const require = createRequire(import.meta.url)

const Server = require('next/dist/server/next-server').default;
const loadConfig = require('next/dist/server/config').default;

const conf = await loadConfig(
  (
    await import('next/dist/shared/lib/constants.js')
  ).PHASE_PRODUCTION_SERVER,
  new URL('../', import.meta.url).pathname,
);

const app = new Server({
  conf,
});

const handle = app.getRequestHandler();
const server = http.createServer(async (req, res) => {
  await handle(req, res);
});

server.listen(3010);
