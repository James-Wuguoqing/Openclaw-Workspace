import { Client } from '@notionhq/client';

const token = process.env.NOTION_TOKEN;
const databaseId = process.env.NOTION_DATABASE_ID;

if (!token) {
  console.error('Missing NOTION_TOKEN');
  process.exit(1);
}

if (!databaseId) {
  console.error('Missing NOTION_DATABASE_ID');
  process.exit(1);
}

const notion = new Client({ auth: token });

const [,, titleArg, contentArg] = process.argv;
const title = titleArg || '腾讯公司分析';
const content = contentArg || `腾讯公司分析\n\n- 公司定位：腾讯是中国领先的互联网平台公司，核心业务覆盖社交、游戏、广告、金融科技与企业服务。\n- 核心护城河：微信/WeChat 生态、强用户粘性、内容分发与游戏研发发行能力。\n- 主要收入来源：增值服务、营销服务、金融科技与企业服务。\n- 优势：流量入口强、生态协同明显、现金流稳健。\n- 风险：监管变化、游戏业务波动、广告周期、宏观环境影响。\n- 结论：腾讯属于高质量平台型公司，长期竞争力强，但增长节奏会受政策和周期扰动。`;

const today = new Date().toISOString();

async function main() {
  const response = await notion.pages.create({
    parent: { database_id: databaseId },
    properties: {
      Name: {
        title: [
          {
            text: {
              content: title
            }
          }
        ]
      },
      Content: {
        rich_text: [
          {
            text: {
              content: content.slice(0, 1900)
            }
          }
        ]
      },
      'Created At': {
        date: {
          start: today
        }
      },
      Source: {
        rich_text: [
          {
            text: {
              content: 'OpenClaw'
            }
          }
        ]
      }
    }
  });

  console.log('Created page:', response.url);
}

main().catch((err) => {
  console.error('Write failed:', err.body || err.message || err);
  process.exit(1);
});
