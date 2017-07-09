import { fetchRepository } from "./github";
import { fs } from "mz";
import { AxiosError } from "axios";

async function main() {
  const content = (await fs.readFile(
    __dirname + "/../data/middleware-network-request.md"
  )).toString();
  const repositories = extractGithubRepositories(content);
  const repositoriesInfo = await Promise.all(repositories.map(getRepository));
  repositoriesInfo.sort((a, b) => {
    if (a instanceof Error) return 1;
    if (b instanceof Error) return -1;
    return b.stargazers_count - a.stargazers_count;
  });

  for (const r of repositoriesInfo) {
    if (r instanceof Error) {
      if (r.response) {
        console.log(
          `https://github.com/${r.repoInfo.owner}/${r.repoInfo
            .repo} - ${r.response!.data.message}`
        );
      } else {
        console.log(r.message);
      }
    } else {
      console.log(
        `https://github.com/${r.owner.login}/${r.name} - ${r.stargazers_count}`
      );
    }
  }
}

async function getRepository(repoInfo: GithubRepositoryInfo) {
  try {
    return await fetchRepository(repoInfo.owner, repoInfo.repo);
  } catch (e) {
    const err: AxiosError & { repoInfo: GithubRepositoryInfo } = e;
    err.repoInfo = repoInfo;
    return err;
  }
}

type GithubRepositoryInfo = { owner: string; repo: string };
function extractGithubRepositories(content: string): GithubRepositoryInfo[] {
  const result: GithubRepositoryInfo[] = [];
  const regexp = /https?:\/\/github.com\/([\w-_]+)\/([\w-_]+)/g;
  let match = regexp.exec(content);
  while (match !== null) {
    const [url, owner, repo] = match;
    result.push({ owner, repo });
    match = regexp.exec(content);
  }
  return result;
}

main().catch(e => {
  console.error(e);
});
