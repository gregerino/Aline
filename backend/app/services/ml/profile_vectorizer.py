from __future__ import annotations

def build_profile_text(candidate: dict) -> str:
    parts = []

    if candidate.get("full_name"):
        parts.append(candidate["full_name"])

    if candidate.get("current_role"):
        role = candidate["current_role"]
        if candidate.get("current_company"):
            role += f" at {candidate['current_company']}"
        parts.append(role)

    if candidate.get("bio"):
        parts.append(candidate["bio"])

    if candidate.get("tech_stack"):
        techs = candidate["tech_stack"]
        if isinstance(techs, list):
            parts.append("Technologies: " + ", ".join(techs))

    if candidate.get("location"):
        parts.append(f"Location: {candidate['location']}")

    if candidate.get("years_experience"):
        parts.append(f"{candidate['years_experience']} years of experience")

    repo_descriptions = candidate.get("repo_descriptions", [])
    if repo_descriptions:
        parts.append("Projects: " + "; ".join(repo_descriptions[:5]))

    return " | ".join(parts)
