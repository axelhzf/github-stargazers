import axios from "axios";
import GithubRepository from "./GithubRepository";

export async function fetchRepository(owner: string, repo: string) {
  const req = await axios(`https://api.github.com/repos/${owner}/${repo}`, {
    headers: {
      Authorization: `token ${getToken()}`
    }
  });
  return req.data as GithubRepository;
}

function getToken() {
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    throw new Error("GITHUB_TOKEN environment variable not defined");
  }
  return token;
}
