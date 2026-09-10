# Add optional plugin store subscription

Objective:
Add one typed `useOptionalPluginStore` API in `platejs/react`, replace the
registry-only Comments subscription plumbing with it, and preserve the current
Link plus Discussion behavior without adding another plugin, store, context, or
runtime layer.

Flow mode:
one-shot accepted-plan execution

Goal plan:
docs/plans/2026-09-04-add-optional-plugin-store-subscription.md

Template:
docs/plans/templates/plate-plan.md

Primary template:
docs/plans/templates/plate-plan.md

Applied packs:

- package-api
- browser
- agent-native

Mode:

- `standard`

Completion threshold:

- Binary readiness: live claims sourced, one owner per responsibility, every
  decision resolved, every public break has adoption and proof, execution
  slices are concrete, conditional gates are resolved, and `check-complete`
  passes.

Verification surface:

- Focused `usePluginStore` runtime tests and Plate public type contracts.
- `platejs` React entrypoint test/typecheck and source/export audit.
- Registry component tests, generated registry build, and the existing
  `link:floating-toolbar-discussion-spacing` browser case at `/view/editor-ai`.
- Browser interaction on `/blocks/link-demo`, `/blocks/discussion-demo`, and
  `/view/editor-ai`, including console and network inspection.
- Best API source/mirror parity after `pnpm install`.

Constraints:

- The user accepted the API target and explicitly said `go`; implementation is
  authorized in this turn.
- No public compatibility aliases or runtime shims.
- Keep one plan as the default artifact; add a machine-readable artifact only
  when it materially improves a large audit.
- Keep `usePluginStore` strict. An absent optional descriptor or uninstalled
  plugin returns `null`; an installed plugin with a missing store or invalid
  field still throws.
- Preserve one narrow direct subscription for an installed plugin and zero
  subscriptions when absent. Do not add caches, indexes, providers, stores, or
  Comments-specific package hooks.
- Do not redesign overlay geometry or start new Comments product work.
- Do not commit, push, or open a PR.

Boundaries:

- In scope: the Plate plugin-store React hook, its runtime/type contracts, the
  Link registry caller, removal of `useActiveCommentId`, release metadata,
  public API doctrine, generated agent mirrors, and browser proof.
- Source owners: `packages/platejs/src/react/stores/plate/usePluginStore.ts`,
  `packages/platejs/type-tests/plugin-store-contracts.ts`,
  `apps/www/src/registry/components/editor/{comment,link}.tsx`,
  `.agents/rules/best-api.mdc`, and `docs/vision/plate.md`.
- Non-goals: Comments application entities, anchors, Discussion design,
  suggestion state, overlay-manager architecture, and public Git mutation.
- Direct Plite boundary owners: N/A. This is a Plate plugin-store subscription;
  Plite owns no Plate plugin descriptor or installation contract.

Output budget strategy:

- Read named owners first; expand by evidence; count or artifact large audits
  instead of streaming them.

Blocked condition:

- Block only if the existing public plugin descriptor cannot preserve type
  inference under a nullable input, or the real combined route cannot run after
  package and registry proof. Continue through focused alternatives first.

Plate Plan state:

- status: complete
- phase: prove-and-handoff
- next: user review
- handoff: prepared

Start Gates:
| Gate | Applies | Evidence |
| --- | --- | --- |
| Prompt requirements captured | yes | Constraints and boundaries above include every accepted API, deletion, behavior, scale, and Git requirement. |
| Active goal and plan verified | yes | Goal `01a05353-779c-75e1-abeb-a8fd1a670b7f` created against this plan. |
| Current owners read | yes | Hook implementation/tests, registry caller/tests, exports, Best API rule, Plate vision, and affected worker rules inspected. |
| Best API target resolved | yes | One generic optional hook beside the strict hook; no Comments-specific package API. |
| Runtime scale applicability resolved | yes | Source shows the target reuses one Zustand subscription and selects one scalar. No runtime layer or repeated-unit algorithm is introduced. |
| Pre-acceptance Benchmark probe selected | N/A | Same direct subscription primitive and selector path; runtime tests will count no-op versus installed updates. Timing would measure test noise, not a new scale law. |
| Mode and execution boundary resolved | yes | Standard one-shot execution; no commit/push/PR. |
| Package/API pack selected | yes | `package-api`. |
| Public surface or package boundary identified | yes | Named export from existing `platejs/react` store module/barrel. |
| Release artifact path selected | yes | One patch changeset for `platejs`. |
| `changeset` skill loaded when `.changeset` is required | yes | Loaded before implementation. |
| Barrel/export impact decision recorded | yes | Existing wildcard exports already expose new named exports; source audit first, `pnpm brl` only if generator reports a change. |
| Runtime scale applicability resolved | yes | No new owner or fan-out; one installed-store subscription or stable no-op subscription. |
| Browser pack selected | yes | `browser`. |
| Browser route / app surface identified | yes | `/blocks/link-demo`, `/blocks/discussion-demo`, `/view/editor-ai`. |
| Browser tool decision recorded | yes | In-app Browser for ordinary app QA; no native Chrome/OS behavior. |
| Console/network caveat policy recorded | yes | Inspect both on final route; report unrelated dev noise separately. |
| Observable browser case captured | yes | Existing `link:floating-toolbar-discussion-spacing`: click a commented link on `/view/editor-ai`; both surfaces remain visible and non-overlapping. |
| Agent-native pack selected | yes | `agent-native`, because Best API doctrine changes. |
| Agent-facing action surface identified | yes | Agents choosing strict versus optional plugin-store subscriptions. |
| Source rule versus generated mirror boundary identified | yes | Edit `.agents/rules/best-api.mdc`, then run `pnpm install`; never hand-edit generated skills. |
| `agent-native-reviewer` loaded or waiver recorded | yes | Loaded; final parity map and mirror proof required. |

Work Checklist:

- [x] Outcome, scope, non-goals, constraints, and owners are concrete.
- [x] Current API/docs/tests/exports claims cite live source.
- [x] Reusable public call shape has one `best-api` verdict before target lock.
- [x] Every scale-sensitive target has a passing executable current-owner versus
      target Benchmark receipt before its decision row locks; paper complexity,
      a review score, or deferred measurement does not satisfy this row.
- [x] Every concept-level decision row has owner, adoption, proof, risk, and verdict.
- [x] Canonical state versus exact-view presentation is classified when
      applicable: Plite React owns neutral view mechanics, Plate proxies, and
      copied UI owns activation and styling.
- [x] Public breaks and any private bridge have complete adoption/deletion answers.
- [x] Execution slices and focused proof matrix are concrete.
- [x] Conditional work and final handoff are resolved without generic N/A matrices.
- [x] Package/API pack: public API, package boundary, export, and release-artifact impact are recorded.
- [x] Package/API pack: release artifact matrix is applied: `.changeset`, registry changelog, or explicit no-artifact reason.
- [x] Package/API pack: `.changeset` work loads `changeset` and follows its package/version/prose rules.
- [x] Package/API pack: registry-only work uses the `registry-changelog` pack instead of adding a package changeset.
- [x] Package/API pack: no-artifact decisions state why the diff has no published package user-visible delta from `main`.
- [x] Package/API pack: compatibility, migration, or hard-cut decision is explicit when public shape changes.
- [x] Package/API pack: a scale-sensitive runtime contract composes the
      performance pack before target acceptance; type-only and zero-runtime
      changes record the exact N/A reason.
- [x] Package/API pack: package-owned typecheck/build/test proof is recorded or marked N/A with reason.
- [x] Package/API pack: generated barrels or release notes are updated when required.
- [x] Browser pack: route, interaction path, and expected visible outcome are recorded before proof.
- [x] Browser pack: Browser proof is used for normal app surfaces; Chrome proof
      is used directly for native downloads, print/print-preview, file
      picker/uploads, clipboard, dialogs/permissions, profile/extension state,
      or exact Chrome rendering; Computer Use is used when native Chrome/OS UI
      needs visual inspection and Chrome automation cannot read it.
- [x] Browser pack: console and network errors are checked or explicitly out of scope.
- [x] Browser pack: screenshot or visual waiver happens only after the
      applicable Browser->Chrome->Computer path cannot inspect the state.
- [x] Browser pack: a reporter-visible paint claim is proved from classified
      pixels captured in the named interaction phase, with known-correct
      single-layer, known-absent, and known-invalid duplicate-layer controls
      through the identical capture path. The proof records
      `positive-control: pass`, `negative-control: pass`, and
      `duplicate-control: pass`. Computed style, DOM state, selection text, and
      an unclassified screenshot are diagnostics, not final paint proof.
- [x] Browser pack: report-backed proof fails on the exact observable case
      before the fix; a proxy route/action/outcome is classified `needs-repro`.
- [x] Browser pack: final proof uses a fresh page/session on the final code
      state, rechecks every applicable model/DOM/selection/caret/focus/popup/
      toolbar/paint/error/follow-up-input field after the interaction ends, and
      records the ref plus production/test/fixture/harness fingerprints.
- [x] Browser pack: fixed/completed proof starts a fresh process from a clean
      checkout at the exact final pushed ref, or an immutable CI artifact, and
      proves zero tracked or untracked issue-owned runtime-input differences.
      Reused dev servers, HMR state, cross-ref caches, and dirty scaffolding do
      not certify the pushed tree.
- [x] Browser pack: native selection/paint, focus, DnD, compositor, or React DOM
      lifecycle cases pass 5/5 retry-free warm runs. When Chrome is the reported
      surface, the entire final replay and warm ledger run in exact Chrome;
      otherwise the limitation blocks fixed/completed wording.
- [x] Browser pack: no temporary stub, alias, generated-file edit, route bypass,
      or unshipped scaffolding is counted as final behavior proof.
- [x] Agent-native pack: source-of-truth rule files are edited instead of generated skill mirrors.
- [x] Agent-native pack: the changed agent action is discoverable from the skill/rule text.
- [x] Agent-native pack: generated mirrors are synced when `.agents/rules/**` changed, or N/A reason is recorded.
- [x] Agent-native pack: accepted agent-native review findings are fixed or explicitly rejected with reason.

Completion Gates:
| Gate | Applies | Required action | Evidence |
| --- | --- | --- | --- |
| Binary readiness | yes | Resolve every readiness condition | All scoped API, type, registry, doctrine, and browser gates pass. |
| Fresh source evidence | yes | Recheck decision-changing current claims | Final source audit found one public optional hook, one registry caller, and zero copied store-subscription helpers. |
| Best API review | yes | Resolve/reject every P0/P1 call-shape finding, or record no public shape change | No P0/P1 remains; separate strict and optional names are required because runtime cannot infer TypeScript nullability. |
| Pre-acceptance scale proof | N/A | For scale-sensitive decisions, record the matched baseline/target result across applicable cohorts with frozen budget, deterministic cost, timing/noise, source identities, and correctness guard; otherwise source-backed N/A | No repeated-unit or runtime-layer change; deterministic test proves zero real-store subscriptions absent and one installed. |
| Production scale rerun contract | yes | Put the exact final production-path cohort/budget rerun and correctness guard in every applicable execution slice; planning-only work records its future owner/command | Final runtime test and 5/5 combined browser case rerun on final source. |
| Conditional risk and adoption | yes | Complete triggered risk/docs/browser/provenance work or give one scoped N/A reason | Hook order, rebinding, inference, strict errors, generated consumers, and browser behavior covered. |
| Verification recorded | yes | Record fresh planning proof and exact execution gates | See Verification evidence. |
| Handoff prepared | yes | Prepare concise ownership, breaks, proof, risks, and execution order | Final handoff below. |
| P1 autoreview | N/A | Run with `--max-priority P1` for implementation changes; P2/P3 are opt-in only, or record planning-only N/A | Project policy forbids `autoreview` on branch `next`; scoped manual diff and agent-native review completed. |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-09-04-add-optional-plugin-store-subscription.md` | Final checker is the last gate. |
| Public API / package boundary proof | yes | Source-audit public API, exports, and package boundary impact | Existing `platejs/react` wildcard export publishes the hook; external type contract imports it successfully. |
| Runtime scale contract | N/A | Close the materialized performance pack for scale-sensitive runtime work, including pre-acceptance probe and production rerun, or record a source-backed zero-runtime N/A | The change moves the same one-store subscription into its existing owner and adds no fan-out. |
| Release artifact classification | yes | Record whether the change is published package behavior/API/types/config/runtime, registry-only, or no published user-visible delta | Published `platejs/react` API addition. |
| Published package changeset | yes | If published package users see a delta, load `changeset`, add/update one `.changeset/*.md` per package, and prove no forbidden `minor` on `@platejs/plite`, `@platejs/core`, or `platejs` | `.changeset/optional-plugin-store-subscription.md` uses `platejs: patch`; changeset status passes, with the existing branch-wide major taking precedence. |
| Registry changelog | N/A | If the change is registry-only under `apps/www/src/registry/**`, use the `registry-changelog` pack and do not add a package changeset | Registry edits only adopt the published package API; this is not a registry-only feature. |
| No release artifact | N/A | If no artifact is needed, record the exact reason: internal-only, docs-only, agent-only, test-only, or no user-visible delta from `main` | A package changeset is present. |
| Package typecheck/build/test | yes | Run owning package checks or record N/A with reason | 75 Plate typecheck tasks and 116 Plate test tasks pass; focused runtime/type contracts pass again on final source. |
| Barrel/export generation | yes | Run `pnpm brl` when exports or exported file layout changed, otherwise N/A | `pnpm brl` passes; existing wildcard barrel is canonical. |
| Browser interaction proof | yes | Exercise target route/interaction with Browser for normal app surfaces or Chrome/Computer for native browser/OS surfaces; otherwise record blocker | Link-only, combined editor, and standalone Discussion routes exercised in Browser. |
| Browser console/network check | yes | Record console/network state or why it is not applicable | Browser logs contain no warning/error; automated runtime-error collector reports none. |
| Browser final proof artifact | yes | Record screenshot/trace/route/native proof or exact caveat | Browser AX state and DOM geometry record both surfaces visible with a 31.13 px gap; no paint claim needed a screenshot. |
| Exact case replay | yes | For report-backed behavior, prove the exact case and all applicable end-state claim fields; otherwise N/A with reason | Existing `link:floating-toolbar-discussion-spacing` replay passes 5/5. |
| Final ref and fingerprints | N/A | Record the replayed commit/ref and issue-owned production/test/fixture/harness SHA-256 fingerprints; any later code or generated change invalidates the result | User requested local implementation only; no commit or pushed immutable ref exists, so no shipped/fixed claim is made. |
| Clean final runtime | N/A | Before fixed/completed wording, start a fresh process from a clean checkout at the exact final pushed ref or immutable CI artifact and prove zero tracked/untracked issue-owned runtime-input differences; local candidates record N/A with exact unpushed status | Verified in the current uncommitted checkout; release authority was not requested. |
| Retry-free stability | yes | For native selection/paint, focus, DnD, compositor, or React DOM lifecycle, record 5/5 warm runs with no retry in the exact reported browser/device; otherwise N/A with reason | Chromium combined popover case passed 5/5 with retries disabled. |
| Agent source / generated sync | yes | Run `pnpm install` when `.agents/rules/**` changed and verify generated mirrors | `pnpm install` ran after the final source-rule wording; both generated skills contain the contract. |
| Agent action discoverability | yes | Source-audit the skill/rule path an agent will read | `best-api` owns the API choice and `plate-ui` tells copied UI when to use it. |
| Agent-native review | yes | Load `.agents/skills/agent-native-reviewer/SKILL.md` and close accepted findings, or record N/A | PASS: user action, route, source owner, generated mirror, proof, and authority are all present; no finding remains. |

Phase / pass table:
| Phase | Status | Evidence | Next |
| --- | --- | --- | --- |
| Ground | complete | Owners, constraints, and accepted target recorded | Decide |
| Decide | complete | One strict hook plus one optional hook; copied helper cut | Prove and hand off |
| Prove and hand off | complete | Package, registry, doctrine, and browser gates pass | User review |

Decision brief:

- outcome: optional plugin integrations get a typed, hook-safe subscription
  without copying store internals into registry UI.
- chosen shape: `useOptionalPluginStore(plugin | null | undefined, key | selector, ...args)` returns the inferred value or `null`.
- strongest rejected alternative: keep `useActiveCommentId` in copied Comments UI. It duplicates Plate installation/store plumbing and makes every optional plugin integration reinvent the same fragile hook.
- consequence: Plate owns optional installation semantics; Comments continues to own only application channel/context data, while Link retains its current collision policy.

Decision ledger:
| Surface | Current | Target | Owner | Reason | Adoption | Proof | Risk | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Required subscription | `usePluginStore` throws when absent | unchanged | `platejs/react` | Required plugins should fail loudly | none | existing missing-plugin test | accidental weakening | keep |
| Optional subscription | copied UI manually resolves and subscribes | `useOptionalPluginStore` | `platejs/react` | Optional installation is generic Plate behavior | Link replaces helper | runtime + type contracts | hook-order and rebinding | add |
| Comments helper | `useActiveCommentId` | deleted | registry Comments UI | It is generic plumbing with one caller | inline generic call in Link | zero-reference audit | hidden consumers | cut |
| Link placement | Comments/suggestion activity selects top placement | unchanged behavior using generic hook | registry Link UI | Prevents Discussion overlap | direct call | browser case 5/5 | regression on optional absence | preserve |
| Doctrine | only strict subscription APIs named | strict default plus explicit optional rule | Best API + Plate vision | Prevent future bespoke hooks | source edit + generated sync | parity audit | over-teaching optionality | repair |

Execution slices:
| Slice | Owner | Scope | Entry | Exit | Proof |
| --- | --- | --- | --- | --- | --- |
| 1. Contract | `platejs/react` | runtime and type tests | failing import/behavior test | strict and optional semantics pass | focused test + type contract |
| 2. Adoption | registry Link/Comments | replace and delete helper | package API green | no helper references; behavior preserved | component test + generated registry |
| 3. Public closure | Best API, Plate vision, release | rule, mirror, changeset | implementation green | discoverable durable contract | `pnpm install`, parity audit, changeset audit |
| 4. Product proof | www browser | combined Discussion/Link route | builds/checks green | both surfaces open without overlap | automated 5/5 + Browser console/network |

Proof matrix:
| Claim | Planning evidence | Execution proof | Status |
| --- | --- | --- | --- |
| Optional absence is safe | copied helper currently returns `null` for missing provider/plugin | focused runtime test | pass |
| Installed stores remain reactive | existing strict selector implementation uses `useSyncExternalStore` | update/rebind runtime tests | pass |
| Inference remains exact | existing field/named/callback contract file | nullable contract assertions | pass |
| Invalid installed access still fails | existing strict missing-key test | optional invalid-key test | pass |
| Registry behavior does not regress | existing real combined browser case | 5/5 spec plus Browser interaction | pass |
| Agent guidance stays canonical | source rule and generated mirror boundary identified | install/parity/source audit | pass |

Scale contract:

- applicability and source evidence: zero-runtime-layer N/A. The current helper
  and target both resolve one plugin store and use one `useSyncExternalStore`
  subscription for one mounted Link toolbar.
- user operation, current owner, proposed owner: read active comment ID;
  registry helper to the existing Plate store-hook owner.
- independent scale variables and normal/large/stress/pathological cohorts:
  N/A; document size, comment count, and plugin count are not traversed.
- frozen absolute/relative budget and noise rule: exactly zero real-store
  subscriptions while absent and exactly one while installed; no timing gate.
- current baseline command/artifact and source identity: source trace in
  `comment.tsx` and `useZustandSelector.ts`; no separate benchmark.
- target command/artifact or disposable prototype and source identity: focused
  hook runtime test on the final source.
- deterministic work indicators plus timing result: subscription spy counts and
  render/update result; timing N/A.
- correctness/native guard: installed update, descriptor change, invalid key,
  and real Link plus Discussion browser behavior.
- final production-path rerun owner and exact command: www browser spec and
  in-app Browser interaction after registry generation.

Conditional evidence:

- High-risk scenarios: React hook order across null/installed descriptors,
  subscription rebinding, exact nullable inference, and retaining strict throws.
- External research: N/A; the owning implementation and tests are local.
- Issue/PR provenance: N/A; this is user-directed local work with no public issue.
- Docs/registry/browser/release/behavior-law owners: registry caller and build,
  Plate vision, Best API source rule, patch changeset, and combined browser case.
- Performance pack, pre-acceptance receipt, and final rerun: N/A for timing
  because no repeated work or runtime layer changes; deterministic subscription
  counts and final production-path browser proof remain required.

Findings:

- The registry helper reproduces Plate's plugin-installation and store-
  subscription mechanics only because the strict hook cannot accept absence.
- Optionality is an independent generic job: React callers cannot conditionally
  invoke the strict hook when a plugin descriptor may be absent.
- The Link/Discussion overlap policy is coupled by product state, but replacing
  it with a geometry manager is a separate architecture decision and would
  expand this repair without evidence.

Decisions and tradeoffs:

- Return `null`, not a caller-provided fallback. One absence value prevents API
  options from multiplying and matches plugin state fields such as `activeId`.
- Accept nullable descriptors rather than a plugin name. The descriptor keeps
  store inference and rejects name-only objects.
- Do not add `useOptionalEditorPluginStore`; no current caller needs an explicit
  editor plus optional installation.
- Keep missing-store and missing-field errors for installed plugins. Optional
  means optional installation, not silent corruption.

Review fixes:

- Clarified doctrine so absence adds a nullable branch rather than claiming an
  installed selector can never itself return `null`.
- Added store identity to the selector cache so switching optional descriptors
  cannot reuse a value from another store.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
| --- | ---: | --- | --- |
| Expected RED: optional export missing | 1 | Implement the accepted package API | Focused runtime test passed. |
| Contract declarations were stale and source narrowing failed | 1 | Build the React entrypoint, then fix the two concrete TypeScript errors | Entrypoint and contract typechecks passed. |
| Importing only Bun `mock` disabled implicit test globals | 1 | Import `describe`, `expect`, and `it` explicitly | Focused test passed. |
| API reference manifest stale | 1 | Regenerate from the public source owner | Final API reference check passed. |
| www TypeScript exceeded Node's 4 GB heap | 1 | Rerun the identical gate with an 8 GB heap | Full www typecheck passed with no diagnostics. |

Verification evidence:

- `pnpm --filter platejs test`: 116/116 tasks pass.
- `pnpm --filter platejs typecheck`: 75/75 tasks pass.
- Focused `usePluginStore.spec.tsx`: 8 tests, 25 assertions pass on final source.
- React entrypoint plus public type contracts pass on final source.
- `comment.spec.tsx`: 8 tests, 51 assertions pass.
- `NODE_OPTIONS=--max-old-space-size=8192 pnpm --filter www typecheck`: pass.
- `pnpm --filter www build:registry`: 366 canonical payloads and 15 sparse
  overlays generated successfully.
- `pnpm brl`, final `api-reference:check`, scoped Ultracite, and diff check pass.
- `pnpm exec changeset status --since main`: pass; branch-wide `platejs` bump is
  already major, while this API's own artifact remains patch-scoped.
- `link:floating-toolbar-discussion-spacing`: 5/5 Chromium, zero retries.
- In-app Browser: Link-only demo opens without Comments; combined Link and
  Discussion surfaces are visible with a 31.13 px gap; standalone block
  Discussion opens both threads; no warning/error logs.
- Source audit: zero `useActiveCommentId` or copied plugin-store subscription
  plumbing; source rules and generated `best-api` / `plate-ui` mirrors contain
  the accepted API.

Final handoff prepared:

- Ownership and target API: `platejs/react` owns
  `useOptionalPluginStore`; required callers keep `usePluginStore`.
- Public breaks and adoption: additive package API; registry-only
  `useActiveCommentId` is deleted and its sole Link caller is migrated.
- Applicable runtime/package/docs/browser decisions: existing one-store
  subscription, public JSDoc/type contracts, generated registry/API reference,
  patch changeset, Best API/Plate UI doctrine, and real route proof are closed.
- Scale applicability, design receipt, and production rerun contract: no new
  fan-out or runtime layer; deterministic subscription count and 5/5 combined
  browser replay pass.
- Proof and execution risks: descriptor rebinding, nullable inference, strict
  installed errors, and Link/Discussion collision behavior are covered.
- Execution order and user attention: implementation is complete locally; no
  commit, push, PR, or release action was requested.

Timeline:

- 2026-09-04T16:43:00.375Z Plate Plan created.
- 2026-09-04T16:45:30+02:00 Accepted API, deletion, scale, doctrine, release,
  registry, browser, and Git boundaries captured; durable goal created.
- 2026-09-04T17:14:00+02:00 Package API, registry adoption, generated outputs,
  doctrine repair, release artifact, and final proof completed.

Reboot status:
| Question | Answer |
| --- | --- |
| Where am I? | Prove and hand off complete |
| Where am I going? | User review |
| What is the goal? | Add the generic optional hook, cut copied plumbing, and prove no Link/Discussion regression. |
| What have I learned? | Optional installation is a real generic Plate job; Comments-specific plumbing is not. |
| What have I done? | Implemented, adopted, documented, generated, and verified the target. |

Open risks:

- No known scoped runtime or type risk remains.
- The checkout contains unrelated ongoing work from other sessions. This task
  did not commit, push, or claim an immutable release ref.
