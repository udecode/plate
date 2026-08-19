# Audit registry hooks

Objective:
Audit every custom hook defined in Plate registry source and assign each a
consumer-backed inline, controller, context, keep, or delete verdict.

Goal plan:
docs/plans/2026-08-18-audit-registry-hooks.md

Template:
docs/plans/templates/architecture-cleanup.md

Primary template:
docs/plans/templates/architecture-cleanup.md

Applied packs:
- none

Cleanup source:
- type: explicit user-requested source audit
- id / link: N/A
- title: Registry hook colocation audit
- requested surface: `apps/www/src/registry/**`
- cleanup intent: list every registry-defined custom hook and identify hooks
  that should be inlined into their sole component instead of surviving as a
  named hook function.
- acceptance criteria: zero unmapped custom hook declarations; every row names
  its source, terminal consumers, family role, and one verdict.

First checkpoint:
- Before implementation or broad exploration, copy every explicit prompt
  requirement into this plan as checkable checkpoints: scope, non-goals,
  timing/duration, stop conditions, deliverables, final handoff sections,
  verification surface, and success criteria.
- Do not continue into implementation until this extraction is complete or
  explicitly marked N/A with reason.

Timed checkpoint:
- requested duration: N/A
- semantics: N/A
- initial confidence / cleanliness score: N/A: exhaustive declaration and
  consumer coverage is stronger than a subjective score.
- improvement loop: expand syntax patterns until independent scans reconcile.
- final score / loop closure: zero declaration/consumer mismatches.

Completion threshold:
- All custom hook declarations under registry author source are captured,
  imports/usages are traced to terminal component families, and each row is
  classified as inline, keep as one controller, keep as lifecycle/context, or
  delete. Built-in and imported library-hook invocations are excluded but
  counted separately so scope is explicit. No source implementation changes.
- Architecture-cleanup closure is legal only when source map, deslop inventory,
  candidate matrix, agent-navigation score, packet ledger, proof evidence,
  changed list, and final handoff are complete or explicitly N/A, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-18-audit-registry-hooks.md`
  passes.

Verification surface:
- AST/text declaration scans, filename scans, export scans, and symbol-consumer
  searches across `apps/www/src/registry/**`; reconcile all result sets to zero
  unmapped declarations and record the final candidate matrix here.

Constraints:
- Do not split files because they are large.
- Prefer delete, merge, inline, or simplify over extraction when that improves
  comprehension.
- Do not change public API, product UX, or behavior under a cleanup packet.
- Focused proof comes before broad proof.
- No dirty speculative work at handoff: keep, revert, or quarantine.
- Read-only audit: do not update registry or package source.
- Judge hooks by terminal ownership, not file length or current export status.
- Exclude ordinary calls to React, Plate, and third-party hooks unless a
  registry file defines a wrapper around them.

Boundaries:
- Source of truth: live registry source plus `plate-ui`, shadcn, root/Plate
  Vision, and direct consumer graph.
- Allowed edit scope: this audit plan only; registry/package source is read-only.
- Plite / Plate boundary: Plate registry UI only; package hooks are mentioned
  only when needed to explain a registry hook's honest owner.
- Public API boundary: no API change; recommendations needing package/public
  changes are routed, not implemented.
- Browser surface: N/A: no visible behavior changes.
- Package/API surface: N/A: no package source changes.
- Non-goals: implementing recommendations, auditing every imported hook call,
  package-hook migration, classic-surface modernization, or UI redesign.

Output budget strategy:
- Build machine-readable inventories and counts first. Read only declarations,
  their enclosing files, and direct consumers; report concise grouped verdicts.

Blocked condition:
- Block only if syntax cannot be resolved statically or generated registry
  source obscures the authoritative author file after all local mappings are
  exhausted.

Cleanup state:
- task_type: architecture-cleanup
- task_complexity: normal exhaustive audit
- current_phase: closeout
- current_phase_status: complete
- next_phase: final response
- goal_status: complete after checker

Current verdict:
- verdict: inline two sole-component hooks, remove one one-consumer context
  hook/context, delete one unused generated hook binding, and keep twelve
  reused/controller/lifecycle hooks.
- cleanliness confidence: high; independent declaration and consumer scans
  reconcile at 16/16 with zero unmapped rows.
- next owner: architecture-cleanup
- keep / revert / quarantine call: N/A: read-only audit.
- reason: current source and consumer graph decide each row.

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-18-audit-registry-hooks.md`
  passes.
- Do not create hook state for this goal. This file plus the active goal are
  the durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Exact scope, output, no-source-edit boundary, and zero-unmapped threshold recorded above. |
| Timed checkpoint parsed | no | N/A: no duration requested. |
| `architecture-cleanup` loaded | yes | Full skill and candidate contract read. |
| Active goal checked or created | yes | Goal points to this exact plan. |
| Source of truth read before analysis | yes | Live Plate UI/shadcn/architecture-cleanup owners plus root and Plate Vision read. |
| VISION fit gate read | yes | Vision mandates direct families, zero-or-one controller, and terminal-consumer ownership. |
| Plite / Plate boundary selected | yes | Copied Plate registry UI only. |
| Cleanup surface selected | yes | `apps/www/src/registry/**` custom hook declarations. |
| Non-goals recorded | yes | No implementation, package migration, or imported-hook-call audit. |
| Output budget strategy recorded | yes | Counts and focused declaration/consumer excerpts. |
| Implementation authority decided | no | Read-only audit; no source implementation authorized. |
| Proof strategy selected | yes | Independent declaration, filename, export, and consumer scans must reconcile. |

Work Checklist:
- [x] First checkpoint complete: every explicit prompt requirement, scope
      boundary, timing constraint, stop condition, deliverable, final handoff
      section, verification surface, and success criterion is copied into this
      plan as checkable checkpoints before implementation.
- [x] Source map records largest files, owner files, package exports, public /
      private boundaries, tests, and proof owners for the surface.
- [x] Deslop inventory records wrappers, pass-through modules, duplicate
      helpers, vague names, stale compatibility, over-broad barrels, orphan
      tests, and stale source-owner oracles.
- [x] Candidate matrix ranks at least five candidates unless the prompt names a
      smaller surface.
- [x] Every candidate has a decision: delete, merge, inline, simplify, split,
      keep, defer, reject, or plan.
- [x] Every candidate records an agent-navigation score: files-to-read,
      owners-touched, proof clarity, public/private clarity, and net effect.
- [x] Anti-confetti rule applied: no split is accepted without durable owner,
      stable name, focused proof, and lower future navigation cost.
- [x] Merge/delete/inline are considered as seriously as extraction.
- [x] VISION fit is recorded; missing reusable taste routes to `vision` or
      `sync-vision`.
- [x] Implementation packets are behavior-neutral, public-API-neutral, narrow,
      reversible, and have focused proof.
- [x] Each implementation packet ends keep, revert, or quarantine.
- [x] Source-owner oracle is added or repaired when ownership moves, or N/A
      reason is recorded.
- [x] Focused proof is run before broad proof for changed code.
- [x] Broad proof is run after multiple packets, import churn, or public/package
      boundary changes.
- [x] Workspace authority recorded: every proof command names the cwd/tool that
      owns the analyzed or changed behavior.
- [x] Output budget discipline recorded and followed: broad searches are
      scoped, capped, counted, or artifacted instead of streamed.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Reconcile declaration, filename, export, and consumer scans | 16 production declarations/bindings, 16 mapped, zero unmatched; 31 test-only bindings excluded. |
| Source map complete | yes | Record owners, largest files, exports, tests, and proof owners | 363 registry TS/TSX files; five hook-named files; 13 production owner files; eight public and eight private hooks. |
| Deslop inventory complete | yes | Record concrete stale/shallow/duplicated/over-split surfaces | Two sole-component wrappers, one one-consumer context accessor/context, and one unused generated hook binding. |
| Candidate matrix complete | yes | Rank candidates with facts, action, owner, proof, and decision | All 16 rows below. |
| Agent-navigation score complete | yes | Record expected files/owners/proof changes | Each row records current/expected locality. |
| Anti-confetti gate | yes | Prove accepted splits reduce navigation cost or record no split accepted | No split accepted; recommendations remove boundaries. |
| Delete / merge / inline gate | yes | Record considered simplifications and why accepted/rejected | Three no-separate-hook recommendations and one deletion; twelve keeps justified by reuse/lifecycle. |
| VISION fit gate | yes | Confirm fit to VISION.md | Direct-family and zero-or-one-controller doctrine applied exactly. |
| Implementation packet gate | no | N/A | N/A: user requested audit/reasoning, not source edits. |
| Source-owner oracle gate | no | N/A | N/A: no ownership moved. Suggested future proofs named below. |
| Public API / behavior safety gate | yes | Prove no public API/product behavior changed | Only this audit plan changed; registry/package source remained read-only. |
| Package/API proof | no | N/A | N/A: no package/API changes. |
| Browser proof | no | N/A | N/A: no visible behavior changes. |
| Final lint/check | no | N/A | N/A: source audit only; plan is internal prose. |
| Output budget discipline | yes | Verify bounded output | AST/count scans and focused excerpts; no broad file dumps in final output. |
| Timed checkpoint | no | N/A | N/A: no duration requested. |
| Final handoff contract | yes | Fill counts, proof, needs-review, residual risks, and next owner | Recorded below. |
| Goal plan complete | yes | Run completion checker | Pass after this update. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | autogoal, architecture-cleanup, Plate UI, shadcn, Vision read | source map |
| Source map | complete | 363 files; 16 production hook bindings; 31 test-only bindings | deslop inventory |
| Deslop inventory | complete | four actionable boundaries | candidate matrix |
| Candidate matrix | complete | 16/16 rows below | owner routing |
| Cleanup packets / owner routing | complete | read-only: recommendations routed to Plate UI | verification |
| Verification | complete | AST declarations and call-site graph reconcile | closeout |
| Closeout | complete | counts and final handoff recorded | final response |

Candidate matrix:
| Rank | Strength | Candidate | Files | Facts | Navigation score | Recommendation | Owner | Proof | Decision |
|------|----------|-----------|-------|-------|------------------|----------------|-------|-------|----------|
| 1 | Strong | `useUploadThing` | `hooks/use-upload-file.ts` | Exported generated binding; zero calls in app/registry source | API noun 1→0; proof clearer | Delete unused binding | `uploadthing` registry item | AST call count 0 | delete |
| 2 | Strong | `useUploadFile` | `hooks/use-upload-file.ts`, `media-placeholder.tsx` | One terminal consumer; returns one renderer's upload state/handler bag; callback options unused | UI state spans 2 files→1 family owner | Inline state and upload handler into `PlaceholderElement` | `media-placeholder` | one call; `media-placeholder.spec.tsx` | inline |
| 3 | Strong | `useBlockDiscussionItems` | `lib/block-discussion-index.ts`, `block-discussion.tsx` | One terminal consumer; React subscription sits in otherwise semantic index owner | same 2 files, but React owner 2→1 and lib becomes semantic-only | Inline hook calls/memo into `BlockCommentContent`; keep pure index builder | `block-discussion` | one call; index spec | inline |
| 4 | Strong | `useEmojiPickerContext` | `emoji-picker.tsx` | One consumer (`EmojiPickerPanel`); private context has no other reader | one file; remove accessor/provider indirection | Pass controller directly to panel and remove private context/accessor | `emoji-picker` | one call; picker spec | inline |
| 5 | Strong keep | `useEmojiPickerController` | `emoji-picker.tsx` | One root call coordinates many picker siblings, reducer, observers, commands, refs | one file/one controller; clear | Keep sole family controller | `emoji-picker` | root + family spec | keep |
| 6 | Strong keep | `useTableResizeController` | `table.tsx` | One root call coordinates row/cell siblings and pointer/DOM cleanup through context | one file/one controller; clear | Keep sole family controller | `table` | root + table behavior proof | keep |
| 7 | Strong keep | `useChat` | `use-chat.ts`, `ai.tsx` | One mount point publishes an AI SDK transport lifecycle consumed through plugin state; inlining into descriptor is forbidden | 2 honest owners; transport isolated | Keep independently installable lifecycle bridge | `use-chat` | one lifecycle mount; AI integration proof | keep |
| 8 | Strong keep | `useCaptionFocused` | `caption.tsx` + five media renderers | Five independent terminal consumers share a selection subscription | 6 files but one shared semantic hook avoids five copies | Keep exported cross-feature hook | `caption` | five calls; caption spec | keep |
| 9 | Strong keep | `useDebounce` | `hooks/use-debounce.ts`, emoji, markdown demo | Two independent registry surfaces need timed value stabilization | 3 files/one shared primitive | Keep registry hook | `use-debounce` | two calls | keep |
| 10 | Strong keep | `useIsMobile` | `hooks/use-mobile.ts`, code drawing, host sidebar | Two independent component owners share a media-query subscription | shared hook avoids duplicate browser lifecycle | Keep registry hook | `use-mobile` | two terminal calls | keep |
| 11 | Strong keep | `useMounted` | `hooks/use-mounted.ts`, mention, two host docs components | Three independent surfaces share hydration-safe external-store state | shared hook avoids duplicated SSR logic | Keep registry hook | `use-mounted` | three terminal calls | keep |
| 12 | Strong keep | `useInlineComboboxContext` | `inline-combobox.tsx` | Three family siblings consume one private context with provider invariant | one file/private family contract | Keep private context accessor | `inline-combobox` | three calls; combobox spec | keep |
| 13 | Strong keep | `useSelectEditorContext` | `select-editor.tsx` | Three compound siblings consume one private context | one file/private family contract | Keep private context accessor | `select-editor` | three calls | keep |
| 14 | Strong keep | `useTableResizeContext` | `table.tsx` | Row and cell controls consume one complex family controller | one file/private family contract | Keep private context accessor | `table` | two calls | keep |
| 15 | Strong keep | `useEquation` | `math.tsx` | Two renderers share minimal side-effect-only KaTeX DOM projection | one file/one external lifecycle | Keep private lifecycle hook | `math` | two calls; math spec | keep |
| 16 | Strong keep | `useThemedHtml` | `plate-to-html.tsx` | Two exported surfaces share theme subscription and HTML projection | one file/two surfaces | Keep private cross-surface hook | `plate-to-html` | two calls | keep |

Packet ledger:
| Packet | Action | Owner | Files | Proof | Result | Next |
|--------|--------|-------|-------|-------|--------|------|
| Registry hook audit | source-audit only | `plate-ui` | this plan | AST and consumer scans | keep: no source packet authorized | Implement top four only on explicit `go` |

Cleanup counts:
- delete: 1
- merge: 0
- inline: 3
- simplify: 0
- split: 0
- keep: 12
- defer: 0
- reject: 0
- plan: 0

Changed list:
- code/runtime/API: none
- tests/oracles: none
- docs/plans: this audit plan only
- skills/workflow: none
- reverted/quarantined: none

Needs review:
- User decision only: whether to execute the four recommended cleanup rows.

Verification evidence:
- Babel TypeScript/JSX AST over 363 registry files found 16 production `use*`
  declarations/bindings and 31 test-only bindings.
- Independent regex scan found 15 direct declarations plus the destructured
  `useUploadThing` binding, matching the AST total of 16.
- Call-expression scan across `apps/www/src` mapped every production hook to
  its enclosing terminal owner: 30 total production calls and zero unmapped
  hook declarations.
- Filename scan found the expected five standalone `use-*`/`use-chat` files.
- Whole-repo symbol scans, excluding generated/templates/tests where noted,
  confirmed the terminal consumer counts in the matrix.

Final handoff contract:
- Source roots inspected: `apps/www/src/registry/**`, linked host consumers in
  `apps/www/src/components/**`, registry metadata, Plate UI/shadcn/Vision law.
- Candidate count and top recommendation: 16; delete unused `useUploadThing`,
  then inline `useUploadFile`.
- Cleanup counts: delete 1, inline/remove 3, keep 12.
- Agent-navigation score changes: two cross-file UI owners collapse into their
  components; one private context layer disappears; one dead API noun vanishes.
- Packets applied with keep/revert/quarantine result: none; read-only audit.
- Proof commands/source audits: Babel declaration/call scans, regex declaration,
  export, filename, metadata, and whole-repo consumer scans.
- Rejected/deferred candidates: none.
- Needs-review list: execute four rows only after user authorization.
- Residual risks: dynamic symbol access could evade name-based call scans, but
  none of these hook names appears in computed access, registry strings, or
  reexport syntax.
- Next owner and exact first command/file: `plate-ui`; start with
  `apps/www/src/registry/hooks/use-upload-file.ts` and
  `apps/www/src/registry/components/editor/media-placeholder.tsx`.

Timeline:
- 2026-08-18T20:49:50.485Z Architecture-cleanup goal plan created.
- 2026-08-18 Read Plate UI, shadcn, architecture-cleanup, and Vision doctrine.
- 2026-08-18 Closed 16/16 declaration and consumer rows; no source edits.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout complete |
| Where am I going? | Final response |
| What is the goal? | Exhaustive registry custom-hook inventory with inline verdicts |
| What have I learned? | Four of sixteen boundaries should disappear; twelve are justified |
| What have I done? | Mapped declarations, metadata, consumers, ownership, and decisions without editing source |

Open risks:
- None blocking. Implementation proof is intentionally deferred until the user
  authorizes source changes.
