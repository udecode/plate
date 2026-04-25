# Math Delimiter Trigger Implementation Plan

## Status

Executed for the default rich-mode slice.

Closed result:

- explicit-completion inline conversion for completed `$...$`
- `$$` + `Enter` block promotion
- selection-wrap stays deferred / non-default
- empty-selection opening-delimiter pair-on-type stays deferred / non-default

Why the deferred branch stayed deferred:

- `$` and `$$` already share one symbol family in the rich editor
- adding `$` selection-wrap as a default rich-mode branch increases collision
  and ambiguity pressure instead of reducing it
- the Obsidian-style conservative selection-wrap branch fits better as a
  markdown/source-first profile decision than as a default rich-editor rule

## Task

Implement the deferred math delimiter trigger lane for Plate's markdown-first
profile:

- `$` selection-wrap over an existing selection
- completed `$...$` rich-mode conversion on explicit closing delimiter
- `$$` block trigger / block detection
- the ownership boundary for `$$` plus `Enter` promotion

## Problem Frame

Plate already supports math in three separate ways:

1. markdown parse/serialize via `remark-math`
2. explicit insertion transforms via `insertInlineEquation` and
   `insertEquation`
3. editor UI entry via toolbar and slash command

What it does **not** support is markdown-sensitive typing triggers for `$` and
`$$`.

That gap now has real law and protocol rows, so leaving it as “later” is no
longer honest. The implementation work is also cross-cutting enough that it
needs one full plan instead of another roadmap placeholder.

## Source Of Truth

### Readable Law

- [markdown-editing-spec.md](docs/editor-behavior/markdown-editing-spec.md)
  - `EDIT-PROFILE-MATH-TRIGGER-001`
  - `EDIT-PROFILE-MATH-TRIGGER-002`
  - `EDIT-PROFILE-MATH-TRIGGER-003`

### Protocol Rows

- [editor-protocol-matrix.md](docs/editor-behavior/editor-protocol-matrix.md)
  - `EDIT-PROFILE-MATH-TRIGGER-001`
  - `EDIT-PROFILE-MATH-TRIGGER-002`
  - `EDIT-PROFILE-MATH-TRIGGER-003`

### Research / Learnings

- [math-delimiter-trigger-audits-must-split-selection-wrap-pair-on-type-and-block-detection.md](docs/solutions/best-practices/math-delimiter-trigger-audits-must-split-selection-wrap-pair-on-type-and-block-detection.md)
- [math-delimiter-trigger-authority.md](docs/research/open-questions/math-delimiter-trigger-authority.md)
- [math-delimiters-and-pair-settings.md](docs/research/sources/obsidian/math-delimiters-and-pair-settings.md)
- [2026-04-09-editor-spec-math-delimiter-triggers.md](docs/plans/2026-04-09-editor-spec-math-delimiter-triggers.md)

## Repo Grounding

### Existing math runtime

- shared node plugins:
  - [BaseInlineEquationPlugin.ts](packages/math/src/lib/BaseInlineEquationPlugin.ts)
  - [BaseEquationPlugin.ts](packages/math/src/lib/BaseEquationPlugin.ts)
- explicit transforms:
  - [insertInlineEquation.ts](packages/math/src/lib/transforms/insertInlineEquation.ts)
  - [insertEquation.ts](packages/math/src/lib/transforms/insertEquation.ts)
- existing math tests:
  - [insertInlineEquation.spec.ts](packages/math/src/lib/transforms/insertInlineEquation.spec.ts)
  - [insertEquation.spec.ts](packages/math/src/lib/transforms/insertEquation.spec.ts)
  - [BaseInlineEquationPlugin.spec.ts](packages/math/src/lib/BaseInlineEquationPlugin.spec.ts)
  - [BaseEquationPlugin.spec.ts](packages/math/src/lib/BaseEquationPlugin.spec.ts)
  - [useEquationInput.ts](packages/math/src/react/hooks/useEquationInput.ts)

### Existing app/editor entry surfaces

- kits:
  - [math-base-kit.tsx](apps/www/src/registry/components/editor/plugins/math-base-kit.tsx)
  - [math-kit.tsx](apps/www/src/registry/components/editor/plugins/math-kit.tsx)
- explicit insert maps:
  - [transforms.ts](apps/www/src/registry/components/editor/transforms.ts)
  - [transforms-classic.ts](apps/www/src/registry/components/editor/transforms-classic.ts)
- UI docs/demo:
  - [equation.mdx](<content/(plugins)/(elements)/equation.mdx>)
  - [equation-toolbar-button.tsx](apps/www/src/registry/ui/equation-toolbar-button.tsx)

### Existing parser proof

- markdown parse already supports math nodes through `remark-math`:
  - [deserializeMdParagraphs.spec.tsx](apps/www/src/__tests__/package-integration/markdown-deserializer/deserializeMdParagraphs.spec.tsx)

## Requirements

1. Implement the three spec rows as separate runtime surfaces, not one blended
   “math trigger” mechanic.
2. Keep the behavior in shared math/input infrastructure, not app-only toolbar
   code.
3. Preserve explicit insertion, toolbar, slash command, and parser behavior.
4. Keep selection-wrap, empty-selection pair-on-type, and block-trigger logic
   independently testable.
5. Make the `$$` plus `Enter` ownership decision explicit instead of burying it
   in vague future work.
6. Do not silently assume Row 001 ships in the first pass just because the spec
   names it. It needs an explicit product decision because current Plate has not
   previously shipped `$` selection-wrap typing behavior.

## Non-Goals

- Rewriting math rendering, KaTeX output, or equation node UI
- Changing markdown parse/serialize semantics for math nodes
- Solving general auto-pair policy for every markdown symbol
- Reopening autoformat as the host for math triggers
- Shipping a full profile engine rewrite

## Decision Summary

### 1. Host the trigger surface in shared `@platejs/autoformat` input rules

Reason:

- the spec explicitly says this belongs in shared input infrastructure
- the runtime needs both `insertText` and `insertBreak`, not a math-only plugin
- a shared autoformat-owned input-rule lane lets `MathKit` compose with the
  existing autoformat engine instead of carrying another editor override

Recommended file additions:

- [autoformatMathInput.ts](packages/autoformat/src/lib/rules/math/autoformatMathInput.ts)
- one helper path under `packages/autoformat/src/lib/rules/math/` for pure
  trigger parsing / matching logic

### 2. Implement the three trigger rows as distinct handlers

- **Row 001**: expanded selection + `$`
  - conservative selection-wrap is a real spec candidate, but it is not backed
    by prior Plate shipped typing behavior
  - treat it as an approval-gated branch, not an automatic first-pass commit
- **Row 002**: collapsed selection + `$`
  - convert a completed `$...$` run on the closing delimiter in default rich
    mode
- **Row 003**: `$$` block trigger
  - treat the line-shaped `$$` trigger and `$$` plus `Enter` promotion as
    separate branches even if they share helpers

### 3. Ship Row 001 only after an explicit product decision

Reason:

- the readable law names it as a `deviation`, not a previously shipped Plate
  contract
- current repo behavior only proves explicit selection-to-inline-equation via
  [insertInlineEquation.ts](packages/math/src/lib/transforms/insertInlineEquation.ts),
  toolbar, and slash insertion
- repo search shows no existing typing-trigger implementation for selection-wrap
  `$`

Default posture:

- plan and test Row 001
- do not ship it in the first pass unless explicitly approved

### 4. Ship `$$` plus `Enter` as a second implementation slice inside the same lane

Reason:

- it touches `insertBreak` / block-owner behavior, not just `insertText`
- it is the highest-risk branch and easiest place to get a fake-green result
- we should still plan it now, but not let it muddy the simpler `$` surfaces

That means:

- Slice A0: product decision checkpoint for Row 001 selection-wrap
- Slice A1: completed inline `$...$` rich-mode conversion
- Slice B: block trigger / promotion
- Slice C: Row 001 selection-wrap only if approved

All slices stay inside the same lane and plan. Slice C is optional until the
selection-wrap branch is explicitly approved.

## Recommended Implementation Units

### Unit 1: Characterization Coverage

Add tests that prove the current absence of trigger behavior and the current
fallback insertion semantics before changing runtime.

Primary files:

- new package tests under `packages/math/src/lib/`
- new app integration tests under
  `apps/www/src/__tests__/package-integration/math/`

### Unit 2: Shared Trigger Helpers

Create pure helpers for:

- detecting expanded-selection `$`
- detecting completed inline `$...$`
- detecting line-shaped `$$`
- deciding whether the current math-trigger option set allows the branch

Recommended new files:

- `packages/math/src/lib/triggers/shouldWrapMathSelection.ts`
- `packages/math/src/lib/triggers/shouldPairInlineMath.ts`
- `packages/math/src/lib/triggers/shouldPromoteBlockMath.ts`
- `packages/math/src/lib/triggers/index.ts`

### Unit 3: Shared Trigger Plugin

Add one shared autoformat-owned input-rule path that handles both `insertText`
and `insertBreak` for the math-trigger surface.

Primary files:

- `packages/autoformat/src/lib/AutoformatPlugin.ts`
- `packages/autoformat/src/lib/types.ts`
- `packages/autoformat/src/lib/rules/math/autoformatMathInput.ts`
- `packages/autoformat/src/lib/rules/math/index.ts`

Responsibilities:

- route `$` and `$$` trigger handling
- insert inline and block equation nodes directly through the editor
- preserve literal text when the trigger does not match
- keep behavior configurable, not silently global

### Unit 4: Kit Wiring

Wire the shared trigger plugin into the app kits that should expose the
markdown-first math-trigger surface.

Primary files:

- [math-base-kit.tsx](apps/www/src/registry/components/editor/plugins/math-base-kit.tsx)
- [math-kit.tsx](apps/www/src/registry/components/editor/plugins/math-kit.tsx)
- possibly [editor-kit.tsx](apps/www/src/registry/components/editor/editor-kit.tsx)
  or the specific demo/editor composition that should demonstrate the feature

Decision to encode:

- whether math triggers are on by default in the markdown-first demo/editor
- or only enabled in a dedicated math-aware kit configuration

### Unit 5: Docs And Product Contract

Update math docs so typing triggers are described as a real optional surface,
separate from explicit insert buttons and parser support.

Primary files:

- [equation.mdx](<content/(plugins)/(elements)/equation.mdx>)
- [markdown.mdx](<content/(plugins)/(serializing)/markdown.mdx>)
- roadmap / parity / spec docs only if implementation changes the ownership
  story or closes the deferred row status

## Test Plan

### Package tests

Add:

- `packages/autoformat/src/lib/rules/math/autoformatMathInput.spec.tsx`

Scenarios:

1. Expanded selection + `$` creates one inline equation node with the selected
   text as `texExpression`
2. Expanded selection + `$` leaves text literal when the trigger surface is
   disabled
3. Completed `$...$` converts on the closing delimiter when enabled
4. First `$` stays literal instead of committing on the opening delimiter
5. `$$` line-shaped trigger detection does not fire inside existing code or
   incompatible contexts
6. `$$` plus `Enter` promotion only fires in the allowed branch
7. Trigger helpers never swallow unrelated `$` text in plain typing paths

### Existing math transform tests to keep green

- [insertInlineEquation.spec.ts](packages/math/src/lib/transforms/insertInlineEquation.spec.ts)
- [insertEquation.spec.ts](packages/math/src/lib/transforms/insertEquation.spec.ts)
- [BaseInlineEquationPlugin.spec.ts](packages/math/src/lib/BaseInlineEquationPlugin.spec.ts)
- [BaseEquationPlugin.spec.ts](packages/math/src/lib/BaseEquationPlugin.spec.ts)

### App integration tests

Add:

- `apps/www/src/__tests__/package-integration/math/math-delimiter-trigger.slow.tsx`

Scenarios:

1. In a markdown-first editor, selecting text and typing `$` still stays
   deferred by default
2. In a markdown-first editor, completed `$...$` converts on the closing
   delimiter
3. In a markdown-first editor, typing `$$` then `Enter` promotes to block math
   if Slice B ships
4. In code blocks or other excluded contexts, the same input stays literal
5. Toolbar/slash insertion still works after trigger plugin wiring

### Browser verification

Verify on the real docs/demo surface with `dev-browser`:

- open the equation demo/docs page
- confirm selection-wrap works
- confirm pair-on-type works when enabled
- confirm literal fallback still works in excluded contexts
- confirm the docs copy matches the shipped trigger boundary

## Sequencing

1. Add characterization and package trigger-helper tests
2. Add one explicit decision checkpoint for Row 001 selection-wrap
3. Implement shared trigger helpers
4. Add the shared trigger plugin for explicit-completion inline conversion
5. Wire the plugin into the math kits and app integration tests
6. Decide and implement Slice B for `$$` plus `Enter`
7. Only then implement Row 001 selection-wrap if approved
8. Update docs and then refresh roadmap/parity/spec status if the row is no
   longer deferred

## Risks

### Risk 1: Accidental generic auto-pair behavior

If the trigger plugin is too broad, `$` starts acting like a normal quote pair
everywhere.

Mitigation:

- keep math-trigger enablement explicit
- test literal fallback aggressively

### Risk 2: `$$` promotion fights normal block ownership

The `Enter` path is structurally different from `insertText`.

Mitigation:

- keep it in Slice B
- test it through real block-owner behavior, not only helper mocks

### Risk 3: Trigger-created inline equation focus is awkward

Inline equation nodes can open editing UI or shift focus unexpectedly.

Mitigation:

- include [useEquationInput.ts](packages/math/src/react/hooks/useEquationInput.ts)
  in the verification surface
- test keyboard/focus continuity after insertion

## Acceptance Criteria

1. The repo has one explicit shared trigger host for math delimiter behavior.
2. `EDIT-PROFILE-MATH-TRIGGER-002` and `003` are implemented and tested for the
   default rich mode.
3. `EDIT-PROFILE-MATH-TRIGGER-001` remains explicitly approval-gated instead of
   being silently assumed.
4. The app kits no longer rely only on toolbar/slash insertion for the planned
   math-trigger surface.
5. Public docs distinguish parser support, explicit insert APIs, and typing
   triggers.
6. Roadmap and parity wording stay honest about what shipped.
