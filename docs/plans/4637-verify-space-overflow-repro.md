# Issue 4637 Reproduction Plan

## Goal

Determine whether GitHub issue `#4637` is reproducible on the current Plate site or current repo behavior, and identify whether it is a real editor bug or old CSS/config-specific behavior.

## Source of Truth

- Issue: `https://github.com/udecode/plate/issues/4637`
- Title: `Spaces do overflow, instead of getting moved to the next line`
- Reported version: Plate `21.3.2`, Slate React `0.95.0`
- Reported browser: Chrome
- Reproduction URL: `https://platejs.org/`

## Phases

| Phase | Status | Notes |
| --- | --- | --- |
| Read issue and extract repro details | complete | Steps and environment captured |
| Search prior learnings and likely code paths | complete | Current editor wrapper inspected |
| Attempt live reproduction | complete | Repro attempted against `platejs.org/` in Chrome |
| Compare with current implementation | complete | Current CSS and browser behavior align |
| Summarize validity | in_progress | Final verdict pending user handoff |

## Key Repro Steps

1. Write a word.
2. Put the cursor in the middle.
3. Insert spaces until the right half wraps.
4. Keep inserting spaces.
5. Observe whether spaces wrap or visually overflow past the editor width.

## Initial Hypotheses

- The behavior was caused by old editor CSS around `white-space`, wrapping, or `overflow-wrap`.
- The issue may be specific to older Slate/Plate rendering semantics and no longer reproduce on current versions.
- The live site may still show it if the editor content area allows preserved spaces without a wrapping rule.

## Findings

- Current site editor wrapper already includes `overflow-x-hidden whitespace-pre-wrap break-words` in `apps/www/src/registry/ui/editor.tsx`.
- The obvious CSS failure mode suggested in the issue comments is not present in current `apps/www`.
- Live Chrome repro on 2026-03-29 against `https://platejs.org/`:
  - placed the caret in the middle of `Welcome`
  - inserted 80 spaces
  - heading wrapped onto multiple lines
  - no horizontal overflow was observed
  - `editable.scrollWidth === editable.clientWidth`
  - caret remained inside the editor width
- Browser screenshot saved at `/Users/zbeyens/.dev-browser/tmp/issue-4637-current-site.png`.
- This does not prove the original 2025 report was wrong; it does show the issue is not reproducible on the current site surface.

## Progress Log

- Loaded `task`, `learnings-researcher`, `planning-with-files`, and `reproduce-bug`.
- Deleted the prior `#4535` investigation plan artifact at the user's request.
- Fetched the full GitHub issue with comments.
- Loaded `dev-browser` once the issue was confirmed to be browser-facing.
- Inspected `apps/www/src/registry/ui/editor.tsx` and confirmed current wrapping classes are present.
- Ran a live browser repro on `platejs.org` with 80 inserted spaces in the middle of a word and captured screenshot + DOM measurements.

## Verification

- No code edits planned unless the user later asks for a fix.
- Browser verification is required for this issue.
- Browser verification completed in Chrome against the live reproduction URL.
