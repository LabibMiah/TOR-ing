export type User = {
  user_id: string;
  email: string;
  tier: string;
  forename: string | null;
  account_type: string | null;
  created_at: string;
};

export type Account = {
  user_id: string;
  account: string;
  tier: string;
  forename: string | null;
  account_type: string | null;
  created_at: string;
};

export type AuthUser = {
  id: string;
  email: string;
  created_at: string;
  raw_user_meta_data?: Record<string, any>;
};