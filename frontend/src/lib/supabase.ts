import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// TypeScript types
export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          github_id: string;
          github_username: string;
          avatar_url: string | null;
          access_token: string | null;
          created_at: string;
        };
        Insert: {
          github_id: string;
          github_username: string;
          avatar_url?: string;
          access_token?: string;
        };
      };
      contracts: {
        Row: {
          id: string;
          user_id: string;
          address: string;
          network: string;
          name: string;
          abi: any;
          source_code: string | null;
          deployed_at: string;
        };
        Insert: {
          user_id: string;
          address: string;
          network: string;
          name: string;
          abi: any;
          source_code?: string;
        };
      };
    };
  };
};
