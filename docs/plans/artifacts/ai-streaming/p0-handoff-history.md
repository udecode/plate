# Execute AI streaming and Markdown demo architecture

Objective:
Execute the accepted [architecture plan](2026-09-10-ai-streaming-and-markdown-demo-architecture.md), preserving rich text, Markdown/MDX, ordinary editor behavior, and the stated correctness and performance gates.

Execution authorization:
The user requested implementation of the exact plan, then pulling latest next. The earlier planning-only limit is superseded. No commit, push, PR, release, or tool goal was requested.

Status: **Partial implementation, not complete.** P0 has local changes and focused proof. P1 has diagnostic baselines. P2–P5 runtime changes remain unimplemented. The plan expressly permits independent P0 delivery; performance-sensitive targets require prototype evidence before adoption.

Source boundary: clean `next` fast-forwarded from `1a52e4b5bc` to `f03d2b8c23`. All following changes are uncommitted on that base.

First checkpoint / Work Checklist:
- [x] Pull origin/next first; clean next fast-forwarded to f03d2b8c23.
- [x] P0: absent-property deletion is a no-op; preserve existing deletion, other updates, compare/merge, split, named roots; investigate general empty publication only on separate proof.
- [x] P0: bottom-layer regression and List + Markdown + AIChat paragraph/column exact replay.
- [ ] P0: Plate/PlateStatic × Columns, Links, Lists, List With Image, Nested Structure Block, Table; forward/back, play/pause/replay/reset/scenario/mode switches and unmount cancellation; reproduce control failures before fixes; accessible controls and honest mode labels.
- [ ] P1: freeze full parse, intermediate prefixes, insertion/edit/dialog and Undo baseline on identical recorded chunks.
- [ ] P2: raw model source is the only parser input; no serialization feedback; zero/duplicate/stale events, replacement snapshots, multi text parts, final tail; preserve streaming Markdown/MDX rich text and current codec.
- [ ] P2: arbitrary chunk partition final semantic equivalence, excluding only proven nonsemantic runtime identities; nested/self-closing MDX, every tag/attribute/expression truncation, quotes/comments/fences; links/footnotes/setext/list continuation and whitespace.
- [ ] P3: shared operation identity/target/state for insert/edit/dialog, independent draft after view prototype proof; Stop partial preview differs from final parse; no placeholder persistence; visible errors, no automatic production mock.
- [ ] P3: accept one new history batch including suggestion cleanup/selection; one Undo/Redo, double Accept idempotence; discard preserves redo, retry uses same target; user edits/collaboration/target deletion/anchors, named roots/discrete selections/table/comments separately proved.
- [ ] P4: prototype before target lock; no speculative parser/framework/cache/worker; retain full correct fallback for backward syntax dependencies; preserve live original-position suggestions, scrolling intent and background completion flush.
- [ ] P4: 1/10/100 KB plus 1 MB stress; 1/16/128-character and recorded chunks; vary background and target size separately; long paragraph/table/code/math/MDX and backward dependencies; 3 warmups/10 measurements, cold/warm p95/noise plus bytes/diff/node/render/history counters.
- [ ] Freeze budgets before candidate results: 100 KB preview p95 ≤16 ms, final preview/Accept/Undo/Redo ≤100 ms, ordinary regression ≤10% and ≤2 ms beyond measured noise; stress/MDX explicit limits, no after-result relaxation.
- [ ] P5: remove proven redundant owners/fields only after callers/exports/types/docs/tests adoption; best-api repair for changed reusable API; changesets, registry changelog, generated registry on next, barrels when needed.
- [ ] Verification: focused Plate tests, actual Plite test runner and counts, check:plite:dev then strict check:plite, owning Plate typecheck/lint and Browser; no autoreview on next.
- [ ] Preserve current Markdown/MDX import/export/custom nodes, live rich text, in-place review, insert/replace/below, comments/tables, normal input/selection/non-AI history/collaboration; Copilot excluded.
- [ ] No parser replacement, plain-text downgrade, alternate HTML/JSON protocol, swallowed errors, relaxed correction-cycle detection or weakened semantic assertions.
- [ ] No commit, push, release or PR. Final handoff: changed owners, actual tests/browser/performance evidence, open gates/risks and uncommitted status. No timing requirement.


## Current decisions

| Owner | Decision | Evidence and boundary |
| --- | --- | --- |
| Plite setNodes | Skip deletion when the node does not own the property | Null/undefined deletion generated internal empty changes. Public empty publication was already filtered; no general commit publication change is warranted. Existing deletion, custom compare/merge, split contracts and named roots remain covered. |
| Demo controller | One cancellation generation and one playback path for both render modes | Reset and navigation invalidate old async writes. Pause, replay, scenario and mode switches use the same local controller. Error text includes scenario and chunk. Unmount cleanup invalidates the pending loop; explicit mounted teardown proof remains open. |
| Static rendering | Supply a fresh immutable value to the static editor | Mutating the same editor plus forceUpdate left output blank under React compilation. |
| Static schema kits | Include image in indent/list targets | Exact List With Image playback raised an image indent schema error. Targets match the live kits. |
| Columns fixture | Use the installed codec's columnGroup tag | Both full parsing and streaming preserved column_group as literal text. This changes only the demo fixture; the original snake-case input still owns the no-op correction regression. No codec compatibility alias is added. |
| Raw-source parsing | Reject naive full parse per chunk as the production replacement | Disposable probe fails the frozen 100 KB preview budget before draft reconciliation or rendering. No new parser, cache, worker, or public API is introduced. |
| Independent AI draft | Keep the target provisional | Current Plite projection store decorates ranges; it does not render arbitrary replacement block trees. A second named root does not prove save/collaboration isolation. No generic draft/fork engine is added. |

## Verification evidence

| Gate | Result | Reproduction |
| --- | --- | --- |
| Plite no-op RED | Internal observer counted 2 changes; expected 0 | The original publish-only assertion passed and was rejected as a proxy. |
| List/Markdown/AI RED | Opening column group after a paragraph with AI text marks raised list:corrections.0 | Without AI text marks, the minimal test did not reproduce the route. |
| Plite transforms | 63 tests passed | `bun test --preload ./config/plite-source-test-setup.ts packages/plitejs/test/runtime-contracts.test.ts --test-name-pattern 'plite transforms contract'` |
| Plate AI/List | 93 tests passed across 4 files | Architecture plan section 6 focused command. |
| Existing stream insert/history | 20 tests passed across 2 integration files | `bun test ./apps/www/src/__tests__/package-integration/ai-chat-streaming/streamInsertChunk.slow.tsx ./apps/www/src/__tests__/package-integration/ai-chat-streaming/streamHistory.slow.tsx` |
| Demo Browser | Both modes and all six scenarios replayed; final Columns rendered three real columns with 1, 2, 3 after fixture repair | `/blocks/markdown-streaming-demo`, source dev server on port 3000, in-app Browser. Initial 33/33 with literal markup was rejected. |
| Browser regression | 4 tests passed in 40.5 seconds; no retries | `cd apps/www && PLAYWRIGHT_BASE_URL=http://localhost:3000 pnpm exec playwright test tests/browser/markdown-streaming.spec.ts` |
| Scoped lint | Seven final product/test files passed | `pnpm exec ultracite check` with the changed files. |
| Registry output | Final build succeeded after fixture edit | `pnpm --filter www build:registry`; 366 canonical payloads and 15 overlays. |
| Registry changelog | Final generated source/check passed | `node tooling/scripts/generate-ui-changelog-entries.mjs --check` |
| Package typechecks inside strict Plite | Passed | `pnpm check:plite` package typecheck phase. |
| Strict Plite | Failed: 1547 pass, 1 fail in core tests; later strict phases did not execute | Unchanged benchmark source-shape assertion at `packages/plitejs/test/core-benchmark-scripts-contract.ts:481`. Both assertion file and donor compare file match HEAD. Not dismissed as a passing gate. |
| Development Plite | Failed app typecheck | `pnpm check:plite:dev`; after required reinstall and a declaration build, app typecheck still reports missing Plate core reexports and basic-marks argument errors. Package typecheck success does not close this app gate. |
| Regression method repair | 64 workflow tests passed; source/mirror parity passed | `node --test .agents/rules/regression/scripts/validate-regression-plan.test.mjs`; `pnpm install` regenerated the skill. |

Pinned local pnpm invocation: `npx --yes pnpm@10.11.0` avoids the local launcher no-TTY issue. The repository manifest was not changed.

## Baselines and prototype limits

The executable diagnostics and JSON results live in [artifacts/ai-streaming](artifacts/ai-streaming). They run as top-level probes under the repository Bun test loader; their output reports **zero tests**, so none are added to test counts.

- `bun test ./docs/plans/artifacts/ai-streaming/baseline-probe.ts`: six inputs, 1/16/128-character chunks, exact semantic equality without excluded properties. Eight of eighteen rows match, seven differ, and three have an empty full-parser result, so their oracle is unavailable. The legacy Columns tag is an invalid semantic fixture for proving actual columns. These diagnostics do not freeze the full required correctness corpus.
- The same probe refreshes edit-mode Undo: one block and three updates produce two batches after Accept; two blocks produce four. One Undo exposes temporary suggestions in both. Existing insertion preview/history tests pass; edit-mode proof cannot borrow that success.
- `bun test ./docs/plans/artifacts/ai-streaming/parse-probe.ts`: one cold run, three warmups, ten measured parses. At 100 KB, paragraphs p95 ~521 ms, one paragraph ~37 ms, code ~4 ms. This is parser-only and was not isolated from all background tool activity. The 1 MB paragraph row was interrupted after several minutes and has no result. It remains required stress work.
- `bun test ./docs/plans/artifacts/ai-streaming/raw-source-probe.ts`: same last 128 characters, same source, alternating measurement order, one cold run, three warmups, ten samples. At 100 KB, current insertion p95 ~389 ms versus raw parse alone ~610 ms for paragraphs. One paragraph was ~44 ms versus ~141 ms, with a clear candidate outlier; ordinary raw samples were still ~31–34 ms. Both lanes match full semantics on these six inputs. The candidate deliberately omits reconciliation/rendering, so this is a rejection probe, never an acceptance benchmark or a claim that all raw-source approaches are slower.

The 16 ms preview and 100 ms finish/action budgets remain unchanged. No benchmark exception is accepted. The complete three-flow, background-size, syntax-dependency, rendering, history-size, and 1 MB matrix remains open.

## Failed fix history and methodology repair

Case `markdown-demo-semantic-output`, attempt 1: final visual verification invalidated the broad demo success claim. Diagnostic on frozen product bytes: progress 33/33 and expected text were present, but both modes rendered zero column components. Installed codec ownership established the positive outcome: three typed columns containing 1, 2, 3. The demo owns private fixture/chunk/controller wiring, so its mounted browser regression is the authoritative fixture replay; the package test remains scoped to the distinct correction-cycle case.

Repair-now: Regression source rule and validator require `semantic-shape:` in an applicable model oracle for Markdown/MDX claims. A workflow test rejects a text-only success packet. Source and generated mirrors were synchronized and compared. Agent-native audit: the requirement is discoverable from the skill, has one source owner, a runnable rejection test, and generated parity.

Attempt 2: corrected only the stale demo tag. Three columns rendered. The first rerun then failed because its text locator included live drag handles (`⠿1` rather than `1`). Frozen-byte diagnosis identified oracle sampling, not another product error. The test reads actual `[data-plite-string]` descendants while retaining exact column count and the forbidden literal-tag assertion. Final rerun remains the authority.

## Completion Gates / Open risks

- [x] Final browser regression and visual semantic replay after all source changes.
- [x] Final lint, generated registry/changelog freshness and diff hygiene.
- [ ] Failed strict/dev gates resolved on final bytes; no full-clean claim until then.
- [ ] P1 complete correctness/performance baselines, including valid canonical MDX fixtures and recorded stream partitions.
- [ ] P2 raw source and transport identity implementation after a passing incremental prototype.
- [ ] P3 independent in-place draft proof, all three flows, one Accept/Undo/Redo, conflicts, comments and table integration.
- [ ] P4 frozen performance gates with full user-facing measurements and stress coverage.
- [ ] P5 obsolete runtime adoption/removal, public teaching/doctrine repair if APIs change, final package and browser proof.

No public API shape changed in the current P0 packet. Barrel generation is not applicable. No templates were edited. Changeset and registry changelog cover the local runtime/demo fixes. The original P0–P5 task is not complete and no completion checker result is claimed.


Final local proof inputs (SHA-256):

Focused final reruns: 63 Plite transforms, 93 Plate AI/List, 20 stream integration, and 4 browser tests passed. The `.slow.tsx` files require explicit `./` file arguments; without them Bun filters them out when mixed with spec paths. Regression method tests: 64 passed. No test count includes the diagnostic probes.

- `packages/plitejs/src/transforms-node/set-nodes.ts`: `c752df2d53e4f318726768ae90adaa44b82745bff111fe70488f156927cdf405`
- `packages/plitejs/test/transforms-contract.ts`: `801f5fe23d787192fe9a379d5b9e3e685ccd73a3f8e56e11f275c9371b6bf1e3`
- `packages/platejs/src/ai/react/AIChatPlugin.streaming.spec.ts`: `d9a52decc6d851d3099556b329519a161387a3788803d073f6342375022f2d88`
- `apps/www/src/registry/examples/markdown-streaming-demo.tsx`: `94921a680f547b16ad0b5e54d0227efc046b0cb736515bd59141efbda1ea54e0`
- `apps/www/src/registry/components/editor/indent-static.tsx`: `cdfa7ee1a60345fba093846359baa796c7c8f42ec54d92311ffc2f4bd101ddb7`
- `apps/www/src/registry/components/editor/list-static.tsx`: `8da43a4183d37eba9abad38d7e28a35624c0c68d86642c0bf3936f8a150ea74b`
- `apps/www/tests/browser/markdown-streaming.spec.ts`: `6e87f06cb862dc55b816e97511f5ccecd20bc780ca06bd00ce5b793fc64ba718`

### Continued implementation after “完成所有的”

The full P0–P5 scope remains active. P0-only delivery is not the stop condition.
All following results are local candidate evidence, not final closure.

- Raw-source parser: 60 semantic tests pass, including 19 fixtures at 1/16/128
  characters, replacement snapshots, duplicate suppression and unknown global
  transforms. It lives privately in the Markdown owner; AI does not import
  parser peers directly.
- Matched tail prototype: 100 KB paragraph p95 1.12 ms versus 428.38 ms;
  single paragraph 0.27 ms versus 153.80 ms. Three warmups and ten measured
  samples; six rows match full Markdown semantics. These are parser-only
  measurements. Full render, diff, completion, Accept/Undo/Redo and stress gates
  remain open. Receipt: `artifacts/ai-streaming/incremental-benchmark.json`.
- Detached operation prototype: 6 tests / 39 assertions passed before integration.
  Package integration tests now exercise one formal Accept, double-accept no-op,
  text and node selection, named roots, discrete targets, user edits, deletion,
  late events, Stop and redo-preserving discard.
- Canonical stream mutation, serialization feedback, `_blockChunks`,
  `_blockPath`, `_mdxName`, preview properties and private AI history batching are
  being removed. Old integration tests and public teaching still need adoption.
- First in-place Browser prototype rendered Columns 33/33 with three actual
  columns through an independent PlateStatic value. The static renderer uses
  explicit document reads and presentation descriptors from the existing static
  kit, backed by the live schema. No second editor is created.
- Static prototype caught an integration gap: Markdown's configuration callback
  cannot be projected as presentation. The kit now names its presentation
  descriptors separately and appends Markdown configuration afterward. This
  preserves one descriptor list and does not execute arbitrary callbacks.
- HTTP failures no longer select demo output. Demo transport is explicit.
  Text parts are accumulated inside the request-bound transport. Table/comment
  payloads are being migrated to staged results with formal writes on Accept.
- Final type, package, browser, scale, release-artifact and doctrine gates remain
  pending until every adopted path is rechecked together.
