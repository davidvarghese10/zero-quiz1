export interface Team {
  id: string;
  name: string;
  members: string[];
  score: number; // Starts at 1000
  history: ScoreHistoryEntry[];
}

export interface ScoreHistoryEntry {
  id: string;
  timestamp: string;
  action: 'correct' | 'incorrect' | 'override_add' | 'override_subtract' | 'pass_correct' | 'pass_incorrect' | 'reset';
  points: number;
  newScore: number;
  description: string;
}

export type QuizCategory = 'Tech' | 'Sports' | 'Rajagiri' | 'Entertainment';
export type QuizPoints = 20 | 40 | 60 | 80;

export interface Question {
  id: string;
  category: QuizCategory;
  points: QuizPoints;
  questionText: string;
  answerText: string;
  isCompleted: boolean;
  solvedByTeamId: string | null; // ID of team, or 'passed-unsolved' or null
}

export interface GameState {
  teams: Team[];
  activeTeamIndex: number;
  questions: Question[];
  currentQuestionId: string | null;
  quizStarted: boolean;
  viewMode: 'host' | 'projector'; // host has controls, projector is high-visibility and sterile
}
