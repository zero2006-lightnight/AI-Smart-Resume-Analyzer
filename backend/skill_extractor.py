"""Skill extraction via simple keyword matching over the skills dataset."""

import json
import re
from pathlib import Path
from typing import Dict, List, Tuple


class SkillExtractor:
    def __init__(self, dataset_path: Path):
        self.dataset_path = Path(dataset_path)
        self.dataset: Dict[str, List[str]] = self._load_dataset()
        self.skill_to_category = self._build_skill_lookup()
        self.patterns = self._build_patterns()

    def _load_dataset(self) -> Dict[str, List[str]]:
        if not self.dataset_path.exists():
            raise FileNotFoundError(f"Skills dataset not found at {self.dataset_path}")

        with self.dataset_path.open("r", encoding="utf-8") as f:
            data = json.load(f)

        if not isinstance(data, dict) or not data:
            raise ValueError("Skills dataset must be a non-empty object of categories")

        return data

    def _build_skill_lookup(self) -> Dict[str, str]:
        lookup: Dict[str, str] = {}
        for category, skills in self.dataset.items():
            for skill in skills:
                lookup[skill.lower()] = category
        return lookup

    def _build_patterns(self) -> Dict[str, re.Pattern[str]]:
        # Compile case-insensitive word-boundary patterns for each skill phrase.
        patterns: Dict[str, re.Pattern[str]] = {}
        for skill in self.skill_to_category.keys():
            pattern = re.compile(rf"(?i)(?<![\w]){re.escape(skill)}(?![\w])")
            patterns[skill] = pattern
        return patterns

    def extract_from_text(self, text: str) -> Tuple[List[str], Dict[str, int]]:
        """Return detected skills and per-category distribution from raw text."""

        if not text:
            return [], {}

        detected: List[str] = []
        for skill, pattern in self.patterns.items():
            if pattern.search(text):
                detected.append(skill)

        detected = sorted(set(detected))

        distribution: Dict[str, int] = {}
        for skill in detected:
            category = self.skill_to_category.get(skill, "Other")
            distribution[category] = distribution.get(category, 0) + 1

        return detected, distribution
