# Issue 4520: Code block format loses syntax highlight

## Goal

Verify whether issue `#4520` is still reproducible on current `main`, determine whether PR `#4837` actually fixes it, and if not, land the smallest test-first fix.

## Tracker Context

- Source: GitHub issue `#4520`
- Title: `Code block formatting causing syntax highlight to be lost`
- Related PR: `#4837` (`fix(code-block): fix normalizer and insertBreak for syntax highlighting`)
- Task type: bug investigation + fix
- Browser surface: yes, but start with code-level repro/tests

## Relevant Instructions

- Use TDD for sane behavior seams.
- Load local learnings before non-trivial bug work.
- Closeout requires fresh same-turn verification.

## Findings

- Issue symptom: formatting a JSON code block drops syntax highlighting.
- Existing open PR `#4837` targets different symptoms:
  - normalizer wrapping bare text children into `code_line`
  - `insertBreak` resetting decorations
- Existing learning `2026-03-26-code-block-language-change-must-trigger-redecorate.md` says cache reset alone is insufficient; `editor.api.redecorate()` is required after decoration-invalidating changes.
- Root cause confirmed in local repro: `formatCodeBlock` rewrote formatted JSON into a single `code_line` text node containing embedded `\n`, so decorate only had one structural line to target.
- Code-block formatter path was the real seam: `packages/code-block/src/lib/formatter/formatter.ts`

## Plan

1. Inspect formatter, decoration cache, and current tests.
2. Reproduce missing highlight behavior in code-level tests.
3. Add failing regression test first.
4. Implement minimal fix.
5. Run targeted tests and required package verification.

## Progress

- Fetched issue and PR context.
- Searched local learnings and found directly relevant redecorate guidance.
- Added a failing regression test for formatting JSON into multiple code lines.
- Updated `formatCodeBlock` to rebuild `code_line` children and call `redecorate`.
- Extracted the code-line replacement + redecorate path into a shared `setCodeBlockContent` transform and removed the stale local `redecorate` cast.
- Added a changeset and a solution note.

## Verification Target

- Targeted `bun test` for touched code-block specs.
- Build-first package verification for touched packages if TypeScript changes.
- `pnpm lint:fix`.

## Verification Results

- `bun test packages/code-block/src/lib`
- `pnpm install`
- `pnpm turbo build --filter=./packages/code-block`
- `pnpm turbo typecheck --filter=./packages/code-block`
- `pnpm lint:fix`
- `pnpm check`
