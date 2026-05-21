from __future__ import annotations

import httpx

from app.core.config import settings


class EnrichmentService:
    """Enriches candidate profiles via Proxycurl or People Data Labs.

    Falls back gracefully when API keys are not configured.
    """

    async def enrich_profile(self, candidate: dict) -> dict:
        if settings.PROXYCURL_API_KEY:
            return await self._enrich_via_proxycurl(candidate)
        return candidate

    async def _enrich_via_proxycurl(self, candidate: dict) -> dict:
        github_url = candidate.get("github_url")
        if not github_url:
            return candidate

        try:
            async with httpx.AsyncClient(timeout=15.0) as client:
                resp = await client.get(
                    "https://nubela.co/proxycurl/api/v2/linkedin/from/github",
                    params={"github_profile_url": github_url},
                    headers={"Authorization": f"Bearer {settings.PROXYCURL_API_KEY}"},
                )
                if resp.status_code != 200:
                    return candidate

                data = resp.json()
                linkedin_url = data.get("url")
                if not linkedin_url:
                    return candidate

                profile_resp = await client.get(
                    "https://nubela.co/proxycurl/api/v2/linkedin",
                    params={"url": linkedin_url},
                    headers={"Authorization": f"Bearer {settings.PROXYCURL_API_KEY}"},
                )
                if profile_resp.status_code != 200:
                    return candidate

                profile = profile_resp.json()
                candidate["current_role"] = profile.get("headline")
                candidate["current_company"] = (
                    profile.get("experiences", [{}])[0].get("company")
                    if profile.get("experiences")
                    else candidate.get("current_company")
                )

                experiences = profile.get("experiences", [])
                if experiences:
                    candidate["years_experience"] = len(experiences)

                if not candidate.get("location"):
                    candidate["location"] = profile.get("city")

                candidate["profile_data"] = {
                    **candidate.get("profile_data", {}),
                    "linkedin_url": linkedin_url,
                    "summary": profile.get("summary"),
                    "education": profile.get("education", []),
                }
        except Exception:
            pass

        return candidate


enrichment_service = EnrichmentService()
