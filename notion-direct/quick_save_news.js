import fs from 'fs';
import { execFileSync } from 'child_process';

const [,, titleArg, bodyArg] = process.argv;

if (!titleArg || !bodyArg) {
  console.error('Usage: node quick_save_news.js <title> <body>');
  process.exit(1);
}

const lines = bodyArg
  .split(/\n+/)
  .map(s => s.trim())
  .filter(Boolean);

const items = lines.map((line, index) => {
  const cleaned = line.replace(/^\d+[\.、]\s*/, '');
  const parts = cleaned.split(/[：:]/);
  if (parts.length >= 2) {
    const head = parts.shift().trim();
    const rest = parts.join('：').trim();
    return {
      title: head || `第${index + 1}条`,
      summary: rest || cleaned,
      details: rest || cleaned,
      impact: ''
    };
  }
  return {
    title: `第${index + 1}条`,
    summary: cleaned,
    details: cleaned,
    impact: ''
  };
});

const payload = {
  title: titleArg,
  summary: `本页共整理 ${items.length} 条消息。`,
  items
};

const tempPath = './.quick_news.json';
fs.writeFileSync(tempPath, JSON.stringify(payload, null, 2), 'utf8');

try {
  execFileSync('node', ['write_structured_page.js', tempPath], { stdio: 'inherit' });
} finally {
  fs.unlinkSync(tempPath);
}
