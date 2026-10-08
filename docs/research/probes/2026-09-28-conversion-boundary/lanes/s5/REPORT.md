# Lane S5: Chromium streaming acceptance matrix and browser proofs

This report starts with verdict-2, the accepted run on final code. Below it
are the pre-repair verdict run and the superseded 02:05 run. Receipts:

- [`verdict-2/`](verdict-2/): the accepted run (snapshot 2026-09-29T11:59:28Z)
- [`verdict/`](verdict/): the pre-repair run (snapshot 09:04:57Z)
- [`snapshot-2026-09-29T1028Z/`](snapshot-2026-09-29T1028Z/) and
  [`final/`](final/): superseded; each carries `SUPERSEDED.txt`
- [`snapshot-2026-09-29T0005Z/`](snapshot-2026-09-29T0005Z/) and
  [`snapshot-2026-09-29T0139Z/reruns/`](snapshot-2026-09-29T0139Z/reruns/):
  the 02:05 run and its browser reruns. Paths in that section are relative to
  those folders.

## Verdict-2: accepted (snapshot 2026-09-29T11:59:28Z)

Verdict: PASS. All 12 acceptance cells and all 4 live-AI cells pass. The final tree's continued-parse path is byte-identical to this snapshot ([`verdict-2/SOURCE-DIFF.md`](verdict-2/SOURCE-DIFF.md)).
- The strict-final regression is gone, and the editable composition passes.
- Load stayed at or below 7.9 during pairs, and no profile was rejected.
- No stream hit the cap, and the final text is identical across both arms in
  every cell.

The snapshot includes the lead's repairs after `verdict/`:
- the content-only editable preview, with `DndKit`, which splices;
- strict finals that continue the latest preview;
- completed segments converted without `partial`;
- the `react-dom/server.browser` import.

The baseline patch (107 lines) removes `previous` from previews and finals and
publishes every preview with `value.replace`. Both arms were unmangled
production webpack builds.

| Cell | (a)+(b) per pair, baseline to candidate | Strict-final p95 (ms) | Arrival p95 (ms) |
|---|---|---|---|
| static rich 10K | −84% | 96.5 to 54.6 | 111 to 80 |
| static CJK 10K | −86% | 174.1 to 110.8 | 187 to 127 |
| static rich 50K | −96% | 420.4 to 248.4 | 428 to 257 |
| static CJK 50K | −97% | 844.4 to 505.9 | 827 to 502 |
| editable rich 10K | −77% | 49.3 to 9.6 | 70 to 47 |
| editable CJK 10K | −81 to −82% | 79.1 to 17.3 | 107 to 56 |
| editable rich 50K | −93% | 183.0 to 12.4 | 201 to 50 |
| editable CJK 50K | −93 to −94% | 375.7 to 31.7 | 386 to 67 |
| AI rich 10K | −82 to −83% | 130.3 to 85.0 | 122 to 89 |
| AI CJK 10K | −84 to −85% | 222.1 to 155.6 | 224 to 162 |
| AI rich 50K | −95 to −96% | 588.6 to 386.8 | 456 to 290 |
| AI CJK 50K | −96% | 1072.0 to 693.3 | 875 to 521 |
| live AI rich 10K | −66 to −69% | 131.3 to 91.3 | 210 to 141 |
| live AI CJK 10K | −66 to −68% | 234.0 to 165.0 | 380 to 253 |
| live AI rich 50K | −82 to −84% | 627.9 to 397.5 | 859 to 504 |
| live AI CJK 50K | −79 to −80% | 1099.2 to 753.7 | 1602 to 1157 |

- **Strict finals:** the candidate's final is faster in every cell, by 32–41% for static and AI and by 80–93% for editable. Its parse takes 0–2 ms and its transaction 1–14 ms (9 and 30 ms in live CJK 50K). No major GC landed in any final. What remains of a static or AI final is React render and commit, which costs the same in both arms.
- **Editable:** parse (a) falls 77–95% and the transaction (b) 77–93%; at CJK 50K, a goes 7,342 to 338 ms and b 28,960 to 1,963 ms. Busy time falls 43–75%.
- **React:** render and commit (c) is the largest remaining cost of the static and AI previews, 24–51 s at 50 KB in both arms. The static renderer builds a new view on every commit, so every block re-renders on every publication.

Candidate reruns on the same snapshot:

| Spec | Result |
|---|---|
| correctness mode | 6/6 |
| markdown-streaming-lifetime | 14/14 |
| ai-session | 18/19 (the known narrow-view failure) |
| clipboard | 6/6 |
| clipboard-upload | 3/3 |
| docx | 3/3 (the export menu now downloads every format) |

## Verdict run on final code (snapshot 2026-09-29T09:04:57Z)

Receipts: [`verdict/`](verdict/) (`setup.json`, `matrix/`, `matrix-summary.json`, `diagnostics/`, `reruns/`). This run supersedes the 02:05 matrix below; the lead's repairs followed it, and verdict-2 above measures them.

Method changes from the 02:05 run:
- Both arms use unmangled production webpack builds (`--no-mangling`), so CPU-profile samples can be attributed by function name.
- The gate is (a) parse plus store work plus (b) the publication transaction. React render and commit (c) are recorded separately.
- The strict final is the duration of the task that runs it.
- The summarizer rejects a profile that lost its stacks. One baseline profile did (AI rich 10 KB); that cell was repeated, and the glitched receipt is in `superseded/`.

Verdict: FAIL.

| Cell | (a)+(b), baseline to candidate | Strict-final p95 (ms) | Verdict |
|---|---|---|---|
| static rich 10K | −77 to −79% | 97 to 100 | pass |
| static CJK 10K | −80 to −81% | 200.7 to 222.7 (+11.0%) | fail (final) |
| static rich 50K | −95% | 431 to 466 | pass |
| static CJK 50K | −96% | 1108 to 932 | pass |
| editable rich 10K | −15 to −18% | 58 to 54 | fail (work) |
| editable CJK 10K | −10 to −22% | 116.1 to 137.8 (+18.7%) | fail (work, final) |
| editable rich 50K | −15 to −19% | 235 to 253 | fail (work) |
| editable CJK 50K | −13 to −19% | 442 to 486 (+9.8%) | fail (work) |
| AI rich 10K | −77% | 138 to 142 | pass |
| AI CJK 10K | −79 to −81% | 235.6 to 293.7 (+24.7%) | fail (final) |
| AI rich 50K | −94% | 596 to 631 | pass |
| AI CJK 50K | −96 to −97% | 1282 to 1153 | pass |

The AI rows use identical prefixes. With live AI arrivals, (a)+(b) falls 50–75%, but the candidate publishes 24–36% more previews, so busy time falls only 6–9%. Arrival-to-screen p95 falls 27–39%.

Findings:
- **Editable:** the parse falls 70–94%, but `value.replace` is 93–99% of the candidate's remaining work and is unchanged. The demo's editable preview installed AI and Suggestion, whose authored runtime forces a whole-value load.
- **Strict final:** the candidate's regression is CPU inside the final itself.
  - At static CJK 10 KB, `parseSlice` goes 15.5 to 22.7 ms and `fitDocument` goes 33.8 to 41.6 ms.
  - Minor GC inside the final is equal, no candidate final contains a major GC, and the candidate's heap before the final is 19–61% lower.
  - Hypothesis, untested: colder or more polymorphic JIT state, because the candidate's previews run the continuation and splice paths instead of the full parse and replacement.
- **Spikes:** both 50 KB spikes in this run were in the baseline, each a major GC inside the final (203 ms and 553 ms).
- **React:** render and commit (c) is equal in both arms and is the largest remaining cost of static and AI previews: 25–59 s at 50 KB. The static renderer builds a new view on every commit, so every block re-renders.

Browser proofs on the same snapshot:
- Chromium: lifetime 14/14, clipboard 6/6, clipboard-upload 3/3, static-clipboard 1/1, correctness 6/6.
- `ai-session` 18/19: the known narrow-view failure, plus one flake that passed 3/3 on rerun.
- `docx` 2/3: the export-menu test fails because the webpack HTML export imports `react-dom/server.edge`, which the client build stubs. This predates the lane.
- Firefox and WebKit: clipboard 6/6 and clipboard-upload 3/3.
- Toast 3/3. The registry toast was removed afterwards by a separate decision (`2026-09-29-imports-opt-in-paste-result`).

## Run on the 02:05 snapshot (superseded)

Verdict: the S5 acceptance bar is not met in all three compositions. Static and AI pass on identical prefixes (−31% to −41% publish work). The editable demo fails at every size (−9% to −17%), and static CJK 10 KB misses only on strict-final p95 (+10.1% vs 10% allowed). The matrix ran on the 02:05 snapshot. Main changed afterwards (26 product files, including markdownSegments.ts), so the S5 exit on final code still needs a rerun.

Setup
- Snapshot 2026-09-29T00:05:13Z of the main checkout: HEAD a7750ad388 plus 335 modified/untracked files and 4 deletions.
  - Copied with rsync into two `git worktree add --detach` worktrees (scratchpad s5/wt-cand and s5/wt-base).
  - Hash-verified: receipt snapshot-files.sha256, list fingerprint 78552b30….
- node_modules: the root is symlinked to the main checkout. Each workspace node_modules is copied as its own relative symlinks, so workspace packages resolve inside the worktree.
- www's tsconfig `paths` map platejs/* to package source, so the production build compiles each tree's own source. I checked the bundles: `partial:!0,previous:` and the `replaceChildren(x.slice(i),{at:[],index:i})` splice appear twice in the candidate and never in the baseline.

Baseline patch (receipt baseline.patch, 113 lines):
- `AIChatPlugin.setPreview`: passes no `previous`. The store gets `previewValue` directly, with no handback of the reused store copies. The unused `previous`/`reused` locals are removed.
- `ai-menu.tsx` AIChatEditor: the layout effect always runs `aiEditor.update({ history: 'skip' }).value.replace({ children: document })`.
- `markdown-streaming-demo.tsx`: the partial parse gets no `previous`, and the static preview always uses `value.replace`. The editable preview already used value.replace in both arms.
- The baseline needed no build:registry, because /blocks/[name] lazily imports the registry source files.

Build (production in both arms; the dev fallback was not needed)
- Packages: `pnpm turbo build --filter=plitejs --filter=platejs` took 8 s (candidate) and 9 s (baseline). Strictly unnecessary given the source paths.
- `PLATE_WWW_ASYNC_DOCS=1 pnpm build:source` (<1 s), then:
  `PLATE_WWW_PLITE=1 PLATE_WWW_WEBPACK=1 PLATE_WWW_ASYNC_DOCS=1 PLATE_WWW_DIST_DIR=.next-s5 NODE_OPTIONS=--max-old-space-size=8192 next build --webpack --debug-build-paths "src/app/(blocks)/blocks/[name]/page.tsx,src/app/(blocks)/blocks/clipboard-static-proof/page.tsx,src/app/(blocks)/blocks/clipboard-upload-proof/page.tsx,src/app/(app)/page.tsx"`
  This took 49 s per arm. I used webpack because the official `build` script uses it, and Turbopack refuses node_modules symlinks that point outside its root.
- Served with `next start`: candidate :3531, baseline :3532.
- Non-Plite candidate for the toast: the same build without PLATE_WWW_PLITE, dist .next-s5d, /blocks/[name] only, 47 s, served on :3534.
- Unmangled candidate (`--no-mangling`, 46 s, :3533), used only for one CPU profile.
- Environment:
  - Apple M5 Max (18 cores), Node 22.22.1, Playwright 1.61.0.
  - chromium-headless-shell 149.0.7827.55 (Desktop Chrome device, 1280×720).
  - Benchmark shells ran at nice 5. Load average was 1.7–9.6 because of other agents, recorded per stream.

Parts 2–4: matrix, bottlenecks and toast, reruns and cleanup.

Method (apps/www/tests/browser/markdown-streaming-contract.spec.ts, S5_BENCH=1)
- Fixtures: S4's generators, so source hashes match S4. Sizes are 10,000 and 50,000 UTF-16 units, split into 64-code-point chunks (the demo's chunker) arriving every 10 ms. The product keeps its own 32 ms cadence.
- Each cell: a fresh browser context per stream, one warmup per arm, then 3 alternating pairs (B,C / C,B / B,C). The harness enforces the caps: 180 s per stream and a shared 60-minute budget.
- Work comes from CDP Tracing (blink.user_timing, devtools.timeline, disabled-by-default-devtools.timeline, toplevel). It is the sum of top-level RunTask durations on the page's renderer main thread, counting only tasks in which the output DOM changed (MutationObserver mark) or a 32 ms preview timer ran (named setTimeout wrapper). The window runs from the start mark to the final output change.
  - So work covers the parse, the publication, and the synchronous React render and layout.
  - In all 128 streams, every 32 ms preview task contained its own output change, so no render was deferred to another task. Total main-thread work is recorded as well.
- Arrival→DOM: for each chunk, the first output change at or after its arrival. AI arrivals count from their due time.
- Strict final: the final output change minus the last arrival (for AI, minus the stream close).
- Host survival: the leading top-level block elements that are the same nodes across consecutive output changes.
- Heap: `HeapProfiler.collectGarbage` twice, then `Runtime.getHeapUsage`, before and after three cycles (finish, cancel at 25%, finish) on a fresh page per arm. Run at 10 KB only, for cost.
- Verdict rule (summarize-matrix.ts):
  - every pair is at least 20% and 100 ms lower;
  - the smallest pair gain is larger than each arm's spread;
  - final p95 (max of 3) and arrival p95 (median of per-stream p95) regress by no more than max(10%, 5 ms).
- AI arrivals: the main packet used wall-clock arrivals as you specified (chunk i is due at t0+10i, and a busy thread receives a backlog). The candidate then published 17–33% more previews, so its workload was larger, and the comparison is not the plan's identical-prefix comparison.
  - I added an identical-prefix AI packet (S5_AI_ARRIVAL=chained): each chunk arrives 10 ms after the previous one ran, like the demo's own timer. Same protocol, same shared cap.
  - The demo is chained by construction, and its preview counts match within 1–2.

Main matrix. Publish work per pair, baseline→candidate, in ms; finals and arrival p95 in ms.
| Cell | Verdict | Pairs | Final p95 | Arrival p95 | Previews B→C |
|---|---|---|---|---|---|
| static rich 10K | pass | 2003→1319, 2045→1355, 2011→1311 (−34%) | 97.3→95.6 | 110.5→84.3 | 39→39 |
| static CJK 10K | FAIL (final) | 4003→2552, 3869→2602, 3881→2531 (−33..−36%) | 179.6→197.7 (+10.1%) | 192.3→133.0 | 39→39 |
| static rich 50K | pass | 43414→25855, 43947→25867, 43805→25992 (−41%) | 427.9→445.6 | 433.8→257.5 | 197→196 |
| static CJK 50K | pass | 85694→50778, 84184→50915, 85077→50640 (−40%) | 836.9→858.9 | 825.6→492.4 | 196→195 |
| editable rich 10K | FAIL | 1374→1243, 1372→1240, 1380→1243 (−10%) | 52.9→53.4 | 78.7→74.3 | 39→39 |
| editable CJK 10K | FAIL | 2502→2267, 2501→2268, 2503→2273 (−9%) | 95.2→101.0 | 122.1→112.6 | 39→39 |
| editable rich 50K | FAIL (work, final) | 24009→20060, 24091→20099, 23873→20279 (−15..−17%) | 216.3→702.7 | 243.7→206.2 | 196→196 |
| editable CJK 50K | FAIL (work, final) | 49037→41408, 48341→40586, 50850→42059 (−16..−17%) | 430.4→574.6 | 445.7→385.5 | 201→200 |
| AI rich 10K, live | FAIL | 1084→948, 1073→915, 1096→919 (−13..−16%) | 123.4→132.7 | 195.8→144.6 | 18→21 |
| AI CJK 10K, live | FAIL | 1357→1279, 1452→1338, 1407→1305 (−6..−8%) | 238.4→232.5 | 399.2→246.4 | 12→15 |
| AI rich 50K, live | FAIL | 7384→6347, 7317→6650, 7169→6621 (−8..−14%) | 727.4→613.2 | 826.5→510.4 | 40→53 |
| AI CJK 50K, live | FAIL | 8515→7753, 8073→7775, 7900→7718 (−2..−9%) | 1145→1181 | 1661→1047 | 24→32 |

Identical-prefix AI packet (the plan's parser-cost comparison):
| Cell | Verdict | Pairs | Final p95 | Arrival p95 | Previews B→C |
|---|---|---|---|---|---|
| AI rich 10K | pass | 2356→1582, 2356→1599, 2380→1609 (−32..−33%) | 126.5→128.8 | 121.0→87.7 | 40→40 |
| AI CJK 10K | pass | 4265→2950, 4327→2956, 4327→2939 (−31..−32%) | 222.7→244.2 (+9.7%) | 226.7→162.5 | 39→39 |
| AI rich 50K | pass | 48285→28397, 47830→28335, 48010→28281 (−41%) | 564.5→596.2 | 467.9→284.7 | 198→196 |
| AI CJK 50K | pass | 93320→55766, 92023→55737, 92130→56093 (−39..−40%) | 1049.5→1075.7 | 901.6→522.8 | 196→195 |

All 16 cells:
- Final output text is identical across both arms and every stream.
- No stream hit the 180 s cap.
- Five baseline finals in the chained packet changed no DOM, because the strict result rendered exactly like the last preview. They are excluded from final p95, and each cell still has at least one baseline final.

Measured time was 59.2 min of the 60-minute cap: 39.5 min for the main matrix and 19.7 min for the identical-prefix AI packet. Build, setup and the disposable feasibility run (static and editable CJK 50 KB, AI CJK 10 KB) are not counted.

Reading the live AI rows: at 50 KB both arms saturate the main thread over a stream of about 9 s, so cumulative work can hardly drop. The candidate spends its savings on more previews: work per publication falls 24–33%, and arrival→DOM p95 falls 26–38%.

What limits the gain
- Static renderer (I sent this earlier): AIChatEditor and the demo's static preview rebuild their view on every commit with `useEditorRuntimeState(editor, () => createEditorView(editor, { readOnly: true }))`.
  - EditorStatic passes that new view as `editor`, so ElementStatic's memo check (`prev.editor === next.editor`, PlateStatic.tsx:211) fails for every block, and each publication re-renders the whole preview. `Children` also runs every decoration source over every block on each render.
  - Unmangled candidate profile (AI CJK 10 KB): React render and commit take 857 of 1,404 ms busy time. setPreview's parse plus store takes only 81 ms.
  - The splice keeps model identity, but the renderer never benefits from it. Static and AI still clear the bar because, at these sizes, the baseline's full parse costs more than this render.
- Editable demo: both arms republish the whole value with value.replace (S4's authored-change constraint), and EditorKit re-renders it. The candidate therefore saves only the parse: −9% at 10 KB, −16% at 50 KB. It cannot reach 20% without a different editable publication path.
- Editable strict final at 50 KB is intermittently slow, in the candidate only.
  - 3 of 12 candidate finals: 1,608 ms (feasibility, CJK), 703 ms (rich), 575 ms (CJK). Baseline: 0 of 12, max 430 ms.
  - A traced diagnostic of 6 streams (diagnostics/editable-rich-50000-final-diag.json) caught no spike. Those finals were all JS under the delivery timer, with minor GC only, and ran 5–10% above baseline.
  - The cause is still unexplained. One candidate is GC of the dropped continuation state.
- Strict finals are generally a little slower in the candidate, by 1% to 10%, even though both arms run the same strict parse and the same replace, so heap state is the likely difference.
  - Static CJK 10 KB: +15–20 ms in 4 of 4 samples. That is the FAIL at +10.1%.
  - AI rich 10 KB (live): +5–10 ms.
  - Static rich 50 KB: +20–25 ms.

DOM host survival
- 100% of leading block hosts survive every later preview in BOTH arms and in all compositions. Static children are keyed by path, so React reuses the hosts even under value.replace, and the editable view keeps them too.
- So the metric cannot tell the arms apart. The correctness assertion (above 90% in the candidate) holds, but it is not evidence for the splice.

Heap after finish, cancel at 25%, finish (10 KB, one probe per arm; growth in MiB, baseline / candidate):
- AI rich +10.9 / +8.3; AI CJK +12.0 / +9.9
- static rich +7.3 / +8.9; static CJK +17.1 / +8.9
- editable rich +27.6 / +24.8; editable CJK +48.8 / +49.2
- No candidate-specific retention. With a single sample per arm, only a large leak would show. Not run at 50 KB, for cost.

Correctness mode (the default, no env): 6 of 6 pass, on the 02:05 production candidate and again on the final one:
- Editable and static:
  - In the columns scenario, no output change ever shows a literal `<column` or `</column`.
  - The streamed final equals a strict parse of the complete source.
  - A paused preview equals a fresh partial parse of the same prefix (Previous, then Next chunk).
- AI "Continue writing":
  - The streamed final equals a one-chunk response, and the registered column tags never appear as text.
  - Leading hosts survive at more than 90% (see the caveat above).

Task B: toast (the original toast spec evidence file is no longer available; the reported results below cannot be checked against that spec)
- 3 of 3 pass on a non-Plite production start of the 02:05 candidate (:3534) and of the final candidate (:3538).
- Route: /blocks/html-demo, which uses the registry Editor with its default onPasteResult.
  - A lossy paste of `<p>Before graphic</p><svg role="img">…</svg>` shows exactly one `[data-sonner-toast]` reading "Some pasted content was left out.", and still exactly one 500 ms later.
  - Pasting `<meta charset="utf-8"><p>Hello metadata</p>`, or a link with a `javascript:` href, shows no toast, and no javascript: href survives.
- The spec skips on Plite servers ("This server mounts no <Toaster />") and on browsers other than Chromium.
- It must paste with a trusted Ctrl+V from the clipboard. Under the Desktop Chrome UA, the harness's synthetic paste event is not canceled, so the harness falls back to the test handle's insertData, and onPasteResult by design does not observe that path.

Task C: final Chromium reruns
- Fresh snapshot of main at 2026-09-29T01:39:34Z: 376 changed or untracked files, 4 deletions, list fingerprint e33cfc7e42c7.
- Production webpack build in Plite mode, adding docs, /view/[name] and the API routes (98 s), served on :3537.
- I had to copy main's git-ignored local apps/www/src/app/api/ai/{command,copilot}/route.ts into the snapshot. Without them the unmocked AI tests get a 404.

| Spec | Result |
|---|---|
| markdown-streaming-lifetime | 14/14 |
| clipboard | 5/6 — "preserves heading, bold and link via event": href is "https://example.com", expected "https://example.com/" |
| clipboard-upload | 3/3 |
| static-clipboard | 1/1 |
| ai-session | 18/19 — only the known "AI edit review … narrow view" failure |
| docx | 2/3 — "the export menu applies one suggestion projection to every format": no download within 30 s |
| markdown-streaming-contract (correctness) | 6/6 |

Both failures also reproduce on the 02:05 snapshot and on `next dev --webpack` of the final tree. So neither is production-only, and neither came in with the last edits:
1. Link href.
   - The trusted-paste path gets the browser's clipboard normalization: Chromium and WebKit write "https://example.com/".
   - The synthetic-event path goes through the test handle's insertData and keeps the source string, because S2's `decideUrl` (internal/utils/urlPolicy.ts) returns an accepted URL unchanged. The deleted `sanitizeUrl` normalized it.
   - T1 recorded 9/9 before S2. Decision for you: normalize accepted URLs, or change the assertion.
2. The DOCX demo's HTML export throws "Internal Error: do not use legacy react-dom/server APIs" in the browser.
   - platejs/src/static/internal/renderStaticHtmlWithOverrides.tsx imports renderToStaticMarkup from 'react-dom/server.edge'. Next's webpack client build aliases react-dom/server to next/dist/build/webpack/alias/react-dom-server.js.
   - That file is unchanged at HEAD (3e0ab4dd7d). Turbopack dev (dev:plite) does not apply the alias, which is why earlier lanes passed.
   - The official `build` script uses webpack, so HTML export in a production build is probably broken too.

Task D: Firefox 151 and WebKit (rev 2311), both already installed, run against :3537
| Browser | clipboard | clipboard-upload |
|---|---|---|
| Firefox | 4/6 — both "heading, bold and link" modes fail the same href assertion (Firefox's paste does not normalize it) | 3/3 |
| WebKit | 5/6 — only the event mode fails, same href assertion | 3/3 |
Everything else passes in both browsers: safe text around unsafe markup, the pasted video, and uploads.

Receipts (docs/research/probes/2026-09-28-conversion-boundary/lanes/s5/)
- Setup:
  - setup.json (snapshots, commands, ports, environment, time spent)
  - baseline.patch, snapshot-files.sha256, snapshot-deleted.txt, build-*.log
- Main matrix: matrix/<cell>.json ×12, matrix/budget.json, matrix-summary.json, matrix-run.log
- Identical-prefix AI packet: ai-chained/matrix/<cell>.json ×4, ai-chained/matrix/budget.json, ai-chained/matrix-summary.json, ai-chained-run.log
- Feasibility (disposable): feasibility/matrix/ (ai-cjk-10000, static-cjk-50000, editable-cjk-50000)
- Analysis:
  - profile-ai-cjk-10000-candidate-unmangled.txt
  - summarize-matrix.ts (rerun with `node --experimental-strip-types … [matrix-dir]`), analyze-profile.mjs, analyze-trace.mjs, analyze-final.mjs
- Diagnostics: diagnostics/editable-rich-50000-final-diag.json, docx-html-export-probe.mjs, homepage-404-probe.mjs
- Reruns: reruns/*.log (Chromium, the dev cross-check, the 02:05 clipboard run, Firefox, WebKit, the final toast run), reruns/build-final.log, reruns/snapshot-final-files.sha256
- Specs: apps/www/tests/browser/markdown-streaming-contract.spec.ts and a reported toast spec whose evidence file is no longer available.
  - oxfmt, oxlint and a scoped `tsc -p` (www tsconfig) are all clean.
  - The only edits after the last browser run were type annotations.

Cleanup
- Stopped every server I started (:3531 through :3538); no listeners remain on those ports.
- Removed worktrees s5/wt-cand, s5/wt-base and s5/wt-final with `git worktree remove --force`, after unlinking their node_modules symlinks. `git worktree list` shows none of them, and main's node_modules is intact.
- I changed no git state in the main checkout. The Stop hook staged my new spec and receipt files; I did not.

Open gaps
1. The matrix ran on the 02:05 snapshot, and S5's exit needs final code. Rerun: new snapshot plus two builds (~2 min), then the two matrix commands in setup.json (~60 min).
2. The editable preview fails because it publishes with value.replace. Adopting there needs a different publication path, not a parser change.
3. Fixing the static renderer's memo miss (a new view per commit) should widen every static and AI margin. Rerun after it lands.
4. The candidate's strict finals (+1% to +10%) and the intermittent editable-final spike are unexplained. Next step: a traced repro until a spike is captured.
5. Heap was probed only at 10 KB, once per arm.
6. The href assertion and the webpack HTML-export failure need an owner decision.
