# Code Highlight Repro

## Goal

Use the user-provided streaming transcript in the markdown streaming demo, determine whether it reproduces the `CODE_HIGHLIGHT` runtime error, and land the smallest durable fix.

## Source Of Truth

- User-provided SSE transcript in thread
- Repo instructions in `AGENTS.md`
- Demo route: `/blocks/markdown-streaming-demo`
- Demo implementation: [apps/www/src/registry/examples/markdown-streaming-demo.tsx](/Users/felixfeng/Desktop/repos/plate/apps/www/src/registry/examples/markdown-streaming-demo.tsx)
- Code highlight path: [packages/code-block/src/lib/setCodeBlockToDecorations.ts](/Users/felixfeng/Desktop/repos/plate/packages/code-block/src/lib/setCodeBlockToDecorations.ts)

## Constraints

- Reuse the persistent debug Chrome on `127.0.0.1:9222`.
- Test on the demo page, not the homepage.
- Do not mutate unrelated demo logic unless reproduction requires instrumentation.
- Keep the pasted payload faithful to the provided stream. Only convert the transport shape into the demo's accepted `string[]` format.

## Findings

- The demo's `Paste raw chunks` flow only accepts a JSON array of strings, not raw SSE lines.
- `parseSerializedChunks` rejects anything except `string[]`.
- Browser automation against `window.prompt`/`navigator.clipboard.readText()` was flaky enough that a dedicated preset scenario was the fastest reliable repro path.
- The provided stream reproduces a `CODE_HIGHLIGHT` failure in the demo, but the thrown error is `SyntaxError: Invalid regular expression ... Range out of order in character class`, not the earlier `Could not highlight with \`Highlight.js\`` message.
- The crash happens when the demo applies the fenced language opener chunk `````python\n```, before any actual Python code body arrives. That rules out "incomplete code statement" as the primary trigger.
- No dedicated prior learning for this exact repro exists; related learnings mainly cover batching and code-block redecorate behavior.
- The runtime crash came from `packages/code-block/src/lib/setCodeBlockToDecorations.ts` calling `editor.api.debug.error(...)` for registered-language highlight failures. In dev, that path throws a `PlateError` before the plaintext fallback can take effect.
- Downgrading that branch to `debug.warn(...)` preserves the fallback semantics for failed highlight attempts while keeping the editor alive.

## Plan

| Phase | Status | Notes |
| --- | --- | --- |
| Review learnings and demo paste format | complete | Confirmed the demo needs `text-delta[]` rather than raw SSE |
| Convert the provided transcript into pasteable chunk JSON | complete | Preserved the original chunk boundaries and corrected one copied markdown bullet delimiter |
| Replay the chunks in the demo page | complete | Added a dedicated preset scenario and replayed it in the persistent browser |
| Inspect outcome and summarize whether the runtime error reproduces | complete | Narrowed the trigger to the fenced `python` opener at step 73 |
| Patch the registered-language highlight fallback | complete | Switched the debug path from fatal `error` to non-fatal `warn` |
| Re-verify in tests and browser | complete | Unit test, build, typecheck, lint, and browser replay all passed |

## Progress Log

- 2026-04-01: Confirmed the markdown streaming demo paste flow expects `JSON.stringify(string[])`, so the raw SSE transcript must be normalized to its `text-delta` payloads before replay.
- 2026-04-01: Reviewed nearby learnings. They explain streaming and code-block decoration behavior, but none directly answer whether this exact transcript reproduces the highlight crash.
- 2026-04-01: Added a temporary `highlightErrorRepro` scenario to the demo after `window.prompt` automation proved unreliable in this browser flow.
- 2026-04-01: Reproduced the crash in `http://localhost:3002/blocks/markdown-streaming-demo` and confirmed the failing chunk is the fenced language opener `````python\n``` at step 73.
- 2026-04-01: Patched `setCodeBlockToDecorations` so registered-language highlight failures warn and fall back to plaintext instead of throwing a dev-time `PlateError`.
- 2026-04-01: Verified the fix with `bun test packages/code-block/src/lib/setCodeBlockToDecorations.spec.ts`, package/app build + typecheck + lint, and a persistent-browser replay of `Highlight Error Repro` that completed `104/104` with no runtime overlay.
