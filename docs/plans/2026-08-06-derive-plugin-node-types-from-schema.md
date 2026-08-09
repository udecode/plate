# derive plugin node types from schema

Objective:
Derive plugin-owned public node types from final descriptor schemas; remove or
justify every manual plugin-package AST mirror in scope; preserve runtime
behavior and prove the owning package API/types.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-08-06-derive-plugin-node-types-from-schema.md

Template:
docs/plans/templates/plate-plan.md

Primary template:
docs/plans/templates/plate-plan.md

Applied packs:
- package-api

Mode:
- `standard` accepted-plan execution. The user already accepted the schema-first
  direction and instructed implementation; this plan records adoption and proof.

Completion threshold:
- Every exported plugin-package node alias that manually mirrors persisted
  schema fields is either derived from its final exported descriptor or has a
  recorded recursive/external-boundary justification; Footnote and Column have
  no hand-written public AST mirrors; focused package typechecks/tests, source
  audit, applicable release/barrel checks, P2 autoreview, and `check-complete`
  pass.

Verification surface:
- Bounded `packages/**/src` audit for exported `Element`/`Text` intersections,
  unions, and structurally repeated persisted fields.
- Focused type proof that `ElementOf<typeof FinalPlugin>` preserves the owned
  fields and unions without explicit node mirrors.
- Source-first typechecks and focused tests for every modified package plus
  lint/diff review and P2 autoreview.

Constraints:
- The prior schema-first plan is already accepted; execute in this activation.
- Runtime behavior and persisted identities must not change.
- Schema stays the sole first-party AST-shape source of truth.
- Keep genuinely recursive internal structural contracts private when required;
  public aliases still derive from the final descriptor.
- No public compatibility aliases or runtime shims.
- Keep one plan as the default artifact; add a machine-readable artifact only
  when it materially improves a large audit.

Boundaries:
- In scope: plugin package schemas, their public node aliases, direct consumers,
  exports, type tests, and required release artifacts.
- Source owners: `packages/footnote`, `packages/layout`, and every same-class
  plugin package found by the bounded audit.
- Non-goals: changing persisted names, runtime commands, registry product
  policy, or generated application `Value` architecture.
- Direct Plite boundary owners: Core schema inference/extractors only if live
  proof shows the descriptor cannot express the final node type without a cast,
  annotation, or duplicate structural alias.

Output budget strategy:
- Read named owners first; expand by evidence; count or artifact large audits
  instead of streaming them.

Blocked condition:
- Block only if three distinct owner-level fixes prove the final descriptor
  cannot expose its local schema shape without changing runtime schema law and
  no narrower Core inference repair remains.

Plate Plan state:
- status: complete
- phase: prove-and-handoff
- next: none
- handoff: prepared

Start Gates:
| Gate | Applies | Evidence |
| --- | --- | --- |
| Prompt requirements captured | yes | Footnote reference/definition and Column persisted fields must be schema-owned; audit the same class, not only named examples. |
| Active goal and plan verified | yes | Active goal points to this plan; one-shot accepted-plan execution. |
| Current owners read | yes | Read Footnote, Layout, Code Block, Media, NodeId, and Table descriptor/type owners plus the prior schema-derived Value plan. |
| Best API target resolved | yes | `best-api` Schema Shape Gate: schema is sole AST-shape truth; public AST aliases derive from the final exported descriptor. |
| Mode and execution boundary resolved | yes | Standard one-shot execution authorized by the user’s prior `go all` and current correction. |
| Package/API pack selected | yes | package-api |
| Public surface or package boundary identified | yes | Exported plugin node types and descriptor-local schema inference. |
| Release artifact path selected | yes | Existing per-package v54 major changesets already describe the final package migrations; these inference-only corrections add no distinct user migration from `main`. |
| `changeset` skill loaded when `.changeset` is required | yes | Loaded and applied the main-relative, one-package-per-file rules; no new prose is warranted. |
| Barrel/export impact decision recorded | yes | No exported files or barrel topology changed; `pnpm brl` is N/A. |

Work Checklist:
- [x] Outcome, scope, non-goals, constraints, and owners are concrete.
- [x] Current API/docs/tests/exports claims cite live source.
- [x] Reusable public call shape has one `best-api` verdict before target lock.
- [x] Every concept-level decision row has owner, adoption, proof, risk, and verdict.
- [x] Public breaks and any private bridge have complete adoption/deletion answers.
- [x] Execution slices and focused proof matrix are concrete.
- [x] Conditional work and final handoff are resolved without generic N/A matrices.
- [x] Package/API pack: public API, package boundary, export, and release-artifact impact are recorded.
- [x] Package/API pack: release artifact matrix is applied: `.changeset`, registry changelog, or explicit no-artifact reason.
- [x] Package/API pack: `.changeset` work loads `changeset` and follows its package/version/prose rules.
- [x] Package/API pack: registry-only work is N/A because no registry source changed.
- [x] Package/API pack: no new artifact is needed because existing v54 package changesets already own the main-relative migration and these corrections preserve the final public shapes.
- [x] Package/API pack: this is a hard cut of branch-local duplicate type ownership with no compatibility alias.
- [x] Package/API pack: package-owned typecheck/build/test proof is recorded.
- [x] Package/API pack: generated barrels and release notes are N/A because no file/export topology or distinct main-relative user delta changed.

Completion Gates:
| Gate | Applies | Required action | Evidence |
| --- | --- | --- | --- |
| Binary readiness | yes | Resolve every readiness condition | All in-scope gates pass; browser is explicitly blocked by unrelated generated-registry drift. |
| Fresh source evidence | yes | Recheck decision-changing current claims | Final bounded source audit and diff check are fresh. |
| Best API review | yes | Resolve/reject every P0/P1 call-shape finding, or record no public shape change | Schema is the sole unique AST-shape owner; retained refinements and one private cycle breaker are classified. |
| Conditional risk and adoption | yes | Complete triggered risk/docs/browser/provenance work or give one scoped N/A reason | Runtime tests pass; Browser was attempted and blocked by missing `apps/www/src/registry/components/editor/plate-types.ts`. |
| Verification recorded | yes | Record fresh planning proof and exact execution gates | See Verification evidence. |
| Handoff prepared | yes | Prepare concise ownership, breaks, proof, risks, and execution order | See Final handoff prepared. |
| P2 autoreview | yes | Run with `--max-priority P2` for implementation changes | Full local scan failed closed on unrelated secret-like WIP; isolated nine-file snapshot ran. Ten findings all target earlier accepted v54 hard cuts, not this type-ownership repair, and were rejected after live-source verification. |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-06-derive-plugin-node-types-from-schema.md` | Run after this plan update. |
| Public API / package boundary proof | yes | Source-audit public API, exports, and package boundary impact | No production Footnote/Column manual mirror remains; all unique public element aliases are descriptor-derived. |
| Release artifact classification | yes | Record whether the change is published package behavior/API/types/config/runtime, registry-only, or no published user-visible delta | Type ownership correction inside already-documented v54 package migrations. |
| Published package changeset | no | Add only for a distinct main-relative package delta | Existing Footnote/Layout/Table/Media/Code Block/Core changesets already own the final migrations; no duplicate prose added. |
| Registry changelog | no | Use only for registry-only source changes | No registry source changed. |
| No release artifact | yes | Record the exact reason | No distinct user-visible delta from `main` beyond existing package changesets. |
| Package typecheck/build/test | yes | Run owning package checks | Six-package Turbo typecheck passed; 167 focused tests passed. |
| Barrel/export generation | no | Run only when exports or exported file layout changed | No exported file or barrel topology changed. |

Phase / pass table:
| Phase | Status | Evidence | Next |
| --- | --- | --- | --- |
| Ground | complete | User requirements, accepted target, constraints, owners, and audit boundary recorded. | Decide |
| Decide | complete | Derive unique nodes from final descriptors; keep only schema-derived semantic refinements and the private Table declaration-cycle breaker. | Prove and hand off |
| Prove and hand off | complete | Typechecks, focused tests, lint, diff check, source audit, browser attempt, and P2 review recorded. | User review |

Decision brief:
- outcome: Public plugin-owned AST types come from plugin schema, including
  multi-variant unions such as Footnote.
- chosen shape: Derive public aliases with the final descriptor extractor;
  express each variant/property in schema and keep only unavoidable recursive
  scaffolding private.
- strongest rejected alternative: Public `Element & { ... }` mirrors and manual
  unions that duplicate schema law.
- consequence: Schema and descriptor inference become authoritative; any Core
  inference failure must be repaired at the owner instead of patched by aliases.

Decision ledger:
| Surface | Current | Target | Owner | Reason | Adoption | Proof | Risk | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Plugin-owned node aliases | Manual structural intersections/unions may duplicate persisted fields | Final descriptor schema owns fields and public aliases derive from it | Feature plugin + Core extractor | One source of truth and exact consumer inference | Adopt direct consumers/exports without compatibility mirrors | Compile-only field/union proof and package typecheck | Recursive definitions may need private scaffolding | rearchitect |
| Cross-plugin property refinements | Element intersections repeat useful semantic capabilities | Keep the refinement but infer persisted property keys/values from the owning schema | NodeId, Media, Table | Property-only plugins do not own one element identity | Derive `IdElement.id` and media width from schema; Table picks only optional `id` | Core/Media/Table typecheck | Accidentally inheriting optional `children` through `Partial<IdElement>` | refine |
| Table algorithm shape | Grid needs table structure before `BaseTablePlugin` finishes inference | Keep one package-private `TableNode` cycle breaker | Table | Importing final `TableElement` back into its own declaration graph is recursive | No public export/barrel exposure; public Table aliases stay descriptor-derived | Table typecheck and grid/mutation tests | Private fields can drift; bounded audit documents the exception | keep-private |

Execution slices:
| Slice | Owner | Scope | Entry | Exit | Proof |
| --- | --- | --- | --- | --- | --- |
| Audit and classify | Plugin packages | Every exported/manual AST type and its final descriptor | Accepted target recorded | Complete manifest with derive/keep-private/external decisions | Source audit counts |
| Repair schemas and aliases | Feature owners; Core only if required | Footnote, Column, and all same-class findings | Audit complete | Public aliases derive from final descriptors; runtime unchanged | Focused typechecks/tests |
| Adopt and close | Direct callers/exports/release owner | Consumer generics, barrels, changeset, review | Owner repairs pass | No stale manual mirrors or P0/P1 findings | rg, brl decision, lint, P2 autoreview, checker |

Proof matrix:
| Claim | Planning evidence | Execution proof | Status |
| --- | --- | --- | --- |
| Footnote and Column persisted fields are schema-owned and inferred | Named source plus schema/extractor definitions | Footnote/Layout package typechecks and focused tests pass | pass |
| Same-class manual aliases are fully audited | Bounded declaration manifest and consumer counts | Zero production Footnote/Column mirrors; remaining intersections classified below | pass |
| Runtime/persisted identity is unchanged by this repair | Descriptor/schema diff inspection | 167 focused tests pass; only Table string-ID narrowing is runtime-relevant and matches its string-keyed index | pass |

Conditional evidence:
- High-risk scenarios: accidental field optionality change; union collapse;
  descriptor declaration recursion/TS2589 or TS7056; persisted identity drift.
- External research: N/A; the accepted API law and current repo are authoritative.
- Issue/PR provenance: N/A; user-directed current-tree architecture repair.
- Docs/registry/browser/release/behavior-law owners: package release/type surface
  applies; browser is N/A unless source changes runtime behavior or a runnable
  package-facing route is needed to verify a modified runtime path.

Findings:
- `FootnoteReferenceNode`, `FootnoteNode`, and production `ColumnNode` were
  duplicate AST owners. They are removed; Footnote uses a local union inferred
  from both final descriptors, and Layout uses `ColumnElement` from its final
  item descriptor.
- `CodeSyntaxText` now derives the persisted mark from
  `TextOf<typeof BaseCodeHighlightPlugin>` and adds only ephemeral decoration
  `className`.
- `ResizableElement` and `IdElement` are legitimate property-capability
  refinements because their plugins do not own one element identity; their
  persisted value types now derive from schema.
- Public Table row/cell/table aliases derive from final descriptors and pick
  only the optional schema-derived NodeId field. `Partial<IdElement>` was
  rejected because it also made inherited `children` and `type` optional.
- Remaining raw intersections are generated schema output, infrastructure,
  property-only semantic refinements (List/Suggestion/NodeId/Resizable), the
  maintenance-only List Classic exception, or Table's private declaration-cycle
  breaker. None is an unclassified unique plugin-owned public node mirror.

Decisions and tradeoffs:
- Final descriptor inference beats handwritten public AST mirrors. A union is
  valid only when it is itself inferred from one final plugin schema or is a
  private recursive compiler aid.

Review fixes:
- Tightened Table's NodeId refinement from `Partial<IdElement>` to
  `Partial<Pick<IdElement, 'id'>>` after the combined typecheck exposed optional
  inherited structure.
- Rejected all ten isolated P2 review findings because they target earlier
  accepted v54 hard cuts visible in the shared file diffs, not this task's
  schema-derived alias edits.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
| --- | ---: | --- | --- |
| Table typecheck: `Partial<IdElement>` made inherited `children`/`type` optional | 1 | Pick only the NodeId property | Replaced with `Partial<Pick<IdElement, 'id'>>`; six-package typecheck passed. |
| Browser table demo: generated registry imports missing `plate-types.ts` | 1 | Keep package proof authoritative; do not repair unrelated registry WIP | Browser blocker recorded; no in-scope source changed. |
| Full-checkout autoreview secret scan failed on unrelated WIP | 1 | Review an isolated Git snapshot of the exact nine source files | Scoped P2 review completed; all findings classified. |

Verification evidence:
- `pnpm turbo typecheck --filter=./packages/core --filter=./packages/table
  --filter=./packages/media --filter=./packages/code-block
  --filter=./packages/footnote --filter=./packages/layout`: 21/21 tasks pass.
- `bun test` across Footnote, Layout, Table grid/mutation, Media contracts, Code
  Block, and NodeId: 167 pass, 0 fail.
- `pnpm lint:fix`: pass; Biome checked 4,080 files and fixed one file.
- `git diff --check` on the exact task files: pass.
- Bounded production source audit: no `FootnoteReferenceNode`, `FootnoteNode`,
  or `ColumnNode`; all remaining raw `Element`/`Text` intersections classified.
- Browser `/blocks/table-demo`: blocked before render by unrelated generated
  registry import of missing `apps/www/src/registry/components/editor/plate-types.ts`.
- P2 autoreview command: isolated exact-file snapshot with
  `autoreview --mode local --max-priority P2`; ten findings rejected as earlier
  accepted hard-cut deltas outside this invariant.

Final handoff prepared:
- Ownership and target API: plugin schema owns persisted node shape; public
  unique aliases use `ElementOf`/`TextOf` from final descriptors.
- Public breaks and adoption: no compatibility aliases; branch-local duplicate
  aliases removed and direct consumers use inferred types.
- Applicable runtime/package/docs/browser decisions: runtime identities stay
  unchanged by this packet; existing v54 changesets cover release; browser
  blocker is unrelated registry generation drift.
- Proof and execution risks: six-package types and 167 focused tests pass; one
  private Table cycle breaker remains intentionally structural.
- Execution order and user attention: complete; only the unrelated registry
  missing-file blocker remains outside this task.

Timeline:
- 2026-08-06T15:24:12.924Z Plate Plan created.

Reboot status:
| Question | Answer |
| --- | --- |
| Where am I? | Complete |
| Where am I going? | User handoff |
| What is the goal? | Make plugin schema the sole public node-shape owner and remove compensating AST aliases. |
| What have I learned? | Unique plugin nodes can derive cleanly; property-only refinements need schema-derived properties; Table needs one private cycle breaker. |
| What have I done? | Removed duplicate mirrors, repaired sibling refinements, verified packages/tests/lint/audit/review, and prepared handoff. |

Open risks:
- Browser rendering remains unverified because unrelated generated registry
  source imports a missing `plate-types.ts`; the affected package behavior is
  covered by focused runtime tests.
