# Chromium follow-up

**The exact streaming demo renders in Chromium. Matched 10/50 KB conversion
publication and React commit measurements remain unmeasured because the
existing surface exposes no suitable injection or commit-observation API.**
This is now an instrumentation boundary, not a missing-host claim.

An owned Next 16.3.2 development server served
`http://localhost:3297/blocks/markdown-streaming-demo` from
`/Users/zbeyens/git/plate-2/apps/www`, with `PLATE_WWW_DEV_SOURCE=1` and
`PLATE_WWW_PLITE=1`. The registered client code used source aliases. Preparation
ran `pnpm --filter www build:registry` and `pnpm --filter @platejs/test build`;
generated registry, MDX, package and Next outputs were authorized. No hand
product edits, staging commands or commits were made. Runtime input hashes
still match the headless measurements; `browser-identity.json` binds the host,
commands, browser version and current client/proof source hashes.

The disposable Playwright spec reuses `createBrowserEditorHarness`,
`recordBrowserRuntimeErrors`, and the existing React render-profiler bridge.
It follows the existing streaming-lifetime test's controls and assertions.
Chromium **149.0.7827.55**, viewport **1280 × 720**, one observation per mode:

| Existing Columns scenario, 33 emitted chunks, 10 ms speed selection | Editable | Static |
| --- | ---: | ---: |
| Click to DOM verified by the test | 971.5 ms | 849.0 ms |
| Click to second subsequent animation-frame callback | 982.5 ms | 862.9 ms |
| Observed output mutation batches | 6 | 7 |
| Final `[data-editor-node]` count in output host | 18 | 15 |
| Captured runtime errors | 0 | 0 |

Both cases finished at 33/33 and rendered column texts `1`, `2`, `3`, with no
literal column tags. Saved screenshots were inspected. These are
**click-to-observation** measurements including the demo's scheduling, React
work and Playwright assertion delay. They are not individual publish-to-DOM
latency, actual paint completion, production-build speed or a matched
baseline/candidate comparison. Two animation frames are frame opportunities,
not proof of a particular compositor paint. Editable and static compose
different interfaces and parsing policies, so their numbers are not a causal
performance comparison either.

The existing profiler recorded 1,534 core-time, 8 runtime-time, 31 selector,
2 DOM-text-sync and 2 editable events in editable mode. Static recorded 2,982
core-time events and no React render-family events. Those counts are diagnostic
only: the static preview is not comprehensively instrumented, nested duration
events must not be summed into a pipeline, and no React commit callback is
exposed on this route. No render/remount reduction is established.

The exact missing measurement surface is evidenced in `browser-editable.json`,
`browser-static.json` and `browser-handle.ts`:

- The Markdown textarea is read-only and the source transcripts are fixed
  component-local scenarios. There is no arbitrary stream-input control.
- The main editable handle exposes `applyValueChange`, but not `parseSlice`,
  `setPreview`, `value.replace` or the AI preview editor. The read-only preview
  and static roots expose no browser handle.
- `applyValueChange` constructs `DocumentChange.between`, applies a change and
  calls `forceRender`. Substituting it would bypass the actual parse/store/
  preview-editor replacement path and change rendering behavior. It cannot
  certify the requested comparison.
- There is no supported way to insert the candidate parser result into the
  real preview publisher or observe a React commit timestamp. Doing so would
  need an explicitly instrumented fixture or an injection boundary in the
  product/test surface. None was added or reconstructed through private React
  internals.

Consumer policy must be preserved explicitly in any adoption:
**editable** calls `setPreview(output)` and its default `final: true` makes
every prefix strict; **static** calls document `parse` with permissive partial
options throughout and has no final transition. The real `useAIChat` transport
instead coalesces partial previews and strictly reparses at completion.

Execution command:

```sh
PLAYWRIGHT_BASE_URL=http://localhost:3297 pnpm --filter www test:www-browser:chromium --config /Users/zbeyens/git/plate-2/docs/plans/artifacts/2026-09-28-conversion-boundary/streaming/browser.config.ts
```

Attempt 1 failed before launching Chromium: `SyntaxError: Cannot use
'import.meta' outside a module` in the artifact-local config. Attempt 2 used
`__dirname` and passed both cases in 6.9 seconds. Both logs are preserved; no
further attempts or full suite were run. The owned server PID 3639 was stopped
after proof, and port 3297 was checked for cleanup.

The headless report and raw results remain intact in `HEADLESS-REPORT.md` and
their original JSON/log files. Its 50 KB sampling target and general identity
promise remain unproven/failed as recorded. The historical 3.2-second claim is
still not established.
