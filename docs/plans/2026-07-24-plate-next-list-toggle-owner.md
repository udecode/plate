# Plate Next List toggle owner repair

Objective:
- Inline the single-owner list toggle algorithm in `BaseListPlugin`.
- Route all three list input-rule families through the active inferred
  `tx.list.toggle`.
- Repair the smallest Core input-rule generic owner without explicit
  transaction annotations, casts, compatibility helpers, or synthetic editor
  markers.

Completion threshold:
- No standalone production `toggleList(editor, tx, ...)` remains.
- The full mutation algorithm lives lexically in
  `BaseListPlugin.extendTx(...).toggle`.
- Bulleted, ordered, and task-list rules use the active transaction.
- `createRuleFactory(BaseListPlugin)` infers installed plugin transaction
  groups while unbound heterogeneous rule storage retains its base transaction
  contract.
- Focused runtime tests, Core source typecheck, Core public type contracts, List
  typecheck, formatting, source audits, structured review, and this plan
  checker pass.

Verification surface:
- Runtime:
  `packages/core/src/lib/plugins/input-rules/createRuleFactory.spec.ts`,
  `packages/list/src/lib/BaseListPlugin.spec.tsx`, and
  `packages/list/src/lib/BaseListPlugin.slow.tsx`.
- Types: Core source typecheck, Core type contracts, and List typecheck.
- Source: removed-helper/option lookup audit, expected inferred call-site
  audit, standalone transaction-helper inventory, Biome, and diff check.
- Review: frozen six-owner packet through the repo autoreview helper.
- Browser: N/A; no component, route, docs, or rendered behavior changed.

Constraints:
- Named file/API packet only, not a fresh package-wide or broad Core sweep.
- Keep current runtime verbs and exported list rule names.
- Prefer the best Plate v2 owner shape; no legacy compatibility alias.
- Inline single-owner behavior; keep a helper only for real reuse or an
  independent algorithm boundary.
- Type inference must come from the owning factory/context generic, never an
  explicit callback transaction annotation.
- Preserve concurrent shared WIP and do not edit or message its owners.
- No barrel regeneration because no exported file membership changed.

Boundaries:
- Production:
  `packages/list/src/lib/BaseListPlugin.tsx`,
  `packages/core/src/lib/plugins/input-rules/createRuleFactory.ts`, and
  `packages/core/src/lib/plugins/input-rules/types.ts`.
- Proof:
  `packages/core/src/lib/plugins/input-rules/createRuleFactory.spec.ts` and
  `packages/core/type-tests/input-rule-contracts.ts`.
- Release/closure: one Core changeset and this goal plan.
- Non-goals: React, docs, browser UI, a new list verb, unrelated List helpers,
  concurrent plugin hard-cut specs, or the next package.

Blocked condition:
- Block only if installed transaction inference requires a broader public
  input-rule API decision or focused proof demonstrates a regression that
  cannot be separated from another active owner.
- Neither condition occurred.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt captured | yes | Exact owner, inference rule, non-goals, proof, and handoff recorded before implementation |
| `plate-next` doctrine | yes | Skill read completely; lexical plugin ownership and inference rules applied |
| `plate-plugin-creator` doctrine | yes | Current colocation and plugin authoring rules applied |
| `best-api` and advanced TypeScript doctrine | yes | Public call shape and owning generic audited before repair |
| Active goal | yes | Goal created for this exact List/Core packet |
| Mode | yes | Named algorithm/API packet, not broad Core or full package review |
| Shared WIP boundary | yes | Concurrent plugin hard-cut files left untouched and unmessaged |

Work Checklist:
- [x] Captured every explicit requirement, scope boundary, stop condition,
      deliverable, proof surface, and final handoff field.
- [x] Classified the mode as a named List algorithm plus smallest Core generic
      owner.
- [x] Recorded the best Plate v2 call shape and rejected helper, annotation,
      cast, alias, and nested one-shot alternatives.
- [x] Added the compile-only regression before closing the Core owner.
- [x] Inlined the full list-toggle algorithm once inside `extendTx`.
- [x] Routed all three input-rule families through inferred
      `tx.list.toggle`.
- [x] Kept `createListRule` because three durable rule families reuse the
      inference binder.
- [x] Replaced the provisional synthetic editor marker with the existing
      `ExtensionsOf<TEditor>` owner.
- [x] Audited the remaining standalone transaction helpers and recorded reuse
      or independent-boundary proof.
- [x] Ran focused runtime, type, format, diff, and source-audit gates.
- [x] Ran structured autoreview to zero actionable findings.
- [x] Recorded the concurrent full-Core test-typecheck failure without
      broadening scope.
- [x] Filled the verdict, gap, sweep, changed-file, attention, timeline, and
      final handoff ledgers.
- [x] Confirmed browser, barrel, rename, broad Core manifest, and package
      manifest gates are N/A for this packet.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| One semantic owner | yes | Remove standalone toggle helper | Post-fix audit finds zero `toggleList` matches |
| Active transaction rules | yes | Use inferred tx in all rule families | Three expected `tx.list.toggle` calls |
| Core inference owner | yes | Preserve concrete extensions at authoring time | Compile contract accepts installed group and rejects absent group |
| Runtime behavior | yes | Run bound-factory plus List fast/slow specs | Exact three-file Bun command exits 0 |
| Type proof | yes | Run Core source/contracts and List checks | All three commands exit 0 |
| Formatting and diff | yes | Run scoped Biome and diff check | Both exit 0 |
| Related sweep | yes | Audit same-class sites | Three completed sweep rows below |
| Structured review | yes | Review frozen packet | Zero actionable findings, confidence 0.78 |
| Broad Core ledger | no | Explain exclusion | This is a named packet; no broad Core claim |
| Full package checklist | no | Explain exclusion | User named one algorithm owner, not a fresh List sweep |
| Browser proof | no | Explain exclusion | No rendered/browser surface changed |
| Barrel regeneration | no | Explain exclusion | No exported file membership changed |
| External failure triage | yes | Separate concurrent drift | Full Core test compilation fails only in active plugin hard-cut specs |
| Goal plan | yes | Run completeness checker | Final checker command recorded below |

Phase / pass table:
| Phase | Status | Evidence |
|-------|--------|----------|
| Owner audit | complete | One List toggle owner and one Core inference owner identified |
| Compile regression | complete | Plugin-bound tx contract reproduced and then closed |
| Implementation | complete | Toggle inlined and three rule families adopted active tx |
| Focused proof | complete | Runtime, source types, public contracts, List types, and formatting pass |
| Review | complete | Autoreview clean |
| Handoff | complete | Exact caveat and next owner recorded |

Review matrix:
| Path / API | Score | Verdict | Owner evidence |
|------------|-------|---------|----------------|
| `packages/list/src/lib/BaseListPlugin.tsx` / `toggle` | 100 | keep in Plate; helper cut | Algorithm is lexical in `.extendTx`; three rules use inferred active tx; fast/slow specs pass |
| `packages/core/src/lib/plugins/input-rules/createRuleFactory.ts` | 100 | keep Core owner | Plugin-bound overload threads the concrete editor; runtime binder spec passes |
| `packages/core/src/lib/plugins/input-rules/types.ts` | 100 | keep Core owner | Concrete editors use `ExtensionsOf<TEditor>`; broad stored rules keep base tx |
| `packages/core/src/lib/plugins/input-rules/createRuleFactory.spec.ts` | 100 | keep focused runtime proof | Bound factory preserves rule resolver behavior |
| `packages/core/type-tests/input-rule-contracts.ts` | 100 | keep public compile proof | Installed group infers and absent group fails |
| `.changeset/core-plugin-bound-rule-factory.md` | 100 | keep release metadata | One-package Core patch records the public inference addition |

Best Plate v2 recommendation:
| Target | Recommended shape | Rejected shapes | Reason |
|--------|-------------------|-----------------|--------|
| List mutation | `tx.list.toggle(options)` inside active transactions; scoped terminal one-shot update for consumers | `toggleList(editor, tx, ...)`, duplicated rule bodies, nested `update.insert.*` taxonomy | One semantic implementation and shortest inferred call path |
| Plugin-owned rules | `const createListRule = createRuleFactory(BaseListPlugin)` | callback annotations, casts, synthetic editor markers, repeated plugin option lookups | Three rule families reuse one honest inference binder |

Plite / Plate gap ledger:
| Gap | Smallest owner | Hack rejected | Resolution |
|-----|----------------|---------------|------------|
| Input-rule callbacks erased installed plugin tx groups | Core input-rule factory/context types | Explicit `tx` annotation, cast, retained helper, or synthetic marker | Plugin-bound factory supplies concrete editor extensions; broad storage stays erased |

Related scoped sweep ledger:
| Correction | Scope and method | Matches | Patched | Deferred | Risk |
|------------|------------------|---------|---------|----------|------|
| Remove duplicate helper and plugin option lookup | `rg "toggleList|editor\.plugin\(BaseListPlugin\)\.getOptions"` in `BaseListPlugin.tsx` | 0 after correction | 1 helper and 3 rule sites | 0 | none |
| Prove active inference adoption | `rg "tx\.list\.toggle|createListRule|__inputRuleTransaction"` in List/Core owners | 7 expected List binder/call matches; 0 synthetic markers | 4 List sites plus Core generic owner | 0 | none |
| Classify remaining tx helpers | Function inventory and consumer audit in `BaseListPlugin.tsx` | 3 survivors | 1 single-owner helper cut | 0 | `normalizeListStart` is shared; `normalizeDefaultListSuffix` is an independent sequence algorithm; `outdentListBlock` has two command consumers |

Changed list:
| Group | Files |
|-------|-------|
| Production/types | `BaseListPlugin.tsx`, `createRuleFactory.ts`, input-rule `types.ts` |
| Proof | Core factory runtime spec and input-rule compile contract |
| Release/closure | Core patch changeset and this goal plan |
| Skills/docs/browser | No skill edit needed; current doctrine already owns this rule; no user docs or browser surface |

Out-of-scope drift:
| Command | Result | Classification |
|---------|--------|----------------|
| `pnpm --filter @platejs/core typecheck` | Fails in `plateModelPublication.spec.ts`, `pluginReference.spec.ts`, `pluginSourceResolution.spec.ts`, and adjacent shared plugin API specs | Concurrent plugin hard-cut test drift; packet source and public contracts pass; no edit or cross-task message |

Decisions:
- Keep `createListRule`: it is a reused inference binder, not displaced
  behavior.
- Inline the toggle algorithm: it has exactly one semantic owner.
- Erase the returned rule only at the heterogeneous storage boundary while
  keeping callback authoring precise.
- Keep the three remaining transaction helpers because their consumer or
  independent-algorithm evidence is concrete.

Error attempts:
| Attempt | Count | Resolution |
|---------|-------|------------|
| Applied `ExtensionsOf<TEditor>` to broad stored contexts | 1 | Broad editor keeps base tx; concrete plugin-bound editor uses extensions |
| Ran direct Bun without root source aliases | 1 | Exact root `bunfig.toml` command passes |
| Ran full Core test-typecheck during concurrent hard cut | 1 | Classified external drift; exact source/contracts gates pass |

Verification evidence:
- Focused runtime:
  `./node_modules/.bin/bun --config /Users/zbeyens/git/plate-2/bunfig.toml test packages/core/src/lib/plugins/input-rules/createRuleFactory.spec.ts packages/list/src/lib/BaseListPlugin.spec.tsx packages/list/src/lib/BaseListPlugin.slow.tsx`
  exits 0.
- Core source: `pnpm --filter @platejs/core exec plate-pkg p:typecheck`
  exits 0.
- Core public contracts:
  `pnpm --filter @platejs/core typecheck:contracts` exits 0.
- List: `pnpm --filter @platejs/list typecheck` exits 0.
- Formatting: scoped `pnpm exec biome check` exits 0 with no fixes.
- Diff hygiene: scoped `git diff --check` exits 0.
- Source audits: zero removed-helper/option matches; one binder, three rule
  factories, three active toggle calls, and zero synthetic markers.
- Review:
  `.agents/skills/autoreview/scripts/autoreview --mode local --prompt <frozen packet scope> --stream-engine-output`
  reports `autoreview clean: no accepted/actionable findings reported`,
  confidence 0.78.
- Goal ledger:
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-24-plate-next-list-toggle-owner.md`
  reports the plan complete.

Needs attention:
- No in-packet issue. The checkout-wide Core test-typecheck remains red in
  concurrent plugin hard-cut specs; leave it with that owner.

Final handoff:
- Mode: named List toggle/Core inference packet.
- Result: one lexical mutation owner; three inferred input-rule calls; no
  explicit transaction annotations or plugin option lookup.
- Scores: six packet owners at 100.
- Gap: installed-tx inference closed at Core owner.
- Deferrals inside scope: zero.
- External caveat: concurrent Core test-only compilation drift recorded above.
- Browser/barrels: N/A.
- Next owner: user chooses the next package.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Named List/Core packet closed |
| Where am I going? | Final handoff |
| What is the goal? | One lexical list-toggle owner with inferred active transaction rules |
| What have I learned? | Concrete editor extensions belong in the bound rule factory, not call-site annotations |
| What have I done? | Inlined, repaired inference, tested, audited, reviewed, and recorded the caveat |

Timeline:
- 2026-07-24T09:10:55.896Z plan and goal created.
- 2026-07-24T09:22:00Z compile regression reproduced erased tx groups.
- 2026-07-24T09:31:00Z owner repair passed focused type/runtime proof.
- 2026-07-24T09:42:00Z autoreview closed with zero actionable findings.
- 2026-07-24T09:46:05Z final completeness checker passed.

Open risks:
- No in-packet risk remains. The only red command is the checkout-wide Core
  test-typecheck in concurrent plugin hard-cut specs; this packet's Core
  source, public contracts, List typecheck, runtime tests, formatting, and
  review are green.
