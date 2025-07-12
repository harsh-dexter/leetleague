import { useQuery } from '@tanstack/react-query';
import { fetchCompanies, fetchTopics, fetchQuestionsByCompany } from '@/services/dataLoader';

export const useCompanies = () => {
  return useQuery({
    queryKey: ['companies'],
    queryFn: fetchCompanies,
  });
};

export const useTopics = () => {
  return useQuery({
    queryKey: ['topics'],
    queryFn: fetchTopics,
  });
};

export const useQuestions = (company: string) => {
  return useQuery({
    queryKey: ['questions', company],
    queryFn: () => fetchQuestionsByCompany(company),
    enabled: !!company,
  });
};
