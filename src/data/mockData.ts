
export interface Company {
  id: string;
  name: string;
}

export interface Question {
  id: string;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  topics: string[];
  frequency: number;
  acceptanceRate: number;
  company: string;
  timeframe: string;
}

export const mockCompanies: Company[] = [
  { id: 'google', name: 'Google' },
  { id: 'meta', name: 'Meta' },
  { id: 'amazon', name: 'Amazon' },
  { id: 'microsoft', name: 'Microsoft' },
  { id: 'apple', name: 'Apple' },
  { id: 'netflix', name: 'Netflix' },
  { id: 'uber', name: 'Uber' },
  { id: 'airbnb', name: 'Airbnb' },
  { id: 'linkedin', name: 'LinkedIn' },
  { id: 'twitter', name: 'Twitter' },
  { id: 'salesforce', name: 'Salesforce' },
  { id: 'adobe', name: 'Adobe' },
  { id: 'oracle', name: 'Oracle' },
  { id: 'tesla', name: 'Tesla' },
  { id: 'spotify', name: 'Spotify' },
];

export const timeframes = ['30', '90', '180', 'more_than_180', 'all'];

export const timeframeLabels: Record<string, string> = {
  '30': 'Past 30 days',
  '90': 'Past 3 months',
  '180': 'Past 6 months',
  'more_than_180': 'More than 6 months',
  'all': 'All time'
};

export const difficulties = ['Easy', 'Medium', 'Hard'];

export const allTopics = [
  'Array', 'String', 'Hash Table', 'Dynamic Programming', 'Math', 'Sorting',
  'Greedy', 'Depth-First Search', 'Binary Search', 'Database', 'Breadth-First Search',
  'Tree', 'Matrix', 'Two Pointers', 'Binary Tree', 'Bit Manipulation', 'Heap (Priority Queue)',
  'Stack', 'Graph', 'Prefix Sum', 'Simulation', 'Counting', 'Sliding Window',
  'Union Find', 'Linked List', 'Ordered Set', 'Monotonic Stack', 'Number Theory',
  'Trie', 'Segment Tree', 'Binary Indexed Tree', 'Hash Function', 'Rolling Hash',
  'Shortest Path', 'Game Theory', 'Interactive', 'Data Stream', 'Geometry',
  'Randomized', 'Reservoir Sampling', 'Rejection Sampling', 'Probability and Statistics'
];

export const mockQuestions: Question[] = [
  {
    id: '1',
    title: 'Two Sum',
    difficulty: 'Easy',
    topics: ['Array', 'Hash Table'],
    frequency: 95,
    acceptanceRate: 49.5,
    company: 'google',
    timeframe: '30'
  },
  {
    id: '2',
    title: 'Add Two Numbers',
    difficulty: 'Medium',
    topics: ['Linked List', 'Math', 'Recursion'],
    frequency: 78,
    acceptanceRate: 37.8,
    company: 'meta',
    timeframe: '30'
  },
  {
    id: '3',
    title: 'Longest Substring Without Repeating Characters',
    difficulty: 'Medium',
    topics: ['Hash Table', 'String', 'Sliding Window'],
    frequency: 89,
    acceptanceRate: 33.9,
    company: 'amazon',
    timeframe: '60'
  },
  {
    id: '4',
    title: 'Median of Two Sorted Arrays',
    difficulty: 'Hard',
    topics: ['Array', 'Binary Search', 'Divide and Conquer'],
    frequency: 67,
    acceptanceRate: 36.2,
    company: 'microsoft',
    timeframe: '90'
  },
  {
    id: '5',
    title: 'Longest Palindromic Substring',
    difficulty: 'Medium',
    topics: ['String', 'Dynamic Programming'],
    frequency: 72,
    acceptanceRate: 32.8,
    company: 'apple',
    timeframe: 'all'
  },
  {
    id: '6',
    title: 'ZigZag Conversion',
    difficulty: 'Medium',
    topics: ['String'],
    frequency: 45,
    acceptanceRate: 42.1,
    company: 'netflix',
    timeframe: '30'
  },
  {
    id: '7',
    title: 'Reverse Integer',
    difficulty: 'Medium',
    topics: ['Math'],
    frequency: 58,
    acceptanceRate: 26.8,
    company: 'uber',
    timeframe: '60'
  },
  {
    id: '8',
    title: 'String to Integer (atoi)',
    difficulty: 'Medium',
    topics: ['String'],
    frequency: 52,
    acceptanceRate: 16.4,
    company: 'airbnb',
    timeframe: '90'
  },
  {
    id: '9',
    title: 'Palindrome Number',
    difficulty: 'Easy',
    topics: ['Math'],
    frequency: 64,
    acceptanceRate: 52.3,
    company: 'linkedin',
    timeframe: 'all'
  },
  {
    id: '10',
    title: 'Regular Expression Matching',
    difficulty: 'Hard',
    topics: ['String', 'Dynamic Programming', 'Recursion'],
    frequency: 41,
    acceptanceRate: 27.9,
    company: 'twitter',
    timeframe: '30'
  }
];
