export type User = {
  id: number;
  name: string;
  username: string | null;
  email: string;
  role: string;
  bio: string | null;
  location: string | null;
  memberSince: string | null;
};

export type Announcement = { id: number; title?: string; body?: string } | null;

export type DashboardEvent = { id: number; title: string; when: string };
export type ContinueLearning = { id: number; title: string; progress: number };
export type Dashboard = {
  firstName: string;
  continueLearning: ContinueLearning[];
  stats: { modulesCompleted: number; modulesTotal: number };
  events: DashboardEvent[];
  announcement: Announcement;
};

export type VocabularyWord = {
  id: number;
  word: string;
  meaning: string;
  pronunciation: string | null;
  category: string | null;
  example: string | null;
  audio: string | null;
  speaker: string | null;
};

export type TranslationMatch = {
  id: number;
  word: string;
  meaning: string;
  pronunciation: string | null;
  audio: string | null;
  speaker: string | null;
};

export type TranslationResult = {
  source: 'en' | 'tl';
  sourceLabel: string;
  target: string;
  targetLabel: string;
  input: string;
  translation: string;
  matches: TranslationMatch[];
};

export type Story = {
  id: number;
  title: string;
  type: string | null;
  author: string | null;
  date: string | null;
  views: number | null;
  readTime: string | null;
  summary: string | null;
  categories: string[];
  image: string | null;
};

export type MediaItem = {
  id: number;
  title: string;
  category: string | null;
  type: string | null;
  date: string | null;
  views: number | null;
  duration: string | null;
  thumbnail: string | null;
};

export type EventItem = {
  id: number;
  title: string;
  weekday: string;
  date: string;
  time: string;
  month: string;
  day: string;
  location: string | null;
};

export type RepositoryItem = {
  id: number;
  title: string;
  category: string | null;
  type: string | null;
  description: string | null;
  media: string | null;
  date: string;
};

export type ModuleSummary = {
  id: number;
  title: string;
  description: string | null;
  module: string;
  difficulty: string;
  image: string | null;
  questions: number;
  progress: number;
  status: string;
};
export type ModuleStats = { total: number; completed: number; inProgress: number };

export type Question = { id: number; question: string; options: string[] };
export type ModuleDetail = {
  module: {
    id: number;
    title: string;
    description: string | null;
    module: string;
    difficulty: string;
    content: string | null;
    progress: number;
    status: string;
  };
  questions: Question[];
  result: { score: number; total: number; remarks: string; takenAt: string } | null;
};
export type QuizResult = { score: number; total: number; passed: boolean; remarks: string };

export type ProgressRow = {
  id: number;
  title: string;
  module: string;
  difficulty: string;
  progress: number;
  status: string;
  score: string | null;
  completedAt: string | null;
};
export type ProgressStats = {
  completed: number;
  inProgress: number;
  total: number;
  quizzesTaken: number;
};

export type Contribution = {
  id: number;
  item: string;
  description: string | null;
  type: string;
  status: string;
  submittedAt: string;
};
export type Feedback = {
  id: number;
  subject: string;
  body: string;
  rating: number | null;
  status: string;
  submittedAt: string;
};

export type ChatAttachment = {
  id: number;
  name: string;
  kind: 'image' | 'document';
  mime: string | null;
  size: number;
  url: string;
  readable: boolean;
  // Local device URI for instant preview of a just-picked image (not from server).
  localUri?: string;
};

export type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
  attachments?: ChatAttachment[];
};
export type ChatResponse = {
  reply: string;
  conversation_id: number;
  conversation_title: string;
};
export type Conversation = { id: number; title: string; updated_at: string | null };
