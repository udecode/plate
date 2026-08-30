# Hard cut generic plugin mutations

Objective:
Hard-cut the accepted plugin mutation audit; done when all named APIs/callers/docs are migrated and Core/package/browser/review gates pass; plan docs/plans/2026-08-04-hard-cut-generic-plugin-mutations.md.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-08-04-hard-cut-generic-plugin-mutations.md

Template:
docs/plans/templates/plate-plan.md

Primary template:
docs/plans/templates/plate-plan.md

Applied packs:
- none

Mode:
- `standard` accepted-plan execution.

Completion threshold:
- Implement all 9 generic replacements, 8 internalizations, and 4 move/rename
  rows from the accepted 239/239-method audit with zero compatibility aliases.
- Standardize the six custom element inserts on `insert(input?, nodeOptions?)`,
  delete the eight named public option/compiler-ferry types, and remove every
  accepted explicit element generic while preserving the two Suggestion text
  escapes and the optional DOCX Table guard.
- Make descriptor-scoped `update` policy-aware, callable, inferred, and
  one-shot; prove default and tagged execution, history/rollback behavior, and
  declaration emit without `any` or public capability-subset types.
- Adopt source, exports, tests, EN/CN docs, registry examples/components,
  changesets, generated contracts, and reusable doctrine; complete focused
  package checks, browser demos, lint, barrels, autoreview, and
  `check-complete`.

Verification surface:
- Focused Core runtime/type tests for synthesized CRUD, authored precedence,
  callable scoped update policy, single delegation, history, and rollback.
- Package typechecks/tests for Core, Callout, Code Drawing, Code Block, Date,
  Footnote, Indent, Layout, Link, Math, Media, Mention, Selection, and Table;
  source-first www typecheck and focused registry tests.
- Source audits for every removed name/type, explicit element generic, stale
  signature, docs call, export, and compatibility path.
- Browser proof on available standalone Callout, Code Drawing, Equation,
  Layout, Media, and Table demo routes, including console checks.
- `pnpm brl`, `pnpm install` after rule repair, generated-contract check,
  `pnpm lint:fix`, applicable root check, autoreview, and mechanical plan check.

Constraints:
- No public compatibility aliases or runtime shims.
- Preserve semantic custom methods, compound update history/selection, Media
  URL normalization, Suggestion text-property escapes, and DOCX's optional
  Table integration guard.
- Do not add generic reads, aggregate-property mutation magic, `baseInsert`, a
  plugin overload on raw `nodes.*`, universal `unset`, missing-plugin schema
  fallbacks, explicit callback annotations, casts, or public subset types.
- Do not touch templates manually, legacy-list-model maintenance surfaces, device
  testing, unrelated source, or external systems. Do not commit or publish.

Boundaries:
- In scope: Core descriptor portal runtime/types/tests; the 13 named feature
  package owners; their public exports/tests; registry callers; affected EN/CN
  docs; package changesets; generated editor contract checks; best-api and Plate
  Vision doctrine for the accepted reusable rules.
- Source owners: `packages/core`, Callout, Code Drawing, Code Block, Date,
  Footnote, Indent, Layout, Link, Math, Media, Mention, Selection, Table,
  `apps/www/src/registry`, `content/docs`, `.agents/rules/best-api.mdc`, and
  `docs/vision/plate.md`.
- Non-goals: redesigning semantic survivors, generic property CRUD, generic
  selection reads, DOCX dependency changes, Legacy list model, unrelated colocation,
  release or PR actions, real-device testing.
- Direct Plite boundary owners: root `editor.update` policy/delegation semantics
  are consumed but not redesigned; Plate Core owns the scoped portal facade.

Output budget strategy:
- Read named owners first; expand by evidence; count or artifact large audits
  instead of streaming them.

Blocked condition:
- Stop only after three materially different attempts prove that the accepted
  callable portal cannot preserve root update semantics or package declaration
  emit without a public type regression, or required browser/package tooling is
  unavailable and no equivalent local proof exists.

Plate Plan state:
- status: complete
- phase: handoff
- next: none
- handoff: source packet complete; unrelated checkout blockers recorded below

Start Gates:
| Gate | Applies | Evidence |
| --- | --- | --- |
| Prompt requirements captured | yes | Accepted audit requirements and the user's `go all` authorization are copied into this plan. |
| Active goal and plan verified | yes | Active goal names this exact plan and measurable threshold. |
| Current owners read | yes | Root/detail Vision and accepted 239/239 audit read; live owners are rechecked slice by slice before editing. |
| Best API target resolved | yes | Accepted audit fixes the target: descriptor CRUD, uniform insert arguments, callable policy-aware scoped update, hard cut. |
| Mode and execution boundary resolved | yes | One-shot accepted-plan execution; source, adoption, docs, release artifacts, and proof authorized; no commit/publish. |

Work Checklist:
- [x] Outcome, scope, non-goals, constraints, and owners are concrete.
- [x] Current API/docs/tests/exports baseline comes from the accepted live-source audit and will be refreshed before each edit.
- [x] Reusable public call shape has one accepted `best-api` verdict.
- [x] Every concept-level decision row has owner, adoption, proof, risk, and verdict.
- [x] Public breaks have complete hard-cut adoption/deletion answers; no private bridge is accepted.
- [x] Execution slices and focused proof matrix are concrete.
- [x] Implement and prove Core callable scoped update policy with exact inference and one root transaction delegation.
- [x] Implement and prove all 9 generic replacements and schema defaults.
- [x] Implement and prove six custom insert signature normalizations and delete eight named public ferry types.
- [x] Implement and prove four ownership/name corrections.
- [x] Internalize/delete all eight accepted alternatives and sweep callers/docs/exports.
- [x] Migrate every accepted explicit element generic; preserve only the two Suggestion text escapes and optional DOCX guard.
- [x] Update tests, EN/CN docs, registry callers, changesets, generated contracts, barrels, and reusable doctrine.
- [x] Complete applicable package/root/browser/lint/review proof and close every in-scope plan gate; record unrelated checkout blockers without changing them.

Completion Gates:
| Gate | Applies | Required action | Evidence |
| --- | --- | --- | --- |
| Binary readiness | yes | Resolve every accepted implementation and adoption row | complete: every accepted cut/move/signature/adoption row is implemented with no alias |
| Fresh source evidence | yes | Recheck decision-changing current claims before edits and final sweep | complete: final removed-name and explicit-generic censuses recorded below |
| Best API review | yes | Apply accepted call shapes and run final best-api drift review | complete: source rule and Plate Vision repaired; generated skill synced |
| Conditional risk and adoption | yes | Complete package/docs/registry/browser/release/doctrine adoption | complete in source; Browser attempted and blocked before feature load by unrelated stale CI-generated registry output |
| Verification recorded | yes | Record exact command, source-audit, browser, and review results | complete: exact counts and blockers below |
| Handoff prepared | yes | Prepare concise outcome, ownership, breaks, proof, and residual risk | complete |
| Autoreview | yes | Run after implementation/proof and close accepted findings | complete: three accepted registry findings fixed; clean rerun |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-04-hard-cut-generic-plugin-mutations.md` | complete: checker passes |

Phase / pass table:
| Phase | Status | Evidence | Next |
| --- | --- | --- | --- |
| Ground | complete | Accepted 239/239 audit, Vision, skills, and implementation scope read | Execute |
| Decide | complete | User accepted all P0-P2 rows and rejected P3 machinery | Execute |
| Execute | complete | Core portal, 13 package owners, docs, registry, changesets, generated contracts, doctrine | Prove |
| Prove and hand off | complete | Package/runtime/type/source/review gates green; unrelated root/browser blockers recorded | Final response |

Decision brief:
- outcome: one descriptor-owned generic mutation path for ordinary CRUD, with semantic methods only where behavior is richer.
- chosen shape: schema defaults + synthesized `insert/set/remove`; semantic `insert(input?, nodeOptions?)`; callable `portal.update(policy)`; scoped transaction groups for inferred package mutations.
- strongest rejected alternative: keep convenient wrappers/types and add plugin-aware overloads to raw `nodes.*`.
- consequence: breaking but materially smaller API, inferred element shapes, no duplicate verbs, and one honest transaction-policy path.

Decision ledger:
| Surface | Current | Target | Owner | Reason | Adoption | Proof | Risk | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Ordinary element insert/set | Nine authored wrappers duplicate descriptor CRUD | Move canonical defaults to schema and delete wrappers | Core synthesis + feature schema owners | One deterministic type-bound law | Migrate registry/docs/tests | Defaults, selection, history, browser | Block placement/default parity | cut |
| Semantic insert arguments | Six incompatible merged option objects and eight ferry types | `insert(input?, nodeOptions?)` with inferred inline input | Feature plugin owners | Domain input and node placement are distinct jobs | Hard-cut callers/docs/types | Typecheck, behavior tests, declaration emit | Selection/history drift | rearchitect |
| Scoped update policy | Portal update methods always open untagged one-shot updates | Callable `portal.update(policy).method()` delegating once to root update | Core | Tagged semantic updates should stay descriptor-scoped | Migrate Equation and test types/runtime | Core unit/type/history/rollback proof | Nested or duplicate update | rearchitect |
| Column/Indent ownership | Group operations live on item; relative indent is named `set` | Move group operations to Column plugin; rename to `insert`, `setColumns`, `toggle`; `indent.change` | Layout/Indent | Owner and verb match semantics | Migrate callers/docs/tests | Package tests/browser | Shortcut/selection parity | move |
| Public alternatives | Eight unused/one-owner aliases and helpers | Inline or keep lexical at owner | Selection/Media/Table | No independent public job | Sweep exports/docs/callers | Source audit + tests | Hidden consumer | cut |
| Explicit element generics | 25 raw typed calls, 23 restating descriptor identity | Descriptor portal or tx group; schema creation for optional Footnote | Package/app owners | Inference should follow descriptor | Migrate 23; keep 2 Suggestion text escapes | Typecheck + source audit | Dynamic text/property case | cut |
| Optional Table in DOCX | Guarded runtime portal | Keep `installed` guard | DOCX | Optional integration has no compiled identity when absent | None | Typecheck/test/source audit | False dependency if removed | keep |
| Reusable doctrine | Accepted API law is only in audit | Repair best-api rule and Plate Vision, regenerate skills | Rule/Vision owners | Prevent regression | `pnpm install`; rule audit | Generated skill sync | Overgeneralizing package detail | rearchitect |

Execution slices:
| Slice | Owner | Scope | Entry | Exit | Proof |
| --- | --- | --- | --- | --- | --- |
| 1. Core policy | `packages/core` | Callable scoped update runtime/types/tests | Accepted target and live owner read | Default/tagged calls infer and delegate once; history/rollback tests pass | Focused Core tests/typecheck |
| 2. Generic defaults/cuts | Callout, Code Drawing, Math, Layout, Media | Schema defaults, wrapper deletion, callers/tests | Core baseline green | 9 projected replacements complete | Focused package tests/typechecks |
| 3. Semantic signatures/owners | Code Block, Date, Footnote, Math, Layout, Mention, Indent | Uniform inserts, owner moves/renames, ferry-type deletion | Slice 1 types available | New calls infer; behavior preserved | Focused tests/declaration emit |
| 4. Explicit generics/internal helpers | Layout, Link, Placeholder, Selection, Table, UI | Portal/tx adoption and eight internalizations | Owner collisions resolved | 23 calls migrated; deleted names absent | Typechecks/tests/source audits |
| 5. Public adoption | docs, registry, exports, changesets, generated contracts | Current-state EN/CN examples and release artifacts | Source API settled | No stale public call shape | www typecheck, brl, changeset audit, generator check |
| 6. Doctrine/proof | rules, Vision, all touched owners | best-api repair, sync, browser, lint, checks, autoreview | Implementation stable | Every gate green or exact blocker recorded | pnpm install, Browser, lint, checks, reviewer, checker |

Proof matrix:
| Claim | Planning evidence | Execution proof | Status |
| --- | --- | --- | --- |
| Scoped update policy is one inferred facade and one root update | Core live owner and accepted audit | 35 focused Core tests plus Core declaration/typecheck proof | pass |
| Generic replacements preserve defaults, placement, selection, and one undo unit | Feature implementations/tests | 297 focused feature tests plus 235 Table tests; generated contract and www checks | pass |
| Semantic inserts keep behavior while separating node options | Current implementations and consumers | Package tests/typecheck/declaration emit and 18 registry transform tests | pass |
| Removed APIs leave no aliases, stale exports, docs, or callers | Counted accepted manifest | Exact current-source `rg` sweep is empty; only two accepted Suggestion text generics remain | pass |
| Registry UI still works on real routes | Standalone demos identified in audit | Browser attempted on `/blocks/callout-demo`; blocked before feature code by stale CI-generated registry import of deleted `plate-types.ts`; focused runtime tests and www typecheck are green | blocked outside packet |

Conditional evidence:
- High-risk scenarios: duplicate/nested transaction from callable facade;
  generic block insert changes placement/history; signature split drops explicit
  `at` or selection options; declaration inference widens or hits TS7056.
- External research: N/A: accepted design and runtime truth are local.
- Issue/PR provenance: N/A: user-directed current-tree architecture work.
- Docs/registry/browser/release/behavior-law owners: all apply; update current
  EN/CN docs, registry consumers, one package changeset per published package
  relative to `main`, focused browser routes, and smallest reusable doctrine.

Findings:
- Accepted source audit classified 239/239 projected methods: 9 generic
  replacements, 8 internalizations, 4 move/rename rows, 218 semantic keeps.
- Accepted explicit-generic census found 25 production calls: migrate 23 and
  retain only two Suggestion text-property escapes.
- Core synthesizes descriptor `insert/set/remove` and authored same-name methods
  replace them; the only substrate gap is policy on the scoped update facade.

Decisions and tradeoffs:
- Hard cut: no aliases, deprecated overloads, merged legacy arguments, or raw
  fallback paths.
- Schema defaults own canonical construction; authored same-name mutations
  survive only for observably richer behavior.
- Keep DOCX `installed`, Media `setUrl`, semantic aggregate-property methods,
  and two Suggestion text escapes. Reject broader generic machinery.

Review fixes:
- First autoreview found three in-scope registry defects. `getActionType` now
  treats flat-list actions as their list identity and routes the local
  three-column action through `BaseColumnPlugin`; TOC placement and selection
  are passed as the second insert argument. Four focused regressions cover the
  modern and classic paths.
- The same final typecheck found Code Block and three Media generic `set` calls
  passing element values as `at`; they now use the render path, with a safe
  live-path lookup for the nested Code Block combobox.
- Rejected one reviewer suggestion to restore optional-plugin `installed`
  fallbacks: it is adjacent shared-checkout work and contradicts this plan's
  accepted no-missing-plugin-fallback constraint.
- Final autoreview: clean, zero accepted/actionable findings, patch correct at
  0.72 confidence.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
| --- | ---: | --- | --- |
| Initial focused test filter did not select the intended files | 1 | Run exact test paths | Focused package suites ran with recorded counts |
| Layout staged `tx.column.set` collided with the new group verb | 1 | Use inferred raw node mutation inside the private transaction | Declaration-safe without adding a public subset type |
| Broad Table source scan overflowed useful output | 1 | Scope scans to accepted names and owners | Exact topology/source audit completed |
| Callout test retained old placement/default assumptions | 1 | Test schema-materialized default and explicit second argument | Focused suite green |
| Layout test expected pre-correction widths | 1 | Assert canonical 50% creation plus group correction result | Focused suite green |
| Equation test mock retained merged options | 1 | Migrate mock to domain input plus node options | Focused suite green |
| Generated editor contracts were stale after API adoption | 1 | Run the supported editor generator for the three committed contracts | `editor:check` green |
| List still called `tx.indent.set` | 1 | Migrate the two remaining owner calls to `change` | List and www typechecks green |
| Root check reported six slow failures | 1 | Fix the one in-scope Math caller; isolate the remaining unrelated failures | Math slow test 2/2; five unrelated failures recorded below |
| Browser route failed before feature code | 1 | Trace the import owner and use focused runtime/type proof | CI-generated registry index imports deleted `plate-types.ts`; local registry generation is forbidden |
| Codex autoreview exceeded its 1 MiB input cap | 1 | Use the Claude reviewer on the complete 1.33M-character bundle | Full review completed |
| First full autoreview found three registry regressions | 1 | Fix each owner and add focused tests, then rerun | 18/18 transforms tests; clean final review |
| Fresh www typecheck found four invalid element-valued `at` arguments | 1 | Use precomputed paths or a live node-path lookup | Full www typecheck green |

Verification evidence:
- Plan setup: full `autogoal`, `plate-plan`, `hard-cut`, `best-api`, and
  `changeset` skills read; root/common/Plate Vision and accepted audit read.
- Core: 35/35 focused policy, inference, history, rollback, and declaration
  tests pass. Focused Core/Layout/Math/Table source-first typecheck is 18/18
  tasks.
- Features: 297/297 focused tests pass across Callout, Code Drawing, Code
  Block, Date, Footnote, Indent, Layout, Link, Math, Media, Mention, and
  Selection. Table is 235/235. Registry block transforms are 18/18.
- Package graph: all 14 target-package source-first typechecks pass (31/31
  tasks). `@platejs/list` typecheck passes after `indent.change` adoption.
- Public adoption: `pnpm --filter www typecheck` passes, including all three
  generated editor contract checks, API reference, docs-source parity,
  registry-source parity, app TypeScript, and package integration TypeScript.
- Mechanical outputs: `pnpm brl` passes (56/56 tasks); `pnpm install`
  regenerates the repaired skills; `pnpm lint:fix` passes with only 15 existing
  over-1-MiB artifact warnings.
- Source audit: no removed current API/type/caller name remains outside
  historical migration docs/changelogs. The production explicit node-generic
  census contains only the accepted `SuggestionText` calls at
  `BaseSuggestionPlugin.ts:934` and `:1445`.
- Root `pnpm check`: all 58 package build/typecheck tasks and 3064/3064 fast
  tests pass; slow tests are 1567 pass after the focused Math repair, with five
  unrelated failures: four autoformat/link kits require a non-installed
  `codeBlock` portal and one Utils test uses the rejected legacy
  `schema.elementProperty({ key })` shape.
- Browser: `/blocks/callout-demo` cannot reach feature code because the
  CI-generated `apps/www/src/__registry__/index.tsx` still imports the deleted
  source file `registry/components/editor/plate-types.ts`. Repo policy forbids
  local `build:registry`; no false browser-success claim is made.
- Autoreview: Codex could not accept the 1.33M-character bundle; full Claude
  review found three in-scope P1s, all fixed and regression-tested. Full rerun
  reports no actionable findings.
- Mechanical plan check: `check-complete.mjs` reports this plan complete.

Final handoff prepared:
- Ownership and target API: descriptor CRUD owns ordinary mutations; authored
  methods survive only for richer semantics; scoped update policy delegates
  once to root `editor.update`.
- Public breaks and adoption: all accepted aliases, option ferry types, helper
  reads, wrappers, exports, docs, registry callers, generated contracts, and
  changesets are migrated with no compatibility path.
- Applicable runtime/package/docs/browser decisions: runtime, type, docs, and
  registry-source gates pass; real Browser proof is blocked by unrelated stale
  CI output before feature loading.
- Proof and execution risks: exact package/test/source/review evidence is above;
  the five root slow failures and generated registry import are not caused by
  this packet and were left untouched.
- Execution order and user attention: no in-scope follow-up is required.

Timeline:
- 2026-08-04T11:10:54.084Z Plate Plan created.
- 2026-08-04T14:06:19+02:00 Implementation, adoption, doctrine, source audits,
  package proof, full review loop, and handoff completed.

Reboot status:
| Question | Answer |
| --- | --- |
| Where am I? | Completed hard-cut handoff |
| Where am I going? | No remaining in-scope work |
| What is the goal? | Complete every accepted hard-cut row with no type/runtime regression |
| What have I learned? | Schema-derived CRUD removes wrappers cleanly, but registry actions must distinguish plugin identity from UI-local and list identities |
| What have I done? | Completed Core/package/adoption/doctrine hard cuts and closed all accepted review findings |

Open risks:
- Browser routes remain unavailable until CI regenerates the registry index
  against the deleted `plate-types.ts` source. That output is outside this
  packet and must not be regenerated locally.
- Five unrelated slow tests keep root `pnpm check` red despite every target
  package, fast test, focused slow test, www typecheck, and review gate passing.
- Code Block retains its proven private TS7056 declaration stage; it is not a
  public API or capability-subset escape.
