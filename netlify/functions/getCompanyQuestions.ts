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

  if (company === 'all') {
    const questionsDir = path.resolve(__dirname, '../../data_source/data/questions');
    try {
      const files = fs.readdirSync(questionsDir);
      const allQuestions = files.flatMap(file => {
        if (file.endsWith('.json')) {
          const companyId = path.basename(file, '.json');
          const filePath = path.join(questionsDir, file);
          const data = fs.readFileSync(filePath, 'utf-8');
          const questions = JSON.parse(data);
          return questions.map(q => ({ ...q, companyId, acceptanceRate: parseFloat(q.acceptanceRate) }));
        }
        return [];
      });
      return {
        statusCode: 200,
        body: JSON.stringify(allQuestions),
      };
    } catch (error) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Could not fetch all questions' }),
      };
    }
  } else {
    const filePath = path.resolve(__dirname, `../../data_source/data/questions/${company}.json`);

    try {
      const data = fs.readFileSync(filePath, 'utf-8');
      const questions = JSON.parse(data);
      const questionsWithParsedRate = questions.map(q => ({...q, acceptanceRate: parseFloat(q.acceptanceRate)}));
      return {
        statusCode: 200,
        body: JSON.stringify(questionsWithParsedRate),
      };
    } catch (error) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: 'Questions not found for the specified company' }),
      };
    }
  }
};

export { handler };
