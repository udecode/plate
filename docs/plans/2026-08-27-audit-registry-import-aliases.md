# audit registry import aliases

Objective:
Audit every registry import alias and recommend canonical names for Editor/useEditor/failInvariant; done when AST inventory and source evidence reconcile; plan docs/plans/2026-08-27-audit-registry-import-aliases.md.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-08-27-audit-registry-import-aliases.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Applied packs:

- package-api (docs/plans/templates/packs/package-api.md)

Task source:

- type: direct user request
- id / link: N/A: no tracker
- title: Registry import-alias and editor naming audit
- acceptance criteria: enumerate every named import alias under `apps/www/src/registry/**`; give harsh source-backed verdicts on `Editor as EditorSurface`, `useEditor as useProductEditor`, `useEditorContext`, `useCreateEditor`/`useEditorFactory`, and `failInvariant`; recommend one canonical naming direction without editing product code.

First checkpoint:

- Before implementation or broad exploration, copy every explicit prompt
  requirement into this plan as checkable checkpoints: scope, non-goals,
  timing/duration, stop conditions, deliverables, final handoff sections,
  verification surface, and success criteria.
- Do not continue into implementation until this extraction is complete or
  explicitly marked N/A with reason.

Timed checkpoint:

- requested duration: N/A: none requested
- semantics: N/A: no timed checkpoint
- initial confidence score: N/A: exhaustive count and row reconciliation
- improvement loop: N/A: one-shot audit
- final score / loop closure: N/A: no timed checkpoint

Completion threshold:

- One AST-derived row exists for every named import whose imported and local identifiers differ under `apps/www/src/registry/**/*.{ts,tsx}`.
- The AST count reconciles with an independent textual search and every row has a collision/semantic verdict.
- The three named API questions have implementation and consumer evidence plus one blunt recommendation.
- Task closure is legal only when the source-of-truth acceptance criteria are
  satisfied or explicitly narrowed, required verification evidence is recorded,
  code-review and release-artifact gates are closed when applicable, tracker/PR
  sync is complete or marked N/A with reason, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-27-audit-registry-import-aliases.md` passes.

Verification surface:

- TypeScript AST inventory of registry source files.
- Independent `rg` search for `as` import syntax and source reads of every match.
- Owning export/implementation and production-consumer reads for `Editor`, `useEditor`, and `failInvariant`.

Constraints:

- Preserve existing user-facing behavior outside the task scope.
- Prefer the durable ownership boundary over caller-by-caller patches.
- Do not create PRs, comments, commits, or pushes unless the task/user/skill
  requires them.
- Do not add broad ceremony when the task is trivial or docs-only.

Boundaries:

- Source of truth: `VISION.md`, `docs/vision/common.md`, `docs/vision/plate.md`, registry source, and owning package implementations/exports.
- Allowed edit scope: this audit plan only; product and agent source remain read-only.
- Browser surface: N/A: static source/API audit.
- Browser strategy: N/A: no behavior or UI change.
- Tracker sync: N/A: direct request.
- Non-goals: renaming symbols, changing imports, adding aliases, changing public APIs, committing, pushing, or opening a PR.

Output budget strategy:

- Count files first; use an AST script to emit compact rows, then read only matched files and exact symbol owners. Exclude generated output, dependencies, templates, and non-registry source from the exhaustive alias count.

Blocked condition:

- Stop only if registry scope cannot be resolved or the installed parser cannot parse a matched source file and no independent syntax-aware fallback exists.

Task state:

- task_type: read-only bounded API audit
- task_complexity: normal
- current_phase: closeout
- current_phase_status: complete
- next_phase: final response
- goal_status: active

Current verdict:

- verdict: recommend a hard cut of branded and meaning-erasing aliases; keep only adapter collisions and explicit comparison aliases
- confidence: high: Babel and SWC independently produced the same 54 alias tuples across 380 registry TypeScript files
- next owner: user decision, then `best-api repair` before implementation because the recommended hook shape changes public API
- reason: call sites prove that generic construction and retrieval names cause local branding workarounds, while adapter aliases preserve real implementation distinctions.

Completion rule:

- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final handoff evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-27-audit-registry-import-aliases.md` passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Exact inventory, harsh verdict, rename recommendation, hook alternatives, and `failInvariant` explanation recorded. |
| Timed checkpoint parsed | no | N/A: none requested. |
| Skill analysis before edits | yes | Loaded `best-api` and `autogoal`; this is bounded API audit mode. |
| Active goal checked or created | yes | Created matching audit goal after confirming no active goal. |
| Source of truth read before edits | yes | Read root `VISION.md`, `docs/vision/common.md`, and `docs/vision/plate.md`; no product edit is authorized. |
| Tracker comments and attachments read | no | N/A: direct request. |
| Video transcript evidence required | no | N/A: no recording. |
| `docs/solutions` checked for non-trivial existing-code work | no | N/A: read-only API audit, not implementation. |
| TDD decision before behavior change or bug fix | no | N/A: no behavior change. |
| Branch decision for code-changing task | no | N/A: no code change or git action. |
| Release artifact decision | no | N/A: read-only audit. |
| Browser tool decision for browser surface | no | N/A: static source audit. |
| PR expectation decision | no | N/A: no PR requested. |
| Tracker sync expectation decision | no | N/A: no tracker. |
| Output budget strategy recorded | yes | AST inventory first, compact counts, exact matched-file reads only. |
| Package/API pack selected | yes | Public editor naming is the audited surface. |
| Public surface or package boundary identified | yes | Registry consumes `platejs`/`platejs/react`; doctrine fixes canonical `Editor`, `useEditor`, and `useEditorContext` roles. |
| Release artifact path selected | no | N/A: no published delta. |
| `changeset` skill loaded when `.changeset` is required | no | N/A: no changeset. |
| Barrel/export impact decision recorded | no | N/A: no export edit. |

Work Checklist:

- [x] If a duration was requested, it is recorded as minimum active work unless
      explicitly marked hard stop; when no better metric exists, initial and
      final confidence scores are recorded.
- [x] First checkpoint complete: every explicit prompt requirement, scope
      boundary, timing constraint, stop condition, deliverable, final handoff
      section, verification surface, and success criterion is copied into this
      plan as checkable checkpoints before implementation.
- [x] Short objective plus outcome, completion threshold, verification surface,
      constraints, boundaries, and blocked condition are concrete.
- [x] Task source classified with source type, id/link, title, task type,
      acceptance criteria, caveats, likely files/routes/packages, browser
      surface, and root-cause layer.
- [x] Required video or screen-recording evidence is N/A: no video supplied.
- [x] Nearby repo instructions and API doctrine read before the audit.
- [x] Implementation is N/A: this is a read-only audit. Recommendations rename
      source owners instead of preserving caller-side aliases.
- [x] Release artifact requirement recorded: N/A for read-only audit.
- [x] Final handoff shape decided: complete alias table, blunt recommendations, and source evidence.
- [x] Branch handling recorded: N/A because no product code change is authorized.
- [x] Local-env-rot retry policy recorded: N/A unless parser execution shows documented install corruption.
- [x] Workspace authority recorded: all evidence comes from `/Users/zbeyens/git/plate-2`.
- [x] High-risk note recorded: renaming the wrong noun could blur construction versus mounted retrieval; doctrine and call sites decide.
- [x] Review/P1 autoreview target is N/A: this task makes no product patch.
- [x] Agent-native review is N/A: no agent workflow surface changes.
- [x] Output budget discipline recorded: counts and compact AST rows precede source reads.
- [x] Package/API pack: public API naming and package ownership are the audited surface; no export delta is authorized.
- [x] Package/API pack: release artifact matrix is N/A for read-only audit.
- [x] Package/API pack: changeset work is N/A.
- [x] Package/API pack: registry changelog is N/A.
- [x] Package/API pack: no artifact because the audit changes no published package or registry behavior.
- [x] Package/API pack: hard-cut recommendation is explicit: construction becomes `useCreateEditor`; provider retrieval becomes `useEditor`; branded editor aliases are deleted.
- [x] Package/API pack: package-owned typecheck/build/test proof is N/A because no product or package source changed.
- [x] Package/API pack: generated barrels and release notes are N/A because no exports changed.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Reconcile exhaustive syntax-aware inventories | Babel and SWC each found the same 54 alias tuples in 380 files; 34 unique mappings. |
| Bug reproduced before fix | no | N/A | No bug or fix. |
| Targeted behavior verification | no | N/A | Read-only naming audit. |
| TypeScript or typed config changed | no | N/A | No typed source changed. |
| Package exports or file layout changed | no | N/A | No package source changed; `pnpm brl` is not applicable. |
| Package manifests, lockfile, or install graph changed | no | N/A | No dependency edit. |
| Agent rules or skills changed | no | N/A | No agent source edit. |
| Workspace authority proof | yes | Run audit in owner workspace | All commands ran from `/Users/zbeyens/git/plate-2`. |
| Browser surface changed | no | N/A | No UI or behavior change. |
| Browser final proof | no | N/A | Static source audit only. |
| CI-controlled template output changed | no | N/A | No template edit. |
| Package behavior or public API changed | no | N/A | Recommendation only; implementation would require `best-api repair` and a changeset. |
| Registry-only component work changed | no | N/A | No registry product edit. |
| Docs or content changed | no | N/A | Only the required private goal ledger changed. |
| High-risk mini gate | yes | Record API failure mode and owner | Keeping `useEditor` for construction invites context-reader confusion; rename the owning API, not every consumer. |
| Agent-native review for agent/tooling changes | no | N/A | No agent/tooling change. |
| Local install corruption suspected | no | N/A | Parsers loaded and completed successfully. |
| P1 autoreview for non-trivial implementation changes | no | N/A | No implementation patch. |
| PR create or update | no | N/A | No PR requested. |
| Task-style PR body verified | no | N/A | No PR. |
| PR proof image hosting | no | N/A | No PR or browser proof. |
| Tracker sync-back | no | N/A | Direct request without tracker. |
| Final handoff contract | yes | Record exact audit result | Filled below. |
| Final lint | no | N/A | No product source changed; plan will be formatted with Prettier. |
| Output budget discipline | yes | Record accidental noisy command and recovery | One broad `rg` exceeded output budget; subsequent exact-file reads and compact AST output stayed bounded. |
| Timed checkpoint | no | N/A | No duration requested. |
| Goal plan complete | yes | Run checker | All prerequisite gates are closed; final checker is the closure command. |
| Public API / package boundary proof | yes | Read owners and consumers | Read `VISION.md`, both relevant vision docs, hook implementations, registry owner components, and all alias sites. |
| Release artifact classification | yes | Classify delta | No published or user-visible delta; audit only. |
| Published package changeset | no | N/A | No package change. |
| Registry changelog | no | N/A | No registry change. |
| No release artifact | yes | Record reason | Read-only audit; no behavior or API was changed. |
| Package typecheck/build/test | no | N/A | No package source changed. |
| Barrel/export generation | no | N/A | No export edit. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | Prompt, doctrine, registry scope, and API owners read | inventory |
| Implementation | complete | N/A: read-only audit; no product edit | verification |
| Verification | complete | Babel/SWC tuple parity: 54 sites, 34 mappings, 380 files | closeout |
| PR / tracker sync | complete | N/A: none requested | final response |
| Closeout | complete | Findings and final handoff recorded | final response |

Findings:

- The registry contains 54 named import alias sites across 34 unique mappings in 380 TypeScript/TSX files.
- Twelve aliases use `Product`, `Headless`, or `Plite` branding around canonical editor APIs/types. They encode package history rather than a distinct user job.
- Nine aliases erase `FloatingPopover` into generic `Popover`, losing useful behavior in the local name.
- Four files rename construction `useEditor` to `useProductEditor` while also consuming `useEditorContext`; the aliases expose an ambiguous public verb.
- `failInvariant` is a one-line unconditional throw copied into the current registry diff after direct Plite internal imports were removed. Its 18 registry calls across four files all use the same useless message.
- Adapter wrapper aliases (`Primitive`, `Shadcn`, Base UI) and explicit current/classic or Plate/Slate comparisons preserve real collisions and should remain.

Decisions and tradeoffs:

- Rename the registry leaf component `Editor` to `EditorContent`; keep the assembled editor component named `Editor`.
- Preferred blank-slate hook API: `useCreateEditor` creates a component-owned editor, `useEditor` retrieves the required provider editor, and `useOptionalEditor` retrieves it optionally. `useEditorFactory` is rejected because the hook returns an editor, not a factory.
- Delete `ProductEditor`, `HeadlessEditor`, `createProductEditor`, `createHeadlessEditor`, `useProductEditor`, and `PliteElement` aliases. Use canonical names, rename local test helpers, or qualify only the secondary implementation in comparisons.
- Delete `failInvariant`. Use explicit domain errors or a value-taking `expectDefined(value, message)` only where repetition justifies it; every error must name the missing value and operation.

Implementation notes:

- N/A: no product implementation authorized.

Review fixes:

- N/A: no implementation review.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| TypeScript package did not expose the expected parser API | 1 | Use the installed Babel parser | Babel parsed all 380 files. |
| Broad registry/package `rg` output exceeded the result budget | 1 | Restrict to exact matched files and compact counts | Subsequent reads were bounded. |
| Initial SWC line-oriented comparison used unsuitable span offsets | 1 | Compare normalized alias tuples without source lines | Exact 54/54 tuple parity with Babel. |

Verification evidence:

- Babel AST: 380 files, 54 alias sites, 34 unique mappings.
- SWC AST: 380 files, 54 alias sites; exact normalized tuple parity with Babel.
- Markdown/MDX registry files contain no executable ESM import aliases.
- Source reads covered every matched alias plus `Editor`, `useEditor`, `useEditorContext`, and all registry `failInvariant` consumers.

Final handoff contract:

- PR line: N/A: no PR requested or created.
- Issue / tracker line: N/A: direct request.
- Confidence line: high; two independent parsers reconciled all alias tuples.
- Flow table:
  - Reproduced: tests N/A, browser N/A
  - Verified: tests N/A, browser N/A; source audit passed
- Browser check: N/A: no browser surface or product change.
- Outcome: exhaustive grouped alias inventory and canonical rename recommendation ready.
- Caveat: recommendations are not implemented; a hook rename is a public API hard cut and must run `best-api repair` before closeout.
- Design:
  - Chosen boundary: rename ambiguous owners, preserve aliases only at real adapter/comparison collisions.
  - Why not quick patch: replacing `EditorSurface` alone leaves construction/retrieval and branded aliases incoherent.
  - Why not broader change: package topology and behavior are outside this read-only audit.
- Verified: exact AST tuple parity and owner/consumer source audit.
- PR body verified: N/A: no PR.

Task-style PR body contract:

- Preserve any existing `<!-- auto-release:start -->` block. If a changeset is
  part of the diff and repo policy expects auto release, include that block.
- Use the accepted kitcn PR #270 visual format. The body starts with an emoji
  issue/tracker/fix line, for example `🐛 Fixes #123` or `🐛 Fixes ➖ N/A`, then
  an emoji confidence line like `🟢 95-100% confidence`.
- Use this exact table header: `| Phase | 🧪 Tests | 🌐 Browser |`.
- Use `Reproduced` and `Verified` rows. Mark passing proof with `🟢`, repro or
  failing proof with `🔴`, and non-applicable cells with `➖ N/A`.
- Use bold emoji section headings: `**✅ Outcome**`, `**⚠️ Caveat**`,
  `**🏗️ Design**`, and `**🧪 Verified**`.
- Never include a line that links to the current PR itself. The current PR URL
  belongs in the final response, not in its own description.
- Do not replace this with a generic `Summary` / `Verification` PR body, an
  adaptive prose body from a git helper skill, plain `## Outcome` sections, or
  an unrelated generated badge footer unless the caller or repo template
  explicitly asks for it.
- Proof is `gh pr view --json body` output or a concise source-backed summary
  of that output.

Final handoff / sync:

- PR: N/A: none requested.
- Issue / tracker: N/A: direct request.
- Browser proof: N/A: static audit.
- Caveats: no recommended rename has been applied.

Timeline:

- 2026-08-27T22:08:22.421Z Task goal plan created.
- 2026-08-28 Registry scope parsed with Babel and independently reconciled with SWC: 54 sites, 34 mappings.
- 2026-08-28 Read all alias sites and owners for editor construction, context retrieval, registry content, and invariant failures.
- 2026-08-28 Recorded hard-cut recommendations and completed read-only audit gates.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout complete |
| Where am I going? | Final response |
| What is the goal? | Exhaustively audit registry aliases and choose canonical editor/invariant names. |
| What have I learned? | 54 sites split cleanly between real collisions and naming debt; see Findings. |
| What have I done? | Reconciled two syntax-aware inventories and audited all named owners/consumers. |

Open risks:

- Implementation could create widespread docs and generated-code churn; run the required public-API repair workflow if the user accepts the hook hard cut.
