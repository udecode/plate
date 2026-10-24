# Intake: should Plate use Pele for math

Page: https://claude.ai/artifact/Tx8SSHXLF5GHAZ6H53ji4x
Status: done: 4 items, 2 chips offered, 0 folded
Playbook: verdict

The owner asked whether Plate should use Pele for math, after a tweet saying Pele now supports math resolvers. Not for Plate's equations, because Pele has no math engine of its own. Its new math support covers only `$$...$$` inside diagram labels, and for those it calls a typesetter the app passes in, such as KaTeX, MathJax or Temml. Plate's equations already draw with KaTeX directly, so Pele has nothing to add there. Whether Mermaid diagram labels should show math is a design choice. The KaTeX route may not show up in our image-based picture or its PNG export, and MathJax would add a second math engine, so a design task decides it. Plate has drawn Mermaid with Pele since 2026-10-18, still on 1.6.0. Moving to 1.9.0 has to wait for the repo's seven-day wait on new packages, which ends on 2026-10-29.

## Brief

### What will change?

Nothing in the code changes yet. Two new tasks: update Mermaid diagrams to Pele 1.9.0 once it is a week old, and decide whether diagram labels should show math and which engine draws it.

### What could go wrong?

Math drawn with KaTeX might not show up in the diagram picture or its PNG download, and nobody has checked. MathJax would show up there, but then we would ship two math engines.

## Pushback

- **Pele is not a math engine.** Its docs say it ships no typesetter and hands each `$$...$$` label to a resolver the app passes in (`../pele@e7f092a:website/src/content/docs/api.md:370`). "Use Pele for math" can only mean math inside diagram labels. Equations stay on KaTeX whatever we decide (`apps/www/src/registry/components/editor/math.tsx:4`, `math-static.tsx:16`).
- **Plate already uses Pele.** The copied Mermaid item has drawn with Pele since the 2026-10-18 review, pinned to 1.6.0 (`apps/www/src/registry/components/editor/code-block-diagram-mermaid.ts:11`, `docs/plans/topics/drawing.md:35`). Math support arrived in 1.8.0, so the open question is whether the item passes a math resolver.
- **"Even faster rendering" is Pele's claim, not our number.** Our own timing of the production path is still task t_e0e8d398, which waits for a quiet machine.
- **The swap's list of losses skips math.** The 2026-10-18 review lists Mermaid themes and HTML labels as lost (`docs/plans/2026-10-18-drawing-pele-review.md:26`). Mermaid typesets `$$` labels with KaTeX (`../pele@e7f092a:website/src/content/docs/compatibility.md:96`), and our Pele call passes no resolver, so those labels show their TeX source. Nobody checked whether mermaid.js ever drew them in our picture.
- **Our picture limits which typesetter output can work.** The wrapper turns each SVG into a data-URL image and draws Export PNG through a canvas (`apps/www/src/registry/components/editor/code-block-diagram.tsx:131`, `:190` to `:211`). An image never sees the page's CSS, so KaTeX's HTML output cannot work there. Only MathML or SVG can. Pele puts MathML inside a `<foreignObject>`, which its docs say displays only in browsers (`api.md:414`). SVG from MathJax displays anywhere (`api.md:384`).

## Items

| # | Item | Outcome | Scope | Strongest reason | Evidence | Next |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Use Pele in place of KaTeX to draw Plate's equations | Stop | math | Pele ships no typesetter. It calls KaTeX, MathJax or Temml for the app, and Plate's equations already call KaTeX directly | `../pele@e7f092a:website/src/content/docs/api.md:370`; `apps/www/src/registry/components/editor/math.tsx:43`; `apps/www/src/registry/components/editor/math-static.tsx:16` | none |
| 2 | Typeset `$$...$$` in Mermaid labels by passing Pele a math resolver | Open question | drawing | The engine is a design choice, and nobody has checked whether the one Plate already ships draws in our picture. KaTeX and Temml give MathML in a `<foreignObject>`. Nobody has observed whether that MathML paints inside a data-URL image, keeps the size the resolver measured on the page, and survives the canvas behind Export PNG in Chromium, Firefox and WebKit. MathJax gives SVG that paints anywhere, but adds a second TeX engine and an async startup | `api.md:384`, `:414`, `:416`; `apps/www/src/registry/components/editor/code-block-diagram-mermaid.ts:13`; `apps/www/src/registry/components/editor/code-block-diagram.tsx:131`, `:208` | chip t_d94b73c3 |
| 3 | Move to Pele 1.9.0 for faster drawing, Sankey gradients, fewer edge crossings and sub, sup, code and kbd in labels | Defer | drawing | The repo holds new packages for seven days, and 1.9.0 shipped on 2026-10-22, so it clears on 2026-10-29. The speedup is Pele's claim, and Sankey gradients draw only when the call passes an `idPrefix`, which our item does not | `pnpm-workspace.yaml:12`, `:14`; npm publish times of pele 1.8.0 and 1.9.0; `../pele@a06891e` | chip t_c4cc2dc4 |
| 4 | Pele now ships in Obsidian 1.15 and dozens of apps | Settled | drawing | The 2026-10-18 review already picked Pele for Mermaid, and that build landed with its browser spec. Wider adoption adds confidence and changes nothing | `docs/plans/2026-10-18-drawing-pele-review.md:16`; `apps/www/tests/browser/code-block-diagram.spec.ts` | none |

## Order

1. Item 2, t_d94b73c3, can start now. Its probe can install Pele 1.9.0 in a throwaway worktree, and a build that adopts a resolver waits for t_c4cc2dc4.
2. Item 3, t_c4cc2dc4, runs after 2026-10-29, when 1.9.0 clears the wait, unless you exempt it sooner.

## Defaults

| Decision | Pick | Alternative | Word | Impact |
| --- | --- | --- | --- | --- |
| Pele 1.9.0's age | Wait until the repo's seven-day hold on new packages ends on October 29 | Exempt 1.9.0 now, as you did for 1.6.0 | exempt pele | small |
| When the math decision runs | Start it now, testing the new version in a scratch copy | Wait until the version update lands | math after bump | detail |

## Close

This run landed this page and its decision log and offered two tasks. It wrote no code and no test.

It read Pele's source at `e7f092a`, the 1.9.0 release, for its math resolver commits and its API, compatibility, security and theming docs. It also read our Mermaid item, the diagram wrapper's image and PNG export code, the copied math elements, the release-age config, the 2026-10-18 and drawing subject records and the ledger. Nothing ran in a browser, so whether MathML paints inside our picture, and its size there, stays unobserved, and task t_d94b73c3 owns that probe.
