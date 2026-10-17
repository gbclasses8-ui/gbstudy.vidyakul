export interface Batch {
  id: string;
  name: string;
  previewImage?: string;
  price?: string;
  expiry_date?: string;
  start_date?: string;
  language?: string;
  by_name?: string;
  slug?: string;
  subjects?: any[];
  subjects_count?: number;
  is_purchased?: boolean;
}

export interface Subject {
  subject_id: string;
  subject_name: string;
  image?: string;
}

export interface Chapter {
  chapter_id: string;
  chapter_name: string;
  videos?: number;
  notes?: number;
  exercises?: number;
}

export interface PDFItem {
  pdf_id: string;
  pdf_title: string;
  pdf_url: string;
  content_id?: string;
  date?: string;
}

export interface Lecture {
  lecture_id: string;
  lecture_title: string;
  image?: string;
  date_time?: string;
  duration?: number;
  has_video?: boolean;
  video_url?: string;
  video_urls?: string[];
  stream_url?: string;
  resolved_video_urls?: string[];
  player_url?: string;
  pdfs?: PDFItem[];
}

export interface SavedBatch {
  id: string;
  name: string;
  previewImage?: string;
  addedAt: number;
}
