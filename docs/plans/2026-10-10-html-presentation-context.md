---
review_scopes: [html, exports]
review_basis: []
work_kind: implementation
review_commit: d295f31731d2e075dd67c3fd4df21a5ae2babda7
review_inputs: [packages/platejs/src/static/internal/staticPresentation.ts, packages/platejs/src/static/pipeRenderElementStatic.internal.tsx, packages/platejs/src/static/pluginRenderElementStatic.internal.tsx, packages/platejs/src/static/renderStaticHtml.tsx, packages/platejs/src/lib/editor/withPlite.ts, docs/vision/plate.md]
---

# Static kit drawings read only the rendered editor

Status: done: in pull request #5157 into next; folded into the html subject, where the F2 remainder stays open
Playbook: plan

This iteration continues the html subject after `docs/plans/2026-10-09-html-static-repair-redo.md`, whose phase 1 is committed on branch `export-static-presentation` (`d718b7fa6c`, `d295f31731`) and not pushed. The owner asked to start preparing the next step after the recommended order put this iteration first. It works on the two critical findings that phase 1's third code-review round left open, which AGENTS.md's Panel review rule sends back to planning. It fixes the first and only narrows the second. In the first, an element no plugin renders still runs the live editor's `afterNodeChildren` slots under a presentation. In the second, the presentation compile activates plugins with no cleanup, and a drawing built in a `configure((ctx) => ...)` callback reads the compile editor's state. An `architect` arena with three runners from two model families agreed on the approach (`docs/plans/artifacts/html-presentation-context/architect/synthesis.md`). The plan panel then cut its one contested part, a check that spots drawings built in setup callbacks when the kit loads, after three designs of it failed review. What remains is the detached compile, the fallback branch and a missing-drawing report for component-object slots.

## Brief

### What will change?

You asked for the next step. Blocks no plugin draws use the read-only kit, the kit no longer starts a hidden editor, and add-ons it can't draw now warn instead of vanishing. One problem stays partly open.

### What could go wrong?

Drawings that copy settings inside a setup callback still draw the kit's own settings silently. You decide whether to plan a full fix. The browser test shows nothing broke but cannot reach the new cases.

## Teach

When you export, Plate draws each block with the app's read-only kit, matched to the live editor's plugins by name. To read the kit, export first loads it once into a temporary editor.

Today that temporary editor starts up like a real one, and nothing ever shuts it down. A kit drawing written inside a setup callback stays tied to it, so it reads the temporary editor's settings instead of the real ones. Blocks that no plugin draws still run the live editor's add-ons that sit after a block's content.

This change loads the kit without starting anything, the way the other converters already do. A drawing written inside a setup callback is unsupported. If it asks the temporary editor for settings while drawing, it gets an error and the export stops. Settings it copied earlier are the read-only kit's own. Blocks no plugin draws look up their add-ons in the kit, like every other block.

## Public API

Today a presentation drawing declared in a `configure` callback reads the compile editor. After this plan such a drawing is unsupported. Calling a context getter, or a kept `store`, `read` or `update`, while drawing throws, so the export rejects. A plain value the callback copied out keeps the presentation's own configuration, and `ctx.editor` reads return an empty document or throw. A drawing declared as a value reads the rendered editor through its props, as before.

```tsx before
// packages/platejs/src/static/renderStaticHtml.presentation.spec.tsx
const { data } = await renderStaticHtml(editor, {
  presentation: [
    BaseBlockquotePlugin.configure((context) => ({
      slots: {
        afterNodeChildren: () => <span data-type={context.schema.type} />,
      },
    })),
  ],
});
```

```tsx after
// packages/platejs/src/static/renderStaticHtml.presentation.spec.tsx
const { data } = await renderStaticHtml(editor, {
  presentation: [
    BaseBlockquotePlugin.configure({
      slots: {
        afterNodeChildren: ({ element }) => <span data-type={element.type} />,
      },
    }),
  ],
});
```

The option types do not change.

| Behavior with `presentation` | Today | Target |
| --- | --- | --- |
| Preparing the kit | `buildEditor` publishes and activates every kit plugin, with no cleanup owner | The existing detached compile, `withPlateFormatCompilation`, which runs no activation and rolls its temporary runtime back |
| A drawing built in a presentation's `configure` or `.extend` callback that calls a context getter (`schema`, `store`, `plugin`, `name`, `api`, `read`, `update`), or a kept `store`, `read` or `update`, while drawing | Drawn; it reads the compile editor | Throws "Plate runtime is not installed." when it draws, so `renderStaticHtml` and `exportDocx` reject, whatever `lossPolicy` says; a callback drawing that reads only its props draws |
| A plain value the callback copied out before it returned, such as a destructured `plugin` or `name` | Reads the compile editor | Keeps the presentation's own configuration without an error; open |
| A read through `ctx.editor` | Reads the compile editor | Returns an empty document or throws; open |
| `afterNodeChildren` of an element no plugin renders, such as a type a complete editor schema declares | The installed slot draws as a component | Resolved like a bound element's: the presentation peer draws, an edit-only slot stays out, a missing peer adds `missing-static-presentation` |
| An installed `afterNodeChildren` written as a component object, such as `React.memo`, with no function peer | Dropped without a diagnostic | Adds `missing-static-presentation`, on both paths |
| Without `presentation` | The editor's own components | Unchanged, byte for byte |

## What other editors do

ProseMirror (`prosemirror-view@ca4c78e`) and BlockNote (`BlockNote@be20d8b`) were read for this run; Tiptap (`ueberdosis/tiptap@91c51be53c`) and Lexical (`facebook/lexical@dd5c41b1`) come from the repository's research pages. None compiles a second editor whose state an export drawing closes over. A drawing gets either no editor or the exported editor as a call argument.

| Editor | What an export drawing receives | A separate compiled editor behind export |
| --- | --- | --- |
| ProseMirror | `toDOM(node)`, the node only; clipboard export runs `DOMSerializer.fromSchema(view.state.schema)` (`src/clipboard.ts:17`, `:60`) | No |
| Tiptap | `renderHTML`, which becomes `toDOM`; `generateHTML(json, extensions)` builds a schema with no `Editor` (`docs/research/sources/tiptap/conversion-and-export.md:11`) | No |
| Lexical | `exportDOM(editor)`, called by `$generateHtmlFromNodes(editor)` with the exported editor (`docs/research/sources/lexical/conversion-and-export.md:36-38`) | No |
| BlockNote | `toExternalHTML(block, editor, context)`, the exported editor (`packages/core/src/schema/blocks/types.ts:234-239`) | No |
| Plate today | Props built from the rendered editor, plus whatever a `configure` callback closed over in the compile editor | Yes, activated and never cleaned up |

## Layer and owner

| Delta | Job | Owner |
| --- | --- | --- |
| changed | Pick the component that draws a node | Static dispatch in `platejs/static`. With `presentation`, the static plugin of the same name supplies the element component, both mark placements and the function wrapper slots, also for an element no plugin renders; Word's private map wins for its eight types. The kit compiles once per array, detached, so a drawing that calls its setup callback's context while drawing throws. Values it copied earlier keep the kit's own configuration. An installed `afterNodeChildren` with no usable peer adds the missing diagnostic. Without `presentation`, the editor's own components draw. |

| Change | Layer | Package | Why |
| --- | --- | --- | --- |
| Detached compile, and separate installed and peer slot reads | Plate | `platejs/static`, `static/internal/staticPresentation.ts` | The presentation's existing owner; `static` already imports `lib`, so no new entrypoint edge (`tooling/entrypoints/entrypoint-dag.mjs`) |
| `afterNodeChildren` of an element no plugin renders | Plate | `platejs/static`, `pipeRenderElementStatic.internal.tsx` | Reuses the bound path's slot loop from `pluginRenderElementStatic.internal.tsx` |

## Hard cuts and app migration

| What breaks | Callers | Migration |
| --- | --- | --- |
| A presentation drawing built in a `configure` or `.extend` callback that calls its captured context, or a kept `store`, `read` or `update`, while drawing makes the export reject when that block draws; one that copied plain values earlier draws the kit's own configuration | Phase 1's own configure-context test; none of the 41 callbacks the registry kit runs returns a drawing (`premise-probe/callback-drawings-a1.log`); `presentation` has never been released | Declare the drawing in an object `configure` and read state from its props |
| An element no plugin renders draws its `afterNodeChildren` from the presentation when one is given; an installed component-object slot with no function peer adds the missing diagnostic | No production `afterNodeChildren` declaration exists in `packages/` or the registry (`how-explorer/answer.txt` section 7); every element type both registry kits declare has a Plate owner (`f1-reach/unbound-types-a1.log`), and a complete editor schema passed as a plugin reaches the path (`f1-reach/schema-a2.log`) | Add the slot to the static kit as a function |

## Main changes

- `compilePeers` compiles the presentation with `withPlateFormatCompilation` instead of `buildEditor`. The detached compile runs no activate hook and rolls its runtime back in `finally`; the array-identity cache stays.
- Nothing checks callback results. Once the detached compile ends, every runtime lookup a captured setup context makes throws "Plate runtime is not installed.", so a context getter, or a kept `store`, `read` or `update`, called while drawing stops the export. A plain value the callback copied out before it returned, such as a destructured `plugin`, keeps the presentation's own configuration, and `ctx.editor` reads return an empty document or throw (`panel-r3-probes/probe-a1.log`, `panel-build-r1-probes/probe-a1.log`). The JSDoc spells this out, the static guide calls such drawings unsupported, and Open work tracks it.
- With a presentation bound, the fallback branch of `pipeRenderElementStatic` draws `afterNodeChildren` through the slot loop the bound path uses, moved into a shared helper. Without one, its JSX stays byte for byte, memo components included.
- `resolveDrawing` takes separate reads for the installed plugin and its peer. For `afterNodeChildren`, the installed read returns the raw slot and the peer read returns only a function, so an installed component object whose peer is missing or not a function is reported missing. `wrapNode` and `wrapNodeChildren` read functions on both sides, as in phase 1, because a wrapper descriptor with a `match` is editing UI that static rendering never draws. `getStaticSlot` picks the installed read with one condition on the slot name.

## Decision ledger

| Surface | Current | Target | Owner | Reason | Adoption | Proof | Risk | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Presentation compile | `buildEditor`: activates every kit plugin, no cleanup owner | `withPlateFormatCompilation`, once per array | `platejs/static` | `docs/vision/plate.md:1169-1171`; `premise-probe/probe-a2.log` (0 activations detached, 1 built) | Hidden behind `presentation` | Test m; L1 to L4 rerun | Retained peers still hold the rolled-back temporary editor through API closures, one per kit array, as phase 1's peers hold a live one | rearchitect |
| Drawings that read their setup callback's context | Drawn; read the compile editor silently | Unsupported. Runtime lookups throw while drawing, copied plain values keep the presentation's configuration, and `ctx.editor` reads return an empty document or throw | `platejs/static` through the compile | `docs/vision/plate.md:1263-1264`; `panel-r3-probes/probe-a1.log` (every context getter throws at draw time; `ctx.editor.read.value()` returns an empty document); `panel-build-r1-probes/probe-a1.log` (a destructured `plugin` draws the presentation's label; `ctx.name` read in the callback body draws silently) | Phase 1's configure-context test; JSDoc, `static.mdx` | Test k | A drawing that copies plain context values before its callback returns draws the presentation's configuration silently (Open work) | rearchitect |
| Detecting callback drawings when the kit loads | None | None: cut after three designs failed review | None | Panel rounds 1 to 3: a time-window check refused other editors' callbacks, a deferred read missed changed results, and a snapshot copied Plite contribution tokens and let frozen getters through (`panel-r3-probes/tokens-a1.log`) | None | None | The remaining silent read above | cut |
| `afterNodeChildren` of an element no plugin renders | Installed slot drawn as a component, presentation ignored | Bound path's slot loop when a presentation is bound | `platejs/static` | Finding F1, round 3; reachable through a complete editor schema passed as a plugin (`f1-reach/schema-a2.log`) | Docs drop the documented exception | Tests n and o through `renderStaticHtml`; Word's count of the diagnostic is phase 1's test j, not a case on this element; the two existing fallback tests stay green | None found | rearchitect |
| Installed component-object `afterNodeChildren` under a presentation | Dropped without a diagnostic on the bound path (`panel-r1-probes/probe-a1.log`) | Reported as `missing-static-presentation` when no function peer draws it, on both paths | `platejs/static` | `docs/vision/plate.md:1270-1277`; panel round 1 | None | Tests r1 and r2 | Without a presentation the bound path still does not draw a component-object slot, as today | rearchitect |
| Drawing declared as a value that closes over some other editor | Undetectable | Undetectable; stated in JSDoc | None | JavaScript cannot see what a function closes over | JSDoc | None | An author can still write it | keep |

## Panel round 1

Three seats reviewed the plan frozen at `935bbf8df3`: claude-opus-5-5 @high, gpt-6-astra @xhigh and gpt-6.1-sol @xhigh. The challenge delta is improved. The callback check became a record matched after the compile, and component-object slots are reported instead of dropped.

| Finding | Seats | Change |
| --- | --- | --- |
| A check set for the whole compile window refuses callbacks of another editor that a presentation callback builds | astra, sol critical; opus warning | Applied. The wrappers only record results with `context.editor`, and `compilePeers` matches the records of its own compile editor; test q. A callback can build an editor mid-compile, and `context.editor` is the compile editor (`panel-r1-probes/probe-a1.log`). |
| Routing the fallback through the bound loop drops a `React.memo` slot with no diagnostic, as the bound path already does | astra, sol critical; opus warning | Applied. The bound path drops it today (`panel-r1-probes/probe-a1.log`); `getStaticSlot` now reports an installed component object with no function peer on both paths; test r. |
| Refusing in the callback rejects drawings that later configuration replaces, and overrides whose target is absent | astra, sol warning | Applied. Only a recorded drawing that is still the compiled drawing is refused; test s. |
| The fallback tests bypass document validation; a real export may never reach the path | opus, astra, sol warning | Applied. An undeclared type stops at schema validation, and both registry kits leave no type without a Plate owner, but a complete editor schema passed as a plugin reaches the path (`f1-reach/probe-a1.log`, `f1-reach/unbound-types-a1.log`, `f1-reach/schema-a2.log`); tests n and o run through `renderStaticHtml` and `exportDocx`. |
| The readers assume a full plugin and the element reader would count a string tag | opus warning | Applied. The readers are extracted as named functions that tolerate a partial result, and only component values are compared. |
| The Defaults alternative was compiling the whole kit twice | opus warning | Applied. The alternative is now running only the callbacks whose drawing survives a second time. |
| The export menu does not catch a thrown export error | sol warning | Deferred to Open work; the menu already lets every thrown export error escape. |
| Cost wording ran ahead of the logged evidence | opus nit | Applied in the Steps preface. |

## Panel round 2

The same seats reviewed only the round 1 revision, frozen at `5dc87cb037`. The challenge delta is improved. The wrappers snapshot each callback result when it returns, and the editor filter is gone.

| Finding | Seats | Change |
| --- | --- | --- |
| Reading the recorded result objects after the compile misses a drawing when a later stage changes the object or the result uses a getter | astra, sol critical | Applied. The wrappers snapshot each result with `freezePluginDescriptorValue` and hand the same snapshot to the resolver and the observer, which reads it at once. A result with an accessor stays unfrozen, and the compile refuses it; tests u and v. The compiled slot stays the first closure while the returned object changes (`panel-r2-probes/probe-a1.log`). |
| The editor filter adds nothing once drawings match by identity, so its planned mutation cannot fail | opus warning | Applied. The filter and the recorded editor are dropped; test q stays a guard with no mutation claim. |
| One shared read for the installed slot and its peer would let a memo peer count as drawn and vanish | opus warning | Applied. `resolveDrawing` takes separate installed and peer reads, kept in a per-slot table; test r splits into r1 and r2. |
| "The compiled drawing of its plugin" is ambiguous for `override` entries | opus nit | Applied. An `override` entry compares with the target plugin's compiled drawing. |

## Panel round 3

The same seats reviewed only the round 2 revision, frozen at `8bc06b9db9`. This was the last round the project allows before the build, so the lead settled every finding without another round. The challenge delta is replaced. The callback check leaves the plan, and the target keeps the detached compile, the fallback branch and the component-object report. Re-scored against keeping `d295f31731`, the reduced plan still wins: it stops plugin activation, turns every context read but one into an error, sends unowned elements through the presentation and reports a dropped memo slot.

| Finding | Seats | Settlement |
| --- | --- | --- |
| The snapshot copies Plite contribution tokens, such as the details plugin's transfer veto, so the registry kit would fail to compile | astra, sol critical | Applied by removing the snapshot. The copy is a new object (`panel-r3-probes/tokens-a1.log`); that the token registry then refuses it is read from source (`packages/plitejs/src/core/plugin.ts:294`), not run against the kit. |
| An already frozen result with a getter, or a getter one level down, passes the frozen-status gate | astra, sol, opus critical | Applied by removing the gate (`panel-r3-probes/tokens-a1.log` shows a frozen accessor result passes it). |
| The accessor refusal and the missing editor filter refuse other editors' callbacks and object-declared shared drawings | astra, sol critical; opus warning | Applied by removing the check. |
| The refusal must run before the cache write | opus warning | Moot: no refusal remains. |
| The snapshot freezes values of other editors built during the compile | opus warning | Moot: no snapshot remains. |
| Test v's mutation and the one-entry slot table | opus nits | Test v is gone; the table became one condition in `getStaticSlot`. |

The cut follows AGENTS.md's Review rule for a check that reads an options key. That rule gives the way JavaScript looks a property up, getters and proxies included, to the one owner that reads it, here the resolver. A second reader beside it kept disagreeing with that owner. The design after the cap gets reviewed in the `api-build` panel on the diff.

## Code review round 1

Three seats reviewed the build frozen at `4ea6bb4d3c`: claude-opus-5-5 @high, gpt-6-astra @xhigh and gpt-6.1-sol @xhigh.

| Finding | Seats | Settlement |
| --- | --- | --- |
| A callback that keeps a context value before it returns, such as a destructured `plugin`, still reads the presentation's state at draw time without an error | sol critical; opus warning (reads in the callback body) | Applied as a narrowed claim. A destructured `plugin` draws the presentation's label, a `ctx.name` read in the callback body draws silently, and `ctx.plugin` read while drawing throws (`panel-build-r1-probes/probe-a1.log`). The JSDoc, both static guides, the Brief and Open work now say only a context read while drawing throws. Detecting callback drawings left the plan at the review cap, so no code changes. |
| The Vision rule and the changeset promised that every captured-context read fails | opus, astra, sol warning | Applied. The Vision bullet now says only that the kit compiles as a detached operation without activating its plugins; the changeset says the same. |
| The registry guard in `plugins-static.spec.ts` still counts an installed `afterNodeChildren` only when it is a function and compiles with `createEditor` | opus warning | Deferred to phase 1's Open work item on the guard, which reads drawings from kit entries; no registry kit declares `afterNodeChildren`. |
| The fallback keeps two ways to draw `afterNodeChildren`, picked by whether a presentation is bound | opus warning | Deferred. Merging them changes output without a presentation, which the owner did not ask for; Open work tracks it. |
| `withPlateFormatCompilation` builds format helpers the compile does not use; slot readers allocate per call; test k pins the runtime's error text | opus nits | Dismissed. The compile is cached once per kit array; the final-path benchmark decides any per-call cost; the error text is how test k tells a captured-context read from any other rejection. |

## Code review round 2

The same seats reviewed only the round 1 revision, frozen at `a36666abf1`. No seat raised a critical finding, so code review ends here.

| Finding | Seats | Settlement |
| --- | --- | --- |
| The narrowed text drew the line by when a value was taken; the real line is plain data against runtime lookups. A kept `store`, `read` or `update` still throws, `ctx.editor.plugin()` throws, and `ctx.editor.read` returns an empty document | opus, astra, sol warning | Applied. The JSDoc names each case, both static guides call callback-built drawings unsupported, and the plan's Brief, Teach, Public API, Main changes, ledger, Defaults and Open work use the same line. |
| The Proof row claimed more than test k proves | opus warning | Applied. It now says a drawing that calls a context getter while drawing makes the export reject. |
| The narrowed F2 claim and Defaults pick had no deviation row and lost the approved wording | opus warning | Applied. The Steps preface keeps the approved sentence, the decision log has the deviation row, and the Close lists it first. |
| The guide read as permission for the silent pattern | opus nit | Applied with the unsupported wording. |

## Defaults

| Decision | Pick | Alternative | Word | Impact |
| --- | --- | --- | --- | --- |
| A read-only drawing that reads settings from inside a setup callback | Not supported. Asking for settings while drawing stops the export, even when Word allows losses, and settings copied earlier stay the kit's own (look) | Check all setup callbacks when the kit loads; three tries at this failed review | check callbacks at load | small |
| Blocks that no plugin draws | Their after-content add-ons come from the read-only kit, like every other block | Keep running the editing add-ons, with the limit written down | keep fallback slots | detail |
| Changing phase 1's behavior | Treated as a fix, because the read-only kit option has never been released (look) | Ask before refusing anything phase 1 accepted | ask first | small |
| The rest of F2: drawings that copy settings inside a setup callback | Left open with a written limit, because no shipped kit writes drawings that way (look) | Plan a full fix now, for example by handing every read-only drawing the real editor | plan F2 fix | big |

## Build

Execution authority: a plan the panel reviewed goes on to its build unless the owner says "hold", per AGENTS.md's Autopilot rule. The lead writes the code on branch `export-static-presentation` from `d295f31731`; subagents only research and review. Commits follow the owner's word on 2026-10-10; push waits for the owner.

### Completion Gates

| Gate | Applies | Evidence |
| --- | --- | --- |
| Blast radius before code | yes | `docs/plans/artifacts/html-presentation-context/blast-radius.md` |
| Pre-acceptance probe | yes | `docs/plans/artifacts/html-presentation-context/l3-proto/l3-interleaved-a1.log` and `docs/plans/artifacts/html-presentation-context/premise-probe/cold-a1.log` |
| Red tests fail at `d295f31731` for their defect | yes | `docs/plans/artifacts/html-presentation-context/red/` (tests k, m, r1, r2, n and o) |
| Writing passes on product code (`deslop`, `no-comments`) | yes | `docs/plans/artifacts/html-presentation-context/comment-sicko/answer.md`; writing rows in the decision log |
| Lint fix and type-aware oxlint on task files | yes | `docs/plans/artifacts/html-presentation-context/build/lint-check-a1.log`, `docs/plans/artifacts/html-presentation-context/build/lint-typeaware-a1.log`: 5 of 5 files |
| `api-build` panel on the diff | yes | two rounds; round 2 raised no critical finding (`docs/plans/artifacts/html-presentation-context/panel-build-r2/`) |
| Mutations of each fix | yes | `docs/plans/artifacts/html-presentation-context/mutate/mutate-run-a1.txt`: 7 of 7 caught |
| Benchmark rerun on the final path | yes | `docs/plans/artifacts/html-presentation-context/perf-final/evaluate-a1.log`: every line passes |
| Browser proof through `verify` | yes | `docs/plans/artifacts/html-presentation-context/browser/browser-case-a1.log`: 4 of 4 |
| `plate-docs` on the named pages | yes | `content/docs/(guides)/static.mdx` and `static.cn.mdx`; `docx.mdx` and `export.mdx` teach neither old exception, so they stay; `docs/plans/artifacts/html-presentation-context/build/build-source-a1.log`, `docs/plans/artifacts/html-presentation-context/build/docs-parity-a1.log` |
| Barrels (`pnpm brl`) | yes | `docs/plans/artifacts/html-presentation-context/build/brl-a1.log`: no change |
| Changeset | yes | `.changeset/platejs-static-presentation.md`, amended because it is unreleased |
| `best-api repair` | yes | `docs/vision/plate.md` presentation bullet; no skill teaches the contract (`git grep` over `.agents`) |
| Registry output (`pnpm --filter www build:registry`) | yes | `docs/plans/artifacts/html-presentation-context/build/build-registry-a1.log`; the English static guide changed |

## Steps

### Close the two drawing-context findings

Compared with keeping `d295f31731` as it is, this step fixes F1 and narrows F2 instead of documenting them. The compile stops activating plugins, a drawing that calls a context getter while drawing stops the export, elements no plugin renders stop running editing slots, and a component-object slot no peer draws is reported instead of lost. A drawing that copies plain context values before its callback returns, or reads `ctx.editor`, can still draw the presentation's own state, as Open work says. The approved step said a drawing that reads its setup context stops the export instead of drawing the compile editor's state; code review narrowed that claim, as the decision log's deviation row records. Its cost must stay inside phase 1's frozen budget, which the final-path rerun checks.

- [x] Write the red tests at public boundaries in `packages/platejs`, each run alone at `d295f31731` through `node tooling/scripts/proof-worktree.mjs --expect-fail` with its own failure line. (k) A presentation slot built in a `configure` callback that reads `context.schema.type` makes `renderStaticHtml` reject with "Plate runtime is not installed."; it replaces "draws a presentation slot that reads its schema from the configure context". (m) A presentation plugin with an `activate` hook exports and the hook never runs. (n) An element of a type that a complete editor schema passed as a plugin declares, with no Plate owner, exported by `renderStaticHtml` with a presentation draws the peer `afterNodeChildren` and never the installed one, as `f1-reach/schema-a2.log` reproduces. (o) The same element with no peer slot returns a `missing-static-presentation` diagnostic naming the plugin; Word's count of that diagnostic as lost content is phase 1's test j. The approved wording also asked this test for `exportDocx`'s `ok: false`; the decision log's deviation row explains the narrower test. (r1) A bound element with an installed `React.memo` `afterNodeChildren` and a presentation with no peer plugin returns a `missing-static-presentation` diagnostic. (r2) The same with a peer whose `afterNodeChildren` is a `React.memo` object also returns it. Proof: one expect-fail log per test in the run directory's `red/`. (`docs/plans/artifacts/html-presentation-context/red/test-k-a1.log`, `docs/plans/artifacts/html-presentation-context/red/test-m-a1.log`, `docs/plans/artifacts/html-presentation-context/red/test-r1-a1.log`, `docs/plans/artifacts/html-presentation-context/red/test-r2-a1.log`, `docs/plans/artifacts/html-presentation-context/red/test-n-a1.log`, `docs/plans/artifacts/html-presentation-context/red/test-o-a1.log`)
- [x] Implement the detached compile in `compilePeers`, the separate installed and peer reads in `getStaticSlot`, and the fallback branch with the shared slot helper. Proof: tests k, m, n, o, r1 and r2 pass; the two fallback tests without a presentation and every presentation, Word presentation, Word list and registry corpus test stay green; `typecheck:partition:static` and `typecheck:partition:docx-export`; the registry corpus spec with `BaseEditorKit`. (`docs/plans/artifacts/html-presentation-context/build/final-static-partition-a1.log`, `docs/plans/artifacts/html-presentation-context/build/final-docx-export-partition-a1.log`, `docs/plans/artifacts/html-presentation-context/build/final-registry-spec-a1.log`, `docs/plans/artifacts/html-presentation-context/build/final-typecheck-a1.log`)
- [x] Revert each fix alone with `mutate.mjs` on a frozen commit: restore `buildEditor` (k and m fail), read installed slots as functions only (r1 fails), apply the raw read to the peer too (r2 fails), drop the fallback branch (n and o fail), and make the branch unconditional, which must fail the memo fallback test. Proof: the mutation log. (`docs/plans/artifacts/html-presentation-context/mutate/mutate-run-a1.txt`)
- [x] Rerun phase 1's frozen contract `docs/plans/artifacts/html-static-repair-redo/perf-gate/contract.json` on the final path: warm export at 100 to 10,000 paragraphs, one compile per kit identity, first-export overhead under 100 ms, toolbar bundle under 20 KB gzip, each known-bad arm failing, timing lines inconclusive above load 8. Proof: `proof.mjs` logs and the evaluator, then `pstack:benchmark-checklist`. (`docs/plans/artifacts/html-presentation-context/perf-final/evaluate-a1.log`, `docs/plans/artifacts/html-presentation-context/perf-final/checklist.md`)
- [x] Rerun the browser case "the export menu exports interactive blocks to HTML and Word" in `apps/www/tests/browser/docx.spec.ts` through `verify`. Proof: the run log. (`docs/plans/artifacts/html-presentation-context/browser/browser-case-a1.log`)
- [x] Run `plate-docs` on `content/docs/(guides)/static.mdx` and `content/docs/(plugins)/(serializing)/docx.mdx` and their Chinese twins, update the `presentation` JSDoc in `renderStaticHtml.tsx` and `exportDocx.tsx`, amend the unreleased changeset, and run `best-api repair` on the presentation bullet of `docs/vision/plate.md`. Proof: `pnpm --filter www build:source`, the docs source parity check, and the repair's report. (`docs/plans/artifacts/html-presentation-context/build/build-source-a2.log`, `docs/plans/artifacts/html-presentation-context/build/docs-parity-a1.log`, `docs/plans/artifacts/html-presentation-context/build/build-registry-check-a1.log`, `.changeset/platejs-static-presentation.md`, `docs/vision/plate.md`)
- [x] Run the `api-build` panel on the diff. Proof: its decision-log rows. (`docs/plans/artifacts/html-presentation-context/panel-build-r1/`, `docs/plans/artifacts/html-presentation-context/panel-build-r2/`)

## Proof

| Claim | Proof |
| --- | --- |
| A drawing that calls a context getter while drawing makes the export reject | Test k fails at `d295f31731` and passes after; restoring `buildEditor` fails it |
| A component-object slot no peer draws is reported | Tests r1 and r2 fail at `d295f31731` and pass after; the function-only installed read fails r1, the raw peer read fails r2 |
| The compile activates nothing | Test m fails at `d295f31731` and passes after; restoring `buildEditor` fails it |
| Elements no plugin renders follow the presentation | Tests n and o through the public exports; dropping the branch fails them |
| Output without a presentation is unchanged | The two existing fallback tests, the memo one included; the unconditional-branch mutation fails the memo test |
| Phase 1's behavior holds | Every existing presentation and Word test, and the registry corpus spec |
| Cost stays in budget | The final-path contract rerun |

## Open work

Each item stays here until this plan folds into the subject file, which then lists it under Open work.

- Without a presentation, the bound path still never draws an installed `afterNodeChildren` written as a component object, such as `React.memo`, while the fallback draws it; this predates phase 1. owner: natamox. stop: a report of a lost memo slot, or 2026-11-30.
- Without a presentation, `pipeRenderElementStatic`'s fallback still draws `afterNodeChildren` as React elements without plugin context, while presentation and bound elements call it as a function with plugin context (code review round 1, opus warning 3). owner: natamox. stop: the next change to static slot rendering, or 2026-11-30.
- The export menu in `export-toolbar-button.tsx` awaits `renderStaticHtml` and `exportDocx` without catching a thrown error, so a kit whose drawing reads its setup context, like any other thrown export error, gives no file and no toast (panel round 1, sol warning 4). owner: natamox. stop: the next change to the export menu, or 2026-11-30.
- F2 stays partly open. A drawing built in a setup callback draws the presentation's own configuration without an error when the callback copies a plain context value before it returns, such as a destructured `plugin` or `name`, and its `ctx.editor` reads return an empty document (`panel-r3-probes/probe-a1.log`, `panel-build-r1-probes/probe-a1.log`). The JSDoc spells this out, the static guide calls such drawings unsupported, and no shipped kit writes drawings this way. owner: natamox. stop: a plan that gives static drawings a typed editor argument or records callback drawings at the resolver, a report of wrong static output, or 2026-11-30.
- A drawing declared as a value that closes over another editor cannot be detected; the JSDoc says so. owner: natamox. stop: a plan that gives static drawings a typed editor argument, or 2026-11-30.

## Close

### Build

The build ran on branch `export-static-presentation` from `d295f31731`. Nothing is pushed.

#### Reversals and deviations

- At the plan's review cap, the check that spotted drawings built in setup callbacks left the plan after three designs failed review: a time-window check refused other editors' callbacks, a deferred read missed changed results, and a snapshot broke Plite contribution tokens. F2 narrowed to the detached compile.
- Code review narrowed the approved F2 claim again. The approved step said a drawing that reads its setup context stops the export instead of drawing the compile editor's state. On the built code, only runtime lookups while drawing throw: a context getter, or a kept `store`, `read` or `update`. A plain value the callback copied out, such as a destructured `plugin`, draws the presentation's own configuration, and `ctx.editor` reads return an empty document or throw. The JSDoc spells this out, the static guide calls such drawings unsupported, and F2 stays partly open.
- Test o checks the `renderStaticHtml` diagnostic only; Word's count of it as lost content is phase 1's test j.
- Before the plan panel, the lead replaced the arena judge's twin-compile detection, which left first-export overhead at its 100 ms cap; the panel then cut detection altogether.

#### What landed

- `compilePeers` compiles a presentation with `withPlateFormatCompilation` instead of `buildEditor`, so its plugins never activate and the temporary runtime rolls back. First-export overhead is 57.1 ms against the 100 ms cap.
- With a presentation bound, an element no plugin renders draws `afterNodeChildren` through the bound path's slot loop, now `renderStaticAfterNodeChildren`. Without one, the fallback's output is unchanged.
- An installed `afterNodeChildren` written as a component object, such as `React.memo`, with no function in the presentation is reported as `missing-static-presentation` on both paths instead of vanishing.
- The `presentation` JSDoc, both static guides, the Vision presentation bullet and the unreleased changeset describe the result. Registry output was regenerated.

#### Proof and its limits

- Tests k, m, r1, r2, n and o each failed alone at `d295f31731` for their named defect and pass now (`red/`). Seven mutations, one per fix, each fail their test (`mutate/mutate-run-a1.txt`).
- The static and docx-export test partitions (84 and 139 tests), the registry corpus spec, the typecheck partitions, the type tests and the schema adoption audit pass on the final bytes (`build/final-*-a1.log`).
- Phase 1's frozen export contract passes every line on the final path, with each known-bad arm failing, the 100-paragraph line included (`perf-final/evaluate-a1.log`).
- The export-menu browser spec passes 4 of 4 in Chromium against this checkout's source (`browser/browser-case-a1.log`). No registry block reaches the new paths, so the browser run shows no regression; the new behavior rests on the unit and mutation runs.
- The full `pnpm check` passes 22 of 25 steps (`build/pnpm-check-a1.log`); test-slow, review-ledger and knowledge fail the same way at the base commit, on a timing budget and other plans.
- Not shown: a real application document whose element type has no Plate owner, beyond the complete-schema fixture; Firefox and WebKit; opening the Word files in Word.

#### Attention

Reviewed by gpt-6.1-sol @xhigh, the decision-trail review over the frozen commit `e32cac7c20` and transcript lines 6233 to 8989 (`docs/plans/artifacts/html-presentation-context/trail-review/answer.txt`).

- Critical: F2 is only partly fixed. Activation is gone and a context read while drawing now throws, but a drawing that copies plain context values inside its setup callback still draws the presentation's configuration, and `ctx.editor.read` still returns an empty document. The owner asked for both findings fixed; the Defaults row "plan F2 fix" is the decision this leaves.
- Warnings, fixed in this plan: stale wording in the lead paragraph, Layer and owner and Hard cuts; the ledger claimed test o reached `exportDocx`; the twin-compile and token-copy reasons were stated more strongly than their runs, now corrected in the log.
- Warning, standing: the browser run covers regression only, and the export menu still shows no message when an export throws (Open work).
- Notes: the registry corpus checks the older drawing predicate, so it cannot certify the new memo rule; continuing from the plan into the build, the two phase 1 commits and the pre-existing check failures are supported by the transcript.

#### Counts

Seven step boxes and fourteen completion gates: all done, with F2 narrowed as above. Code review ran two rounds; round 2 raised no critical finding. The plan panel ran its three allowed rounds.

### Review inputs

The plan read `packages/platejs/src/static/internal/staticPresentation.ts`, `packages/platejs/src/static/pipeRenderElementStatic.internal.tsx`, `packages/platejs/src/static/pluginRenderElementStatic.internal.tsx`, `packages/platejs/src/static/renderStaticHtml.tsx`, `packages/platejs/src/lib/editor/withPlite.ts` and `docs/vision/plate.md`.

## Evidence

- Run directory: `docs/plans/artifacts/html-presentation-context/`.
- Code map: `how-explorer/brief.md`, `how-explorer/answer.txt`.
- Arena: `architect/grounding.md`, `architect/runner-prompt.md`, `architect/rubric.md`, `architect/runner-opus.txt`, `architect/runner-astra.txt`, `architect/runner-sol.txt`, `architect/judge/verdict.txt`, `architect/candidate-map.json`, `architect/synthesis.md`.
- Premise probes: `premise-probe/probe-a2.log`, `premise-probe/override-a1.log`, `premise-probe/callback-drawings-a1.log`, `premise-probe/callback-drawings-planted-a1.log`, `premise-probe/detached-suite-a2.log`, `premise-probe/cold-a1.log`.
- Timing: `l3-proto/l3-interleaved-a1.log`, `l3-proto/l3-built-a2.log`, `l3-proto/l3-detached-a2.log`, `l3-proto/l3-twice-a2.log`.
- Panel round 1: `panel-r1/prompt.md`, `panel-r1/seat-opus.txt`, `panel-r1/seat-astra.txt`, `panel-r1/seat-sol.txt`; probes `panel-r1-probes/probe-a1.log`, `f1-reach/probe-a1.log`, `f1-reach/unbound-types-a1.log`, `f1-reach/schema-a2.log`.
- Panel round 2: `panel-r2/prompt.md`, `panel-r2/round2.diff`, `panel-r2/seat-opus.txt`, `panel-r2/seat-astra.txt`, `panel-r2/seat-sol.txt`; probe `panel-r2-probes/probe-a1.log`.
- Panel round 3: `panel-r3/prompt.md`, `panel-r3/round3.diff`, `panel-r3/seat-opus.txt`, `panel-r3/seat-astra.txt`, `panel-r3/seat-sol.txt`; probes `panel-r3-probes/probe-a1.log`, `panel-r3-probes/tokens-a1.log`.
