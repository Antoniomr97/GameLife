export interface Comment {
  id: number;
  user_id: number;
  review_id: number;
  content: string;
  created_at: string;
  author_username: string;
  author_avatar: string | null;
}
