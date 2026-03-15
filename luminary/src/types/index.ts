// src/types/index.ts

export interface Photo {
  id: string;
  user_id: string;
  name: string;            // person's name
  occasion: string;
  description?: string;
  date: string;            // ISO date string
  tags: string[];
  favorite: boolean;
  cloudinary_id: string;   // public_id in Cloudinary
  url: string;             // Cloudinary secure_url
  width: number;
  height: number;
  created_at: string;
}

export type PhotoInsert = Omit<Photo, 'id' | 'created_at'>;

export interface Album {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  cover_photo_id?: string;
  created_at: string;
}

export interface AlbumPhoto {
  album_id: string;
  photo_id: string;
}

export interface UploadPayload {
  file: string;        // base64 data URL
  name: string;
  occasion: string;
  description?: string;
  tags: string[];
  date: string;
}

export interface GrokAnalysisRequest {
  photoUrls: string[];
  prompt?: string;
}

export interface GrokAnalysisResponse {
  result: string;
  model: string;
}

export type Occasion =
  | 'Birthday'
  | 'Wedding'
  | 'Vacation'
  | 'Holiday'
  | 'Graduation'
  | 'Family Gathering'
  | 'Anniversary'
  | 'Portrait'
  | 'Other';

export const OCCASIONS: Occasion[] = [
  'Birthday', 'Wedding', 'Vacation', 'Holiday',
  'Graduation', 'Family Gathering', 'Anniversary', 'Portrait', 'Other',
];
