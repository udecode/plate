# Slate v2 PR Description

> Reference doc. Maintainer handoff/supporting context, not live verdict or
> queue ownership.

This is the canonical maintainer-facing drift register for the future Slate v2
PR.

Use it to explain why the final diff is shaped the way it is.
Do not use it as roadmap or verdict truth.

Use it with:

- [release-readiness-decision.md](/Users/zbeyens/git/plate-2/docs/slate-v2/release-readiness-decision.md)
- [master-roadmap.md](/Users/zbeyens/git/plate-2/docs/slate-v2/master-roadmap.md)
- [release-file-review-ledger.md](/Users/zbeyens/git/plate-2/docs/slate-v2/release-file-review-ledger.md)
- [true-slate-rc-proof-ledger.md](/Users/zbeyens/git/plate-2/docs/slate-v2/true-slate-rc-proof-ledger.md)

## Purpose

The final PR is large.

This file exists so maintainers do not have to reverse-engineer intent from raw
diff volume.

It justifies the remaining drift across:

- docs
- examples
- tests
- API
- build and packaging
- the Plate-side files that are still in the live checkout

If drift was useless, it should have been repaired directly instead of defended
here.

## Reading Rules

- grouped rows are acceptable only when every affected file family is named
- this file explains remaining drift, not backed-out churn
- supporting rationale notes are linked where a drift is likely to be
  challenged
- historical plans may still describe the path that got here, but this file is
  the maintainer-facing source for the future PR body

## Drift Review Rules

- review every drift explicitly; do not let broad buckets hide unresolved file
  truth
- default question is: should this drift be reverted or kept?
- default answer is not “keep”; drift needs a concrete reason to survive
- when a file is tagged for review, treat that as a direct prompt to explain
  why the diff exists and whether it still earns its keep
- keep this file updated in the same turn as each drift review so the PR story
  does not lag behind the repo truth
- use benchmarks, tests, or focused experiments when a drift claim depends on
  performance, behavior, or ergonomics instead of opinion
- docs should stay in the repo’s reference style; do not add reviewer chatter,
  side notes, or internal commentary to product/reference docs unless the live
  doc style already calls for it
- preserve legacy doc ordering and grouping where possible; when new entries
  are required, place them where a reader would expect them in the existing
  sequence
- when a review finds a section-placement or taxonomy mistake, sweep sibling
  entries in that page and nearby pages immediately; do not fix one stranded
  heading and leave the same mistake elsewhere
- for API entries with options, verify the live option type or implementation
  before copying legacy option bags into the docs
- when a page uses a live exported alias in a signature, expand the option or
  prop shape nearby if the page is reference docs; alias-only is accurate but
  still too lazy for API docs
- for prop and callback docs, verify the live exported prop type and callback
  trigger semantics from source; do not assume old value-only or narrower prop
  behavior still holds
- if a live exported alias still exactly matches the current type, prefer the
  alias in docs instead of expanding it inline
- when a selection-helper note says a missing selection is a no-op, verify the
  helper does not synthesize a fallback selection from transaction state first
- do not mark a legacy row as mirrored when the current helper exists but the
  accepted arguments or option bag are narrower; record that as a real cut or
  a reopened gap instead
- when a direct legacy fixture runner exists, prefer it over grouped family
  storytelling
- a gated direct audit harness that currently fails is evidence of drift, not
  proof of parity
- a green direct audit harness is still not `mapped-mirrored` proof if the
  harness mutates the output shape to force a legacy match; record that row as
  mixed until runtime owns it cleanly
- grouped justifications are acceptable only when the grouped files still share
  one real rationale and every affected family is named
- when a review exposes a repeatable mistake in this process, add that rule to
  this file in the same turn

## Drift Review Steps

1. Read the legacy file and the current file.
2. Read the owning current source file or test that defines the live behavior.
3. Ask one blunt question: revert or keep?
4. Revert drift if it is stale, stylistic, accidental, or unsupported by the
   current implementation.
5. Keep drift only when the current implementation, proof, or tooling makes the
   legacy text false.
6. If drift stays, minimize it. Match legacy Slate wording, structure, and
   ordering as closely as possible.
7. If the review uncovered a new failure mode in this workflow, add the missing
   rule here before moving on.
8. If the mistake is structural, such as section placement, taxonomy, or
   option-shape hiding, sweep adjacent entries and sibling docs before calling
   the review complete.
9. If the claim depends on behavior, perf, or ergonomics, run the smallest
   honest test, benchmark, or experiment instead of hand-waving.
10. Update this file in the same turn with the final reason the drift survived.

## Drift Groups

### 1. Build, Packaging, Command Graph, And Tooling Drift

Affected files:

- `/Users/zbeyens/git/slate-v2/.gitignore`
- `/Users/zbeyens/git/slate-v2/.npmrc`
- `/Users/zbeyens/git/slate-v2/.yarnrc.yml`
- `/Users/zbeyens/git/slate-v2/.github/PULL_REQUEST_TEMPLATE.md`
- `/Users/zbeyens/git/slate-v2/.github/workflows/ci.yml`
- `/Users/zbeyens/git/slate-v2/.github/workflows/comment.yml`
- `/Users/zbeyens/git/slate-v2/.github/workflows/release.yml`
- `/Users/zbeyens/git/slate-v2/biome.jsonc`
- `/Users/zbeyens/git/slate-v2/config/babel/register.cjs`
- `/Users/zbeyens/git/slate-v2/config/rollup/rollup.config.js`
- `/Users/zbeyens/git/slate-v2/eslint.config.mjs`
- `/Users/zbeyens/git/slate-v2/package.json`
- `/Users/zbeyens/git/slate-v2/pnpm-workspace.yaml`
- `/Users/zbeyens/git/slate-v2/turbo.json`
- `/Users/zbeyens/git/slate-v2/tsconfig.json`
- `/Users/zbeyens/git/slate-v2/yarn.lock`
- `/Users/zbeyens/git/slate-v2/README.md`
- `/Users/zbeyens/git/slate-v2/Readme.md`
- `/Users/zbeyens/git/slate-v2/docs/general/contributing.md`
- `/Users/zbeyens/git/slate-v2/packages/slate/package.json`
- `/Users/zbeyens/git/slate-v2/packages/slate-history/package.json`
- `/Users/zbeyens/git/slate-v2/packages/slate-hyperscript/package.json`
- `/Users/zbeyens/git/slate-v2/packages/slate-react/package.json`
- `/Users/zbeyens/git/slate-v2/packages/slate-dom/package.json`
- `/Users/zbeyens/git/slate-v2/packages/slate-browser/package.json`
- `/Users/zbeyens/git/slate-v2/scripts/check.sh`
- `/Users/zbeyens/git/slate-v2/site/next-env.d.ts`
- `/Users/zbeyens/git/slate-v2/site/next.config.js`
- `/Users/zbeyens/git/slate-v2/site/pages/api/index.ts`

Why this drift exists:

- the repo could not keep mixing a `pnpm` workspace install with stale `yarn`
  and `lerna` release/build assumptions without producing fake tooling debt
- the replacement command graph had to become runnable from the current source
  tree instead of relying on stale dist-path luck
- `biome` and flat `eslint` had to become the live lint surface so the repo
  gate matched the current local and CI tooling
- `turbo` had to own the package build graph because the old root release flow
  still treated package builds as one monolithic step
- the example site and browser harness needed config changes to point at the
  current runtime and the current local integration port

Accepted drift:

- root scripts, release workflows, package manifests, lint config, and site
  config changed together because a partially updated command graph would keep
  producing fake breakage

Per-file root/tooling justification:

- `/Users/zbeyens/git/slate-v2/.npmrc` — this file was added because the repo no longer relies on Yarn/PnP defaults and now needs pnpm/npm registry behavior to stay explicit.
- `/Users/zbeyens/git/slate-v2/.yarnrc.yml` — this file was removed because the repo no longer runs on Yarn 4/PnP.
- `/Users/zbeyens/git/slate-v2/.github/PULL_REQUEST_TEMPLATE.md` — the PR checklist changed because the canonical local dev command is now `pnpm dev`, not the removed root `pnpm start` alias.
- `/Users/zbeyens/git/slate-v2/.github/workflows/ci.yml` — the CI workflow changed because the repo now restores the useful Turbo, Next, and TypeScript build caches instead of rerunning every workspace computation cold on each job.
- `/Users/zbeyens/git/slate-v2/.github/workflows/comment.yml` — the comment-triggered release workflow moved from Yarn commands to pnpm + Changesets so the PR-channel release path matches the current package manager.
- `/Users/zbeyens/git/slate-v2/.github/workflows/comment.yml` — the same workflow also stopped hard-coding `slate@<version>` and now comments the actual snapshot package set, because the rebuilt package graph can publish more than one package from a PR.
- `/Users/zbeyens/git/slate-v2/.github/workflows/release.yml` — the main release workflow moved from Yarn + Lerna to pnpm + Changesets, because the old release path still depended on tooling that is no longer part of the live repo.
- `/Users/zbeyens/git/slate-v2/.github/workflows/release.yml` — the release publish step was narrowed to `changeset publish` after prerelease succeeds, because coupling package publish to the root `pnpm build` command would let unrelated site build failures block npm release.
- `/Users/zbeyens/git/slate-v2/biome.jsonc` — this file was added because formatting and a large slice of static linting now run through Biome instead of Prettier-era config drift.
- `/Users/zbeyens/git/slate-v2/biome.jsonc` — the config later grew an explicit `.turbo` ignore because the restored local/CI Turbo cache is workspace machinery, not source content that should be linted or formatted.
- `/Users/zbeyens/git/slate-v2/config/babel/register.cjs` — the register path changed because the current test/runtime surface needed pnpm workspace aliases plus the restored hyperscript fixture bootstrap.
- `/Users/zbeyens/git/slate-v2/config/rollup/rollup.config.js` — Rollup changed because the rebuilt package graph now includes the restored package owners, pnpm-based subpath builds, and the extracted `slate-browser` / `slate-hyperscript` outputs.
- `/Users/zbeyens/git/slate-v2/eslint.config.mjs` — this file was added because the repo moved off legacy `.eslintrc` config and onto the flat ESLint surface that matches the current Biome + React Hooks gate.
- `/Users/zbeyens/git/slate-v2/eslint.config.mjs` — the broad `react-hooks/refs` / `react-hooks/set-state-in-effect` carve-out for `packages/slate-react/src/**/*.{tsx,jsx}` and `site/examples/**/*.{tsx,jsx}` was removed once the real effect-mirroring cases were fixed; the remaining caller-owned host-binding seams keep localized inline waivers at their owning lines instead of hiding that debt behind a whole-tree override.
- `/Users/zbeyens/git/slate-v2/eslint.config.mjs` — the config later grew an explicit `.turbo` ignore because the restored local/CI Turbo cache is workspace machinery, not source content that should be linted.
- `/Users/zbeyens/git/slate-v2/package.json` — the root script graph changed because `check`, linting, release publishing, integration runs, and package builds all had to stop calling Yarn/Lerna and start calling pnpm/Turbo/Changesets directly.
- `/Users/zbeyens/git/slate-v2/package.json` — the root `check` scripts were later rewritten as plain package-manager commands because the repo no longer needs `scripts/check.sh` to front-load one monolithic build step before every gate run.
- `/Users/zbeyens/git/slate-v2/package.json` — the root `typecheck`, `typecheck:packages`, and `typecheck:site` entries were added because build prerequisites now belong to the package typecheck graph itself instead of being hidden inside one shell script.
- `/Users/zbeyens/git/slate-v2/package.json` — the root dev surface changed because `pnpm dev` is now the canonical local entrypoint, the misleading root `start` alias is gone, `watch` was renamed to `build:watch`, and parallel dev orchestration moved from `npm-run-all` to `concurrently`.
- `/Users/zbeyens/git/slate-v2/package.json` — the release script surface changed because the latest publish lane now uses the explicit `release:publish:latest` owner after prerelease succeeds instead of routing package publish back through the full root build.
- `/Users/zbeyens/git/slate-v2/package.json` — the root tooling versions were also advanced to the current `biome`, `ultracite`, `turbo`, `react`, `react-dom`, `next`, `eslint`, `@typescript-eslint/parser`, and `@types/react*` surface because the repo cannot claim a rebuilt modern toolchain while pinning stale pre-upgrade versions.
- `/Users/zbeyens/git/slate-v2/pnpm-workspace.yaml` — this file was added because the repo now declares its workspace layout through pnpm instead of relying on Yarn-only workspace wiring.
- `/Users/zbeyens/git/slate-v2/turbo.json` — this file was added because the package build graph is now orchestrated explicitly through Turbo instead of the old root-only build path.
- `/Users/zbeyens/git/slate-v2/turbo.json` — the task graph was later widened with package `typecheck` dependencies so build prerequisites live on the task that needs them instead of inside a monolithic shell gate.
- `/Users/zbeyens/git/slate-v2/turbo.json` — the package `build` task later became cacheable because rerunning dependency builds on every `typecheck` made the new task graph pointless; the surviving package outputs are deterministic enough to let Turbo reuse them.
- `/Users/zbeyens/git/slate-v2/tsconfig.json` — the root TS config changed because the repo lint/type gate had to match the rebuilt package graph and the newer TypeScript toolchain.
- `/Users/zbeyens/git/slate-v2/yarn.lock` — this file was removed because the repo no longer installs or releases through Yarn.
- `/Users/zbeyens/git/slate-v2/README.md` — the root README changed because it still described the repo as a Lerna/Yarn monorepo instead of the current pnpm + Turbo workspace.
- `/Users/zbeyens/git/slate-v2/README.md` — the same README was later tightened again because it still described `pnpm check` as a root-build-first gate even after the repo moved that prerequisite onto package `typecheck`.
- `/Users/zbeyens/git/slate-v2/Readme.md` — the package-facing readme twin changed for the same reason as `README.md`: it still described the wrong monorepo and release tooling.
- `/Users/zbeyens/git/slate-v2/Readme.md` — the same readme twin was later tightened again because it still described `pnpm check` as a root-build-first gate even after the repo moved that prerequisite onto package `typecheck`.
- `/Users/zbeyens/git/slate-v2/docs/general/contributing.md` — the contributing guide changed because it still told maintainers to use Yarn/Lerna commands that no longer exist in the live repo.
- `/Users/zbeyens/git/slate-v2/docs/general/contributing.md` — the same guide was later tightened again because it still told contributors to run `pnpm start` and still described `pnpm check` as a build-first gate after the root `start` alias and `check.sh` were removed.
- `/Users/zbeyens/git/slate-v2/packages/slate/package.json` — this manifest changed because the package now exposes its own Turbo-owned `build`/`clean` tasks and no longer needs the stale workspace edge back to `slate-history`.
- `/Users/zbeyens/git/slate-v2/packages/slate/package.json` — the same manifest now also exposes a package-local `typecheck` owner so the root gate can attach build prerequisites to package typechecking instead of shelling through one root script.
- `/Users/zbeyens/git/slate-v2/packages/slate-history/package.json` — this manifest changed because the package now exposes its own Turbo-owned `build`/`clean` tasks instead of relying on the old root-only release path.
- `/Users/zbeyens/git/slate-v2/packages/slate-history/package.json` — the same manifest now also exposes a package-local `typecheck` owner so the root gate can attach build prerequisites to package typechecking instead of shelling through one root script.
- `/Users/zbeyens/git/slate-v2/packages/slate-hyperscript/package.json` — this manifest changed because the package now exposes its own Turbo-owned `build`/`clean` tasks and still ships a distinct Rollup output.
- `/Users/zbeyens/git/slate-v2/packages/slate-hyperscript/package.json` — the same manifest now also exposes a package-local `typecheck` owner so the root gate can attach build prerequisites to package typechecking instead of shelling through one root script.
- `/Users/zbeyens/git/slate-v2/packages/slate-react/package.json` — this manifest changed because the package now exposes its own Turbo-owned `build`/`clean` tasks and uses the rebuilt current dist/output contract.
- `/Users/zbeyens/git/slate-v2/packages/slate-react/package.json` — the same manifest now also exposes a package-local `typecheck` owner so the root gate can attach build prerequisites to package typechecking instead of shelling through one root script.
- `/Users/zbeyens/git/slate-v2/packages/slate-react/package.json` — this manifest also moved its local `react` / `react-dom` / `@types/react*` pins forward so the package-level runtime and type surface matches the upgraded root toolchain.
- `/Users/zbeyens/git/slate-v2/packages/slate-dom/package.json` — this manifest changed because the package now exposes its own Turbo-owned `build`/`clean` tasks and uses the rebuilt current dist/output contract.
- `/Users/zbeyens/git/slate-v2/packages/slate-dom/package.json` — the same manifest now also exposes a package-local `typecheck` owner so the root gate can attach build prerequisites to package typechecking instead of shelling through one root script.
- `/Users/zbeyens/git/slate-v2/packages/slate-browser/package.json` — this manifest changed because the package now participates in the package build graph as a first-class Turbo-owned build target instead of an ad hoc browser helper.
- `/Users/zbeyens/git/slate-v2/packages/slate-browser/package.json` — the same manifest now also exposes a package-local `typecheck` owner so the root gate can attach build prerequisites to package typechecking instead of shelling through one root script.
- `/Users/zbeyens/git/slate-v2/packages/slate-browser/package.json` — the same manifest later dropped its stray local TypeScript pin because the browser package should follow the root TS 6 toolchain instead of resolving its own older compiler.
- `/Users/zbeyens/git/slate-v2/scripts/check.sh` — this file was removed because the repo no longer needs a monolithic shell gate that front-loads `pnpm build`; package `typecheck` now owns its own build prerequisites through Turbo and the root `check` scripts are plain package-manager entries.
- `/Users/zbeyens/git/slate-v2/site/next-env.d.ts` — this file changed because the site now builds under the newer Next.js/TypeScript surface used by the current repo gate.
- `/Users/zbeyens/git/slate-v2/site/next.config.js` — this file changed because the example site now builds and exports under the current Next.js surface instead of the stale one the repo used before the tooling reset.
- `/Users/zbeyens/git/slate-v2/site/pages/api/index.ts` — this file changed because the site build/export path had to stay compatible with the newer Next.js runtime contract used by the current repo gate.

### 2. Core Package Drift In `packages/slate`

This package carries `121` changed root/source files and `1048` deleted test
files.

The root/source files are justified one-by-one here because the core package is
too important for hand-wavy grouping.

Rule for this block:

- if a `packages/slate/src/**` path belongs to the public/core surface, keep
  one-file-per-method topology instead of hiding that logic in omnibus files
- if a `packages/slate/src/**` drift does not clearly strengthen the better
  engine direction, push back on it and revert it instead of defending it

The deleted test corpus keeps its file-by-file owner in the core deleted-test
closeout note instead of duplicating a thousand-row block in this file.

Per-file source/root justification:

- `/Users/zbeyens/git/slate-v2/packages/slate/Readme.md` — the stale package note about extracted interface/transform types was removed because it no longer describes the current package.
- `/Users/zbeyens/git/slate-v2/packages/slate/package.json` — package exports, scripts, and workspace wiring were updated to match the rebuilt current package graph.
- `/Users/zbeyens/git/slate-v2/packages/slate/src/core/apply.ts` — the old file mixed transaction entry, ref rebasing, dirty-path handling, normalization, and flush scheduling in one body; the current file keeps only the `apply(editor, op)` entrypoint and delegates the rest to `withTransaction(...)`, `getState(...)`, and `applyOperation(...)`.
- `/Users/zbeyens/git/slate-v2/packages/slate/src/core/get-current-children.ts` — new file added because `getCurrentChildren(editor)` is part of the current core runtime surface and was previously buried inside `core.ts`.
- `/Users/zbeyens/git/slate-v2/packages/slate/src/core/get-current-index.ts` — new file added because `getCurrentIndex(editor)` is part of the current core runtime surface and was previously buried inside `core.ts`.
- `/Users/zbeyens/git/slate-v2/packages/slate/src/core/get-current-marks.ts` — new file added because `getCurrentMarks(editor)` is part of the current core runtime surface and was previously buried inside `core.ts`.
- `/Users/zbeyens/git/slate-v2/packages/slate/src/core/get-current-node.ts` — new file added because `getCurrentNode(editor, path)` is part of the current core runtime surface and was previously buried inside `core.ts`.
- `/Users/zbeyens/git/slate-v2/packages/slate/src/core/get-current-range-for-path.ts` — new file added because `getCurrentRangeForPath(editor, path)` is part of the current core runtime surface and was previously buried inside `core.ts`.
- `/Users/zbeyens/git/slate-v2/packages/slate/src/core/get-current-replace-epoch.ts` — new file added because `getCurrentReplaceEpoch(editor)` is part of the current core runtime surface and was previously buried inside `core.ts`.
- `/Users/zbeyens/git/slate-v2/packages/slate/src/core/get-current-selection.ts` — new file added because `getCurrentSelection(editor)` is part of the current core runtime surface and was previously buried inside `core.ts`.
- `/Users/zbeyens/git/slate-v2/packages/slate/src/core/get-dirty-paths.ts` — the old file used `Path.levels`, `Path.ancestors`, `Path.previous`, `Path.next`, and `Node.nodes`; the current file keeps the same dirty-path job but replaces those namespace calls with local path helpers plus direct descendant collection over the current structural node shape.
- `/Users/zbeyens/git/slate-v2/packages/slate/src/core/get-fragment.ts` — the old file delegated to `Node.fragment(editor, selection)`; the current file slices fragments directly from the current snapshot/tree shape with local range/path comparison helpers.
- `/Users/zbeyens/git/slate-v2/packages/slate/src/core/get-latest-range-ref-value.ts` — new file added because range-ref current-value lookup was previously buried inside `core.ts`, but the extracted range-ref code now needs that helper at its own path.
- `/Users/zbeyens/git/slate-v2/packages/slate/src/core/get-node-at-path.ts` — new file added because draft-node lookup was previously buried inside `core.ts`, but both current-node lookup and operation application depend on it directly.
- `/Users/zbeyens/git/slate-v2/packages/slate/src/core/get-range-refs.ts` — new file added because `getRangeRefs(editor)` is part of the current core runtime surface and was previously buried inside `core.ts`.
- `/Users/zbeyens/git/slate-v2/packages/slate/src/core/get-snapshot.ts` — new file added because `getSnapshot(editor)` is part of the current core runtime surface and was previously buried inside `core.ts`.
- `/Users/zbeyens/git/slate-v2/packages/slate/src/core/get-state.ts` — new file added because internal state lookup was previously buried inside `core.ts`, but the extracted core files now call it directly.
- `/Users/zbeyens/git/slate-v2/packages/slate/src/core/index.ts` — the old file was a blanket `export * from '../core'` shim; the current file explicitly exports the surviving `src/core/*` owners so the core file tree no longer lies about ownership.
- `/Users/zbeyens/git/slate-v2/packages/slate/src/core/initialize-editor.ts` — new file added because `initializeEditor(editor)` is part of the current core runtime surface and was previously buried inside `core.ts`.
- `/Users/zbeyens/git/slate-v2/packages/slate/src/core/normalize-node.ts` — the old file used the legacy built-in normalizer with `Transforms.*` plus broad block/inline coercion; the current file switches to the narrower current model with `explicit` passes, direct-child validation, inline-compatible descendant collection, and scoped `fallbackElement` handling.
- `/Users/zbeyens/git/slate-v2/packages/slate/src/core/apply-operation.ts` — new file added because raw operation application over the transaction draft was previously buried inside `core.ts`, but the current engine still needs that logic as a distinct step under `apply(...)`.
- `/Users/zbeyens/git/slate-v2/packages/slate/src/core/draft-helpers.ts` — the old `core.ts` kept draft cloning, draft-index creation, snapshot materialization, and draft child traversal interleaved with unrelated selection and fragment code; the current file groups that draft/snapshot support in one internal module so the remaining core owners stop sharing one omnibus body.
- `/Users/zbeyens/git/slate-v2/packages/slate/src/core/fragment-helpers.ts` — the old `core.ts` kept remove-node selection fallback, mixed-inline/block-container fragment analysis, fragment slice/split helpers, and `insertFragment*` execution in one continuous omnibus body; the current file groups that whole fragment/container support stack together so `apply-operation.ts`, `step-current-point.ts`, and fragment insertion stop depending on hidden logic inside `core.ts`.
- `/Users/zbeyens/git/slate-v2/packages/slate/src/core/fragment-rebase-helpers.ts` — the old `core.ts` kept collapsed-insert rebasing, range-replace rebasing, move-target adjustment, and scratch-editor `insert_fragment` simulation at the tail of the omnibus file; the current file groups that fragment-selection rebasing support together so `apply-operation.ts` and fragment insertion stop depending on hidden tail logic in `core.ts`.
- `/Users/zbeyens/git/slate-v2/packages/slate/src/core/range-ref.ts` — new file added because `rangeRef(editor, range, affinity)` is part of the current core runtime surface and was previously buried inside `core.ts`.
- `/Users/zbeyens/git/slate-v2/packages/slate/src/core/replace-snapshot.ts` — new file added because `replaceSnapshot(editor, input)` is part of the current core runtime surface and was previously buried inside `core.ts`.
- `/Users/zbeyens/git/slate-v2/packages/slate/src/core/node-helpers.ts` — the old `core.ts` mixed node cloning, prop copying, descendant slicing, and path-to-node traversal into the same file as transaction and fragment behavior; the current file keeps that shared structural node machinery together as internal support instead of letting `core.ts` stay the accidental owner forever.
- `/Users/zbeyens/git/slate-v2/packages/slate/src/core/path-helpers.ts` — the old `core.ts` duplicated path comparison, point comparison, range-edge resolution, and path-key generation inside the omnibus file; the current file pulls those current path/point primitives into one support module that the extracted core owners can import directly.
- `/Users/zbeyens/git/slate-v2/packages/slate/src/core/set-current-marks.ts` — new file added because `setCurrentMarks(editor, marks)` is part of the current core runtime surface and was previously buried inside `core.ts`.
- `/Users/zbeyens/git/slate-v2/packages/slate/src/core/should-normalize.ts` — the old file enforced a max-iteration guard based on `initialDirtyPathsLength`; the current file drops that legacy guard and keeps only the current default `return true` behavior.
- `/Users/zbeyens/git/slate-v2/packages/slate/src/core/step-current-point.ts` — new file added because point stepping for `before(...)` / `after(...)` across supported top-level text blocks was previously buried inside `core.ts`.
- `/Users/zbeyens/git/slate-v2/packages/slate/src/core/subscribe.ts` — new file added because `subscribe(editor, listener)` is part of the current core runtime surface and was previously buried inside `core.ts`.
- `/Users/zbeyens/git/slate-v2/packages/slate/src/core/transaction-helpers.ts` — the old `core.ts` kept normalization-entry collection, custom normalizer looping, created-range-ref publication, and snapshot publication at the bottom of the omnibus file; the current file groups those transaction-finalization steps together so `with-transaction.ts` and the editor lifecycle no longer depend on hidden tail logic in `core.ts`.
- `/Users/zbeyens/git/slate-v2/packages/slate/src/core/with-transaction.ts` — new file added because transaction entry/exit, explicit-normalize setup, and publish sequencing were previously buried inside `core.ts`, but still form one distinct current engine step.
- `/Users/zbeyens/git/slate-v2/packages/slate/src/core.ts` — the old file was the real runtime owner for path helpers, node cloning, draft/snapshot materialization, transaction publication, and the full fragment/container insertion stack; the current file is reduced to shared core types, `INTERNAL` state, and explicit re-exports, so the file tree finally matches where the runtime logic actually lives.
- `/Users/zbeyens/git/slate-v2/packages/slate/src/create-editor.ts` — the file stopped inlining the current normalization body and now imports `apply` and `normalizeNode` from `src/core/*`; the live editor instance wiring still delegates many methods through the aggregate implementations.
- `/Users/zbeyens/git/slate-v2/packages/slate/src/editor.ts` — the old file mixed default instance semantics, traversal/query helpers, ref registries, and the public static `Editor.*` surface in one aggregate module; the current file still owns `EditorImplementation`, but the restored `src/editor/*.ts` files now own the public static wrapper surface again.
- `/Users/zbeyens/git/slate-v2/packages/slate/src/editor/above.ts` — the old file owned the standalone `above` helper; the current file again owns the public static `Editor.above(...)` wrapper and forwards to the live editor instance method.
- `/Users/zbeyens/git/slate-v2/packages/slate/src/editor/add-mark.ts` — the old file owned the standalone `addMark` helper; the current file again owns the public static `Editor.addMark(...)` wrapper and forwards to the live editor instance method.
- `/Users/zbeyens/git/slate-v2/packages/slate/src/editor/after.ts` — the old file owned the standalone `after` helper; the current file again owns the public static `Editor.after(...)` wrapper and forwards to the live editor instance method.
- `/Users/zbeyens/git/slate-v2/packages/slate/src/editor/before.ts` — the old file owned the standalone `before` helper; the current file again owns the public static `Editor.before(...)` wrapper and forwards to the live editor instance method.
- `/Users/zbeyens/git/slate-v2/packages/slate/src/editor/delete-backward.ts` — the old file owned the standalone `deleteBackward` helper; the current file again owns the public static `Editor.deleteBackward(...)` wrapper and forwards to the live editor instance method.
- `/Users/zbeyens/git/slate-v2/packages/slate/src/editor/delete-forward.ts` — the old file owned the standalone `deleteForward` helper; the current file again owns the public static `Editor.deleteForward(...)` wrapper and forwards to the live editor instance method.
- `/Users/zbeyens/git/slate-v2/packages/slate/src/editor/delete-fragment.ts` — the old file owned the standalone `deleteFragment` helper; the current file again owns the public static `Editor.deleteFragment(...)` wrapper and forwards to the live editor instance method.
- `/Users/zbeyens/git/slate-v2/packages/slate/src/editor/edges.ts` — the old file owned the standalone `edges` helper; the current file again owns the public static `Editor.edges(...)` wrapper and forwards to the live editor instance method.
- `/Users/zbeyens/git/slate-v2/packages/slate/src/editor/element-read-only.ts` — the old file owned the standalone `elementReadOnly` helper; the current file again owns the public static `Editor.elementReadOnly(...)` wrapper and forwards to the live editor instance method.
- `/Users/zbeyens/git/slate-v2/packages/slate/src/editor/end.ts` — the old file owned the standalone `end` helper; the current file again owns the public static `Editor.end(...)` wrapper and forwards to the live editor instance method.
- `/Users/zbeyens/git/slate-v2/packages/slate/src/editor/first.ts` — the old file owned the standalone `first` helper; the current file again owns the public static `Editor.first(...)` wrapper and forwards to the live editor instance method.
- `/Users/zbeyens/git/slate-v2/packages/slate/src/editor/fragment.ts` — the old file owned the standalone `fragment` helper; the current file again owns the public static `Editor.fragment(...)` wrapper and forwards to the live editor instance method.
- `/Users/zbeyens/git/slate-v2/packages/slate/src/editor/get-void.ts` — the old file owned the standalone helper at this historical path; the current file again owns the public static `Editor.void(...)` wrapper even though the filename stays `get-void.ts`.
- `/Users/zbeyens/git/slate-v2/packages/slate/src/editor/has-blocks.ts` — the old file owned the standalone `hasBlocks` helper; the current file again owns the public static `Editor.hasBlocks(...)` wrapper and forwards to the live editor instance method.
- `/Users/zbeyens/git/slate-v2/packages/slate/src/editor/has-inlines.ts` — the old file owned the standalone `hasInlines` helper; the current file again owns the public static `Editor.hasInlines(...)` wrapper and forwards to the live editor instance method.
- `/Users/zbeyens/git/slate-v2/packages/slate/src/editor/has-path.ts` — the old file owned the standalone `hasPath` helper; the current file again owns the public static `Editor.hasPath(...)` wrapper and forwards to the live editor instance method.
- `/Users/zbeyens/git/slate-v2/packages/slate/src/editor/has-texts.ts` — the old file owned the standalone `hasTexts` helper; the current file again owns the public static `Editor.hasTexts(...)` wrapper and forwards to the live editor instance method.
- `/Users/zbeyens/git/slate-v2/packages/slate/src/editor/index.ts` — the old file faked ownership through `export * from '../editor'`; the current file explicitly re-exports the real editor owner files.
- `/Users/zbeyens/git/slate-v2/packages/slate/src/editor/insert-break.ts` — the old file owned the standalone `insertBreak` helper; the current file again owns the public static `Editor.insertBreak(...)` wrapper and forwards to the live editor instance method.
- `/Users/zbeyens/git/slate-v2/packages/slate/src/editor/insert-node.ts` — the old file owned the standalone `insertNode` helper; the current file again owns the public static `Editor.insertNode(...)` wrapper and forwards to the live editor instance method.
- `/Users/zbeyens/git/slate-v2/packages/slate/src/editor/insert-soft-break.ts` — the old file owned the standalone `insertSoftBreak` helper; the current file again owns the public static `Editor.insertSoftBreak(...)` wrapper and forwards to the live editor instance method.
- `/Users/zbeyens/git/slate-v2/packages/slate/src/editor/insert-text.ts` — the old file owned the standalone `insertText` helper; the current file again owns the public static `Editor.insertText(...)` wrapper and forwards to the live editor instance method.
- `/Users/zbeyens/git/slate-v2/packages/slate/src/editor/is-block.ts` — the old file owned the standalone `isBlock` helper; the current file again owns the public static `Editor.isBlock(...)` wrapper and forwards to the live editor instance method.
- `/Users/zbeyens/git/slate-v2/packages/slate/src/editor/is-edge.ts` — the old file owned the standalone `isEdge` helper; the current file again owns the public static `Editor.isEdge(...)` wrapper and forwards to the live editor instance method.
- `/Users/zbeyens/git/slate-v2/packages/slate/src/editor/is-editor.ts` — the old file owned the standalone `isEditor` helper; the current file again owns the public static `Editor.isEditor(value)` wrapper.
- `/Users/zbeyens/git/slate-v2/packages/slate/src/editor/is-empty.ts` — the old file owned the standalone `isEmpty` helper; the current file again owns the public static `Editor.isEmpty(...)` wrapper and forwards to the live editor instance method.
- `/Users/zbeyens/git/slate-v2/packages/slate/src/editor/is-end.ts` — the old file owned the standalone `isEnd` helper; the current file again owns the public static `Editor.isEnd(...)` wrapper and forwards to the live editor instance method.
- `/Users/zbeyens/git/slate-v2/packages/slate/src/editor/is-normalizing.ts` — the old file owned the standalone `isNormalizing` helper; the current file again owns the public static `Editor.isNormalizing(...)` wrapper and forwards to the live editor instance method.
- `/Users/zbeyens/git/slate-v2/packages/slate/src/editor/is-start.ts` — the old file owned the standalone `isStart` helper; the current file again owns the public static `Editor.isStart(...)` wrapper and forwards to the live editor instance method.
- `/Users/zbeyens/git/slate-v2/packages/slate/src/editor/last.ts` — the old file owned the standalone `last` helper; the current file again owns the public static `Editor.last(...)` wrapper and forwards to the live editor instance method.
- `/Users/zbeyens/git/slate-v2/packages/slate/src/editor/leaf.ts` — the old file owned the standalone `leaf` helper; the current file again owns the public static `Editor.leaf(...)` wrapper and forwards to the live editor instance method.
- `/Users/zbeyens/git/slate-v2/packages/slate/src/editor/levels.ts` — the old file owned the standalone `levels` helper; the current file again owns the public static `Editor.levels(...)` wrapper and forwards to the live editor instance method.
- `/Users/zbeyens/git/slate-v2/packages/slate/src/editor/marks.ts` — the old file owned the standalone `marks` helper; the current file again owns the public static `Editor.marks(editor)` wrapper and forwards to `editor.getMarks()`.
- `/Users/zbeyens/git/slate-v2/packages/slate/src/editor/next.ts` — the old file owned the standalone `next` helper; the current file again owns the public static `Editor.next(...)` wrapper and forwards to the live editor instance method.
- `/Users/zbeyens/git/slate-v2/packages/slate/src/editor/node.ts` — the old file owned the standalone `node` helper; the current file again owns the public static `Editor.node(...)` wrapper and forwards to the live editor instance method.
- `/Users/zbeyens/git/slate-v2/packages/slate/src/editor/nodes.ts` — the old file owned the standalone `nodes` helper; the current file again owns the public static `Editor.nodes(...)` wrapper and forwards to the live editor instance method.
- `/Users/zbeyens/git/slate-v2/packages/slate/src/editor/normalize.ts` — the old file owned the standalone `normalize` helper; the current file again owns the public static `Editor.normalize(...)` wrapper and forwards to the live editor instance method.
- `/Users/zbeyens/git/slate-v2/packages/slate/src/editor/parent.ts` — the old file owned the standalone `parent` helper; the current file again owns the public static `Editor.parent(...)` wrapper and forwards to the live editor instance method.
- `/Users/zbeyens/git/slate-v2/packages/slate/src/editor/path-ref.ts` — the old file owned the standalone `pathRef` helper; the current file again owns the public static `Editor.pathRef(...)` wrapper and forwards to the live editor instance method.
- `/Users/zbeyens/git/slate-v2/packages/slate/src/editor/path-refs.ts` — the old file owned the standalone `pathRefs` helper; the current file again owns the public static `Editor.pathRefs(...)` wrapper and forwards to the live editor instance method.
- `/Users/zbeyens/git/slate-v2/packages/slate/src/editor/path.ts` — the old file owned the standalone `path` helper; the current file again owns the public static `Editor.path(...)` wrapper and forwards to the live editor instance method.
- `/Users/zbeyens/git/slate-v2/packages/slate/src/editor/point-ref.ts` — the old file owned the standalone `pointRef` helper; the current file again owns the public static `Editor.pointRef(...)` wrapper and forwards to the live editor instance method.
- `/Users/zbeyens/git/slate-v2/packages/slate/src/editor/point-refs.ts` — the old file owned the standalone `pointRefs` helper; the current file again owns the public static `Editor.pointRefs(...)` wrapper and forwards to the live editor instance method.
- `/Users/zbeyens/git/slate-v2/packages/slate/src/editor/point.ts` — the old file owned the standalone `point` helper; the current file again owns the public static `Editor.point(...)` wrapper and forwards to the live editor instance method.
- `/Users/zbeyens/git/slate-v2/packages/slate/src/editor/positions.ts` — the old file owned the standalone `positions` helper; the current file again owns the public static `Editor.positions(...)` wrapper and forwards to the live editor instance method.
- `/Users/zbeyens/git/slate-v2/packages/slate/src/editor/previous.ts` — the old file owned the standalone `previous` helper; the current file again owns the public static `Editor.previous(...)` wrapper and forwards to the live editor instance method.
- `/Users/zbeyens/git/slate-v2/packages/slate/src/editor/range-ref.ts` — the old file owned the standalone `rangeRef` helper; the current file again owns the public static `Editor.rangeRef(...)` wrapper and forwards to the live editor instance method.
- `/Users/zbeyens/git/slate-v2/packages/slate/src/editor/range-refs.ts` — the old file owned the standalone `rangeRefs` helper; the current file again owns the public static `Editor.rangeRefs(...)` wrapper and forwards to the live editor instance method.
- `/Users/zbeyens/git/slate-v2/packages/slate/src/editor/range.ts` — the old file owned the standalone `range` helper; the current file again owns the public static `Editor.range(...)` wrapper and forwards to the live editor instance method.
- `/Users/zbeyens/git/slate-v2/packages/slate/src/editor/remove-mark.ts` — the old file owned the standalone `removeMark` helper; the current file again owns the public static `Editor.removeMark(...)` wrapper and forwards to the live editor instance method.
- `/Users/zbeyens/git/slate-v2/packages/slate/src/editor/set-normalizing.ts` — the old file owned the standalone `setNormalizing` helper; the current file again owns the public static `Editor.setNormalizing(...)` wrapper and forwards to the live editor instance method.
- `/Users/zbeyens/git/slate-v2/packages/slate/src/editor/should-merge-nodes-remove-prev-node.ts` — the old file owned the standalone `shouldMergeNodesRemovePrevNode` helper; the current file again owns the public static `Editor.shouldMergeNodesRemovePrevNode(...)` wrapper and forwards to the live editor instance method.
- `/Users/zbeyens/git/slate-v2/packages/slate/src/editor/start.ts` — the old file owned the standalone `start` helper; the current file again owns the public static `Editor.start(...)` wrapper and forwards to the live editor instance method.
- `/Users/zbeyens/git/slate-v2/packages/slate/src/editor/string.ts` — the old file owned the standalone `string` helper; the current file again owns the public static `Editor.string(...)` wrapper and forwards to the live editor instance method.
- `/Users/zbeyens/git/slate-v2/packages/slate/src/editor/unhang-range.ts` — the old file owned the standalone `unhangRange` helper; the current file again owns the public static `Editor.unhangRange(...)` wrapper and forwards to the live editor instance method.
- `/Users/zbeyens/git/slate-v2/packages/slate/src/editor/without-normalizing.ts` — the old file owned the standalone `withoutNormalizing` helper; the current file again owns the public static `Editor.withoutNormalizing(...)` wrapper and forwards to the live editor instance method.
- `/Users/zbeyens/git/slate-v2/packages/slate/src/index.ts` — the source barrel was rewritten to export the current public core surface directly.
- `/Users/zbeyens/git/slate-v2/packages/slate/src/interfaces/editor.ts` — the old file was only a wrapper back to `interfaces.ts`; the current file owns the `Editor` interface plus the live editor-adjacent option, snapshot, and range-projection types directly.
- `/Users/zbeyens/git/slate-v2/packages/slate/src/interfaces/element.ts` — the old file was only a wrapper back to `interfaces.ts`; the current file owns the `Element` type surface and `Element` namespace guards directly.
- `/Users/zbeyens/git/slate-v2/packages/slate/src/interfaces/index.ts` — the old file faked ownership through `export * from '../interfaces'`; the current file is an explicit barrel over the real interface owner files.
- `/Users/zbeyens/git/slate-v2/packages/slate/src/interfaces.ts` — the old file still owned the full `Path`, `Point`, `Range`, `Location`, ref, `Text`, `Element`, `Operation`, `Scrubber`, `Node`, and `Editor` surface in one aggregate namespace file; the current file is reduced to the explicit interface export surface while the historical `interfaces/*.ts` paths own the concrete namespaces directly.
- `/Users/zbeyens/git/slate-v2/packages/slate/src/interfaces/location.ts` — the old file was only a wrapper back to `interfaces.ts`; the current file owns the `Location`/`Span` type surface and runtime guards directly.
- `/Users/zbeyens/git/slate-v2/packages/slate/src/interfaces/node.ts` — the old file was only a wrapper back to `interfaces.ts`; the current file owns `Ancestor`, `Node`, `NodeEntry`, node option types, mutable fragment helpers, and the full `Node` namespace directly.
- `/Users/zbeyens/git/slate-v2/packages/slate/src/interfaces/operation.ts` — the old file was only a wrapper back to `interfaces.ts`; the current file owns the operation type unions and the `Operation` namespace helpers directly.
- `/Users/zbeyens/git/slate-v2/packages/slate/src/interfaces/path-ref.ts` — the old file was only a wrapper back to `interfaces.ts`; the current file owns `PathRefAffinity`, `PathRef`, and `PathRefOptions` directly.
- `/Users/zbeyens/git/slate-v2/packages/slate/src/interfaces/path.ts` — the old file was only a wrapper back to `interfaces.ts`; the current file owns the `Path` type, `TextDirection`, `PathTransformOptions`, and the full `Path` namespace helpers directly.
- `/Users/zbeyens/git/slate-v2/packages/slate/src/interfaces/point-ref.ts` — the old file was only a wrapper back to `interfaces.ts`; the current file owns `PointRefAffinity`, `PointRef`, and `PointRefOptions` directly.
- `/Users/zbeyens/git/slate-v2/packages/slate/src/interfaces/point.ts` — the old file was only a wrapper back to `interfaces.ts`; the current file owns the `Point` type, `PointTransformOptions`, and the `Point` namespace helpers directly.
- `/Users/zbeyens/git/slate-v2/packages/slate/src/interfaces/range-ref.ts` — the old file was only a wrapper back to `interfaces.ts`; the current file owns `RangeRefAffinity`, `RangeRef`, and `RangeRefOptions` directly.
- `/Users/zbeyens/git/slate-v2/packages/slate/src/interfaces/range.ts` — the old file was only a wrapper back to `interfaces.ts`; the current file owns the `Range` type, `RangeDirection`, `RangeTransformOptions`, `PointEntry`, and the `Range` namespace helpers directly.
- `/Users/zbeyens/git/slate-v2/packages/slate/src/interfaces/scrubber.ts` — the old file was only a wrapper back to `interfaces.ts`; the current file owns the `Scrubber` type and active scrubber registry directly.
- `/Users/zbeyens/git/slate-v2/packages/slate/src/interfaces/text.ts` — the old file was only a wrapper back to `interfaces.ts`; the current file owns the `Text` type surface, `LeafPosition`, `DecoratedRange`, and the `Text` namespace helpers directly.
- `/Users/zbeyens/git/slate-v2/packages/slate/src/interfaces/transforms/general.ts` — the old file faked ownership through a wildcard aggregate re-export; the current file is an explicit type barrel for the remaining general transform option surface.
- `/Users/zbeyens/git/slate-v2/packages/slate/src/interfaces/transforms/index.ts` — the old file faked ownership through a wildcard aggregate re-export; the current file is an explicit type barrel over the remaining transform option families.
- `/Users/zbeyens/git/slate-v2/packages/slate/src/interfaces/transforms/node.ts` — the old file faked ownership through a wildcard aggregate re-export; the current file explicitly re-exports the node transform option types.
- `/Users/zbeyens/git/slate-v2/packages/slate/src/interfaces/transforms/selection.ts` — the old file faked ownership through a wildcard aggregate re-export; the current file explicitly re-exports the surviving selection transform option type.
- `/Users/zbeyens/git/slate-v2/packages/slate/src/interfaces/transforms/text.ts` — the old file faked ownership through a wildcard aggregate re-export; the current file explicitly re-exports the text/fragment transform option types.
- `/Users/zbeyens/git/slate-v2/packages/slate/src/transforms-node.ts` — the old file carried all node transform bodies in one aggregate module; the current file is reduced to explicit re-exports so the historical method paths own the behavior again.
- `/Users/zbeyens/git/slate-v2/packages/slate/src/transforms-node/shared.ts` — new file added because the restored node transform files still share path comparison, point comparison, location guards, and indexed-path helpers, and keeping those few helpers in one support file is cleaner than recreating a second omnibus transform owner.
- `/Users/zbeyens/git/slate-v2/packages/slate/src/transforms-node/index.ts` — the old file faked ownership through `export * from '../transforms-node'`; the current file explicitly re-exports the real node transform owner files.
- `/Users/zbeyens/git/slate-v2/packages/slate/src/transforms-node/insert-nodes.ts` — the old file inserted nodes directly at `options.at`; the current file restores the method path as the owner and still batches multi-node insertion through `withTransaction(...)` plus indexed `insert_node` operations.
- `/Users/zbeyens/git/slate-v2/packages/slate/src/transforms-node/lift-nodes.ts` — the old file lifted matching nodes through Slate's generic node iteration and path transforms; the current file restores the method path as the owner and keeps the narrower current behavior for direct paths or top-level wrapper-child ranges.
- `/Users/zbeyens/git/slate-v2/packages/slate/src/transforms-node/merge-nodes.ts` — the old file merged through Slate's broader merge semantics; the current file restores the method path as the owner and keeps the current restricted cases: sibling text nodes or same-type element nodes, with `shouldMergeNodesRemovePrevNode(...)` checked first.
- `/Users/zbeyens/git/slate-v2/packages/slate/src/transforms-node/move-nodes.ts` — the old file moved nodes through the generic transform layer; the current file restores the method path as the owner and keeps the explicit current `move_node` operation with `Path.transform(...)` only for the overlapping-path adjustment.
- `/Users/zbeyens/git/slate-v2/packages/slate/src/transforms-node/remove-nodes.ts` — the old file removed nodes through the generic transform layer; the current file restores the method path as the owner and keeps the direct current `remove_node` operation after resolving the live node at the target path.
- `/Users/zbeyens/git/slate-v2/packages/slate/src/transforms-node/set-nodes.ts` — the old file used Slate's generic node transform matching flow; the current file restores the method path as the owner and keeps the current split between direct single-path `set_node` and batched `Editor.nodes(...)` iteration inside `withTransaction(...)`.
- `/Users/zbeyens/git/slate-v2/packages/slate/src/transforms-node/split-nodes.ts` — the old file split nodes through Slate's broader split transform logic; the current file restores the method path as the owner and keeps the current narrower support for exact paths or text points only.
- `/Users/zbeyens/git/slate-v2/packages/slate/src/transforms-node/unset-nodes.ts` — the old file unset properties through the generic node transform layer; the current file restores the method path as the owner and keeps the current direct `set_node` operation that marks removed keys in `properties` and sends an empty `newProperties`.
- `/Users/zbeyens/git/slate-v2/packages/slate/src/transforms-node/unwrap-nodes.ts` — the old file unwrapped matching nodes through Slate's generic unwrap logic; the current file restores the method path as the owner and keeps the current narrower support for direct wrapper paths or top-level wrapper block ranges with element children.
- `/Users/zbeyens/git/slate-v2/packages/slate/src/transforms-node/wrap-nodes.ts` — the old file wrapped matching nodes through Slate's generic wrap logic; the current file restores the method path as the owner and keeps the current narrower support for exact paths or top-level block ranges using explicit `insert_node`, `move_node`, and final selection remapping.
- `/Users/zbeyens/git/slate-v2/packages/slate/src/transforms-selection/collapse.ts` — the old file used `Range.edges(...)` plus `Transforms.select(...)`; the current file applies `createSetSelectionOperation(...)` directly and uses shared point-order helpers.
- `/Users/zbeyens/git/slate-v2/packages/slate/src/transforms-selection/deselect.ts` — the old file built a raw `set_selection` operation inline; the current file uses `createSetSelectionOperation(...)` and `getCurrentSelection(...)`.
- `/Users/zbeyens/git/slate-v2/packages/slate/src/transforms-selection/index.ts` — the old file re-exported the aggregate `../transforms-selection`; the current file explicitly re-exports the per-method selection files.
- `/Users/zbeyens/git/slate-v2/packages/slate/src/transforms-selection/move.ts` — the old file used `Range.isBackward(...)`, `Editor.before/after(...)`, and `Transforms.setSelection(...)`; the current file resolves edges with shared compare helpers and delegates the final write to `setSelection(...)`.
- `/Users/zbeyens/git/slate-v2/packages/slate/src/transforms-selection/select.ts` — the old file normalized the target through `Editor.range(...)` and threw on non-range creation from `null` selection; the current file resolves `Path` / `Point` / `Range | null` directly and applies the resulting selection through `createSetSelectionOperation(...)`.
- `/Users/zbeyens/git/slate-v2/packages/slate/src/transforms-selection/set-point.ts` — the old file delegated through `Range`/`Transforms` helpers; the current file reads the current selection directly, resolves the target edge with shared compare helpers, and applies the point update through `createSetSelectionOperation(...)`.
- `/Users/zbeyens/git/slate-v2/packages/slate/src/transforms-selection/set-selection.ts` — the old file delegated through the aggregate selection helpers; the current file compares paths directly and applies only changed anchor/focus fields through `createSetSelectionOperation(...)`.
- `/Users/zbeyens/git/slate-v2/packages/slate/src/transforms-text.ts` — the old file mixed `insertText`, `removeText`, and the full delete behavior in one aggregate module; the current file keeps only `insertText`/`removeText` plus an explicit re-export of `deleteAt`, so the historical delete path owns the real deletion logic again.
- `/Users/zbeyens/git/slate-v2/packages/slate/src/transforms-fragment.ts` — the old file owned the current `insertFragment(...)` body directly; the current file is reduced to an explicit re-export so the historical `transforms-text/insert-fragment.ts` path owns that behavior again.
- `/Users/zbeyens/git/slate-v2/packages/slate/src/transforms-text/delete-text.ts` — the old file deleted through Slate's generic text deletion flow; the current file restores the method path as the owner and keeps the current explicit logic for same-text deletion, mixed-inline deletion, and adjacent top-level block deletion.
- `/Users/zbeyens/git/slate-v2/packages/slate/src/transforms-text/index.ts` — the old file faked ownership through `export * from '../transforms-text'`; the current file explicitly re-exports the real historical text transform owner files.
- `/Users/zbeyens/git/slate-v2/packages/slate/src/transforms-text/insert-fragment.ts` — the old file inserted fragments directly; the current file restores that historical path as the owner and keeps the current explicit `insert_fragment` operation body there.
- `/Users/zbeyens/git/slate-v2/packages/slate/src/types/custom-types.ts` — `custom-types.ts` was removed from `src/types/`; the current package no longer keeps that separate type-helper tree on disk.
- `/Users/zbeyens/git/slate-v2/packages/slate/src/types/index.ts` — `index.ts` was removed from `src/types/`; the current package no longer keeps that separate type-helper tree on disk.
- `/Users/zbeyens/git/slate-v2/packages/slate/src/types/types.ts` — `types.ts` was removed from `src/types/`; the current package no longer keeps that separate type-helper tree on disk.
- `/Users/zbeyens/git/slate-v2/packages/slate/src/utils/deep-equal.ts` — `deep-equal.ts` was removed from `src/utils/`; the current package no longer keeps that separate utility tree on disk.
- `/Users/zbeyens/git/slate-v2/packages/slate/src/utils/get-default-insert-location.ts` — `get-default-insert-location.ts` was removed from `src/utils/`; the current package no longer keeps that separate utility tree on disk.
- `/Users/zbeyens/git/slate-v2/packages/slate/src/utils/index.ts` — `index.ts` was removed from `src/utils/`; the current package no longer keeps that separate utility tree on disk.
- `/Users/zbeyens/git/slate-v2/packages/slate/src/utils/is-object.ts` — `is-object.ts` was removed from `src/utils/`; the current package no longer keeps that separate utility tree on disk.
- `/Users/zbeyens/git/slate-v2/packages/slate/src/utils/match-path.ts` — `match-path.ts` was removed from `src/utils/`; the current package no longer keeps that separate utility tree on disk.
- `/Users/zbeyens/git/slate-v2/packages/slate/src/utils/modify.ts` — `modify.ts` was removed from `src/utils/`; the current package no longer keeps that separate utility tree on disk.
- `/Users/zbeyens/git/slate-v2/packages/slate/src/utils/string.ts` — `string.ts` was removed from `src/utils/`; the current package no longer keeps that separate utility tree on disk.
- `/Users/zbeyens/git/slate-v2/packages/slate/src/utils/types.ts` — `utils/types.ts` was added back because `WithEditorFirstArg` and related helper types are still used by the restored method-path files.
- `/Users/zbeyens/git/slate-v2/packages/slate/src/utils/weak-maps.ts` — `weak-maps.ts` was removed from `src/utils/`; the current package no longer keeps that separate utility tree on disk.
Core deleted test drift:

- `/Users/zbeyens/git/slate-v2/packages/slate/test/**` — `1048` deleted test files were reviewed file-by-file in `/Users/zbeyens/git/plate-2/docs/plans/2026-04-09-slate-v2-core-deleted-test-family-closeout.md`; that closeout remains the exhaustive owner instead of duplicating a thousand-row block here.

### 3. Ref And Location Doc Truth Drift

Affected files:

- `/Users/zbeyens/git/slate-v2/docs/api/nodes/editor.md`
- `/Users/zbeyens/git/slate-v2/docs/api/locations/location.md`
- `/Users/zbeyens/git/slate-v2/docs/api/locations/path-ref.md`
- `/Users/zbeyens/git/slate-v2/docs/api/locations/point-ref.md`
- `/Users/zbeyens/git/slate-v2/docs/api/locations/range-ref.md`
- `/Users/zbeyens/git/slate-v2/docs/concepts/03-locations.md`
- `/Users/zbeyens/git/slate-v2/docs/concepts/12-typescript.md`
- `/Users/zbeyens/git/slate-v2/packages/slate/src/interfaces/location.ts`
- `/Users/zbeyens/git/slate-v2/packages/slate/src/interfaces/path-ref.ts`
- `/Users/zbeyens/git/slate-v2/packages/slate/src/interfaces/point-ref.ts`
- `/Users/zbeyens/git/slate-v2/packages/slate/src/interfaces/range-ref.ts`
- `/Users/zbeyens/git/slate-v2/packages/slate/src/editor/path-ref.ts`
- `/Users/zbeyens/git/slate-v2/packages/slate/src/editor/point-ref.ts`
- `/Users/zbeyens/git/slate-v2/packages/slate/src/editor/range-ref.ts`

Why this drift exists:

- the docs were claiming static ref-transform helpers that the current runtime
  model does not expose
- the editor owns ref rebasing, so pretending refs are legacy transformable
  structs would be false
- the location namespace grew real type guards that the docs had never listed

Supporting rationale:

- [2026-04-09-slate-runtime-backed-refs-should-not-pretend-to-be-legacy-transformable-structs.md](/Users/zbeyens/git/plate-2/docs/solutions/developer-experience/2026-04-09-slate-runtime-backed-refs-should-not-pretend-to-be-legacy-transformable-structs.md)
- [2026-04-09-slate-v2-ref-docs-truth-pass.md](/Users/zbeyens/git/plate-2/docs/plans/2026-04-09-slate-v2-ref-docs-truth-pass.md)

Accepted drift:

- `PathRef.transform(...)`, `PointRef.transform(...)`, and
  `RangeRef.transform(...)` were removed from the docs because they are not
  honest current API

Per-file user-facing justification:

- `/Users/zbeyens/git/slate-v2/docs/api/nodes/editor.md` — the editor API doc changed only where the legacy page no longer matched the shipped API: it now lists the current helper surface (`getChildren`, `getDirtyPaths`, `getSnapshot`, `projectRange`, `setChildren`, `subscribe`, `withTransaction`) and the recovered `before(...)` / `after(...)` option width (`Location` plus `distance`, `unit`, and `voids`) without extra reviewer prose. `Location` is still the exact current alias for `Path | Point | Range`, so the doc should use the alias instead of expanding it inline.
- `/Users/zbeyens/git/slate-v2/docs/api/locations/location.md` — added the
  current `Location.isPath`, `Location.isPoint`, `Location.isRange`, and
  `Location.isSpan` helpers because they now exist in the exported namespace.
- `/Users/zbeyens/git/slate-v2/docs/api/locations/path-ref.md` — removed the
  fake static `PathRef.transform(...)` claim and kept the real create/current/
  `unref()` lifecycle.
- `/Users/zbeyens/git/slate-v2/docs/api/locations/point-ref.md` — removed the
  fake static `PointRef.transform(...)` claim and kept the real create/current/
  `unref()` lifecycle.
- `/Users/zbeyens/git/slate-v2/docs/api/locations/range-ref.md` — removed the
  fake static `RangeRef.transform(...)` claim and kept the real create/current/
  `unref()` plus affinity contract.
- `/Users/zbeyens/git/slate-v2/docs/concepts/03-locations.md` — the locations concept doc changed because one example still pointed at the old `SlateNode.common(...)` name instead of the live `Node.common(...)` export.
- `/Users/zbeyens/git/slate-v2/docs/concepts/12-typescript.md` — the TypeScript concept doc changed because it still taught declaration-merging `CustomTypes` as the live Slate typing model, but that surface is now a hard cut; the docs need to describe the current non-claim honestly instead of pretending the old seam survives.

Per-file source counterpart justification:

- `/Users/zbeyens/git/slate-v2/packages/slate/src/interfaces/location.ts` — this source file now owns the real `Location` type guards, so the location docs had to describe those exported helpers instead of the thinner older namespace story.
- `/Users/zbeyens/git/slate-v2/packages/slate/src/interfaces/path-ref.ts` — this source file defines the current path-ref type surface with create/current/`unref()` behavior only, so the docs had to stop promising a static transform helper that is not exported here.
- `/Users/zbeyens/git/slate-v2/packages/slate/src/interfaces/point-ref.ts` — this source file defines the current point-ref type surface with create/current/`unref()` behavior only, so the docs had to stop promising a static transform helper that is not exported here.
- `/Users/zbeyens/git/slate-v2/packages/slate/src/interfaces/range-ref.ts` — this source file defines the current range-ref type surface with create/current/`unref()` plus affinity only, so the docs had to stop promising a static transform helper that is not exported here.
- `/Users/zbeyens/git/slate-v2/packages/slate/src/editor/path-ref.ts` — this editor wrapper is the live owner for creating path refs on an editor instance, which is why the docs now describe editor-owned ref rebasing instead of a standalone static ref transform API.
- `/Users/zbeyens/git/slate-v2/packages/slate/src/editor/point-ref.ts` — this editor wrapper is the live owner for creating point refs on an editor instance, which is why the docs now describe editor-owned ref rebasing instead of a standalone static ref transform API.
- `/Users/zbeyens/git/slate-v2/packages/slate/src/editor/range-ref.ts` — this editor wrapper is the live owner for creating range refs on an editor instance, which is why the docs now describe editor-owned ref rebasing instead of a standalone static ref transform API.

### 4. History And Collaboration Drift

Affected files:

- `/Users/zbeyens/git/slate-v2/packages/slate-history/package.json`
- `/Users/zbeyens/git/slate-v2/packages/slate-history/src/**`
- `/Users/zbeyens/git/slate-v2/packages/slate-history/test/**`
- `/Users/zbeyens/git/slate-v2/docs/libraries/slate-history/history-editor.md`
- `/Users/zbeyens/git/slate-v2/docs/libraries/slate-history/history.md`
- `/Users/zbeyens/git/slate-v2/docs/api/operations/README.md`
- `/Users/zbeyens/git/slate-v2/docs/api/operations/operation.md`
- `/Users/zbeyens/git/slate-v2/docs/walkthroughs/07-enabling-collaborative-editing.md`

Why this drift exists:

- history is now documented and proved around committed batches and
  before/after snapshots
- collaboration guidance had to stop implying that `slate-v2` ships its own
  multiplayer layer
- deleted legacy history tests were closed only after live undo/redo behavior
  was re-proved elsewhere

Accepted drift:

- `HistoryBatch` shape widened in docs because the current history model keeps
  `before`, `after`, `selectionBefore`, and `selectionAfter`
- collaboration docs explicitly mark `slate-yjs` as external

Supporting rationale:

- [2026-04-09-slate-collaboration-docs-must-mark-the-external-adapter-boundary.md](/Users/zbeyens/git/plate-2/docs/solutions/documentation-gaps/2026-04-09-slate-collaboration-docs-must-mark-the-external-adapter-boundary.md)

Per-file user-facing justification:

- `/Users/zbeyens/git/slate-v2/docs/libraries/slate-history/history-editor.md`
  — updated the `HistoryEditor` interface and `writeHistory(...)` signature to
  match the current typed batch surface.
- `/Users/zbeyens/git/slate-v2/docs/libraries/slate-history/history.md` —
  updated the documented `HistoryBatch` shape to include the current snapshot
  fields and `selectionAfter`.
- `/Users/zbeyens/git/slate-v2/docs/api/operations/README.md` — corrected the
  documented operation signatures, including narrowing `insert_fragment.at` to
  the current `Point | Range` shape and keeping `set_selection` on the current
  full-range previous/next form.
- `/Users/zbeyens/git/slate-v2/docs/api/operations/operation.md` — documented
  why `insert_fragment` still exists as a semantic low-level op even though raw
  payload alone is not directly invertible.
- `/Users/zbeyens/git/slate-v2/docs/walkthroughs/07-enabling-collaborative-editing.md`
  — marked `slate-yjs` as the external adapter owner and switched examples to
  the current structured editing surface.

### 5. React Runtime Drift In `packages/slate-react`

Affected files:

- `/Users/zbeyens/git/slate-v2/packages/slate-react/package.json`
- `/Users/zbeyens/git/slate-v2/packages/slate-react/src/**`
- `/Users/zbeyens/git/slate-v2/packages/slate-react/test/**`
- `/Users/zbeyens/git/slate-v2/docs/libraries/slate-react/README.md`
- `/Users/zbeyens/git/slate-v2/docs/libraries/slate-react/editable.md`
- `/Users/zbeyens/git/slate-v2/docs/libraries/slate-react/event-handling.md`
- `/Users/zbeyens/git/slate-v2/docs/libraries/slate-react/hooks.md`
- `/Users/zbeyens/git/slate-v2/docs/libraries/slate-react/react-editor.md`
- `/Users/zbeyens/git/slate-v2/docs/libraries/slate-react/slate.md`
- `/Users/zbeyens/git/slate-v2/docs/libraries/slate-react/with-react.md`
- `/Users/zbeyens/git/slate-v2/docs/concepts/09-rendering.md`
- `/Users/zbeyens/git/slate-v2/docs/walkthroughs/01-installing-slate.md`
- `/Users/zbeyens/git/slate-v2/docs/walkthroughs/02-adding-event-handlers.md`
- `/Users/zbeyens/git/slate-v2/docs/walkthroughs/03-defining-custom-elements.md`
- `/Users/zbeyens/git/slate-v2/docs/walkthroughs/04-applying-custom-formatting.md`
- `/Users/zbeyens/git/slate-v2/docs/walkthroughs/05-executing-commands.md`
- `/Users/zbeyens/git/slate-v2/docs/walkthroughs/06-saving-to-a-database.md`

Why this drift exists:

- the React package surface changed materially, so the docs had to stop talking
  like old `Editable`-only, declaration-merging, controlled-value Slate
- the mounted editor/provider/runtime helpers are now shaped around
  `EditableBlocks`, `initialValue`, `onValueChange`, and the current
  `ReactEditor` helper set
- deleted chunking, restore-dom, Android manager, and old hook families were
  either cut or internalized, so docs had to stop implying they remain product
  surface

Accepted drift:

- docs now prefer `EditableBlocks` / `EditableTextBlocks` where that matches the
  actual structured editing surface
- `Editable` docs remain, but as lower-level DOM ownership docs
- TypeScript docs now describe structural node typing instead of declaration
  merging

Supporting rationale:

- [2026-04-09-slate-v2-editable-docs-truth-pass.md](/Users/zbeyens/git/plate-2/docs/plans/2026-04-09-slate-v2-editable-docs-truth-pass.md)
- [2026-04-09-slate-v2-slate-provider-recovery.md](/Users/zbeyens/git/plate-2/docs/plans/2026-04-09-slate-v2-slate-provider-recovery.md)

Per-file user-facing justification:

- `/Users/zbeyens/git/slate-v2/docs/libraries/slate-react/README.md` — cut the
  over-expanded index back to a simple current entry page.
- `/Users/zbeyens/git/slate-v2/docs/libraries/slate-react/editable.md` —
  documents `Editable` as the lower-level surface and `EditableBlocks` as the
  main structured editor surface.
- `/Users/zbeyens/git/slate-v2/docs/libraries/slate-react/event-handling.md`
  — keeps the old event-handling shape but updates examples to the current
  structured component.
- `/Users/zbeyens/git/slate-v2/docs/libraries/slate-react/hooks.md` — aligns
  hook descriptions and signatures with the current React context model.
- `/Users/zbeyens/git/slate-v2/docs/libraries/slate-react/react-editor.md` —
  corrects the documented helper signatures and DOM translation surface.
- `/Users/zbeyens/git/slate-v2/docs/libraries/slate-react/slate.md` —
  corrects provider props to the current `initialValue` / `onValueChange` /
  `onSelectionChange` model and makes the provider-owned `projectionStore`
  story explicit.
- `/Users/zbeyens/git/slate-v2/docs/libraries/slate-react/with-react.md` —
  updates the wrapper description and `clipboardFormatKey` wording to current
  behavior.
- `/Users/zbeyens/git/slate-v2/docs/libraries/slate-react/editable.md` —
  now makes `projectionStore` the live inline-overlay story instead of leaving
  decorate-era assumptions implied.
- `/Users/zbeyens/git/slate-v2/docs/libraries/slate-react/hooks.md` — now
  documents the overlay hooks that own decoration sources, annotation stores,
  widget stores, projected slices, and the lower-level range-ref escape hatch.
- `/Users/zbeyens/git/slate-v2/docs/concepts/09-rendering.md` — moves render
  examples to the current `EditableBlocks` surface and current `renderText` /
  `renderPlaceholder` usage.
- `/Users/zbeyens/git/slate-v2/docs/walkthroughs/01-installing-slate.md` —
  adds the current headless install path and updates examples to
  `EditableBlocks`, `initialValue`, and structural typing.
- `/Users/zbeyens/git/slate-v2/docs/walkthroughs/02-adding-event-handlers.md`
  — updates the walkthrough examples to the current structured editing surface.
- `/Users/zbeyens/git/slate-v2/docs/walkthroughs/03-defining-custom-elements.md`
  — updates custom-element examples to the current structured editing surface.
- `/Users/zbeyens/git/slate-v2/docs/walkthroughs/04-applying-custom-formatting.md`
  — updates formatting examples to the current component and block-type
  semantics.
- `/Users/zbeyens/git/slate-v2/docs/walkthroughs/05-executing-commands.md` —
  updates command examples to the current component and block-type semantics.
- `/Users/zbeyens/git/slate-v2/docs/walkthroughs/06-saving-to-a-database.md` —
  updates persistence examples to the current `onValueChange` flow.

### 6. DOM Package Narrowing Drift In `packages/slate-dom`

Affected files:

- `/Users/zbeyens/git/slate-v2/packages/slate-dom/package.json`
- `/Users/zbeyens/git/slate-v2/packages/slate-dom/src/index.ts`
- `/Users/zbeyens/git/slate-v2/packages/slate-dom/src/plugin/dom-editor.ts`
- `/Users/zbeyens/git/slate-v2/packages/slate-dom/src/plugin/with-dom.ts`
- `/Users/zbeyens/git/slate-v2/packages/slate-dom/src/utils/**`
- `/Users/zbeyens/git/slate-v2/packages/slate-dom/src/custom-types.ts`
- `/Users/zbeyens/git/slate-v2/packages/slate-dom/tsconfig.json`

Why this drift exists:

- the old DOMEditor-heavy helper pile was cut down to the narrower
  browser-boundary surface that the current stack can actually support and
  prove
- the deleted DOM files are not “forgotten”; they are intentional cuts behind a
  narrower explicit package claim

### 7. Example And Browser Proof Drift

Affected files:

- `/Users/zbeyens/git/slate-v2/packages/slate-hyperscript/test/**`
- `/Users/zbeyens/git/slate-v2/playwright/integration/examples/*.test.ts`
- `/Users/zbeyens/git/slate-v2/playwright/docker/run-tests.sh`
- `/Users/zbeyens/git/slate-v2/playwright/tsconfig.json`
- `/Users/zbeyens/git/slate-v2/site/examples/ts/*.tsx`
- `/Users/zbeyens/git/slate-v2/site/examples/ts/components/index.tsx`
- `/Users/zbeyens/git/slate-v2/site/examples/ts/custom-types.d.ts`
- `/Users/zbeyens/git/slate-v2/site/constants/examples.ts`
- `/Users/zbeyens/git/slate-v2/site/examples/Readme.md`
- `/Users/zbeyens/git/slate-v2/site/components/ExampleLayout.tsx`
- `/Users/zbeyens/git/slate-v2/site/tsconfig.example.json`

Why this drift exists:

- contributor-facing example slots were recovered on the current runtime, not by
  preserving old internal file shapes
- the handwritten JS example mirror was cut so the contributor-facing site has
  one maintained source of truth instead of a permanently drifting duplicate
- the hyperscript fixture corpus had to stop depending on stale implicit JSX
  globals and match the current test bootstrap
- browser tests were widened to match the recovered current surfaces
- the default local browser gate had to become explicit about what it does and
  does not prove: current chromium proof lane by default, legacy comparison
  only when a second legacy base URL is actually wired

Explicit cuts in this group:

- `playwright/integration/examples/huge-document.test.ts`
- `playwright/integration/examples/select.test.ts`
- `site/examples/ts/custom-types.d.ts`

Why those cuts were accepted:

- each cut was either mapped to a better owner or explicit skip instead of left
  as silent loss

Accepted drift:

- the example site now points only at the TypeScript example owners because the
  handwritten JS mirror lane was removed instead of maintained in parallel
- the replacement compatibility matrix stays in the tree, but the legacy half
  now self-skips unless `LEGACY_PLAYWRIGHT_BASE_URL` is provided, because the
  default local gate does not boot a second legacy app
- the default browser gate is deliberately narrower than the full historical
  matrix: chromium, workers `1`, current runtime first
- this drift group does **not** claim that example parity is already closed for
  all legacy examples; that lane is now owned by
  [2026-04-15-slate-v2-example-parity-recovery-plan.md](/Users/zbeyens/git/plate-2/docs/plans/2026-04-15-slate-v2-example-parity-recovery-plan.md)
- legacy examples may be added or extended when the rewrite unlocked a fairer
  comparison, but those rows must be labeled explicitly instead of being folded
  into vague “better cut” language

Per-file family justification:

- `/Users/zbeyens/git/slate-v2/packages/slate-hyperscript/test/**` — the
  fixture family changed because the current hyperscript fixtures now run
  against the rebuilt Babel/bootstrap path and explicit current
  `createHyperscript(...)` usage instead of stale implicit JSX/React globals.
- `/Users/zbeyens/git/slate-v2/playwright/integration/examples/*.test.ts` —
  browser proofs changed because they now target the recovered current example
  surfaces, the narrowed current chromium gate, and the explicit legacy-vs-
  replacement split where only the legacy half requires a second server.
- `/Users/zbeyens/git/slate-v2/playwright/docker/run-tests.sh` — the Docker
  runner changed because the local/CI browser lane now starts the site through
  pnpm instead of the removed Yarn path.
- `/Users/zbeyens/git/slate-v2/playwright/tsconfig.json` — the Playwright TS
  config changed because the browser proof lane moved onto the current TS tool
  chain.
- `/Users/zbeyens/git/slate-v2/site/examples/ts/*.tsx` —
  contributor-facing TS examples changed because they are now the only
  maintained example owners on the live site surface.
- `/Users/zbeyens/git/slate-v2/site/examples/ts/components/index.tsx` — the TS
  example barrel changed because the visible example set and restored example
  owners changed together.
- `/Users/zbeyens/git/slate-v2/site/examples/ts/custom-types.d.ts` — this file
  was cut because the current example surface no longer uses the old custom
  declaration-merging path as its live typing model.
- `/Users/zbeyens/git/slate-v2/site/components/ExampleLayout.tsx` — the
  example header changed because the site no longer offers a dead JS source
  link once the handwritten JS lane is cut.
- `/Users/zbeyens/git/slate-v2/site/tsconfig.example.json` — this file was cut
  because the repo no longer compiles TypeScript examples into a handwritten JS
  mirror directory.
- `/Users/zbeyens/git/slate-v2/site/constants/examples.ts` — the example
  registry changed because the visible/hidden example inventory had to match
  the recovered current example set.
- `/Users/zbeyens/git/slate-v2/site/examples/Readme.md` — the example readme
  changed because it still described the wrong install/start commands and the
  wrong example topology for the current repo.

### 8. Slate Repo Doc Drift

Affected files:

- `/Users/zbeyens/git/slate-v2/docs/api/nodes/editor.md`
- `/Users/zbeyens/git/slate-v2/docs/api/nodes/element.md`
- `/Users/zbeyens/git/slate-v2/docs/api/nodes/node.md`
- `/Users/zbeyens/git/slate-v2/docs/api/nodes/text.md`
- `/Users/zbeyens/git/slate-v2/docs/api/locations/bookmark.md`
- `/Users/zbeyens/git/slate-v2/docs/api/scrubber.md`
- `/Users/zbeyens/git/slate-v2/docs/api/transforms.md`
- `/Users/zbeyens/git/slate-v2/docs/concepts/01-interfaces.md`
- `/Users/zbeyens/git/slate-v2/docs/concepts/02-nodes.md`
- `/Users/zbeyens/git/slate-v2/docs/concepts/03-locations.md`
- `/Users/zbeyens/git/slate-v2/docs/concepts/05-operations.md`
- `/Users/zbeyens/git/slate-v2/docs/concepts/07-editor.md`
- `/Users/zbeyens/git/slate-v2/docs/concepts/08-plugins.md`
- `/Users/zbeyens/git/slate-v2/docs/concepts/11-normalizing.md`
- `/Users/zbeyens/git/slate-v2/docs/concepts/12-typescript.md`
- `/Users/zbeyens/git/slate-v2/docs/concepts/xx-migrating.md`
- `/Users/zbeyens/git/slate-v2/docs/general/contributing.md`
- `/Users/zbeyens/git/slate-v2/docs/general/replacement-candidate.md`
- `/Users/zbeyens/git/slate-v2/docs/walkthroughs/09-performance.md`
- `/Users/zbeyens/git/slate-v2/site/examples/Readme.md`

Why this drift exists:

- many docs were describing APIs or behaviors that the current source does not
  expose
- the docs had to be brought back to current truth
- during cleanup, unnecessary rewrite drift was repaired so the remaining doc
  diffs are narrower than they were mid-stream

Accepted drift:

- docs now use the current component and hook names where the old names would be
  false
- docs removed fake legacy claims when those claims had no honest current
  backing
- docs were trimmed back toward original Slate voice where the earlier rewrite
  had become gratuitous
- docs now put `Bookmark` ahead of `RangeRef` when the reader wants a durable
  public anchor

Supporting rationale:

- [2026-04-09-slate-v2-ref-docs-truth-pass.md](/Users/zbeyens/git/plate-2/docs/plans/2026-04-09-slate-v2-ref-docs-truth-pass.md)
- [2026-04-09-slate-runtime-backed-refs-should-not-pretend-to-be-legacy-transformable-structs.md](/Users/zbeyens/git/plate-2/docs/solutions/developer-experience/2026-04-09-slate-runtime-backed-refs-should-not-pretend-to-be-legacy-transformable-structs.md)

Per-file user-facing justification:

- `/Users/zbeyens/git/slate-v2/docs/api/nodes/editor.md` — aligns the editor
  interface, helper descriptions, normalization hooks, and ref docs with the
  current implementation. The doc should keep the `InsertNodesOptions` alias on
  `Editor.insertNode(...)` because the live public signature literally reuses
  that alias and the singular helper is just a thin wrapper over
  `editor.insertNodes(...)`.
- `/Users/zbeyens/git/slate-v2/docs/api/nodes/editor.md` — the same page now
  names `Editor.bookmark(...)` as the durable public anchor helper and demotes
  `Editor.rangeRef(...)` to the lower-level live-ref story.
- `/Users/zbeyens/git/slate-v2/docs/api/locations/bookmark.md` — new file
  added because `Bookmark` is part of the exported public surface and the docs
  need a first-class durable-anchor page instead of routing readers through
  `RangeRef` first.
- `/Users/zbeyens/git/slate-v2/docs/api/nodes/element.md` — updates `children`
  typing and adds the current `Element.isElementProps(...)` helper.
- `/Users/zbeyens/git/slate-v2/docs/api/nodes/node.md` — adds the current node
  type guard helpers that now exist on `Node`.
- `/Users/zbeyens/git/slate-v2/docs/api/nodes/text.md` — adds the current
  `Text.isTextProps(...)` helper.
- `/Users/zbeyens/git/slate-v2/docs/api/scrubber.md` — fixes the example to the
  current local `textRandomizer(...)` usage instead of a stale namespaced call.
- `/Users/zbeyens/git/slate-v2/docs/api/transforms.md` — keeps the recovered
  transform docs close to legacy wording while fixing the real contract drift:
  the current required-vs-optional transform options, the recovered public
  `wrapNodes`/`unwrapNodes`/`liftNodes` option bags, the `setSelection(...)`
  insert-text fallback, and the added public `removeText(...)` /
  `applyBatch(...)` entries.
- `/Users/zbeyens/git/slate-v2/docs/concepts/01-interfaces.md` — updates the
  `Element.children` example to `Descendant[]`.
- `/Users/zbeyens/git/slate-v2/docs/concepts/02-nodes.md` — updates node
  interface examples and the inline-behavior note to current rules.
- `/Users/zbeyens/git/slate-v2/docs/concepts/03-locations.md` — fixes the
  example to `Node.common(...)`.
- `/Users/zbeyens/git/slate-v2/docs/concepts/05-operations.md` — corrects the
  `set_selection` example to include both anchor and focus.
- `/Users/zbeyens/git/slate-v2/docs/concepts/07-editor.md` — updates the
  editor interface and normalization discussion to the current editor model.
- `/Users/zbeyens/git/slate-v2/docs/concepts/08-plugins.md` — documents the
  current editor-augmentation plugin model and headless usage more honestly.
- `/Users/zbeyens/git/slate-v2/docs/concepts/11-normalizing.md` — replaces the
  stale blanket built-in normalization story with the current built-in rules
  plus app-owned normalization guidance.
- `/Users/zbeyens/git/slate-v2/docs/concepts/12-typescript.md` — replaces the
  stale declaration-merging story with the current structural typing model.
- `/Users/zbeyens/git/slate-v2/docs/concepts/xx-migrating.md` — updates the
  migration guide to the current editor, React, typing, and overlay surfaces.
- `/Users/zbeyens/git/slate-v2/docs/general/replacement-candidate.md` —
  restores the missing package-level claim page and states the current overlay
  split directly: projection stores for inline overlays, `Bookmark` for durable
  public anchors, annotation stores for anchored data, and widget stores for
  UI.
- `/Users/zbeyens/git/slate-v2/docs/general/contributing.md` — points Android /
  IME contributors at the current test entry path.
- `/Users/zbeyens/git/slate-v2/docs/walkthroughs/09-performance.md` — updates
  performance guidance to the current benchmark and example reality.
- `/Users/zbeyens/git/slate-v2/site/examples/Readme.md` — removes status-board
  phrasing and keeps only example descriptions that match the current example
  set.

### 9. Plate-Side Live Control Doc Drift

Affected files:

- `/Users/zbeyens/git/plate-2/docs/slate-v2/references/architecture-contract.md`
- `/Users/zbeyens/git/plate-2/docs/slate-v2/references/chunking-review.md`
- `/Users/zbeyens/git/plate-2/docs/slate-v2/commands/reconsolidate-roadmap.md`
- `/Users/zbeyens/git/plate-2/docs/slate-v2/commands/refresh-file-review-ledger.md`
- `/Users/zbeyens/git/plate-2/docs/slate-v2/archive/full-replacement-blockers.md`
- `/Users/zbeyens/git/plate-2/docs/slate-v2/references/live-shape-register.md`
- `/Users/zbeyens/git/plate-2/docs/slate-v2/master-roadmap.md`
- `/Users/zbeyens/git/plate-2/docs/slate-v2/archive/oracle-harvest-ledger.md`
- `/Users/zbeyens/git/plate-2/docs/slate-v2/overview.md`
- `/Users/zbeyens/git/plate-2/docs/slate-v2/release-file-review-ledger.md`
- `/Users/zbeyens/git/plate-2/docs/slate-v2/release-readiness-decision.md`
- `/Users/zbeyens/git/plate-2/docs/slate-v2/replacement-family-ledger.md`
- `/Users/zbeyens/git/plate-2/docs/slate-v2/replacement-gates-scoreboard.md`
- `/Users/zbeyens/git/plate-2/docs/slate-v2/true-slate-rc-proof-ledger.md`
- `/Users/zbeyens/git/plate-2/docs/plans/2026-04-07-slate-v2-full-release-regression-audit-plan.md`
- `/Users/zbeyens/git/plate-2/docs/plans/2026-04-09-slate-v2-public-surface-reconciliation.md`
- `/Users/zbeyens/git/plate-2/docs/plans/2026-04-09-slate-v2-runtime-browser-proof-closure.md`

Why this drift exists:

- the live control stack had to be reconciled with the now-closed lanes and the
  earned broader verdict
- older supporting notes that were still acting live had to be reframed or
  refreshed

Non-goal here:

- this file does not restate the live verdict; it only explains why those live
  docs changed together

### 10. Plate-Side Render Pipeline And List Drift

Affected files:

- `/Users/zbeyens/git/plate-2/packages/core/src/react/utils/pipeRenderElement.tsx`
- `/Users/zbeyens/git/plate-2/packages/core/src/react/utils/pipeRenderElement.spec.tsx`
- `/Users/zbeyens/git/plate-2/packages/core/src/react/utils/pipeRenderLeaf.tsx`
- `/Users/zbeyens/git/plate-2/packages/core/src/react/utils/pipeRenderText.tsx`
- `/Users/zbeyens/git/plate-2/packages/list/src/lib/BaseListPlugin.tsx`
- `/Users/zbeyens/git/plate-2/packages/list/src/lib/BaseListPlugin.spec.tsx`

Why this drift exists:

- the live checkout also contains Plate-side render-pipeline fixes that preserve
  injected node props and active wrappers on faster render paths
- the list plugin changed default unordered rendering back to native list
  containers, while preserving the lighter list-item rendering behind an option
  for benchmark-only surfaces

Accepted drift:

- these files are not Slate-v2 docs, but they are part of the actual final diff
  and therefore must be justified in the future PR body

## Removal

This file replaces the old plan artifact:

- `/Users/zbeyens/git/plate-2/docs/slate-v2/references/pr-description.md`

That older file should not remain live once this canonical maintainer-facing
source exists.
