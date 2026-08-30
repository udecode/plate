# Unify defineCodecs authoring

Objective:
Hard-cut `defineCodecs.merge` to one MIME-keyed `defineCodecs` map; done when
exact positive and negative inference contracts pass with zero regressions.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-07-30-unify-definecodecs-authoring.md

Template:
docs/plans/templates/plate-plan.md

Primary template:
docs/plans/templates/plate-plan.md

Applied packs:
- none

Mode:
- `standard` accepted-target execution. The user accepted the reviewed call
  shape and explicitly requested adoption.

Completion threshold:
- Zero production or documentation uses of `defineCodecs.merge`.
- Mixed HTML/Markdown, HTML-only, Markdown-only, foreign-target, arbitrary
  document-format, tuple, property-codec, and negative inference contracts pass
  without annotations, casts, `any`, or widened declarations.
- Focused Core and every changed package typecheck/test owner passes.
- Docs, API types, runtime implementation, callers, changeset, and generated
  barrels are aligned; final autoreview and `check-complete` pass.

Verification surface:
- Compile-only Core codec authoring contracts and finite declaration checks.
- Focused package typechecks/tests for every migrated production owner.
- Source audits for `.merge`, annotations/casts/`any`, and stale docs.
- `pnpm lint:fix`, applicable barrels, final autoreview, and plan checker.

Constraints:
- Preserve exact inferred callback types and all negative type failures.
- Stop adoption if the one-map shape cannot retain type parity without caller
  annotations, casts, `any`, helper aliases, or declaration widening.
- No public compatibility aliases or runtime shims.
- Do not use whole-repo CI as the acceptance signal; the user is concurrently
  working in this checkout. Use focused owning-package proof.
- Keep one plan as the execution ledger.

Boundaries:
- In scope: Core codec authoring types/runtime/contracts, all production
  `defineCodecs.merge` callers, public codec docs, package changesets, and
  generated barrels affected by the hard cut.
- Source owners: `packages/core`, feature packages declaring mixed codecs,
  and the Markdown serialization docs.
- Non-goals: codec runtime behavior redesign, Markdown compiler changes,
  browser behavior changes, compatibility aliases, and unrelated concurrent
  checkout work.
- Direct Plite boundary owners: N/A; this is Plate/Core authoring inference and
  declaration normalization, not raw Plite editor behavior.

Output budget strategy:
- Read named owners first; expand by evidence; count or artifact large audits
  instead of streaming them.

Blocked condition:
- The canonical one-map type cannot preserve an existing positive or negative
  inference contract after three distinct owning-type attempts. Stop with the
  failing contract and smallest unresolved generic boundary; do not restore
  `.merge` or weaken types.

Plate Plan state:
- status: done
- phase: handoff
- next: none
- handoff: prepared

Start Gates:
| Gate | Applies | Evidence |
| --- | --- | --- |
| Prompt requirements captured | yes | Adopt one map; preserve inference; stop on regression |
| Active goal and plan verified | yes | Active goal points to this plan |
| Current owners read | yes | Core authoring type, runtime normalizer, type contracts, mixed production callers, and prior hard-cut evidence |
| Best API target resolved | yes | `best-api review`: one MIME-keyed map; user accepted |
| Mode and execution boundary resolved | yes | One-shot accepted-target execution; focused proof only |

Work Checklist:
- [x] Outcome, scope, non-goals, constraints, and owners are concrete.
- [x] Current API/docs/tests/exports claims cite live source.
- [x] Reusable public call shape has one `best-api` verdict before target lock.
- [x] Every concept-level decision row has owner, adoption, proof, risk, and verdict.
- [x] Public breaks and any private bridge have complete adoption/deletion answers.
- [x] Execution slices and focused proof matrix are concrete.
- [x] Conditional work and final handoff are resolved without generic N/A matrices.
- [x] Add or strengthen compile-only contracts before changing the public type.
- [x] Implement one-map contextual typing and delete `.merge`.
- [x] Migrate every production/docs caller without annotations, casts, or `any`.
- [x] Add the release changeset relative to `main`.
- [x] Run focused owner verification, source audits, lint, review, and closure.

Completion Gates:
| Gate | Applies | Required action | Evidence |
| --- | --- | --- | --- |
| Binary readiness | yes | Resolve every codec-owned readiness condition | Exact positive/negative codec rows are clean; runtime is 2/2; zero `.merge` matches |
| Fresh source evidence | yes | Recheck decision-changing current claims | Current Core types/runtime, callers, docs, changeset, and emitted declarations re-read |
| Best API review | yes | Resolve/reject every P0/P1 call-shape finding | One-map API retained; schema-first constructor inference repaired without caller widening |
| Conditional risk and adoption | yes | Complete triggered risk/docs/browser/provenance work or give one scoped N/A reason | Docs and changeset aligned; browser N/A for type-only authoring/runtime-map normalization |
| Verification recorded | yes | Record fresh planning proof and exact execution gates | Commands and concurrent-checkout exclusions recorded below |
| Handoff prepared | yes | Prepare concise ownership, breaks, proof, risks, and execution order | Final handoff section is complete |
| Autoreview | yes | Run for implementation changes or record a scoped blocker | Helper attempted; unrelated untracked declaration files triggered its sensitive-file guard; manual scoped review found no codec-owned issue |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-30-unify-definecodecs-authoring.md` | ready |

Phase / pass table:
| Phase | Status | Evidence | Next |
| --- | --- | --- | --- |
| Ground | complete | Live Core/type/docs/caller owners audited | Decide |
| Decide | complete | `best-api` one-map verdict accepted by user | Execute |
| Execute | complete | `.merge` deleted; all source/docs callers use one map; changeset present | Prove |
| Prove and hand off | complete | Literal, mark, schema-factory, negative, declaration, runtime, caller, docs, and deletion proof recorded | Done |

Decision brief:
- outcome: one canonical inference-preserving codec declaration path.
- chosen shape: `defineCodecs({ 'text/html': ..., 'text/markdown': ... })`.
- strongest rejected alternative: public `.merge` inference partition.
- consequence: Core absorbs contextual typing complexity; all mixed callers
  migrate in one hard cut.

Decision ledger:
| Surface | Current | Target | Owner | Reason | Adoption | Proof | Risk | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Self/product codec declaration | `defineCodecs(map)` or `.merge(html, product)` | one MIME-keyed `defineCodecs(map)` | Core | one author job and one discoverable path | migrate all mixed callers and docs; delete method/runtime | compile-only parity plus owner typechecks | contextual union widens callbacks | rearchitect |
| Foreign codec declaration | `defineCodecs(Target, map)` | unchanged | Core | distinct target job | no migration | existing positive/negative contracts | overload competition | keep |
| Runtime normalization | `.merge` shallow-spreads and brands | normal one-map branding only | Core | no domain merge semantics | delete `Object.assign` method | Core tests/source audit | none if type layer succeeds | cut |

Execution slices:
| Slice | Owner | Scope | Entry | Exit | Proof |
| --- | --- | --- | --- | --- | --- |
| 1. Lock parity | Core | compile-only authoring contracts | accepted shape | every affected inference dimension represented | current contracts pass before implementation |
| 2. Re-type owner | Core | `DefinePluginCodecs` and normalization | parity matrix locked | one-map mixed declaration compiles; `.merge` absent | Core typecheck/tests/declaration proof |
| 3. Adopt | feature packages/docs | all mixed callers and teaching | Core proof passes | zero `.merge` uses | affected package typechecks and source audit |
| 4. Close | repo owners | changeset, barrels if needed, lint, review | adoption proof passes | all gates/checker pass | focused commands and autoreview |

Proof matrix:
| Claim | Planning evidence | Execution proof | Status |
| --- | --- | --- | --- |
| Mixed element HTML/Markdown inference is exact | existing mixed feature callers and Core contracts | exact callback and `IsAny` assertions are clean in the current contract emit | passed |
| Mixed mark HTML/Markdown inference is exact | Basic Styles callers | discriminated overload contract and Basic Styles typecheck passed | passed |
| Schema-factory mixed inference is exact | Blockquote and Code Block callers | schema factory is inferred before raw author input; exact HTML/Markdown positive and negative assertions are clean | passed |
| HTML property and tuple inference is exact | Core authoring contracts | current positive and negative contract emit has no codec-owned errors | passed |
| Foreign and arbitrary document codecs remain exact | existing overload contracts | current positive and negative contract emit has no codec-owned errors | passed |
| Public declarations remain finite and contain no codec-authoring `any` | existing declaration contract | emitted `CreateBasePlugin` and `DefinePluginCodecs` declarations inspected | passed |
| `.merge` is completely cut | source inventory | zero `defineCodecs.merge` source/docs/changeset matches | passed |

Conditional evidence:
- High-risk scenarios: mixed maps compile only by widening callbacks; generic
  document MIME keys steal known-format context; foreign overload regresses.
- External research: N/A; target and risk are local TypeScript contracts.
- Issue/PR provenance: N/A; direct user-approved local API hard cut.
- Docs/registry/browser/release/behavior-law owners: docs and release changeset
  apply; registry/browser/behavior-law are N/A because runtime editor behavior
  and UI do not change.

Findings:
- `.merge` is a type-only partition and shallow object spread at runtime, not a
  separate author job.
- Current doctrine already specifies one MIME-keyed `defineCodecs(map)`.
- Naive one-map unions do not satisfy the inference gate: mixed element HTML
  loses contextual typing even when Markdown remains exact.
- A unified map union and a named-known-key/index-signature map widen additional
  Markdown, arbitrary document-codec, property-codec, and negative contracts.
- The initial Core/type-contract files were restored after the failed
  experiments; no production caller was migrated.
- A later disjoint-overload owner made literal-schema mixed element and mark
  contracts pass: HTML-only maps forbid Markdown, generic document maps forbid
  both registered MIME keys, and the mixed map is the sole candidate.
- All production/docs `.merge` callers are migrated and Core runtime no longer
  exposes `.merge`.
- Package proof found schema-factory mixed callers require schema-first
  `createBasePlugin` contextual typing. The final overload infers the schema
  factory first and captures the raw author input separately, preserving exact
  result inference without annotating callers.

Decisions and tradeoffs:
- Accept greater internal generic complexity only when all caller inference and
  negative contracts stay exact.
- Reject annotations, casts, `any`, aliases, and compatibility overloads as
  false success.

Review fixes:
- Rejected the previously accepted one-map recommendation after compile-only
  proof contradicted it; no public cut proceeds with weaker inference.
- Reopened the target when disjoint overload domains removed the literal-schema
  regression; added schema-factory coverage before accepting package-wide proof.
- Repaired the constructor boundary after the schema-factory contract caught a
  real regression; added `IsAny` and negative discriminant/property assertions.
- Updated the Markdown docs to teach top-level `codecs` with HTML and Markdown
  in the same object.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
| --- | ---: | --- | --- |
| Separate direct mixed-map overloads | 1 | Consolidate one-argument maps through one owner type | Failed: mixed element HTML `content` is implicit `any` |
| Unified union of all self/product maps | 1 | Give registered keys explicit named context | Failed: HTML and Markdown callbacks widened and encoded literals lost context |
| Named registered keys plus arbitrary-format index signature | 1 | Isolate the mixed map from unrelated formats | Failed: arbitrary document/property contexts widened and negative error locations changed |
| Single isolated HTML-plus-Markdown map using `HtmlSelfRule` | 1 | Stop per user instruction | Failed: mixed element HTML `content` remains implicit `any` |
| Disjoint registered-format overload domains | 1 | Expand proof to schema factories | Passed literal element/mark positive and negative Core contracts |
| Schema-factory constructor inference | 4 | Infer the schema factory independently, then capture raw author input through an unconstrained generic intersected with the contextual author contract | Passed exact mixed positive, `IsAny`, and negative assertions; broader concurrent history/editor errors remain out of scope |

Verification evidence:
- `pnpm --filter @platejs/core typecheck:contracts` with the proposed one-map
  element and mark contracts -> failed at
  `base-plugin-contracts.ts(132,20)` because `content` is implicit `any`.
- Two broader owner shapes produced additional implicit-`any`, widened MDAST
  literal, arbitrary document-codec, and negative-contract failures.
- Source restoration audit -> Core authoring type and type contracts match the
  live pre-experiment snapshot; production and docs callers were not migrated.
- `pnpm --filter @platejs/core typecheck:contracts` with disjoint overloads and
  one-map element/mark contracts -> passed before the concurrent constructor
  rewrite.
- `@platejs/basic-styles`, `@platejs/link`, and `@platejs/table` typechecks ->
  passed with one-map production callers.
- `@platejs/basic-nodes` and `@platejs/code-block` typechecks -> exposed
  schema-factory constructor inference loss; no callback annotations or casts
  added.
- `bun test packages/core/src/lib/plugin/pluginAuthoringContext.spec.ts` ->
  2 passed, 0 failed.
- `rg "defineCodecs\\.merge" packages content .changeset` -> zero relevant
  matches.
- Final `pnpm --filter @platejs/core typecheck:contracts` -> no codec-authoring
  errors. The command remains red only at existing history `undo`/`redo`,
  Plite editor-extension portability, and other concurrent contracts.
- `@platejs/basic-styles`, `@platejs/link`, and `platejs`
  typechecks -> passed. Basic Nodes and Code Block have no codec callback/source
  errors; their package checks remain red in concurrent plugin/editor update
  consumers. List and Table remain red in unrelated target/history contracts.
- Focused Biome check for Core codec types/runtime/contracts -> passed.
  `createBasePlugin.ts` still reports unrelated unused aliases from the active
  constructor rewrite; root `lint:fix` is not a codec acceptance signal.
- `git diff --check` across the scoped Core, caller, docs, and changeset files
  -> passed.
- Autoreview helper -> stopped before review because unrelated untracked `.d.ts`
  files matched its sensitive-file guard. No files were staged, moved, ignored,
  or deleted; manual scoped source review found no actionable codec finding.

Final handoff prepared:
- Ownership and target API: one MIME-keyed Core `defineCodecs`; disjoint
  overload domains are internal inference machinery.
- Public breaks and adoption: `.merge` hard-cut; callers/docs migrated; no
  compatibility alias.
- Applicable runtime/package/docs/browser decisions: runtime normalizer and
  docs aligned; browser N/A.
- Proof and execution risks: no codec-owned regression remains; broader
  concurrent constructor/history/editor-extension work is still red.
- Execution order and user attention: none for this hard cut. Re-run the broad
  package matrix when the concurrent task closes.

Timeline:
- 2026-07-30T08:46:17.848Z Plate Plan created.
- 2026-07-30 User accepted the one-map `best-api` proposal with a mandatory
  no-type-regression stop condition; execution goal created.
- 2026-07-30 Compile-only parity failed across four bounded owner shapes;
  experiments restored and adoption stopped before caller migration.
- 2026-07-30 Disjoint registered-format overloads passed literal element/mark
  contracts; all `.merge` callers were migrated and runtime proof passed.
- 2026-07-30 Added schema-factory mixed coverage after package checks found the
  remaining constructor inference boundary; rolled back conflicting constructor
  experiments while the concurrent owner continued changing.
- 2026-07-30 Repaired schema-first inference, strengthened positive/negative
  contracts, taught the final top-level one-map call shape, and closed scoped
  proof without touching concurrent untracked files.

Reboot status:
| Question | Answer |
| --- | --- |
| Where am I? | Scoped hard cut complete |
| Where am I going? | Handoff |
| What is the goal? | One canonical `defineCodecs(map)` with exact type parity |
| What have I learned? | Disjoint MIME overloads solve map context; schema factories must infer before raw author input capture |
| What have I done? | Hard-cut `.merge`, migrated callers/docs, repaired schema-first inference, and proved exact positive/negative codec behavior |

Open risks:
- No codec-owned open risk. The checkout still has unrelated concurrent
  history/editor-extension/type-portability failures, so this is scoped proof,
  not a whole-repo green claim.
