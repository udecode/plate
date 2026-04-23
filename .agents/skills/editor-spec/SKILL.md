---
description: 'Define or update editor behavior specs using the full Plate research-to-law pipeline. Use for both new and existing editor behavior work: adding behavior rules, changing locked law, introducing new interaction families, revising winner maps, shifting authority lanes, updating protocol rows, or changing parity-gate coverage.'
argument-hint: '[behavior topic | spec path | feature family]'
disable-model-invocation: true
name: editor-spec
metadata:
  skiller:
    source: .agents/rules/editor-spec.mdc
---

# Editor Spec

Handle $ARGUMENTS. This is the repo workflow for turning editor-behavior ideas
or changes into real Plate law instead of chat sludge.

<task>#$ARGUMENTS</task>

## Core Rules

- Evidence first. Vibes are not authority.
- `docs/research` feeds `docs/editor-behavior`. Do not collapse those jobs.
- Treat silence as a gap, not fake agreement.
- Lock node model and affinity before UX chrome.
- Any UI/editor-chrome spec should follow
  $build-web-apps:shadcn
  patterns for popovers, commands, menus, triggers, truncation, composition,
  and semantic styling. Do not invent one-off overlay markup when the shadcn
  path already exists.
- Update the smallest number of docs that keeps the stack honest. Do not let
  one file drift from the others.
- If a research rerun changes the authority picture, routing guidance, or row
  split, you must either patch the affected `docs/editor-behavior` files or
  explicitly record why no editor-behavior patch was needed. Do not stop at
  research-only updates and call the pass done.
- If the real fix is a new authority lane or family split, do that. Do not
  smear new behavior into the wrong bucket just to avoid a doc break.
- If a pass creates real remaining implementation work, triage that item into
  [docs/editor-behavior/master-roadmap.md](docs/editor-behavior/master-roadmap.md)
  instead of leaving it stranded only in parity wording or a one-off plan doc.
- Do not anchor the design to the current package layout or the nearest
  existing plugin. Always evaluate the best permanent home for the contract:
  core vs shared plugin vs feature package vs rendering layer. If the best
  long-term answer is to change core/plugin boundaries or move rendering/state
  ownership, say so explicitly.
- Prefer the best permanent architecture for both performance and DX over the
  nearest local host. If a shared contract belongs in core or a different
  package than the current feature seam, that is the answer.
- For current Plate features, parity and protocol matter. For speculative or
  deferred features, do not quietly bloat the release gate.

## Default Vs Escalation

Default behavior:

- use the direct research-to-law workflow
- read current law
- read compiled research
- decide whether evidence is already sufficient
- patch standards/spec/protocol/parity/audit as needed

When the research layer is needed, use
[$research-wiki](.agents/skills/research-wiki/SKILL.md)
instead of manually treating the command docs as a loose checklist.

Do not default this workflow to
[$deep-interview](/Users/zbeyens/.codex/skills/deep-interview/SKILL.md) or
[$ralplan](/Users/zbeyens/.codex/skills/ralplan/SKILL.md).

### Escalate to `$deep-interview` only when:

- user intent is still ambiguous
- scope boundaries or non-goals are unclear
- success criteria are missing
- the request is a new product surface with unresolved acceptance criteria
- research does not answer what the user actually wants

Do not auto-answer a deep interview from research. If research already answers
the question, skip the interview. If it does not, inventing “user answers” from
research is fake clarity.

### Escalate to `$ralplan` only when:

- the spec work turns into a real implementation or rollout plan
- there are multiple viable architecture paths and consensus is worth the cost
- the change is high-risk enough that Planner / Architect / Critic review is
  justified
- the user explicitly asks for plan consensus

Use `editor-spec` to define law. Use `$ralplan` to plan serious execution after
the law is clear enough.

## Read First

Always read these before making spec calls:

1. [docs/editor-behavior/README.md](docs/editor-behavior/README.md)
2. [docs/editor-behavior/markdown-standards.md](docs/editor-behavior/markdown-standards.md)
3. [docs/editor-behavior/markdown-editing-spec.md](docs/editor-behavior/markdown-editing-spec.md)
4. [docs/editor-behavior/editor-protocol-matrix.md](docs/editor-behavior/editor-protocol-matrix.md)
5. [docs/editor-behavior/markdown-parity-matrix.md](docs/editor-behavior/markdown-parity-matrix.md)
6. [docs/editor-behavior/master-roadmap.md](docs/editor-behavior/master-roadmap.md)
7. [docs/editor-behavior/markdown-editing-reference-audit.md](docs/editor-behavior/markdown-editing-reference-audit.md)
8. [docs/research/README.md](docs/research/README.md)
9. [$research-wiki](.agents/skills/research-wiki/SKILL.md)
10. [docs/research/commands/full-pipeline.md](docs/research/commands/full-pipeline.md)
11. [docs/research/commands/maintain.md](docs/research/commands/maintain.md)
12. [docs/solutions/best-practices/markdown-editor-reference-audits-must-treat-silence-as-a-gap.md](docs/solutions/best-practices/markdown-editor-reference-audits-must-treat-silence-as-a-gap.md)
13. [docs/solutions/best-practices/editor-behavior-specs-must-lock-node-model-and-affinity-before-ux.md](docs/solutions/best-practices/editor-behavior-specs-must-lock-node-model-and-affinity-before-ux.md)

Read these when relevant:

- [docs/editor-behavior/commands/README.md](docs/editor-behavior/commands/README.md)
  when resuming the lane, reconsolidating drift, or answering “what next?”
- [docs/editor-behavior/master-roadmap.md](docs/editor-behavior/master-roadmap.md)
  when the pass changes what should be implemented next, introduces a new lane,
  or creates deferred follow-up that should enter the canonical queue
- [docs/research/systems/editor-behavior-architecture.md](docs/research/systems/editor-behavior-architecture.md)
  when the question is architectural or cross-family
- [docs/analysis/editor-architecture-candidates.md](docs/analysis/editor-architecture-candidates.md)
  for framework-facing architecture or runtime questions
- `../raw`
  when compiled research is missing, thin, stale, or contradictory

## What This Workflow Produces

This workflow should answer four questions:

1. What is the authority?
2. What is the readable law?
3. What are the exhaustive scenarios?
4. What is the current gate status?

That maps to:

- authority -> `markdown-standards.md`
- readable law -> `markdown-editing-spec.md`
- exhaustive scenarios -> `editor-protocol-matrix.md`
- gate status -> `markdown-parity-matrix.md`
- evidence history -> `markdown-editing-reference-audit.md`

## Intake

This workflow covers both:

- defining new spec law for a new or newly formalized surface
- updating existing spec law when current docs, winners, or protocol rows are
  wrong or incomplete

Classify the request before editing:

1. Update to existing current feature behavior
2. New interaction class for an existing current feature
3. New current feature family or newly formalized current surface
4. Deferred or future feature
5. New authority / winner shift
6. Architecture-only spec question

Also classify the feature family:

- markdown-native syntax
- markdown mode architecture and note-linked navigation
- block-editor-native elements
- tables and linear document editing
- collaboration / editor-only
- styling / layout
- cross-surface interaction

Then decide whether the question is:

- evidence already sufficient
- research update needed
- architecture lane change
- pure law/protocol update

Also decide the best permanent home for the contract:

- `@platejs/core`
- existing shared package
- new shared package
- feature package
- app/render layer only

Do not default this decision from current file placement. Justify it from:

- long-term reuse
- performance cost
- rendering cost
- API clarity
- ownership boundaries
- likely future consumers

## Research Decision

Use the research layer before inventing new law.

Default to
[$research-wiki](.agents/skills/research-wiki/SKILL.md)
for choosing and running the right research mode.

### Use `research-maintain` when:

- the topic already exists in `docs/research`
- the lane probably just needs refresh, contradiction cleanup, or stronger
  compiled synthesis

### Use `research-full` when:

- the topic is broad or thinly covered
- raw evidence is missing or clearly stale
- the authority question is large enough that trusting the visible local slice
  would be reckless
- the surface is authority-sensitive and the relevant proof likely spans
  multiple corpora; in that case, do a **full corpus-level ingest** instead of
  a narrow spot check

The support docs are here:

- [full-pipeline.md](docs/research/commands/full-pipeline.md)
- [maintain.md](docs/research/commands/maintain.md)

Do not skip the research layer and jump straight from a raw source into law
unless the request is tiny and the evidence is already obvious.

Do not call something “full” if you only checked one editor when the surface
obviously spans Typora / Obsidian / Milkdown or other parallel corpora.

## Evidence Ladder

Use the hard ladder from
[markdown-editor-reference-audits-must-treat-silence-as-a-gap.md](docs/solutions/best-practices/markdown-editor-reference-audits-must-treat-silence-as-a-gap.md):

1. explicit reference docs or executable tests
2. compatible but indirect evidence
3. honest gap

When recording evidence, use:

- `agree`
- `partial`
- `gap`
- `tension`
- `diverge`

Never mark something `locked` because it feels standard.

## Node Model First

Before writing UX law, lock:

1. node model
2. affinity class when relevant

Use the model classes from
[editor-behavior-specs-must-lock-node-model-and-affinity-before-ux.md](docs/solutions/best-practices/editor-behavior-specs-must-lock-node-model-and-affinity-before-ux.md):

- `block non-void`
- `block void atom`
- `inline non-void span`
- `inline void atom`
- `leaf mark`
- `text token`
- `overlay / no node`

Affinity classes:

- `directional`
- `hard`
- `outward`
- `none / n-a`

Do not spec:

- hover
- click
- backlink
- toolbar behavior

until the model is explicit.

## Required Edit Order

Use this order unless the task is so small that a subset is obviously enough.

### 1. Standards

Patch [markdown-standards.md](docs/editor-behavior/markdown-standards.md) when:

- the winner map changes
- a new authority lane appears
- a family split is needed
- a stronger external reference replaces an older one
- routing guidance for a concrete surface changes, even if the final row law
  mostly stays the same

### 2. Readable Law

Patch [markdown-editing-spec.md](docs/editor-behavior/markdown-editing-spec.md) to define:

- the family-level behavior
- node model
- affinity
- ownership rules
- locked notes / exceptions

If the behavior includes editor chrome or navigation UI, also define the
interaction in a way that is compatible with the shadcn composition rules above
instead of leaving the UI contract hand-wavy.

If a research rerun proves that one coarse behavior was really multiple
sub-surfaces, split the readable law even when the final product choice for one
row does not change.

### 3. Protocol Rows

Patch [editor-protocol-matrix.md](docs/editor-behavior/editor-protocol-matrix.md) to enumerate:

- concrete scenarios
- authority per row
- spec IDs
- status

If a new surface really has different winners by scenario, split the rows. Do
not keep one coarse row that lies.

If the rerun only confirms the current rows are already right, say that
explicitly in the outcome. Do not silently skip the protocol layer and leave
readers guessing whether you forgot it or deliberately kept it unchanged.

### 4. Parity Gate

Patch [markdown-parity-matrix.md](docs/editor-behavior/markdown-parity-matrix.md) when:

- an existing current feature family changed
- the family authority map changed
- gate status changed
- the node model / affinity summary changed

Do not inflate the parity matrix for speculative future product ideas that are
not current Plate features.

If parity truly does not move, say so explicitly and explain why the changed
authority did not change the current-feature gate.

### 5. Roadmap

Patch [master-roadmap.md](docs/editor-behavior/master-roadmap.md) when:

- a new remaining implementation lane appears
- a pass creates deferred implementation work that should enter the queue
- the order of the real remaining implementation lanes changes
- a lane is narrowed into explicit next slices
- a lane is closed, re-cut, or split

Do not strand new implementation debt only in parity wording or isolated plan
docs.

### 6. Audit

Patch [markdown-editing-reference-audit.md](docs/editor-behavior/markdown-editing-reference-audit.md) only when:

- a new external reference disagreement matters
- the evidence history needs a new entrypoint
- a winner shift needs explicit audit history

Do not treat the audit as current law.

## When To Split A Family

Split a family or authority lane when one winner clearly cannot cover the whole
surface without lying.

Examples:

- Typora is right for markdown-native typing, but wrong as the sole owner of
  Obsidian-style note-linked navigation
- Google Docs is right for linear document outline jump, but wrong as the sole
  owner of markdown-workspace search chrome

If one row needs too many caveats, split it.

## Permanent-Home Test

For any new shared contract or cross-surface rule, ask:

1. What is the best permanent home if we were designing this cleanly today?
2. Which home minimizes repeated feature-local reimplementation?
3. Which home keeps package ownership coherent?
4. Which home gives the best performance characteristics?
5. Which home gives the best DX and API discoverability for future agents and humans?

If that answer differs from the current package layout, the spec should say so.
Do not let current file placement bully the long-term design.

## Current Feature vs Deferred Feature

### Current feature / current surface

Update all of:

- standards
- readable law
- protocol rows
- parity when the gate changed

This applies whether you are:

- correcting old law for an existing feature
- adding a newly defined interaction to an existing feature
- formalizing a current feature family that existed in product code but not in
  the spec stack

### Deferred or future surface

Usually update:

- standards if a new lane is needed
- readable law if the contract must exist now
- protocol rows as `deferred` or `specified`

Do not pretend it is release-gated current behavior if it is not.

## No-Change Discipline

Sometimes a rerun changes the research picture without changing every
editor-behavior layer.

That is fine, but only if you make it explicit.

For each of:

- standards
- readable law
- protocol rows
- parity
- roadmap
- audit

either:

- patch the file
- or state why it stayed unchanged

Do not leave that implicit.

## Required Output

For any meaningful editor-spec pass, return:

- authority decision
- files updated
- what changed in the winner map or law
- whether parity changed
- whether audit history changed
- what still lacks evidence

## Verification

### Docs-only spec work

Minimum:

- read back the changed sections
- check for contradictions across standards/spec/protocol/parity/audit
- confirm links and terminology match

### Code-changing spec work

Also run the normal repo verification gates:

- targeted tests first
- build before typecheck
- `lint:fix`
- browser verification when a browser surface changed

## Blunt Rules

- Do not invent standards because a behavior looks familiar.
- Do not let one strong reference bully unrelated surfaces it does not own.
- Do not leave node model implicit.
- Do not update only one layer of the stack when the authority actually changed.
- If the real answer is “we need a new family / authority lane,” say it and do it.
