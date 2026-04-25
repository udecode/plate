# Editor Behavior Implementation Roadmap

## Purpose

This is the canonical remaining implementation roadmap for
`docs/editor-behavior`.

Use this when you want the actual execution queue, not just:

- spec law
- parity gate wording
- historical execution notes
- one isolated feature plan

This doc should answer:

1. what is already done
2. what remains to implement
3. what order to do it in
4. which supporting plan owns each lane

## Source Of Truth Inputs

- current law stack:
  - [markdown-standards.md](docs/editor-behavior/markdown-standards.md)
  - [markdown-editing-spec.md](docs/editor-behavior/markdown-editing-spec.md)
  - [editor-protocol-matrix.md](docs/editor-behavior/editor-protocol-matrix.md)
  - [markdown-parity-matrix.md](docs/editor-behavior/markdown-parity-matrix.md)
  - [markdown-editing-reference-audit.md](docs/editor-behavior/markdown-editing-reference-audit.md)
- historical execution note:
  - [2026-04-02-editor-behavior-major-execution.md](docs/plans/2026-04-02-editor-behavior-major-execution.md)
- feature-specific execution plans:
  - [2026-04-10-autoformat-runtime-alignment-and-extension-plan.md](docs/plans/2026-04-10-autoformat-runtime-alignment-and-extension-plan.md)
  - [2026-04-09-date-media-expansion-consensus-plan.md](docs/plans/2026-04-09-date-media-expansion-consensus-plan.md)

## What Is Already Closed

These lanes are not the remaining roadmap:

- markdown-native core behavior
- main existing-feature matrix closure for:
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
- autoformat runtime alignment and extension:
  - shared package-owned heading shorthand
  - shared package-owned inline mark autoformat
  - shared package-owned text substitution
  - explicit app-owned blockquote, list/todo, code-fence, HR, and code-block
    gating behavior
  - explicit separation from link automd and neighboring Enter-owned lanes

That work is historical and should stay in
[2026-04-02-editor-behavior-major-execution.md](docs/plans/2026-04-02-editor-behavior-major-execution.md),
not be reopened by accident.

## Remaining Roadmap Order

This is the actual remaining implementation queue.

## Todos

These markdown-feature lanes are now closed again in the canonical roadmap.

### 8. Link Automd Conversion Lane

Status:

- closed for the current narrow typed conversion slice

Supporting plan:

- [2026-04-11-link-automd-autoformat-plan.md](docs/plans/2026-04-11-link-automd-autoformat-plan.md)

Closed scope:

- `[text](url)` source-entry conversion on closing `)`
- shared autoformat input-rule hosting
- link-owned validation and node construction
- explicit first-slice boundary for unsupported markdown-link variants

### 2. Math Delimiter Trigger Lane

Status:

- closed for the default rich-mode contract

Supporting plans:

- [2026-04-10-math-delimiter-trigger-implementation-plan.md](docs/plans/2026-04-10-math-delimiter-trigger-implementation-plan.md)
- [2026-04-10-math-delimiter-trigger-roadmap-slice.md](docs/plans/2026-04-10-math-delimiter-trigger-roadmap-slice.md)

Closed scope:

- explicit-closing `$...$` conversion
- `$$` + `Enter` block promotion
- explicit defer for selection-wrap and empty-selection opening-delimiter
  pairing in the default rich editor

### 3. Date Contract Expansion

Status:

- closed by the current narrow contract; no longer an active implementation
  queue item

Supporting plans:

- [2026-04-09-date-media-expansion-consensus-plan.md](docs/plans/2026-04-09-date-media-expansion-consensus-plan.md)
- [2026-04-10-date-contract-expansion-lane-closeout-plan.md](docs/plans/2026-04-10-date-contract-expansion-lane-closeout-plan.md)

Closed scope:

- canonical `YYYY-MM-DD` date payload
- canonical `<date value="...\" />` markdown write shape
- legacy child-text read compatibility

Deferred beyond the closed lane:

- richer date payload semantics beyond the current canonical contract

### 4. Media / Embed Expansion

Status:

- closed for the current normalized media/embed contract; no longer an active
  implementation queue item

Supporting plans and decisions:

- [2026-04-09-date-media-expansion-consensus-plan.md](docs/plans/2026-04-09-date-media-expansion-consensus-plan.md)
- [media-authoring-follows-the-image-path-policy-family.md](docs/research/decisions/media-authoring-follows-the-image-path-policy-family.md)

Closed scope:

- normalized embed metadata (`url`, `provider`, `id`, optional `sourceUrl`)
- allowlisted snippet extraction
- explicit no-support boundary for arbitrary script embeds and PDF iframe
  support

Deferred beyond the closed lane:

- broader authoring/path-policy expansion beyond the current contract

## Backlog

These items are deferred and need user approval before they move back into the
active todo queue.

### 1. Toggle Rewrite Lane

Why first:

- explicitly deferred from the earlier major closure
- needs a rewrite, not another incremental patch

Includes:

- block model / ownership cleanup
- `Enter`, `Backspace`, and `Tab` behavior rewrite
- protocol and parity reconsolidation after the rewrite

### 5. Search / Find-Replace Product Lane

Why fifth:

- it is still a real cross-surface user-facing editor lane
- but markdown-feature work now takes priority ahead of it

Includes:

- current-file search
- seeded search from selection
- find next / previous
- replace
- search-target navigation feedback
- outline header search

Execution status:

- law exists
- product/runtime implementation is still deferred

### 6. Collaboration / Editor-Only Lane

Why sixth:

- current package/test coverage is decent for comment/suggestion mechanics
- the remaining work is product/policy heavy rather than hidden core bugs

Includes:

- discussion
- yjs / collaboration overlays
- any remaining review-flow hardening that still matters after comment /
  suggestion package coverage

### 7. Streaming Follow-Up

Why last:

- not a proactive queue on its own
- only worth pulling forward when one of the active lanes regresses it or needs
  it

### 9. Link Input / Autolink Policy Rewrite

Why ninth:

- current runtime performance is already acceptable
- the remaining debt is architecture and product-law clarity around paste,
  typing-boundary autolink, and markdown source-entry interaction

Includes:

- split plain URL autolink input assist from base link semantics
- unify paste and typing autolink policy under one surface
- keep markdown source-entry conversion separate from plain autolink literal
  behavior
- replace the current option sprawl with one coherent input-policy model

Supporting plan:

- [2026-04-11-link-input-autolink-policy-rewrite-plan.md](docs/plans/2026-04-11-link-input-autolink-policy-rewrite-plan.md)

## Not A Roadmap Item By Default

These should not silently jump the queue:

- fresh markdown-native feature ideas
- toolbar/slash-menu polish without behavior impact
- browser chrome work with no editor-behavior consequence
- speculative multi-profile emulation

## Batch Selection Rule

When using
[replan-next-batch.md](docs/editor-behavior/commands/replan-next-batch.md),
pick the next concrete slice from this roadmap, not from vibes.

That means:

- choose the highest-priority todo whose authority is already clear
- if the lane has a supporting plan, use that plan
- if the lane is still too broad, pick the next named slice inside it
- do not pull from backlog without explicit user approval

## Operator Mapping

- historical execution trail:
  [2026-04-02-editor-behavior-major-execution.md](docs/plans/2026-04-02-editor-behavior-major-execution.md)
- actual remaining roadmap:
  [2026-04-10-editor-behavior-implementation-roadmap.md](docs/plans/2026-04-10-editor-behavior-implementation-roadmap.md)
- next-batch selector:
  [replan-next-batch.md](docs/editor-behavior/commands/replan-next-batch.md)
- execution launcher:
  [launch-next-ralph-batch.md](docs/editor-behavior/commands/launch-next-ralph-batch.md)
