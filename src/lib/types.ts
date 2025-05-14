
export interface Friend {
  id: string; // Can be username if that's unique identifier from API context
  username: string;
  realName?: string; // From userPublicProfile
  avatar?: string; // From userPublicProfile (userAvatar)
  ranking?: number; // From userPublicProfile
  solvedToday?: number; // From userProfileCalendar
  totalSolved?: number; // Not directly fetched by planned queries, maybe from userPublicProfile?
  streak?: number; // Not directly fetched, harder to calculate
  lastActive?: string; // Not directly fetched
}

export interface Submission {
  id: string;
  userId?: string; // Made optional
  username: string;
  problemId: string; // Will be titleSlug
  problemTitle: string; // Will be title
  difficulty?: 'Easy' | 'Medium' | 'Hard'; // Made optional
  timestamp: string; // API provides number, will convert
  language?: string; // Made optional
  avatar?: string;
}

export type DifficultyType = 'Easy' | 'Medium' | 'Hard';
