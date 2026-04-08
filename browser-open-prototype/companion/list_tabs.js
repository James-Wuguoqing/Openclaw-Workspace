const http = require('http');

function request(method, path, body) {
  return new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : null;
    const req = http.request({
      hostname: '127.0.0.1',
      port: 3210,
      path,
      method,
      headers: payload ? {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      } : undefined
    }, (res) => {
      let data = '';
      res.on('data', chunk => (data += chunk));
      res.on('end', () => resolve({ statusCode: res.statusCode, body: data }));
    });
    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

(async () => {
  try {
    const queued = await request('POST', '/list-tabs', {});
    process.stdout.write(queued.body + '\n');
    await new Promise(resolve => setTimeout(resolve, 2000));
    const result = await request('GET', '/last-result');
    process.stdout.write(result.body + '\n');
    if ((result.statusCode || 200) >= 400) process.exit(1);
  } catch (error) {
    console.error('Failed to reach browser companion:', error.message);
    process.exit(1);
  }
})();
