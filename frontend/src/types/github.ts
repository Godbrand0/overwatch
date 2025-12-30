export interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  private: boolean;
  html_url: string;
  default_branch: string;
  language: string | null;
  owner: {
    login: string;
    avatar_url: string;
  };
}

export interface GitHubFile {
  name: string;
  path: string;
  type: "file" | "dir";
  content?: string;
  sha: string;
}
