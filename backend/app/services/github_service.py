from __future__ import annotations

from datetime import datetime, timedelta, timezone

import httpx

from app.core.config import settings

GITHUB_API = "https://api.github.com"


class GitHubService:
    def __init__(self):
        self._client: httpx.AsyncClient | None = None

    @property
    def headers(self) -> dict:
        h = {"Accept": "application/vnd.github.v3+json"}
        if settings.GITHUB_TOKEN:
            h["Authorization"] = f"token {settings.GITHUB_TOKEN}"
        return h

    async def client(self) -> httpx.AsyncClient:
        if self._client is None or self._client.is_closed:
            self._client = httpx.AsyncClient(headers=self.headers, timeout=30.0)
        return self._client

    async def search_users(
        self,
        technologies: list[str],
        location: str | None = None,
        max_results: int = 50,
    ) -> list[dict]:
        q_parts = []
        if technologies:
            lang = technologies[0]
            q_parts.append(f"language:{lang.lower()}")
        if location:
            q_parts.append(f"location:{location.lower()}")
        q_parts.append("type:user")
        q = " ".join(q_parts)

        c = await self.client()
        users = []
        page = 1
        per_page = min(max_results, 30)

        while len(users) < max_results:
            resp = await c.get(
                f"{GITHUB_API}/search/users",
                params={"q": q, "per_page": per_page, "page": page, "sort": "repositories"},
            )
            if resp.status_code != 200:
                break
            data = resp.json()
            items = data.get("items", [])
            if not items:
                break
            users.extend(items)
            page += 1
            if len(items) < per_page:
                break

        return users[:max_results]

    async def get_user_profile(self, username: str) -> dict | None:
        c = await self.client()
        resp = await c.get(f"{GITHUB_API}/users/{username}")
        if resp.status_code != 200:
            return None
        return resp.json()

    async def get_user_repos(self, username: str, max_repos: int = 10) -> list[dict]:
        c = await self.client()
        resp = await c.get(
            f"{GITHUB_API}/users/{username}/repos",
            params={"sort": "updated", "per_page": max_repos, "type": "owner"},
        )
        if resp.status_code != 200:
            return []
        return resp.json()

    async def get_user_languages(self, username: str) -> list[str]:
        repos = await self.get_user_repos(username, max_repos=10)
        languages = set()
        for repo in repos:
            if repo.get("language"):
                languages.add(repo["language"])
        return list(languages)

    async def get_contribution_count(self, username: str) -> int:
        c = await self.client()
        resp = await c.get(
            f"{GITHUB_API}/search/commits",
            params={"q": f"author:{username}", "per_page": 1},
            headers={**self.headers, "Accept": "application/vnd.github.cloak-preview+json"},
        )
        if resp.status_code != 200:
            return 0
        return resp.json().get("total_count", 0)

    async def build_candidate_from_github(self, user_data: dict) -> dict:
        username = user_data.get("login", "")
        profile = await self.get_user_profile(username)
        if not profile:
            return {}

        repos = await self.get_user_repos(username)
        languages = set()
        repo_descriptions = []
        for repo in repos:
            if repo.get("language"):
                languages.add(repo["language"])
            if repo.get("description"):
                repo_descriptions.append(repo["description"])

        cutoff = datetime.now(timezone.utc) - timedelta(days=365)
        recent_repos = [
            r for r in repos
            if r.get("pushed_at") and datetime.fromisoformat(r["pushed_at"].replace("Z", "+00:00")) > cutoff
        ]

        return {
            "github_username": username,
            "github_url": profile.get("html_url"),
            "full_name": profile.get("name") or username,
            "location": profile.get("location"),
            "bio": profile.get("bio"),
            "current_company": profile.get("company"),
            "tech_stack": list(languages),
            "github_repos": profile.get("public_repos", 0),
            "github_commits_last_year": len(recent_repos) * 10,
            "repo_descriptions": repo_descriptions[:5],
            "profile_data": {
                "avatar_url": profile.get("avatar_url"),
                "followers": profile.get("followers", 0),
                "following": profile.get("following", 0),
                "created_at": profile.get("created_at"),
                "blog": profile.get("blog"),
                "twitter_username": profile.get("twitter_username"),
                "hireable": profile.get("hireable"),
            },
        }

    async def close(self):
        if self._client and not self._client.is_closed:
            await self._client.aclose()


github_service = GitHubService()
