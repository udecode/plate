# Link Input / Autolink Policy Rewrite Plan

## Status

Proposed.

## Goal

Replace the current mixed link input behavior with a coherent, explicit, and
profile-friendly design for:

- plain URL autolink on typing boundary
- plain URL autolink on paste
- markdown link source entry staying literal until explicit completion

## Harsh Assessment

### What is good today

- performance is already fine
- current hot paths stay local to the current selection and nearby text
- there is no whole-document markdown parse or global scan in the link input
  path
- the new paste guard for unfinished `[text](...)` source entry fixes a real UX
  bug without adding expensive machinery

### What is not good today

- the behavior model is muddy
- `BaseLinkPlugin` currently mixes:
  - link node semantics
  - URL validation
  - typing-boundary autolink
  - paste autolink
  - policy callbacks for profile-like behavior
- the current option surface is drifting into callback soup:
  - `rangeBeforeOptions`
  - `keepSelectedTextOnPaste`
  - `getUrlHref`
  - `shouldAutoLinkPaste`
  - plus `linkAutomdInputRule` living as a neighboring but separate source-entry
    lane
- current law already says source-preserving conversion should keep incomplete
  source literal, but the runtime still gets there through scattered local
  heuristics instead of one explicit policy model

### Bottom line

- performance: good enough
- standard / product model: not the best
- API design: not the best

If Plate wants the best long-term design, this should be a breaking cleanup,
not another local callback.

## Current Ground Truth

Current implementation:

- [withLink.ts](packages/link/src/lib/withLink.ts)
- [BaseLinkPlugin.ts](packages/link/src/lib/BaseLinkPlugin.ts)
- [withLink.spec.tsx](packages/link/src/lib/withLink.spec.tsx)
- [linkAutomdInputRule.ts](packages/link/src/lib/automd/linkAutomdInputRule.ts)

Current law and evidence:

- [markdown-editing-spec.md](docs/editor-behavior/markdown-editing-spec.md)
- [editor-protocol-matrix.md](docs/editor-behavior/editor-protocol-matrix.md)
- [link-automd-belongs-to-the-link-interaction-lane.md](docs/research/decisions/link-automd-belongs-to-the-link-interaction-lane.md)
- [2026-03-28-link-validation-must-not-treat-double-slash-as-internal-path.md](docs/solutions/logic-errors/2026-03-28-link-validation-must-not-treat-double-slash-as-internal-path.md)
- [2026-03-29-custom-isurl-must-be-able-to-reject-internal-link-shortcuts.md](docs/solutions/logic-errors/2026-03-29-custom-isurl-must-be-able-to-reject-internal-link-shortcuts.md)
- [2026-04-11-link-paste-autolink-must-stay-literal-inside-markdown-source-entry.md](docs/solutions/logic-errors/2026-04-11-link-paste-autolink-must-stay-literal-inside-markdown-source-entry.md)

## Recommendation

### Best permanent design

Split link input assist out of `BaseLinkPlugin`.

Create a dedicated link input surface in `@platejs/link`:

- `BaseLinkPlugin`
  - link node model
  - URL validation
  - HTML parsing
  - transforms
- `BaseLinkInputPlugin` or `LinkInputPlugin`
  - plain URL autolink on typing boundary
  - plain URL autolink on paste
  - explicit policy decisions for when link input should stay literal

Keep markdown source-entry conversion (`[text](url)` on `)`) as a neighboring
link-owned input lane, not folded into plain autolink. It can stay hosted by
the shared typed-input runtime.

### Why this wins

- correct ownership
  - autolink is profile-adjacent input assist, not core link node semantics
- cleaner DX
  - developers can opt into link nodes without surprise paste/space autolink
- better profile story
  - `rich-first`, `reversible-rich`, or future source-first profiles can make
    different input-policy choices cleanly
- better API
  - one policy object instead of more one-off booleans and callbacks
- same performance class
  - all decisions still run on local text near the caret

## Rejected Options

### 1. Keep patching `BaseLinkPlugin`

Reject.

That path keeps growing callback knobs on the wrong seam.

### 2. Keep the seam but replace the callbacks with one `autolink` object

Better than today, but still not the best permanent architecture.

It still makes link semantics and input assist feel like one inseparable
feature.

### 3. Fold link automd into the same plain autolink runtime

Reject.

Link automd is already correctly spec'd as richer source-entry interaction, not
plain autolink literal behavior.

## Proposed API Shape

```ts
type LinkInputContext = {
  cause: "insert-space" | "insert-break" | "paste";
  editor: SlateEditor;
  selectionMode: "collapsed" | "expanded";
  sourceText: string;
  textBefore: string;
  textAfter: string;
  url: string;
  inCodeLikeContext: boolean;
  inLink: boolean;
  inMarkdownSourceEntry: boolean;
};

type LinkInputConfig = {
  autolink?: {
    typing?: {
      enabled?: boolean;
      commitTriggers?: ("space" | "break")[];
    };
    paste?: {
      enabled?: boolean;
      selectedText?: "preserve" | "replace";
    };
    resolveUrl?: (context: {
      editor: SlateEditor;
      text: string;
      cause: LinkInputContext["cause"];
    }) => string | undefined;
    shouldLink?: (context: LinkInputContext) => boolean;
  };
};
```

### Migration direction

Retire or replace these current options:

- `keepSelectedTextOnPaste`
  - move to `autolink.paste.selectedText`
- `getUrlHref`
  - move to `autolink.resolveUrl`
- `shouldAutoLinkPaste`
  - replace with `autolink.shouldLink`
- `rangeBeforeOptions`
  - do not carry this forward as the primary public contract
  - if advanced tuning survives, hide it behind a clearly subordinate
    autolink-typing option instead of exposing raw range internals as the
    first-class API

Keep `transformInput` where it belongs:

- manual URL submission
- source-entry conversion

It should not become the generic autolink policy hook.

## Default Policy

For the default rich profile:

- typing-boundary autolink:
  - enabled
  - commit on space and `Enter`
  - standalone URL candidate only
- paste autolink:
  - enabled
  - standalone URL candidate only
  - preserve selected text by default
- keep literal text instead of autolinking when:
  - inside markdown link source entry
  - inside code-like contexts
  - inside an existing link
  - local surrounding text shows the paste is completing source syntax rather
    than inserting a rich link
- link automd:
  - separate lane
  - explicit completion on `)`
  - wins over premature autolink conversion for markdown source entry

## Performance Constraints

Do not redesign this around slower abstractions.

The winning design must keep:

- local text inspection only
- no markdown AST parse on typing or paste
- no whole-block scan when a shorter candidate window is enough
- no DOM lookups
- one context derivation per input event

The fix is about policy and ownership, not raw speed.

## Acceptance Criteria

- `BaseLinkPlugin` alone no longer owns typing/paste autolink behavior
- the new link input surface owns typing-boundary and paste autolink behavior
- current rich kits can still compose back to the shipped behavior intentionally
- pasting a URL inside unfinished `[text](...)` source stays literal by default
- standalone plain URL paste still autolinks in rich profiles
- typing space or `Enter` after a plain URL still finalizes autolink in rich
  profiles
- markdown source-entry conversion on `)` still works and does not fight the
  plain autolink lane
- link docs clearly separate:
  - link node feature
  - link input/autolink feature
  - link automd source-entry feature

## Implementation Steps

1. Spec the split before code

   - patch
     [markdown-editing-spec.md](docs/editor-behavior/markdown-editing-spec.md)
     to separate plain autolink literal behavior from richer link source-entry
     conversion
   - add protocol rows for:
     - paste URL inside unfinished markdown link source -> keep literal
     - typing-boundary autolink vs source-entry literal guard
   - update
     [markdown-parity-matrix.md](docs/editor-behavior/markdown-parity-matrix.md)
     if the family gate changes

2. Extract the input surface

   - move typing/paste autolink logic out of
     [withLink.ts](packages/link/src/lib/withLink.ts)
   - create new input plugin files under `packages/link/src/lib`
   - keep `BaseLinkPlugin` semantics-only

3. Introduce the unified policy object

   - build one context derivation path for `paste`, `insert-space`, and
     `insert-break`
   - replace the paste-only callback with one cross-cause decision hook
   - move selection replacement policy into that object

4. Recompose shipped surfaces

   - decide whether `LinkKit` includes the input plugin by default
   - keep direct plugin consumers explicit
   - keep link automd separate and documented as a sibling lane

5. Migrate docs and release surface
   - update link docs and examples
   - write the package major changeset
   - document the migration from the old option set

## Risks

### Risk: too much breakage in one cut

Mitigation:

- break the seam once, but keep migration examples precise
- if needed, keep one short compatibility shim release before hard removal

### Risk: docs collapse autolink and automd again

Mitigation:

- keep them as separate sections in docs and separate rows in protocol

### Risk: performance regresses while "cleaning up" the API

Mitigation:

- treat local-text-only evaluation as a non-negotiable acceptance criterion

## Verification

- unit coverage in
  [withLink.spec.tsx](packages/link/src/lib/withLink.spec.tsx)
  or its successor input-plugin spec
- focused tests for:
  - standalone plain URL paste
  - expanded-selection paste preserve/replace modes
  - unfinished `[text](...)` source-entry paste stays literal
  - typing space after URL
  - `Enter` after URL
  - no autolink in code-like contexts
  - no interference with `linkAutomdInputRule`
- `pnpm install`
- `pnpm turbo build --filter=./packages/link`
- `pnpm turbo typecheck --filter=./packages/link`
- `pnpm lint:fix`

## Recommendation

If this gets approved, do not keep iterating on `shouldAutoLinkPaste`.

That callback is already proof that the current seam is too small and too
special-cased. The right move is to split link input assist into its own plugin
and give it one coherent policy model.
