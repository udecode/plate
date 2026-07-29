# Plate Next Core P0 contracts

Objective:
Close the three P0 rows in
`docs/plans/artifacts/plate-next-all-package-plugin-audit-v18/audit-report.md`:
CORE-01 production-any, CORE-02 builder-inference, and CORE-03
optional-plugin-law.

Completion threshold:
All 3 P0 rows have an owning Core repair, compile/runtime proof, a
same-class source sweep, published API documentation, release classification,
and no accepted actionable review finding.

Verification surface:
Core type contracts, Core runtime tests, the `@platejs/core` declaration build,
45 reviewed package typechecks through `pnpm check:core`, exact production
source searches, and the rendered English Plate Editor API page.

Constraints:
Stay inside CORE-01, CORE-02, CORE-03 and their direct Core consumers. Do not
implement P1/P2/P3 audit rows. Preserve shared checkout work. Add no
compatibility alias, fallback descriptor, callback annotation, or consumer
cast to hide an owner generic defect. Do not stage, commit, push, or message
another task.

Boundaries:
Plate owns plugin composition and typed portals; Plite remains the editor
substrate. Deliberate universal external boundaries may retain `any` where
arbitrary document, extension, or React component variance requires it. The P0
packet owns erased plugin config/context types, plugin builders/conversion,
compiled plugin lookup, direct Core runtime adapters, focused tests, API docs,
and the Core patch changeset.

Blocked condition:
Block only if an exact P0 contract cannot be expressed without a new Plite
public contract, or if its focused type/runtime proof remains red after the
owning Core correction. Independent shared-tree failures are recorded with
their exact owner and do not authorize unrelated edits.

Start Gates:

| Gate | Applies | Evidence |
| --- | --- | --- |
| Exact request | yes | User requested all P0 rows from the frozen v18 audit |
| Scope | yes | CORE-01, CORE-02, CORE-03 plus direct Core consumers only |
| Release artifact | yes | Existing `auto-main-to-next-sync-platejs-core.md` patch changeset updated |
| Browser | yes | English Plate Editor API route is runnable |
| Package sync | no | Named Core contract packet, not package colocation sync |

Work Checklist:

- [x] Replace erased plugin config/context contracts with structured or unknown runtime boundaries.
- [x] Preserve exact dependency, API, read, update, state, and selector inference.
- [x] Add compile-only positive and negative access contracts.
- [x] Repair Base, Plate, and conversion builder implementations at their owner.
- [x] Remove production builder/configure consumer casts in the active scope.
- [x] Require standalone plugin lookup to return an installed compiled descriptor.
- [x] Prove present, absent, and disabled standalone plugin lookup behavior.
- [x] Expose and document the typed portal `installed` discriminator.
- [x] Sweep equivalent production patterns after every correction.
- [x] Run focused tests, Core package proof, declaration build, lint, and browser proof.
- [x] Update the Core changeset and record export/barrel impact.
- [x] Run structured review or record an exact harness blocker plus local source review.
- [x] Record strict shared-gate results and classify non-Core failures.

Phase / pass table:

| Phase | Status | Evidence |
| --- | --- | --- |
| CORE-01 | complete | Structured erasure boundary and exact compile-only capability contracts |
| CORE-02 | complete | Unknown runtime implementations, owner overloads, zero production consumer casts |
| CORE-03 | complete | Installed-only lookup, typed portal discriminator, three runtime cases |
| Package proof | complete | Core, AI, DnD, and Selection typechecks pass |
| Runtime proof | complete | 132 focused Core tests and full Core package test pass |
| Browser proof | complete | `/docs/api/core/plate-editor` rendered with zero console errors |
| Review | complete | Scoped local source review found no actionable P0 issue |

Completion Gates:

| Gate | Applies | Evidence |
| --- | --- | --- |
| 3 of 3 P0 rows | yes | CORE-01, CORE-02, CORE-03 are implemented and proved |
| Exact type inference | yes | `plugin-erasure-contracts.ts` covers dependency, API, read, update, state, selector, negative access, and `installed` |
| Runtime lookup | yes | Resolver tests cover installed, absent, and disabled descriptors |
| Production source sweep | yes | Four exact searches returned zero production matches |
| Package tests/build | yes | Core test, focused tests, typecheck, and declaration build exit zero |
| Shared Core gate | yes | All 45 reviewed package typechecks pass; later independent Plite React contract errors are classified below |
| Browser | yes | English API route returned 200 and rendered current semantics |
| Changeset | yes | `@platejs/core` patch prose records exact inference and installed-only lookup |
| Barrels | no | No public file move or export entry changed |
| Structured helper | yes | Helper invocation was attempted; its 1,202,596-character shared-tree bundle exceeded the 1,048,576-character engine cap before review; scoped local review completed cleanly |

Review matrix:

| ID | Finding | Repair | Proof |
| --- | --- | --- | --- |
| CORE-01 | `AnyPluginConfig` and plugin contexts erased package capabilities through `any` | Stable structured runtime boundary, exact overloads, honest unknown reflection boundaries, declaration contracts | Core/AI/DnD/Selection typechecks and v18 compile-only contract |
| CORE-02 | Builder implementations and direct consumers relied on `any` and casts | Unknown implementations delegate to typed runtime owners; conversion and configure paths use validated reflection | Zero production builder-cast matches, Core build, focused builder tests |
| CORE-03 | `getPlugin` fabricated an uninstalled descriptor | Lookup requires the compiled installed descriptor; optional portal uses `installed` | Present/absent/disabled runtime tests and API docs |

Best Plate v2 recommendation:
Keep exact overloads at the public authoring surface and one validated
`unknown` runtime implementation per builder. Keep optional access on
`editor.plugin(Plugin).installed`; make standalone `getPlugin` strict. Reject
fallback descriptors, compatibility aliases, consumer casts, and callback
annotations.

Gap ledger:
No Plite or Plate API gap blocks this packet. The only retained broad types are
true universal boundaries: arbitrary editor shortcut callbacks, arbitrary
Plite extensions, and unbound React renderer components.

Scoped sweep ledger:

| P0 | Scope | Query/result | Patched | Deferred |
| --- | --- | --- | --- | --- |
| CORE-01 | Core production plugin contexts | `BasePluginContext<any>` or `PlatePluginContext<any>`: 0 final matches | All observed owner/runtime adapter matches | 0 |
| CORE-02 | All package production TypeScript | builder aliases, builder call `as any`, and `.configure as`: 0 final matches | Core owners and direct Core consumers | 0 |
| CORE-03 | Core standalone lookup | fallback factory and nullish `createPlatePlugin` patterns: 0 final matches | `getPlugin`, resolver tests, docs | 0 |
| CORE-02 | Core production implementations | builder implementations with `any` or builder self aliases: 0 final matches | Three builder/conversion owners | 0 |

Extracted-file inventory:
`packages/core/type-tests/plugin-erasure-contracts.ts` is
`justify-new-proof-tooling`: a compile-only contract owned by Core's existing
type-test config. No source file or export was extracted.

Release and export impact:
This changes published `@platejs/core` runtime and type behavior, so the
existing Core patch changeset is updated. There is no registry-only change.
No barrel generation applies because no exported file, export statement, or
public file location changed.

Review findings:
The final local source review accepted no new finding. The strict gate exposed
one P0 regression during iteration: widening the configured plugin key made a
known DnD store look erased. The owner discriminator now keys broad-store
behavior from known state/selector fields, and exact state access is in the
compile-only contract. DnD and Core typechecks pass afterward.

Rejected review expansions:
Independent `@platejs/plite-react` generic editor contract errors do not import
Core and arise after all 45 Core/reviewed package typechecks pass. Editing that
owner would expand this packet outside all three P0 rows. P1/P2/P3 audit rows
remain separate work.

Iteration error ledger:

| Error | Decision |
| --- | --- |
| Raw `unknown` generic defaults broke object constraints | Keep structured object constraints and unknown only at runtime implementation boundaries |
| Widening `PlateEditor` value defaults broke generic component inference | Restore the established value default; it is not plugin erasure |
| Exact universal extension/component types broke legitimate contravariance | Retain `any` only at those explicit external boundaries |
| Read facade treated callable `editor.read` as non-object | Accept object or function before reflective property lookup |
| Key-widened DnD config was misclassified as fully erased | Detect broad stores from absent known state/selector keys |
| Tightened universal shortcut editor broke Selection tuple invariance | Retain `BaseEditor<any, any>` at the published universal callback boundary |
| Structured review helper bundle exceeded engine input cap | Record exact 1,202,596 versus 1,048,576 limit and complete scoped local source review |

Verification evidence:

- `bun test` on seven focused Core plugin files: 132 pass, 0 fail, 314 expectations.
- `pnpm --filter @platejs/core test`: pass.
- `pnpm --filter @platejs/core typecheck`: pass, including declaration contracts.
- `pnpm --filter @platejs/core build`: pass.
- `pnpm --filter @platejs/ai typecheck`: pass.
- `pnpm --filter @platejs/dnd typecheck`: pass.
- `pnpm --filter @platejs/selection typecheck`: pass.
- `pnpm --filter @platejs/core lint:fix`: 297 files checked, no final fixes.
- `pnpm check:core`: runner, declaration, schema, docs, Plite docs, and all 45 reviewed package typechecks pass. The later independent `packages/plite-react/test/generic-react-editor-contract.tsx` contract reports four readonly/literal inference errors.
- Browser: `http://localhost:3000/docs/api/core/plate-editor` returned 200, rendered `installed` plus absent/disabled throw semantics, and logged zero console errors.
- Exact production sweeps: erased contexts 0; builder/configure casts 0; builder implementation `any`/self aliases 0; fallback descriptors 0.
- `git diff --check` on the P0 Core/docs/changeset scope: pass.
- Autoreview command:
  `.agents/skills/autoreview/scripts/autoreview --mode local --prompt "<CORE-01/02/03 scope>" --stream-engine-output`.
  The helper stopped before model review because the shared dirty-tree bundle
  exceeded its engine input limit; the local scoped source review found no
  actionable P0 defect.

Reboot status:
Resume only if a named P0 proof regresses. Start from this plan, rerun the
focused Core type/runtime proof, and do not absorb the independent Plite React
contract work or lower-priority audit rows.

Open risks:
No open P0 contract risk is known. Whole `pnpm check:core` remains red after
the complete 45-package typecheck phase because independent Plite React WIP
widens literal document values in four generic contract assertions. That owner
needs its own task; it does not invalidate the Core P0 proof.

Final handoff:
All three P0 audit rows are repaired. Exact plugin capabilities survive
construction and runtime publication, builders infer without production
consumer casts, and standalone lookup cannot fabricate an absent descriptor.
The Core package proof, declaration build, focused runtime suite, source
sweeps, docs browser route, changeset, and local review are complete.
