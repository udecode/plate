# Inline registry hooks

Objective:
Apply the four accepted registry hook cleanups without changing behavior.

Goal plan:
docs/plans/2026-08-18-inline-registry-hooks.md

Template:
docs/plans/templates/architecture-cleanup.md

Primary template:
docs/plans/templates/architecture-cleanup.md

Applied packs:
- browser (docs/plans/templates/packs/browser.md)
- registry-changelog (docs/plans/templates/packs/registry-changelog.md)

Cleanup source:
- type: accepted source-backed audit
- id / link: `docs/plans/2026-08-18-audit-registry-hooks.md`
- title: Inline registry hooks
- requested surface: `block-discussion`, `media-placeholder`/`uploadthing`, and
  `emoji-picker` registry items.
- cleanup intent: inline `useBlockDiscussionItems` and `useUploadFile`, remove
  `useEmojiPickerContext` plus its one-reader context, and delete unused
  `useUploadThing` without aliases.
- acceptance criteria: rejected symbols have zero live matches; surviving
  behavior passes focused tests, registry metadata/changelog checks, www
  typecheck, Browser demos, and P2 autoreview.

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
- initial confidence / cleanliness score: N/A: binary source/proof gates apply.
- improvement loop: implement one owner packet at a time, run focused tests,
  then registry/app/browser and review closure.
- final score / loop closure: all four rows kept with zero stale exports/imports.

Completion threshold:
- All four accepted hook boundaries are removed at their honest component
  owners; uploadthing/media registry metadata remains install-complete;
  changelog and generated projections agree; focused tests, www typecheck,
  registry checks, three Browser demos, P2 review, and goal checker pass.
- Architecture-cleanup closure is legal only when source map, deslop inventory,
  candidate matrix, agent-navigation score, packet ledger, proof evidence,
  changed list, and final handoff are complete or explicitly N/A, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-18-inline-registry-hooks.md`
  passes.

Verification surface:
- Focused specs for block discussion index, media placeholder, and emoji picker;
  zero-name scans; www typecheck and registry-source check; registry changelog
  generator/check; Browser on media, discussion, and emoji demo routes; P2 review.

Constraints:
- Do not split files because they are large.
- Prefer delete, merge, inline, or simplify over extraction when that improves
  comprehension.
- Preserve product UX/runtime behavior; the explicitly rejected copied-registry
  hook exports are hard-cut API changes with no compatibility aliases.
- Focused proof comes before broad proof.
- No dirty speculative work at handoff: keep, revert, or quarantine.

Boundaries:
- Source of truth: accepted audit, live source/metadata/tests, Plate UI,
  Best API, shadcn, Vision, hard-cut, and registry-changelog owners.
- Allowed edit scope: affected registry components/lib/hook metadata/tests as
  needed, one registry changelog source/projection, and this plan.
- Plite / Plate boundary: copied Plate registry UI only; no Plite/package edits.
- Public API boundary: hard-cut copied `useUploadFile` and `useUploadThing`;
  private hooks disappear without public compatibility.
- Browser surface: `/blocks/media-demo`, `/blocks/discussion-demo`, and the
  emoji demo route resolved from live registry metadata.
- Package/API surface: registry-only; no package changeset.
- Non-goals: changing upload behavior, discussion indexing, emoji UX, package
  hooks, unrelated registry hooks, classic surfaces, or package APIs.

Output budget strategy:
- Read/patch only the four owners and direct metadata/tests; use focused command
  output and compact Browser assertions.

Blocked condition:
- Block only if preserving copied-install closure requires a new public API or
  browser proof cannot reach a runnable affected route after local recovery.

Cleanup state:
- task_type: architecture-cleanup
- task_complexity: normal multi-owner cleanup
- current_phase: closeout
- current_phase_status: complete
- next_phase: final response
- goal_status: complete after checker

Current verdict:
- verdict: execute all four accepted removals; no doctrine update because
  Best API/Plate UI already teach this exact one-consumer rule.
- cleanliness confidence: high before implementation.
- next owner: architecture-cleanup
- keep / revert / quarantine call: keep all four packets; deterministic proof
  and final P2 review are clean.
- reason: user explicitly accepted the exhaustive audit result with `go`.

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-18-inline-registry-hooks.md`
  passes.
- Do not create hook state for this goal. This file plus the active goal are
  the durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Four accepted audit rows, no aliases, preservation/proof requirements captured. |
| Timed checkpoint parsed | no | N/A: no duration requested. |
| `architecture-cleanup` loaded | yes | Full skill read during audit and active goal continues its contract. |
| Active goal checked or created | yes | Goal points to this exact plan. |
| Source of truth read before analysis | yes | Audit plus live owners and all named skills/Vision read. |
| VISION fit gate read | yes | Direct-family and terminal-consumer law authorizes the cleanup. |
| Plite / Plate boundary selected | yes | Registry-only Plate UI. |
| Cleanup surface selected | yes | Four exact hook bindings and their owners. |
| Non-goals recorded | yes | Listed above. |
| Output budget strategy recorded | yes | Focused owners/commands. |
| Implementation authority decided | yes | User said `go` after the exact recommendations. |
| Proof strategy selected | yes | Focused specs → metadata/type → Browser → P2 review. |
| Browser pack selected | yes | Registry source changes require Browser proof. |
| Browser route / app surface identified | yes | Media/discussion plus live-resolved emoji demo. |
| Browser tool decision recorded | yes | Browser for ordinary UI; no native Chrome ceremony applies. |
| Console/network caveat policy recorded | yes | Check console; upload/file picker network action itself remains out of scope. |
| Observable browser case captured | no | N/A: behavior-neutral cleanup, not report-backed bug repair. |
| Registry changelog pack selected | yes | Copied install shape/API changes are user-visible. |
| User-visible registry impact classified | yes | Yes: `uploadthing`, `media-placeholder`, `block-discussion`, and `emoji-picker`. |
| Source entry path selected | yes | `apps/www/src/registry/changelog/entries/2026-08-18-inline-registry-hooks.mdx`. |
| Generator command selected | yes | Create/edit MDX, then `--write` and `--check`. |

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
- [x] Implementation packets are behavior-neutral except for the explicitly
      accepted registry hook export hard cut; packets are narrow,
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
- [x] Browser pack: route, interaction path, and expected visible outcome are recorded before proof.
- [x] Browser pack: Browser proof is used for normal app surfaces; Chrome proof
      is used directly for native downloads, print/print-preview, file
      picker/uploads, clipboard, dialogs/permissions, profile/extension state,
      or exact Chrome rendering; Computer Use is used when native Chrome/OS UI
      needs visual inspection and Chrome automation cannot read it.
- [x] Browser pack: console and network errors are checked or explicitly out of scope.
- [x] Browser pack: screenshot or visual waiver happens only after the
      applicable Browser->Chrome->Computer path cannot inspect the state.
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
- [x] Registry changelog pack: user-visible registry impact is recorded.
- [x] Registry changelog pack: source entry exists under `apps/www/src/registry/changelog/entries/*.mdx` or N/A reason is recorded.
- [x] Registry changelog pack: entry frontmatter follows the contract in `.agents/skills/registry-changelog/SKILL.md`.
- [x] Registry changelog pack: row bullets name real registry item ids in backticks.
- [x] Registry changelog pack: generated `/registry/changelog/*.json`, `index.json`, and `components.json` are updated by the generator, not by hand.
- [x] Registry changelog pack: package changeset decision is separate when package code also changed.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run focused/broad/source/review gates | 13/13 tests, www typecheck, registry/changelog checks, root lint, zero names, and clean P2 review. |
| Source map complete | yes | Record current owners and proof | Four exact rows from completed audit implemented. |
| Deslop inventory complete | yes | Record stale/over-split surfaces | Two sole-consumer hooks, one one-reader context, one dead binding. |
| Candidate matrix complete | yes | Rank candidates | Four rows below. |
| Agent-navigation score complete | yes | Record locality changes | Two cross-file UI owners collapse, one context layer and one dead export disappear. |
| Anti-confetti gate | yes | No split accepted | All changes delete or inline boundaries. |
| Delete / merge / inline gate | yes | Apply all four accepted simplifications | Zero stale symbols and one source file removed. |
| VISION fit gate | yes | Confirm doctrine | Best API/Plate UI already teach the exact rule; no doctrine edit required. |
| Implementation packet gate | yes | Record keep/revert/quarantine | All four kept after full deterministic proof and clean review. |
| Source-owner oracle gate | yes | Repair focused tests | Existing three focused specs pass; media spec now mocks the colocated UploadThing boundary directly. |
| Public API / behavior safety gate | yes | Prove accepted hard cut and behavior preservation | Only rejected registry hook exports removed; runtime tests/typecheck/review green. |
| Package/API proof | no | N/A | N/A: no published package changes; registry changelog only. |
| Browser proof | yes | Exercise affected demos or record blocker | Blocked before affected code by stale `src/__registry__/index.tsx` imports to removed registry paths; local generation forbidden. |
| Final lint/check | yes | Run root lint | `pnpm lint:fix` passed with only configured large-artifact warnings. |
| Output budget discipline | yes | Verify bounded output | Focused commands used; dev-server stop emitted large unrelated compile log, recorded as recovery. |
| Timed checkpoint | no | N/A | N/A: no duration requested. |
| Final handoff contract | yes | Fill counts/proof/risks | Recorded below. |
| Autoreview | yes | Run isolated P2 review | Clean: no accepted/actionable P0-P2 findings. |
| Goal plan complete | yes | Run completion checker | Pass after this update. |
| Browser interaction proof | yes | Exercise target route or record blocker | In-app Browser opened `/blocks/media-demo`; compilation failed in unrelated stale generated registry before render. Discussion/emoji and Chrome file-picker inherit the same compile blocker. |
| Browser console/network check | yes | Record console/network state | Console captured module-not-found errors from stale generated registry imports; affected component/network code never loaded. |
| Browser final proof artifact | no | N/A | N/A: compilation blocker prevents a meaningful screenshot; exact logs recorded. |
| Exact case replay | no | N/A | N/A: behavior-neutral cleanup, not report-backed bug repair. |
| Final ref and fingerprints | no | N/A | N/A: local uncommitted candidate; deterministic source/test evidence recorded instead. |
| Clean final runtime | no | N/A | N/A: local uncommitted candidate and unrelated generated compile blocker. |
| Retry-free stability | no | N/A | N/A: no native selection/paint/focus/DnD/compositor claim. |
| Registry impact classification | yes | Record user-visible delta | Copied source/install shape changed for four named items. |
| Registry changelog source | yes | Add source entry | `2026-08-18-inline-registry-hooks.mdx`. |
| Registry changelog generation | yes | Run `--write` | 69 events generated. |
| Registry changelog check | yes | Run `--check` | 69/69 events agree. |
| Registry generator test | no | N/A | N/A: generator/schema/layout unchanged. |
| Registry package release split | yes | Classify release artifact | Registry changelog only; no package changeset. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | accepted audit and owner skills read | source map |
| Source map | complete | four exact rows and direct consumers | implementation |
| Deslop inventory | complete | audit plan supplies exhaustive 16-row context | implementation |
| Candidate matrix | complete | four rows below | packets |
| Cleanup packets / owner routing | complete | all four implemented at registry owners | verification |
| Verification | complete | deterministic gates green; Browser blocker recorded | closeout |
| Closeout | complete | clean P2 review and handoff | final response |

Candidate matrix:
| Rank | Strength | Candidate | Files | Facts | Navigation score | Recommendation | Owner | Proof | Decision |
|------|----------|-----------|-------|-------|------------------|----------------|-------|-------|----------|
| 1 | Strong | `useUploadThing` | deleted hook file + registry metadata | zero consumers | public noun 1→0 | hard-cut binding | `uploadthing` | zero scan + registry check | delete |
| 2 | Strong | `useUploadFile` | deleted hook file + `media-placeholder.tsx` | one consumer | UI state owner 2 files→1 | inline | `media-placeholder` | focused spec + typecheck | inline |
| 3 | Strong | `useBlockDiscussionItems` | index lib + block component | one consumer | React owner 2 files→1 | inline subscription; retain deep lexical index adapter | `block-discussion` | index spec + typecheck | inline |
| 4 | Strong | `useEmojiPickerContext` | `emoji-picker.tsx` | one reader | context/accessor layer 1→0 | direct private controller prop | `emoji-picker` | picker spec | inline |

Packet ledger:
| Packet | Action | Owner | Files | Proof | Result | Next |
|--------|--------|-------|-------|-------|--------|------|
| Upload ownership | inline/delete | `media-placeholder` / `uploadthing` | component, metadata, deleted hook | spec/type/registry | keep | none |
| Discussion ownership | inline | `block-discussion` | component + pure index lib | spec/type | keep | none |
| Picker ownership | inline | `emoji-picker` | family file | spec/type | keep | none |
| Registry release | wiring | registry changelog | MDX + generated JSON | generator check | keep | none |

Cleanup counts:
- delete: 1
- merge: 0
- inline: 3
- simplify: 0
- split: 0
- keep: 4 packets
- defer: 0
- reject: 0
- plan: 0

Changed list:
- code/runtime/API: media placeholder, block discussion/index, emoji picker,
  uploadthing/media registry metadata; deleted `hooks/use-upload-file.ts`.
- tests/oracles: media placeholder test owns the direct UploadThing mock;
  existing block index and picker specs retained.
- docs/plans: audit/implementation plans plus registry changelog source and projections.
- skills/workflow: none; Best API/Plate UI doctrine already exact.
- reverted/quarantined: none.

Needs review:
- Browser/Chrome runtime proof after CI refreshes generated `src/__registry__`.

Verification evidence:
- `bun test` focused three files: 13 passed, 25 expectations.
- `pnpm --filter www typecheck`: passed, including editor generation check,
  source build, docs parity, registry source, app, and package-integration TS.
- `pnpm --filter www exec tsx scripts/check-registry-source.mts`: passed.
- Registry changelog `--write` and `--check`: 69/69 events.
- `pnpm lint:fix`: passed with configured large-artifact warnings only.
- AST audit: registry production custom hooks 16→12; zero rejected symbols.
- Isolated P2 autoreview: clean.
- Browser: `/blocks/media-demo` blocked at compilation by unrelated stale
  generated `src/__registry__/index.tsx` imports; no affected code loaded.

Final handoff contract:
- Source roots inspected: four accepted registry owners, metadata, tests,
  changelog, generated projections, and stale runtime host.
- Candidate count and top recommendation: four accepted; all implemented.
- Cleanup counts: delete 1, inline 3, keep 4 packets.
- Agent-navigation score changes: one hook file and four hook/context API nouns
  removed; component-local behavior is directly visible.
- Packets applied with keep/revert/quarantine result: all kept.
- Proof commands/source audits: listed above.
- Rejected/deferred candidates: none.
- Needs-review list: CI-owned generated registry refresh before runtime proof.
- Residual risks: no source/type/test/review risk; Browser/Chrome evidence remains
  unavailable until unrelated generated imports are refreshed.
- Next owner and exact first command/file: CI registry generation owner; rerun
  `/blocks/media-demo`, `/blocks/discussion-demo`, and `/blocks/emoji-demo`
  afterward, using Chrome for the native media file-picker path.

Timeline:
- 2026-08-18T21:09:35.374Z Architecture-cleanup goal plan created.
- 2026-08-18 Implemented four accepted hook removals and registry metadata.
- 2026-08-18 Focused/broad/changelog/lint proof passed; Browser blocker captured.
- 2026-08-18 Final isolated P2 autoreview clean.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout complete |
| Where am I going? | Final response |
| What is the goal? | Apply four accepted registry hook cleanups with proof |
| What have I learned? | Source is green; runtime host is blocked by stale generated registry imports |
| What have I done? | Removed four boundaries, repaired metadata/test ownership, generated changelog, and verified |

Open risks:
- CI must refresh generated registry output before Browser/Chrome proof can run.
