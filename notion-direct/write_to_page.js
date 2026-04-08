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

const [,, titleArg, contentArg] = process.argv;
const nowInTaipei = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Taipei' }));
const yyyy = nowInTaipei.getFullYear();
const mm = String(nowInTaipei.getMonth() + 1).padStart(2, '0');
const dd = String(nowInTaipei.getDate()).padStart(2, '0');
const defaultTitle = `${yyyy}-${mm}-${dd} 07:00 财经早报 Top 5`;
const title = titleArg || defaultTitle;
const content = contentArg || `1. 美联储政策路径仍牵动全球市场预期。\n2. 国际油价波动加剧，能源股受关注。\n3. 美股科技股估值与盈利前景持续博弈。\n4. 中国平台与消费板块修复节奏受到关注。\n5. 汇率与全球资金流向继续影响亚洲市场。`;

function chunkText(text, size = 1800) {
  const chunks = [];
  for (let i = 0; i < text.length; i += size) {
    chunks.push(text.slice(i, i + size));
  }
  return chunks;
}

async function main() {
  const paragraphs = chunkText(content).map((chunk) => ({
    object: 'block',
    type: 'paragraph',
    paragraph: {
      rich_text: [
        {
          type: 'text',
          text: {
            content: chunk
          }
        }
      ]
    }
  }));

  const response = await notion.pages.create({
    parent: { page_id: parentPageId },
    properties: {
      title: {
        title: [
          {
            type: 'text',
            text: {
              content: title
            }
          }
        ]
      }
    },
    children: paragraphs
  });

  const reportDateMatch = title.match(/\d{4}-\d{2}-\d{2}/);
  const reportDate = reportDateMatch ? reportDateMatch[0] : '';
  const details = [
    'Notion 写入成功',
    `标题：${title}`,
    reportDate ? `日期：${reportDate}` : null,
    `页面链接：${response.url}`
  ].filter(Boolean);

  console.log(details.join('\n'));
}

main().catch((err) => {
  console.error('Write page failed:', err.body || err.message || err);
  process.exit(1);
});
