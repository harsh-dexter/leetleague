import { Handler } from '@netlify/functions';
import fs from 'fs';
import path from 'path';

const handler: Handler = async (event, context) => {
  const company = event.queryStringParameters?.company;

  if (!company) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Company parameter is required' }),
    };
  }

  const filePath = path.resolve(process.cwd(), `data_source/data/questions/${company}.json`);

  try {
    const data = fs.readFileSync(filePath, 'utf-8');
    return {
      statusCode: 200,
      body: data,
    };
  } catch (error) {
    return {
      statusCode: 404,
      body: JSON.stringify({ error: 'Questions not found for the specified company' }),
    };
  }
};

export { handler };
