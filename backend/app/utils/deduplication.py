from __future__ import annotations

from difflib import SequenceMatcher


def normalize_name(name: str) -> str:
    return " ".join(name.lower().strip().split())


def is_likely_same_person(profile_a: dict, profile_b: dict) -> bool:
    name_a = normalize_name(profile_a.get("full_name", ""))
    name_b = normalize_name(profile_b.get("full_name", ""))
    if name_a and name_b and SequenceMatcher(None, name_a, name_b).ratio() > 0.85:
        return True

    gh_a = (profile_a.get("github_username") or "").lower()
    gh_b = (profile_b.get("github_username") or "").lower()
    if gh_a and gh_b and gh_a == gh_b:
        return True

    return False


def merge_profiles(primary: dict, secondary: dict) -> dict:
    merged = {**primary}
    for key, value in secondary.items():
        if key not in merged or merged[key] is None:
            merged[key] = value
        elif key == "tech_stack" and isinstance(value, list):
            existing = set(merged.get("tech_stack") or [])
            existing.update(value)
            merged["tech_stack"] = list(existing)
        elif key == "profile_data" and isinstance(value, dict):
            merged["profile_data"] = {**value, **(merged.get("profile_data") or {})}
    return merged
