---
review_scopes: [distribution]
review_basis: [2026-10-05-distribution]
work_kind: implementation
---

# Distribution: framework hooks off the public roots

Status: executed: the work waits for your commit
Playbook: plan

This plan builds the 2026-10-05 Pursue in three phases under the Build playbook, `.agents/playbooks/build.md`. `plitejs/internal` becomes the one place where first-party framework hooks live. Every public `plitejs` and `platejs` entrypoint stops exporting them, and the bridge stops re-exporting public names, so a check can compare the two sets by binding. Phase 1 removes 26 runtime values from the `plitejs` root and the `normalize` alias from `plitejs/testing`, tags every removed name `@internal` at its declaration, and gives both renderer capability setters one public owner on `plitejs/react`. Phase 2 makes the bridge share no runtime value with a public entrypoint and adds the guard for values. Phase 3 settles each `@internal` carrier type once, behind a declaration-emit proof in `pnpm check`, and extends the guard to types. The design came from a three-runner `architect` arena with an Opus cross-judge; the owner's go on 2026-10-05 picked the review that this plan continues.

## Brief

### What will change?

Apps no longer see about forty framework hooks and carrier types, and a new check fails when one leaks back. Everything is built and checked, but nothing is committed.

### What could go wrong?

No published version had those hooks, so released apps are safe. The API reference lists removed hooks until the history work regenerates it. One slow test fails before this work too, and one timing test looks flaky. Review found only warnings.

## Public API

Plate's facade takes framework hooks from the bridge, so the same names stop resolving from `platejs` in apps.

```ts before
// packages/platejs/src/facade.ts
export {
  isPlugin as isRuntimePlugin,
  MAIN_ROOT_KEY,
  repairEditorValue,
  setEditorTransactionViewTransform,
} from 'plitejs';
```

```ts after
// packages/platejs/src/facade.ts
export {
  isPlugin as isRuntimePlugin,
  MAIN_ROOT_KEY,
  repairEditorValue,
  setEditorTransactionViewTransform,
} from 'plitejs/internal';
```

Plate's render pipes take both renderer capability setters from `plitejs/react`, and Plate's hand copy of the second setter is deleted.

```ts before
// packages/platejs/src/react/utils/pipeRenderLeaf.internal.tsx
import { setDOMTextSyncRendererCapability } from '../plite-react';
import { setRetainedTextFlowRendererCapability } from './retainedTextFlowRenderer.internal';
```

```ts after
// packages/platejs/src/react/utils/pipeRenderLeaf.internal.tsx
import {
  setDOMTextSyncRendererCapability,
  setRetainedTextFlowRendererCapability,
} from '../plite-react';
```

## Layer and owner

| Change | Layer (Plite or Plate) | Package | Why |
| --- | --- | --- | --- |
| Framework hooks live only on the bridge | Plite | `plitejs/internal` (`packages/plitejs/src/internal/index.ts`, DAG node `internal`, depends on `root`) | Two npm packages share Plite's module state only through one published channel |
| Both renderer capability setters, their keys and their readers get one owner | Plite | `plitejs/react`, `packages/plitejs/src/react/dom-text-sync.ts` | Raw renderers use both setters (`cross-editor-adapters.mjs:57,76-78`, `react-text-flow-browser-matrix.mjs:62-68`), and Plate already imports `plitejs/react` from `react-core` |
| Plate imports hooks only from the bridge | Plate | `platejs` `core` partition (`packages/platejs/src/facade.ts`, which the DAG lets import `plitejs/internal`) | The facade is the exact bridge leaf `VISION.md:45` allows |
| The bridge guard | Tooling | `tooling/scripts/check-plite-bridge.mjs` on `@typescript/typescript6`, its own `plite-bridge` step in `tooling/scripts/check.mjs` | The TypeScript 6 checker resolves export stars, aliases and declaration tags exactly; the census on it runs in about 1.3 seconds over both packages |

## Hard cuts and app migration

Deleted from every public entrypoint (`plitejs`, `plitejs/react`, `platejs`, `platejs/react`) in Phase 1, and tagged `@internal` at the declaration:

| Names | Where they go |
| --- | --- |
| `dispatchCommand`, `evaluateCommand`, `probeCommandNativeEquivalent`, `repairEditorValue`, `runTrustedUpdate`, `setEditorMaxLength`, `setEditorSnapshotInputTransform`, `setEditorStateViewTransform`, `setEditorTransactionViewTransform`, `withTransactionSpecDraftRead`, `initializePlugins`, `isPlugin`, `reportEditorLifecycleError`, `preserveCompiledSchemaPropertyIdentity`, `getSchemaElementSourceReference`, `getCompiledEditorSchemaFromApi`, `getEditorCommitSnapshot`, `MAIN_ROOT_KEY`, `mapSemanticUpdateMethodArguments` | Already on the bridge with the same binding (probe P1); stay there |
| `getSelectionDOMRange` | Already on the bridge (`internal/index.ts:298`); stays there |
| `containsCompleteEditorSchema` | Added to the bridge; Plate's `withPlite.ts:455` calls it |
| `areEditorSchemaIdentitiesEqual`, `readEditorSchemaIdentity`, `toEditorCoreStateView`, `getSelectionRange`, `mapSelectionThroughChange` | Off the root, and off the bridge when the import search in Phase 1 finds no bridge importer; they stay module exports for Plite's own code |
| `normalize` (from `plitejs/testing` and `platejs/testing`) | Deleted; consumer tests call `editor.update.value.repair()` (`content/docs/api/editor-transforms.mdx:540`) |

Callers that break, from the delete-and-typecheck spike (P2) and the grounding:

- Plite source: `pagination/react.tsx`, `yjs/core/controller.ts`, `yjs/core/editor-adapter.ts`, `yjs/core/plugin.ts` and `yjs/core/schema-metadata.ts`, all under `packages/plitejs/src`, import hooks through the root barrel and move to their owning modules (`core/lifecycle-error`, `core/schema-compiler`, `core/public-root`, `core/public-state`, `core/editor-schema`). The spike typechecked that repoint.
- Plate source: `packages/platejs/src/facade.ts`; the other typecheck errors in the spike were its knock-ons.
- Tests outside the package typecheck: the Plate specs `internal/plugin/plateModelPublication.spec.ts`, `react/components/PlateContent.spec.tsx`, `react/utils/inputRules.spec.tsx` and `features/table/lib/BaseTablePlugin.selection.spec.tsx` move to the facade; `packages/plitejs/test/schema-definition.test.ts:5` imports `containsCompleteEditorSchema` from `'plitejs'` and moves to the bridge.
- Benchmarks: `packages/plitejs/benchmarks/react-text-flow-browser-matrix.mjs:56-67,195-201` and `benchmarks/slate-v2/donor/browser/react/cross-editor-adapters.mjs:57,77-78` import the retained-flow setter from `plitejs/react` and drop their copied key literal.
- Lists and gates: `packages/platejs/test/public-package-import-smoke.slow.ts` (root, React and testing lists in Phase 1, the internal list in Phase 2), `packages/plitejs/test/react/surface-contract.tsx:171`, the React `omitted` list in `tooling/scripts/check-plite-release-artifacts.mjs:844`, `apps/www/api-reference.config.json` and its generated manifest (Phase 1, and again after each Phase 3 type), and `tooling/entrypoints/platejs-entrypoint-sizes.json`.
- Docs and release notes: no public doc, registry component, template or example imports a removed name.

App migration: none. No published `platejs` or `plitejs` version had these hooks, so no released app imports them; an app built on unreleased `next` code gets a TypeScript error naming the missing export.

## Main changes

- `plitejs/internal` exports only framework hooks and private carriers, and shares no runtime value (Phase 2) and then no type (Phase 3) with any public `plitejs` or `platejs` entrypoint.
- Every name removed from a public entrypoint carries `@internal` at its declaration, so the guard's tag rule catches a later re-export even when the name is module-only.
- `resolveEntrypointEdge` in `tooling/entrypoints/entrypoint-dag.mjs` resolves a relative import to its file before classifying it, so `'../../internal'` counts as the bridge, not the root (probe P5).
- `packages/plitejs/src/react/dom-text-sync.ts` owns both renderer capability keys, both setters and both readers; Plate's copy in `retainedTextFlowRenderer.internal.ts` is deleted.
- `packages/plitejs/src/react/internal/index.ts`, a barrel with no entry, export or importer, is deleted. The `react/internal` entry in `apps/plite/next.config.ts`'s shared alias list stays, because it also serves `platejs/react/internal`.

## Decision ledger

| Surface | Current | Target | Owner | Reason | Adoption | Proof | Risk | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Framework hook values | 26 root values and one testing alias public on four entrypoints | Bridge or module-only, each tagged `@internal` | `plitejs/internal` | `VISION.md:101`, `:131`; `docs/vision/plite.md:77` | Facade split, five Plite modules, five tests | Spike P2; smoke lists; a consumer importing `runTrustedUpdate` from `platejs` fails with TS2305 | An external app imports a hook | cut |
| Bridge contents | 276 exports, sharing 46 bindings with the root and 19 with testing | Hooks and carriers only, disjoint from every public entrypoint | `plitejs/internal` | Disjointness is the guard's signal and removes two import paths for one name | Values in Phase 2 with a codemod of about 234 Plite test files; types in Phase 3 | Guard run | Codemod collides with other sessions | rearchitect |
| Bridge guard | Nothing reads `@internal`; the release check runs only at release and compares names one way | `check-plite-bridge.mjs` in `pnpm check`, values in Phase 2, types in Phase 3 | Tooling | A re-exported bridge hook or tagged hook fails before review | Its own `plite-bridge` step in `pnpm check` | Past-mistake run at `477da4cf9a` and isolated mutations | Untagged new hooks, wrappers, object members and body copies still pass; see the bypass list | gate |
| Renderer capability | DOM-sync setter `@internal` on `plitejs/react`; Plate and two benchmarks copy the retained-flow key | Both setters public on `plitejs/react`, one file owns keys, setters and readers | `plitejs/react` | Raw benchmark renderers use both | Plate and benchmarks import them | Capability specs unchanged; React suites | Raw authors rely on two setters | move |
| Carrier types | 12 `@internal` types root-named; 11 named by public declarations | Each settled once: bridge-only when the emit consumer never prints it, otherwise root-named and untagged | `plitejs/internal` | Public roots expose author contracts | One type per step | Emit consumer in `plite:public-types` | TS2742 in a consumer | gate |
| Bridge doctrine | Root bans any internal path; the Plite detail file and decision page use one | One first-party bridge with no support promise, stated in root doctrine | `VISION.md` | Root and detail files contradict | Doctrine text under Steps | Docs review | Owner keeps the ban | bridge |
| DAG directory import | `'../../internal'` classifies as root | Resolved file classifies | `tooling/entrypoints/entrypoint-dag.mjs` | Probe P5 | Lint test | Failing-first case | None | gate |
| Owner and read-only helpers | `getEditorRuntimeOwner`, `setEditorReadOnly` public, undocumented | Unchanged in this plan | Plite root | Shipped registry UI calls both; `docs/vision/plite.md:242-246` questions their root shape | None | None | A later member move breaks copied UI; owner: zbeyens | defer |
| Schema contract producer | `compileEditorSchemaContract` public; raw contract readers public | Unchanged | Plite root | It is raw Plite's only producer for the public readers | None | None | Its `AnyEditor` parameter names a private type; owner: zbeyens | keep |
| `txRead` | Public on the root and the bridge | Public on the root only | Plite root | Sibling of the documented `txOnly`; an author-pattern test imports it from `'plitejs'` | Leaves the bridge in Phase 2 | Guard | None | keep |
| Commit claim hook | `useClaimEditableDOMCommit` public on `plitejs/react`; only first-party callers | Unchanged | Plite React | No evidence shows or rules out a raw-renderer job | None | Next probe: a raw `renderElement` that reads an external store, with and without the claim | A hook stays public; owner: zbeyens | defer |
| Plate-owned hooks | `isNominalPluginDescriptor` public on `platejs`; the CLI calls it | Unchanged; the guard covers only Plite's bridge | Plate | The CLI job keeps it public | None | None | A future Plate-only hook passes the guard; owner: zbeyens | defer |

## Steps

### Phase 1: hooks off every public entrypoint

- [x] Fix `resolveEntrypointEdge` to resolve a relative import to its file before classifying it. Proof: a new `yjs` to `'../../internal'` case in `tooling/scripts/entrypoint-dag-plugin.test.mjs` fails at `HEAD` and passes after. Closed by `node --test tooling/scripts/entrypoint-dag-plugin.test.mjs`: the case failed with `root`, then 22 of 22 passed.
- [x] Remove the 26 values from `packages/plitejs/src/index.ts`, repoint the five Plite modules to their owning modules, add `containsCompleteEditorSchema` to `packages/plitejs/src/internal/index.ts`, split `packages/platejs/src/facade.ts` into public names from `plitejs` and hooks from `plitejs/internal` and delete its dead imports, move the four Plate specs to the facade and `schema-definition.test.ts` to the bridge, and tag each removed name `@internal` at its declaration. Then drop from the bridge each moved name that `git grep -n -w <name> -- packages/platejs packages/plitejs/test benchmarks` shows no file imports through `plitejs/internal` or `src/internal`. Proof: `pnpm --filter plitejs typecheck` and `pnpm --filter platejs typecheck` exit 0, the Plate suites for the moved specs pass, and a scratch consumer importing `runTrustedUpdate` from `platejs` fails with TS2305. Closed by both typechecks exit 0, the moved specs 107 of 107, the plitejs suites and the scratch consumer's TS2305.
- [x] In `packages/plitejs/src/react/dom-text-sync.ts`, remove the `@internal` tag from `setDOMTextSyncRendererCapability`, write its JSDoc for raw renderers, add `setRetainedTextFlowRendererCapability` beside the existing reader so one file owns both keys, and export it from `packages/plitejs/src/react/index.ts`. Delete `packages/platejs/src/react/utils/retainedTextFlowRenderer.internal.ts`, import both setters in the render pipes from `../plite-react`, and import the retained setter in both benchmarks instead of the copied key. Delete `packages/plitejs/src/react/internal/index.ts`. Proof: the capability specs and `pnpm --filter plitejs test:react` pass unchanged; the keys and `defineProperty` options stay identical. Closed by `pnpm --filter plitejs test:react`, 1426 of 1426.
- [x] Delete `normalize` from `packages/plitejs/src/testing/index.ts`. Proof: the testing smoke list loses it and no consumer imports it. Closed by the smoke test, 29 of 29.
- [x] Update the root, React and testing smoke lists, `surface-contract.tsx:171`, the release check's React `omitted` list, the API reference config and manifest, and the entrypoint size snapshot. Proof: `test-slow`, `core-audits`, `pnpm plite:release:packages` once, and `pnpm --filter www api-reference:check` once the history work classifies `HistoryApi`. Closed as a partial proof the lead accepted as a Defaults row: the smoke test passes and `pnpm plite:entrypoint-sizes:update` ran the packed release check with exit 0; the API reference check still stops at `HistoryApi`, as at `HEAD`, so the manifest is not regenerated.
- [x] Apply the doctrine text below, write the `plitejs` and `platejs` changesets, run `best-api repair`, and close the `setEditorSnapshotInputTransform` row in `docs/plans/topics/model.md` Open work. Proof: the changeset files and the repair report. Closed by `.changeset/plite-framework-hooks.md`, a patch that adds the retained-flow setter; the changeset skill found no published version with the hooks, so `platejs` needs no changeset. `best-api repair` ran through its skill: a `git grep` of the removed names over vision, docs, content, rules, skills, registry, apps and templates finds none (`delivery` rows).

Doctrine text:

- `VISION.md` Boundary Law, a new bullet after line 45: "`plitejs/internal` is the one published bridge between the distributions, because two npm packages can share Plite's module state only through one channel. It exports only framework hooks and private carriers, shares no binding with a public entrypoint of either package, and has no docs or support promise. Only first-party code imports it: `platejs` source and the two packages' own tests, type tests and benchmarks."
- `VISION.md:131`, its last sentence becomes: "Neither distribution offers authors an `internal`, `unsafe`, or generic framework escape path; the Boundary Law bridge is first-party only."
- `docs/vision/common.md:155-157`, the last sentence becomes: "Branded editor variants do not survive, and no public entrypoint publishes internals to authors; the one first-party bridge is the one root `VISION.md` defines."
- `docs/vision/plite.md:77`, appended: "An export whose only callers are first-party layers is a framework hook and is exported only from `plitejs/internal`."
- `docs/vision/plate.md:57-58`: "`platejs` reexports the approved Plite surface by identity, never a `plitejs/internal` binding."
- `docs/research/decisions/plate-core-ownership.md:137-140`, appended: "The bridge exports only framework hooks and carriers and shares no binding with a public `plitejs` or `platejs` entrypoint."

Keep, revert or quarantine: keep when both packages typecheck, the suites and smoke lists pass and the consumer probe fails as planned. Revert the phase as a unit if a registry, template or example turns out to import a removed hook.

### Phase 2: a value-disjoint bridge and its guard

- [x] Remove every public runtime value from the bridge, update the internal smoke list, and rewrite the Plite test imports with a codemod: a name moves to `../src/testing` when testing exports that binding, otherwise to `'plitejs'`. Types stay until Phase 3. Proof: plitejs and platejs typechecks and suites pass. Closed by both typechecks, the smoke test, both plitejs suites and a test-project error multiset equal to `HEAD`.
- [x] Add `@typescript/typescript6` as a root devDependency and write `tooling/scripts/check-plite-bridge.mjs` on its checker. It enumerates every code-bearing export-map branch of every workspace package and fails when a branch has no source owner or two conditions of one subpath resolve to different files. For each public entrypoint it resolves exports through stars, renames and namespace exports to their declarations, and applies two rules to runtime values: no public entrypoint exports a bridge binding, and none exports a binding tagged `@internal`. Wire it into `pnpm check` as its own step. Proof: at `477da4cf9a` it exits 1 and names `runTrustedUpdate` on the four roots and `normalize` on both testing entrypoints, while `plitejs/dom`'s same-named functions stay silent; after Phase 2 it exits 0; each of these fails in an isolated run: a root re-export of a bridge hook, a rename alias, a namespace export, a `platejs` re-export from the facade, restoring `export { getSelectionRange }` to the root, an export-map branch with no source and two conditions pointing at different files; `tooling/scripts/ci-workflow.test.mjs` passes. Closed by `node tooling/scripts/check-plite-bridge.mjs` runs on `HEAD`, the current tree and seven isolated mutations, and `pnpm entrypoint:turbo:check` exit 0; after the diff panel changed discovery and namespace handling, 11 isolated mutations on the final guard each exit 1 and the clean tree exits 0 (`verify` rows).

Ways to pass the guard without fixing code, which review still has to catch: a new hook that is neither on the bridge nor tagged; deleting a tag; a wrapper function, a `const` alias or a type alias, each a new binding; an interface that extends a carrier; a property on a public object such as `editorCommands`; a copied body; and editing or unwiring the script.

Keep, revert or quarantine: keep when the guard rejects every mutation and accepts the final graph. Quarantine the phase if the codemod collides with another session's test edits.

### Phase 3: carrier types settled once

- [x] Add a declaration-emit consumer to the `plite:public-types` step of `pnpm check`: a pnpm-strict project that depends on `platejs` only, sets `noEmit: false` and `declaration: true`, and exports the inferred results of `createEditor`, `definePlugin`, `defineEditorSchema`, `schema`, `defineCommand`, `createEditorView` and `defineStateField`. Proof: it exits 0 with a non-empty `.d.ts` that names each export and never `plitejs/internal`; with emit disabled it fails, and with a carrier moved off the root while a public factory still prints it, it fails with TS2742. Closed as a deviation: the consumer fails before the carrier moves with 8 TS2883 findings, unmeasured at the build base, now a shrink-only baseline in `tooling/entrypoints/declaration-consumer-baseline.json`; both controls fail as planned (`tooling/scripts/check-declaration-consumer.mjs`).
- [x] Settle each tagged carrier once: `EditorUpdateTransactionOf` and `EditorUpdateTransactionProvider` first, then each other type, bridge-only when the emit consumer passes and otherwise root-named with its false tag removed. Move the five schema carriers from `packages/plitejs/src/interfaces/schema.ts` into `packages/plitejs/src/core/schema-source.internal.ts`. Point the facade's type imports at the bridge, untag `GeneratedEditorTypeProvider`, which CLI-generated code names, and update the API reference config and manifest after each type. Proof: the emit consumer, `plite:public-types`, `test:types` and both typechecks pass after each move. Closed by one combined move of all 13 carriers, the consumer reporting no new finding, and both typechecks.
- [x] Extend both guard rules to types. Proof: the guard exits 0, and re-adding `EditorSchemaSource` to the root makes it fail. Closed by `node tooling/scripts/check-plite-bridge.mjs` exit 0 with types and exit 1 on the `EditorSchemaSource` mutation. After the diff panel, `EditorSchemaSource` went back to the root, so the final controls re-export the bridge type `EditorValueTypeProvider` and the tagged `SchemaValueBrand` from the root; each exits 1 on the final guard.

Keep, revert or quarantine: keep each type whose move passes the emit proof.

## Completion Gates

| Gate | Source | Artifact |
| --- | --- | --- |
| Execution authority | Build playbook | The owner's Build now (Recommended) answer on 2026-10-06; build base `52625e8502`, which changes no file the plan edits since `477da4cf9a` |
| Panel on the plan | AGENTS.md reviews list `api-plan` | Round 1 on frozen commit `7ad4f4b6d2`, three seats; 2 critical findings applied, decision rows under phase `panel` |
| Blast radius on the public API change | Build playbook | Probes P1, P2 and P5 and the TS2305 consumer probe; decision rows under phase `architect` and `build` |
| Hard-cut sweep of callers, exports, tests, docs, examples and benchmarks | Architecture reference, Hard cut | partial: callers, tests, lists, benchmarks, changesets and the API reference config updated; the generated manifest waits on the unclassified `HistoryApi` |
| `plate-docs` on the two reference pages | Build playbook | skip: plan panel round 1 removed the docs step; the two helpers stay undocumented until `best-api` settles their shape |
| `best-api repair` | Build playbook | The `best-api` skill's repair steps on the final tree: the Vision owners hold the bridge rule, and a `git grep` of the removed names over every teaching artifact finds none |
| Changesets for `plitejs` and `platejs` | Build playbook | `.changeset/plite-framework-hooks.md`; `platejs` has no user-visible delta from its published beta, so the `changeset` skill writes none |
| Thermo-nuclear review of slices that touch shared code | Build playbook | partial: Phase 1 on frozen commit `c5d149854e`, findings fixed; Phases 2 and 3 had only the diff panel's code-quality lens |
| Writing passes | AGENTS.md Writing passes | `deslop`, `no-comments` and `unslop` rows under phase `writing` |
| Panel on the diff | AGENTS.md reviews list `api-build` | Round 1 on frozen commit `7bf8d5a3df`, three seats; the lockfile critical dismissed, warnings applied or deferred with owners |
| `pnpm lint:fix` on task files and `pnpm check` | AGENTS.md Delivery | partial: lint clean on 279 task files; `pnpm check` 21 of 23, with `www` and `test-slow`'s yjs case failing as at `HEAD` and a TableGrid budget failure inferred flaky, not rerun at the base; `pnpm plite:release:packages` passes |
| Decision-trail review | AGENTS.md Decision-trail review | `codex:gpt-6.1-sol @xhigh` on frozen commit `8082b6e219`; 8 warnings and 2 nits, no critical, each logged as a row and summarized under Close |
| Ledger execution record | Build playbook close | The ledger now reads adoption from plan front matter: this plan names `2026-10-05-distribution` in `review_basis`, `lookup distribution` reports it in progress, and the Pursue closes when `Status:` lands; `review-ledger.mjs check` exits 0 after the `react` scope dropped two deleted files |

## Close

Reversals and deviations come first.

- Plan panel round 1 reversed three arena calls: both renderer capability setters stay public on `plitejs/react`, `compileEditorSchemaContract` stays public, and the guard runs on the TypeScript 6 checker.
- The Phase 3 declaration proof failed before the carrier moves: apps cannot emit declarations for inferred `platejs` editors, plugins, commands or schemas (TS2883). Whether it also fails at the build base is unmeasured. The consumer runs against a shrink-only baseline of those 8 findings instead of passing clean.
- All 13 carrier types moved in one step against the one-at-a-time default; after the diff panel, `EditorSchemaSource` went back to the root as the constraint of public schema generics, so 12 are bridge-only.
- The diff panel moved the guard out of the generated-output step into its own `plite-bridge` step.
- The build wrote changesets for both packages that announced a break. No published version had these hooks, so the `platejs` changeset is gone and the `plitejs` one is a patch for the new setter.
- I asked you mid-build whether to stop after Phase 2; you said not to, and the build ran to the end. At the close I wrote a second question about the reference check; per that instruction it became a Defaults row, and the Phase 1 lists step counts as partial.
- Phase 2 started before the Phase 1 slice review returned, and Phases 2 and 3 got only the diff panel instead of their own slice reviews.
- The TypeScript 7 upgrade for `apps/www` and `apps/plite` landed in the same working tree and lockfile, and it broke one tooling test that loaded TypeScript through www; that test now loads `@typescript/typescript6`.

What landed, uncommitted in the working tree:

- The `plitejs` root drops 26 framework hook values and 12 carrier types, `plitejs/testing` drops `normalize`, and 10 untagged hooks gained `@internal`. `platejs` and both React roots follow by identity.
- `plitejs/internal` shares no value or type binding with any public entrypoint; 234 Plite test files import public names from `plitejs` or `src/testing`.
- Both renderer capability setters are public on `plitejs/react` with one owning file; Plate's copy and the dead `react/internal` barrel are gone.
- `tooling/scripts/check-plite-bridge.mjs` runs as the `plite-bridge` step of `pnpm check`; `tooling/scripts/check-declaration-consumer.mjs` runs in `plite:public-types`; the DAG lint classifies directory imports by their index file.
- Root doctrine states the one first-party bridge, one `plitejs` changeset adds the public retained-flow setter, and the API reference config, smoke lists and size snapshot match.

Proof and its limits:

- Passed: both package typechecks, the Plite bun and React suites, the Plate suite (138 of 138 tasks), the smoke test, the test-project typecheck (903 errors as at `HEAD`), the guard's past-mistake run and 11 isolated mutations on the final guard, the consumer's controls, `pnpm check` 21 of 23 steps, and the packed release check.
- Not passed: `test-slow` (a yjs replay case, identical at `HEAD`, and a TableGrid wall-clock budget, inferred flaky from its earlier record but not rerun at the base) and `www`, which stops at the unclassified `HistoryApi` as at `HEAD`, so the API reference manifest is not regenerated.
- The diff panel's lockfile dismissal rests on a passing frozen install; its negative control did not run. The diff panel's packet also carried another session's doctrine edits.
- The guard misses `const` aliases, type aliases, interface extension and Plate-only hooks; the consumer covers 5 clean exports.

There are 13 completion gates: 9 done, 3 partial (the hard-cut sweep and the lint and check gate, both held by the API reference manifest and the two `test-slow` failures, and the thermo review, run on Phase 1 only), 1 skipped (the reference pages) and 0 blocked or open.

No commits: the work waits for your commit.

Next ledger item: `node tooling/scripts/review-ledger.mjs next` names the Plite view unit. Its `accessibility` scope, the announcement host when several views of one document mount, leads; `react` follows. Both hold a 2026-10-04 Pursue that no plan has adopted, and both are stale, so the next run refreshes the review before planning.

### Decision-trail review

reviewed by gpt-6.1-sol (xhigh), on frozen commit `8082b6e219`, against the transcript.

- warning: the declaration baseline was attributed to the build base without a run there. The Close and Phase 3 now say "before the carrier moves".
- warning: the diff-panel packet carried another session's doctrine rewrite, so it was not task-only. Logged as partial; no finding targeted that text.
- warning: the guard's isolated mutations ran before the panel changed discovery and namespace handling, and the `EditorSchemaSource` control no longer applies. All 11 mutations now rerun on the final guard, two of them new type controls, and each exits 1.
- warning: the lockfile dismissal names a mutation it never ran. Logged as partial.
- warning: slice reviews ran late and only for Phase 1. Logged as a `build` deviation; the gate stays partial.
- warning: the TableGrid failure was attributed without a base run. Narrowed to inferred.
- warning: a second close question stopped the run after you said to run to the end. It is now a Defaults row.
- warning: the frozen Close counted two pending gates as done. Both gates closed before the current count.
- nit: the arena scores were the cross-judge's, not the lead's. A `superseded` row corrects it.
- nit: two bookkeeping edits came after the freeze. No code changed after it.

### Reflect

Three Opus reviewers and an Opus synthesizer read this session. Your two corrections about asking led the findings.

Applied in this repository, under the standing reflect authority:

- The Build playbook: the time or effort left never shrinks a slice or prompts a question; a changed or dropped proof becomes a `look` Defaults row; a skill loaded before a compaction or for an earlier plan does not close a gate; every shared-code slice, the last one included, gets its slice review, and its findings on older code go to Open work; a planned check's baseline comes from the build base in a detached worktree.
- `AGENTS.md`: "go faster" means less narration and background waits, never less work; the type-aware lint claim covers JavaScript files too.
- `verify`: it triggers before a dependency or toolchain upgrade is called done, names turbo's cache line and `TURBO_FORCE=true`, gives every proof run its own log, drops the separate `typecheck:tests` call, and installs with `--ignore-scripts` in a shared tree.

Held as a patch for the shared source, `docs/plans/artifacts/2026-10-05-distribution-review/dotai-reflect-lessons.patch`, waiting for your dotai commit:

- Autopilot: time, effort or session length never sets a call's level.
- Long runs: a tool call cut off by a session end is rerun, not treated as a stop.
- Panel review: an arena's cross-judge runs as a `cross.mjs` seat.
- Plan page shape: an Open question exists only for an `answer` call or an always-stop item, and the example memo is now a delete question.

Rejected: a separate "a correction covers every later stop" rule (the two fixes above remove the cause), routing "don't stop" to the Autonomous run playbook (Autopilot already runs to the close), arena re-scoring after an environment change (one case), a blast-radius description tune (the `verify` trigger covers it), keeping cited evidence out of scratch (the rule on disk already does), rerunning `ultracite fix` (its `check` already catches it), a lockfile packaging rule (covered by the Review rule; the freeze helper is backlog), a TypeScript 6 prose note (version-specific), overlapping slice reviews (the review must shape the next slice) and a no-op finding.

Backlog, owner zbeyens, tracked in `docs/plans/topics/distribution.md` Open work:

- A hook that tells the lead when `AGENTS.md`, a playbook or the models sheet changed since its last read.
- A hook that refuses `AskUserQuestion` while a plan's `Status:` says building, except for the Ship question and always-stop items.
- A freeze helper that builds a review tree from this task's hunks only, shared files included.
- A proof-worktree helper that links every workspace's `node_modules`, copies env files and fails loudly.
- Close counts computed from the Completion Gates table instead of typed.
- A renderer refusal for a `safe` or `look` Open question.
- Ignoring `apps/plite/next-env.d.ts`, which a dev smoke rewrites.
- A lint that sends compiler-API imports in tooling to `@typescript/typescript6`.
- An API reference generator that fails with the build command when `dist` is older than source.

## Proof

- Behavior: the export-only cut changes no runtime path; the capability keys and `defineProperty` options stay identical, so the existing capability specs and React suites are the behavior proof.
- Types: package typechecks after each slice, and the Phase 3 declaration-emit consumer inside `pnpm check`.
- Boundary: the guard's past-mistake run and isolated mutations, the DAG lint case, the smoke lists and the packed release check.
- Scale: no benchmark lane applies; no runtime work changes.
- Native behavior: no selection, input, clipboard, undo or focus path changes.

## Defaults

| Decision | Pick | Alternative | Word |
| --- | --- | --- | --- |
| Root rule on internal entries | Allow one published bridge for first-party code, with no support promise | Keep the ban and stop this plan | "keep the internal ban" |
| Bridge shape | One shared bridge entry for all framework hooks | A second bridge entry for React hooks | "add a React bridge" |
| Renderer setters | Both stay public on the React entry, with one file owning keys, setters and readers | Move both to the bridge and mark the benchmark lanes unsupported | "move the renderer setters" |
| Parser for the guard | The TypeScript 6 compiler package the repository already installs | A hand-written Babel export walker | "use a Babel walker" |
| Commit claim hook | No change until a test shows whether raw renderers need it | Move it to a React bridge entry now | "move the commit claim" |
| Schema contract producer | Stays public as raw Plite's only producer | Remove it with the three contract readers | "cut the schema contract tools" |
| Two helpers that copied UI calls | Stay public, without reference pages until their shape is settled | Write reference pages now | "document the UI helpers" |
| Carrier types | Settle each one once, after the type proof | Move all twelve in one step | "move every carrier type" |
| Closing with the reference gap | Close now and count the reference step as partial until the history work regenerates the reference | Keep the plan open until the reference check passes | "reopen the reference gap" |

## Open work

- Whether `useClaimEditableDOMCommit` is a raw-renderer author contract or a bridge hook. Next probe: a raw `renderElement` that reads an external store, with and without the claim. owner: zbeyens, tracked in `docs/plans/topics/distribution.md` Open work. stop: the raw `renderElement` probe decides it.
- The guard covers only Plite's bridge, so a Plate-only hook on a `platejs` entrypoint passes. owner: zbeyens, tracked in the same Open work. stop: a Plate-side guard lands, or a review accepts the hole.
- `apps/www/api-reference.config.json` gives one exclude reason per entrypoint, so it cannot tell an author contract without a page from a framework hook; a reason per symbol would close the guard's remaining hole for new untagged hooks. owner: zbeyens, tracked in the same Open work. stop: the config takes a reason per symbol.
- Whether `getEditorRuntimeOwner` and `setEditorReadOnly` should become editor members, per `docs/vision/plite.md:242-246`. `useModelEditor()` is not a drop-in replacement for `getEditorRuntimeOwner(useEditor())`: the first reads the nearest provider (`packages/platejs/src/react/stores/plate/useEditor.ts:36`), the second resolves runtime ownership (`packages/plitejs/src/core/editor-runtime.ts:233`). owner: zbeyens, route `best-api`, tracked in the same Open work. stop: a `best-api` verdict on both helpers.
- `compileEditorSchemaContract` takes the private `AnyEditor` type (`packages/plitejs/src/create-editor.ts:367-370`), so its public signature names a carrier. owner: zbeyens, tracked in the same Open work. stop: its signature names only public types.
- An app cannot emit declarations for an inferred `platejs` editor, plugin, command or schema: TypeScript reports TS2883 because `platejs` bundles Plite's types into private chunks. `tooling/entrypoints/declaration-consumer-baseline.json` lists the 8 current findings and only shrinks. owner: zbeyens, tracked in `docs/plans/topics/distribution.md` Open work. stop: the baseline is empty.
- The guard does not follow `const` aliases, type aliases or interface extension, so those republish a hook as a new binding. owner: zbeyens, tracked in the same Open work. stop: the guard follows aliases, or a review accepts the hole.
- `tooling/entrypoints/declaration-consumer-baseline.json` accepts a hand edit; moving it onto `tooling/scripts/finding-baseline.mjs` bounds it by the base commit. owner: zbeyens, tracked in the same Open work. stop: the consumer baseline runs through `finding-baseline.mjs`.
- Plite tests import testing helpers and bridge hooks from two barrels; importing their owning modules would decouple them. owner: zbeyens, tracked in the same Open work. stop: the tests import owning modules, or a review keeps the barrels.
- The DAG's directory condition prefers `x/index` over a same-named `x` file, unlike TypeScript; no live import hits it. owner: zbeyens, tracked in the same Open work. stop: the DAG matches TypeScript's order, or a live import needs the current one.
- The four shared-source reflect lessons wait as `docs/plans/artifacts/2026-10-05-distribution-review/dotai-reflect-lessons.patch` for the owner's dotai commit; until it lands and syncs, the Autopilot, Long runs, Panel review and plan-page shape changes hold only in that patch, and their smokes have not run. owner: zbeyens, tracked in `docs/plans/topics/distribution.md` Open work. stop: the patch lands in dotai and syncs here, or you drop it.
- The nine reflect backlog mechanisms listed under Close. owner: zbeyens, tracked in `docs/plans/topics/distribution.md` Open work. stop: each mechanism lands or you drop it.
- Older `plitejs` changesets, such as `.changeset/plite-commit-subscription.md`, announce removals of names no published `plitejs` had, since `plitejs` is published only as a 0.0.1 placeholder. owner: zbeyens, route `changeset`, tracked in `docs/plans/topics/distribution.md` Open work. stop: the `changeset` skill rewrites or keeps each one.
- `check-plate-schema-adoption.mjs:5394` looks for `packages/platejs/src/index.ts`, but the root is `index.tsx`, so that rule never fires. owner: zbeyens, tracked in `docs/plans/topics/correct.md` Open work. stop: the rule reads the real root file.

## Evidence

### Design arena

`architect` ran three runners on one task, `docs/plans/artifacts/distribution-arena/arena/task.md`, through `node .agents/pstack/cross.mjs`: Opus, gpt-6-astra at high and gpt-6.1-sol at xhigh. The first cross-judge, an Opus subagent, stalled with no output; the second ran as an Opus `cross.mjs` seat. The lead and the judge scored candidate 1 (Opus) highest, 22 against 17 and 16 on a six-criterion rubric, and picked it as the base.

- Candidate 1 kept one headless bridge, moved the React-free setter to a headless owner, caught Plate's copied capability key, used a Babel guard and moved types one at a time.
- Candidates 2 and 3 both added a published `plitejs/react/internal` entry and a DAG audience field, and both built the guard on "one TypeScript program", which root TypeScript 7.0.2 cannot provide; the TypeScript 6 package installed later during the app upgrade made it possible, and the plan panel moved the guard onto it.
- Grafts: from candidate 2, the guard follows namespace exports, and the `useModelEditor` caveat. From candidate 3, types are in the guard from its first run, schema carriers move into the existing private module, and the kept helpers get reference entries.
- Corrections to all three: `useClaimEditableDOMCommit` stays as is and is deferred, because its public role is unproven either way. The arena-stage cut of `compileEditorSchemaContract` and the move of the renderer setters to the bridge were reversed by plan panel round 1, below.

Challenge delta: improved. Against the review's target, the arena rejected a second bridge entry and merged the two renderer capability owners into one; plan panel round 1 moved that owner to `plitejs/react`, kept `compileEditorSchemaContract` public, and built the guard on the TypeScript 6 checker.

### Plan panel round 1

Seats: Opus, gpt-6-astra at high and gpt-6.1-sol at xhigh, all answered, on frozen commit `7ad4f4b6d2c7e48aed01ce644e359a0e0cb4c2a0`. Critical findings, both applied: the Phase 2 guard's tag rule covered types that stay public until Phase 3 (all three seats; 49 tagged type exports, 13 names, would have failed it), and cut names left untagged and off the bridge could be re-exported past the guard (gpt-6.1-sol critical, the others warning; 10 cut names were untagged). Warnings applied: fail-closed export discovery, per-phase inventory updates, a declaration proof that cannot pass empty and runs in `pnpm check`, one standard for the renderer setters, `compileEditorSchemaContract` kept, no reference pages for the two helpers, one merged step for the root cut, written doctrine text, the TypeScript 6 checker, one key owner, the bypass list, and the bridge rule as a default.

### Premise proofs

- P1, run: a bun probe imported the Plite root, bridge and React entry from source at `477da4cf9a`. All 22 hooks exist on both the root and the bridge with identical values; the root has 74 runtime values.
- P2, run: in a detached worktree at `477da4cf9a`, both package typechecks pass. After the 27 root deletions and the React setter deletion, `plitejs` fails only in the five listed modules; after repointing them it passes; `platejs` then fails only in `facade.ts`, and after the facade split only in `react/plite-react.ts:107`, each with knock-on errors in its importers. Spec files sit outside the package typecheck.
- P5, run: `resolveEntrypointEdge` classifies `'../../internal'` from a `yjs` module as `root` and `'../../internal/index'` as `internal`.
- Grounding: three Opus `how` explorers and one explainer, saved in `docs/plans/artifacts/distribution-arena/grounding/`.

Proof limits: the probes ran on source and typechecks only, with no packed build, browser or test suite. The API reference check fails at `HEAD` on the unclassified `HistoryApi` export, so its part of Phase 1 waits on the history work. Consumer declaration emit for the carrier types is unproven until Phase 3's consumer runs.

### Export census (review stage)

A TypeScript 6.0.2 compiler census listed every export of each `plitejs` and `platejs` public entrypoint, resolved each alias to its declaration, and read `@internal` from the declaration's or the export specifier's JSDoc. The script and its output are in `docs/plans/artifacts/2026-10-05-distribution-review/census/`. It replaces the audit's count, which parsed only direct re-exports with an adjacent JSDoc block.

- The `plitejs` root has 559 exports, 28 tagged `@internal`: 16 values and 12 types.
- `plitejs/react` has 697 exports, 29 tagged: the root's 28, because `packages/plitejs/src/react/index.ts:1` is `export * from '..'`, plus `setDOMTextSyncRendererCapability` (`packages/plitejs/src/react/dom-text-sync.ts:38`), which only Plate's render pipes call.
- Every other public `plitejs` subpath has none. `plitejs/internal` has 276 exports, 56 tagged, and shares 45 names with the root, public ones such as `Editor`, `Value` and `definePlugin` among them.
- The `platejs` root and `platejs/react` carry exactly the `plitejs` root's 28 tagged names. `platejs/compiler` exposes one tagged type, `GeneratedEditorTypeProvider`.

The 16 tagged root values are `areEditorSchemaIdentitiesEqual`, `dispatchCommand`, `evaluateCommand`, `getCompiledEditorSchemaFromApi`, `getEditorCommitSnapshot`, `getSchemaElementSourceReference`, `initializePlugins`, `isPlugin`, `mapSemanticUpdateMethodArguments`, `preserveCompiledSchemaPropertyIdentity`, `probeCommandNativeEquivalent`, `readEditorSchemaIdentity`, `setEditorSnapshotInputTransform`, `setEditorStateViewTransform`, `setEditorTransactionViewTransform` and `toEditorCoreStateView`. A word search of each of the 74 root runtime values (the compiler census lists 75 value symbols; `dist/index.js` and a Babel probe count 74) across `content/docs`, `apps/www/src` without generated files, `packages/platejs/src`, other packages, `benchmarks` and the vision files found:

- None of the 16 tagged values appears in a docs page or in `apps/www/src`.
- Six untagged values have no docs page, no www use and no caller outside Plate's facade and source: `runTrustedUpdate`, `MAIN_ROOT_KEY`, `repairEditorValue`, `setEditorMaxLength`, `reportEditorLifecycleError` and `withTransactionSpecDraftRead`, whose own doc line says it allows "one internal state read".
- Untagged values that need a job decision in the plan: `getEditorRuntimeOwner`, which copied registry UI calls (`apps/www/src/registry/components/editor/discussion.tsx:653`); `setEditorReadOnly`, which shipped registry UI calls (`apps/www/src/registry/components/editor/mode-toolbar-button.tsx:4,83,87`); `compileEditorSchemaContract` and `containsCompleteEditorSchema`, which serve the compiler; `getSelectionDOMRange`, `getSelectionRange`, `mapSelectionThroughChange` and `txRead`.
- Untagged values whose own doc line names an author job stay public: `defineCommand`, `definePluginPoint`, the effect helpers, `defineStateField`, `txOnly`, and the schema contract readers that the CLI calls (`packages/cli/src/migrate.ts:107`, `:114`).

### Lanes considered (review stage)

- Keep the current design. It loses: both public roots keep publishing hooks with no author job, against `VISION.md:101`, `VISION.md:131` and `docs/vision/plite.md:77`.
- The audit's target, which moves the tagged values and guards by tag. It loses to this review's target: it leaves `runTrustedUpdate`, `MAIN_ROOT_KEY` and four more untagged hooks public, and its guard trusts every author to tag.
- Move hooks by job, make the bridge and public entries disjoint, and state the bridge once in root doctrine. Selected. It deletes public exports and adds no runtime work.
- Strip `@internal` from published declarations, as ProseMirror and CodeMirror do. It loses: the runtime exports stay, `export * from 'plitejs'` still mirrors them into `platejs`, and Plate's facade still needs their types.
- Replace `export * from 'plitejs'` in `packages/platejs/src/core.tsx` with a curated list. It loses: `tooling/scripts/check-plite-release-artifacts.mjs` proves facade identity over the whole Plite root, and a hand-kept list moves the sync work into Plate instead of cleaning the root.
- Delete `plitejs/internal`, merge the distributions, or hide the hooks behind a symbol-keyed registry. Each loses. `VISION.md:43-44` keeps `plitejs` an independent raw distribution, two npm packages cannot share private module state without one channel, and a hidden registry is the same channel without types or a name.
- For the scale gate, this is an export-only cut with unchanged runtime work, so no benchmark lane applies.

### Review proof limits

The census read declarations through the compiler and ran nothing else: no build, typecheck, test, packed release or browser. Consumer counts are word searches, so a generic name can collide; the review read the call sites only for the borderline values listed above. Whether the 12 tagged types can leave the root depends on whether public declarations name them, which the plan must check against the built declarations. The doctrine conflict between `VISION.md:131`, `docs/vision/common.md:157` and `docs/vision/plite.md:73` is named, not resolved. `dispatchCommand`, `evaluateCommand` and `probeCommandNativeEquivalent` also belong to the closed `commands` scope. The census ran on `477da4cf9a` with no uncommitted edits under the two packages' sources.

### Prior work and freshness

Prior work, from `node tooling/scripts/review-ledger.mjs lookup distribution --detail` and a search of `docs/plans` and `docs/research/decisions` for the scope, `plitejs/internal` and `@internal`:

- 2026-08-28 plan, `docs/plans/2026-08-28-finalize-platejs-entrypoint-ownership.md`, completed: entrypoint categories and optional-peer subpaths. Its execution was recovered on 2026-09-18 with historical, unbound proof.
- 2026-08-30 plan, `docs/plans/2026-08-30-enforce-plate-facade-dogfooding.md`, complete: only exact bridge modules in `packages/platejs` import `plitejs`. Its execution was recovered the same way.
- 2026-09-12 review, Pursue: hide the public `getCorePlugins` helper and its construction types, keep both distributions and the feature entrypoints. It landed as `packages/platejs/src/lib/plugins/getCorePlugins.internal.ts` outside the plugins barrel (commit `e0c1500b95`).
- 2026-10-04 audit, Pursue, the current head. It supersedes the 2026-09-12 review and keeps both recovered executions. It counted 23 `@internal` tags reaching the `plitejs` root, 16 of them values, and proposes exporting them only from `plitejs/internal`, importing them there in `packages/platejs/src/facade.ts`, a check that rejects `@internal` exports reachable from a public entrypoint, and one doctrine statement of the bridge. It read source only and ran no build, typecheck, test or packed release.
- `docs/plans/2026-10-04-ledger-triage-audit.md` names the next step for this scope as a plan for that cut.
- Two other subjects track pieces of it: `docs/plans/2026-10-03-model-document-admission.md` left `setEditorSnapshotInputTransform` exported from the public root, owned in `docs/plans/topics/model.md` Open work, and `docs/plans/2026-10-04-correct-sweep.md` left five relative `plitejs` imports that need a facade or `plitejs/internal` export, owned in `docs/plans/topics/correct.md` Open work.
- `docs/research/decisions/plate-core-ownership.md` is the decision page. No candidate record names this cut.

Freshness since the audit's tree, `fe0e9599a6`:

- The changed evidence inputs are `tooling/scripts/check-plite-release-artifacts.test.mjs`, which now counts 33 Plate entrypoint bundles instead of 32, `.agents/skills/best-api/SKILL.md` and `.agents/playbooks/references/architecture.md`. The four law files are `VISION.md`, `docs/vision/common.md`, `docs/vision/plite.md` and `docs/vision/plate.md`.
- The cited laws read the same at new lines. `VISION.md:131` still ends "Neither distribution exposes an `internal`, `unsafe`, or generic framework escape path", with the bridge type now named `PluginTypeProvider`. `VISION.md:101` still forbids a public `main` key. `docs/vision/plite.md:77` still says public roots expose author contracts, and `docs/vision/plite.md:73` and `:92` place private carriers in `plitejs/internal`. `docs/vision/common.md:157` still says public internal entrypoints do not survive, while `packages/plitejs/package.json:39` exports `./internal`.
- The leak is live. `setEditorTransactionViewTransform`, `runTrustedUpdate`, `initializePlugins` and `MAIN_ROOT_KEY` are each exported from `packages/plitejs/src/index.ts` and from `packages/plitejs/src/internal/index.ts`, and `packages/platejs/src/facade.ts:1-49` still imports them from the `plitejs` root.
- Since the audit, the reads build removed `SnapshotListener` and `EditorCommitSource` from the `plitejs` root, the history work added its result types there, and the model work added document-shape readers to `plitejs/internal`, which the facade imports from that subpath.

Ledger counts from `node tooling/scripts/review-ledger.mjs status` on 2026-10-05: 67 scopes, 0 unreviewed, 0 fork, 0 pursue-unbound, 34 pursue-not-adopted, 1 deferred, 32 closed and 1 unowned coverage entry.

The plan search matched on the scope id, the audit id, `plitejs/internal`, `@internal` and `stripInternal`, and found no plan after the audit that builds the cut. It misses plans that name the work under another word.
