# Typora Reference Corpus

This folder is the repo-safe entry point for Typora research.

It exists so later editor-behavior work can use a local Typora corpus instead of repeatedly browsing the live site.

## Source

- canonical upstream source: `https://support.typora.io/store/`
- fetch date is recorded in [corpus-metadata.json](./corpus-metadata.json)
- the upstream search index currently exposes `123` indexed pages

## Copyright Boundary

This repo does **not** store Typora page bodies.

What is committed here:

- page metadata
- URLs
- categories
- language buckets
- content lengths
- content hashes
- usage notes

What stays out of the repo:

- raw page text from Typora
- mirrored HTML
- full-page markdown conversions

Raw source content is cached locally only under:

- `$HOME/.cache/plate/editor-behavior/typora/store.json`
- `$HOME/.cache/plate/editor-behavior/typora/pages/*.json`

That gives us a reusable local research cache without redistributing Typora’s content in the repo.

## Repo Files

- [catalog.tsv](./catalog.tsv): full page inventory with metadata and content hashes
- [corpus-metadata.json](./corpus-metadata.json): snapshot stats and drift-tracking data

## Coverage Snapshot

- root pages: `112`
- Japanese pages: `7`
- Chinese pages: `4`

Main category counts:

- `how-to`: `48`
- `new`: `27`
- `basic`: `21`
- `reference`: `6`
- `tips`: `4`
- `announcement`: `2`

## First Pages To Use For Behavior Work

These are the highest-value pages for the markdown-first spec and later TDD:

- `/Quick-Start/`
- `/Markdown-Reference/`
- `/Shortcut-Keys/`
- `/Strict-Mode/`
- `/Line-Break/`
- `/Copy-and-Paste/`
- `/Search/`
- `/Table-Editing/`
- `/Task-List/`
- `/YAML/`
- `/Math/`
- `/Images/`
- `/Resize-Image/`
- `/Upload-Image/`
- `/HTML/`
- `/Media/`
- `/Code-Fences/`
- `/Code-Fences-Language-Support/`
- `/Outline/`
- `/TOC/`
- `/TOC-levels/`
- `/Auto-Pair/`
- `/Delete-Range/`

Release-note pages under `/What's-New-*/` matter too. They are the drift lane when behavior changed after earlier docs were written.

## How To Query The Local Cache

Find relevant pages fast:

```bash
rg -n "blockquote|task list|line break|tab|backspace" \
  "$HOME/.cache/plate/editor-behavior/typora/pages"
```

Print matching titles and URLs:

```bash
python3 - <<'PY'
from pathlib import Path
import json

pages = Path.home() / ".cache/plate/editor-behavior/typora/pages"
for path in sorted(pages.glob("*.json")):
    item = json.loads(path.read_text())
    hay = " ".join(
        str(item.get(k, "")) for k in ("title", "url", "category", "content")
    ).lower()
    if "blockquote" in hay or "line break" in hay:
        print(item["title"], item["url"])
PY
```

## How To Use This In The Spec Work

1. Start from [catalog.tsv](./catalog.tsv) to locate candidate pages.
2. Read raw page content from the local cache, not the live site.
3. Paraphrase findings back into our spec docs.
4. Cite Typora page URLs in analysis, not long verbatim excerpts.
5. If the upstream corpus changes, compare hashes before re-auditing behavior.

## Non-Rules

- This corpus does not make Typora infallible.
- This corpus does not replace CommonMark or GFM syntax specs.
- This corpus does not settle edge cases missing from Typora docs. Those still become explicit Plate-owned decisions.
