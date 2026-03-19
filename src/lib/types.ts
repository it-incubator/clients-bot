export type DialogStatus = 'new' | 'in_progress' | 'waiting_customer' | 'resolved' | 'closed';
export type Priority = 'low' | 'medium' | 'high';
export type Sentiment = 'positive' | 'neutral' | 'negative';
export type SenderType = 'user' | 'manager' | 'bot';

export interface User {
  id: string;
  telegram_id: number;
  name: string;
  created_at: string;
}

export interface Dialog {
  id: string;
  user_id: string;
  status: DialogStatus;
  priority: Priority | null;
  assigned_manager_id: string | null;
  bot_active: boolean;
  summary: string | null;
  topic: string | null;
  sentiment: Sentiment | null;
  created_at: string;
  updated_at: string;
  // Joined fields
  user?: User;
  last_message?: Message;
  assigned_manager_email?: string | null;
}

export interface Message {
  id: string;
  dialog_id: string;
  sender_type: SenderType;
  sender_id: string | null;
  text: string | null;
  voice_url: string | null;
  created_at: string;
}

export interface KBArticle {
  id: string;
  title: string;
  content: string;
  embedding: number[] | null;
  created_at: string;
  updated_at: string;
}
