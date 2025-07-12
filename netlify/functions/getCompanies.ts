import { Handler } from '@netlify/functions';
import fs from 'fs';
import path from 'path';

const handler: Handler = async (event, context) => {
  const filePath = path.resolve(process.cwd(), `data_source/data/companies.json`);

  try {
    const data = fs.readFileSync(filePath, 'utf-8');
    return {
      statusCode: 200,
      body: data,
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Could not fetch companies' }),
    };
  }
};

export { handler };
