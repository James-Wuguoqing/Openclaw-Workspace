const http = require('http');

const [, , matchArg] = process.argv;

if (!matchArg) {
  console.error('Usage: node close_url.js <url-fragment-or-domain>');
  process.exit(1);
}

const body = JSON.stringify({ match: matchArg });

const req = http.request(
  {
    hostname: '127.0.0.1',
    port: 3210,
    path: '/close-url',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(body)
    }
  },
  (res) => {
    let data = '';
    res.on('data', chunk => (data += chunk));
    res.on('end', () => {
      process.stdout.write(data ? `${data}\n` : '');
      if (res.statusCode && res.statusCode >= 400) {
        process.exit(1);
      }
    });
  }
);

req.on('error', (error) => {
  console.error('Failed to reach browser companion:', error.message);
  console.error('Make sure server.js is running on http://127.0.0.1:3210');
  process.exit(1);
});

req.write(body);
req.end();
