const http = require('http');
const { URL } = require('url');

const HOST = '127.0.0.1';
const PORT = 3210;

let pendingAction = null;
let lastResult = null;

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  });
  res.end(JSON.stringify(payload, null, 2));
}

function isAllowedHttpUrl(value) {
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

function collectBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk;
      if (body.length > 100_000) {
        reject(new Error('Payload too large'));
        req.destroy();
      }
    });
    req.on('end', () => resolve(body));
    req.on('error', reject);
  });
}

const server = http.createServer(async (req, res) => {
  if (req.method === 'OPTIONS') {
    return sendJson(res, 200, { ok: true });
  }

  if (req.method === 'GET' && req.url === '/health') {
    return sendJson(res, 200, { ok: true, pending: !!pendingAction, hasResult: !!lastResult });
  }

  if (req.method === 'GET' && req.url === '/next-action') {
    if (!pendingAction) {
      return sendJson(res, 200, { ok: true, action: null });
    }

    const action = pendingAction;
    pendingAction = null;
    return sendJson(res, 200, { ok: true, action });
  }

  if (req.method === 'GET' && req.url === '/last-result') {
    return sendJson(res, 200, { ok: true, result: lastResult });
  }

  if (req.method === 'POST' && req.url === '/report-result') {
    try {
      const raw = await collectBody(req);
      const data = raw ? JSON.parse(raw) : {};
      lastResult = {
        reportedAt: new Date().toISOString(),
        ...data
      };
      return sendJson(res, 200, { ok: true, stored: true, result: lastResult });
    } catch (error) {
      return sendJson(res, 400, {
        ok: false,
        error: error.message || 'Invalid request body'
      });
    }
  }

  if (req.method === 'POST' && (req.url === '/open-url' || req.url === '/close-url')) {
    try {
      const raw = await collectBody(req);
      const data = raw ? JSON.parse(raw) : {};

      if (req.url === '/open-url') {
        const url = typeof data.url === 'string' ? data.url.trim() : '';

        if (!url || !isAllowedHttpUrl(url)) {
          return sendJson(res, 400, {
            ok: false,
            error: 'Only http/https URLs are allowed.'
          });
        }

        pendingAction = {
          type: 'open_url',
          url,
          createdAt: new Date().toISOString()
        };
      } else {
        const match = typeof data.match === 'string' ? data.match.trim() : '';
        if (!match) {
          return sendJson(res, 400, {
            ok: false,
            error: 'A non-empty match string is required.'
          });
        }

        pendingAction = {
          type: 'close_url',
          match,
          createdAt: new Date().toISOString()
        };
      }

      return sendJson(res, 200, {
        ok: true,
        queued: true,
        action: pendingAction
      });
    } catch (error) {
      return sendJson(res, 400, {
        ok: false,
        error: error.message || 'Invalid request body'
      });
    }
  }

  return sendJson(res, 404, { ok: false, error: 'Not found' });
});

server.listen(PORT, HOST, () => {
  console.log(`Browser companion listening on http://${HOST}:${PORT}`);
});
