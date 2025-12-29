import { Octokit } from "octokit";

export interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  private: boolean;
  html_url: string;
  default_branch: string;
  language: string | null;
}

export interface GitHubFile {
  name: string;
  path: string;
  type: "file" | "dir";
  content?: string;
  sha: string;
}

export class GitHubService {
  private octokit: Octokit;

  constructor(accessToken: string) {
    this.octokit = new Octokit({
      auth: accessToken,
    });
  }

  /**
   * Get user's repositories
   */
  async getRepositories(): Promise<GitHubRepo[]> {
    const { data } = await this.octokit.rest.repos.listForAuthenticatedUser({
      sort: "updated",
      per_page: 100,
      type: "all",
    });

    return data as GitHubRepo[];
  }

  /**
   * Get repository contents
   */
  async getRepositoryContents(
    owner: string,
    repo: string,
    path: string = ""
  ): Promise<GitHubFile[]> {
    const { data } = await this.octokit.rest.repos.getContent({
      owner,
      repo,
      path,
    });

    if (Array.isArray(data)) {
      return data.map((item) => ({
        name: item.name,
        path: item.path,
        type: item.type as "file" | "dir",
        sha: item.sha,
      }));
    }

    return [];
  }

  /**
   * Get file content
   */
  async getFileContent(
    owner: string,
    repo: string,
    path: string
  ): Promise<string> {
    const { data } = await this.octokit.rest.repos.getContent({
      owner,
      repo,
      path,
    });

    if ("content" in data && data.type === "file") {
      return Buffer.from(data.content, "base64").toString("utf-8");
    }

    throw new Error("Not a file");
  }

  /**
   * Detect Solidity contracts in repository
   */
  async detectContracts(owner: string, repo: string): Promise<string[]> {
    const contracts: string[] = [];

    try {
      // Check common contract directories
      const directories = ["contracts", "src", "contracts/src", "contract/src"];

      for (const dir of directories) {
        try {
          const files = await this.getRepositoryContents(owner, repo, dir);

          for (const file of files) {
            if (file.type === "file" && file.name.endsWith(".sol")) {
              contracts.push(file.path);
            }
          }
        } catch (error) {
          // Directory doesn't exist, continue
          continue;
        }
      }
    } catch (error) {
      console.error("Error detecting contracts:", error);
    }

    return contracts;
  }

  /**
   * Check if repository has Foundry setup
   */
  async hasFoundrySetup(owner: string, repo: string): Promise<boolean> {
    try {
      await this.getFileContent(owner, repo, "foundry.toml");
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get Foundry configuration
   */
  async getFoundryConfig(owner: string, repo: string): Promise<string | null> {
    try {
      return await this.getFileContent(owner, repo, "foundry.toml");
    } catch {
      return null;
    }
  }
}
