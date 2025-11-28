export interface PostData {
  id: string;
  username: string;
  caption: string;
  likes: number;
  comments: number;
  imageUrl: string;
  musicTrack?: string;
}

export type AppMode = 'SIMULATION' | 'TRACKER';
export type Platform = 'TIKTOK' | 'INSTAGRAM';

export interface ScrollState {
  count: number;
  limit: number;
  lastResetDate: string; // YYYY-MM-DD
  mode: AppMode;
  platform: Platform;
}

export enum ToastType {
  INFO = 'INFO',
  WARNING = 'WARNING',
  DANGER = 'DANGER',
  SUCCESS = 'SUCCESS'
}

export interface ToastMessage {
  id: string;
  message: string;
  type: ToastType;
}