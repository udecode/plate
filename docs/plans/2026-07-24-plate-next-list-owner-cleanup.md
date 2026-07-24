# plate-next list owner cleanup

Objective:
Repair `best-api` so colocation and inline reviews inventory the complete
bounded owner, then finish the exhaustive `@platejs/list` owner cleanup rather
than stopping at `toggleList`.

Completion threshold:
- `.agents/rules/best-api.mdc` and its generated skill require a bounded file,
  declaration, extension, transaction-helper, export, and consumer inventory.
- All 10 `packages/list/src` files and all 23 surviving top-level declarations
  have explicit owner decisions.
- All 14 removable/localizable declarations and both redundant extension
  wrappers are closed without adding helper files or a line ceiling.
- Base and React `extendExtension` command callbacks infer installed plugin
  transaction groups without casts or callback annotations.
- Focused tests, Core/List typecheck, List build, lint, barrels, browser proof,
  source audits, changesets, agent-native review, structured review, and this
  plan checker are recorded.

Verification surface:
- `pnpm install`
- `pnpm --filter @platejs/list brl`
- `pnpm --filter @platejs/core lint:fix`
- `pnpm --filter @platejs/list lint:fix`
- `pnpm --filter @platejs/list build`
- `bun test ./packages/list/src/lib/BaseListPlugin.spec.tsx ./packages/list/src/react/ListPlugin.spec.tsx`
- `bun test ./packages/list/src/lib/BaseListPlugin.slow.tsx`
- `bun test ./packages/core/src/lib/plugin/createBasePlugin.spec.ts ./packages/core/src/react/plugin/createPlatePlugin.spec.ts`
- `pnpm turbo typecheck --filter=./packages/core --filter=./packages/list`
- `pnpm check:core`
- `/blocks/list-demo` browser interaction and console inspection
- exact manifest, declaration, extension, transaction-helper, stale-symbol,
  skill-sync, export, and diff-check audits
- `.agents/skills/autoreview/scripts/autoreview --mode local --prompt <bounded scope>`
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-24-plate-next-list-owner-cleanup.md`

Constraints:
- Best Plate v2 shape on Plite; no legacy compatibility goal.
- Owner-first colocation has no line ceiling.
- Inline one-owner plugin behavior; keep a declaration only for public
  contract, real cross-owner reuse, recursion, or a coherent reused algorithm.
- No standalone production helper accepting `tx` without multiple consumers or
  an independent transaction-composition boundary.
- No callback parameter annotations or casts hiding failed inference; repair
  the owning generic.
- React files follow component/hook families, not subcomponent/subhook
  taxonomy.
- Package-review scope is `packages/list`, `best-api`, the smallest Core type
  owner, focused tests, existing changesets, and this plan.
- No www/docs/template source edits, no next package, no compatibility aliases,
  no messages to other Codex tasks, and no git add/commit/push.

Boundaries:
- Source rule: `.agents/rules/best-api.mdc`
- Generated mirror: `.agents/skills/best-api/SKILL.md`
- Headless owner: `packages/list/src/lib/BaseListPlugin.tsx`
- React owners: `packages/list/src/react/*`
- Type owner: Base/React plugin extension declarations plus the shallow
  `PlatePluginExtensionEditor` capability type in Core
- Proof owners: List fast/slow/React specs and Core Base/React plugin specs
- Release owners: `.changeset/list-scoped-api.md` and
  `.changeset/plugin-portal-scoped-api.md`
- Browser surface: existing `/blocks/list-demo` only

Blocked condition:
Stop only if the List shape requires a missing Plite/Core primitive or a public
API fork that cannot be resolved from current source and focused proof. The
shared `check:core` caption-manifest launcher failure is recorded separately
because it occurs before List execution.

Current verdict:
- verdict: complete within the bounded owner
- confidence: high
- next owner: separate exhaustive `createRuleFactory` static/runtime-context
  contract audit, only if the user chooses that Core packet
- keep / revert / quarantine call: keep
- reason: 14/14 cleanup candidates and 2/2 redundant wrappers closed; 110/110
  List tests, 37/37 Core focused tests, typecheck, build, lint, browser, and
  source audits pass

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt captured | yes | Skill repair, exhaustive List sweep, no line ceiling, no next package, proof, and no cross-task messages recorded |
| Skills loaded | yes | `best-api`, `autogoal`, `plate-next`, `plate-plugin-creator`, `architecture-cleanup`, `typescript-advanced-types`, `agent-native-reviewer`, `changeset`, Browser, and `autoreview` read |
| Mode classified | yes | Package review plus smallest Core type owner; not broad Core |
| Package manifest | yes | 10 source rows materialized before closure |
| Agent source/mirror owner | yes | `.mdc` source edited; generated `SKILL.md` synced by `pnpm install` |
| Public API impact | yes | List major changeset and Core major changeset already own the final public delta |

Work Checklist:
- [x] Copy every explicit requirement, scope boundary, stop condition, proof
      command, and handoff requirement into the goal plan.
- [x] Repair the `best-api` source rule with a bounded exhaustiveness gate.
- [x] Regenerate and verify the `best-api` skill mirror.
- [x] Inventory all 10 package files, 16 runtime declarations, 7 public type
      declarations, extension wrappers, tx callbacks, exports, and consumers.
- [x] Decide every declaration: inline/delete, lexical algorithm, scoped reuse,
      public owner, or defer with exact owner.
- [x] Close all 14 removable/localizable declarations and merge 2 redundant
      extension wrappers.
- [x] Keep all 23 survivors only with public-contract or concrete reuse proof.
- [x] Reuse `tx.list.outdent` from delete/insert-break commands without raw
      mutation duplication.
- [x] Repair Base and React extension-command transaction inference at Core.
- [x] Add Core compile-only inference regressions and List outdent metadata
      behavior proof.
- [x] Verify direct APIs, live targets, optional reads, normalization calls,
      plugin export inference, empty configs, and extension options in scope.
- [x] Run barrels, lint, build, focused tests, typecheck, browser proof, source
      audits, and diff check.
- [x] Load `changeset` and update the existing List/Core release prose relative
      to `origin/main`.
- [x] Complete agent-native review and forward-test the repaired skill against
      this package.
- [x] Run structured autoreview; verify and reject its one out-of-scope
      input-rule finding as a separate full-family audit.
- [x] Record the shared `check:core` caption-manifest launcher failure without
      misclassifying it as a List/Core regression.
- [x] Fill final ledgers, evidence, reboot status, and open risks.

Completion Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Named verification threshold | yes | 110 List tests, 37 Core tests, Core/List typecheck, List build, lint, barrels, and browser proof pass |
| Bounded exhaustiveness | yes | 10/10 files, 23/23 survivors, 14/14 removals/localizations, and 3 initial to 1 final extension wrapper reviewed |
| Package file checklist | yes | 10/10 rows score 100; 0 deferred |
| Helper topology / lexical tx ownership | yes | No helper directories remain and no standalone production `tx` helper remains |
| Best Plate v2 recommendation | yes | One headless owner, flat React families, public pure predicate exception, scoped API/update methods |
| Plite/Plate gap ledger | yes | Command tx inference gap fixed at Core; no remaining List gap |
| Related scoped sweep | yes | Same-class symbol, extension, tx, React-family, and Core Base/React searches recorded |
| Shared Core gate coverage | yes | `list` is registered at `check-core.mjs:42`; launcher stops earlier on missing foreign caption manifest |
| Agent source / generated sync | yes | `pnpm install` regenerated the skill and exact gate text is discoverable in source and mirror |
| Agent-native review | yes | Trigger, action, source/mirror, contradiction, and forward-test checks pass |
| Public API / release artifact | yes | Existing major List/Core changesets describe final API and outdent/inference behavior |
| Barrel/export generation | yes | `pnpm --filter @platejs/list brl` passes |
| Browser proof | yes | `/blocks/list-demo` renders; root bullet Backspace removes list role/style; console has 0 errors and 0 warnings |
| Structured review | yes | One P2 outside frozen scope verified; full input-rule family deferred rather than patching only the first match |
| Goal plan complete | yes | Final mechanical checker command is the last gate |

Phase / pass table:
| Phase | Status | Evidence |
|-------|--------|----------|
| Skill repair | complete | Source rule and generated mirror contain bounded exhaustiveness gate |
| Owner inventory | complete | 10 files, 23 current declarations, 14 removed/localized candidates |
| Implementation | complete | List owner and Core inference fixes kept |
| Package proof | complete | Tests/typecheck/build/lint/barrels/browser pass |
| Review | complete | Agent-native clean; structured P2 classified outside scope |
| Handoff | complete | Ledgers and evidence recorded |

Bounded declaration inventory:
- Manifest method: `rg --files packages/list/src | sort`
- File count: expected 10, reviewed 10, missing 0, extra 0
- Current runtime declarations: expected 16, reviewed 16
- Current public type declarations: expected 7, reviewed 7
- Current declaration total: expected 23, reviewed 23
- Initial removable/localizable declarations: expected 14, closed 14
- Initial extension wrappers: 3; final extension wrappers: 1
- Final standalone production functions accepting `tx`: 0

Removed/localized declaration list:
1. `defaultOptions` — inline empty typed options
2. `getListExpectedListStart` — lexical reusable behavior helper
3. `normalizeListStart` — lexical pure update decision plus direct writes
4. `LIST_CHANGE_GUARD` — lexical behavior-extension guard
5. `getRootChildren` — inline root read
6. `isSameNodeKind` — inline structural comparison
7. `getStructuralKey` — lexical recursive structural matcher
8. `collectInsertedTopLevelIndices` — inline transaction-change algorithm
9. `isSplitTopLevelIndex` — inline split decision
10. `getSequenceKey` — lexical reused suffix-normalization key
11. `resolveAmbiguousListStyleType` — lexical reused normalization rule
12. `normalizeDefaultListSuffix` — inline suffix algorithm
13. `outdentListBlock` — delete; reuse inferred `tx.list.outdent`
14. `List` — inline the default render family

Survivor declaration list:
| Declaration | Decision | Evidence |
|-------------|----------|----------|
| `ListStyleType` value/type | public owner | Shared marker vocabulary |
| `IndentListOptions` | public owner | Scoped update contract |
| `OutdentListOptions` | public owner | Scoped update contract |
| `ToggleListOptions` | public owner | Scoped update contract |
| `ULIST_STYLE_TYPES` | public owner | Exported unordered vocabulary and internal normalization |
| `GetSiblingListOptions` | public owner | Configurable sibling algorithm contract |
| `getSiblingList` | keep private | Shared by previous/next traversal |
| `getPreviousList` | keep private | Five internal production reads across API/tx/normalization |
| `getNextList` | keep private | Shared continuation traversal |
| `isHeadingListNode` | keep private | Shared boundary/query predicate |
| `isListSequenceBoundary` | keep private | Three normalization consumers |
| `getListSequenceSiblingOptions` | keep private | Two sequence algorithms |
| `isOrderedList` | public pure owner | Four current app source consumers without an editor |
| `isListItem` | keep private | Eight behavior consumers |
| `BaseListPluginOptions` | public owner | Real configurable sibling policy |
| `BaseListPlugin` | public owner | Headless capability descriptor |
| `BaseListConfig` | public owner | Inferred descriptor contract |
| `isListInputBlocked` | keep private | Three input-rule families |
| `createListRule` | keep private | Three input-rule families |
| `BulletedListRules` | public owner | Shipped rule family |
| `OrderedListRules` | public owner | Shipped rule family |
| `TaskListRules` | public owner | Shipped rule family |
| `ListConfig` | public React owner | React descriptor contract alias |

Package file checklist:
- Applies: yes
- Package: `@platejs/list`
- Expected: 10
- Reviewed at score 100: 10
- Deferred: 0
- Missing: 0
- Extra: 0

Package file rows:
- [x] `packages/list/src/index.ts` — score: 100 — generated root barrel; `brl`
      and build pass.
- [x] `packages/list/src/lib/BaseListPlugin.slow.tsx` — score: 100 — measured
      slow behavior family; 63/63 pass.
- [x] `packages/list/src/lib/BaseListPlugin.spec.tsx` — score: 100 — headless
      fast behavior family; 47 combined fast/React tests pass.
- [x] `packages/list/src/lib/BaseListPlugin.tsx` — score: 100 — coherent
      headless owner; exhaustive declaration/tx/extension audit passes.
- [x] `packages/list/src/lib/index.ts` — score: 100 — generated lib barrel;
      `brl` and build pass.
- [x] `packages/list/src/react/ListPlugin.spec.tsx` — score: 100 — React
      descriptor/hook family proof passes.
- [x] `packages/list/src/react/ListPlugin.tsx` — score: 100 — thin React lift;
      no duplicate behavior.
- [x] `packages/list/src/react/index.ts` — score: 100 — generated React barrel;
      `brl` and build pass.
- [x] `packages/list/src/react/useListToolbarButton.ts` — score: 100 — one
      toolbar hook family containing its list/todo subhooks.
- [x] `packages/list/src/react/useTodoListElement.ts` — score: 100 — one
      independent todo-element hook family.

Review matrix:
| Target | Score | Verdict | Evidence | Next |
|--------|-------|---------|----------|------|
| `best-api` audit procedure | 100 | keep repaired | Complete bounded inventory and coverage facts are mandatory | use for later packages |
| Headless List topology | 100 | keep consolidated | 14 candidates closed; 23 survivors justified | none |
| React List topology | 100 | keep flat families | descriptor plus two durable hook families | none |
| Extension command inference | 100 | keep Core repair | Base/React compile regressions and typecheck pass | none |
| Root outdent behavior | 100 | keep | focused metadata regression and browser Backspace proof | none |
| `createRuleFactory` context contract | 70 | defer separate owner | static fields overpromise runtime context across a broader family | exhaustive Core input-rule audit |

Best Plate v2 recommendation:
| Target | Recommended shape | Rejected alternative | Reason |
|--------|-------------------|----------------------|--------|
| Headless List | One coherent `BaseListPlugin.tsx`, scoped API/update, private reused algorithms only | helper taxonomy and exported raw transforms | shortest inference and navigation path |
| React List | Thin descriptor plus flat toolbar and todo-element hook families | one file per subhook or nested hooks folder | family ownership |
| Command behavior | `state.transaction(tx => tx.list.outdent(...))` | duplicated `tx.indent.set` or cast | reuse truthful scoped owner |
| Pure render query | Keep exported `isOrderedList` | force static render consumers through editor portal | real cross-layer reuse |

Plite / Plate gap ledger:
| Gap | Smallest owner | Decision | Proof |
|-----|----------------|----------|-------|
| Plugin extension commands lost installed tx groups | Core Base/React plugin extension typing | fixed with shallow `PlatePluginExtensionEditor` contextual overloads | 37 Core tests and Core/List typecheck |
| List runtime/API gap | N/A | none remains | package and browser proof |

Related scoped sweep ledger:
| Trigger | Scope | Method | Matches | Patched | Deferred |
|---------|-------|--------|---------|---------|----------|
| User corrected first-match audit | `packages/list/src` | 10-file manifest plus 16 runtime/7 type declarations | 23 survivors + 14 candidates | 14 candidates | 0 |
| Redundant extension wrappers | `BaseListPlugin.tsx` | `.extendExtension` count | 3 initial | 2 merged | 0 |
| Raw tx helper risk | List production source | standalone tx signature and callback search | 7 lexical callbacks, 0 standalone helpers | 2 command calls reuse `tx.list.outdent` | 0 |
| Inference failure | Core Base/React builders | sibling type-owner search | 2 builders | 2 | 0 |
| React colocation | `packages/list/src/react` | file/family/consumer audit | 5 files | already correct | 0 |
| Autoreview input-rule finding | Core input-rule factory | inspect all static/runtime callback categories | broader than cited `resolveMatch` | 0 | full family |

Extracted file ledger:
- `git ls-files --others --exclude-standard packages/list` returned 0 rows.
- No in-scope extracted or untracked file requires recovery classification.

Out-of-scope package drift:
| Surface | Evidence | Classification |
|---------|----------|----------------|
| `pnpm check:core` | Stops at `check-core.mjs:84` because `packages/caption/package.json` is absent | foreign checkout launcher blocker before List runs |
| `createRuleFactory` static fields | Autoreview P2 at `createRuleFactory.ts:652`; sibling static fields share the contract issue | separate exhaustive Core input-rule packet |

Changed list:
| Group | Changes |
|-------|---------|
| agent rules | Add bounded exhaustiveness and coverage reporting to `best-api`; regenerate mirror |
| Core types/tests | Infer installed plugin tx groups in Base/React extension commands; add compile regressions |
| List code/tests | Localize/delete 14 declarations, merge behavior wrappers, reuse `tx.list.outdent`, prove metadata clearing |
| release | Update existing List/Core changesets to final user-visible behavior |
| plan | Record full inventory, proof, review, and blockers |

Needs your attention:
1. The next valuable Core packet is an exhaustive `createRuleFactory` audit:
   classify every field evaluated with runtime context versus static factory
   options. Do not patch only `resolveMatch`.
2. The shared `check:core` launcher remains unable to start until the separate
   caption package state is repaired.

Findings:
- The original mistake was procedural: reviewing the first obvious function
  without materializing the owner inventory.
- List is cleaner as one large headless owner. Splitting it again would be
  architecture regression.
- A shallow command-editor capability type avoids both `any` inference loss and
  recursive full-editor type expansion.
- `isOrderedList` is the honest exception: pure, trivial, and reused by static
  render consumers.

Decisions and tradeoffs:
- No file line ceiling.
- Keep semantic local intermediates inside coherent algorithms; the inline rule
  targets owner fragments, not a stupid ban on readable local variables.
- Keep public contract declarations even when the package itself has no second
  caller.
- Reject the autoreview P2 from this packet because its complete bug class is a
  separate Core owner; a one-line `resolveMatch` patch would be dishonest.

Error attempts:
| Error | Count | Resolution |
|-------|-------|------------|
| Typecheck exposed missing extension command tx groups | 1 | Repair Core contextual editor type; no cast |
| First strict full-editor typing caused recursive/invariant Core failures | 1 | Use shallow command capability plus contextual overload |
| Concurrent duplicate React declarations appeared during the same owner repair | 1 | Remove duplicate and rerun format/tests/typecheck |
| Bun slow-test path lacked `./` | 1 | Rerun exact path; 63/63 pass |
| Browser pressed a child text locator after focus moved | 1 | Refresh DOM, target unique contenteditable, verify behavior |
| Shared `check:core` caption ENOENT | 1 | Record foreign pre-execution blocker |
| Structured review found input-rule context lie | 1 | Verify broader family and defer exact owner |

Verification evidence:
- `pnpm install` — pass; generated skills synced.
- `pnpm --filter @platejs/list brl` — pass.
- Core/List `lint:fix` — 402 Core and 13 List files checked; no fixes.
- `pnpm --filter @platejs/list build` — pass.
- List fast/React — 47 pass, 0 fail, 90 expects.
- List slow — 63 pass, 0 fail, 120 expects.
- Core Base/React plugin specs — 37 pass, 0 fail, 65 expects.
- Core/List source-first typecheck — 15/15 tasks pass.
- Browser `/blocks/list-demo` — HTTP 200; root bullet outdents to plain block;
  0 console errors, 0 warnings.
- `git diff HEAD --check -- <bounded files>` — pass.
- `pnpm check:core` — blocked before package execution by missing
  `packages/caption/package.json`.
- Agent-native forward test — 10 files, 23 current declarations, 14 candidates,
  and all extension/tx rows enumerated before recommendation.
- Structured autoreview — one verified P2 outside frozen scope; rejected from
  this packet with full-family follow-up.

Final handoff contract:
- target: `best-api` exhaustive audit rule plus `@platejs/list` owner cleanup
- coverage: 10/10 files, 23/23 survivors, 14/14 candidates, 2/2 wrapper merges
- result: source-frozen; no next package started
- public shape: scoped List API/update retained; root outdent clears list-only
  metadata; Base/React command callbacks infer plugin tx groups
- release: existing List/Core major changesets updated
- blockers: only foreign caption launcher state and separate input-rule family
- next owner: user-selected next package, or exhaustive Core input-rule factory

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Source-frozen after proof and review |
| Where am I going? | Mechanical goal checker, then concise handoff |
| What was the goal? | Prevent partial API audits and finish the full List owner cleanup |
| What was done? | Skill repair, exhaustive refactor, Core inference fix, tests, browser, release prose, review |
| What remains in scope? | Only the goal checker |

Open risks:
- Shared `check:core` cannot launch while `packages/caption/package.json` is
  absent.
- `createRuleFactory` statically evaluated fields need a separate exhaustive
  static-options versus runtime-context contract audit.
