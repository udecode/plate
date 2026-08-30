# Entrypoint runtime proof generation

Objective:
Generate runtime-classified entrypoint proofs; done when the canonical DAG
drives Node-import, headless, SSR, and real-browser proof lanes for every public
entrypoint and all four lanes pass.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-08-28-entrypoint-runtime-proof-generation.md

Template:
docs/plans/templates/plate-plan.md

Primary template:
docs/plans/templates/plate-plan.md

Applied packs:
- browser
- package-api
- agent-native

Mode:
- `standard`

Completion threshold:
- Every public runtime entrypoint has exactly one canonical
  `runtime: 'headless' | 'ssr' | 'client'` classification.
- One generated matrix drives four passing proofs: Node-import every public
  entrypoint; execute every headless entrypoint without React or DOM; render
  every SSR entrypoint without DOM; exercise every client entrypoint in a real
  browser.
- DAG validation, generated-state checks, packed artifact proof, owning
  typechecks, real-browser proof, docs/rule parity, and `check-complete` pass.

Verification surface:
- Canonical entrypoint DAG and generator contracts.
- Generated Turbo task/config and browser proof source.
- Packed `plitejs`, `platejs`, and `@platejs/test` release artifacts.
- Production Chromium proof in `apps/plite`.
- The exact `/docs/examples/server-side` and `/docs/examples/plate-to-html`
  consumers named by the user.

Constraints:
- Runtime describes where code executes, not what it controls. Node-hosted
  Playwright orchestration is `headless`; browser-loaded DOM code is `client`.
- Client entrypoints must still import safely in Node.
- Generated inventories replace hand-maintained lists.
- No public aliases, shims, new entrypoints, package splits, or feature behavior
  changes.

Boundaries:
- In scope: canonical runtime metadata, validation/generation, Turbo inputs,
  packed Node/headless/SSR proof, real-browser client proof, runtime docs/rules,
  and the two exact server consumers named by the user.
- Out of scope: generic invocation of every exported function, feature-semantic
  testing, package/public API changes, registry changes, and unrelated CLI
  watcher reliability.

Blocked condition:
- Block only if a public entrypoint cannot truthfully fit the accepted runtime
  union or an owning runtime proof cannot execute from its packed artifact. No
  such blocker remains.

Plate Plan state:
- status: completed
- phase: prove-and-handoff
- next: none
- handoff: prepared

Start Gates:
| Gate | Applies | Evidence |
| --- | --- | --- |
| Prompt requirements captured | yes | Runtime union and four proof lanes are the completion threshold |
| Active goal and plan verified | yes | Active goal points at this plan |
| Current owners read | yes | DAG, runtime/Turbo generators, packed checker, browser runner, static renderer, docs, and agent rules audited |
| Best API target resolved | yes | No reusable public call shape changes |
| Mode and execution boundary resolved | yes | Standard one-shot execution authorized by the user |
| Browser route / app surface identified | yes | `/runtime-entrypoints` plus both user-named www server routes |
| Browser tool decision recorded | yes | Production Chromium for the generated client matrix; in-app Browser for www routes |
| Console/network caveat recorded | yes | Runtime route has no network dependency; www returned 200 with no Next runtime overlay; third-party embeds are outside scope |
| Release artifact path selected | yes | No changeset: internal proof tooling/tests/docs and a private app example repair |
| Barrel impact recorded | yes | No export or exported-file layout changes |

Work Checklist:
- [x] Outcome, scope, non-goals, constraints, and owners are concrete.
- [x] Live DAG, exports, packed artifacts, docs, tests, and consumers were audited.
- [x] Public call-shape review is N/A because no public call shape changed.
- [x] Runtime, Node, headless, SSR, and client decisions have owner, adoption,
      proof, risk, and verdict rows.
- [x] No public breaks or compatibility bridge exist.
- [x] Execution slices and proof matrix are complete.
- [x] Browser route, expected outcome, and proof tool are recorded.
- [x] Screenshot/pixel, exact-report replay, immutable final-ref, clean-checkout,
      and 5/5 warm-run gates are N/A: this is a local module-execution contract,
      not a shipped visual/native interaction bug claim.
- [x] Generated browser source is checked for drift; no stub or bypass counts as
      proof.
- [x] Package/export/release-artifact impact is explicit.
- [x] No changeset or registry changelog is required because package API,
      runtime, types, config, exports, and registry source are unchanged.
- [x] Package typecheck/build/test and packed artifact proof are recorded.
- [x] Agent source rules were regenerated with `pnpm install`; source/mirror
      byte parity passed.

Completion Gates:
| Gate | Applies | Evidence |
| --- | --- | --- |
| Binary readiness | yes | 46 runtime exports exactly match 46 DAG rows |
| Fresh source evidence | yes | Final local DAG, packages, generated source, server consumers, docs, and mirrors audited |
| Best API review | yes | N/A: no reusable public call shape changed |
| Verification recorded | yes | See Verification evidence |
| Handoff prepared | yes | See Final handoff prepared |
| P1 autoreview | yes | N/A: branch is `next`; repository law forbids `autoreview` on `next` |
| Browser interaction proof | yes | 20-entrypoint production Chromium matrix and both named www routes passed |
| Browser console/network check | yes | No runtime-route network dependency; both www routes returned 200 and showed no Next runtime overlay |
| Browser final artifact | yes | Executable Chromium result and Browser DOM assertions; screenshot waived because no visual claim exists |
| Final ref / clean runtime | yes | Local uncommitted proof on base `98184323b5fde44e423d71d8597a6cfeb5c233f8`; no pushed-tree claim |
| Public package boundary proof | yes | Packed 4 packages, 51 public subpaths, and exact 46-runtime-entrypoint parity |
| Release artifact classification | yes | Internal tooling/tests/docs and private app example repair; no published user-visible delta |
| Package typecheck/build/test | yes | Owning typechecks, contracts, release build/checker, and browser build passed |
| Barrel/export generation | yes | N/A: no export or exported-file layout changed |
| Agent source/mirror parity | yes | `pnpm install` plus byte comparison passed for both changed source rules |
| Goal plan complete | yes | Run the plan checker after this final update |

Phase / pass table:
| Phase | Status | Evidence | Next |
| --- | --- | --- | --- |
| Ground | completed | Owners and runtime semantics audited | Decide |
| Decide | completed | Explicit host classification and generated proof ownership accepted | Prove and hand off |
| Prove and hand off | completed | Four lanes, docs/rules, server consumers, and closure checks completed | User review |

Decision brief:
- outcome: one executable runtime contract covers every public entrypoint.
- chosen shape: classify each DAG node by execution host and generate four
  orthogonal proof matrices from the same metadata.
- strongest rejected alternative: infer runtime from path names, imports, or
  handwritten test lists.
- consequence: adding or reclassifying an entrypoint fails generation until its
  correct proof exists.

Decision ledger:
| Surface | Current | Target | Owner | Adoption | Proof | Risk | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Runtime classification | DAG lacked host data | Required runtime on every node | Entrypoint DAG | 46 public JS nodes | Generator contracts | Misclassifying Node-hosted browser control | complete |
| Node import | No exact runtime coverage parity | Generated universal lane | Packed checker | 46 nodes | Packed Node execution | Optional peers | complete |
| Headless execution | Type/runtime peer closure was conflated | React-free and DOM-free runtime lane | Packed checker | 25 nodes | Isolated packed Node processes | Type-only React false positives | complete |
| SSR rendering | No generated behavior adapter | DOM-free real HTML render | Runtime generator | `platejs/static` | Packed SSR process | Entry-specific adapter | complete |
| Client execution | No exhaustive generated browser inventory | Generated real-browser lane | `apps/plite` | 20 nodes | Production Chromium | Bundler resolution | complete |

Execution slices:
| Slice | Owner | Exit | Proof |
| --- | --- | --- | --- |
| Contract | Entrypoint DAG | Every node classified and validated | Generator tests |
| Node lanes | Packed checker | Node/headless/SSR matrices pass from tarballs | `pnpm plite:release:packages` |
| Browser lane | Plite app | Every client node executes in Chromium | Focused browser test |
| CI/Turbo | Task generator | Exact inputs and generated state are current | Turbo contracts/check |
| Closure | Repository | Consumers/docs/rules current | Typechecks, Browser, mirror parity |

Proof matrix:
| Claim | Execution proof | Status |
| --- | --- | --- |
| Every public runtime entrypoint Node-imports | Packed Node lane: 46/46 | passed |
| Headless entrypoints execute without React or DOM | Isolated packed Node lane: 25/25 | passed |
| SSR entrypoints render without DOM | Packed static HTML render: 1/1 | passed |
| Client entrypoints execute in a real browser | Production Chromium matrix: 20/20 | passed |

Conditional evidence:
- Optional peers: 37 exact packed direct-peer closures passed.
- Browser: client matrix and both exact server consumer routes passed.
- Docs and agents: runtime contract documented; source rules and generated skill
  mirrors are current.
- External research and issue/PR provenance: N/A; repository code and executable
  artifacts are authoritative for this local architecture task.

Findings:
- Runtime is the module execution host. Playwright orchestration is headless even
  when it controls a browser.
- Node importability is universal and separate from runtime classification.
- The public JavaScript inventory is 46: 25 headless, 1 SSR, and 20 client. The
  packages expose 51 public subpaths because not every subpath is a JS runtime
  export.
- `platejs/excalidraw` references React in declarations but does not load React
  at runtime. Splitting type and runtime dependency closure prevents a false
  headless failure.
- The server-side docs example imported `platejs/docx` even though Markdown
  serialization did not use it. Removing that client-only plugin is correct;
  calling DOCX SSR-safe would lie about its Blob/DOM behavior.
- `platejs/static` is the sole current SSR entrypoint. Its generated adapter
  creates a real editor and renders paragraph HTML with no `window` or
  `document`.

Decisions and tradeoffs:
- Explicit metadata beats path inference.
- Four lanes remain orthogonal: universal importability plus one behavior proof
  for each runtime class.
- The client lane imports and evaluates every module and touches the DOM. It does
  not generically call every export; feature semantics remain feature-test work.

Review fixes:
- Split optional-peer declaration closure from runtime closure.
- Replaced synchronous React state updates in the client proof effect with
  proof-element updates.
- Removed the unnecessary DOCX import from the RSC example.
- Formatted the changed `@platejs/test` README.

Error attempts:
| Error / failed attempt | Count | Different move | Resolution |
| --- | ---: | --- | --- |
| Packed checker claimed `platejs/excalidraw` loads React | 1 | Inspect runtime separately from declarations | Runtime-only closure passes 25/25 |
| Scoped lint rejected generated interpolation and effect state | 1 | Repair generator and DOM proof sink | Scoped lint passes |
| www dev command forwarded an extra `--` | 1 | Invoke workspace `next dev` directly | Both routes returned 200 |
| Browser load wait did not settle around embedded resources | 2 | Assert rendered DOM after HTTP 200 | Expected headings rendered; no Next overlay |
| `check:core` caught README formatting | 1 | Format exact README and rerun | Package lint passed |
| Extra broad `check:core` timed out in unrelated CLI watcher tests | 2 | Replay exact watcher case alone | `recovers when the editor module is recreated` reproduced its 60s timeout; no CLI code changed and runtime-owned gates remain green |

Verification evidence:
- `node --test tooling/scripts/check-plite-release-artifacts.test.mjs tooling/scripts/entrypoint-turbo.test.mjs tooling/scripts/entrypoint-dag-plugin.test.mjs`:
  52/52 passed.
- `pnpm entrypoint:turbo:check`: generated state current.
- `pnpm --filter plite typecheck`: passed.
- `pnpm --filter www typecheck`: editor/API/source/registry/Next/app/package
  integration checks passed.
- `pnpm check:plite:contracts`: 215 Node contracts, 25 Bun contracts, 44
  benchmark targets, and public types passed.
- `pnpm plite:release:packages`: packed 4 packages; verified 51 public subpaths,
  46 Node imports, 25 headless executions, 1 SSR render, 37 exact optional-peer
  closures, declaration modes, direction, parity, and DCE.
- `pnpm --filter plite test:plite-browser:chromium runtime-entrypoints.test.ts`:
  production build and 20-entrypoint browser exercise passed 1/1.
- In-app Browser: `/docs/examples/server-side` rendered “Using Plate in a Server
  Environment”; `/docs/examples/plate-to-html` rendered Editor, EditorView, and
  HTML Iframe; both returned HTTP 200.
- `pnpm test:manifests`: passed.
- `pnpm install` and byte comparisons: changed agent source/mirrors match.
- Extra broad gate: `check:core` passed adoption/docs/type/lint and all
  Plate/Plite entrypoint graphs, then timed out in unrelated CLI watcher tests.
  The exact watcher case timed out alone. This gate is not represented as green.

Final handoff prepared:
- Ownership: the entrypoint DAG owns runtime; generators and the packed checker
  consume it.
- Public breaks: none. Exports and call shapes are unchanged.
- Adoption: docs/rules, test README, Plite agent start, generated proof source,
  Turbo inputs, and both named server consumers are current.
- Remaining risk: exhaustive module execution does not replace feature-semantic
  tests.
- User attention: no runtime repair remains. The unrelated CLI watcher timeout
  belongs in a separate tooling task if it persists in a clean environment.

Timeline:
- 2026-08-28T20:31:11.803Z Plan created.
- 2026-08-28: Classified all runtime entrypoints and generated four proof lanes.
- 2026-08-28: Repaired exact server consumer, updated doctrine/mirrors, and
  completed package/browser proof.

Reboot status:
| Question | Answer |
| --- | --- |
| Where am I? | Complete |
| Where am I going? | User review |
| What is the goal? | Four DAG-driven runtime proofs for every public entrypoint |
| What have I learned? | See Findings |
| What have I done? | Passed all four runtime lanes and recorded one unrelated extra-gate timeout |

Open risks:
- The four lanes prove module import/execution-host correctness, not every
  exported function's feature semantics.
- The unrelated CLI watcher timeout remains unresolved and is not represented as
  a runtime-proof failure or a green repository check.
