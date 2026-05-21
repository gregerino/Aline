from __future__ import annotations

import re

TECH_KEYWORDS = {
    "python", "javascript", "typescript", "react", "vue", "angular", "node",
    "nodejs", "java", "kotlin", "swift", "go", "golang", "rust", "c++", "cpp",
    "c#", "csharp", ".net", "dotnet", "ruby", "rails", "php", "laravel",
    "django", "flask", "fastapi", "spring", "docker", "kubernetes", "k8s",
    "aws", "azure", "gcp", "terraform", "sql", "postgresql", "postgres",
    "mongodb", "redis", "elasticsearch", "graphql", "rest", "git", "linux",
    "ci/cd", "devops", "ml", "machine learning", "deep learning", "ai",
    "tensorflow", "pytorch", "pandas", "numpy", "scikit-learn", "spark",
    "hadoop", "kafka", "rabbitmq", "nextjs", "next.js", "svelte", "tailwind",
    "css", "html", "sass", "webpack", "vite", "figma", "ios", "android",
    "flutter", "react native", "unity", "unreal", "blockchain", "solidity",
    "web3", "serverless", "microservices", "agile", "scrum",
}

EXPERIENCE_PATTERNS = {
    r"senior|sr\.?|lead|principal|staff": "senior",
    r"junior|jr\.?|entry[\s-]?level": "junior",
    r"mid[\s-]?level|medel": "mid",
}

YEARS_PATTERN = re.compile(r"(\d+)\+?\s*(?:års?|years?)", re.IGNORECASE)

LOCATION_INDICATORS = {"i", "in", "from", "based in", "located in", "baserad i"}


class QueryParser:
    def __init__(self):
        self._nlp = None

    @property
    def nlp(self):
        if self._nlp is None:
            import spacy
            try:
                self._nlp = spacy.load("en_core_web_sm")
            except OSError:
                self._nlp = spacy.blank("en")
        return self._nlp

    def parse(self, query: str) -> dict:
        technologies = self._extract_technologies(query)
        location = self._extract_location(query)
        experience_level = self._extract_experience_level(query)
        years = self._extract_years(query)
        domain = self._extract_domain(query)

        return {
            "technologies": technologies,
            "location": location,
            "experience_level": experience_level,
            "years_experience": years,
            "domain": domain,
            "raw_query": query,
        }

    def _extract_technologies(self, query: str) -> list[str]:
        query_lower = query.lower()
        found = []
        for tech in sorted(TECH_KEYWORDS, key=len, reverse=True):
            pattern = r"\b" + re.escape(tech) + r"\b"
            if re.search(pattern, query_lower):
                found.append(tech.title() if len(tech) > 3 else tech.upper())
        return found

    def _extract_location(self, query: str) -> str | None:
        doc = self.nlp(query)
        for ent in doc.ents:
            if ent.label_ in ("GPE", "LOC"):
                return ent.text

        location_patterns = [
            r"(?:i|in|from|based in|located in|baserad i)\s+([A-ZÅÄÖ][a-zåäö]+(?:\s+[A-ZÅÄÖ][a-zåäö]+)*)",
        ]
        for pattern in location_patterns:
            match = re.search(pattern, query)
            if match:
                loc = match.group(1)
                if loc.lower() not in TECH_KEYWORDS:
                    return loc
        return None

    def _extract_experience_level(self, query: str) -> str | None:
        query_lower = query.lower()
        for pattern, level in EXPERIENCE_PATTERNS.items():
            if re.search(pattern, query_lower):
                return level
        years = self._extract_years(query)
        if years is not None:
            if years <= 2:
                return "junior"
            elif years <= 5:
                return "mid"
            else:
                return "senior"
        return None

    def _extract_years(self, query: str) -> int | None:
        match = YEARS_PATTERN.search(query)
        if match:
            return int(match.group(1))
        return None

    def _extract_domain(self, query: str) -> str | None:
        domains = {
            "fintech": ["fintech", "finance", "banking", "payment"],
            "healthtech": ["healthtech", "health", "medical", "healthcare"],
            "edtech": ["edtech", "education", "learning"],
            "e-commerce": ["e-commerce", "ecommerce", "retail", "shopping"],
            "gaming": ["gaming", "game", "games"],
            "saas": ["saas", "b2b"],
            "security": ["security", "cybersecurity", "infosec"],
        }
        query_lower = query.lower()
        for domain, keywords in domains.items():
            if any(kw in query_lower for kw in keywords):
                return domain
        return None


query_parser = QueryParser()
