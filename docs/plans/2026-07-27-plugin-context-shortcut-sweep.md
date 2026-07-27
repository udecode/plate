# Plugin context shortcut sweep

Objective:
Scan every production Plate plugin-authoring callback for `editor.*` access,
replace semantically redundant current-owner lookups with the callback's
inferred `store`, `api`, `read`, `update`, `type`, or `plugin` value, repair the
owning callback inference when necessary, and teach the rule in Plate Next and
Plate Plugin Creator.

Completion threshold:
- The repository-wide plugin callback inventory has zero unclassified
  current-owner lookups.
- Every safe replacement is implemented without casts, explicit callback
  annotations, compatibility APIs, or declaration reshaping.
- Cross-plugin access, editor-wide substrate, active/fresh transaction access,
  and specialized callbacks remain explicit and are classified.
- Package, Core, registry, docs, browser, doctrine, and generated-skill proof
  passes.

Verification surface:
- Babel AST inventory over production `packages/**` and
  `apps/www/src/registry/**` TypeScript plugin-builder files.
- Exact same-owner portal, current-key root group, object-key portal, and
  generic descriptor scans.
- Touched package tests and source-first typechecks, including Core type
  contracts and www docs/registry checks.
- In-app Browser proof on `/blocks/ai-demo` and
  `/docs/api/core/plate-plugin`.
- Plate Next version validation/status and generated-skill source audit.
- Autogoal completion checker.

Constraints:
- Do not replace editor-wide `editor.read`, `editor.update`, DOM/React
  extension APIs, cross-plugin portals, or metadata-bearing fresh
  transactions with a plugin-scoped value that has different semantics.
- Inside active transactions use `tx`; do not route through scoped `update`.
- Do not convert object declarations into callback declarations solely to
  capture a shortcut.
- Do not add casts, manual callback parameter types, aliases, or wrapper APIs.
- Edit `.agents/rules/**` sources and regenerate skill mirrors; never hand-edit
  generated `SKILL.md` files.

Boundaries:
The implementation scope is plugin authoring source in touched Plate packages,
Core's authoring type owner and contract tests, affected registry kits, current
English/Chinese docs examples, Plate Next and Plate Plugin Creator source
rules, the immutable doctrine registry, generated skill mirrors, and this
evidence ledger. Package attestation/sync-all, unrelated external consumers,
classic-package redesign, and Plite substrate redesign are outside this task.

Blocked condition:
A blocker would be a redundant same-owner call whose callback contract should
expose a shortcut but cannot infer it without a new public API decision. No
blocker remains: the one inference defect was repaired in Core without widening
the public API or TypeScript depth.

Start Gates:
| Gate | Applies | Evidence |
| --- | --- | --- |
| Explicit request captured | yes | Sweep all plugin `editor.*` calls, adopt context shortcuts, and update both named skills. |
| Source owner selected | yes | `.agents/rules/plate-next.mdc` and `.agents/rules/plate-plugin-creator.mdc`; generated skills are mirrors. |
| Best Plate v2 boundary | yes | Owner context for the current plugin; `editor` only for editor-wide, cross-plugin, metadata, or specialized callback work. |
| Public API decision | no | Existing callback values are the target; only a type projection defect required repair. |
| Measurable goal | yes | Zero unclassified same-owner matches plus package, browser, doctrine, and checker proof. |

Work Checklist:
- [x] Capture scope, stop condition, deliverables, and proof before edits.
- [x] Read Plate Next, Plate Plugin Creator, autogoal, changeset, registry
      changelog, Browser, and agent-native review instructions.
- [x] Build the production plugin callback manifest and classify every direct
      `editor.*` owner.
- [x] Replace all semantically equivalent current-owner calls.
- [x] Repair Plate callback-context inference at Core and add a type contract.
- [x] Update package, registry, English docs, and Chinese docs call sites.
- [x] Add the rule to both source owners, bump doctrine to v16, regenerate
      skills, and validate the immutable registry.
- [x] Classify release artifacts against `main`.
- [x] Run touched package tests, typechecks, formatting, lint, docs/registry
      checks, and browser proof.
- [x] Run exact residual scans and classify every survivor.
- [x] Complete agent-native review and final evidence.

Phase / pass table:
| Phase | Status | Result |
| --- | --- | --- |
| Inventory | complete | Production callback manifest and exact owner scans recorded. |
| Implementation | complete | Current-owner shortcuts adopted in packages, registry, and docs. |
| Core inference | complete | Exact callback fields preserve `C` without threading the full state through every React config. |
| Doctrine | complete | Plate Next v16 and generated skills contain the same rule. |
| Proof | complete | Scoped tests, typechecks, lint, browser, version validation, and checker are green; unrelated shared-gate WIP is classified. |

Inventory evidence:
- Baseline discovery found 97 destructured-editor callbacks across 54 files and
  327 nested `editor.*` call rows.
- The final normalized production AST pass found 94 callbacks across 53 files,
  279 direct accesses, and zero parser skips:
  `getType=108`, `read=84`, `plugin=30`, `api=23`, `update=18`, `id=7`,
  `anchor=3`, `getPlugin=3`, `getInjectProps=2`, `runtime=1`.
- Same-owner key/portal scans leave three deliberate cases:
  - `DOMPluginBase` uses `editor.api.dom` because `dom` is an editor-wide
    extension API, not the plugin-scoped `api`.
  - `BlockSelectionPlugin` uses its exact portal inside a shortcut handler;
    that specialized handler receives only `{ editor, event }`.
  - `CopilotPlugin` uses an exact key portal inside the user-configurable
    `autoTriggerQuery({ editor })` state function; it is not an authoring
    callback and receives no owner context.
- `editor.plugin(plugin)` remains only in generic consumer/component code such
  as `FloatingMedia`; no current-owner authoring callback remains.
- All remaining authoring uses are editor-wide snapshot/transaction work,
  cross-plugin access, metadata-bearing fresh updates, or specialized callback
  contracts.

Implementation evidence:
| Owner | Change |
| --- | --- |
| DnD, Cursor Overlay, Copilot | Use supplied current `store` instead of rediscovering the installed plugin. |
| Link, Image, Table, AI | Use supplied current `api`, `read`, or `update`; preserve root editor calls where semantics differ. |
| List and Blockquote | Use supplied `plugin` or `type` for current-owner identity. |
| Comment, Suggestion, AI registry kits | Use current owner context directly in handlers, injection, and hooks. |
| Core | Preserve exact `C` on Plate contextual callback fields and prove `read` inference through static extension and terminal configuration. |
| Docs | Document the authoring context and use it in English and Chinese AI examples. |

Gap ledger:
| Finding | Verdict | Owner / proof |
| --- | --- | --- |
| Plate callback fields reconstructed `State` as `{}`, making `read` unknown. | fixed | `PlatePlugin.ts` now reprojects contextual fields from `PlatePlugin<C>`; Core type contract and www typecheck pass. |
| Threading full `InferState<C>` through all React plugin config fields caused TS2589 in List Classic. | rejected and deleted | Narrow callback-field projection keeps inference without expanding the whole config. |
| Shortcut/input-rule/state-value callbacks expose only editor. | keep | Exact typed portals remain; no declaration wrapping or new API. |
| Editor-wide DOM/React APIs resemble current plugin keys. | keep | Property spelling alone never proves owner equivalence. |
| Missing Plite substrate | none | No Plite API gap was needed for this sweep. |

Related scoped sweep:
| Query | Scope | Matches | Patched | Kept / reason |
| --- | --- | ---: | ---: | --- |
| Destructured callback `editor.*` AST pass | production packages + registry | 279 final direct accesses | all eligible | editor substrate, cross-plugin, metadata, specialized callback |
| Same declaration owner portal/key pass | production plugin initializers | 2 syntactic matches | 0 | DOM root extension; Block Selection shortcut |
| `editor.plugin({ key })` | production packages + registry | 2 | 0 | Copilot state callback; Cursor Overlay cross-plugin DnD |
| `editor.plugin(plugin)` | production packages + registry | generic consumers only | 0 | descriptor-generic component/UI access |
| Current-key root `api/read/update` pass | production plugin initializers | 1 | all eligible already removed | sole survivor is DOM root extension |

Agent-native review:
| User action | Agent route | Source owner | Mirror / docs | Proof | Status |
| --- | --- | --- | --- | --- | --- |
| Author a plugin with current-owner shortcuts | `plate-plugin-creator` | `.agents/rules/plate-plugin-creator.mdc` | generated skill, typing reference, Plate Plugin docs | `pnpm install`, Core type contract, www typecheck | pass |
| Reject migrated redundant editor portals | `plate-next` | `.agents/rules/plate-next.mdc` | generated Plate Next skill, v16 registry | version validate/status and exact scans | pass |

Agent-native findings:
No P0-P3 finding remains. Source ownership, generated mirrors,
discoverability, repeatable proof, and user-facing docs are aligned.

Release artifact decision:
- The existing `.changeset/plugin-portal-scoped-api.md` major changeset already
  promises inferred constructor `read`/`update` capabilities and current plugin
  context. The Core repair makes that branch contract true; it is not another
  user-visible delta from `main`, so no new changeset is correct.
- Registry edits are behavior-preserving authoring cleanup with no copied-code
  install or rendered behavior change, so a registry changelog event is N/A.
- No export or file-layout change occurred; barrel generation is N/A.

Doctrine evidence:
- Starting live doctrine was v15; the reusable rule is registered as v16 with
  fingerprint
  `sha256:b5aa00eda188ba8ab3eb5d7de0d6c2961a59c3cf246f1c6e1ddf17fdedd7a43a`.
- `version.mjs validate`: 41 active and 1 retired row, valid.
- Final `status all`: 42 tracked, 5 current, 36 stale, 0 drifted, 1 retired.
  Syncing or attesting all packages is explicitly outside this rule sweep.

Completion Gates:
| Gate | Applies | Evidence |
| --- | --- | --- |
| Zero unclassified owner calls | yes | Final AST and exact scans classify all 279 direct accesses; zero redundant owner calls remain. |
| Package tests | yes | Nine touched package test tasks pass. |
| Package/Core/www typecheck | yes | Final 65-task graph passes after deleting the over-broad state threading. |
| Docs and registry checks | yes | www typecheck reports docs parity and registry source checks passed. |
| Browser | yes | AI demo and Plate Plugin docs render with zero browser warnings/errors. |
| Formatting and lint | yes | Scoped Biome and ESLint complete with zero errors. |
| Doctrine and generated mirrors | yes | `pnpm install`, v16 validate/status, and source/mirror text audit pass. |
| Agent-native review | yes | Capability map passes with no accepted finding left. |
| Release artifacts | yes | Existing Core major changeset covers the contract; registry changelog and barrels are N/A. |
| Shared Core gate | no | Core audits and all 44 tracked package typechecks pass; the command then exits in an untouched new Plite React generic contract whose fixture value is widened/readonly. |
| Goal checker | yes | Autogoal checker passes on this ledger. |

Verification evidence:
- `pnpm turbo test` for Core, basic-nodes, AI, DnD, selection, link, list,
  media, and table: 9/9 tasks passed.
- `pnpm turbo typecheck` for those nine packages plus www: 65/65 tasks passed.
- `pnpm check:core`: Core source/docs audits and 44/44 tracked package
  typechecks passed; the later generic-contract lane exits in the untouched
  new file `packages/plite-react/test/generic-react-editor-contract.tsx`.
  Its `CustomValue` fixture inference errors are independent of Plate plugin
  context and are outside this task under the Core-only error policy.
- Core contract proves `read.childCount()` inference in both `.extend()` and
  terminal `.configure()` callbacks.
- Scoped `biome check --write` and ESLint: zero errors.
- Browser `/blocks/ai-demo`: editor and AI menu rendered; zero warning/error
  logs.
- Browser `/docs/api/core/plate-plugin`: “Authoring Context” rendered; zero
  warning/error logs.
- `pnpm install` regenerated both named skills.
- `version.mjs validate` and `status all`: valid v16, zero drifted rows.
- Final Babel/exact source scans: zero redundant current-owner authoring calls.
- Autogoal completion checker: passed.

Reboot status:
No reboot or environment repair was required. Final evidence was rerun after
the narrow Core type projection replaced the rejected broad generic change.

Open risks:
No task-specific risk. Two existing checkout queues remain outside this task:
36 stale Plate Next package attestations, and the new Plite React generic
contract's `CustomValue` inference errors in the shared Core gate. Neither is
caused by or hides Plate plugin-context drift.
