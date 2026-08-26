# Repair stable node identity APIs

Objective:
Repair stable node identity contracts; done when schema-targeted IDs, key-only
reads, DOM key resolution, docs, doctrine, and focused proof pass.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-08-25-repair-stable-node-identity-apis.md

Template:
docs/plans/templates/plate-plan.md

Primary template:
docs/plans/templates/plate-plan.md

Applied packs:
- none

Mode:
- `standard`, executing an API target the user accepted with `ok go all`.

Completion threshold:
- Generated and migrated IDs obey the compiled `ElementIdPlugin` schema target.
- `editor.getApi(ElementIdPlugin).read.id` accepts only `NodeKey` and returns
  `string | undefined`; exact schema-derived elements use `.id` directly.
- `editor.api.dom.resolveDOMNode` accepts `Node | NodeKey` with mounted-node and
  missing-node proof.
- Focused tests, affected package typechecks, current docs, best-api doctrine
  repair, browser proof, required review, changeset, and `check-complete` pass.

Verification surface:
- `packages/core/src/lib/plugins/element-id/ElementIdPlugin.spec.tsx`.
- Focused `plite-dom` resolver tests plus affected package typechecks.
- English/Chinese docs and doctrine stale-shape source audits.
- A runnable Plite browser route proving DOM resolution where available.
- Required P1 review when branch policy permits it.

Constraints:
- The user accepted the exact target before this execution goal.
- No public compatibility aliases or runtime shims.
- Do not add a Tiptap-style `types` option; the schema property target is the
  only persisted-ID applicability owner.
- Do not add a lookup namespace or expose `NodeView`, `ViewDesc`, or DOM
  internals.
- Preserve the split between serialized element IDs and runtime-only `NodeKey`.

Boundaries:
- In scope: Element ID preparation/migration, its public read contract, the
  existing Plite DOM resolver, tests, current docs, doctrine mirrors, and
  release metadata.
- Source owners: `packages/core` for persisted IDs and `packages/plite-dom` for
  mounted DOM lookup.
- Non-goals: a global ID lookup/index namespace, ViewDesc/NodeView exposure,
  collaboration anchor design, and unrelated duplicate-scan optimization.
- Direct Plite boundary owners: `NodeKey`, schema targets, and DOM runtime maps.

Output budget strategy:
- Read named owners first; expand by evidence; count or artifact large audits
  instead of streaming them.

Blocked condition:
- Block only if the compiled schema exposes no canonical target-membership
  operation and three distinct in-scope implementations fail, or required
  browser tooling remains unavailable after all documented local fallbacks.

Plate Plan state:
- status: completed
- phase: prove-and-handoff-complete
- next: final user handoff
- handoff: prepared

Start Gates:
| Gate | Applies | Evidence |
| --- | --- | --- |
| Prompt requirements captured | yes | Three accepted contracts and explicit non-goals are recorded above. |
| Active goal and plan verified | yes | Goal tool points to this plan; one-shot execution selected. |
| Current owners read | yes | ElementIdPlugin implementation/tests and plite-dom resolver/runtime maps were read. |
| Best API target resolved | yes | Prior `best-api` hard-cut: delete the element overload, reuse schema targets, widen the existing DOM resolver. |
| Mode and execution boundary resolved | yes | User explicitly accepted all three changes with `ok go all`. |

Work Checklist:
- [x] Outcome, scope, non-goals, constraints, and owners are concrete.
- [x] Current API/docs/tests/exports claims cite live source.
- [x] Reusable public call shape has one `best-api` verdict before target lock.
- [x] Every concept-level decision row has owner, adoption, proof, risk, and verdict.
- [x] Public breaks and any private bridge have complete adoption/deletion answers.
- [x] Execution slices and focused proof matrix are concrete.
- [x] Conditional work and final handoff are resolved without generic N/A matrices.
- [x] Persisted-ID preparation obeys the compiled schema property target.
- [x] The unsafe element read overload is deleted and callers/docs are migrated.
- [x] The existing DOM resolver accepts `NodeKey` and proves missing/mounted behavior.
- [x] Required docs, doctrine repair, changeset, package/browser proof, and review close.

Completion Gates:
| Gate | Applies | Required action | Evidence |
| --- | --- | --- | --- |
| Binary readiness | passed | Resolve every readiness condition | All checklist rows and proof owners closed. |
| Fresh source evidence | passed | Recheck decision-changing current claims | Final source, caller, docs, doctrine, and diff audits completed after the last code edit. |
| Best API review | passed | Resolve/reject every P0/P1 call-shape finding, or record no public shape change | Hard-cut verdict executed: schema target reused, unsafe overload deleted, existing DOM owner widened. |
| Conditional risk and adoption | passed | Complete triggered risk/docs/browser/provenance work or give one scoped N/A reason | English/Chinese docs, Markdown adopter, browser route, doctrine mirrors, and package release metadata closed. Registry work did not apply because no registry source changed. |
| Verification recorded | passed | Record fresh planning proof and exact execution gates | Focused, package, docs, browser, development, and strict results are recorded below. |
| Handoff prepared | passed | Prepare concise ownership, breaks, proof, risks, and execution order | Ownership, deliberate break, evidence, and residual scope are recorded below. |
| P1 autoreview | passed | Run with `--max-priority P1` for implementation changes; P2/P3 are opt-in only, or record planning-only N/A | Scoped exception: the current branch is `next`, where repository policy forbids `autoreview`. Manual final diff review found one stale DOM-cache defect; it was fixed and replayed through focused and strict proof. |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-25-repair-stable-node-identity-apis.md` | Completion checker passed on the final ledger. |

Phase / pass table:
| Phase | Status | Evidence | Next |
| --- | --- | --- | --- |
| Ground | completed | Owners, constraints, and current contracts recorded. | Decide |
| Decide | completed | Accepted hard-cut target recorded below. | Execute |
| Execute | completed | All three accepted contracts, adopters, docs, doctrine, and changesets implemented. | Prove and hand off |
| Prove and hand off | completed | Focused tests, package checks, Browser route, strict Chromium, stale audits, and manual review passed. | Final handoff |

Decision brief:
- outcome: one schema-owned persisted-ID policy and one runtime-key DOM lookup.
- chosen shape: schema target controls ID generation; exact nodes read `.id`;
  generic code reads by `NodeKey`; the existing DOM resolver accepts both node
  values and keys.
- strongest rejected alternative: make IDs universal or add a parallel
  ID/DOM lookup namespace.
- consequence: the element overload is a deliberate public break; generic
  erased callers must hold a `NodeKey`.

Decision ledger:
| Surface | Current | Target | Owner | Reason | Adoption | Proof | Risk | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| ID applicability | Preparation assigns IDs to every element even when schema target excludes a type. | Generate/correct IDs only where the compiled property applies. | `packages/core` schema property | A second `types` policy would conflict with the schema. | Update migration/preparation and target-focused tests. | Block-target document with inline link prepares without assigning an inline ID. | Incorrect target matching could skip required block IDs. | rearchitect |
| Element ID read | `read.id` accepts an `Element` or `NodeKey`; erased elements can throw. | `read.id(key): string | undefined`; exact elements use `.id`. | `ElementIdPlugin` | The overload lies about schema-derived presence and duplicates direct property access. | Migrate tests, callers, docs; no alias. | Type/runtime tests and zero stale element-form calls. | Downstream compile break is intentional. | cut |
| DOM lookup | `resolveDOMNode` requires a `Node` despite runtime key maps already owning identity. | Accept `Node | NodeKey` in the existing resolver. | `packages/plite-dom` | Reuses the canonical runtime identity owner without new internals. | Update interface/static method/tests/docs. | Mounted key resolves same element; stale/unknown key returns null. | Key path must remain root-aware and virtualized nodes must stay null. | rearchitect |

Execution slices:
| Slice | Owner | Scope | Entry | Exit | Proof |
| --- | --- | --- | --- | --- | --- |
| 1 | `packages/core` | Schema-targeted ID preparation and key-only read | Accepted target | Focused ID tests green | Core test and typecheck |
| 2 | `packages/plite-dom` | Widen existing resolver and prove key behavior | Slice 1 contract stable | DOM tests green | Focused resolver test and typecheck |
| 3 | Docs/doctrine/release | Current teaching, best-api repair, changeset | Public implementation fixed | No stale shape remains | Source audits, generation parity, docs proof |
| 4 | Cross-owner proof | Browser, review, final checks | Slices 1-3 complete | All applicable gates close | Browser result, checks, `check-complete` |

Proof matrix:
| Claim | Planning evidence | Execution proof | Status |
| --- | --- | --- | --- |
| Schema target is canonical | Element ID property already owns a compiled `target`; repro failed only because preparation ignored it. | Red 12/13, then green 13/13 with excluded-inline cleanup. | passed |
| Element overload is unsafe | It asserted a property that exact generic `Element` types do not guarantee. | Signature deleted, negative type test added, callers/docs migrated, stale search clean. | passed |
| NodeKey can resolve mounted DOM | plite-dom already maps NodeKey to DOM keys internally. | 31/31 bridge tests cover live, removed, foreign, weak-map-lag, and reparented-stale keys; strict Chromium passed. | passed |

Conditional evidence:
- High-risk scenarios: excluded inline node accidentally receives an ID;
  targeted block misses its ID; stale/virtualized NodeKey returns a wrong DOM
  element instead of `null`.
- External research: the accepted comparison was completed against the local
  Tiptap checkout; no refresh is decision-critical during execution.
- Issue/PR provenance: N/A; this is a user-directed local API repair.
- Docs/registry/browser/release/behavior-law owners: English/Chinese current
  docs, package changeset, best-api doctrine/mirrors, and a Plite browser route
  apply; registry and release publication do not.

Findings:
- `prepareDocument` calls `migrateElementIds` without the compiled property
  applicability rule, so `target.group('block')` assigns an invalid ID to an
  inline link before schema validation.
- The element-form `read.id` asserts instead of expressing optional presence.
- plite-dom already owns NodeKey-to-DOM-key state; a second lookup owner is
  unnecessary.

Decisions and tradeoffs:
- Reuse the schema target rather than adding a plugin `types` option -> one
  policy owner -> implementation must find the canonical compiled membership API.
- Delete the element overload -> exact access becomes simpler and truthful ->
  intentional downstream compile break.
- Widen the existing resolver -> no extra namespace or internal view exposure
  -> unknown and unmounted keys must explicitly return `null`.

Review fixes:
- Manual diff review found that a connected cached DOM element reparented
  outside its editor could still resolve. Resolution now requires live editor
  containment for cached and path-fallback nodes. Node and key regressions cover
  the case.
- The affected development check found Markdown retaining the deleted element
  overload. Markdown now reads the schema-owned property from detached export
  elements and preserves optional-plugin behavior.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
| --- | ---: | --- | --- |
| Bun interpreted an unprefixed file path as a name filter. | 2 | Use an explicit `./` path and run the owning spec. | Corrected DOM and Markdown invocations passed. |
| Targeted migration helper widened the return union and erased plugin read inference. | 1 | Preserve exact `Value` and `EditorDocumentValue` overloads on the private helper. | Core typecheck passed. |
| Backticks in a double-quoted `rg` command invoked shell substitution. | 1 | Use single-quoted search patterns. | Stale-contract audit completed without shell evaluation. |
| Docs check found a stale generated API-reference manifest. | 1 | Regenerate through the owning `www api-reference` command. | `pnpm --filter www check:docs` passed. |
| `check:plite:dev` found Markdown calling the deleted element overload. | 1 | Read the schema property at the detached serialization boundary. | Markdown 23/23 and package typecheck passed. |
| Browser isolated-world evaluation did not expose `HTMLElement`. | 1 | Assert DOM identity through `nodeType` and rendered attributes. | Rich-text route interaction and console proof passed. |
| First final strict Chromium pass hit collaboration caret geometry once at batch 53. | 1 | Replay the exact donor row, then resume the full strict gate without product edits. | Exact row passed 1/1; resumed strict gate passed 710 tests with 8 skips across 79 batches. |

Verification evidence:
- `bun test packages/core/src/lib/plugins/element-id/ElementIdPlugin.spec.tsx`
  -> expected red: 12 pass, 1 fail; schema validation rejects `id` on excluded
  `elementIdLink` during preparation.
- `bun test packages/core/src/lib/plugins/element-id/ElementIdPlugin.spec.tsx`
  -> green: 13 pass, 0 fail, 42 assertions.
- `bun test ./packages/plite-dom/test/bridge.ts`
  -> 31 pass, 0 fail, 59 assertions.
- `bun test ./packages/markdown/src/lib/MarkdownPlugin.spec.ts`
  -> 23 pass, 0 fail, 59 assertions.
- Affected Core, Plite DOM, Markdown, and Plite app typechecks passed. Core's
  full graph completed 10/10 tasks; Markdown completed 36/36 tasks.
- Targeted `pnpm exec ultracite check` over the six changed TypeScript source,
  test, and type-contract files passed.
- `pnpm check:plite:dev` passed its affected typecheck, package-test, contract,
  integration, and Chromium smoke lanes.
- Final `pnpm check:plite` passed: 710 Chromium tests, 8 skips, 79 bounded
  batches; strict summary status `passed` in 149.3 seconds. The one prior
  collaboration geometry miss passed its exact one-test replay before the
  resumed strict run.
- `pnpm --filter www api-reference` regenerated the owning manifest, then
  `pnpm --filter www check:docs` passed source parity.
- Browser plugin proof loaded `http://127.0.0.1:3102/examples/plite/richtext`,
  found the editable root, typed ` identity-probe`, observed the rendered DOM,
  and reported no console warnings or errors.
- Source/mirror `cmp` passed for `schema-and-identity.md`; stale searches found
  no element-form ID read, exact-element overload teaching, or node-only DOM
  resolver signature.
- Release metadata is owned by the existing Core and Plite DOM major
  changesets plus one Markdown patch changeset.

Final handoff prepared:
- Ownership and target API: compiled Plate schema owns persisted-ID
  applicability; `ElementIdPlugin` owns key-to-persisted-ID conversion;
  `plite-dom` owns node/key-to-mounted-DOM resolution.
- Public breaks and adoption: `read.id(element)` is deleted without a shim.
  Exact schema-derived elements use `.id`; erased callers retain a `NodeKey`.
  All repository callers are migrated.
- Applicable runtime/package/docs/browser decisions: English/Chinese docs,
  best-api source/mirror doctrine, Markdown serialization, changesets, and the
  runnable Plite route are closed. No registry surface changed.
- Proof and execution risks: no in-scope blocker remains. The collaboration
  geometry failure was isolated as a one-run browser flake by exact green
  replay and a final full green strict run.
- Execution order and user attention: code, adopters, docs/doctrine, release
  metadata, focused proof, browser proof, development gate, strict gate, stale
  audit, and manual review are complete. Downstream element-form calls must
  migrate to keys or direct schema-derived `.id` access.

Timeline:
- 2026-08-25T17:19:23.369Z Plate Plan created.
- 2026-08-25 Accepted target materialized as a one-shot execution ledger.
- 2026-08-25 Added and ran the schema-target repro; it fails at the proven
  preparation boundary before the fix.
- 2026-08-25 Implemented schema-targeted preparation, key-only ID reads, and
  node/key DOM resolution; migrated Markdown and public teaching.
- 2026-08-25 Regenerated doctrine mirrors and API-reference output, added
  release metadata, and completed Browser proof.
- 2026-08-25 Closed focused, affected-development, docs, type, lint, and strict
  Plite proof; exact replay falsified one transient collaboration geometry miss.
- 2026-08-25 Final manual diff and stale-contract audits passed.

Reboot status:
| Question | Answer |
| --- | --- |
| Where am I? | Done |
| Where am I going? | Final handoff only. |
| What is the goal? | Repair schema-targeted persisted IDs, key-only reads, and NodeKey DOM resolution. |
| What have I learned? | The schema target was already canonical; Markdown needed detached-node schema access; cached DOM identity also needs live editor containment. |
| What have I done? | Implemented all accepted cuts, migrated adopters and teaching, and closed focused through strict proof. |

Open risks:
- The existing whole-document duplicate scan remains intentionally outside this
  task. It preserves correctness but may deserve separate measured performance
  work; no speculative optimization was added here.
- The key-only read is an intentional compile-time break for downstream callers.
  The migration is explicit: retain a `NodeKey` or use `.id` on an exact
  schema-derived element.
