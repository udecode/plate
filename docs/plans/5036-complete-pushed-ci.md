# Complete PR 5036 pushed CI

Objective:
Repair the entire current checkout, push every modified and untracked file to
PR 5036, and monitor the exact pushed SHA until every required GitHub and Vercel
check is terminal green. Do not merge.

## Scope and authority

- Repository: `udecode/plate`
- Pull request: https://github.com/udecode/plate/pull/5036
- Base at intake: `fa98e906637e8b2a0b331f1c3a22b91fd389fe9f`
- PR state: open draft; merge state `DIRTY`
- Allowed: read live CI, inspect logs/artifacts, edit and verify locally, commit
  the entire current checkout, push `next`, and repeat repairs/pushes until CI
  is green.
- Required push scope: every modified and untracked file in the current
  checkout, including changes outside the original CI repair.
- Forbidden: merge, release, deployment-setting mutation, or unrelated public
  comments/labels.

## Completion threshold

- [ ] Bind final remote conclusions to the new pushed SHA.
- [x] Wait for every GitHub-hosted check to reach a terminal state.
- [x] Wait for the original Vercel deployment to reach a terminal state.
- [x] Diagnose every failure from its exact log or artifact.
- [x] Repair every confirmed source failure locally without weakening proof.
- [x] Run focused proof and the affected strict/root handoff gates on final
      local bytes.
- [x] Record exact remote conclusions and timings.
- [x] Preserve unrelated user changes.
- [ ] Commit and push the entire checkout, then monitor the exact SHA.
- [ ] Finish with every required GitHub and Vercel check green.

The goal is complete only when every remote failure has a source-backed repair,
the final local closure is green, the entire checkout is pushed, and every
required check on that exact pushed SHA is terminal green.

## Remote check ledger

| Check | Conclusion | Duration | Evidence |
|---|---|---:|---|
| CI / CI (`32703421831 / 97359441110`) | failure | 5m37s | type-aware lint rejected two unnecessary assertions in `withLocale.ts` |
| Plite packages (`32703421804 / 97359441099`) | failure | 3m18s | Linux opened missing `packages/plite-hyperscript/Readme.md` |
| Plite adopter typecheck | success | 8m32s | terminal GitHub job |
| Plite browser build | success | 1m44s | terminal GitHub job |
| Plite browser chromium 1/4 | failure | 3m15s | three rich-text IME rows lost active marks |
| Plite browser chromium 2/4 | success | 5m34s | terminal GitHub job |
| Plite browser chromium 3/4 | success | 5m39s | terminal GitHub job |
| Plite browser chromium 4/4 | success | 7m08s | terminal GitHub job |
| Plite browser chromium coverage | failure | 12s | derivative failure because shard 1 was not passing |
| Plite browser matrix coverage | skipped | N/A | full matrix was not selected |
| Release and changelog | success | 1m38s | terminal GitHub job |
| Sync registry and templates after publish | skipped | N/A | workflow decision |
| Sync auto-release checkbox | skipped | N/A | workflow decision |
| Vercel Preview Comments | success | <1s | terminal status |
| Vercel deployment `71DznEZVYUjqtKsa63bjbToPG24L` | failure | 31m29s | OOM/SIGKILL while `www:build` compiled |
| Plite CI (`32719362878`) at `57c2622…` | success | 7m19s | every package, adopter, build, Chromium shard, and coverage job passed |
| Root CI (`32719381010`) at `57c2622…` | failure | 8m21s | `bun check` received SIGTERM during 61-package Turbo typecheck with no TypeScript diagnostic |
| Vercel deployment `6nP7XjLxiT85mnAxMAoQ9hGUwivo` at `57c2622…` | failure | 2m51s | build container reported OOM and SIGKILL about 72s into `www:build` compilation |

The GitHub-hosted suite reached its last terminal job 9m11s after the run
started. Vercel failed 22m18s later, so the original end-to-end red feedback
time was 31m29s.

## Failure diagnosis and local repairs

1. `apps/www/src/lib/withLocale.ts`
   - Root cause: Linux type-aware lint rejected two assertions, but deleting
     them made both www TypeScript programs reject dynamic route strings.
   - Repair: expose a `Route` overload over a string-returning implementation,
     with no assertions and correct call-site typing.
2. `packages/plite-hyperscript/test/package-readme-contract.test.ts`
   - Root cause: macOS accepted `Readme.md`, but Linux requires the repository's
     exact `README.md` casing.
   - Repair: open `README.md`.
3. `packages/plite-react/src/editable/composition-state.ts`
   - Root cause: a scheduled stale `marks: null` callback could run after
     `compositionstart` and clear captured insertion marks. The committed IME
     text and selection were correct, but the inserted leaves lost `strong`,
     `em`, and `code` marks.
   - Repair: do not clear pending insertion marks while the editor is composing.
4. `.changeset/plite-react-ime-marks.md`
   - `origin/main` contains the runtime bug, so the release delta is a real
   `@platejs/plite-react` patch: preserve active marks during IME composition.
5. `apps/www/src/lib/rehype-utils.ts`
   - Root cause: a dynamic registry file read made Turbopack trace the whole
     project. Vercel reached 31m29s and was OOM-killed in `www:build`.
   - Repair: resolve reads under the exact registry root and opt that read out
     of dynamic Turbopack tracing. Next output tracing already includes
     `./src/registry/**/*`, so deployment output remains complete.
6. `apps/www/src/registry/components/editor/tag.tsx`
   - Root cause: copied registry source imported app-only `@/lib/withLocale`,
     making the installable source fail www typecheck.
   - Repair: keep the tiny URL normalization helper local and add the required
     registry changelog entry/generated metadata.
7. Regression workflow current-tree changes
   - Three P1 defects allowed malformed superseded evidence, evidence mapped to
     an inapplicable oracle, and reporter-only requirements on replay failures.
   - Repair: validate superseded syntax, require applicable oracle anchors, and
     classify failed fixes explicitly as `reporter-contradiction`,
     `exact-replay`, or `final-verification`; sync all generated mirrors and
     migrate existing plan tables.
8. `apps/www/scripts/build-registry.mts`
   - Root cause: the generated registry index created lazy component imports
     for 240 entries, including 170 metadata-only UI, component, file, hook,
     and library items. Every docs route therefore entered those modules into
     both browser and SSR compilation graphs.
   - Repair: preserve every registry metadata entry but generate component
     loaders only for the 68 examples and three runnable blocks in current
     source. RSC blocks remain excluded.
9. `.github/workflows/ci.yml`
   - Root cause: the root runner launched the package build and 61-package
     typecheck at default Turbo concurrency and was externally terminated.
   - Repair: bound Turbo typecheck concurrency to two in the shared
     `g:typecheck` script. Local `pnpm check`, GitHub `bun check`, and push CI
     therefore use the same check graph and scheduler limit.
10. `apps/www/package.json`
    - Root cause: selective Next production builds can leave a partial
      `.next/types` route map, so later local www typechecks reject valid routes
      that Vercel's full build discovers.
    - Repair: regenerate the complete Next route types inside the shared www
      typecheck script before both TypeScript programs run.
11. `packages/selection/src/react/BlockSelectionPlugin.tsx`
    - Root cause: the public plugin state type declared
      `selectionAreaClassName`, but the base initial state did not own that key.
      The unconfigured Plite example therefore crashed when
      `BlockSelectionAfterEditable` subscribed to it.
    - Repair: make the base store own an empty class string and lock that
      runtime contract with a focused package test. The existing Chromium
      cursor-overlay test is the user-visible regression proof.
12. `packages/plite-react/src/editable/input-router.ts`
    - Root cause: root CI rejected a block-bodied callback that only returned
      `handleDrag(event)`.
    - Repair: use the equivalent concise callback body required by Oxlint.
13. `apps/plite/tests/plite-browser/donor/examples/synced-blocks.test.ts`
    - Root cause: Chromium shard 1 could begin the synthetic selection drag
      before the first hover/focus layout and pointer-down frame settled. The
      editor then kept a null selection until the fixed eight-second poll
      expired.
    - Repair: settle the hover/focus layout for two animation frames and the
      pointer-down state for one frame before measuring and moving. Assertions,
      retries, and timeout budgets remain unchanged.
14. `apps/www/vercel.json`, root `package.json`, and the www build config
    - Root cause: the deployment used dashboard-owned `turbo run build` with
      no package filter or concurrency bound, then Next's Turbopack compile was
      OOM-killed on a 16 GB Enhanced Build Machine about one minute after
      `Creating an optimized production build` began.
    - Repair: make the repository own a `www...` Turbo graph at concurrency
      two, compile www with Webpack, and enable Next's Webpack build worker and
      memory optimizations. The explicit Webpack lane omits the existing
      Turbopack-only React Compiler flag and externalizes the Node-only
      `ts-morph` route dependency instead of bundling its embedded TypeScript
      runtime. The registry remains CI-generated.

The chromium coverage failure needs no separate source edit; it is generated
from shard summaries and closes when shard 1 passes.

## Verification evidence

- `node_modules/.bin/oxlint --type-aware --report-unused-disable-directives-severity=error apps/www/src/lib/withLocale.ts`: passed.
- `pnpm --filter @platejs/plite-hyperscript test`: 35 passed.
- `pnpm turbo typecheck --filter=./packages/plite-hyperscript`: 2 tasks passed.
- `pnpm --filter @platejs/plite-react test`: 1,088 passed across 75 files.
- `pnpm turbo typecheck --filter=./packages/plite-react`: 5 tasks passed.
- Exact three-row IME packet on the pushed SHA: 0/3, reproducing remote shard 1.
- Exact three-row IME packet after repair: 3/3.
- Five retry-free warm IME reruns: 15/15 total, 2.57-2.64s per run.
- `pnpm check:plite`: passed in 6m26s; 709 Chromium rows passed and 8 skipped.
- `pnpm check`: passed; formatting, type-aware lint, 61-package typecheck, and
  the full root fast/slow/slowest test suites were green on the final local
  bytes: 60 builds, 60 typechecks, 3,300 fast tests, and 1,549 slow tests with
  60 skips.
- `pnpm changeset status --since origin/main`: passed and includes
  `@platejs/plite-react` in the release set.
- Browser: `/examples/plite/richtext` rendered one editable surface, all 14
  formatting controls, expected rich text, and zero console errors.
- Diagnostic-residue scan for `PR5036_IME` and `__PR5036`: zero matches.
- `bun test apps/www/src/lib/rehype-utils.spec.ts`: 2 passed.
- `pnpm --filter www typecheck`: passed, including registry source checks.
- registry changelog generator `--write` and `--check`: passed.
- Regression workflow proof: 49/49 tests passed; source/generated parity and
  resource sync passed.
- Agent-native review: pass; source owner, route, mirrors, plan schema, and
  executable proof are complete.
- Registry index and CI workflow contracts: 12 tests passed across the focused
  registry and workflow files; script typecheck passed.
- Current generated registry: 246 metadata entries and 240 loaders. Current
  source with the repair: 232 metadata entries and 71 loaders (68 examples and
  three blocks).
- Selective production-build diagnosis: the Plite route completed at 2.55GB
  RSS, while the docs route reached 11.25GB before the expected stale generated
  registry import boundary.
- `pnpm --filter www typecheck`: passed after regenerating the full typed-route
  map; the seven stale selective-build route errors disappeared.
- Shared no-drift root gate: `pnpm check` passed in 331.91s with 60 builds, 60
  typechecks at concurrency two, 3,311 fast tests, 1,549 slow tests with 60
  skips, and the slowest-test budget gate.
- P1 autoreview cap: all three invocations used. The final bounded repair review
  was clean; three checkout-wide Regression findings from invocation 2 were
  accepted and deterministically repaired after the cap, so no further
  autoreview invocation is allowed.
- `bun test packages/selection/src/react/BlockSelectionPlugin.spec.tsx -t
  "exposes the selection area class"`: failed before the owner fix
  with the exact missing-state-field exception, then passed after it.
- `pnpm --filter plite test:plite-browser:chromium
  tests/plite-browser/donor/examples/cursor-overlay-ordering.test.ts`: passed;
  the route rendered and the selection cursor interaction completed.
- Five forced, retry-free replays of that exact Chromium row passed in
  1.9-2.7s per run.
- `pnpm lint`: passed on the final seven-file repair packet.
- `pnpm turbo typecheck --filter=./packages/plite-react`: 5/5 tasks passed.
- `node --test tooling/scripts/ci-workflow.test.mjs`: 3/3 passed, including
  the repository-owned bounded Vercel build contract.
- `pnpm --filter www exec next typegen`: passed with the final Next config.
- `pnpm turbo run build --filter=www... --concurrency=2 --dry=json`: selected
  the intended 61-package dependency graph and final `www#build` task.
- The exact failed synced-block drag row passed 100/100 retry-free stress
  iterations with two Chromium workers.
- The complete affected synced-block Chromium file passed 46/46 with two
  workers.
- `pnpm check:push`: passed on the final packet: lint, type-aware lint, 60
  package builds, 60 package typechecks at concurrency two, 3,314 fast tests,
  and 1,549 slow tests with 60 skips.

## Push scope

The final commit stages the entire checkout as required. It includes the CI
repairs above, copied-registry changelog output, Regression source/generated
workflow updates, and the user-authored plans already present in the checkout.

## Public mutations

The existing repair stack, lint fix, synced-block stabilization, Vercel
ownership packet, and Webpack/Turbopack conditional config are pushed through
`4f30c71cf905cf9880765166e6bf069646993961`. The `ts-morph` server
externalization is verified in the isolated `../plate-ci` checkout and remains
unpushed. Merge is not authorized.

## Remaining risks and next action

- Root CI at `7d7b501…` failed only the concise-callback lint diagnostic. Plite
  CI at that SHA failed only the stabilized synced-block drag row. The
  docs-only `168a449…` head did not trigger those workflows.
- Vercel at `168a449…` failed in 3m06s from the exact Turbopack compile OOM
  described above. The repository-owned Webpack build lane is locally
  contract-checked but requires the next deployment for runtime proof.
- Vercel at `40bb59c…` reached `Next.js 16.3.2 (webpack)` after 59/60 bounded
  build tasks, then rejected the existing Turbopack-only React Compiler flag.
  The final conditional config removes that flag only from the explicit
  Webpack lane.
- Vercel at `4f30c71…` compiled with Webpack past the prior OOM point and
  failed in 6m24s because bundled `ts-morph` could not resolve its optional
  `source-map-support` require from the registry-source route. The final
  Webpack lane uses Next's server externalization for that Node-only package;
  the Turbopack lane retains its existing transpilation behavior.
- The PR merge conflict is independent of CI and remains unresolved.
- After push, monitor the exact SHA, repair any new failures, and repeat until
  GitHub and Vercel are green. Do not merge.
