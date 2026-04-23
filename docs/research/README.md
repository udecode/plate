# Agent Research Layer

This is the compiled research layer for Plate.

It exists to give future agents a stable, low-token, persistent reference
surface that sits between raw evidence and day-to-day task execution.

This is not a human PKM system. It is not an Obsidian workflow. It is not a
generic RAG bucket.

The raw evidence layer lives outside this repo in `../raw` relative to the
Plate repo root. That private repo is assumed to be cloned locally when agents
need to verify or deepen compiled summaries.

## Core idea

Most agent work still behaves like raw RAG:

- read the repo
- search scattered docs
- search issues, plans, and learnings
- stitch the answer together again from scratch

That works, but it wastes tokens and keeps rediscovering the same decisions,
the same caveats, and the same contradictions.

The better model is a compiled research layer:

- raw evidence stays in `../raw`
- compiled summaries, decisions, concepts, and system maps live here
- agents read this layer first
- agents drop to `../raw` only when they need verification, conflict
  resolution, or deeper evidence

The valuable artifact is not one answer in one chat. It is the maintained
markdown layer that makes the next agent faster and less likely to repeat old
mistakes.

## Layers

### 1. Raw evidence

Private, source-heavy, and often copyright-sensitive material.

Expected location:

- `../raw`

Examples:

- captured third-party editor docs
- screenshots
- extracted page text
- local corpora
- transcripts
- external-source inventories

This layer is the evidence base. It is not the default answer surface.

### Raw acquisition policy

Prefer the strongest stable acquisition method:

1. official git repo clone
2. official export or local cache
3. page capture or scrape only when no better source exists

If an official git repo exists, use that as the canonical raw source instead of
inventing a scrape.

Examples:

- Milkdown: official repo cloned under `../raw/milkdown/repo`
- Obsidian: official help and developer-docs repos cloned under `../raw/obsidian`
- Typora: local cached corpus copied into `../raw/typora`

### Raw snapshot metadata

Every raw source family should record enough metadata that future agents can
trust what they are reading.

Record at least:

- canonical source URL or repo URL
- local raw path
- snapshot date
- current revision when available:
  - git commit hash for repos
  - fetched timestamp for caches or exports
- lightweight counts when useful

### Raw sync policy

Do not refresh every raw source on every task. That is wasteful and noisy.

Refresh raw sources when:

- the area is active in the current task
- drift matters to the decision
- the source has likely changed since the last meaningful ingest

When a raw source is refreshed:

- update its raw README or metadata
- append `../raw/log.md`
- refresh affected compiled pages if the new evidence changes them

### 2. Compiled research

This directory, `docs/research`, is the agent-facing compiled layer.

It contains:

- source summaries
- decisions
- concepts
- systems
- entities
- open questions
- index and log files

This layer should be:

- concise
- metadata-first
- link-heavy
- easy to grep
- safe to keep in the public repo

### 3. Agent contract

Agents should treat this directory as the default read layer for repo
knowledge.

The rule is simple:

1. read `docs/research/index.md`
2. read the relevant compiled pages
3. only then drop to `../raw` or broader repo search

## Design rules

### Stable paths beat cute structure

Keep the layout boring and guessable.

Current top-level structure:

- `index.md`
- `log.md`
- `schema.md`
- `commands/`
- `sources/`
- `decisions/`
- `concepts/`
- `systems/`
- `entities/`
- `open-questions/`

Do not split the research layer into parallel goal-specific silos like:

- `editor-behavior/`
- `architecture/`
- `plate-v2/`
- `slate-v2/`

That looks tidy for a week and then turns into duplicate pages and drifting
taxonomy.

Use one research layer, many domains, one page-type system.

`commands/` is the one intentional support surface that is not a knowledge-type
bucket. It exists for repeatable operational workflows, not for domain pages.

### One concept per file

Do not build giant mixed essays.

Good:

- one file for one source summary
- one file for one decision
- one file for one concept
- one file for one system map
- one file for one entity

Bad:

- giant pages that mix multiple concerns and force future agents to dig through
  noise

### Organize by knowledge type, not by temporary project goal

This research layer should be DRY at the page-type level.

Use:

- `sources/` for compiled source summaries
- `entities/` for concrete named things
- `concepts/` for reusable abstractions and vocabulary
- `systems/` for larger maps and architecture surfaces
- `decisions/` for explicit conclusions
- `open-questions/` for unresolved ambiguity

Do not duplicate the same thing across multiple goal folders.

Examples:

- one page for `Typora`
- one page for `Slate`
- one page for `directional-affinity`
- one page for `inline-void-atom`
- one page for `editor-architecture-landscape`
- one page for `footnote-refs-are-inline-void-atoms`

That page can serve many goals:

- editor-behavior work
- Plate v2 architecture work
- Slate v2 comparison work
- plugin-system analysis

The page type stays stable even when the project focus changes.

### Claims point outward

This research layer is a normalized interpretation layer, not a vibe layer.

Durable claims should point to evidence in:

- `../raw`
- repo files
- source-of-truth docs
- plans
- learnings

### Compiled pages stay derived

Do not copy raw third-party docs into this repo.

This research layer should contain:

- paraphrased summaries
- normalized decisions
- compact cross-source synthesis
- Plate-specific conclusions

This research layer should not contain:

- screenshots from vendor docs
- raw captured pages
- one-to-one source-card layers
- long source-shaped summaries
- quote-heavy mirrors of external docs

Rule of thumb:

- one source file -> one summary card = raw layer
- many source files -> one synthesized page = research layer

### Promote durable knowledge only

This research layer is not where every exploratory note goes.

Only promote content here when it is:

- reusable
- likely to matter again
- stable enough to deserve a home
- clearer as a maintained page than as one-off chat or scratch analysis

Leave temporary exploration in `docs/analysis` or `docs/plans`.

### Coverage gaps are expected unless agents maintain them proactively

This research layer will fail if agents only update it reactively from the narrow task in
front of them.

Failure modes:

- a task touches only one source, but other relevant raw evidence in `../raw`
  never gets ingested
- a raw source exists, but no compiled source page was ever written
- a compiled page exists, but the relevant decision or concept page was never
  updated
- the agent answers from the visible local slice and misses a gap somewhere
  else in the corpus

So the maintenance model cannot be "update whatever file the current task
happened to mention." That is how holes accumulate.

## Page types

### `commands/`

Operational command specs for repeatable agent workflows.

Use this for:

- full research passes
- maintenance passes
- gap-detection workflows
- ingest workflows

Do not use it to store domain knowledge itself.

### `schema.md`

The minimal metadata contract for page types in this layer.

Keep it small and stable.

### `index.md`

The entrypoint catalog.

This is what an agent should read first.

It should answer:

- what exists
- where it lives
- what each page is for

### `log.md`

Append-only history of meaningful wiki operations.

Use it for:

- new source ingests
- important restructures
- lint passes
- major corrections

Do not turn it into a second index.

### `sources/`

Compiled summaries of raw evidence.

Each source summary should say:

- what the source is
- what it added
- what it confirmed
- what it contradicted
- what compiled pages it should affect

This is where source-specific work belongs. If a page still mostly smells like
"what this source said", it probably belongs in `sources/`.

### `decisions/`

Canonical repo-relevant choices.

These pages should say:

- the question
- the chosen answer
- the reason
- competing options
- source refs
- blast radius

If a page answers "what won?", it belongs in `decisions/`.

### `concepts/`

Shared vocabulary and abstractions.

These pages should say:

- what the term means
- what it is not
- where it is used

If a page answers "what does this idea mean across the repo?", it belongs in
`concepts/`.

### `systems/`

Architecture or authority maps.

These pages should say:

- boundaries
- ownership
- important internal links
- how to navigate the area

If a page answers "how does this whole area fit together?", it belongs in
`systems/`.

### `entities/`

Concrete named things.

Examples:

- editors
- reference products
- Plate packages
- plugins

If a page is about one concrete named thing, it belongs in `entities/`.

### `open-questions/`

Known ambiguity that should not be silently “resolved” by agent confidence.

Use this to preserve real uncertainty.

If a page answers "we still do not know", it belongs in `open-questions/`.

## Relationship To Other Docs

This repo should use three different layers for three different jobs.

### `docs/analysis`

Scratch and exploratory thinking.

Use it for:

- workbench comparisons
- candidate lists
- ranking drafts
- architecture exploration
- temporary synthesis that is not stable yet

This is where something like
[editor-architecture-candidates.md](docs/analysis/editor-architecture-candidates.md)
starts.

### `docs/research`

Compiled reusable knowledge.

Use it for:

- source summaries worth keeping
- reusable concept pages
- architecture maps worth reusing
- entity pages that future agents will need
- explicit decisions

This is the research brain.

### `docs/editor-behavior`

Normative law and ship gate.

Use it for:

- authority model
- behavior law
- exhaustive protocol rows
- release gating

This is the law layer, not the research archive.

### Rule Of Thumb

- `docs/analysis` = exploratory
- `docs/research` = compiled reusable knowledge
- `docs/editor-behavior` = normative spec

Do not make one directory do all three jobs.

## Migration Rules

When migrating existing docs into the research layer:

1. do not move a file just because it exists
2. first ask what job the file is doing:
   - scratch exploration
   - compiled knowledge
   - normative law
3. only move it into `docs/research` if it is durable compiled knowledge

### Good migration examples

- a source-heavy comparison doc becomes:
  - one `systems/...` page
  - several `entities/...` pages
  - maybe a few `decisions/...` pages
- repeated terminology explanations become `concepts/...`
- repeated product or repo summaries become `entities/...`

### Bad migration examples

- dumping `docs/analysis/*` wholesale into `docs/research`
- copying `docs/editor-behavior/*` into `docs/research` just to have a second copy
- making one giant "Slate v2 + Plate v2 + plugins + references" page

### Specific guidance for architecture work

Something like
[editor-architecture-candidates.md](docs/analysis/editor-architecture-candidates.md)
should not be copied as one giant research page.

Its durable parts should decompose into pages like:

- `systems/editor-architecture-landscape.md`
- `entities/prosemirror.md`
- `entities/lexical.md`
- `entities/slate.md`
- `entities/tiptap.md`
- later, if needed, `decisions/...` pages for explicit Plate choices

## Core operations

### Ingest

When new evidence arrives:

1. read the raw source
2. classify what it affects
3. write or update a source summary
4. update any impacted decision, concept, system, or entity pages
5. update `index.md`
6. append `log.md`

Ingest alone is not enough. It only handles known sources that were already
noticed.

### Query

When answering a task:

1. start from `index.md`
2. read the relevant compiled pages
3. answer from the compiled research layer first
4. verify against raw evidence when needed

### Lint

Periodically check for:

- stale claims
- duplicated concepts
- orphan pages
- dead terminology
- contradictions
- overgrown pages that should be split
- open questions that now have answers

Lint should also detect coverage gaps, not just stale wording.

## Autonomous Maintenance

This research layer should eventually be maintained by a dedicated autonomous skill or
workflow, not only by incidental task work.

Its job is to proactively improve both layers:

- the private raw evidence layer in `../raw`
- the compiled layer in `docs/research`

### Why this is needed

If the user asks a question about a goal area and the relevant evidence was
never ingested or compiled, the agent may miss the answer entirely.

That means the system must support:

- gap detection
- proactive ingest
- proactive compilation
- targeted refresh

without waiting for a human to notice every missing page manually.

### Recommended skill shape

The right future skill is something like:

- `research-maintainer`
- or `research-gap-filler`

Its mission is not just to summarize.
Its mission is to keep the reference system complete enough that future agents
do not fall through obvious holes.

### Inputs

The skill should accept a goal, area, or question such as:

- `editor behavior references`
- `plate v2 architecture`
- `slate v2 risks`
- `plugin model`

### Loop

Given a goal, the skill should:

1. infer the likely entities, systems, concepts, and decisions involved
2. scan `docs/research` for existing compiled coverage
3. scan `../raw` for relevant raw evidence
4. classify gaps:
   - raw missing
   - raw exists but compiled summary missing
   - compiled summary exists but decision/concept/system pages missing
   - stale compiled pages
   - contradictions between compiled pages
   - weakly sourced claims
5. fill the highest-value gaps it can safely fill
6. record what it changed in `log.md`
7. leave explicit `open-questions/...` pages where the gap cannot be filled yet

### Gap classes

Use these gap classes explicitly:

- **Raw gap**: no relevant evidence exists in `../raw`
- **Compile gap**: raw evidence exists, but `docs/research/sources/...` is missing
- **Synthesis gap**: source summaries exist, but no concept/system/decision page
  captures the reusable conclusion
- **Freshness gap**: compiled page exists, but newer evidence likely changed it
- **Contradiction gap**: two compiled pages disagree or point in different
  directions
- **Structure gap**: pages exist, but they are duplicated, orphaned, or split
  at the wrong boundaries

### Safe autofill rules

The skill should be aggressive about structure and conservative about claims.

Safe actions:

- create missing source summary pages from existing raw evidence
- add missing backlinks and `index.md` entries
- split giant mixed pages into clearer page types
- create entity or concept stubs when the source support is obvious
- open explicit question pages when evidence is still thin

Unsafe actions that need stronger evidence:

- inventing decisions without source support
- claiming coverage where only one weak source exists
- silently resolving contradictions
- creating fake completeness from repo-local vibes

### Output

Each run should leave:

- updated research pages
- updated `index.md`
- appended `log.md`
- explicit open questions for unresolved gaps

And, when useful, a concise gap report saying:

- what was missing
- what was filled
- what still needs raw evidence

### Trigger points

This maintenance skill should be used:

- before major research or migration tasks
- after finishing major research or migration tasks
- periodically as a research health pass
- whenever an agent notices it is answering from thin or incomplete coverage

### Rule of thumb

If the current task depends on a domain that feels bigger than the currently
visible pages, do not trust the visible pages alone.

Run a gap-detection pass first.

## Retrieval order

The default retrieval order is:

1. `docs/research`
2. primary raw evidence in `../raw`
3. broader repo search
4. external sources if still needed

If an agent searches the whole repo before checking `docs/research`, this layer is
failing its job.

## Operational Surface

The commands in `commands/` are the executable mental model for applying this
research layer in practice.

Start with:

- [commands/full-pipeline.md](docs/research/commands/full-pipeline.md)
- [commands/maintain.md](docs/research/commands/maintain.md)

That is the heavyweight command for improving the research layer from a goal or
domain instead of answering only from the currently visible slice.

Use [schema.md](docs/research/schema.md) to keep page
metadata consistent while the layer is still small.

## Initial scope

Start with one narrow evidence corpus from `../raw`, prove the ingest and
retrieval workflow, then expand to additional sources only after the first path
is stable.

## Agent rules

- never edit `../raw` while compiling conclusions unless the task is explicitly
  about curating raw evidence
- never add a durable claim here without evidence
- never flatten contradictions into fake certainty
- never treat compiled summaries as stronger than primary sources
- never let a reusable analysis die in chat if it belongs in this research layer
