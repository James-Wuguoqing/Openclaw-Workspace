import fs from 'fs';
import { Client } from '@notionhq/client';

const token = process.env.NOTION_TOKEN;
const parentPageId = process.env.NOTION_PAGE_ID;

if (!token) {
  console.error('Missing NOTION_TOKEN');
  process.exit(1);
}

if (!parentPageId) {
  console.error('Missing NOTION_PAGE_ID');
  process.exit(1);
}

const notion = new Client({ auth: token });

const [,, inputPath] = process.argv;
if (!inputPath) {
  console.error('Usage: node write_structured_page.js <input.json>');
  process.exit(1);
}

const data = JSON.parse(fs.readFileSync(inputPath, 'utf8'));

function extractDateFromTitle(title) {
  if (!title) return '';
  const match = title.match(/\d{4}-\d{2}-\d{2}/);
  return match ? match[0] : '';
}

function textBlock(content) {
  return {
    object: 'block',
    type: 'paragraph',
    paragraph: {
      rich_text: [{ type: 'text', text: { content } }]
    }
  };
}

function headingBlock(content, level = 2) {
  const type = level === 1 ? 'heading_1' : level === 3 ? 'heading_3' : 'heading_2';
  return {
    object: 'block',
    type,
    [type]: {
      rich_text: [{ type: 'text', text: { content } }]
    }
  };
}

function bulletBlock(content) {
  return {
    object: 'block',
    type: 'bulleted_list_item',
    bulleted_list_item: {
      rich_text: [{ type: 'text', text: { content } }]
    }
  };
}

function splitText(text, size = 1800) {
  if (!text) return [];
  const parts = [];
  for (let i = 0; i < text.length; i += size) parts.push(text.slice(i, i + size));
  return parts;
}

function blocksFromLongText(prefix, text) {
  const chunks = splitText(text);
  if (chunks.length === 0) return [];
  return chunks.map((chunk, index) => textBlock(index === 0 ? `${prefix}${chunk}` : chunk));
}

async function main() {
  const children = [];

  if (data.summary) {
    children.push(headingBlock('总览', 2));
    children.push(...blocksFromLongText('', data.summary));
  }

  for (const [index, item] of (data.items || []).entries()) {
    children.push(headingBlock(`${index + 1}. ${item.title}`, 2));

    if (item.summary) {
      children.push(...blocksFromLongText('摘要：', item.summary));
    }
    if (item.details) {
      children.push(...blocksFromLongText('详细内容：', item.details));
    }
    if (item.impact) {
      children.push(...blocksFromLongText('影响：', item.impact));
    }
    if (Array.isArray(item.points) && item.points.length) {
      children.push(textBlock('要点：'));
      for (const p of item.points) children.push(...splitText(p).map(bulletBlock));
    }
  }

  const response = await notion.pages.create({
    parent: { page_id: parentPageId },
    properties: {
      title: {
        title: [{ type: 'text', text: { content: data.title || '结构化笔记' } }]
      }
    },
    children
  });

  const title = data.title || '结构化笔记';
  const reportDate = extractDateFromTitle(title);
  const details = [
    `Notion 写入成功`,
    `标题：${title}`,
    reportDate ? `日期：${reportDate}` : null,
    `页面链接：${response.url}`
  ].filter(Boolean);

  console.log(details.join('\n'));
}

main().catch((err) => {
  console.error('Write structured page failed:', err.body || err.message || err);
  process.exit(1);
});
