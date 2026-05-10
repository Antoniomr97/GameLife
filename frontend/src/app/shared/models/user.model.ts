export interface User {
  id: number;
  username: string;
  email: string;
  avatar_url: string | null;
  bio: string | null;
  is_admin?: boolean;
  created_at: string;
}

export interface UserProfile extends User {
  followers_count: number;
  following_count: number;
  reviews_count: number;
  is_following: boolean;
  is_admin?: boolean;
}
