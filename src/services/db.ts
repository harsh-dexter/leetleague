import Dexie, { Table } from 'dexie';
import { Question } from '@/data/mockData';

export interface SolvedQuestion {
  title: string;
}

export interface Note {
  title: string;
  content: string;
}

export class LeetLeagueDB extends Dexie {
  solvedQuestions!: Table<SolvedQuestion>;
  notes!: Table<Note>;
  questions!: Table<Question>;

  constructor() {
    super('leetleague');
    this.version(1).stores({
      solvedQuestions: 'title',
      notes: 'title',
      questions: 'id, company, timeframe',
    });
  }
}

export const db = new LeetLeagueDB();
