#!/usr/bin/env python3
"""Small post-build smoke test; does not replace browser testing."""
from pathlib import Path
from html.parser import HTMLParser
import json
import sys

class Document(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.in_json = False
        self.publication_json = ""
        self.cite_buttons = set()
        self.in_h1 = False
        self.h1 = ""
    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if tag == "script" and a.get("id") == "publication-data":
            self.in_json = True
        if tag == "button" and "data-cite" in a:
            self.cite_buttons.add(a["data-cite"])
        if tag == "h1":
            self.in_h1 = True
    def handle_endtag(self, tag):
        if tag == "script":
            self.in_json = False
        if tag == "h1":
            self.in_h1 = False
    def handle_data(self, data):
        if self.in_json:
            self.publication_json += data
        if self.in_h1:
            self.h1 += data

def main() -> None:
    root = Path(sys.argv[1] if len(sys.argv) > 1 else "public")
    for name in ("index", "research", "events", "teaching", "cv"):
        path = root / (name + ".html")
        html = path.read_text(encoding="utf-8")
        doc = Document(); doc.feed(html)
        if not doc.h1.strip():
            raise ValueError(f"Missing page title in {path}")
        if "ZgotmplZ" in html:
            raise ValueError(f"Go template blocked an unsafe URL in {path}")
        if name == "research":
            metadata = json.loads(doc.publication_json)
            keys = {p["key"] for p in metadata.values()}
            if keys != doc.cite_buttons:
                raise ValueError("Citation buttons do not match publication metadata")
    for asset in ("styles.css", "site.js", "images/portrait.jpg"):
        if not (root / asset).is_file():
            raise ValueError(f"Missing asset: {asset}")
    print("Generated page smoke test passed.")

if __name__ == "__main__":
    try:
        main()
    except (ValueError, OSError) as exc:
        print(f"Output validation failed: {exc}", file=sys.stderr)
        sys.exit(1)
