export interface Game {
  id: number;
  title: string;
  description: string | null;
  genre: string | null;
  platform: string | null;
  cover_url: string | null;
  release_year: number | null;
  created_at: string;
  avg_rating: number | null;
  reviews_count: number;
}

export interface GameList {
  games: Game[];
  total: number;
  page: number;
  pages: number;
}
