# AI streaming evidence

These are local diagnostic receipts. They are not a release or final acceptance certificate.

`LegacyAIChatPlugin.ts` and `LegacyBaseAIPlugin.ts` freeze the AI owners from `f03d2b8c23`. Only import locations change. `createBaselineEditor.ts` installs them on the same current schema, codec and Plite graph as the candidate. This isolates the AI-owner comparison; it does not claim a full historical checkout comparison.

Run top-level probes from the repository root with `bun test ./docs/plans/artifacts/ai-streaming/<probe>.ts`. Their zero-test summaries are intentional: they collect measurements, not test counts. Explicit `.slow.tsx` behavioral tests live in the application integration suite.

- `baseline-probe.ts`: historical insertion semantics and edit history. The legacy column tag is retained as a negative fixture. Eight of eighteen exact semantic rows match. One Undo does not restore the original edit target.
- `parse-probe.ts`, `parser-phases.ts`: full parser cost diagnosis.
- `raw-source-probe.ts`: rejected full-source-per-chunk candidate.
- `incremental-prototype.ts`: disposable parser design probe.
- `incremental-benchmark.ts`: matched current AI insertion and candidate parser tail cost. It omits candidate rendering and cannot close the UI budget.
- `render-probe.tsx`: production React/HappyDOM static-render diagnosis. It is not browser latency evidence.
- `mdx-fixture-probe.ts`: canonical block MDX with required column widths, compared against the installed Markdown codec and schema.
- `p0-handoff-history.md`: superseded partial handoff and failed visual proxy history. The execution plan owns current status.

The production browser fixture is shared by `apps/www` and `apps/plite`. Build the latter, run its native static server, then use `apps/www/tests/browser/ai-streaming-performance.spec.ts` with `AI_STREAM_PERF=1` and `PLAYWRIGHT_BASE_URL` pointing at that server. Set `AI_STREAM_BUILD` to the measured source fingerprint. Restart the static server after each build because it snapshots output on startup.

The matrix records one cold trial, three warmups and ten identical measured trials. Earlier receipts labeled `pre-store-locality` used single action samples and remain diagnostic only. Each JSON records actual input size, history replay and publication checks. Budget claims require all relevant repeated cohorts, actual visible output and final source fingerprints.


`handoff-source.json` and `handoff/` record the user-requested stopping point after further optimization was paused. They retain the final scoped correctness checks and generated-output receipts. The full performance/baseline matrix and latest integrated native clipboard replay remain deferred. No release acceptance is implied.
