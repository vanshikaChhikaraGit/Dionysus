export function cleanGithubUrl(input: string): string | null {
    const match = input.match(/https:\/\/github\.com\/([\w.-]+)\/([\w.-]+)/);
    if (!match) return null;
    const [, user, repo] = match;
    return `https://github.com/${user}/${repo}`;
  }