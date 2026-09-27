import "server-only";
import { profile } from "@/content/profile";

export type Repo = {
  name: string;
  description: string | null;
  url: string;
  homepage: string | null;
  language: string | null;
  stars: number;
  forks: number;
  topics: string[];
  updatedAt: string;
  fork: boolean;
};

export type GitHubUser = {
  login: string;
  avatarUrl: string;
  publicRepos: number;
  followers: number;
};

const headers = (): HeadersInit => ({
  Accept: "application/vnd.github+json",
  ...(process.env.GITHUB_TOKEN ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` } : {}),
});

type RawRepo = {
  name: string;
  description: string | null;
  html_url: string;
  homepage: string | null;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  topics?: string[];
  pushed_at: string;
  fork: boolean;
  archived: boolean;
};

/** Repos públicos del usuario. Se cachea 1 hora. */
export async function getRepos(): Promise<Repo[] | null> {
  try {
    const res = await fetch(
      `https://api.github.com/users/${profile.github}/repos?per_page=100&sort=pushed`,
      { headers: headers(), next: { revalidate: 3600 } },
    );
    if (!res.ok) return null;
    const data = (await res.json()) as RawRepo[];
    return data
      .filter((r) => !r.archived && r.name.toLowerCase() !== profile.github.toLowerCase())
      .map((r) => ({
        name: r.name,
        description: r.description,
        url: r.html_url,
        homepage: r.homepage || null,
        language: r.language,
        stars: r.stargazers_count,
        forks: r.forks_count,
        topics: r.topics ?? [],
        updatedAt: r.pushed_at,
        fork: r.fork,
      }));
  } catch {
    return null;
  }
}

/** Repos a mostrar en la web: primero los destacados, después los más recientes. */
export async function getShowcaseRepos(limit = 6) {
  const repos = await getRepos();
  if (!repos) return null;
  // Los destacados pueden incluir forks (ej: proyectos grupales); el resto, solo repos propios
  const featured = profile.featuredRepos
    .map((n) => repos.find((r) => r.name.toLowerCase() === n.toLowerCase()))
    .filter((r): r is Repo => Boolean(r));
  const rest = repos.filter((r) => !r.fork && !featured.includes(r));
  return [...featured, ...rest].slice(0, limit);
}

export async function getGitHubUser(): Promise<GitHubUser | null> {
  try {
    const res = await fetch(`https://api.github.com/users/${profile.github}`, {
      headers: headers(),
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    const u = await res.json();
    return { login: u.login, avatarUrl: u.avatar_url, publicRepos: u.public_repos, followers: u.followers };
  } catch {
    return null;
  }
}
