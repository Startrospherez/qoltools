#!/usr/bin/env node
'use strict';

const fs = require('fs');
const http = require('http');
const path = require('path');

const HOST = '127.0.0.1';
const DEFAULT_PORT = 8765;
const REPOSITORY_ROOT = path.resolve(__dirname, '..');
const REPOSITORY_REAL_ROOT = fs.realpathSync(REPOSITORY_ROOT);

const MIME_TYPES = new Map([
  ['.css', 'text/css; charset=utf-8'],
  ['.gif', 'image/gif'],
  ['.htm', 'text/html; charset=utf-8'],
  ['.html', 'text/html; charset=utf-8'],
  ['.jpeg', 'image/jpeg'],
  ['.jpg', 'image/jpeg'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8'],
  ['.png', 'image/png'],
  ['.svg', 'image/svg+xml; charset=utf-8'],
  ['.webp', 'image/webp'],
  ['.zip', 'application/zip'],
]);

function parsePort(argv) {
  let value = null;
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === '--port') value = argv[index + 1];
    if (argument.startsWith('--port=')) value = argument.slice('--port='.length);
  }
  if (value === null || value === undefined) return DEFAULT_PORT;
  const port = Number(value);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error(`Invalid port: ${value}`);
  }
  return port;
}

function isInsideRepository(candidate) {
  const relative = path.relative(REPOSITORY_REAL_ROOT, candidate);
  return relative === '' || (!relative.startsWith(`..${path.sep}`) && relative !== '..' && !path.isAbsolute(relative));
}

function send(response, status, headers, body = '') {
  const bytes = Buffer.from(body);
  response.writeHead(status, {
    'Cache-Control': 'no-store',
    'Content-Length': bytes.length,
    'X-Content-Type-Options': 'nosniff',
    ...headers,
  });
  response.end(bytes);
}

async function resolveRequestedFile(pathname) {
  let decoded;
  try {
    decoded = decodeURIComponent(pathname);
  } catch {
    const error = new Error('Malformed URL encoding');
    error.statusCode = 400;
    throw error;
  }

  if (decoded.includes('\0')) {
    const error = new Error('Invalid path');
    error.statusCode = 400;
    throw error;
  }

  const candidate = path.resolve(REPOSITORY_ROOT, `.${decoded}`);
  const relativeCandidate = path.relative(REPOSITORY_ROOT, candidate);
  if (relativeCandidate === '..' || relativeCandidate.startsWith(`..${path.sep}`) || path.isAbsolute(relativeCandidate)) {
    const error = new Error('Path outside repository');
    error.statusCode = 403;
    throw error;
  }

  let realCandidate;
  try {
    realCandidate = await fs.promises.realpath(candidate);
  } catch (error) {
    if (error.code === 'ENOENT' || error.code === 'ENOTDIR') error.statusCode = 404;
    throw error;
  }

  if (!isInsideRepository(realCandidate)) {
    const error = new Error('Path outside repository');
    error.statusCode = 403;
    throw error;
  }

  const stats = await fs.promises.stat(realCandidate);
  if (!stats.isFile()) {
    const error = new Error('Directory listing is disabled');
    error.statusCode = 404;
    throw error;
  }
  return { realCandidate, stats };
}

async function handleRequest(request, response, port) {
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    send(response, 405, { Allow: 'GET, HEAD', 'Content-Type': 'text/plain; charset=utf-8' }, 'Method Not Allowed');
    return;
  }

  const requestUrl = new URL(request.url, `http://${HOST}:${port}`);
  if (requestUrl.pathname === '/__health') {
    const body = JSON.stringify({ ok: true, app: 'mindmap-test-server', host: HOST, port });
    if (request.method === 'HEAD') {
      send(response, 200, { 'Content-Type': 'application/json; charset=utf-8' });
    } else {
      send(response, 200, { 'Content-Type': 'application/json; charset=utf-8' }, body);
    }
    return;
  }

  if (requestUrl.pathname === '/') {
    response.writeHead(302, {
      'Cache-Control': 'no-store',
      Location: '/tests/mindmap-browser-harness.html',
      'X-Content-Type-Options': 'nosniff',
    });
    response.end();
    return;
  }

  try {
    const { realCandidate, stats } = await resolveRequestedFile(requestUrl.pathname);
    const contentType = MIME_TYPES.get(path.extname(realCandidate).toLowerCase()) || 'application/octet-stream';
    response.writeHead(200, {
      'Cache-Control': 'no-store',
      'Content-Length': stats.size,
      'Content-Type': contentType,
      'X-Content-Type-Options': 'nosniff',
    });
    if (request.method === 'HEAD') {
      response.end();
      return;
    }
    const stream = fs.createReadStream(realCandidate);
    stream.on('error', () => response.destroy());
    stream.pipe(response);
  } catch (error) {
    const status = error.statusCode || 500;
    const message = status === 500 ? 'Internal Server Error' : error.message;
    send(response, status, { 'Content-Type': 'text/plain; charset=utf-8' }, message);
  }
}

function main() {
  const port = parsePort(process.argv.slice(2));
  const server = http.createServer((request, response) => {
    handleRequest(request, response, port).catch((error) => {
      console.error(error);
      if (!response.headersSent) send(response, 500, { 'Content-Type': 'text/plain; charset=utf-8' }, 'Internal Server Error');
      else response.destroy();
    });
  });

  server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
      console.error(`Port ${port} is already in use. Choose another port with --port.`);
    } else {
      console.error(error);
    }
    process.exitCode = 1;
  });

  server.listen(port, HOST, () => {
    console.log(`MINDMAP_TEST_SERVER http://${HOST}:${port}/tests/mindmap-browser-harness.html`);
  });

  const stop = () => server.close(() => process.exit(0));
  process.once('SIGINT', stop);
  process.once('SIGTERM', stop);
}

if (require.main === module) main();

module.exports = { isInsideRepository, parsePort, resolveRequestedFile };
