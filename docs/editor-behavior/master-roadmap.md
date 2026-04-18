---
date: 2026-04-10
topic: editor-behavior-master-roadmap
---

# Editor Behavior Master Roadmap

## Purpose

Canonical implementation sequence for `docs/editor-behavior`.

This file owns:

- remaining lane order
- lane entry / exit conditions
- operator handoff
- roadmap vocabulary

It does **not** own:

- current law truth
- current gate wording
- evidence history
- architecture rationale
- isolated feature-plan detail

Use it with:

- [README.md](docs/editor-behavior/README.md)
- [markdown-standards.md](docs/editor-behavior/markdown-standards.md)
- [markdown-editing-spec.md](docs/editor-behavior/markdown-editing-spec.md)
- [editor-protocol-matrix.md](docs/editor-behavior/editor-protocol-matrix.md)
- [markdown-parity-matrix.md](docs/editor-behavior/markdown-parity-matrix.md)
- [markdown-editing-reference-audit.md](docs/editor-behavior/markdown-editing-reference-audit.md)
- [editor-behavior-architecture.md](docs/research/systems/editor-behavior-architecture.md)
- [2026-04-02-editor-behavior-major-execution.md](docs/plans/2026-04-02-editor-behavior-major-execution.md)
- [2026-04-10-autoformat-runtime-alignment-and-extension-plan.md](docs/plans/2026-04-10-autoformat-runtime-alignment-and-extension-plan.md)
- [2026-04-09-date-media-expansion-consensus-plan.md](docs/plans/2026-04-09-date-media-expansion-consensus-plan.md)

## Vocabulary

| Term                    | Roadmap meaning                                                               |
| ----------------------- | ----------------------------------------------------------------------------- |
| `closed major`          | the earlier existing-feature major gate is no longer the live execution queue |
| `lane`                  | one remaining implementation program, possibly still too broad for one batch  |
| `slice`                 | one concrete next execution chunk inside a lane                               |
| `feature-gap follow-up` | real implementation work that exists after law is already written             |
| `todo`                  | active approved queue item                                                    |
| `backlog`               | deferred item that needs user approval before it re-enters the active queue   |

Rule:

- parity may still describe feature gaps, but this file owns the actual
  implementation sequence
- historical batch names survive only in execution notes, not as roadmap
  control terms

## Truth Ownership

| Class                    | Owner                                                                                                                                                                                                                       |
| ------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| law                      | [markdown-editing-spec.md](docs/editor-behavior/markdown-editing-spec.md), [editor-protocol-matrix.md](docs/editor-behavior/editor-protocol-matrix.md), [markdown-standards.md](docs/editor-behavior/markdown-standards.md) |
| gate                     | [markdown-parity-matrix.md](docs/editor-behavior/markdown-parity-matrix.md)                                                                                                                                                 |
| evidence                 | [markdown-editing-reference-audit.md](docs/editor-behavior/markdown-editing-reference-audit.md) and [docs/research](docs/research)                                                                                          |
| sequence                 | this file and [docs/editor-behavior/commands](docs/editor-behavior/commands/README.md)                                                                                                                                      |
| historical execution     | [2026-04-02-editor-behavior-major-execution.md](docs/plans/2026-04-02-editor-behavior-major-execution.md)                                                                                                                   |
| supporting feature plans | the relevant docs under [docs/plans](docs/plans)                                                                                                                                                                            |

## Current Read

- the old major-release closure is real and stays historical
- current law / parity truth is already good enough for the closed existing
  feature matrix
- the remaining honest work is implementation follow-up, not more fake
  markdown-native contract recovery
- active markdown-feature todos are now closed; remaining work sits in the
  approval-gated backlog unless a new lane is promoted
- approval-gated backlog is:
  - toggle rewrite
  - search / find-replace
  - collaboration/editor-only work
  - streaming follow-up
  - link input / autolink policy rewrite

## Historical Closure

### [x] Existing-Feature Major Closure

This stays closed:

- markdown-native core behavior
- existing-feature matrix closure for:
  - blockquote
  - list
  - heading
  - code block
  - table core behavior
  - indentation ownership
  - callout reset / soft-break behavior
  - mention / date / TOC boundary behavior
  - columns package-surface round-trip
  - media / caption package-surface behavior

What this means:

- [2026-04-02-editor-behavior-major-execution.md](docs/plans/2026-04-02-editor-behavior-major-execution.md)
  is historical execution context, not the live queue
- later work must justify itself as a new lane or follow-up slice, not as
  reopening the old major by inertia

### [x] Autoformat Runtime Alignment And Extension

This lane is now closed as its own queue item.

What closed:

- shared package-owned rule families are explicit for:
  - heading shorthand
  - inline mark autoformat
  - text substitution
- explicit app-owned current-kit behavior is now locked for:
  - blockquote wrap
  - list and condensed todo shorthand
  - code-block gating
  - immediate code-fence promotion
  - immediate HR insertion
- link automd stays outside the plain autoformat family
- Enter-owned normalization follow-up for code-fence or HR no longer blocks the
  autoformat lane itself; it belongs to a neighboring input-rule lane if it is
  ever picked up

Supporting plan:

- [2026-04-10-autoformat-runtime-alignment-and-extension-plan.md](docs/plans/2026-04-10-autoformat-runtime-alignment-and-extension-plan.md)
- [2026-04-10-autoformat-runtime-alignment-execution.md](docs/plans/2026-04-10-autoformat-runtime-alignment-execution.md)

### [x] Math Delimiter Trigger Lane

This lane is now closed for the default rich-mode contract.

What closed:

- explicit-completion inline conversion for completed `$...$`
- `$$` + `Enter` block promotion
- explicit ownership split for the shipped rich-mode slice:
  - shared autoformat-owned input rules own the shipped runtime
  - empty-selection opening-delimiter pair-on-type stays out of the default
    contract
  - selection-wrap stays deferred / non-default because `$` / `$$` collisions
    make it a poor rich-editor default and the Obsidian-style branch fits
    better in a markdown/source-first profile

Supporting plan:

- [2026-04-10-math-delimiter-trigger-implementation-plan.md](docs/plans/2026-04-10-math-delimiter-trigger-implementation-plan.md)
- [2026-04-10-math-delimiter-trigger-roadmap-slice.md](docs/plans/2026-04-10-math-delimiter-trigger-roadmap-slice.md)

### [x] Date Contract Expansion

This lane is now closed for the current date contract.

What closed:

- canonical `YYYY-MM-DD` node values are the shipped contract
- markdown writes canonical dates as `<date value="YYYY-MM-DD" />`
- legacy child-text dates are accepted on read for compatibility
- non-normalizable legacy child text stays on a raw fallback path
- heavier serialized date semantics remain deferred instead of sitting in the
  active queue as fake near-term work

Supporting plans:

- [2026-04-09-date-media-expansion-consensus-plan.md](docs/plans/2026-04-09-date-media-expansion-consensus-plan.md)
- [2026-04-10-date-contract-expansion-lane-closeout-plan.md](docs/plans/2026-04-10-date-contract-expansion-lane-closeout-plan.md)

### [x] Media / Embed Expansion

This lane is now closed for the current media/embed contract.

What closed:

- normalized embed metadata is the shipped contract:
  - canonical render `url`
  - current `provider`
  - current `id`
  - optional `sourceUrl` for edit reversibility
- markdown / MDX round-trip already preserves the current media/embed
  attributes
- arbitrary script embeds and PDF iframe support remain outside the contract
- broader authoring/path-policy expansion is future work, not active queue work

### [x] Link Automd Conversion Lane

This lane is now closed for the current narrow source-entry conversion slice.

What closed:

- typing `[text](url` and closing with `)` converts to a structured inline link
  span in the current rich-mode kits
- the runtime host is the shared `AutoformatPlugin` input-rule lane
- link-owned URL validation and node construction stay in `@platejs/link`
- the shipped slice stays narrow and does not claim nested markdown-link
  grammar, titles, or broader source-entry expansion

Supporting plan:

- [2026-04-11-link-automd-autoformat-plan.md](docs/plans/2026-04-11-link-automd-autoformat-plan.md)

## Todos

## Backlog

Backlog items are deferred and need user approval before they move back into
the active todo queue.

### [ ] Lane 1: Toggle Rewrite

Goal:

- replace the deferred toggle lane with a coherent block/container contract

Exit:

- new toggle model is implemented
- `Enter` / `Backspace` / `Tab` law is reconciled
- deferred wording is retired or narrowed honestly

### [ ] Lane 5: Search / Find-Replace Product Lane

Goal:

- implement the already-specified editor-wide search surface as a real product
  lane after the markdown-feature lanes stop leading the queue

Includes:

- current-file search
- seeded search from selection
- find next / previous
- replace
- search-target navigation feedback
- outline header search

Exit:

- one real execution plan exists for the lane
- runtime work lands with verification
- parity/backlog wording updates if scope changes

### [ ] Lane 6: Collaboration / Editor-Only Work

Goal:

- close the product/policy-heavy collaboration lane without pretending it is a
  hidden core-runtime bug bucket

Includes:

- discussion
- yjs / collaboration overlays
- any remaining review-flow hardening after comment/suggestion

Exit:

- one honest implementation batch is complete or the lane is explicitly
  narrowed again

### [ ] Lane 7: Streaming Follow-Up

Goal:

- handle streaming only when an active lane regresses it or materially needs it

Exit:

- not a proactive queue by itself
- only pulled forward by named need from another lane

### [ ] Lane 9: Link Input / Autolink Policy Rewrite

Goal:

- split plain URL autolink input assist from base link semantics
- reconcile paste, space, `Enter`, and markdown source-entry boundaries under
  one coherent policy model

Exit:

- base link semantics no longer own typing/paste autolink behavior
- a dedicated link input surface owns plain URL autolink behavior
- protocol and docs stop conflating plain autolink literal behavior with link
  automd source-entry conversion

Supporting plan:

- [2026-04-11-link-input-autolink-policy-rewrite-plan.md](docs/plans/2026-04-11-link-input-autolink-policy-rewrite-plan.md)

## Batch Exit Rule

After any lane changes implementation truth:

1. refresh [master-roadmap.md](docs/editor-behavior/master-roadmap.md)
2. refresh [markdown-parity-matrix.md](docs/editor-behavior/markdown-parity-matrix.md) if backlog or gate wording changed
3. refresh [markdown-editing-spec.md](docs/editor-behavior/markdown-editing-spec.md) if law changed
4. refresh [editor-protocol-matrix.md](docs/editor-behavior/editor-protocol-matrix.md) if row coverage changed
5. refresh [markdown-editing-reference-audit.md](docs/editor-behavior/markdown-editing-reference-audit.md) if evidence routing changed
6. refresh any touched supporting plan docs
7. refresh the historical execution note only when the lane materially changed what remains

## Command Pack

- [reconsolidate-law-stack.md](docs/editor-behavior/commands/reconsolidate-law-stack.md)
- [refresh-evidence-ledger.md](docs/editor-behavior/commands/refresh-evidence-ledger.md)
- [reinterview-open-authority-gaps.md](docs/editor-behavior/commands/reinterview-open-authority-gaps.md)
- [replan-next-batch.md](docs/editor-behavior/commands/replan-next-batch.md)
- [launch-next-ralph-batch.md](docs/editor-behavior/commands/launch-next-ralph-batch.md)

## Triage Rule For `editor-spec`

When `editor-spec` formalizes or revises a surface and that change creates real
remaining implementation work, it must triage the item into this roadmap.

That means:

- add a new lane when the work is broad and enduring
- add a new slice to an existing lane when the work is clearly subordinate
- update ordering if the new work should move above or below existing lanes
- do not leave new implementation debt stranded only in parity wording or one
  feature plan

## Next Move

Current next move:

- Lane 2 is the current approved todo if the next remaining priority is
  markdown-sensitive input-trigger behavior
- Lane 3 or Lane 4 stay in the active todo queue after that
- Lane 1 and Lanes 5-7 and 9 are backlog and need user approval before re-entry

The current highest-quality concrete supporting plan is still:

- [2026-04-10-autoformat-runtime-alignment-and-extension-plan.md](docs/plans/2026-04-10-autoformat-runtime-alignment-and-extension-plan.md)
