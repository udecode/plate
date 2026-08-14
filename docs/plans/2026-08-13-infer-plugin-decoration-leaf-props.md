# Infer plugin renderer payloads

Objective:
Infer plugin-owned schema and transient decoration fields in live and static
renderers, then remove consumer `Reflect.get`, casts, structural mirrors, and
manual definition extraction used only to recover those fields.

Completion threshold:
- Base and Plate descriptors preserve each decorator's exact payload.
- Descriptor leaf props expose transient decoration fields only on `leaf`.
- Wrapper and selector consumers pass the plugin descriptor directly.
- The scoped production audit has zero same-class escapes.
- Focused type and behavior proof passes, with exact repository blockers
  recorded for broader checks.

Verification surface:
- Core compile contracts for live/static leaf props, wrappers, selectors,
  exact plugin APIs, and unknown-field rejection.
- Core renderer, code-block, find-replace, table selector, and registry tests.
- Scoped source audits, Biome, Plate Next doctrine validation, generated skill
  parity, browser attempt, and P2 autoreview attempt.

Constraints:
- No compatibility alias, runtime shim, `any`, callback annotation, local node
  mirror, or persisted schema field added only to satisfy TypeScript.
- Preserve syntax highlighting, DOCX token color mapping, list rendering, and
  table selection behavior.
- Keep runtime-dynamic access inside generic compiler/render engines.

Boundaries:
- In scope: Core plugin/decorator and renderer inference, descriptor-aware
  wrapper/selector APIs, affected package and registry consumers, doctrine,
  release prose, tests, and proof.
- Out of scope: dynamic schema-key access in AI/suggestion algorithms,
  migration readers for legacy persisted keys, DOM casts, browser harnesses,
  and unrelated shared-checkout type errors.
- Plite's range and leaf-merge runtime remains unchanged.

Blocked condition:
Stop only if three owner designs all cause recursive type expansion or if a
required external proof surface remains unavailable after focused alternatives
are exhausted. The accepted compact public-definition carrier passed without
the prior TS2590 regression.

Plate Plan state:
- status: done
- phase: complete
- next: none
- handoff: prepared

Start Gates:
| Gate | Applies | Evidence |
| --- | --- | --- |
| Prompt requirements captured | yes | Full same-class sweep and owner fix recorded above |
| Current owners read | yes | Plugin definition/compiler, leaf props, wrappers, selector store, and consumers inspected |
| Best API target resolved | yes | The plugin descriptor is the sole consumer type owner |
| Release artifact path selected | yes | Existing Core major changeset updated |
| Barrel impact resolved | yes | No exported files moved or added; no barrel generation needed |
| Agent-native path resolved | yes | Source rules changed, generated mirrors produced by `pnpm install` |
| Browser route selected | yes | Standalone code-block demo route |

Work Checklist:
- [x] Preserve exact decorator payload through Base and Plate authoring stages.
- [x] Infer transient decoration fields on live and static leaf props.
- [x] Infer wrapper element/context from `typeof Plugin` directly.
- [x] Infer element-selector state from the passed plugin descriptor.
- [x] Remove scoped consumer `Reflect.get`, casts, mirrors, and `DefinitionOf` extraction.
- [x] Preserve generic runtime boundaries whose property keys are dynamic.
- [x] Add positive and negative compile contracts.
- [x] Run focused runtime, formatting, doctrine, skill-sync, and zero-match proof.
- [x] Attempt browser and P2 review, recording exact infrastructure blockers.
- [x] Prepare final handoff with remaining unrelated risks.

Completion Gates:
| Gate | Applies | Required action | Evidence |
| --- | --- | --- | --- |
| Binary readiness | yes | Resolve target call shapes | Direct descriptor contracts accepted |
| Fresh source evidence | yes | Re-audit current checkout | Four scoped `rg` audits return zero matches |
| Best API review | yes | Resolve P0/P1 shape risks | Compact public `DefinitionOf` carrier avoids internal recursive expansion |
| Verification recorded | yes | Record exact commands/results | Verification evidence below |
| Handoff prepared | yes | State changes, proof, blockers | This plan and final response |
| P2 autoreview | yes | Run scoped P2 review | Three attempts documented; helper blocked by oversized untracked input, shared-tree mutation, then idle reviewer |
| Goal plan complete | yes | Run checker | Checker passes after this record |
| Public API / package boundary proof | yes | Audit Core exports and consumers | Existing exported aliases changed in place; no new export file |
| Release artifact classification | yes | Update published Core release prose | `.changeset/plugin-portal-scoped-api.md` updated |
| Package typecheck/build/test | yes | Run focused checks | Isolated contracts and 138 focused tests pass; broad typecheck blocker recorded below |
| Barrel/export generation | no | Explain | No public file/export topology changed |
| Agent source / generated sync | yes | Regenerate mirrors | `pnpm install`; Plate Next v70 validation passes |
| Agent action discoverability | yes | Audit source and mirror | Best API and Plate Next both expose direct-descriptor rule |
| Agent-native review | yes | Verify route/source/mirror/proof | Rule owner, generated skill, type contract, and zero audit align |
| Browser interaction proof | yes | Open standalone demo | Route fails before mount on unrelated missing generated registry import |
| Browser console/network check | yes | Record route failure | HTTP 500 from missing `@/registry/components/editor/plate-types.ts` import |
| Browser final proof artifact | yes | Record exact caveat | No component screenshot is possible because route never mounts |

Phase / pass table:
| Phase | Status | Evidence | Next |
| --- | --- | --- | --- |
| Ground | complete | Owners and same-class consumer graph audited | Decide |
| Decide | complete | Direct descriptor inference accepted; recursive internal lookup rejected | Prove |
| Prove and hand off | complete | Focused contracts/tests/audits pass; external blockers recorded | None |

Decision brief:
- Descriptor authoring owns persisted schema fields and transient decorator
  fields. Renderer consumers should never reconstruct either contract.
- `RenderNodeWrapper<typeof FooPlugin>`,
  `RenderStaticNodeWrapper<typeof BaseFooPlugin>`, and
  `useElementSelector(FooPlugin, selector)` are the final public shapes.
- The rejected design used `InternalPluginDefinitionOf` inside wrapper aliases;
  it expanded the full graph and produced TS2590 in `withPlite`. The accepted
  public `DefinitionOf` carrier is shallow and passed the exact same contracts.
- Generic renderer engines retain record casts because their keys genuinely
  arrive at runtime; deleting those casts would be dishonest typing.

Verification evidence:
- `pnpm exec tsc -p .tmp/core-renderer-contract-tsconfig.json --pretty false`:
  pass for decorator, live/static leaf, wrapper, selector, API, and negative
  contracts. Temporary config removed.
- Focused consumer TypeScript audit: no changed-file error and no
  `withPlite.ts` TS2590. The remaining errors are pre-existing owners in
  Plite React, List, Suggestion, Table, and one table-node depth site.
- Core renderer and selector tests: 49/49 pass.
- Code-block tests: 64/64 pass.
- Find-replace and table selector tests: 21/21 pass.
- Registry code-block tests: 4/4 pass.
- Three registry suites cannot load because Bun reports missing `platejs`
  exports that exist in source; reinstall did not repair that local resolver
  failure.
- `pnpm turbo typecheck --filter=./packages/core` reaches Core and stops on the
  unrelated `packages/plite-react/src/plugin/with-react.ts:178` TS2352.
- Targeted Biome: 35 files checked, then final owner files rechecked.
- Zero-match audits: no scoped renderer `Reflect.get`, node/leaf cast, wrapper
  `DefinitionOf`, or selector `{ name }` call remains.
- `pnpm install` regenerated skills. `version.mjs validate` reports Plate Next
  v70 valid with 42 active and one retired package; doctrine fingerprint is
  `sha256:aa7e87deba98a5ce9f7eb8d15ce823a1d037bf8ae357a975f55d95f12fea4dcb`.
- Browser route `/blocks/code-block-demo` returns 500 before component mount
  because generated `apps/www/src/__registry__/index.tsx` imports the missing
  registry `plate-types.ts` file.
- P2 autoreview was attempted three ways. Local mode rejected an unrelated
  oversized untracked generated schema; the first scoped run invalidated when
  another task committed the shared tree; immutable/scoped runs stalled in the
  reviewer process. No review verdict is claimed.

Reboot status:
The implementation and deterministic proof are complete. Resume only to repair
the unrelated shared resolver/browser/typecheck infrastructure, not this API.

Open risks:
- Full repository typecheck and browser rendering remain unavailable because
  of the exact unrelated blockers above.
- The shared checkout was committed by another task during proof; the current
  source was re-audited after that commit.
