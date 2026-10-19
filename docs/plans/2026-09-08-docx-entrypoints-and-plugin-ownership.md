# DOCX entrypoints and plugin ownership

Objective:
Implement the accepted DOCX API and dependency split while preserving conversion and paste behavior.

Flow mode:
accepted-plan local execution

Goal plan:
docs/plans/2026-09-08-docx-entrypoints-and-plugin-ownership.md

Primary template:
docs/plans/templates/plate-plan.md

Applied packs:
- performance-observability: embedded paste pipeline architecture probe.

Mode:
Standard execution. The user authorized the combined proposal with "ok go" on 2026-09-08. Current checkout is `next`. No publication, checkout changes, cross-project sync or cmdk work is authorized.

Completion threshold:
All accepted APIs implemented, every current consumer migrated, conversion and paste guards green, generated output current, packed dependency isolation proven, documentation and affected doctrine current, exact browser proof recorded, and `check-complete` passing.

Verification surface:
Plate DOCX package, copied DOCX/import/export UI, DOCX docs, entrypoint DAG and packed optional peers. Plite substrate is unchanged.

Constraints:
Use the current checkout, preserve conversion correctness and remote-image opt-in, generate mirrors from their owners, and keep all work local. Native Word application certification and unrelated package dependency repairs are outside this request.

Boundaries:
- `platejs/docx` exports `DocxPlugin` only; it owns paste and private CSS inlining.
- `platejs/docx/import` exports `importDocx(editor, buffer, options?)` and result types. It returns nodes/comments/warnings without modifying the editor.
- `platejs/docx/export` exports the existing `exportToDocx(value, options?)` and its types.
- Remove `DocxImportPlugin`, `DocxImportDefinition`, `DocxPastePlugin`, `JuicePlugin`, `platejs/juice`, and their obsolete capability keys. No aliases.
- Keep private Word HTML cleanup reusable by paste and file import without importing either public entrypoint into the other.
- Lazy-load converters inside the copied toolbar actions.
- Preserve conversion algorithms, stylesheet order, comment positions, warnings, and remote-image opt-in/default-false behavior.
- No native Word certification, new formats, release, commit, push or PR.

Output budget strategy:
Read exact owners and summarize proof receipts; retain full results in artifacts.

Blocked condition:
No DOCX implementation blocker remains. The repository-wide release-artifact check fails because required `use-sync-external-store` reaches optional React. The separate packed DOCX proof verifies converter isolation while explicitly allowing that existing React path; it is not a green full release check.

Plate Plan state:
- status: complete
- phase: local handoff
- next: local handoff
- handoff: prepared with explicit broader-check and native clipboard limits

Start Gates:
| Gate | Applies | Evidence |
| --- | --- | --- |
| Requirements and authority captured | yes | Accepted API discussion and "ok go"; current `next` branch read at intake |
| Current owners read | yes | `src/docx/{paste,import,export}/lib`, `src/juice/lib`, DOCX kit/toolbars, DOCX docs, `tooling/entrypoints/entrypoint-dag.mjs` |
| Best API target resolved | yes | Decision ledger below; plugin-free file conversion and independent entrypoints have current user jobs |
| Runtime scale applicability resolved | yes | Merge two paste codec callbacks into one; exact transform functions/order retained. No new per-node machinery. File conversion loops unchanged; loading boundaries verified by dependency proof |
| Pre-acceptance probe passed | yes | `artifacts/docx-entrypoints/pre-acceptance.json`; four matched cohorts, 93 assertions |
| Mode and execution boundary resolved | yes | Local execution only; no Autoreview on `next` |

Decision brief:
- outcome: three independent DOCX jobs with one paste plugin and two file conversion functions.
- chosen shape: `DocxPlugin` from `platejs/docx`; `importDocx` from `platejs/docx/import`; `exportToDocx` from `platejs/docx/export`.
- strongest rejected alternative: remove all DOCX plugin ownership and call everything manually. Clipboard codecs require installed lifecycle, so retain one paste descriptor. File conversion has no such requirement.
- consequence: apps install only the plugin and peers they use; toolbar converter modules load on action. Juice remains an implementation dependency of paste and export.

Decision ledger:
| Surface | Current | Target | Owner | Reason | Adoption | Proof | Risk | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| File import | Stateless plugin API wrapper | Plain `importDocx(editor, buffer, options)` | DOCX import function | Editor only supplies configured HTML decoding | Tests, toolbar, roundtrips and docs | Existing mocked/fixture tests, no plugin installation | Preserve comments and decode warnings | remove wrapper |
| Paste | Separate Juice and Word descriptors | `DocxPlugin` with Juice before Word cleanup | DOCX plugin | One clipboard operation, no independent current Juice consumer | Kit, integration tests, keys, docs | Existing tests and four-cohort equivalence | Non-Word CSS and comment guard must survive | merge |
| Module graph | Root eagerly reexports all converters | Root paste plus independent import/export subpaths | Entrypoint DAG/build/package exports | Optional large conversion graphs have independent jobs | All import sites, source paths, registry peers | Packed JS/declarations with only declared peers | Shared cleanup must not drag in Juice/Mammoth/export | split |
| Toolbar | Static converter imports/plugin lookup | Dynamic import in each action | Copied toolbar family | Load a converter when used | Registry generation and installed consumers | Exact route plus package behavior | Loading failure remains caller-owned | change |

Execution slices:
| Slice | Owner | Scope | Entry | Exit | Proof |
| --- | --- | --- | --- | --- | --- |
| 1 | Plate Plugin Creator | Function extraction, plugin merge, private cleanup, API keys | Baseline 120/120 and probe green | No obsolete runtime API | DOCX unit/fixture guards and final probe rerun |
| 2 | Package/Plate UI | Entrypoints, generated tasks, toolbars, kit, integration callers | New APIs exist | Every current caller adopted | Source-first types, runtime DAG and packed optional-peer proof |
| 3 | Technical Writing/Best API | Public docs and affected doctrine | Final API verified | Teaching current and mirrors generated | Docs checks, stale-teaching audit, doctrine version validation |
| 4 | Verify Plate | Real routes, registry consumer and final evidence | Generated registry current | Actual route and narrow state proven; limits explicit | Installed consumer checks, browser receipt, goal completion checker |

Proof matrix:
| Claim | Planning evidence | Execution proof | Status |
| --- | --- | --- | --- |
| Paste output/order preserved | Current Juice then Word source and pre-acceptance receipt | `production.json`: four cohorts, 93 assertions; 120 DOCX tests | pass |
| Import result independent of plugin | Only editor use is HTML deserialization | 39 real fixture/roundtrip tests plus import unit guards; explicit unchanged editor-value assertion | pass |
| Export security unchanged | `allowRemoteImages` defaults false in current converter | Export implementation unchanged; existing export guards included in the 120 tests | pass |
| Independent module graph | Exact root exports and dependency DAG identified | Three packed entrypoints pass runtime, NodeNext and Bundler; converter exclusions enforced | pass for DOCX; global React limitation below |
| Copied consumers work | Kit and toolbar owners read | www types, four installed builds and interactive consumers, real file import/download, 390px state | pass |
| Current teaching | DOCX reference and doctrine owners identified | DOCX docs render with hydrated preview; source checks and Plate Next v169 validation | pass |

Scale contract:
- Embedded architecture probe, not a broad performance investigation.
- Operation: transform pasted HTML; old `JuicePlugin` then `DocxPastePlugin`, proposed fused callback with the identical functions and order.
- Cohorts: 10/100/1000 Word paragraphs with one CSS rule; pathological 300 paragraphs with 120 CSS rules.
- Frozen budget: target median <= baseline median * 1.2 + 2 ms; maximum <= baseline maximum * 1.35 + 5 ms. No budget override.
- Sampling: 3 warmups, 11 interleaved samples; report median/max and raw samples, not unsupported tail percentiles. Cold first-run durations recorded.
- Deterministic work: codec dispatch callbacks 2 -> 1; one Juice pass and one Word transform; identical input bytes and output hash for each cohort. No cache, subscription, query, scheduler or retained editor data added.
- Baseline/prototype and harness identities: SHA-256 in `artifacts/docx-entrypoints/pre-acceptance.json`, measured Bun/OS/CPU and lockfile recorded. Disposable source/harness in `/tmp/plate-docx-split`.
- Pre-acceptance: four cohorts pass; 93 equality/budget assertions. Medians range 1.28–81.03 ms for the target.
- Final production rerun: `DOCX_PROBE_TARGET=<absolute final DocxPlugin.ts> DOCX_PROBE_OUTPUT=docs/plans/artifacts/docx-entrypoints/production.json bun test /tmp/plate-docx-split/probe.spec.ts`; then `bun test packages/platejs/src/docx`.
- File import/export: unchanged conversion bodies and iteration counts, so no new algorithm benchmark; dependency size/reachability measured separately by the existing packed-artifact gate.
- Production detector: N/A, no telemetry owner or requested latency contract. Synthetic fixture data only; no user input logged.
- Browser events and end-user latency are outside this embedded probe; real clipboard/toolbars belong to final route proof.

Work Checklist:
- [x] Read Poteto Principles, Refactoring, relevant migration principle, Plugin Creator mechanics, public docs mechanics, Technical Writing and Best API doctrine-repair method.
- [x] Preserve original authority and complete accepted scope; maximum justified cuts and surviving owners are explicit.
- [x] Pin behavior before moves: `bun test packages/platejs/src/docx packages/platejs/src/juice` -> 120 pass, 0 fail; baseline log `/tmp/docx-baseline-tests.log`.
- [x] Materialize performance pack obligations here; freeze cohorts/budget, run disposable prototype before implementation, retain exact source/output identity.
- [x] Implement all four decision rows without compatibility wrappers.
- [x] Preserve Word/non-Word CSS inlining and style-comment workaround, comments/warnings, and remote-image default false.
- [x] Migrate current code, tests, docs and registry; preserve immutable history and CI-owned templates.
- [x] Generate barrels, entrypoint tasks/source aliases, registry output and docs data from their owners.
- [x] Prove package/www types, scoped lint, real DOCX fixtures/roundtrips, installed registry consumers and packed DOCX converter isolation; retain the failed broader gate explicitly.
- [x] Rerun the identical scale contract on final production source and correctness guards.
- [x] Verify exact real demo and narrow state, record native/capability limits, and separate runtime from type-only evidence.
- [x] Apply Best API repair, smallest durable Vision owner if changed, Plate Next doctrine version and generated mirrors. No broad workflow rewrite.
- [x] Reconcile every original acceptance obligation, record final teaching/proof risks, and pass the goal completion checker.

Conditional evidence:
- Canonical/view state: N/A; no editor state or view owner added. Import returns a detached snapshot; insertion remains caller-owned.
- Native/security: preserve original input, Word HTML/RTF behavior and remote-image opt-in. Real Word application certification is not claimed.
- External research: N/A; current implementation/dependency sources suffice for this accepted API move.
- Public issue/PR provenance and publication: N/A; no external issue or publication request.
- P1 Autoreview: N/A on `next`; direct inspection and Best API semantic review still apply.
- Database/pooling/concurrency/privacy: N/A; transformations remain synchronous per payload, import is one async conversion, no retained state or protected data in evidence.

Completion Gates:
| Gate | Applies | Required action | Evidence |
| --- | --- | --- | --- |
| Final API and adoption | yes | Resolve all four rows and stale current callers | Root exports only DocxPlugin; converter subpaths export only their operations; current callers migrated, historical release/migration prose preserved |
| Scale and correctness | yes | Final rerun using frozen contract and fixture guards | `production.json`, 120 DOCX tests, 39 real fixture tests and 14 registry tests |
| Packed dependency truth | yes | Independent declarations/runtime with minimal DOCX peers | `packed-docx-proof.json`: 3/3 runtime and both declaration modes; global required React path explicitly excluded from this scoped claim |
| Docs/registry/browser | yes | Run exact affected checks and route proof | Package 81/81 types, www types, 366 registry payloads/15 overlays, four installed builds and interactions, final DOCX import and inspected downloaded artifact |
| Doctrine repair | yes | Current rules, immutable version append, generated mirrors | Best API, Plugin Creator, Task docs and Vision owners updated; pnpm install synced mirrors; Plate Next v169 valid |
| P1 Autoreview/publication | no | N/A on next; no publication authority | N/A |
| Goal plan complete | yes | `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-09-08-docx-entrypoints-and-plugin-ownership.md` | Pass; receipt stored in `artifacts/docx-entrypoints/logs/goal-check.log` |

Phase / pass table:
| Phase | Status | Evidence | Next |
| --- | --- | --- | --- |
| Ground and decide | complete | Baseline, accepted target, dependency inventory and probe | Complete |
| Execute | complete | Four decision rows implemented and adopted | Complete |
| Prove and hand off | complete | Full matrix above; limitations explicit | Local handoff |

Findings:
- Import has no lifecycle/state beyond capturing the editor for one HTML decode call.
- Existing Juice transforms ordinary HTML too; placing inlining inside a Word-only branch would regress current kit behavior.
- Juice is shared by paste/export; Mammoth and export-only conversion libraries must remain separately reachable.
- The shared Word HTML cleaner is a private owner used by paste and file import. Moving it out of the paste directory keeps file import independent of Juice.
- Word `@list` declarations must be read from the original HTML because Juice strips them. The fused pipeline retains that input for list-style metadata.

Decisions and tradeoffs:
- 2026-09-08: User accepted one DOCX paste plugin, standalone file operations, split subpaths and private Juice integration. No aliases retained.
- 2026-09-08: Probe preserved exact output across all cohorts and passed the predeclared budgets; proceed to production implementation.

Review fixes:
- Removed the obsolete Juice release entry and migrated schema-guard examples to surviving APIs.
- The import toolbar loads its module and reads the selected file concurrently inside the file action.
- Agent Native Reviewer: pass for the affected teaching and operation routes. The map below identifies the native clipboard evidence gap without hiding it.

Agent action parity:
| User action | Agent route | Source owner | Discovery and mirror | Proof | Status |
| --- | --- | --- | --- | --- | --- |
| Install paste support | Plate Plugin Creator and Plate UI | `packages/platejs/src/docx/paste/lib/DocxPlugin.ts`; registry `docx.tsx` | DOCX reference and generated registry | Package tests, packed root, installed editors | pass |
| Import or export a file | Explicit public functions and actual file chooser/download controls | DOCX import/export owners and copied toolbars | DOCX subpath reference and generated payloads | Real fixture import, inspected DOCX download, isolated declarations/runtime | pass |
| Maintain the API boundary | Best API and Task docs | `.agents/rules/best-api.mdc`, Plugin Creator creation flow, Task docs reference, `docs/vision/plate.md` | Generated skills after pnpm install | Plate Next v169 validation and source/mirror readback | pass |
| Verify native clipboard styling | Chrome/native clipboard controls through Verify Plate | Paste codec and existing fixture guards | Verify Plate route | Synthetic payload could not be reliably delivered by the clipboard bridge; unit/fixture transform proof retained | capability gap; no native Word claim |

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
| --- | ---: | --- | --- |
| Juice strips Word list declarations | 1 | Read declared list styles from the original input | Existing paste guard passes |
| Root release-artifact check reaches React through required use-sync-external-store | 1 | Run scoped packed DOCX converter isolation without changing the full gate | Three DOCX graphs pass; full release gate remains failed |
| Missing generated docs server module during concurrent dev generation | 1 | Regenerate through the owned www typecheck flow | Final www typecheck exits 0 |
| Sequential independent awaits lint finding | 1 | Load the module and file buffer through Promise.all | Final scoped lint exits 0; actual import replay passes |
| Browser download event wait misses the native file | 1 | Inspect the saved native Chrome download | Valid ZIP and Word document XML captured in chrome-export.docx |
| Native clipboard bridge delivers another payload | 1 | Preserve the limitation and use exact owned transform/fixture proof | Native styled paste is not claimed |
| Native AX checkbox role differs from hydrated DOM button role | 1 | Read the fresh DOM snapshot and target the observed heading button | Both installed full editors change the heading to level 2 |
| macOS /var path resolves to /private/var during cleanup | 1 | Compare resolved cwd paths before signalling owned PIDs | All five owned servers stopped |

Verification evidence:
- Baseline package behavior: 120/120, 265 assertions, 16 files.
- Embedded paste prototype: 1/1, 93 assertions; all four cohorts within frozen budget.
- Final production probe: 1/1, 93 assertions, all four cohorts pass the unchanged budget. `production.json` records source/input/output identity and every sample; original and final probe sources are preserved under `probe-source/`.
- Final DOCX package behavior: 120/120, 267 assertions, 15 files (`logs/docx-tests.log`).
- Real file conversion/cleanup/roundtrips: 39/39, 40 assertions, 25 files (`logs/fixture-tests.log`).
- Registry/demo guards: 14/14, 1,569 assertions; schema guard: 61/61; entrypoint contracts: 38/38.
- Package source-first typecheck: 81/81 tasks. Final www typecheck, docs source parity, editor/API generation checks and scoped lint exit 0.
- Package build: 4/4. Barrels generated through `pnpm brl` and nested barrelsby; entrypoint tasks/source aliases generated and checked current.
- Registry generation: 366 canonical payloads and 15 sparse overlays. Four Base/Nova and Radix/Luma editor-basic/editor-ai installs and production builds pass. `installed-consumers.json` captures native character input in all four and heading conversion in both full editors; two errors originate from the user's Chrome extension, not the app.
- Packed DOCX: all three entrypoints export the expected single runtime API, pass NodeNext and Bundler declarations, and exclude sibling converter packages. The import graph legitimately includes JSZip through Mammoth. The unrelated React exception is recorded in the receipt and the original failed global log is retained.
- Chrome `/blocks/docx-demo`: the final toolbar imports `headers.docx`, rendering the expected heading levels and final paragraph. `browser-import.json` captures Mammoth/import chunks requested only after file selection; `browser-import-final.json` captures the final Promise.all implementation replay.
- The final import receipt retains two earlier HMR errors from 19:18 while registry generation temporarily removed `public/r/registry.json`. Their timestamps precede the successful final replay; the regenerated registry exists and the fresh docs preview has no captured errors. The original errors are preserved.
- Chrome export: saved 20,354-byte DOCX inspected as a ZIP containing document XML; SHA-256 `b1dee9160adea403ccad97593ad9b07a8bf481a04cd6aca1b5a0d30a79b2cf94`. See `download.json` and `chrome-export.docx`.
- Narrow viewport: 390 x 844, imported document and reachable Word import menu inspected; viewport reset. The screenshot is `narrow.png`.
- DOCX reference `/docs/docx` renders current imports and hydrates its preview (`browser-docs.json`). English/Chinese source checks pass.
- Plate Next v169: registry valid, 2 active and 44 retired package records; existing attestations preserved. `source-fingerprints.json` records the final DOCX and consumer owners. All full command logs live in `artifacts/docx-entrypoints/logs/`.
- Cleanup: verification tabs closed and five owned servers stopped after cwd checks; temporary installed workspaces retained for reproducible evidence.

Final handoff prepared:
Implemented locally: DocxPlugin owns paste/private Juice, importDocx and exportToDocx have independent lazy-loadable entrypoints, and current callers/docs/doctrine are migrated. DOCX correctness, types, installed consumers and scoped packed isolation pass. The full release-artifact check has the unrelated React dependency failure above; native styled clipboard proof remains limited by the bridge. No commit, push or PR.

Timeline:
- 2026-09-08T18:39:40Z: Goal and Plate Plan created for accepted DOCX work.
- 2026-09-08: Grounding, baseline and pre-acceptance probe complete; production execution begins.
- 2026-09-08: Implementation, adoption, doctrine repair and final package/fixture/consumer/browser verification complete; artifacts retained for local handoff.

Reboot status:
| Question | Answer |
| --- | --- |
| Where am I? | Verified local handoff |
| Where am I going? | Local handoff; goal completion checker passed |
| What is the goal? | Three independent DOCX jobs, one paste plugin and two conversion functions |
| What have I learned? | See Findings and dependency ledger |
| What have I done? | See Timeline and verification receipts |

Open risks:
- Repository-wide release-artifact verification remains failed: required `use-sync-external-store` reaches optional React. This scope proves DOCX converter isolation while allowing that pre-existing path; it does not certify a release or universal minimal peer closure.
- Native Word application/OS clipboard styling is not certified. The bridge could not reliably deliver the intended synthetic styled payload; exact transform tests and real DOCX fixtures pass.
- File import preserves existing fragment insertion semantics at the selection. It does not replace the entire document automatically, and returned comment storage remains application-owned.
- All work is local and unpublished.
