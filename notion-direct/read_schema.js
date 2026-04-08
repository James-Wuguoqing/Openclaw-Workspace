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

async function main() {
  const db = await notion.databases.retrieve({ database_id: databaseId });
  const out = Object.entries(db.properties).map(([name, value]) => ({
    name,
    type: value.type
  }));
  console.log(JSON.stringify(out, null, 2));
}

main().catch((err) => {
  console.error('Read schema failed:', err.body || err.message || err);
  process.exit(1);
});
