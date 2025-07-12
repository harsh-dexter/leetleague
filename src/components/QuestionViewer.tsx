import React, { useState, useMemo } from 'react';
import { Search, Filter, Calendar, TrendingUp, Percent, Moon, Sun, Save } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { timeframes, timeframeLabels, difficulties } from '@/data/mockData';
import CompanySearch from './CompanySearch';
import TopicSelector from './TopicSelector';
import { useCompanies, useTopics, useQuestions } from '@/hooks/useQuestions';
import { Skeleton } from './ui/skeleton';
import { SimplePagination } from './ui/pagination';
import CircularProgressBar from './ui/CircularProgressBar';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/services/db';

const PAGE_SIZE = 20;

const QuestionViewer = () => {
  const { data: companies } = useCompanies();
  const { data: allTopics } = useTopics();
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCompany, setSelectedCompany] = useState<string>('all');
  const [selectedTimeframe, setSelectedTimeframe] = useState<string>('all');
  const { data: questions, isLoading, error } = useQuestions(selectedCompany);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'frequency' | 'acceptanceRate'>('frequency');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentNote, setCurrentNote] = useState('');
  const [selectedQuestionTitle, setSelectedQuestionTitle] = useState('');

  const solvedQuestions = useLiveQuery(() => db.solvedQuestions.toCollection().keys(), []);
  const notes = useLiveQuery(() => db.notes.toCollection().toArray(), []);

  const notesMap = useMemo(() => {
    return notes?.reduce((acc, note) => {
      acc[note.title] = note.content;
      return acc;
    }, {} as Record<string, string>) || {};
  }, [notes]);

  const solvedQuestionsSet = useMemo(() => new Set(solvedQuestions || []), [solvedQuestions]);

  // Toggle solved status for a question
  const toggleSolved = async (questionTitle: string) => {
    if (solvedQuestionsSet.has(questionTitle)) {
      await db.solvedQuestions.delete(questionTitle);
    } else {
      await db.solvedQuestions.add({ title: questionTitle });
    }
  };

  const handleSaveNote = async () => {
    await db.notes.put({ title: selectedQuestionTitle, content: currentNote });
    toast("Note saved!");
  };

  const filteredQuestions = useMemo(() => {
    if (!questions) return [];

    let filtered = questions.filter(question => {
      const matchesTimeframe = selectedTimeframe === 'all' || question.timeframe === selectedTimeframe;
      const matchesSearch = !searchQuery ||
        question.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        question.topics.some(topic => topic.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesDifficulty = selectedDifficulty === 'all' || question.difficulty.toLowerCase() === selectedDifficulty.toLowerCase();
      const matchesTopics = selectedTopics.length === 0 ||
        selectedTopics.every(topic => question.topics.includes(topic));

      return matchesTimeframe && matchesSearch && matchesDifficulty && matchesTopics;
    });

    // Sort questions
    filtered.sort((a, b) => {
      const aValue = a[sortBy];
      const bValue = b[sortBy];
      const multiplier = sortOrder === 'desc' ? -1 : 1;
      if (aValue > bValue) return 1 * multiplier;
      if (aValue < bValue) return -1 * multiplier;
      return 0;
    });

    return filtered;
  }, [questions, selectedTimeframe, searchQuery, selectedDifficulty, selectedTopics, sortBy, sortOrder]);

  const difficultyCounts = useMemo(() => {
    const counts = { Easy: 0, Medium: 0, Hard: 0 };
    filteredQuestions.forEach(q => {
      counts[q.difficulty]++;
    });
    return counts;
  }, [filteredQuestions]);

  const solvedDifficultyCounts = useMemo(() => {
    const counts = { Easy: 0, Medium: 0, Hard: 0 };
    filteredQuestions.forEach(q => {
      if (solvedQuestionsSet.has(q.title)) {
        counts[q.difficulty]++;
      }
    });
    return counts;
  }, [filteredQuestions, solvedQuestionsSet]);

  const totalPages = useMemo(() => {
    return Math.ceil(filteredQuestions.length / PAGE_SIZE);
  }, [filteredQuestions]);

  const paginatedQuestions = useMemo(() => {
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    const endIndex = startIndex + PAGE_SIZE;
    return filteredQuestions.slice(startIndex, endIndex);
  }, [filteredQuestions, currentPage]);

  const handlePageChange = (page: number) => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy':
        return 'bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900 dark:text-green-100';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200 dark:bg-yellow-900 dark:text-yellow-100';
      case 'Hard':
        return 'bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900 dark:text-red-100';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-100';
    }
  };

  const toggleTopic = (topic: string) => {
    setSelectedTopics(prev =>
      prev.includes(topic)
        ? prev.filter(t => t !== topic)
        : [...prev, topic]
    );
  };

  return (
    <div className="space-y-6">
        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <CompanySearch
                selectedCompany={selectedCompany}
                onCompanyChange={setSelectedCompany}
                companies={companies || []}
              />

              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Timeframe
                </label>
                <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {timeframes.map(timeframe => (
                      <SelectItem key={timeframe} value={timeframe}>
                        {timeframeLabels[timeframe]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Difficulty</label>
                <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                  <SelectTrigger>
                    <SelectValue placeholder="All difficulties" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Difficulties</SelectItem>
                    {difficulties.map(difficulty => (
                      <SelectItem key={difficulty} value={difficulty}>
                        {difficulty}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Sort By
                </label>
                <Select value={`${sortBy}-${sortOrder}`} onValueChange={(value) => {
                  const [field, order] = value.split('-');
                  setSortBy(field as 'frequency' | 'acceptanceRate');
                  setSortOrder(order as 'asc' | 'desc');
                }}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="frequency-desc">Frequency (High to Low)</SelectItem>
                    <SelectItem value="frequency-asc">Frequency (Low to High)</SelectItem>
                    <SelectItem value="acceptanceRate-desc">Acceptance Rate (High to Low)</SelectItem>
                    <SelectItem value="acceptanceRate-asc">Acceptance Rate (Low to High)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Search className="h-4 w-4" />
                Search
              </label>
              <Input
                placeholder="Search by title or topics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="max-w-md"
              />
            </div>

            <TopicSelector
              selectedTopics={selectedTopics}
              onTopicToggle={toggleTopic}
              allTopics={allTopics || []}
            />
          </CardContent>
        </Card>

        {/* Results */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Questions ({filteredQuestions.length})</span>
              <div className="flex items-center justify-center gap-4">
                <div className="flex items-center gap-2">
                  <CircularProgressBar percentage={difficultyCounts.Easy > 0 ? (solvedDifficultyCounts.Easy / difficultyCounts.Easy) * 100 : 0} color="text-green-500" />
                  <span className="text-sm font-medium">{solvedDifficultyCounts.Easy}/{difficultyCounts.Easy} Easy</span>
                </div>
                <div className="flex items-center gap-2">
                  <CircularProgressBar percentage={difficultyCounts.Medium > 0 ? (solvedDifficultyCounts.Medium / difficultyCounts.Medium) * 100 : 0} color="text-yellow-500" />
                  <span className="text-sm font-medium">{solvedDifficultyCounts.Medium}/{difficultyCounts.Medium} Medium</span>
                </div>
                <div className="flex items-center gap-2">
                  <CircularProgressBar percentage={difficultyCounts.Hard > 0 ? (solvedDifficultyCounts.Hard / difficultyCounts.Hard) * 100 : 0} color="text-red-500" />
                  <span className="text-sm font-medium">{solvedDifficultyCounts.Hard}/{difficultyCounts.Hard} Hard</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {selectedTimeframe && (
                  <Badge variant="outline">
                    {timeframeLabels[selectedTimeframe]}
                  </Badge>
                )}
                {selectedCompany && selectedCompany !== 'all' && (
                  <Badge variant="secondary">
                    {companies?.find(c => c.id === selectedCompany)?.name}
                  </Badge>
                )}
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <SimplePagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
            <div className="overflow-x-auto mt-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">Solved</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Difficulty</TableHead>
                    <TableHead>Topics</TableHead>
                    <TableHead>
                      <div className="flex items-center gap-1">
                        <TrendingUp className="h-4 w-4" />
                        Frequency
                      </div>
                    </TableHead>
                    <TableHead>
                      <div className="flex items-center gap-1">
                        <Percent className="h-4 w-4" />
                        Acceptance
                      </div>
                    </TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    Array.from({ length: 10 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell><Skeleton className="h-4 w-4" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                        <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                        <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                      </TableRow>
                    ))
                  ) : error ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-destructive">
                        Error loading questions.
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedQuestions.map(question => (
                      <TableRow key={question.id} className={`hover:bg-muted/50 ${solvedQuestionsSet.has(question.title) ? 'opacity-60' : ''}`}>
                        <TableCell>
                          <Checkbox
                            checked={solvedQuestionsSet.has(question.title)}
                            onCheckedChange={() => toggleSolved(question.title)}
                          />
                        </TableCell>
                        <TableCell className={`font-medium ${solvedQuestionsSet.has(question.title) ? 'line-through text-muted-foreground' : ''}`}>
                          <a
                            href={`https://leetcode.com/problems/${question.title.toLowerCase().replace(/ /g, '-')}/`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:underline"
                          >
                            {question.title}
                          </a>
                        </TableCell>
                        <TableCell>
                          <Badge className={getDifficultyColor(question.difficulty)}>
                            {question.difficulty}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {question.topics.map(topic => (
                              <Badge key={topic} variant="outline" className="text-xs">
                                {topic}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <div className="w-12 bg-muted rounded-full h-2">
                              <div
                                className="bg-primary h-2 rounded-full"
                                style={{ width: `${question.frequency}%` }}
                              />
                            </div>
                            <span className="text-sm">{question.frequency}%</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">{(question.acceptanceRate * 100).toFixed(2)}%</span>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            {companies?.find(c => c.id === question.company)?.name}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="ghost" size="icon" onClick={() => {
                                setSelectedQuestionTitle(question.title);
                                setCurrentNote(notesMap[question.title] || '');
                              }}>
                                <Save className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Note for {selectedQuestionTitle}</DialogTitle>
                              </DialogHeader>
                              <Textarea
                                value={currentNote}
                                onChange={(e) => setCurrentNote(e.target.value)}
                                placeholder="Type your note here."
                              />
                              <Button onClick={handleSaveNote}>Save Note</Button>
                            </DialogContent>
                          </Dialog>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {filteredQuestions.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No questions found matching your criteria.
              </div>
            )}
            <div className="mt-4">
              <SimplePagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          </CardContent>
        </Card>
    </div>
  );
};

export default QuestionViewer;
