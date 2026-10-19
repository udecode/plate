---
review_scopes: [drawing]
verdict: pursue
review_basis: [2026-10-15-drawing-review]
work_kind: implementation
review_commit: aa2f91c34204faf828a89128eaf318a1b5756fa6
review_inputs: [VISION.md, docs/vision/common.md, docs/vision/plate.md, apps/www/package.json, 'content/docs/(plugins)/(elements)/code-block.mdx', 'content/docs/(plugins)/(elements)/code-block.cn.mdx', apps/www/src/app/dev/code-block-diagram/page.tsx]
review_upstreams: ['../pele@458322a5b8abb1ae57ddf127c32017ab9fb14a92']
---

# Drawing: draw Mermaid with Pele

Status: executed: suggested task t_e0e8d398 times typing on a quiet host
Playbook: plan

**Pursue.** The copied Mermaid renderer item should draw with Pele instead of mermaid.js. In the exact call our item makes, run in headless Chromium on a minified production bundle, Pele draws a 40-node flowchart in 0.5 ms where Mermaid 11.12.3 takes 29 ms, and it loads 69 kB gzip of script for the first flowchart where Mermaid loads 225 kB. That redraw cost is the open limit the 2026-10-15 plan closed with: a diagram redraws on every pause in typing, and on a slower machine keystrokes could wait behind Mermaid. Pele's SVG also states its own width and height, so Export PNG draws a 40-node tree at 3662 by 352 pixels where Mermaid's draws at 300 by 25, which is the bug suggested task `t_f7cbb3b1` holds. The swap stays inside one copied registry item and its docs. The diagram wrapper, the renderer contract, the stored code block and the other three engines do not change. The cost is that Pele lays out and colors diagrams its own way, and Mermaid themes, HTML labels and JavaScript click callbacks stop applying.

## Brief

### What will change?

Mermaid diagrams in your copied code block draw with Pele instead of mermaid.js. The drawing step gets about 60 times faster, the first diagram loads a third of the script or less, and PNG exports keep the diagram's real size.

### What could go wrong?

Pictures won't look like GitHub's, because Pele draws and colors them its own way, and Mermaid themes and HTML labels stop working. Dark mode keeps dark lines on the dark page, as before. Typing on a quiet machine is untimed.

## Teach

A Mermaid diagram here is a code block marked Mermaid. A copied add-on draws its picture below the source, through one small renderer per diagram engine that your app lists.

Today the Mermaid renderer loads mermaid.js, the reference library. It builds each drawing in the page, measures text through the browser and returns an SVG. That takes tens of milliseconds per redraw, and the diagram redraws whenever typing pauses.

Pele reads the same Mermaid text and returns an SVG without touching the page, in about half a millisecond for a 40-node flowchart. Only the renderer's engine changes. Your editor setup, saved documents and the other engines stay the same.

## Public API

An app's editor kit doesn't change. It still lists `mermaidRenderer` from the copied Mermaid item.

```tsx
// content/docs/(plugins)/(elements)/code-block.mdx
const diagramCodeBlockPlugin = createCodeBlockPlugin(
  withDiagrams(CodeBlockElement, {
    renderers: [mermaidRenderer, graphvizRenderer],
  })
);
```

The copied Mermaid item swaps its engine. It drops the render queue, the id counter and the page cleanup, because Pele draws synchronously from the text and leaves nothing in the page.

```ts before
// apps/www/src/registry/components/editor/code-block-diagram-mermaid.ts
export const mermaidRenderer: DiagramRenderer = {
  label: 'Mermaid',
  languages: ['mermaid'],
  render: (source, { signal }) => {
    const render = abortableQueue.then(async () => {
      signal.throwIfAborted();

      const { default: mermaid } = await import('mermaid');

      renderCount += 1;

      const id = `code-block-diagram-mermaid-${renderCount}`;

      try {
        const { svg } = await mermaid.render(id, source);

        return svg;
      } finally {
        document.getElementById(`d${id}`)?.remove();
        document.getElementById(`i${id}`)?.remove();
      }
    });

    abortableQueue = render.catch(() => undefined);

    return render;
  },
};
```

```ts after
// apps/www/src/registry/components/editor/code-block-diagram-mermaid.ts
export const mermaidRenderer: DiagramRenderer = {
  label: 'Mermaid',
  languages: ['mermaid'],
  render: async (source) => {
    const { renderAsync } = await import('pele/lazy');

    const { svg } = await renderAsync(source);

    return svg;
  },
};
```

## What other editors do

Obsidian announced on 2026-10-17 that Pele replaces mermaid.js as its Mermaid renderer in its next version. The rest of the comparison is unchanged.

| Delta | Editor | Where the source lives | View stored in the document | Markdown or HTML | Who owns the renderer | Remote server by default |
| --- | --- | --- | --- | --- | --- | --- |
| changed | Obsidian | Markdown `mermaid` fence text | No; source, live preview and reading are UI modes | `mermaid` fence | Built in; Pele from its next version | Undocumented |

## Defaults

| Decision | Pick | Alternative | Word | Impact |
| --- | --- | --- | --- | --- |
| Mermaid engine | Pele, about 60 times faster per redraw and a third of the script or less (look) | Keep mermaid.js | keep mermaid | big |
| A second Mermaid item | None; one Mermaid item, and an app that wants mermaid.js keeps its own copy of today's item | Ship a mermaid.js item beside the Pele one | both engines | small |
| Diagram colors | Pele's default colors in both modes, so dark mode shows dark lines on the dark page, as Mermaid's default did (look) | Paint a light card behind every picture, or match the app's theme with live markup in the page | light card | small |
| Pictures in static pages | Still source only, as today | Draw them in static pages now, since Pele needs no browser | static pictures | small |
| Next step | Plan, then build | Stop at the plan | stop at plan | detail |
| Pele's age | Exempt exactly pele 1.6.0 from the repo's seven-day wait for new packages, since you said its age doesn't matter (look) | Wait until 2026-10-24, when 1.6.0 clears the wait | wait a week | small |
| Speed proof | Build now, since Pele does no page layout and loads less script; time it again after the build | Wait for a quiet machine before building | wait for timing | detail |
| Tests of mermaid.js internals | Delete the three tests for Mermaid's leftover page nodes and sandbox mode | Keep them for apps that stay on mermaid.js | keep rows | detail |
| Drawing page link | New page at https://claude.ai/artifact/39jaGe5sHWk5ND6tJVk8aD, since the old one belongs to another account | Go back to https://claude.ai/artifact/6WdMHkLGCrdyZHK3qChH48 | drop new page | detail |

## Hard cuts and app migration

No release has shipped the Mermaid item yet; it is new in the 2026-10-16 changelog draft. An app that copied it from `next` keeps its copy until it pulls the item again. Switching to Pele drops these mermaid.js behaviors, which the Pursue verdict allows:

- Your app's `mermaid.initialize` settings, such as theme, `themeVariables` and fonts, no longer reach the pictures, because Pele doesn't read them. Front matter and `%%{init}%%` lines inside the diagram still work. The docs sentence that promised your app's settings goes.
- After a failed render, the item no longer cleans Mermaid's leftover nodes out of the page, because Pele never touches the page. The probe counted zero layouts and zero style recalcs per render. The two tests that looked for leftover Mermaid nodes go too.
- Sandbox mode goes, because Pele has none. Mermaid drew it in an iframe, which the block showed as an error anyway. Its test and the dev page's `mermaidSecurity` option go.
- HTML labels and JavaScript click handlers go. The picture is an image, so no click handler ever ran.
- The render queue goes. Mermaid needed it because its renders share page state. Pele keeps no per-render state and loads each diagram type once, and the block already throws away the result of a cancelled render.
- Pictures look different. The saved source doesn't change at all.

## Feature plan

Optional packs:

- `performance-observability`, because the item's redraw runs after every pause in typing.

Flow mode:

- registry-only

Completion threshold:

- Every applicable Feature Manifest row is complete with evidence.
- Every excluded row has an explicit N/A reason.
- Selected packs and the feature checker are closed, and no plan box is pending.

Feature Manifest:
| Surface | Applies | Owner | Artifacts | Consumer | Proof | Status |
| --- | --- | --- | --- | --- | --- | --- |
| API | no | best-api | N/A: the item keeps `mermaidRenderer`, its label and its language, so no call changes | apps that list `mermaidRenderer` | N/A: no call shape changes | N/A: unchanged call shape |
| Package | no | plate-plugins | N/A: no package source changes | package consumers | N/A: registry-only swap | N/A: registry-only swap |
| React adapter | no | plate-plugins | N/A: no adapter changes | React consumers | N/A: registry-only swap | N/A: registry-only swap |
| Registry UI | yes | plate-ui | `apps/www/src/registry/components/editor/code-block-diagram-mermaid.ts` | apps that pass `mermaidRenderer` to `withDiagrams` | browser spec and hand drive, steps 3 and 7 | complete |
| Composition | yes | plate-ui | `code-block-diagram-demo` and `/dev/code-block-diagram`, which list `mermaidRenderer` beside the other engines | copied editor kits | browser spec, step 3 | complete |
| Scale proof | yes | benchmark | `docs/plans/artifacts/2026-10-18-drawing-pele-review/probe/` frozen contract | users/maintainers | pre-acceptance probe a1, then the production-path rerun, step 6, where D1 to D3 pass and T1 and T2 go to suggested task `t_e0e8d398` for a quiet host | complete |
| Registry metadata/examples | yes | plate-ui | `apps/www/public/r/code-block-diagram-mermaid.json` and `apps/www/src/__registry__/index.tsx`, which infer `pele` from the import | the shadcn CLI install | generated output read back, step 4 | complete |
| Docs | yes | plate-docs | `content/docs/(plugins)/(elements)/code-block.mdx` and `code-block.cn.mdx`, Diagrams section | docs readers | docs checks and the served page, step 5 | complete |
| Release artifacts | yes | changeset | `apps/www/src/registry/changelog/entries/2026-10-16-code-block-diagrams.mdx`, the unreleased draft | registry changelog readers | regenerated changelog index, step 4 | complete |

Package boundary contract:
| Contract | Decision | Evidence |
| --- | --- | --- |
| shared Plate host | N/A: no package changes | registry-only flow |
| Plite ownership | N/A: no Plite code changes | registry-only flow |
| external dependency ownership | The copied item owns `pele`; `apps/www/package.json` pins `^1.6.0` in place of `mermaid` | `build:registry` infers item dependencies from imports |
| entrypoint runtime | N/A: no package entrypoint changes | registry-only flow |
| Oxlint coverage | N/A: no package changes | registry-only flow |

Start Gates:
| Gate | Applies | Evidence |
| --- | --- | --- |
| Feature Manifest complete before source writes | yes | every row above resolves |
| Flow mode selected | yes | registry-only |
| Public API decision owner selected | yes | best-api; no call shape changes |
| Runtime scale applicability resolved | yes | Scale proof yes; the redraw runs after every pause in typing |
| Pre-acceptance Benchmark receipt selected | yes | Probe a1 under Evidence; T1 and T2 gate to step 6 |
| Public feature entrypoint decision recorded | yes | N/A: no new entrypoint; the item keeps its name |
| Conditional packs selected | yes | `performance-observability` |

Completion Gates:
| Gate | Applies | Required action | Evidence |
| --- | --- | --- | --- |
| Manifest coverage | yes | Run `node tooling/scripts/check-plate-feature.mjs docs/plans/2026-10-18-drawing-pele-review.md` | `check-plate-feature-a1.log` |
| Selected pack closure | yes | Close `performance-observability` | closed: D1 to D3 pass on the production path (`prod-judge-a3.log`); T1 and T2 go to suggested task `t_e0e8d398` under the Time budget rule |
| Package proof | no | N/A: registry-only swap | N/A |
| Package boundary proof | no | N/A: no package changes | N/A |
| Scale proof | yes | Probe a1 and the production-path rerun in step 6, plus the browser spec as the correctness guard | `judge-a1.log`, `prod-judge-a3.log`, `prod-judge-known-bad-a3.log` and the spec logs |
| Registry/browser proof | yes | Steps 3, 4 and 7 | spec logs in three engines, `mutant-non-svg-chromium-a1.log`, `docs-build-registry-check-a2.log`, `hand-drive-check-a1.log` |
| Docs/release proof | yes | Steps 4 and 5 | `docs-build-source-a2.log`, `docs-parity-a2.log`, `build-changelog-check-after-a1.log` and the served pages |

Performance pack gates:
| Gate | Applies | Evidence |
| --- | --- | --- |
| User-facing operation and runtime owner | yes | redraw of a Mermaid block's picture after a pause in typing; owner `mermaidRenderer.render` |
| Scale variables and cohorts | yes | node count, edge labels and message count; cohorts normal-flowchart-40, normal-sequence-8x30 and large-flowchart-200 |
| Budget frozen before target measurement | yes | `probe/frozen.md`, with the exploratory read disclosed |
| Baseline and target probe | yes | base bundles today's call, candidate bundles the planned call; step 6 bundles both real items |
| Correctness guard | yes | every sample's SVG root and marker; the browser spec in step 3 |
| Production detector | no | N/A: Plate ships no runtime detector for copied items |

## Demo

1. Open `/blocks/code-block-diagram-demo`. The Mermaid block draws its flowchart with Pele. The boxes are gray with rounded corners where mermaid.js drew purple ones, and the layout is the same.

   ![before](artifacts/2026-10-18-drawing-pele-review/demo/before.png) ![after](artifacts/2026-10-18-drawing-pele-review/demo/after.png)

2. Put the caret at the end of the Mermaid source and type a new line, `E --> F`. Once you stop typing, the picture redraws with a new F box under End.
3. Switch the site to dark. The picture keeps its light boxes and its dark lines, which sit on the dark page, as they did with mermaid.js.

   ![before](artifacts/2026-10-18-drawing-pele-review/demo/before-dark.png) ![after](artifacts/2026-10-18-drawing-pele-review/demo/after-dark.png)

4. Click the download button in the Mermaid block's toolbar. The saved `diagram.png` is as wide as the picture's SVG says, not 300 pixels.

## Steps

The Build playbook runs these.

- [x] 1. Swap the engine. `code-block-diagram-mermaid.ts` awaits `pele/lazy`'s `renderAsync` and returns its SVG, and its doc comment says it draws with Pele and reads settings only from the diagram text. `apps/www/package.json` replaces `mermaid` with `pele` at `^1.6.0`, `pnpm-workspace.yaml` exempts exactly `pele@1.6.0` from the seven-day release age, and `pnpm install` updates the lockfile. Proof: `pnpm --filter www typecheck`, and `git grep` finds no `mermaid` import in `apps/www/src`. Result: done in f736fcd247; the www typecheck passes every step but tsc, whose one error is in `packages/platejs` and fails the same way at base (`build-www-tsc-a1.log`, `base-www-tsc-a1.log`); no `mermaid` import remains (`build-grep-mermaid-imports-a1.log`).
- [x] 2. Trim the dev page. `apps/www/src/app/dev/code-block-diagram/page.tsx` drops the `mermaidSecurity` parameter and its `mermaid` import. Proof: step 1's typecheck. Result: done in f736fcd247, under the same typecheck.
- [x] 3. Update `apps/www/tests/browser/code-block-diagram.spec.ts`. Label checks match `>CX<` and `>Q<`, which hold for any engine's text. The two leftover-node rows and the sandbox row go. The Gantt row becomes "a Mermaid Gantt chart exports at the size its picture states", which checks that the exported PNG is as wide as the SVG's `width` and wider than 300 pixels. Proof: the spec passes in Chromium against a Plite-mode server, and the Gantt row's control fails at base, where Mermaid's Gantt decodes at 300 by 35 (`gantt-control-base-a1.log`). Result: done in f736fcd247; 18 of 18 rows pass in Chromium (`build-diagram-spec-chromium-a1.log`).
- [x] 4. Regenerate the registry with `pnpm --filter www build:registry`, and add to the 2026-10-16 draft changelog bullet that the Mermaid renderer draws with Pele. Proof: `apps/www/public/r/code-block-diagram-mermaid.json` lists `pele` and not `mermaid`. Result: done in f736fcd247; the generated item lists `pele` only, and the changelog JSON check passes (`build-changelog-check-after-a1.log`).
- [x] 5. Run `plate-docs` on `content/docs/(plugins)/(elements)/code-block.mdx` and its Chinese twin, which edits the renderer table's dependency cell, the configuration sentence and the Views bullets on Mermaid's width, PNG size and sandbox mode. Proof: the docs checks, and the served `/docs/code-block` page shows the new Mermaid sentence. Result: `build:registry`, its `--check`, `build:source` and the parity check pass (`docs-*-a2.log`), and the served English and Chinese pages show the Pele, ZenUML and background sentences in their rendered text, with no `securityLevel` left.
- [x] 6. Rerun the frozen contract on the production path. `build-arms.mjs` bundles the real item from a proof worktree at the base commit and from this checkout, then `paired-timing.mjs` and `judge.mjs` judge them. Proof: D1 to D3 pass. T1 and T2 decide only under load 9; above it they go to a session card, and a conclusive miss sends the engine choice back to `architect`. Result: D1 to D3 pass on the real items. Pele forces 0 layouts per render where Mermaid forces 239, 46.5 and 1463, loads 54245 B gzip before the first flowchart where Mermaid loads 202284 B, and states a numeric width on every cohort (`prod-judge-a3.log`). T1 and T2 stay gates, because the load reached 15.36 (`prod-paired-timing-a3.log`). The known-bad twin fails D1 to D3 with the judge's own text (`prod-judge-known-bad-a3.log`).
- [x] 7. Drive `/blocks/code-block-diagram-demo` by hand: type into the Mermaid block, watch the picture redraw, and export a PNG. Proof: before and after frames for the Demo. Result: typing `E --> F` key by key grew the Mermaid picture from 410 to 506 pixels tall with an F box, and the hand drive covers every cell (`hand-drive-check-a1.log`). Export PNG ran in the spec instead, because a click saves a file. The Demo holds light and dark frames from both engines (`frame-*-a1.log`).
- [x] 8. Panel on the diff, per the `push` row, because the swap deletes mermaid.js behaviors. Proof: panel rows in the decision log, with each finding fixed or answered. Result: one round, no critical finding; the fixes merged in 33bcb0db11 and 12528cfd0e, and the non-SVG row fails on the mutant that deletes the check it guards.
- [x] 9. Close. Run the writing passes, `pnpm lint:task`, `review-ledger.mjs check` and `check-plate-feature.mjs`, fold the delta into `docs/plans/topics/drawing.md`, and land with `node .agents/pstack/land.mjs`. Proof: the land log. Result: the writing passes, `lint:task`, `check-plate-feature.mjs` and `review-ledger.mjs check` ran before landing, as the decision log records.

## Open work

- Export PNG of a very wide diagram can save an empty image. Pele states a chain of 400 to 500 nodes at 75678 to 82388 pixels wide, past the browser's canvas limit, and the shared exporter in `code-block-diagram.tsx` does not scale it down. Owner: suggested task `t_3bdcf6b3` in the ledger. Stop: none, since such chains are rare and the source is unharmed.
- The registry item names `pele` with no version range. Owner: suggested task `t_b0f60c45`, which pins every engine's version. Stop: none.
- The timing lines T1 and T2 stay gates, because step 6 ran while the host's load was 15.36, above the frozen limit of 9. Owner: suggested task `t_e0e8d398`, which now also reruns step 6 on a quiet host. Stop: a conclusive miss sends the engine choice back to `architect`.

## Close

Reversals and deviations:

- The Brief first promised each redraw about 60 times faster. The panel showed that the image encoding and decoding around the engine cost the same for both engines, so the claim narrowed to the drawing step. The dark-mode claim narrowed the same way, because a Pele picture paints no background, like Mermaid's default.
- Step 6's first two attempts stopped on the harness, not the product. The configs named an `/arms/` folder while the bundles sat in `arms-prod/`, and the judge crashed on the partial file. Both were repaired before the run that counts.
- The before frames came from the main checkout at `7b7b76573b`, whose diagram files match the base commit, because the preview tool starts its servers there. The after frames and the hand drive used a worktree server started from the shell and opened by its address.
- The hand drive did not click Export PNG, which saves a file. The Gantt and Export PNG spec rows cover it in Chromium, Firefox and WebKit.

The copied `code-block-diagram-mermaid` item draws with Pele 1.6.0 through `pele/lazy`'s `renderAsync`, without mermaid.js, its render queue, its id counter or its page cleanup. `apps/www/package.json` asks for `pele@^1.6.0` in place of `mermaid`, and `pnpm-workspace.yaml` exempts exactly `pele@1.6.0` from the seven-day release age. The dev page, `apps/www/src/app/dev/code-block-diagram/page.tsx`, drops `mermaidSecurity` and gains an `output=html` probe. The diagram spec drops the three rows that tested mermaid.js internals, checks labels in a way any engine passes, turns the Gantt row into an export-size row that also checks paint, and adds a row for a renderer that returns markup other than SVG. The docs in `content/docs/(plugins)/(elements)/code-block.mdx` and `content/docs/(plugins)/(elements)/code-block.cn.mdx`, the changelog draft and the generated registry output name Pele. The engine stays app policy in copied source, as `docs/vision/plate.md` asks, and the swap keeps one way to draw Mermaid and adds no debounce, as `VISION.md` and `docs/vision/common.md` ask.

Proof and where it stops:

- The diagram spec passes 19 of 19 rows in Chromium (`final-diagram-spec-chromium-a1.log`), 16 in Firefox and 17 in WebKit (`r1-diagram-spec-firefox-a1.log`, `r1-diagram-spec-webkit-a1.log`). The skipped rows are the native clipboard rows outside Chromium and Firefox's known ArrowDown row, `t_8b029a28`.
- With the wrapper's SVG check deleted, the new non-SVG row fails on its own error-text assertion (`mutant-non-svg-chromium-a1.log`). The Gantt row's control fails at base (`gantt-control-base-a1.log`).
- On the real items, Pele forces no layout per render where Mermaid forces 239 to 1463, loads 54245 B gzip before the first flowchart where Mermaid loads 202284 B, and states a numeric width on every cohort (`prod-judge-a3.log`). The timing lines stay unproven, because the host's load reached 15.36 against a limit of 9.
- `build:registry`, its `--check`, `build:source` and the docs parity check pass (`docs-build-registry-a2.log`, `docs-build-registry-check-a2.log`, `docs-build-source-a2.log`, `docs-parity-a2.log`). The served English and Chinese code block pages and `/docs/releases` show the new sentences in their rendered text.
- The hand drive covers 10 desktop cells and 1 load cell (`hand-drive-check-a1.log`). Typing `E --> F` into the demo grew the Mermaid picture from 410 to 506 pixels tall with an F box.
- Safari and typing speed on a quiet host stay unproven. The www typecheck's tsc step fails on one error in `packages/platejs`, the same way at base, and suggested task `t_086e37a6` holds it.

The diff panel ran one round with opus, gpt-6-astra and gpt-6.1-sol at xhigh. It found no critical issue, 5 warnings and 3 nits. The run applied five findings, deferred two with an owner and dismissed one, as the decision log records. No round 2 ran, because no critical finding was applied.

The owner sent 3 messages, and each was handled. The ask got a Pursue verdict and this build, the word on Pele's age became the release-age exemption, and "codex is back" resumed the panel.

The 2026-10-15 drawing plan is still open on `t_e0e8d398`. Its Open work item for `t_f7cbb3b1` and its mermaid.js call sites are now out of date. When it folds, its Mermaid item is the Pele one the subject already shows. This change fixes suggested task `t_f7cbb3b1`, which the ledger closes once it lands.

## Evidence

Model: claude-opus-5-5 at xhigh effort, read from this session's transcript.

### Requirements

- Draw a Mermaid code block's picture below its source, redraw it after the source changes, and export it as a PNG. These are the copied `code-block-diagram` item's jobs, as `content/docs/(plugins)/(elements)/code-block.mdx` teaches them.
- Read the Mermaid syntax people paste from GitHub and other tools, because the stored shape is a `mermaid` fence ([drawing subject](topics/drawing.md), What other editors do).
- Engines, their settings and any backend are app policy in copied source; a base item hides no backend ([plate.md](../vision/plate.md), the provider paragraph at line 1068).
- A renderer never mutates the app's own configuration of a shared library, as the 2026-10-15 plan's Mermaid-config row says.
- Do not hide latency behind debounce ([VISION.md](../../VISION.md), Common Essentials). The wrapper redraws once the editor goes idle after each change, so the engine's own cost is what a typist pays.
- One way per common operation ([common.md](../vision/common.md), Taste).
- Pele's age does not count, in the owner's words "i dont care about the fact it's too recent".

### Runtime proof

`docs/plans/artifacts/2026-10-18-drawing-pele-review/probe/` holds the probe. `build.mjs` bundles the current item's call, `await import('mermaid')` then `mermaid.render`, and the planned one, `await import('pele/lazy')` then `renderAsync`, with esbuild 0.28.0, ESM, code splitting and minification, against Mermaid 11.12.3 from `apps/www` and `pele@1.6.0` from npm. `run.mjs` serves both from localhost and drives headless Chromium through Playwright 1.61.0. Each of five rounds opens a fresh page per engine and alternates which goes first. Each page times the first picture cold, then each case three times warm and twenty times measured, and takes the median. Every output must parse to an SVG root and contain its last label, so no rejected or empty render counts. The host had 18 cores and a one-minute load of 7.7 to 10.7.

| Measure | Mermaid 11.12.3 | Pele 1.6.0 |
| --- | --- | --- |
| First picture, cold page, 40-node flowchart | 75.1 ms (71.0 to 84.6) | 17.5 ms (14.7 to 18.6) |
| Redraw, flowchart tree, 40 nodes | 29.3 ms (27.4 to 31.1) | 0.5 ms (0.4 to 0.6) |
| Redraw, flowchart mesh, 50 nodes, 20 labelled edges | 43.6 ms (41.6 to 47.0) | 1.0 ms (1.0 to 1.1) |
| Redraw, sequence, 8 participants, 30 messages | 4.1 ms (4.1 to 4.6) | 0.1 ms (0.1 to 0.1) |
| Script loaded for the first flowchart, gzip | 225 kB in 30 files | 69 kB in 18 files |
| Every chunk of the library, gzip | 795 kB | 275 kB |
| Image size of the 40-node tree as `<img>` | 300 by 25 px | 3662 by 352 px |
| Render errors | 0 | 0 |

Logs: `docs/plans/artifacts/2026-10-18-drawing-pele-review/build-bundles-a1.log` and `chromium-timing-a1.log`, with per-file sizes in `out/sizes.json`.

**Why the gap.** Mermaid builds each drawing as live page nodes, measures its labels through the browser's layout and then serializes the SVG. Pele parses the text and measures labels with a canvas, or a table of Arial widths where no canvas exists, and returns a string without touching the page (`../pele@458322a5b8:src/text/measurer.ts`, `src/core.ts`). That reading comes from the source; no profile ran. Chromium's clock here ticks in 0.1 ms steps, so Pele's sub-millisecond medians are rounded and the redraw ratios, 44 to 60 times, are lower bounds on the flowcharts. Pele's site claims 100 to 500 times; this probe does not reproduce that, and the page claims only what ran.

**What it means for a typist.** The 2026-10-15 plan measured one redraw of a 40-node Mermaid block at about 45 ms of main thread on the dev server's development build, and typing in Both at 59 ms of task time per keystroke (`docs/plans/artifacts/2026-10-15-drawing-review/perf/measurements-a1.json`, cohort c). The engine is most of that cost. No run has typed into the editor with Pele yet. The build's browser spec does that.

### Pre-acceptance probe

`probe/frozen.md` froze five lines before the measured run; the exploratory run above read candidate numbers first, and the file says so. Four arms ran in six mirrored packets: Mermaid as base, Pele as candidate, a second Pele build as the same-code arm, and Pele plus one forced layout and a 30 ms wait as the planted arm. The host had 18 cores and a one-minute load up to 38, above the frozen limit of 9.

| Line | Rule | Result |
| --- | --- | --- |
| D1 | Pele forces no layout and no style recalc per render | passes, 0 on every cohort against Mermaid's 239, 46.5 and 1463; the planted arm shows 2 |
| D2 | Pele loads at most half of Mermaid's script before the first flowchart | passes, 54168 B gzip against 202127 B |
| D3 | every sample draws its marker, and Pele's SVG states a numeric width | passes, 3662, 834 and 9669 px wide; Mermaid states no width |
| T1 | Pele's redraw takes at most a tenth of Mermaid's | inconclusive on load, with ratios 0.017, 0.036 and 0.022, same-code noise at most 0.003, every planted arm past the budget |
| T2 | Pele redraws in 4 ms on normal cohorts and one frame on the large one | inconclusive on load, at 0.48, 0.15 and 5.0 ms |

The known-bad run put Mermaid in the candidate's place. The judge failed it with its own D1, D2 and D3 text, and the paired runner called it inconclusive only on load. A loaded host never accepts a speed claim, so acceptance rests on D1 to D3, and T1 and T2 rerun in step 6. Logs: `paired-timing-a1.log`, `judge-a1.log`, `paired-timing-known-bad-a1.log` and `judge-known-bad-a1.log` in the run directory.

### Pele's surface

- `render(text, options)` returns `{ svg, width, height, links }` synchronously. `pele/lazy`'s `renderAsync` loads only the diagram type the text needs, then renders. It throws a `PeleError` with a code (`unsupported-diagram`, `syntax`, `semantic`, `limit`) and a message that may quote the diagram text, which the wrapper already shows as React text.
- It reads every diagram type built into Mermaid 12.1.0, front matter, `%%{init}%%` directives, comments and accessibility titles. It does not read ZenUML or other external Mermaid plugins, arbitrary HTML labels or JavaScript click callbacks, and Mermaid themes and `themeVariables` do not apply. Its layout differs from Mermaid's (`../pele@458322a5b8:website/src/content/docs/compatibility.md`).
- Colors come from `--pele-*` CSS variables with built-in fallbacks. The root SVG paints no background. Inside an `<img>`, page CSS does not reach the SVG, so the fallbacks draw.
- It has no runtime dependencies, keeps no global configuration beyond the registry of loaded diagram types, escapes diagram text, filters link and image URLs and caps source and output size (`SECURITY.md`). The wrapper still shows each picture as an `<img>` of an SVG data URL, so nothing in it runs or loads.
- `npm view pele@1.6.0` names `git+https://github.com/obsidianmd/pele.git` and four maintainers from the Obsidian team. The MIT license covers it and the Mermaid specs it vendors.

### Lanes

1. **Keep mermaid.js. Loses.** It works and is tested, but each redraw costs 29 to 44 ms of main thread on these flowcharts, the first diagram loads 225 kB gzip, the PNG of most Mermaid types exports at 300 pixels wide, and suggested task `t_f7cbb3b1` stays open.
2. **Strongest deletion: drop the Mermaid item. Loses.** A `mermaid` fence is the exchange format every product in the subject's comparison reads, so drawing it is the main diagram job.
3. **Pele first, mermaid.js for what Pele cannot draw. Loses.** Pele reads every built-in Mermaid 12.1.0 type, so the fallback serves only ZenUML and external plugins. It keeps mermaid.js in the app's dependencies, two looks for one language and the page cleanup Pele removes.
4. **A Pele item beside the mermaid.js item. Loses.** Both claim `mermaid`, and `withDiagrams` throws when two renderers claim one language, so an app installs one. Plate would ship two ways to do one common job. The only need the second way serves is exact Mermaid layout and Mermaid themes, and an app that keeps its copy of today's item already has both.
5. **Swap the engine inside the Mermaid item. Wins.** The item keeps its name, its export and its language, so no app call changes. It deletes the render queue, the id counter and the page cleanup, which existed because mermaid.js renders through shared page state.
6. **Pele only: drop Graphviz, flowchart.js and PlantUML, and the wrapper's async scheduling. Loses.** DOT, flowchart.js and PlantUML are other languages that Pele does not read, and GitLab and Typora fences use them. The wrapper's idle scheduling stays for those engines.
7. **Pele inline in the page, so diagrams follow the app's theme live. Not now.** Pele's CSS variables reach the SVG only as live markup. The wrapper shows every engine's output as an image so that no engine's SVG runs in the page, PlantUML's server output included. Changing that is its own design question with its own proof.

**Proof limits.** The timings ran in headless Chromium on a loaded host, outside the editor; they time the engine call, not typing. Firefox and WebKit did not run. No corpus of real-world Mermaid diagrams compared the two engines' parse results or looks. Pele's docs say its parsers run Mermaid's parser specs and differential fuzzing, which this review did not rerun.

### Dependents

- `persistence`: unaffected. `packages/platejs/src/migrations/migratePlateV54.ts` turns a saved v53 drawing into a code block with `language: 'mermaid'`, which names the fence language, not the engine.

### History

- This review retains [2026-10-15-drawing-review](2026-10-15-drawing-review.md) for the representation, the wrapper, the renderer contract and the one-item-per-engine ownership. It reopens only the engine inside `code-block-diagram-mermaid.ts`. Its Limit on redraw cost per pause in typing and its suggested task `t_f7cbb3b1` on Mermaid's picture size are the two problems this change targets.
- Suggested task `t_e0e8d398` times a frozen tree that still draws with mermaid.js. Its typing line C measures that engine, so once this lands, its Mermaid redraw numbers describe the old engine.
- External checkout: `../pele` at `458322a5b8abb1ae57ddf127c32017ab9fb14a92`, read on 2026-10-18.
