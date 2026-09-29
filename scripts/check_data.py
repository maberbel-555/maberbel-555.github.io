#!/usr/bin/env python3
"""Validate editable content before publishing. Python standard library only."""
from pathlib import Path
from datetime import date
import json
import re
import sys

ROOT = Path(__file__).resolve().parents[1]
errors: list[str] = []

def fail(path: Path, message: str) -> None:
    errors.append(f"{path.relative_to(ROOT)}: {message}")

def read(path: Path) -> dict:
    try:
        value = json.loads(path.read_text(encoding="utf-8"))
        if not isinstance(value, dict):
            raise ValueError("expected a JSON object")
        return value
    except (OSError, ValueError) as exc:
        fail(path, str(exc))
        return {}

def text(path: Path, value: dict, field: str, required: bool = False) -> str:
    result = value.get(field, "")
    if not isinstance(result, str):
        fail(path, f"{field} must be text, not a number or object")
        return ""
    if required and not result.strip():
        fail(path, f"{field} is required")
    return result

keys: set[str] = set()
for path in sorted((ROOT / "data/publications").glob("*.json")):
    p = read(path)
    key = text(path, p, "key", True)
    if not re.fullmatch(r"[A-Za-z][A-Za-z0-9_-]*", key):
        fail(path, "key must start with a letter and contain only letters, digits, _ or -")
    if key in keys:
        fail(path, f"duplicate citation key: {key}")
    keys.add(key)
    text(path, p, "title", True)
    if p.get("publication_type") not in {"journal", "preprint", "proceedings"}:
        fail(path, "publication_type must be journal, preprint or proceedings")
    year = p.get("year")
    if type(year) is not int or not 1900 <= year <= 2200:
        fail(path, "year must be an integer between 1900 and 2200")
    if type(p.get("selected", False)) is not bool:
        fail(path, "selected must be true or false")
    authors = p.get("authors")
    if not isinstance(authors, list) or not authors:
        fail(path, "at least one author is required")
    else:
        for author in authors:
            if not isinstance(author, dict):
                fail(path, "each author needs given and family fields")
                continue
            text(path, author, "given", True)
            text(path, author, "family", True)
    for field in ("journal", "volume", "number", "pages", "bibtex_override"):
        text(path, p, field)
    doi = text(path, p, "doi")
    if doi and not re.fullmatch(r"10\.\d{4,9}/\S+", doi):
        fail(path, "enter the DOI identifier only, without https://doi.org/")
    arxiv = text(path, p, "arxiv")
    if arxiv and not re.fullmatch(r"(?:\d{4}\.\d{4,5}|[a-zA-Z.-]+/\d{7})(?:v\d+)?", arxiv):
        fail(path, "enter the arXiv identifier only")

for path in sorted((ROOT / "data/events").glob("*.json")):
    event = read(path)
    for field in ("title", "event", "date_label"):
        text(path, event, field, True)
    try:
        date.fromisoformat(text(path, event, "date", True))
    except ValueError:
        fail(path, "date must use YYYY-MM-DD")
    url = text(path, event, "url")
    if url and not url.startswith("https://"):
        fail(path, "event URL must start with https://")
    slides = text(path, event, "slides")
    if slides and not slides.startswith("https://"):
        asset = ROOT / "static" / slides
        if slides.startswith("/") or ".." in Path(slides).parts or not asset.is_file():
            fail(path, "slides must be an existing path relative to static/, or an https:// URL")

path = ROOT / "data/profile.json"
p = read(path)
for field in ("name", "email", "intro", "photo"):
    text(path, p, field, True)
photo = p.get("photo", "")
if isinstance(photo, str) and (photo.startswith("/") or ".." in Path(photo).parts or not (ROOT / "static" / photo).is_file()):
    fail(path, "photo must be an existing path relative to static/, without a leading slash")
for name in ("cv", "teaching"):
    read(ROOT / "data" / (name + ".json"))

if errors:
    print("Content validation failed:\n" + "\n".join("- " + e for e in errors), file=sys.stderr)
    sys.exit(1)
print("Content validation passed.")
