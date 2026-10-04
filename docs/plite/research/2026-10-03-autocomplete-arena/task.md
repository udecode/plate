# Arena task: ordinary-text autocomplete ownership and API (Plate v2)

You are one runner in a design arena. Read-only: do not edit, create or delete any file in any repository. Return your whole design package in your reply, never a report .md. Instruction files changed earlier in this session (/Users/zbeyens/git/plate-2/AGENTS.md and its plan-page skill); re-read them from disk if you rely on them.

Repository: /Users/zbeyens/git/plate-2, branch next, commit fe0e9599a6. The `next` branch is the Plate v2 beta redesign: breaking APIs and architecture are allowed, hard laws and the owner's constraints are not. Read root VISION.md (its Next beta section), docs/vision/common.md#redesign-from-first-principles, docs/vision/plate.md and docs/vision/plite.md before designing, and /Users/zbeyens/git/plate-2/.agents/playbooks/references/architecture.md for the layer law.

## The job

Mention, slash, emoji and footnote autocomplete in Plate: a user types a trigger, a popup offers options filtered by what follows, and choosing one replaces the trigger and query with a completed node or command, atomically and with one undo step. It must work across IME composition, multiple mounted Editables over one editor, independent editors, remote collaboration edits and stored documents from older versions.

The contract (outcome, the 13 hard laws, scope) is in CONTRACT below. Treat the hard laws as product law. You may propose changing a law only if you name it, give the decisive evidence, and say what the user loses.

One more law comes from the current governing review (docs/research/review-records/2026-10-02-autocomplete-input-element-rechallenge.json, verdict pursue): assistive technology must recognize that the caret is inside a combobox while a popup is open. In Chromium the editor root today exposes only role=textbox with aria-autocomplete, aria-controls and aria-activedescendant; the review's selected repair sets role=combobox, aria-expanded=true and aria-haspopup=listbox on the editor root while a popup is open, with a polite live region as the fallback. No screen reader has run.

## What exists

A built implementation exists (it is one candidate among many, not the answer). The grounding trace below explains it with path:line citations. Read the cited source yourself where your design depends on a fact. Earlier designs and their rejected alternatives are in docs/plans/2026-10-01-autocomplete-ordinary-text-adoption.md (its Decisions and Challenge delta), docs/plans/2026-10-01-autocomplete-query-activation.md, the decision page docs/research/decisions/autocomplete-ownership.md, and the review records docs/research/review-records/2026-10-01-autocomplete-*.json, 2026-10-02-autocomplete-input-element-rechallenge.json and 2026-09-12-native-input-authority.json. External editor evidence (12 autocomplete designs read at recorded revisions) is under docs/plite/research/2026-10-02-agentic-e2e-testing/ and the research the rechallenge cites.

## Your direction

DIRECTION

## What to return

Follow the architect runner prompt and the rationale template exactly:
- /Users/zbeyens/.claude/plugins/cache/pstack-claude/pstack/0.9.54/skills/architect/references/runner-prompt.md
- /Users/zbeyens/.claude/plugins/cache/pstack-claude/pstack/0.9.54/skills/architect/references/rationale-template.md
- screen your own design against /Users/zbeyens/.claude/plugins/cache/pstack-claude/pstack/0.9.54/skills/architect/references/design-red-flags.md

Your package must contain, in this order: Problem; Usage (the four feature call sites as a user's app writes them, the copied popup's call, and the plugin configuration); Shape (core types first, then the data flow, module map with package and file paths, and which layer owns each responsibility: Plite substrate, Plate package, copied registry UI); a table mapping each hard law (1 to 13, plus the combobox-recognition law) to the mechanism that enforces it; per-keystroke cost; the public API it adds, changes and removes relative to the built code; Tradeoffs accepted; Alternatives considered; Open questions and risks; Next implementation step. Stay under 2500 words. Cite path:line for every claim about current code. Mark anything you could not verify as unverified.

## CONTRACT

CONTRACT_TEXT

## GROUNDING (how the built code works)

GROUNDING_TEXT
