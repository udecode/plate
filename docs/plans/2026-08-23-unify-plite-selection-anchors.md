# Unify Plite selection anchors

Objective:
Hard-cut Plite selection/ref API debt; done when scoped anchors, sound guards,
docs, callers, focused proof, and review pass.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-08-23-unify-plite-selection-anchors.md

Template:
docs/plans/templates/plite-plan.md

Primary template:
docs/plans/templates/plite-plan.md

Applied packs:
- docs

Mode:
- `standard` accepted-plan execution. The user accepted the item 5 target with
  `ok go` immediately after the Best API review.

Completion threshold:
- `SelectionApi` predicates reject values outside their promised narrowed
  types, including invalid affinity and marks.
- `tx.anchor` is the sole transaction-scoped Path/Point/Range tracker;
  `editor.anchor` remains the sole persistent released handle; public
  `tx.refs`, `EditorTransactionRefsApi`, and `EditorTransactionDraftRef` have
  zero live source, caller, export, or current-doc matches.
- Anchor and selection rebasing consume one shared range-association policy.
- Every direct production caller, test, public doc, export, generated owner,
  changeset, and reusable doctrine owner adopts the hard cut.
- Focused tests, affected source-first typechecks, `pnpm check:plite:dev`, docs
  audit, applicable browser proof, P1 autoreview, agent-native review, and
  `check-complete` pass.

Verification surface:
- Red/green Plite contract tests for strict predicates, transaction anchor
  mapping/expiry, range support, and detached transaction builders.
- Source audits for rejected exports and call shapes across packages, apps,
  docs, tests, and agent rules.
- Source-first typechecks for every modified package, `pnpm lint:fix`,
  `pnpm check:plite:dev`, the owning Plite docs audit, and focused browser
  proof of the persistent-annotation anchor demo.
- `best-api repair` source/generated parity, P1 autoreview, agent-native review,
  and final goal-plan validation.

Constraints:
- The user already accepted the exact target in the preceding review and
  explicitly authorized implementation with `ok go`.
- No public compatibility aliases or runtime shims.
- Keep one plan as the default artifact; add a machine-readable artifact only
  when it materially improves a large audit.
- Preserve canonical `DocumentChange`, NodeKey identity mapping, root law,
  deletion behavior, custom selection kinds, and editor-owned persistent
  anchors.
- Do not claim native selection, physical-device, release, or publication
  readiness from model/package proof.
- Do not commit, push, open a PR, publish, or run registry generation.

Boundaries:
- In scope: Plite selection predicates, anchor types/lifetimes, shared mapping
  policy, public exports, direct callers, contract tests, docs, changeset, and
  the smallest reusable Best API/Plite Vision doctrine repair.
- Source owners: `packages/plite/src/interfaces/selection.ts`,
  `packages/plite/src/core/anchor.ts`, `selection-protocol.ts`,
  `public-state.ts`, `interfaces/editor.ts`, package exports, and their tests.
- Non-goals: changing mapping outcomes, DOM/native selection policy,
  collaboration wire formats, history serialization, or unrelated API cleanup.
- Direct adoption owners: `packages/suggestion`, `packages/code-block`,
  `packages/plite-react`, and required maintenance-only `packages/platejs/src/features/list`
  call-site migration. Collaboration needs proof only if source audit finds a
  direct rejected API consumer.

Output budget strategy:
- Read named owners first; expand by evidence; count or artifact large audits
  instead of streaming them.

Blocked condition:
- Stop only if the scoped/persistent lifetime split cannot preserve an existing
  hard runtime law, a required browser lane is unavailable after the documented
  fallback, or three distinct repair attempts leave the same verification
  owner red with no smaller autonomous move.

Plite Plan state:
- status: done
- phase: prove-and-hand-off
- next: none
- handoff: prepared

Start Gates:
| Gate | Applies | Evidence |
| --- | --- | --- |
| Prompt requirements captured | yes | This plan records the accepted item 5 target, hard cut, proof, non-goals, and no-git/publication boundary. |
| Active goal and plan verified | yes | Goal `01a02b32-5841-7720-9117-184ed3a90eec`; this path is named in its objective. |
| Current owners read | yes | `VISION.md`, `docs/vision/common.md`, `docs/vision/plite.md`, `docs/plite/agent-start.md`, and live anchor/selection/API/docs/callers were read. |
| Best API target resolved | yes | Accepted verdict: persistent `editor.anchor`, scoped `tx.anchor`, strict built-in predicates, editor-aware custom validation, shared pure mapping policy. |
| Mode and execution boundary resolved | yes | One-shot accepted-plan execution; local edits and proof only, no commit/push/PR/release. |

Work Checklist:
- [x] Outcome, scope, non-goals, constraints, and owners are concrete.
- [x] Current API/docs/tests/exports/behavior claims cite live source.
- [x] Reusable public call shape has one `best-api` verdict before target lock.
- [x] Every concept-level decision row has owner, adoption, proof, risk, and verdict.
- [x] Public breaks and any private bridge have complete adoption/deletion answers.
- [x] Execution slices and focused proof matrix are concrete.
- [x] Add failing predicate and transaction-anchor contract proof before the implementation cut.
- [x] Implement the API/lifetime hard cut and shared mapping owner without compatibility paths.
- [x] Adopt every direct caller, export, test, doc, generated owner, and package release artifact.
- [x] Run focused/broad verification, browser proof or exact blocked reason, P1 autoreview, and agent-native review.
- [x] Repair Best API and Plite Vision source doctrine, regenerate skills, and prove source/mirror parity.
- [x] Conditional work and final handoff are resolved without generic N/A matrices.

Completion Gates:
| Gate | Applies | Required action | Evidence |
| --- | --- | --- | --- |
| Binary readiness | yes | Resolve every readiness condition | All scoped code, caller, docs, doctrine, generated, proof, and review rows pass. |
| Fresh source evidence | yes | Recheck decision-changing current claims | Final bounded searches found zero rejected API matches and one shared mapping owner. |
| Best API review | yes | Resolve/reject every P0/P1 call-shape finding, or record no public shape change | Accepted target implemented; final P1 autoreview found zero findings. |
| Conditional risk and adoption | yes | Complete triggered risk/browser/Benchmark/provenance work or give one scoped N/A reason | All direct callers and the browser demo pass; Benchmark, release, public issue, and native-device proof do not apply to this claim. |
| Verification recorded | yes | Record fresh planning proof and exact execution gates | Red/green, focused, package, docs, browser, broad, source-audit, and review evidence is recorded below. |
| Handoff prepared | yes | Prepare concise ownership, breaks, proof, risks, and execution order | Final ownership, break, proof boundary, and external commit state are explicit below. |
| P1 autoreview | yes | Run with `--max-priority P1` for implementation changes; P2/P3 are opt-in only, or record planning-only N/A | Commit-mode P1 review of `33557a72` passed two chunks with zero findings. |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-23-unify-plite-selection-anchors.md` | Passed. |

Phase / pass table:
| Phase | Status | Evidence | Next |
| --- | --- | --- | --- |
| Ground | completed | Live owners, callers, docs, and baseline tests audited in the item 5 review. | Execute |
| Decide | completed | User accepted the Best API target with `ok go`; no bridge retained. | Execute |
| Execute | completed | Strict guards, editor validation, scoped anchors, shared mapping, callers, exports, docs, generated API, changeset, and doctrine are implemented. | Prove |
| Prove and hand off | completed | Focused and broad checks, docs audit, Browser proof, source audit, agent-native review, and P1 autoreview pass. | Close goal |

Decision brief:
- outcome: one truthful selection-location contract with sound public narrowing.
- chosen shape: persistent `editor.anchor`; auto-disposed `tx.anchor` for
  Path/Point/Range; strict built-in predicates; editor-aware installed-kind
  validation; one pure association/deletion mapper.
- strongest rejected alternative: retain documented `tx.anchor` plus hidden
  `tx.refs` because both share the same implementation.
- consequence: pre-stable public break across Plite exports and four direct
  caller packages, with no alias or migration layer.

Decision ledger:
| Surface | Current | Target | Owner | Reason | Adoption | Proof | Risk | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Selection predicates | `isSelection`/`isText` accept invalid optional fields while narrowing to stricter types | Strict built-ins plus editor-aware complete installed-kind validation | Selection interface and protocol | Unknown-input narrowing must be sound | Plite core/docs and custom validators | Red/green invalid-field and custom-kind tests | Stricter guards expose callers relying on false positives | rearchitect |
| Anchor lifetime API | Update tx exposes persistent `anchor` and scoped Path/Point-only `refs`; spec builder exposes only `refs` | Persistent `editor.anchor`; scoped Path/Point/Range `tx.anchor` on updates and spec builders | Anchor and transaction runtime | Lifetime, not location subtype, is the honest public distinction | Suggestion, code-block, Plite React, legacy-list-model, tests/docs/exports | Mapping, range, expiry, builder, typecheck tests | Persistent draft-anchor callers must opt into `editor.anchor` explicitly | cut |
| Mapping policy | Anchor and selection protocol decode four-way association independently | One internal pure mapping-policy owner; lifecycle remains in anchor and kind protocol remains in selection | Plite core mapping | Prevent semantic drift without merging responsibilities | Internal only | Existing anchor/rebase matrix plus focused parity tests | Bad extraction could change directionality | move |
| Native/browser behavior | Source/model proof exists but no fresh native run in this execution yet | Preserve behavior and run one relevant browser lane without broad release claims | Plite browser proof | API refactor must not be called native-correct from model tests | Persistent annotation demo | Focused Playwright/browser route | Environment can block only the browser claim | gate |

Execution slices:
| Slice | Owner | Scope | Entry | Exit | Proof |
| --- | --- | --- | --- | --- | --- |
| 1. Red contract | Plite tests | Invalid optional fields; scoped Path/Point/Range anchor and expiry; spec builder | Accepted target | Tests fail for current contract only | Focused Bun tests |
| 2. Core hard cut | Plite interfaces/runtime | Types, tx runtime, shared mapping helper, strict validation | Red proof | New tests pass; old public types removed | Focused tests and Plite typecheck |
| 3. Adoption | Direct packages/docs | Callers, exports, docs, generated owner, changeset | Core green | Zero rejected-symbol/current-doc matches | Package typechecks, docs audit, source audit |
| 4. Doctrine/proof | Best API, Plite Vision, browser, review | Source rule, generated skills, browser route, P1 review, agent-native review | Adoption green | All applicable gates pass or scoped evidence is explicit | `pnpm install`, audits, browser, review, `check:plite:dev` |

Proof matrix:
| Claim | Planning evidence | Execution proof | Status |
| --- | --- | --- | --- |
| Public predicates narrow soundly | Source guard/strict-ingress contradiction and direct runtime false-positive repro | Red/green contract tests, installed-kind/current-document tests, and Plite typecheck | passed |
| Transaction anchors are scoped and cover all location kinds | Current `tx.refs` and `tx.anchor` type/runtime audit | Update/spec-builder Path/Point/Range mapping and post-boundary expiry tests | passed |
| Persistent anchors retain behavior | Existing 52 focused model tests passed before edits | 54 focused anchor/rebase/selection tests and interactive persistent-anchor mapping pass | passed |
| Rejected ref API is gone | Complete caller/export/docs search | Zero live matches for `tx.refs`, `EditorTransactionRefsApi`, or `EditorTransactionDraftRef` | passed |
| Package/browser-facing behavior remains valid | Existing demo/browser corpus identified | `check:plite:dev`, docs build/audit, and interactive demo proof pass | passed |

Conditional evidence:
- High-risk scenarios: (1) scoped handle leaks past callback, (2) range direction
  changes at equal/inward/outward boundaries, (3) persistent anchors created
  from draft state stop tracking after commit.
- External research: N/A; the accepted target is grounded in current Plite
  owners and no external precedent can change the lifetime law.
- Issue/PR provenance: N/A; this is local architecture-review follow-up with no
  public issue or PR authority.
- Browser/Benchmark/docs/release/behavior-law owners: docs and one focused
  anchor demo apply; Benchmark and release are N/A because no performance or
  release claim is made; physical-device proof is outside this API claim.

Docs lane proof:
- lane: API reference for `anchor.mdx` and `selection.mdx`, with narrow concept
  cross-links in `03-locations.mdx` and `libraries/plite.mdx`.
- owner: `@platejs/plite` interfaces and runtime; no React or copied-registry
  ownership is implied.
- topology: update the existing canonical pages; no route or navigation change.
- shape: short purpose, grouped public surfaces, exact lifetime/validation
  contract, minimal source-real examples, and explicit caveats.
- verification: API manifest regeneration, docs source build/parity, and the
  existing route in Browser.

Findings:
- `SelectionApi.isSelection` and `isText` return true for invalid `affinity`
  and `marks`, while strict ingress rejects the same payload.
- Actual update transactions expose both `anchor` and `refs`; detached spec
  builders omit persistent `anchor` and retain scoped `refs`.
- `tx.refs` uses `editor.anchor` internally and owns automatic release; this is
  one engine with two public lifetime vocabularies.
- `rangeAssociations` is duplicated between anchor and selection protocol.
- Table proves the custom selection protocol is a real production capability
  and must remain extension-owned.
- Best API worker audit found no anchor/ref teaching in `plate-plan`,
  `plite-plan`, `plate-plugin-creator`, `plate-ui`, `docs-creator`, or
  `plate-next`; only the Best API source and Plite Vision owner required repair.

Decisions and tradeoffs:
- Break before stability instead of keeping aliases; explicit lifetime is worth
  the adoption cost.
- Keep editor-aware full custom validation separate from pure built-in guards;
  a global helper cannot validate extension-owned payloads truthfully.
- Do not turn this source/API repair into a native-selection or release claim.

Review fixes:
- None. The final P1 review of commit `33557a72` reported zero P0/P1 findings
  across both complete chunks.

Agent-native review:
| User action | Route | Owner | Generated/teaching surface | Proof | Verdict |
| --- | --- | --- | --- | --- | --- |
| Design or repair mapped-location public API | `best-api repair` | `.agents/rules/best-api.mdc` | `.agents/skills/best-api/SKILL.md` | `pnpm install`, exact source/mirror diff, zero rejected examples | pass |
| Validate an unknown selection for one editor | `editor.read.selection.isValid(value)` | Plite selection protocol and editor state view | Anchor/selection API docs and generated API manifest | installed-kind/current-document contract test and package typecheck | pass |
| Track a mapped location during one transaction | `tx.anchor(value, options)` | Plite transaction runtime | Anchor API and concepts docs | Path/Point/Range mapping, expiry, spec-builder, and direct-caller proof | pass |

The forward-test also checked an unrelated real pure predicate:
`PointApi.isPoint` accepted a valid string root and rejected a numeric optional
root. No agent-only shortcut, hidden compatibility name, or stale teaching path
remains.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
| --- | ---: | --- | --- |
| Focused Bun grep was passed through the pnpm script without `--` | 1 | Run Bun directly with `--test-name-pattern` | Resolved; exact rows passed. |
| First test-name patterns did not match the literal test names | 1 | Read the owning test declarations and rerun their exact names | Resolved; 2/2 exact rows passed. |
| First Plite typecheck found one missing runtime-view delegate and one untyped local guard | 1 | Add the `isValid` delegate and Point predicate annotation | Resolved; Plite and all direct caller package typechecks passed. |
| Best API mirror audit used unescaped backticks in one shell pattern | 1 | Rerun the bounded audit with a single-quoted pattern | Resolved; rejected names had zero matches. |
| Agent-native forward-test preload invoked Bun test setup outside the runner | 1 | Import the source interface directly for the pure runtime probe | Resolved; valid root passed and invalid optional root failed. |
| First root lint pass found the obsolete `AnchorOptions` import | 1 | Remove the dead type import and rerun the same lint gate | Resolved; `pnpm lint:fix` passed. |
| First P1 autoreview detected a source change after snapshotting the 635,195-byte local bundle | 1 | Freeze edits and rerun against an immutable target | The checkout advanced externally to `33557a72`; commit-mode P1 review then passed. |
| Browser navigation to the docs route timed out | 1 | Inspect the loaded tab, preserve the exact blocker, and use the built Plite package route | Docs UI was blocked by an unrelated `editor-ai/page.tsx` client-metadata build error; docs source proof and Plite demo proof passed. |
| Root `docs:plite:audit` alias was absent | 1 | Run the owning audit script directly | `node tooling/scripts/check-plite-docs.mjs` passed. |

Autoreview scope baseline:
- original request: implement the accepted item 5 architecture cut for Plite
  selection validation, anchor lifetime, and shared range association.
- violated invariant: public unknown-input predicates must narrow soundly, and
  mapped-location APIs must expose one lifetime contract instead of parallel
  transaction `anchor` and `refs` vocabularies.
- target: local-only work on branch `next`; no commit, push, PR, release, or
  publication is authorized.
- intended behavior: keep persistent `editor.anchor`, replace transaction
  `refs` with scoped Path/Point/Range `tx.anchor`, add editor-aware full
  selection validation, and preserve all mapping outcomes.
- owner boundary: Plite selection/anchor interfaces and core runtime, direct
  package callers, canonical Plite docs/API generation, changeset, Best API
  doctrine, and Plite Vision.
- sibling surfaces: suggestion, legacy-list-model, code-block, Plite React drop
  handling, detached transaction specs, and persistent annotation browser demo.
- public/security/product contracts: no compatibility aliases, no serialized
  format change, no native-selection or release claim, and no new external
  authority.
- measurement: the bounded tracked owner diff is 27 files with 490 additions
  and 254 deletions, plus the new shared association helper and this plan. The
  checkout also contains earlier accepted review-item work and unrelated local
  changes; those do not expand this review's repair authority.

Verification evidence:
- Baseline: 52 focused anchor/selection/rebase tests passed before edits.
- Baseline defect: direct Bun repro returned
  `{ "isSelection": true, "isText": true }` for invalid affinity/marks.
- Predicate red: `pnpm --filter @platejs/plite test
  ./test/interfaces-contract.ts` failed 1/15 at the expected
  `SelectionApi.isSelection(value)` assertion (`true !== false`).
- Transaction-anchor red: `pnpm --filter @platejs/plite test
  ./test/anchor-contract.ts` failed 1/12 because a leaked `tx.anchor` remained
  usable after the callback instead of throwing `no longer active`.
- Installed-kind validation red: `pnpm --filter @platejs/plite test
  ./test/selection-protocol.test.ts` failed 1/16 because the read selection
  group had no `isValid` method.
- Predicate green: `interfaces-contract.ts` passed 15/15.
- Transaction-anchor green: `anchor-contract.ts` passed 12/12.
- Installed selection validation green: `selection-protocol.test.ts` passed
  16/16.
- Focused mapping suite: anchor contract, anchor mapping, range anchor,
  selection rebase, and selection protocol passed 54/54.
- Source-first typechecks passed for `@platejs/plite`, `@platejs/plite-react`,
  suggestion, legacy-list-model, and code-block.
- `pnpm --filter www api-reference` regenerated the public API manifest;
  `pnpm --filter www check:docs` passed API validation, MDX build, and source
  parity.
- `node tooling/scripts/check-plite-docs.mjs` passed the Plite v2 docs audit.
- `pnpm install` regenerated the Best API skill; exact source/mirror content
  parity passed after generated headers, with zero stale rejected API examples.
- `pnpm lint:fix` passed after removing the obsolete import.
- `pnpm check:plite:dev` passed in 122.775 seconds: 54 affected workspace
  typechecks, affected package tests, browser-core tests, 158 Plite contracts,
  74 focused tests across ten files, 44 benchmark targets, public package
  types/build, and Chromium smoke 3/3.
- Browser proof at
  `/examples/plite/persistent-annotation-anchors` rendered the editor, created
  the `0:1|0:4` annotation, mapped it to `1:9|1:12` after a fragment insertion
  and prefix insertion, kept the widget visible, then cleared the anchor and
  returned the sidebar/widget to `none`.
- The www docs UI route could not render because the current checkout has an
  unrelated Next build error: `apps/www/src/registry/blocks/editor-ai/page.tsx`
  exports `metadata` from a client component. This limits only manual docs-UI
  proof; the docs source build and audit passed.
- Final bounded audit found zero live `tx.refs`,
  `EditorTransactionRefsApi`, or `EditorTransactionDraftRef` matches. Both
  mapping consumers import the single
  `getRangeEndpointAssociations` owner. Scoped `tx.anchor` has no release call.
- `git diff --check` passed for the bounded item-5 owner set.
- P1 review command:
  `.agents/skills/autoreview/scripts/autoreview --mode commit --commit HEAD
  --max-priority P1`. It reviewed the immutable `33557a72` commit in two
  complete chunks, passed TruffleHog, and reported zero actionable findings.
- `node .agents/skills/autogoal/scripts/check-complete.mjs
  docs/plans/2026-08-23-unify-plite-selection-anchors.md` passed.

Final handoff prepared:
- Ownership and target API/runtime: `editor.anchor` is persistent and manually
  released; Path/Point/Range `tx.anchor` is transaction-scoped and resolve-only;
  editor state owns complete installed-kind/current-document selection
  validation; one internal helper owns range endpoint association.
- Public breaks and Plate/collaboration adoption: the transaction `refs` types,
  export, group, and call sites are deleted with no alias. Suggestion,
  legacy-list-model, code-block, Plite React, Plite tests, detached specs, docs, and
  generated API are migrated. No collaboration wire format changed.
- Applicable browser/Benchmark/docs/provenance decisions: package Browser and
  docs source proof pass; docs UI is blocked by the unrelated build error above;
  Benchmark, physical-device, release, and public provenance claims are out of
  scope.
- Proof and execution risks: scoped handles throw after their callback;
  persistent anchors retain manual release and cross-commit mapping. All
  identified mapping/deletion/custom-kind risks have direct contract proof.
- Execution order and user attention: implementation is complete. The checkout
  advanced externally to commit `33557a72` while review ran; this agent did not
  create, push, or publish that commit. Only this updated proof plan remains a
  local closeout artifact.

Timeline:
- 2026-08-23T10:11:46.348Z Plite Plan created.

Reboot status:
| Question | Answer |
| --- | --- |
| Where am I? | Completed local implementation and proof |
| Where am I going? | Final goal-plan validation and goal closure |
| What is the goal? | One scoped transaction-anchor API and sound selection predicates |
| What have I learned? | Lifetime belongs in the API contract; full custom-selection truth belongs to the installed editor owner. |
| What have I done? | Hard-cut the API, migrated callers/docs/doctrine, proved mapping and validation, and passed Browser plus P1 review. |

Open risks:
- Browser proof may require a dev-server/browser setup; failure will remain a
  scoped browser-proof gap rather than being misreported as core failure.
