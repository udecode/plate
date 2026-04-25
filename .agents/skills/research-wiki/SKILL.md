---
description: Operate the docs/research compiled layer in either full or maintain mode. Use for research-lane creation, research upkeep, authority-sensitive corpus work, source summaries, concepts, systems, decisions, and open-question pages.
argument-hint: '[full|maintain] <goal or area>'
disable-model-invocation: true
name: research-wiki
metadata:
  skiller:
    source: .agents/rules/research-wiki.mdc
---

# Research Wiki

Handle $ARGUMENTS. This is the reusable workflow for operating the
`docs/research` compiled layer without turning research into one-off chat mush.

<task>#$ARGUMENTS</task>

## Purpose

Turn the existing research command docs into one reusable skill entrypoint.

This skill should decide whether the job is:

- a **full** ingest-and-compile pass
- a **maintain** pass over an existing research lane

The support docs remain canonical detail:

- [docs/research/commands/full-pipeline.md](docs/research/commands/full-pipeline.md)
- [docs/research/commands/maintain.md](docs/research/commands/maintain.md)

Use them as sub-workflows, not as dead docs.

## Core Rules

- `docs/research` is the compiled layer; `../raw` is the evidence layer.
- Keep the workflow lossless relative to the support docs above.
- Update the research layer itself, not just the chat answer.
- If the topic is authority-sensitive and spans multiple likely corpora, do a
  **full corpus-level ingest** across the relevant source families instead of a
  narrow spot check.
- In `full` mode, verify corpus completeness via an official-source discovery
  step before declaring a corpus missing, thin, or only partially evidenced.
- In `full` mode, once official-source discovery confirms that the relevant raw
  family already exists locally, exhaust the strongest local raw hits before
  calling `evidence gap` or `contradiction gap`.
- In `full` mode, every scoped corpus must end in an explicit disposition:
  - strongest evidence found
  - raw gap
  - compile gap
  - synthesis gap
  - freshness gap
  - evidence gap
  - contradiction gap
  - structure gap
    A full pass is not complete until every scoped corpus has one.
- Do not confuse:
  - raw evidence
  - compiled source summaries
  - synthesized decisions
  - open questions
- If evidence is thin or contradictory, say so explicitly and create an
  `open-questions/` page instead of flattening uncertainty into fake law.

## Read First

Always read:

1. [docs/research/README.md](docs/research/README.md)
2. [docs/research/index.md](docs/research/index.md)
3. [docs/research/log.md](docs/research/log.md)

Then choose one support doc:

- [docs/research/commands/full-pipeline.md](docs/research/commands/full-pipeline.md)
  for `full`
- [docs/research/commands/maintain.md](docs/research/commands/maintain.md)
  for `maintain`

## Mode Selection

### Use `full` when:

- the topic is broad or thinly covered
- the authority question is large enough that trusting the visible local slice
  would be reckless
- raw evidence is missing, stale, or uneven
- the surface spans multiple likely corpora
- trigger behavior, input behavior, or product claims need a **full
  corpus-level ingest**

Examples:

- compare Typora / Obsidian / Milkdown on one under-researched trigger surface
- rebuild a weak authority lane
- create a new research lane from scratch

### Use `maintain` when:

- the lane already exists in `docs/research`
- the goal is contradiction cleanup, freshness, backlinks, or stronger compiled
  synthesis
- you need upkeep, not a new ingest push

## Full-Mode Requirement

When `full` is chosen for a surface that obviously touches multiple editors or
source families, do **not** stop after finding one useful source.

Do the full corpus-level pass:

1. scope the relevant corpora
2. inspect existing compiled coverage
3. inspect raw coverage across the relevant corpora
4. run an official-source discovery step per corpus
5. exhaust the strongest local raw hits per corpus
6. create a per-corpus evidence ledger
7. classify gaps per corpus
8. fill what is safe
9. update `index.md` and `log.md`
10. return the remaining gaps honestly

For editor-behavior authority work, that often means some subset of:

- Typora
- Obsidian
- Milkdown
- Google Docs / GitHub Docs / Notion

depending on the actual surface

### Per-Corpus Evidence Ledger

For `full` mode, explicitly close each scoped corpus with:

- corpus name
- compiled pages inspected
- raw paths inspected
- direct raw files actually read
- official source entrypoints checked
- strongest evidence found
- disposition:
  - `evidenced`
  - `raw gap`
  - `compile gap`
  - `synthesis gap`
  - `freshness gap`
  - `evidence gap`
  - `contradiction gap`
  - `structure gap`
- next action if still unresolved

Do not end a full pass with silent corpora.

If a likely corpus was scoped and produced no useful proof, say that directly.
That is still a result.

Before recording `raw gap`, use official-source discovery to confirm that the
missing coverage is real and not just a stale or incomplete local raw mirror.

Before recording `evidence gap`, read the strongest local raw hits that your
searches surfaced for that corpus. Broad grep is routing, not proof.

If raw evidence is missing for a scoped corpus after that discovery step,
record a `raw gap` explicitly instead of quietly letting another corpus carry
the whole answer.

If compiled pages are missing but raw exists, record a `compile gap` and create
the missing source summary when safe.

If evidence exists but still does not answer the behavior question, record an
`evidence gap` or `contradiction gap` instead of flattening it into a partial
yes.

If official discovery and local raw search already surfaced an obviously
relevant file, you do not get to stop at "broad grep over corpus X". Read the
file and cite it, or explain why it was not actually relevant.

## Outputs

A successful pass should leave behind durable artifacts such as:

- source summaries
- entity pages
- concept pages
- system pages
- decision pages
- open-question pages
- updated index/log entrypoints

## Blunt Rules

- Do not do “research” that only rephrases the first source you found.
- Do not call something `full` if you only spot-checked one corpus when the
  topic obviously spans several.
- Do not close `full` mode without an official-source discovery step for each
  scoped corpus.
- Do not treat grep hits as the same thing as inspected evidence.
- Do not record a corpus as thin, partial, or unresolved when the likely
  answer is already sitting in local raw unread.
- Do not close `full` mode without a per-corpus evidence ledger.
- Do not bypass the compiled layer and patch law straight from raw evidence
  unless the task is tiny and the evidence is already obvious.
- Do not leave `index.md` or `log.md` stale after adding research pages.
