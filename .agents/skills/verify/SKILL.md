---
description: Review implementation ownership and verify Plate/Plite packages, editor states, CLI outputs and registry artifacts through their actual proof owners. Use before checking, skipping, deferring or moving any plan proof gate to limits, and before claiming a fix works.
argument-hint: '[package | route | cli | collaboration | corpus] <target>'
name: verify
metadata:
  skiller:
    source: .agents/rules/verify.mdc
---

# Verify

This skill owns implementation acceptance, proof selection, runtime readiness, driving
and evidence. It is the driver skill for pstack's Bug fix playbook, which owns
repairs and failed-fix recovery. Its [testing reference](./references/testing.md)
owns test shape, runners and suite audits. Benchmark retains measurement.

Reuse the caller's plan; never create a second plan or close the caller's plan
while its other work remains. Standalone long-running verification keeps its
own plan under `docs/plans/`; small standalone checks need none. Standalone
verification ends at the requested coverage and report, with failures
preserved; audit completion is not a product pass or authority to repair.
Plan-only stays plan-only.

Use `pstack:create-verification-skill` for creation and `pstack:maintain-verification-skill` for
maintenance, selecting its workflow-audit or feature-coverage scope from the
request. Edit `.agents/rules/verify.mdc`
and its resources per the pstack block's Agent files rule.

## Completion boundary

State the reported setup, input, expected result and necessary follow-up before
choosing proof. Keep them in the existing case or plan, not a separate registry.
Select the smallest test boundary that can observe each required result. A
model test, detached transform, alternate route, synthetic click or model-set
selection can diagnose a browser defect without proving its native input,
focus consumer, paint or event ordering. A standalone demo, block route or
docs wrapper cannot certify a reporter-named route, even when it renders the
same component.

The exact reporter interaction remains open until those assertions execute and
pass on the final source. A failure before the action is a host/setup failure;
it proves neither a product failure nor a fix. Preserve the failing test and
output, repair the diagnosed prerequisite within scope, and rerun. Do not delete,
skip, weaken or replace required proof to obtain green. Correct a faulty oracle
with source-backed evidence while preserving the user invariant and failed
result. Change the expected behavior only under accepted product authority.

Reporter follow-ups are deltas. A confirmed requirement stays until the
reporter or accepted product law removes it, and a residual symptom joins the
original acceptance instead of replacing it. A narrower green test cannot
discard an original visual, transient, focus, selection, popup, error or
follow-up requirement. A report that names only a bad state forbids that state
without choosing its replacement. When several outcomes satisfy it and no
accepted contract picks one, ask before writing the product test or fix.

For flaky, native, lifecycle, compositor, focus, selection, drag-and-drop or
device risk, run the final proof five times, warm and without retries. One
failure keeps the case open. Each run executes the proof command; a cached
result does not count.

Report local verification separately from publication. Accepted implementation
review and current-checkout proof with known serving-source identity can close
a local fix; Maintainer's public-claim gates
own pushed-ref replay. A missing capability limits the claim, not unrelated
authorized progress. Verification-only work reports defects; a fix request
continues through diagnosis, repair and the affected proof without another ask.

## Corpus mode

Explicit corpus, harness, rewrite-closure or repeated regression work reads the
complete [corpus method](./references/corpus.md) and copies its
[plan template](./templates/regression.md). Validate the plan with
`node .agents/skills/verify/scripts/validate-regression-plan.mjs <plan>` (and
`--complete` before closing), and record proof receipts with
`scripts/capture-proof-receipt.mjs`. One ordinary bug stays on the Bug fix
playbook without this schema.

## Failed claimed fix

The Bug fix playbook (`.agents/playbooks/bug-fix.md`) owns failed-fix recovery.
This skill supplies its evidence, including the
[failed native diagnostics](./references/regression-oracles.md#failed-native-diagnostics).

## Review the implementation

For a changed implementation, review the final diff, its owning path and
materially different consumers before accepting verification. Do this before
expensive final replay; an existing review of the same candidate can satisfy it.
Keep the review proportional: a direct local correction needs a direct source
check, not an architecture exercise. Unchanged runtime checks and artifact-only
verification do not create an implementation review.

- Compare the fix with deleting, merging or moving the responsibility to its
  canonical owner. For layout defects, compare structural layout and CSS before
  measuring or synchronizing geometry. Fewer changed lines do not justify
  leaving the wrong ownership in place.
- Before accepting robustness machinery or review findings, establish the real
  user job and supported input domain across the complete owning path. A
  helper's synthetic extremal case cannot silently expand product requirements.
- Each added effect, observer, subscription, timer, mutable cache or save/restore
  protocol must earn its place through a current requirement and correct
  lifetime. Check who owns the mutated state or DOM, which real callers support
  the assumption, and whether the cause can be removed instead. These mechanisms
  are not inherently wrong; unexplained compensation is not an accepted fix.
- Check that proof observes the user invariant. A mocked owner or assertion of
  the new mechanism can hide the original design error; it cannot alone prove
  valid ownership or supported composition. Retain meaningful behavior coverage
  and inspect consumers that differ in placement, availability or lifetime.

Record the conclusion and decisive source evidence in the existing case, plan
or handoff. Verified ownership or unnecessary-complexity defects keep local
completion open even when tests pass. Rework a clear local issue; use Best API
Review when the correct owner or a compensation protocol remains contested,
then continue under the caller's existing repair authority. Verification-only
requests report the finding without editing product code. After a repair,
review only the affected delta and rerun invalidated proof.

This check covers ownership, lifetime and proof. General maintainability, such
as size, duplication, naming and dead code, belongs to
`pstack:thermo-nuclear-code-quality-review`, which the Build and Babysit
playbooks run.

This is the agent's source-based acceptance check, including on `next`, not an
panel review or a claim of independent review; the pstack block's Panel review
and Review rules in `AGENTS.md` govern structured review. A clean design does not replace runtime
proof, and passing runtime proof does not accept a deficient design.

## Canonical inventory

Discover example routes and their existing proof recipes without launching an app:

```bash
node apps/plite/scripts/inspect-plite-browser.mjs journeys
node apps/plite/scripts/inspect-plite-browser.mjs journeys plaintext
node apps/plite/scripts/inspect-plite-browser.mjs journeys plaintext --case 'inserts text when typed'
```

The selected case returns source locations, setup/cleanup hooks, local helpers,
suite annotations, timeouts, actions, assertions and the managed runner argv.
Read that evidence before driving the route. Conditional skips and imported
helpers remain part of the case's prerequisites. This is derived from the
canonical registry and tests; it is not a second maintained map or an execution
receipt. Parameterized helpers and dynamic cases remain unresolved and require
the existing Playwright discovery path.

Discover the current inventory from these existing owners. Do not create a
second feature map, assertion registry or manually maintained coverage count.
For each selected item record its user entry, setup/action, expected effect and
gotchas from the source and existing proof. A file count is discovery only.

| Surface | Inventory and exact proof owner | User entry and driving recipe |
| --- | --- | --- |
| Plite examples | `apps/www/src/app/(app)/examples/plite/plite-example-registry.ts`; `apps/plite/tests/plite-browser/` | Open `/examples/plite/<registered path>`; use the owning test's real input, selection, result and follow-up assertions. Hidden examples still count when scoped. |
| Plate copied UI | `apps/www/src/registry/`; `apps/www/src/app/(blocks)/blocks/[name]/page.tsx` | Use the actual registered block, preferring its `-demo` route when present. Preserve a reporter-named docs/route target. |
| Public package behavior | Package exports and `tooling/entrypoints/entrypoint-dag.mjs`; `tooling/entrypoints/entrypoint-turbo.mjs` derives partition tests | Use each partition's type/test script for its public contract. The managed `/runtime-entrypoints` fixture proves client exports; `pnpm plite:release:packages` proves packed headless/SSR imports and declarations. Include exported assets such as `platejs/math/katex.css`. |
| Optional schema CLI | `packages/cli/src/bin.ts`, `packages/cli/src/deps`, existing `packages/cli/test` fixtures | Run the built `plate` command in a disposable project; verify generated artifacts, subsequent check mode and untouched input. Ordinary editor setup never requires this CLI. |
| Docs and registry outputs | `content/docs`, `apps/www/src/lib/source.ts`, docs app routes and `apps/www/package.json` scripts; Plate Docs | Derive source routes through `check-docs-source-parity.mts`, parse frontmatter titles, inspect rendered bodies and read back generated results. Record locale fallbacks and custom app-page overrides separately. |
| Regression cases | Existing executable tests plus current source/report provenance | Replay the exact reporter interaction under the [completion boundary](#completion-boundary); select applicable [interaction oracles](./references/regression-oracles.md). |
| Performance | Benchmark's current target inventory and executable runners | Resolve the measured owner through Benchmark; preserve workload, source identity, correctness and baseline/candidate comparability. |

Maintain Verification Skill defaults to this entire inventory, including each
current entry within a selected canonical source, not one demonstration per
table row, when the request is a product-coverage audit. An instruction-only
workflow audit checks its changed commands and decision paths without claiming
live product coverage. Only an explicitly scoped request narrows the selected
product denominator. For product coverage, source inspection and one serial
live pass are both required. Unreachable entries need
the attempted route and concrete prerequisite. Product defects are reported,
not rewritten out of the verifier.

Package import coverage is a boundary check, not every editor interaction.
Use the entrypoint's owned behavior tests and browser recipe for that claim.
Root aggregate test discovery does not include every package partition.
Also inspect proof-only app routes such as `/runtime-entrypoints`, `/mobile-lab`
and `/dev/kit-lifetime-probe`; they are not registered editor examples.

Registry hooks, libraries, styles and kits need an actual consumer; their
`component: null` index entries do not provide standalone block previews.
The four copied Base/Radix component variants in `registry-variants.ts` require
their selected installed consumer. A Radix demo does not prove Base behavior.
Run `pnpm --filter www test:create-install editor-basic editor-ai` for both
primitive families. Set `PLATE_CREATE_KEEP_TEMP=1` to retain the printed
disposable workspace, serve each successfully built consumer, and exercise
its controls after hydration. Preserve evidence before removing that workspace.

## Launch

Run from the current Plate checkout. Read the relevant package script and
configuration first; do not reuse ports or source paths from another checkout.
Use a foreground managed session and retain its handle for cleanup.

- Plate app: `pnpm --filter www dev --port 3297`.
  This script generates and serves dynamic docs. Set
  `PLATE_WWW_DEV_SOURCE=1` when the claimed package behavior must use source
  aliases. If an existing server holds `.next/dev/lock`, use a
  separate available output directory through the existing configuration;
  the current `PLATE_WWW_PLITE=1` option selects `.next-plite`.
- Plite examples for interactive source proof:
  `pnpm --filter plite exec next dev --port 3298`.
- Existing managed Plite browser proof:
  `pnpm --filter plite test:plite-browser:chromium <actual test file or grep>`.
  This runner owns its build/server lifecycle. Run managed proofs serially.
- Optional CLI: `pnpm --filter @platejs/cli build`, then invoke the absolute
  `packages/cli/dist/bin.js` with Node from the disposable consumer's cwd.
  Each one-shot invocation is a fresh process. `generate --watch` owns a
  long-lived session; retain its handle and stop its children after the drive.
- Library-only proof: use the actual affected package test/type script. No app
  launch is needed unless the claimed behavior depends on rendering or native
  input. Use the full [command recipes](./references/commands.md).

Next readiness requires its ready output and the exact route answering. A
process that listens is not proof that the route renders or uses current source.
If a build/start fails, capture its owner and clean the instance you started.
Repair only within the active request's authority; never use stubs to certify the product.

## Doctor

For package-resolution or local React corruption signals, use the one-time
[install recovery](./references/commands.md#local-install-recovery) before
reopening product diagnosis.

Run `node apps/plite/scripts/inspect-plite-browser.mjs doctor` for read-only
local artifact freshness using the same checks as the managed builders. It
reports Node, source identity and stale build inputs without building or
starting a server. A successful inspection does not mean the artifacts are
fresh; read both `fresh` fields. It does not establish browser, authentication
or external-server identity; continue with the checks below for those claims.

Check the chosen instance before driving and after anything surprising:

1. Bind the command/session, PID, cwd, source/build identity and URL. On macOS,
   `lsof -a -p <owned-pid> -d cwd -Fn` reads its cwd and
   `lsof -nP -iTCP:<owned-port> -sTCP:LISTEN` identifies the actual listener.
   Inspect the child listener when pnpm/Next uses a wrapper process. A listener
   from another checkout is not yours to stop or use as final proof.
2. Request the exact local route with `curl --fail --silent --show-error` and
   inspect it through the available browser control. HTTP success proves
   reachability only; the browser must show the expected editor/route without
   a build error or overlay. Check auth and prerequisite state when applicable.
3. For the CLI, run `node <absolute-cli-bin> --version` and `--help` from the
   consumer cwd. Confirm its version against `packages/cli/package.json` and
   that the built artifact corresponds to current source before driving it.
4. When process health is green but UI state is wedged, reset to known state
   or relaunch. A failed drive always triggers doctor and cleanup of its
   residue before another attempt. Preserve the evidence already collected.

Do not certify auth, package freshness or correct state from a port probe.
Inspect the owning build/export graph; rebuild only the affected built boundary.

## Drive

Use the current runtime's browser or CUA APIs. Inspect their documentation and
current UI before selecting controls. Ordinary web QA can use the in-app
browser. Exact Chrome/profile/clipboard/download/print/native claims require
that browser and profile; use native app/OS control when necessary. Old plugin
names in preserved recipes describe these capabilities, not installed tools.
Never invent a callable API or substitute a clean profile for a named one.
For keyboard-formatting claims, use the control's key-by-key typing operation
(`pressSequentially` in the current browser API). Direct text insertion can
follow a different input path. Confirm the active mark before typing, then
read back both the inserted text and its rendered marks after the update.

Existing repository Playwright specs are executable proof owners. Run them
through their package runner. Do not build a parallel Puppeteer, raw CDP or
standalone Playwright driver for interactive QA. Browser emulation does not
prove raw Android/iOS input.

The harness's `clipboard.pasteHtml` and `clipboard.pasteText` paste through
the Playwright project's `use.clipboardTransport` and fail when that transport
did not apply the paste or the page threw during it; they never retry another
way. Chromium and Firefox use `'native'`, WebKit and emulated mobile use the
`'event'` stand-in, and each run's `clipboard-transport` annotation names the
transport. Only a `'native'` run is native clipboard proof; it still must
confirm the rendered result.
The HTML example has separate native and synthetic event cases in
`apps/www/tests/browser/clipboard.spec.ts`. Against the doctored www instance:

```bash
PLAYWRIGHT_BASE_URL=http://localhost:3297 pnpm --filter www test:www-browser:chromium tests/browser/clipboard.spec.ts
```

The same spec runs under `test:www-browser:firefox` and
`test:www-browser:webkit`. Only Chromium exposes clipboard permissions to
automation, and Playwright's WebKit build is not Safari; claim Safari behavior
only with Safari proof.

For plain text, the current recipe is
`apps/plite/tests/plite-browser/donor/examples/plaintext.test.ts`: open
`/examples/plite/plaintext`, focus the editor, move to the end, type text and
verify both rendered text and model text. Follow the remaining assertions in
the selected case; do not call this one operation full editor coverage.

For the CLI, read the complete [disposable consumer recipe](./references/cli.md)
for source aliases, the private package/cache root and the stale-output control.
Use a disposable consumer based on an existing CLI fixture. Run
`generate <entry>` and inspect the emitted schema and types, then
`generate <entry> --check`. A second successful invocation alone is not enough:
compare output and input fingerprints. For migrations, default dry-run behavior
and `--write` are separate claims; observe files and stdout to prove each.

For docs, require the parsed heading and rendered body after navigation.
HTTP success and title metadata can precede streamed content. English and
Chinese routes, English fallback pages, and custom releases/huge-document app
pages have distinct route owners; an app override does not execute its MDX.
When a page embeds a preview, wait for its actual editor or result: the heading
and `Loading…` placeholder can render before a client schema error replaces the
page. Record text rendering and the loaded preview separately.

Read the actual consumer before claiming an external service worked:

- Registry `app/api` files are copied installation sources. AI, copilot and
  media examples can show local fallback output after an API failure. Remote
  success requires the installed handler, credentials and a real successful
  response; a blob preview or demo stream is insufficient.
- `/blocks/html-export` reads `public/tailwind.css`; generate it with
  `pnpm --filter www build:tw` when missing. Use Chrome for the download,
  then inspect the saved file. A browser-rendering claim also needs an allowed
  view of that file; record a URL-policy block as a capability gap.
- Hocuspocus collaboration needs its configured WebSocket server. A manual
  connection-status fixture proves that state only. Pro/reference iframe
  content needs the external route and any access it requires.
- Mobile viewport and synthetic composition tests retain their proxy scope.
  Raw Android/iOS or OS IME claims require the actual device/input method.

Read [native editor proof and scenario generation](./references/editor-proof.md)
for selection, keyboard, pointer, screenshots, undo, geometry or device work.
Read [the full Potion Yjs reference recipe](./references/potion-yjs.md) only for
collaboration comparison. Potion proves reference behavior, never a local fix.

## Evidence

Keep command logs, source/build fingerprints, actual route, host identity,
input/action, observed result, runtime errors and relevant screenshots under
`docs/plans/artifacts/<task-slug>/`. Use temporary output locations only when
the final evidence is copied there before cleanup. Preserve originals locally;
this artifact tree is Git-ignored. Keep concise conclusions and required proof
summaries in the versioned plan or analysis document. Reusable runners, required
fixtures and pinned benchmark inputs belong with their source or test owner,
never inside the artifact tree.

Every proof command names the cwd, package or app it proves. Evidence carries
forward only while source and build, environment, identity, auth and
permissions, fixture, URL and state, viewport and artifact are unchanged; a
matching screenshot alone is insufficient. A plain screenshot is not enough for
network, CSP, auth, security or browser-runtime claims unless the diagnostic
path is visible.

Capture the action and resulting state, including follow-up input and side
effects when the claim needs them. Internal setters or model-only assertions
cannot replace the actual reporter path. A visual report concerns paint,
highlighting, visibility, layout, styling, clipping, position or animation.
Capture and inspect its failing state right after the exact reporter
interaction before changing product source; a reporter image can establish it.
After the fix, capture the final state right after the same interaction, open
the image, inspect the claimed pixels at a legible scale, and record the
screenshot and what it shows. DOM markers, computed styles, geometry, model
state, a passing browser test or an uninspected screenshot path cannot close a
visual claim. Without an image-capable runner the claim stays open as
visual-unverified. A native paint defect also uses the classified controls in
the applicable [interaction oracle](./references/regression-oracles.md). Load that reference's
relevant domain sections for native input, focus, pointer, caret, paint,
subscription or identity regressions; do not impose every domain on every check.
Use the shared `recordBrowserRuntimeErrors` helper for browser errors.
Pass `{ strict: true }` when the case requires every console/page error to fail;
default capture retains the helper's targeted filters and approved ignores.
Mock only an already isolated external boundary and label what it cannot prove.

Ordinary scoped proof retains the logs and fingerprints above. For broad
maintenance, retain one result per inventory entry. Reuse observations across
profiles without dropping distinct assertions.

## Cleanup

Stop only sessions/processes you started, using the returned session handle or
verified PID. Never kill by process name or stop another checkout's listener.
Remove only the run's disposable consumer, fixture edits and temporary state.
Restore any reference tab's offline/network state. Clean failed attempts too.
Then confirm every cited evidence file still exists and is readable. Cleanup
that deletes evidence invalidates the run.

## Helpers and maintenance

Reuse the existing package runners, Benchmark target runner and
`node .agents/rules/plate-next/scripts/sync-resources.mjs --check`.
Their commands are above or in the linked full recipes; this skill does not
wrap them with another controller.

For a reusable tool-side limitation, use the complete
[browser tool report recipe](./references/browser-tool-issue.md). Preparing
evidence is local; filing follows the pstack block's Messages rule.
Maintain Verification Skill repairs this owned source/inventory/harness, then
re-drives corrections. It does not repair protected skills or product defects.
