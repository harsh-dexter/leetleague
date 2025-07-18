import { Company, Question } from '@/data/mockData';
import { db } from './db';

export const fetchCompanies = async (): Promise<Company[]> => {
  const response = await fetch('/.netlify/functions/getCompanies');
  const companies = await response.json();
  return companies;
};

export const fetchTopics = async (): Promise<string[]> => {
  const response = await fetch('/.netlify/functions/getTopics');
  return response.json();
};

export const fetchQuestionsByCompany = async (company: string): Promise<Question[]> => {
  if (company !== 'all') {
    const cachedQuestions = await db.questions.where('company').equals(company).toArray();
    if (cachedQuestions.length > 0) {
      return cachedQuestions;
    }
  }

  const response = await fetch(`/.netlify/functions/getCompanyQuestions?company=${company}`);
  const questions = await response.json();
  
  if (company === 'all') {
    const questionsWithCompany = questions.map(q => ({
      ...q,
      company: q.companyId,
    }));
    await db.questions.bulkPut(questionsWithCompany);
    return questionsWithCompany;
  }

  await db.questions.bulkPut(questions.map(q => ({ ...q, company })));
  return questions;
};
