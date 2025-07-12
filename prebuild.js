import fs from 'fs';
import path from 'path';

const jsonDir = path.join(process.cwd(), 'src', 'json');
const outputDir = path.join(process.cwd(), 'public', 'data');

const timeframeMap = {
  '1. Thirty Days.json': '30',
  '2. Three Months.json': '90',
  '3. Six Months.json': '180',
  '4. More Than Six Months.json': 'more_than_180',
  '5. All.json': 'all',
};

function prebuild() {
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  const questionsOutputDir = path.join(outputDir, 'questions');
  if (!fs.existsSync(questionsOutputDir)) {
    fs.mkdirSync(questionsOutputDir, { recursive: true });
  }

  const companies = JSON.parse(fs.readFileSync(path.join(jsonDir, 'companies.json'), 'utf-8'));
  const allTopics = new Set();
  
  companies.forEach(company => {
    const companyDir = path.join(jsonDir, company);
    if (!fs.existsSync(companyDir)) {
      return;
    }

    const companyQuestions = [];
    const addedQuestions = new Set();
    const timeFrameFiles = fs.readdirSync(companyDir);

    timeFrameFiles.forEach(file => {
      const timeframe = timeframeMap[file];
      if (!timeframe) {
        return;
      }

      const filePath = path.join(companyDir, file);
      const questions = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

      questions.forEach(q => {
        if (!addedQuestions.has(q.title)) {
          q.topics.forEach(t => allTopics.add(t));
          companyQuestions.push({
            ...q,
            id: `${company}-${q.title}`,
            company,
            timeframe,
          });
          addedQuestions.add(q.title);
        }
      });
    });

    fs.writeFileSync(path.join(questionsOutputDir, `${company}.json`), JSON.stringify(companyQuestions, null, 2));
  });

  fs.writeFileSync(path.join(outputDir, 'companies.json'), JSON.stringify(companies.map(c => ({id: c, name: c})), null, 2));
  fs.writeFileSync(path.join(outputDir, 'topics.json'), JSON.stringify(Array.from(allTopics), null, 2));

  console.log('Pre-build complete. Data files generated in public/data.');
}

prebuild();
