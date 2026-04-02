# Typora Reference Corpus

## Task

- Source: direct user request
- Title: `Scrape Typora docs fully without copyright issues`
- Type: research and documentation infrastructure
- Goal: build a local Typora reference corpus we can rely on for later markdown behavior/spec work without repeatedly browsing the live site

## Plan

1. Read existing editor-behavior docs and repo learnings for prior constraints.
2. Enumerate official Typora documentation pages from primary sources.
3. Define a repo-safe storage model:
   - keep repo artifacts to metadata and paraphrased notes
   - avoid raw mirrored page dumps in the repo
4. Build the initial Typora corpus under `docs/editor-behavior/references/typora/`.
5. Sanity-check coverage against the official crawl surface.
6. Document how later spec work should consume this corpus.

## Findings

- `docs/editor-behavior/` contains the draft architecture, standards, editing spec, and parity matrix files that this corpus should feed.
- No existing `docs/solutions/` entry covers Typora, Milkdown, or editor behavior corpus work.
- The `learnings-researcher` skill references `docs/solutions/patterns/critical-patterns.md`, but that file does not exist in this repo.
- Repo-safe approach should separate:
  - source metadata and URLs
  - our paraphrased summaries and structured notes
  - optional local raw cache outside the repo if needed during research
- Typora’s support site exposes a single authoritative search corpus at `https://support.typora.io/store/`.
- That endpoint currently contains `123` indexed entries:
  - `112` root pages
  - `7` Japanese pages
  - `4` Chinese pages
- The repo-safe inventory now lives under `docs/editor-behavior/references/typora/`:
  - `README.md`
  - `catalog.tsv`
  - `corpus-metadata.json`
- The private local cache now lives under `$HOME/.cache/plate/editor-behavior/typora/`:
  - `store.json`
  - `metadata.json`
  - `pages/*.json`
- Boundary check passed:
  - local cache is searchable with `rg`
  - repo artifacts do not include sampled raw page text

## Risks

- A raw HTML or markdown mirror in the repo is unnecessary copyright risk and will age badly.
- A weak corpus that stores only URLs is not enough; it needs structured notes and coverage tracking.
- Typora docs may not publish every edge-case behavior explicitly, so later spec work still needs manual gap tagging.

## Progress

- 2026-04-02: Reloaded `major-task`, `planning-with-files`, `learnings-researcher`, and `best-practices-researcher` after context compaction.
- 2026-04-02: Confirmed the editor-behavior draft docs exist and are the right target for a local reference corpus.
- 2026-04-02: Confirmed no prior repo learning covers Typora or this corpus lane.
- 2026-04-02: Identified `https://support.typora.io/store/` as the upstream corpus seam instead of crawling page-by-page.
- 2026-04-02: Generated a private local cache plus a repo-safe metadata catalog and usage guide.
- 2026-04-02: Verified that the local cache is searchable and the repo artifacts exclude sampled raw Typora body text.
