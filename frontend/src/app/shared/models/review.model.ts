export interface Review {
  id: number;
  user_id: number;
  game_id: number;
  rating: number;
  content: string;
  created_at: string;
  updated_at: string | null;
}

export interface ReviewWithDetails extends Review {
  author_username: string;
  author_avatar: string | null;
  game_title: string;
  game_cover: string | null;
  comments_count: number;
}

export interface FeedResponse {
  reviews: ReviewWithDetails[];
  total: number;
  page: number;
  has_more: boolean;
}
