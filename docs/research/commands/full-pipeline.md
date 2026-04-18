# Full Research Pipeline

Primary reusable entrypoint:

- [$research-wiki](.agents/skills/research-wiki/SKILL.md)

Recommended command name:

- `research-full`

Suggested invocation shape:

```text
research-full <goal>
```

Examples:

```text
research-full editor behavior references
research-full plate v2 architecture
research-full slate v2 risks
research-full plugin model
```

## Purpose

Run the full research pipeline for a goal area.

This command should not just answer a question in chat. It should improve the
research system itself:

- identify the goal
- find the relevant raw evidence
- find the relevant compiled research pages
- detect gaps
- fill what can be filled safely
- leave explicit unresolved gaps where evidence is still missing

This is the full-mode sub-workflow for `research-wiki`.

Use it when the goal area is big enough that trusting the currently visible
local slice would be reckless.

## When To Use

Use `research-full` when:

- starting a new research lane
- preparing a major design or migration decision
- working in a domain that likely has missing raw or compiled coverage
- you want the research layer updated before or during serious work

Do not use it for:

- tiny one-off edits
- questions already fully covered by the relevant `docs/research` pages
- normative doc changes that do not need new source work

## Inputs

The input is a goal, domain, or question.

Good inputs:

- `editor behavior references`
- `markdown-native authority stack`
- `plate v2 architecture`
- `slate v2 comparison`
- `plugin system`

Bad inputs:

- `fix typo`
- `random`
- vague statements with no domain signal at all

## Outputs

A successful run should leave behind durable artifacts, not just a chat answer.

Expected outputs:

- updated `../raw` evidence when safe and needed
- updated `docs/research/sources/...` summaries
- updated `entities/`, `concepts/`, `systems/`, or `decisions/` pages when the
  evidence supports them
- updated [index.md](docs/research/index.md)
- updated [log.md](docs/research/log.md)
- explicit `open-questions/...` pages or a concise gap report when important
  holes remain

## Full Loop

### 1. Scope the goal

Translate the goal into likely:

- entities
- concepts
- systems
- decisions
- raw source families

For example:

- `editor behavior references`
  - entities: Typora, Obsidian, Google Docs, Notion, Milkdown
  - concepts: authority, affinity, inline atom, editing ownership
  - systems: editor-behavior reference stack
- `plate v2 architecture`
  - entities: Plate, Slate, ProseMirror, Lexical, Tiptap
  - concepts: schema, runtime model, plugin model, layout, command pipeline
  - systems: architecture landscape

### 2. Check compiled coverage first

Read:

1. [index.md](docs/research/index.md)
2. the relevant `entities/`, `concepts/`, `systems/`, `decisions/`, and
   `sources/` pages

Goal:

- understand what the research layer already knows
- identify what is missing before doing broader evidence work

### 3. Check raw coverage second

Inspect `../raw` for:

- the expected source families
- missing source captures
- stale or thin evidence
- source groups that exist but have no compiled summary

This is where raw-gap detection happens.

When the raw layer is missing or weak:

- prefer an official git repo clone when one exists
- otherwise use an official export or trusted local cache
- scrape or capture pages only when there is no better source

When you create or refresh a raw source family, record:

- canonical source URL or repo
- local raw path
- snapshot date
- revision or fetched timestamp
- a short entry in `../raw/log.md`

### 3.5. Verify official-source coverage

Before you decide that a scoped corpus is missing, thin, or only partially
evidenced, verify the local raw mirror against official source entrypoints.

Use the strongest official discovery surface available:

1. official docs entrypoints
2. official repo entrypoints
3. official release-note entrypoints

Goal:

- confirm the local raw family is complete enough for the current question
- detect missing raw families or stale mirrors
- avoid mistaking “not yet pulled” for “no evidence exists”

### 3.6. Exhaust the strongest local raw hits

After official-source discovery confirms that the relevant raw family already
exists locally, read the strongest local raw hits before classifying the
corpus.

Rules:

- broad grep is routing, not evidence
- if a search hit obviously matches the current behavior question, read that
  file
- if release notes, help pages, tests, or source files in local raw look like
  the owning lane, inspect them directly
- if you skip a promising hit, say why

For the corpus ledger, distinguish between:

- raw paths searched
- direct raw files actually read

Do not call a corpus thin, partial, or unresolved while the likely answer is
already sitting in local raw unread.

### 4. Classify gaps

Use these classes explicitly:

- **Raw gap**
  no relevant evidence exists in `../raw`
- **Compile gap**
  raw evidence exists, but no source summary exists in
  `docs/research/sources/...`
- **Synthesis gap**
  source summaries exist, but no reusable concept/system/decision page captures
  the conclusion
- **Freshness gap**
  compiled pages exist, but likely need update from newer evidence
- **Contradiction gap**
  compiled pages disagree or point in different directions
- **Structure gap**
  pages exist, but they are duplicated, orphaned, or cut at the wrong
  boundaries

Do this **per scoped corpus**, not just once for the whole topic.

At the end of this step, every scoped corpus should have an explicit status:

- strongest evidence found
- raw gap
- compile gap
- synthesis gap
- freshness gap
- contradiction gap
- structure gap

Do not classify `raw gap` until the official-source discovery step confirms the
local raw mirror really is missing the relevant source family.

Do not classify `evidence gap` until the strongest local raw hits for that
corpus have actually been read.

### 5. Fill what is safe

Safe actions:

- create missing source summary pages from existing raw evidence
- create missing entity or concept stubs when the source support is obvious
- update stale summaries with newer evidence
- split oversized mixed pages
- add missing backlinks and index entries
- create explicit open-question pages when evidence is still incomplete

Unsafe actions:

- inventing decisions without strong source support
- claiming completeness just because some pages exist
- silently resolving contradictions
- creating source-shaped mirrors in `docs/research`

### 6. Promote only durable synthesis

Do not dump every finding into one giant page.

Promote according to page type:

- source-shaped material -> `sources/`
- concrete named thing -> `entities/`
- reusable abstraction -> `concepts/`
- larger map -> `systems/`
- explicit conclusion -> `decisions/`
- unresolved ambiguity -> `open-questions/`

### 7. Update the control files

Always update:

- [index.md](docs/research/index.md)
- [log.md](docs/research/log.md)

The command is incomplete if it improves pages but leaves the entrypoints stale.

### 8. Return a gap report

At the end, report:

- what was already covered
- what was missing
- what was filled
- what is still blocked on missing raw evidence

For `full` mode, this report should include a per-corpus ledger, not just a
global summary.

If the scoped corpora were Typora / Obsidian / Milkdown, the output should make
it impossible to miss what happened in each of those three corpora.

That ledger should also name which official source entrypoints were checked
before any corpus was marked `raw gap` or `evidence gap`.

## Default behavior

The default behavior should be:

- aggressive about finding structure gaps
- conservative about making new claims
- biased toward improving the research layer, not just the immediate answer

If the goal area is broad, prefer one strong pass that leaves the corpus better
than it found it over one shallow answer that disappears into chat.

If the surface is authority-sensitive and obviously spans multiple corpora, a
real full pass means **full corpus-level ingest** across those corpora, not a
single-source spot check.

That also means: do not stop after the first strong source. Finish the scoped
corpus ledger and classify the remaining corpora honestly.

And do not stop before checking official source entrypoints for each scoped
corpus.

## Relationship To Future Commands

`research-full` is the heavyweight command.

The only required companion command is:

- `research-maintain`

It should be derived from this pipeline, not invented with contradictory rules.
