from __future__ import annotations

import asyncio
import time
from collections import defaultdict


class RateLimiter:
    def __init__(self, requests_per_second: float = 10.0):
        self._interval = 1.0 / requests_per_second
        self._last_call: dict[str, float] = defaultdict(float)
        self._lock = asyncio.Lock()

    async def acquire(self, key: str = "default"):
        async with self._lock:
            now = time.monotonic()
            elapsed = now - self._last_call[key]
            if elapsed < self._interval:
                await asyncio.sleep(self._interval - elapsed)
            self._last_call[key] = time.monotonic()


github_limiter = RateLimiter(requests_per_second=5.0)
