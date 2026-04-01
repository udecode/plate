# Streaming MDX Replay Preserve Complete Prefix

## Goal

Keep already-complete markdown and MDX content structured while a later streamed MDX tail is still incomplete.

## Scope

- Reproduce the regression with a failing streaming test first
- Fix the package-level streaming deserializer/runtime path
- Verify with targeted tests, build-first checks, lint, and demo-surface browser proof

## Findings

- `streamDeserializeMd` keeps a session `mdxName` and currently falls back too broadly once that state is set.
- A chunk that starts with `<callout>` and also closes in the same chunk still leaves `mdxName = "callout"` behind.
- That sticky MDX state makes later ordinary markdown chunks deserialize as plain text instead of structured markdown.
- The markdown package already has `splitIncompleteMdx` and `markdownToSlateNodesSafely`, which preserve a complete prefix and only stringify the incomplete MDX tail.

## Plan

| Phase | Status | Notes |
| --- | --- | --- |
| Gather related learnings and find the smallest repro seam | complete | Existing learnings point to the streaming deserializer, not batching |
| Add a failing regression test | complete | Added red tests in `streamInsertChunk.slow.tsx` and `streamDeserializeMd.slow.tsx` |
| Fix the streaming deserializer/session logic | complete | Track only the pending MDX tail and preserve the complete prefix with `markdownToSlateNodesSafely` |
| Run verification and browser proof | complete | Targeted tests, build-first typecheck, lint, and pasted-chunk browser verification passed |

## Progress Log

- 2026-04-01: Confirmed the bug is rooted in `streamDeserializeMd` MDX session handling, not in the batching timer.
- 2026-04-01: Observed that `<callout>one</callout>\n\n` incorrectly leaves `mdxName = "callout"` in the session, which makes the next chunk `**after**\n\n` stay literal.
- 2026-04-01: Added a red integration test proving completed markdown and completed MDX must stay structured before a later incomplete MDX tail.
- 2026-04-01: Added a narrower red deserializer test proving a chunk that already closes `<callout>` must not leave the next markdown chunk in literal mode.
- 2026-04-01: Fixed `streamDeserializeMd` to derive session state from `splitIncompleteMdx`, clear stale MDX literal mode, and preserve only the incomplete tail as literal text.
- 2026-04-01: Verified the fix with targeted tests, package/app build + typecheck + lint, and browser proof on `/blocks/markdown-streaming-demo` using pasted raw chunks.
