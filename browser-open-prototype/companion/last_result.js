const http = require('http');

const req = http.request(
  {
    hostname: '127.0.0.1',
    port: 3210,
    path: '/last-result',
    method: 'GET'
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
  process.exit(1);
});

req.end();
