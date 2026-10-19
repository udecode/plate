# Cut explicit React editor-hook generics

Objective:
Remove every authored `useEditor<EditorType>()` and
`useActiveEditor<EditorType>()` refinement across current packages, apps, and
docs. Context hooks return only their guaranteed mounted Plate or Plite React
editor. Exact feature capabilities come from descriptor portals.

Completion threshold:
The initial 72-match ledger is resolved with zero deferred rows. No explicit
context-editor generic, two-parameter selector generic, or exact-editor selector
annotation remains in authored consumer code. Core, Plite, Plite React, Link,
Table, Footnote, www, focused runtime tests, lint, source audits, and browser
proof establish the surviving API. Constructor and explicit-editor-input hooks
retain only genuinely correlated generics.

Verification surface:
- Initial and final exact `rg` audits under authored `packages/**`,
  `apps/**`, and `content/**`, excluding generated registry/public/template
  output.
- Source-first typechecks for Plite, Plite React, Core, Link, Table, Footnote,
  and the complete www graph.
- Plite extension-portal, Plite React provider, Footnote insertion, and
  compile-only React generic contracts.
- Scoped Biome, `git diff --check`, generated API-reference check, and
  Browser proof on `/blocks/editor-ai` and
  `/examples/plite/document-state`.
- P2 autoreview attempt with the task invariant and owner boundary supplied.

Constraints:
- Hard cut only. No compatibility overload, assertion carrier, wrapper alias,
  or consumer cast.
- Preserve constructor-hook generics whose typed options create the output.
- Preserve selector result generics and hooks whose explicit editor or
  descriptor input correlates the result.
- Fix missing capability ownership in Plite/Core instead of passing a whole
  editor type through React context.
- Preserve unrelated shared WIP and generated/template boundaries.
- Do not rename files, run `build:registry`, or change unrelated APIs.

Boundaries:
- In scope: Plate and Plite React context hooks, their selector/state-field
  families, exact authored callers/docs, the smallest descriptor-portal support,
  release prose, API reference, doctrine, tests, and goal evidence.
- Out of scope: broad Core/package colocation review, schema redesign,
  unrelated documentation configure drift, templates, device testing, and
  unrelated checkout secrets.
- Source of truth: current authored source plus the initial ledger at
  `docs/plans/artifacts/cut-explicit-react-editor-hook-generics/usage-ledger.md`.

Blocked condition:
No task blocker remains. The checkout-wide P2 reviewer failed closed before
model invocation because unrelated local changes contain secret-like material.
The broad `check:core` command also stops on unrelated basic-block/heading
documentation-policy drift after all preceding Core/source audits pass. Both
limits are recorded without modifying those owners.

Start Gates:
| Gate | Applies | Evidence |
|---|---|---|
| Prompt captured | yes | Repo-wide audit and hard cut, with constructor generics explicitly preserved only when correlated. |
| Owner boundary | yes | Core and Plite React own context hooks; Plite owns extension portals; feature packages own descriptor operations. |
| Compatibility policy | yes | No overload, alias, cast, or deprecated call shape survives. |
| Generated boundary | yes | Templates and built registry output excluded; API reference regenerated through its owner command. |
| Browser requirement | yes | Existing localhost server served both affected runtime surfaces. |

Phase / pass table:
| Phase | Status | Evidence |
|---|---|---|
| Inventory | complete | 72 authored matches recorded in the usage ledger. |
| Owner repair | complete | Non-generic context hooks, result-only selectors, and descriptor-scoped capability access implemented. |
| Consumer migration | complete | 72 of 72 initial rows cut; related exact-editor selector carriers cut. |
| Public contracts | complete | Core, Plite, Plite React, Footnote changesets and API reference updated. |
| Doctrine | complete | Best API rule and Plate/Plite Vision owners updated; `pnpm install` regenerated the skill. |
| Verification | complete | Focused tests, package/app typechecks, audits, lint, browser proof, and documented broad-gate limits recorded. |

Work Checklist:
- [x] Copy the exact request, scope, exclusions, stop condition, and proof into
      the goal plan.
- [x] Inventory every authored `useEditor<...>` occurrence and classify its
      owner.
- [x] Remove context-hook editor generics at the Core and Plite React owners.
- [x] Remove hidden editor refinements from selector and state-field hook
      families while preserving selected-result inference.
- [x] Replace feature access with Plate/Plite descriptor portals.
- [x] Add descriptor-scoped Plite transaction-policy updates rather than typed
      whole-editor callbacks.
- [x] Migrate all 72 callers and the related selector-carrier rows.
- [x] Update tests, current docs, changesets, generated API reference, Best API
      doctrine, Plate Vision, and Plite Vision.
- [x] Run focused and broad type/runtime/lint/source/browser proof.
- [x] Record unrelated broad-gate and reviewer limits without changing their
      owners.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|---|---|---|---|
| Usage ledger | yes | Resolve every authored match | 72 cut, 0 deferred; linked artifact contains every row. |
| Exact source audit | yes | Find no stale context refinements | Final `use(?:Active)?Editor<`, two-parameter selector, and typed consumer-selector queries return zero. |
| Package types | yes | Typecheck every changed package owner | Turbo reports 22 of 22 successful tasks for Plite, Plite React, Core, Link, Table, and Footnote. |
| Focused runtime | yes | Prove portal and feature behavior | Plite 1/1, Plite React 42/42, Footnote 27/27. |
| Compile-only contract | yes | Prove descriptor capability recovery without a context generic | Plite React generic contract exits zero. |
| Application graph | yes | Run full www typecheck and generated checks | Turbo reports 57 of 57 successful tasks after API-reference regeneration. |
| Browser | yes | Exercise Plate render and Plite scoped-history path | Plate editor rendered cleanly; Plite title changed Q2 to Q3 and scoped undo restored Q2 with semantic/history/selection tags; zero console warnings/errors. |
| Core aggregate | yes | Run `pnpm check:core` | Runner, declaration, schema-adoption source, and docs contract tests pass; command stops only on unrelated basic-block/heading configure prose. |
| P2 review | yes | Run local autoreview with task scope | Reviewer failed closed before model invocation on secret-like content in unrelated local changes; direct source review and all task proof found no accepted issue. |
| Formatting | yes | Format task files and check whitespace | Biome checked 52 files with no fixes on final pass; `git diff --check` passes. |
| Doctrine repair | yes | Update source rule, Vision owners, and regenerate | Best API source and generated skill align after `pnpm install`. |
| Goal plan | yes | Run the autogoal completion checker | Final checker result: pass. |

Best Plate v2 recommendation:
| Target | Recommended shape | Rejected alternatives | Reason |
|---|---|---|---|
| React context editor | `useEditor()` / `useActiveEditor()` with mounted layer type | Caller generic, overload assertion, local editor alias | No typed input exists from which to infer an exact feature graph. |
| Feature capability | Descriptor portal | Root editor refinement | The descriptor is the real typed input and runtime owner. |
| Selectors | Result generic only | Hidden editor generic | Context fixes the editor; selector output is the only inferred variable. |
| Constructors | Keep correlated generics | Erase all hook generics | Options, extensions, and initial value genuinely construct the result. |

Plite / Plate gap ledger:
| Gap | Owner | Resolution | Proof |
|---|---|---|---|
| Plite descriptor portal could not apply root update policy | Plite | Added stable `extension.update(policy).method()` portal using one root transaction. | Runtime tags contract, package typecheck, and document-state Browser undo. |
| Plate feature callers depended on refined context editor | Feature/Core React | Use `editor.plugin(Plugin)` or `useEditorPlugin(Plugin)`. | Link/Table/Footnote/package and www typechecks. |

Related scoped sweep ledger:
| Trigger | Scope | Initial | Patched | Deferred | Final |
|---|---|---:|---:|---:|---|
| `useEditor<...>` | Authored packages/apps/docs | 72 | 72 | 0 | 0 |
| `useActiveEditor<...>` | Authored packages/apps/docs | 0 | 0 | 0 | 0 |
| Two-parameter selector/state-field generics | Authored packages/apps/docs | owner/proof rows found | all | 0 | 0 |
| Exact consumer editor annotations on `useEditorSelector` | Authored consumers | 5 | 5 | 0 | 0 |
| Constructor/editor-input hooks | Authored source/docs | justified survivors | 0 | N/A | kept by correlation law |

Changed list:
| Group | Current-run changes |
|---|---|
| API owners | Core and Plite React context/selector/state hooks; Plite scoped extension update portal. |
| Feature adoption | Link, Table, Footnote, Plite examples, and registry consumers use broad context plus descriptor capabilities. |
| Tests | Plite portal runtime, Footnote trigger transaction, Plite React provider and compile-only contracts. |
| Docs/release | Current editor guides, four one-package changesets, API reference manifest. |
| Doctrine/evidence | Best API source/generated skill, Plate/Plite Vision, usage ledger, this goal plan. |

Error attempts:
| Error / failed attempt | Count | Different move | Resolution |
|---|---:|---|---|
| Footnote filter omitted package-relative `src/lib` | 1 | Use the package harness with the full relative path | 27/27 passed. |
| Direct Footnote Bun run resolved stale built Core output | 1 | Use `plate-pkg p:test` source mapping | 27/27 passed. |
| Provider file without the `.test` wrapper | 1 | Run `provider-hooks-contract.test.tsx` | 42/42 passed. |
| Browser expected the wrong Q3 label | 1 | Inspect fresh DOM and verify the actual `Q3 Launch Brief` value | Scoped undo restored Q2. |
| www API manifest stale | 1 | Run the owning `pnpm --filter www api-reference` generator | Full 57-task www typecheck passed. |
| Local P2 autoreview secret scan | 1 | Preserve fail-closed behavior and perform scoped source/proof review | No reviewer output; unrelated secret owner untouched. |

Verification evidence:
- `pnpm turbo typecheck --filter=./packages/plite --filter=./packages/plite-react --filter=./packages/core --filter=./packages/link --filter=./packages/table --filter=./packages/footnote`: 22/22.
- `pnpm --filter @platejs/plite test extension-portal.test.ts`: 1/1.
- `pnpm --filter @platejs/plite-react exec vitest run --config ./vitest.config.mjs test/provider-hooks-contract.test.tsx`: 42/42.
- `pnpm --filter @platejs/footnote test src/lib/BaseFootnotePlugin.spec.ts`: 27/27.
- `pnpm exec tsc --project packages/plite-react/test/tsconfig.generic-types.json --noEmit`: pass.
- `pnpm turbo typecheck --filter=./apps/www`: 57/57.
- Exact final source audits: zero stale matches.
- Final scoped Biome: 52 files, no fixes.
- `git diff --check`: pass.
- Browser: Plate editor and Plite title/history interaction pass with zero console warnings/errors.
- `pnpm check:core`: relevant audits pass; unrelated docs-policy rows stop the aggregate.
- P2 autoreview: attempted with exact scope; checkout-wide secret scan failed closed before review.

Final handoff contract:
- Target: repo-wide explicit React context-editor generic hard cut.
- Result: 72/72 rows cut, zero deferred.
- Public law: context is broad; descriptors recover exact capabilities.
- Plite gap: scoped update policy portal resolved and proven.
- Remaining task work: none.
- Unrelated checkout limits: basic-block/heading docs drift and secret-like
  material prevent two aggregate review commands from ending cleanly.

Reboot status:
| Question | Answer |
|---|---|
| Where am I? | Final closure. |
| Where am I going? | Goal completion after the mechanical checker. |
| What is the goal? | Zero unjustified explicit React context-editor generics. |
| What have I learned? | Descriptor input is the honest inference boundary; context is not. |
| What have I done? | Cut 72 rows, repaired owners/doctrine, and completed focused/app/browser proof. |

Timeline:
- 2026-08-06: inventoried 72 matches, hard-cut context refinements, repaired the
  Plite portal gap, migrated consumers, updated doctrine/docs/release evidence,
  and completed proof.

Open risks:
- The checkout-wide P2 model review produced no findings because its secret scan
  stopped before invocation on unrelated local changes.
- `pnpm check:core` does not exit zero until the separate basic-block/heading
  configure documentation drift is repaired.

