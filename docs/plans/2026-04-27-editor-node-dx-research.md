# Editor Node DX Research

## Status

Done.

## Goal

Produce a full research-wiki pass for the absolute-best editor node/text/mark
DX and runtime architecture, unconstrained by legacy Slate closeness, while
preserving React/shadcn flexibility and avoiding perf regressions.

## Scope

- Primary repo: `/Users/zbeyens/git/plate-2`.
- Local comparison repos/raw:
  - `/Users/zbeyens/git/prosemirror`
  - `/Users/zbeyens/git/lexical`
  - `/Users/zbeyens/git/tiptap`
  - `/Users/zbeyens/git/raw/prosemirror`
  - `/Users/zbeyens/git/raw/lexical`
  - `/Users/zbeyens/git/raw/tiptap`
- Output: updated `docs/research` compiled layer plus concise architecture
  verdict.

## Plan

1. Read research-wiki baseline and existing editor architecture pages.
2. Inspect official/local source entrypoints for ProseMirror, Lexical, and
   Tiptap.
3. Read strongest raw/source hits for node specs, text/mark APIs, render
   surfaces, NodeViews/decorator nodes, extension APIs, and React perf guidance.
4. Create a per-corpus evidence ledger.
5. Promote durable synthesis into source/system/decision research pages.
6. Update `docs/research/index.md`, `docs/research/log.md`, and completion
   state.

## Early Findings

- Existing research already accepts the broad direction: Lexical lifecycle and
  dirtiness, ProseMirror transaction/DOM discipline, Tiptap extension DX.
- This pass narrows the question to node/text/mark/render DX and should avoid a
  fake "copy Tiptap" or "copy Lexical" answer.
- ProseMirror has the best declarative node/mark schema vocabulary and mapped
  decoration model, but NodeViews are too imperative as a default React API.
- Lexical has the best runtime dirtiness and text-mode model, but class nodes
  and subclass replacement are too expensive as public DX.
- Tiptap has the best extension/product packaging and React selector posture,
  but React NodeViews are explicitly wrapper-heavy and potentially expensive.
- The accepted architecture is spec-first nodes/marks/text behavior with
  runtime-owned DOM shells and app-owned visible React renderers.

## Verification

- `bun run completion-check`
