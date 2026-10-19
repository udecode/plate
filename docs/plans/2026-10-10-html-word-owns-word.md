---
review_scopes: [documents, html, exports]
review_basis: []
work_kind: implementation
review_commit: 0b6281ac2b80a22ff7baf048ebd9c530251e9b02
review_inputs: [packages/platejs/src/docx/export/lib/exportDocx.lists.spec.tsx, packages/platejs/src/docx/export/lib/exportDocx.spec.ts, packages/platejs/src/docx/export/lib/sourcePreservation.spec.ts, packages/platejs/src/docx/import/lib/importDocx.math.slow.tsx, apps/www/src/registry/components/editor/docx-export.spec.tsx, apps/www/tests/browser/docx.spec.ts]
---

# Word export follows Word's own rules

Status: done: in pull request #5157 into next; folded into the documents subject
Playbook: plan

The owner asked to build item C of the export finishing list as one plan instead of splitting it. It is phase 3 of `docs/plans/2026-10-09-html-static-repair-redo.md`, "Word owns Word". Base reproductions on the real `exportDocx` with the registry kit and stylesheet show four Word defects: two concurrent exports mix list numbering (10 of 10 rounds), equations export as LaTeX text, task items lose their checked state and gain an empty bullet line, and callout colors never reach Word. A fifth item is that an imported Word file that has not changed exports as the original file, so the app's stylesheet never reaches it. The eight private Word components also still carry a hidden visual theme, which the 2026-09-04 plan already moved out of the package for everything else. Build execution follows the Build playbook.

## Brief

### What will change?

Concurrent Word exports keep their own list numbering, equations become real Word equations, tasks show ☑ or ☐, callout colors appear, and the app's stylesheet applies to an unchanged imported file. Re-imported Word equations come back as equations.

### What could go wrong?

Rebuilding an unchanged imported file drops what import cannot read, such as text boxes, and warns on every export. Re-imported equations render the same by the test's check, which ignores bracket sizing, but their TeX reads differently, like α for \alpha. No Word here checks equations.

## Teach

Word export draws the editor as HTML, then a copied open-source converter turns that HTML into a Word file. Eight Word-only components redraw blocks the converter cannot handle, such as a callout as a table. Import goes the other way through the Mammoth library.

Today the converter keeps list numbering in one shared variable, so two exports at once mix up each other's lists. Equations go out as LaTeX text. The task checkbox is a button the converter skips. Callout colors sit on the table, which the converter never reads. An unchanged imported file skips all of this and returns as it came.

After this change each Word file keeps its own numbering. The converter turns KaTeX's math into Word equations, and import turns Word equations back into equations, because Mammoth drops them. Task items use ☑ or ☐ as their list marker. A passed stylesheet always rebuilds the file.

## Demo

1. Open http://localhost:3000/blocks/docx-demo, add a numbered list, a nested task list with one checked item, a block equation such as `\frac{a}{b}` and a callout, then click Export and pick Export as Word.
2. Unzip the file and read `word/document.xml`. The equation is an `m:oMathPara` with an `m:f` fraction, each task paragraph points at a ☑ or ☐ list marker, and both callout cells carry a `w:fill`.
3. Import that file back with Import, then Import from Word. The equation comes back as an equation, an equation in a comment comes back as its TeX, and exporting again writes Word math.

## What other editors do

On 2026-10-10 the run read prosemirror-docx at `c5a9610b` (MIT, source), Tiptap's DOCX export and conversion docs (closed source, docs only), markdown-docx 1.6.0 (MIT, README and package.json only), mathml2omml on npm (license only), the installed Mammoth's `lib/docx/body-reader.js`, and searched the Lexical and Slate ecosystems. No editor was run. Converting KaTeX's MathML to Word math in our own code matches Tiptap and markdown-docx, and the raw-LaTeX fallback is what prosemirror-docx writes for every equation. No reader here imports Word math. Mammoth ignores it with a warning, and Tiptap's import does not support it.

| Delta | Library | What it does with DOCX | Limit the comparison recorded |
| --- | --- | --- | --- |
| added | prosemirror-docx `c5a9610b` | Writes each equation as a Word math object holding the raw LaTeX as one run (`src/serializer.ts:250-260`); no task-list handling found | Word shows the LaTeX until the user converts it, and that conversion needs Word's LaTeX input mode |
| added | Tiptap Pro DOCX export | Converts LaTeX to Word math for common notation and falls back to a plain math run of the LaTeX; task lists are not exported; import has no math | Closed source; docs only |
| added | markdown-docx 1.6.0 | LaTeX to MathML with KaTeX, then its own MathML-to-Word-math step on fast-xml-parser; lists task lists as supported | README and package.json only; how checkboxes are written is not stated |
| added | mathml2omml (npm) | Converts MathML to Word math without XSLT | LGPL-3.0-or-later, so not copied or depended on under AGENTS.md's copyright rule |
| added | Lexical, Slate | No official DOCX export found by search | Search only |

## Layer and owner

| Delta | Change | Layer (Plite or Plate) | Package | Why |
| --- | --- | --- | --- | --- |
| added | List numbering continuation belongs to one Word document | Plate | `platejs/docx/export` (`internal/docx-document.ts`) | The cached numbering IDs index that document's own numbering definitions, so one object owns both |
| added | MathML becomes Word math in the converter | Plate | `platejs/docx/export` (new `internal/math.ts`), with KaTeX reached through `platejs/math`'s `getEquationHtml` | The converter owns HTML to Word; `docx/export` may already import `math` in `tooling/entrypoints/entrypoint-dag.mjs`, so the graph does not change |
| added | Word math becomes TeX inside the import's marker tokens before Mammoth reads the file, and equation nodes after projection | Plate | `platejs/docx/import` (new `lib/wordMath.ts`, called where `importDocx.ts` already rewrites `word/document.xml`, and on `word/comments.xml`) | Mammoth drops Word math, and the import already parses the main part and turns marker tokens into comments and revisions |
| added | One table of Word math vocabulary for both directions | Plate | private `docx-internal` (new `internal/wordMathVocabulary.ts`) | `docx/import` cannot import `docx/export`, and both already depend on `docx-internal`, so the `mathvariant`, accent and function-name pairs live once |
| added | Task state in Word comes from the task item's `data-checked` and becomes its list marker | Plate, with the copied static list | `platejs/docx/export` (`internal/xml-builder.ts`, `internal/docx-document.ts`) and copied `block-list-static.tsx` | The list owner keeps the marker and the indent together, and `data-checked` is the attribute the list plugin's HTML codec already writes |
| added | Word's default colors, fonts and sizes live in the app's copied stylesheet | Copied registry | copied `docx-export.tsx`, selecting the Word components by their `editor-<plugin>` class | Finishes the 2026-09-04 rule that the package ships no Word visual preset |

## Hard cuts and app migration

- The eight Word components stop drawing default colors, fonts and sizes. An app that calls `exportDocx` without the copied stylesheet loses the code block's grey shading and monospace font, the callout icon's emoji font and 18px size, and the grey placeholder colors. Layout borders and widths stay in the components, because without them the converter draws a black grid around callouts and columns.
- An imported Word file that has not changed no longer returns byte for byte when the caller passes `stylesheet` or `fontFamily`. The existing source-aware path rebuilds it, keeping the source's custom properties and one-section headers and footers and reporting the rest. The registry toolbar always passes a stylesheet, so its import-then-export now rebuilds the file. The rebuild drops what import could not read, such as text boxes, footnotes and headers the overlay cannot keep (the blast-radius run lost both headers of `headers.docx`), re-exports imported equations as Word math through `math.ts`, and adds a `source-rewritten` warning, which the toolbar shows as a warning toast on every Word export of an imported file. `apps/www/tests/browser/docx.spec.ts`'s "a Word file imports and exports through the toolbar" case changes from identical bytes to the rebuilt file's text, and the docs' "Retain the source for later export" example drops `stylesheet` from its exact-export call.
- Registry copies update two files. `docx-export.tsx` gains the moved rules, and `block-list-static.tsx` moves the task marker inside its `<li>` with `data-checked`.

Every inline value the eight components set today, and where it goes:

| Component | Mapped by the converter and moved to the stylesheet | Kept inline | Dropped, because the converter never maps it |
| --- | --- | --- | --- |
| Callout | Default cell background `#f4f4f5`; icon cell emoji font stack and `18px` | `border: none`, `width: 100%` on the table, `border: none` on both cells, `30px` icon cell width, the element's own `backgroundColor` on both cells | `border-radius`, vertical margins, padding, `border-collapse`, `vertical-align: top` (Word's default) |
| Code block | `#f5f5f5` background, Courier stack, `10pt` | `data-docx-preserve-whitespace` | `border` on a div, `margin`, `padding`, `white-space` |
| Column item | Nothing | `border: none`, the element's own `width` | `padding`, `vertical-align: top` |
| Column group | Nothing | `border: none`, `width: 100%` | `border-collapse`, `table-layout` |
| Equation and inline equation | Placeholder color `#888` through `[data-empty]` | Placeholder text | Fonts and sizes, which Word math replaces; `font-style`, `margin`, `text-align` (Word math centers a display equation) |
| Heading | Nothing | The bookmark span | Nothing |
| Table of contents | Empty-prompt color `#666` and `10pt` through `[data-empty]`; the link color is already in the stylesheet's `a` rule | `#key` links | Wrapper and item margins and padding, which Word never showed |

## Main changes

- The list numbering cache moves from module scope in `internal/render-document-file.ts` onto each `DocxDocument`, so concurrent exports no longer share it. The unread `_lastListType` and `_lastIndentLevel` go with it.
- The Word equation components always emit `<math>` with the TeX in its `annotation`, from KaTeX's MathML, or an empty `semantics` when KaTeX rejects the TeX. The converter alone decides between Word math and the fallback, which is one Word math run holding the LaTeX. `internal/math.ts`, `wordMath.ts` and `wordMathVocabulary.ts` are written for this plan and copy no third-party converter or table.
- `math.ts` maps `math`, `semantics`, `annotation`, `mrow`, `mi`, `mn`, `mo`, `mtext`, `mspace`, `mfrac`, `msqrt`, `mroot`, `msub`, `msup`, `msubsup`, `munder`, `mover`, `munderover`, `mstyle` and `menclose` with `notation="box"`. Attributes fall in two groups, read from KaTeX's own output (round-2 probe). It ignores layout hints: `separator`, `lspace`, `rspace`, `stretchy` of either value, `fence="false"`, `minsize`, `maxsize`, `symmetric`, `movablelimits`, `largeop`, `form`, and `displaystyle` and `scriptlevel` on `mstyle`; `mspace`'s `width` becomes the nearest run of Unicode spaces. It maps attributes with meaning: `mathvariant` (to `m:scr` and `m:sty`), `mtext` (normal text), a multi-letter `mi` (upright), `accent` on `mover` and `accentunder` on `munder`, `fence="true"` on a pair of `mo` (a delimiter), `linethickness` of `0`, `0px` or `0em` (no bar), and `display="block"` (`m:oMathPara`). Any other element or attribute value, such as `mtable` (which `\tag` and matrices produce), `mpadded`, `mphantom`, `mathcolor`, `mathbackground`, another `menclose` notation or a third fence `mo` from `\middle`, sends the whole equation to the fallback, one normal-text (`m:nor`) run holding the TeX. An equation whose content is only `mtext` also takes the fallback, so an all-normal-text equation from this exporter always holds verbatim TeX. Budget is about 350 lines; a build that needs more logs a deviation row.
- Import gains `lib/wordMath.ts`. Before Mammoth reads the file, and before the import collects comment ranges and revisions, it replaces each `m:oMath` and `m:oMathPara` in `word/document.xml` and `word/comments.xml` with text runs holding TeX between the import's nonce marker tokens, the same codec comments and revisions use. After projection, marked spans become `inlineEquation` nodes and a marked paragraph holding only an `m:oMathPara` becomes an `equation` node, when the editor installs those plugins. Otherwise, and in comment bodies, the TeX stays as text. The TeX renders the same equation, not the same characters. A math run keeps its Unicode symbols, which KaTeX renders even in strict mode, drops U+2061, and escapes math-mode specials as `\backslash`, `\{`, `\}`, `\$`, `\%`, `\#`, `\&`, `\_`, `\char"5E` and `\char"7E`. A whole run that names a known function becomes its command, such as `\sin`, only when the run is upright or sits in `m:fName`. A fraction, script, radical, n-ary operator, delimiter, accent, limit, function and box become their TeX commands, and `m:scr` and `m:sty` become `\mathbb` and the like. An equation made only of normal-text runs reads back verbatim, which round-trips this exporter's fallback exactly. A Word-authored all-normal-text equation also reads verbatim and may render differently. Inside math, the rewrite drops `w:del` and `w:moveFrom` content, unwraps `w:ins` and `w:moveTo`, and reports each such revision with the import's existing lost-revision diagnostic, as base does when Mammoth drops the equation. Comment range markers move to just before or after the equation's runs. It skips property elements. Any other structure, such as `m:m` or `m:eqArr`, keeps its run text and adds a `converter-message` warning, which strict import does not count as loss. Budget is about 250 lines.
- The unused `data-equation-omml` inputs in the converter are deleted, so one path produces Word math. That input was a raw XML sink; `docs/research/sources/plite/conversion-and-export.md:27` cites it, and the Close flags that citation.
- The list builder reads `data-checked` on a task item and points the item's paragraph at one of two per-document task numberings whose level text is ☐ or ☑ in Segoe UI Symbol, which has both glyphs where the bullet font Symbol has neither, so Word keeps the level's indent. `NumberingObject` gains an optional `marker` with its text and font, which only the two task numberings set; the ordered and bullet paths stay as they are, and the bullet branch reads the marker when present. The copied static marker moves inside the `<li>`, which removes the empty bullet line.
- The callout's own `backgroundColor` moves from the table to both cells, where the converter shades it.
- `resolveSourceExport` counts `stylesheet` and `fontFamily` as changed output options, as it already counts `title`, `margins`, `orientation` and `pageSize`. `component` and `presentation` still allow exact return, because they only choose how a rebuild draws, and their JSDoc says so.
- `exportDocx`'s JSDoc names the markup the copied stylesheet may select (the `editor-<plugin>` classes, the callout table and cells, `[data-docx-preserve-whitespace]`, `[data-empty]`) and the `li[data-checked]` contract, so changing either is a visible API change.

## Decision ledger

| Surface | Current | Target | Owner | Reason | Adoption | Proof | Risk | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| List numbering cache | Module-level map shared by every export | A field of each `DocxDocument` | `internal/docx-document.ts` | Concurrent exports corrupt numbering (base probe, 10 of 10) | Internal only; the helper test in `render-document-file.spec.ts` goes with the helpers | Test a | Header and footer continuation stays as today | move |
| Equations in Word | LaTeX text from `EquationDocx` and `InlineEquationDocx` | Word math from KaTeX MathML, LaTeX math run as fallback | `internal/math.ts` and `buildRun` | Equations are math in Word | Output change only | Tests b to e | KaTeX coverage; no Word render here | rearchitect |
| Word math on import | Dropped by Mammoth with a warning (round-1 probe) | Equation nodes holding TeX that renders the same, in the main part, and TeX text in comments | `docx/import/lib/wordMath.ts` with the shared vocabulary and the marker codec | Plain export would otherwise lose equations on re-import, and a rebuilt import would write them as text | Import output change; Word-authored math imports as equations too | Tests f and g | Word math outside the inverse set imports as its run text with a warning; re-imported TeX reads differently; revisions inside math are reported lost, as at base | rearchitect |
| `data-equation-omml` inputs | Two converter branches with no producer | Deleted | converter | Two ways to feed Word math, one a raw XML sink | None; no producer exists | Search plus the equation tests | A research page cites the sink | cut |
| Task state in Word | Lost; marker becomes an empty bullet paragraph | ☐ or ☑ list marker at the item's level | `buildList`, `DocxDocument` and copied `block-list-static.tsx` | State visible in Word, indent kept | Registry copy update | Test h | Static HTML keeps its look; the marker moves inside `<li>` | rearchitect |
| Callout color | On the table, which the converter ignores | On both cells | `CalloutDocx` | Colors show in Word | Output change only | Test i | None found | move |
| Word default look | Inline in the eight components | Copied stylesheet rules on `editor-<plugin>` classes | copied `docx-export.tsx` | No package Word preset (2026-09-04 rule) | Apps without the stylesheet lose the values the table above lists | Test j | Copied CSS depends on the markup the JSDoc names | move |
| Exact source return | Original bytes for an unchanged import, stylesheet or not | Original bytes only when no `stylesheet` or `fontFamily` is passed | `resolveSourceExport` | Owner's item 5: the app's look must reach an unchanged import | Toolbar import-then-export rebuilds; browser case and docs example change | Test k | A rebuild loses the source's own Word styles and what import could not read, and warns on every export | rearchitect |

## Defaults

| Decision | Pick | Alternative | Word | Impact |
| --- | --- | --- | --- | --- |
| Unchanged imported Word file | Rebuild it with the app's styles, so the look applies, dropping what import cannot read and warning on every export (look) | Download the original file untouched | keep original file for unchanged imports | big |
| Word equations on re-import | Bring them back as equations whose TeX renders the same, such as α for \alpha (look) | Report them as lost content | report imported equations as lost | small |
| Equations the converter does not cover | Keep the LaTeX inside a Word equation, with no warning | Warn, so strict Word export refuses the file | warn on unconverted equations | small |
| Matrices and tagged equations | Keep their LaTeX inside a Word equation | Convert them too, with more code | convert matrices | small |
| Task boxes in Word | A ☑ or ☐ list marker | A clickable Word checkbox | clickable Word checkboxes | small |
| Spacing and rounding Word never showed | Drop it, as Word already ignores it | Teach the converter more CSS, which changes spacing in every Word file | map more CSS | small |
| Built-in Word look in the package | Remove it; the app's stylesheet carries it (look) | Keep the defaults inside the package | keep the built-in Word look | small |
| Table of contents levels | Flat in Word, as today | Indent deeper levels | indent TOC levels | detail |
| Documents page link | A new page under this account (QgTDQhrAeKPB3HFaD6JyJP), because the old one (W8q2wJUFCojpcaJeSzhJQb) would not open here | Keep the old link | keep the old documents page | detail |

## Steps

- [x] Write the failing tests at public boundaries, each run alone at base through `node tooling/scripts/proof-worktree.mjs --expect-fail` with its own failure line. Package tests, in `packages/platejs/src/docx/export/lib/` unless named: (a) two concurrent `exportDocx` calls give the same `w:numId` sequence as each alone, and every `w:numId` resolves in that file's `numbering.xml`, in `exportDocx.lists.spec.tsx`; (b) a block equation exports as `m:oMathPara` holding `m:f`, with no LaTeX text, and (c) an inline equation as `m:oMath` holding `m:sSup`, in `exportDocx.spec.ts`, replacing its raw-LaTeX assertions; (d) as two tests, `\mathbb{R}` exports with a double-struck `m:scr`, and `f(x, y)`, `x'`, `\binom{n}{k}`, `a\quad b`, `\left(x\right)`, `\big(x\big)`, `\overline{x}`, `\underline{x}`, `\sum_{i=1}^n i`, `\int_0^1 x\,dx`, `\alpha \le \infty` and `\sin x` each export as Word math structure, an `m:oMath` holding more than one normal-text run; (e) as two tests, malformed TeX and `\raisebox{1em}{x}` each export as one `m:nor` run holding the TeX, and `\text{50\% off}` takes the same fallback; (f) in a suite that runs real Mammoth, such as `importDocx.slow.tsx`, a hand-built file holding Word math for `\frac{a}{b}`, `α ≤ \sin x` and `\{a\}`, and one all-normal-text run, imports as equation nodes whose TeX gives the same KaTeX presentation MathML, annotation excluded, and the normal-text one reads verbatim; a second test exports that import again with a stylesheet and finds `m:f` in the output; (g) a hand-built file with Word math inside a comment body imports with that comment's TeX, and one with a `w:del` inside an equation drops the deleted run and reports the lost revision; (h) with a local list slot that draws `li[data-checked]`, a checked and an unchecked task at indent 1 and 2 export as one paragraph each, pointing at ☑ and ☐ numberings whose level indents differ and whose marker font is Segoe UI Symbol, not Symbol; (i) a callout's `backgroundColor` shades both cells. Registry tests in `apps/www/src/registry/components/editor/`: (j) with a copied stylesheet whose code-block rule sets `#123456`, `Arial` and `14pt`, the exported code block carries those values, not the package's; (k) an imported file exported unchanged with a stylesheet rule `p { color: #123456 }` comes back rebuilt with that color and a `source-rewritten` diagnostic, while the same export without a stylesheet still returns the original bytes. Proof: one expect-fail log per test. Done: `docs/plans/artifacts/html-word-owns-word/red/` holds one failing run per test at base, and `docs/plans/artifacts/html-word-owns-word/panel-d1-red/`, `docs/plans/artifacts/html-word-owns-word/panel-d2-red/` and `docs/plans/artifacts/html-word-owns-word/panel-d3-red/` hold the review fixes' red and green runs.
- [x] Move the numbering cache onto `DocxDocument` and delete the module state and its helper test. Proof: test a passes; the list, bookmark and slow converter tests pass. Done: `docs/plans/artifacts/html-word-owns-word/build/build-all-a5.log`.
- [x] Add `docx-internal`'s `wordMathVocabulary.ts`, then `internal/math.ts` with the element set and attribute groups in Main changes; route `<math>` at the top of `buildRun`, make the two equation components emit `<math>` with the TeX annotation, and delete both `data-equation-omml` branches. Proof: tests b to e pass; the existing equation and Word export tests pass; `math.ts` stays near its budget or a deviation row says why. Done: `docs/plans/artifacts/html-word-owns-word/build/build-all-a5.log`; `math.ts` is about 320 lines.
- [x] Add `docx/import/lib/wordMath.ts` on the shared vocabulary, call it on `word/document.xml` and `word/comments.xml` where `importDocx.ts` rewrites the package, before comment and revision instrumentation, and turn its marked spans into equation nodes after projection. Proof: tests f and g pass; the import suites pass. Done: `docs/plans/artifacts/html-word-owns-word/build/build-all-a5.log`; `wordMath.ts` is about 500 lines, a deviation the Close lists.
- [x] In copied `block-list-static.tsx`, move the marker inside the task `<li>` and set `data-checked`; in `DocxDocument`, add the optional `marker` and the two task numberings; in `buildList`, read `data-checked` before the item is flattened and point the paragraph at the matching numbering. Proof: test h passes, and the registry's own export of a nested task list shows the same. Done: `docs/plans/artifacts/html-word-owns-word/build/task-paragraphs-after-a1.log`, `docs/plans/artifacts/html-word-owns-word/browser/final-word-xml-a4.log`.
- [x] Shrink the Word components per the table in Hard cuts, move the callout color to its cells, mark empty placeholders with `data-empty`, add the moved rules to the copied stylesheet, and write the JSDoc contract. Proof: tests i and j pass; `plugins-static.spec.ts` and the Word export specs pass. Done: `docs/plans/artifacts/html-word-owns-word/build/build-all-a5.log`.
- [x] Count `stylesheet` and `fontFamily` as changed output options in `resolveSourceExport`. Proof: test k passes; `sourcePreservation.spec.ts` passes. Done: `docs/plans/artifacts/html-word-owns-word/build/build-all-a5.log`.
- [x] Run `plate-docs` on `content/docs/(plugins)/(serializing)/docx.mdx` and its Chinese twin for equations on export and import, task markers, the stylesheet's hooks and the new exact-return rule. Proof: the docs checks and a preview of both pages. Done: `docs/plans/artifacts/html-word-owns-word/docs/check-docs-a6.log`, `docs/plans/artifacts/html-word-owns-word/browser/docs-preview-a4.log`.
- [x] Write a `platejs` changeset and a registry changelog entry for `docx-export` and `block-list-static`, and regenerate the registry. Proof: `pnpm --filter www build:registry --check` and the changelog check. Done: `docs/plans/artifacts/html-word-owns-word/docs/build-registry-check-a9.log`, `docs/plans/artifacts/html-word-owns-word/docs/changelog-check-a2.log`.
- [x] Prove it in the browser through `verify` on `/blocks/docx-demo`: toggle a task, then export through the real toolbar a document with a numbered list, a nested task list, a block and an inline equation and a callout; read the Word XML; import that file back and read the equation text; open the exported HTML file in the browser and look at the checked and unchecked markers; import a Word fixture, export it unchanged and assert a value only the registry stylesheet writes; update and run `tests/browser/docx.spec.ts`. Proof: the saved files, the XML checks, a screenshot of the HTML markers and the spec log. Done: `docs/plans/artifacts/html-word-owns-word/browser/final-drive-a3.log`, `docs/plans/artifacts/html-word-owns-word/browser/final-word-xml-a4.log`, `docs/plans/artifacts/html-word-owns-word/browser/final-last/html-export.png`, `docs/plans/artifacts/html-word-owns-word/browser/docx-spec-a3.log`.

## Completion Gates

| Gate | Artifact |
| --- | --- |
| `pstack:blast-radius` on the `stylesheet` and `fontFamily` change before code moves | `docs/plans/artifacts/html-word-owns-word/blast-radius/writeup.md`, `docs/plans/artifacts/html-word-owns-word/blast-radius/rebuild-path-a1.log` |
| Each step's red test at base through `proof-worktree.mjs --expect-fail` | `docs/plans/artifacts/html-word-owns-word/red/`, run through `proof-worktree.mjs --expect-fail` at base; `docs/plans/artifacts/html-word-owns-word/panel-d2-red/` and `docs/plans/artifacts/html-word-owns-word/panel-d3-red/` through `proof-worktree.mjs --expect-fail` |
| `pnpm check` steps the edits reach (platejs typecheck partitions, entrypoint graph, barrels, knowledge) | partial: `docs/plans/artifacts/html-word-owns-word/build/check-barrels-a1.log`, `docs/plans/artifacts/html-word-owns-word/build/check-entrypoint-graph-a2.log` (the import-migration half needs an `rg` binary this machine lacks), `docs/plans/artifacts/html-word-owns-word/docs/kb-check-head-a1.log` (K7 fails the same way at HEAD) |
| Writing passes on the code: `deslop`, then `no-comments` | `docs/plans/artifacts/html-word-owns-word/comment-sicko/reply.md`, `docs/plans/artifacts/html-word-owns-word/comment-sicko/reply-d1-fixes.md`, `docs/plans/artifacts/html-word-owns-word/comment-sicko/reply-d2-fixes.md` |
| `api-build` panel on the diff, because `stylesheet` and `source` change what a public option promises | three rounds: `docs/plans/artifacts/html-word-owns-word/panel-d1/`, `docs/plans/artifacts/html-word-owns-word/panel-d2/`, `docs/plans/artifacts/html-word-owns-word/panel-d3/` |
| `plate-docs` on `docx.mdx` and its Chinese twin, with the docs checks | `docs/plans/artifacts/html-word-owns-word/docs/check-docs-a6.log`, `docs/plans/artifacts/html-word-owns-word/browser/docs-preview-a4.log` |
| `best-api repair` for the changed `stylesheet` promise | `docs/vision/plate.md:1155-1160` already holds the law; `docs/research/sources/plite/conversion-and-export.md` updated |
| `platejs` changeset, registry changelog entry and `build:registry --check` | `.changeset/platejs-static-presentation.md`, `docs/plans/artifacts/html-word-owns-word/docs/changelog-check-a2.log`, `docs/plans/artifacts/html-word-owns-word/docs/build-registry-check-a9.log` |
| Lint fix on the task's files | `docs/plans/artifacts/html-word-owns-word/build/lint-a5.log` |
| Browser proof through `verify` on `/blocks/docx-demo` and `tests/browser/docx.spec.ts` | `docs/plans/artifacts/html-word-owns-word/browser/final-drive-a3.log`, `docs/plans/artifacts/html-word-owns-word/browser/docx-spec-a3.log` |
| `/pstack:correct` on the class "a planned test passes at base" | skip: `docs/plans/topics/correct.md` item 105 tracks this class under the owner's "correct tests" gate; this run added its repeat there |
| Fold into `docs/plans/topics/documents.md` and `review-ledger.mjs check` | `docs/plans/topics/documents.md`; `node tooling/scripts/review-ledger.mjs check` |

## Proof

| Check | Pass condition |
| --- | --- |
| Concurrent lists | Test a, and the base probe's concurrent rounds match their solo runs |
| Equations | Tests b to g; the browser export's XML holds `m:oMathPara`, and its re-import holds the TeX |
| Task boxes | Test h, the browser export and the HTML marker screenshot |
| Callout and code look | Tests i and j and the browser export |
| Unchanged imports | Test k and the browser's unchanged-import export |
| Nothing else moved | The Word export, Word import, list, bookmark, source preservation and slow converter suites pass; the docx browser spec passes 4 of 4 |
| Limit | No Word, LibreOffice or Pages on this machine, so Word's rendering of the equations and markers is not checked |

## Close

### Reversals and deviations

- Test k was approved as one registry test with `p { color: #123456 }`. It landed as two package tests in `sourcePreservation.spec.ts`, with `span { color: #123456 }` and with `fontFamily: 'Arial'`, because the default paragraph draws as a `div` and `resolveSourceExport` is package code.
- `wordMath.ts` was budgeted at about 250 lines and is about 500. The extra lines are comment-range moves, revision flattening, the math and text escape tables, the closed delimiter table, the part walk and `materializeEquations`.
- Main changes said an equation made only of `mtext` takes the TeX fallback. The build checks the converted Word math instead, so any equation that converts to normal-text runs only takes the fallback, which is the bullet's stated goal.
- Decision E6 put the vocabulary in one shared table. The bar characters moved into `math.ts` and the function names into `wordMath.ts`, because each has one reader.
- The diff panel tried two ways to keep a commented display equation a block: an inline import with a warning, then moving the comment's markers into the block. Each drew a critical finding, so round 3 reverted to the build's rule. A display equation is a block only when alone in its paragraph, and imports inline beside a comment, tracked change or text. A strict-import test shows one commented equation keeping its comment; no test covers a tracked change beside it.
- Round 2 anchored the hex color patterns so `#0000` stops shading black. Round 3 found that this turned `!important` and opaque alpha colors black, so the anchoring was reverted.
- Main changes said the Close would flag the research note that cited the raw `data-equation-omml` sink. The run updated `docs/research/sources/plite/conversion-and-export.md` instead.
- The plan had no performance check. The run added one after the build.
- Main changes said import reports each revision inside math with the existing lost-revision diagnostic. The build reports one `unsupported-content` warning with feature `tracked-revision` per equation that held any revision, naming its part, as the changeset says. The pull request's babysit added this line after the pull request opened (`docs/plans/2026-10-11-html-pr-5157.md`).

### What landed

- Concurrent Word exports keep their own list numbering, because the numbering cache lives on each `DocxDocument`.
- Equations export as Word math built from KaTeX's MathML. Notation the converter does not cover, such as matrices, stretchy braces and spaces wider than 100 em, exports its TeX inside a Word equation.
- Import reads Word math back as `equation` and `inlineEquation` nodes in the body and as TeX text in comment bodies. Every delimiter KaTeX's `\left` accepts maps back to TeX, and tracked revisions and formatting changes inside math are flattened and reported.
- Task items export as one paragraph with a ☑ or ☐ list marker at their level, from the copied `block-list-static.tsx`'s `li[data-checked]`.
- The Word components draw structure only, and the copied `docx-export.tsx` stylesheet holds the callout, code block and placeholder look. A background color the converter cannot read leaves the cell unshaded instead of black.
- Passing `stylesheet` or `fontFamily` rebuilds an unchanged imported file instead of returning its original bytes.

### Proof and limits

- 227 docx fast tests, 53 slow converter and import tests and 8 registry tests pass, with the docx typecheck partitions and the touched specs' typecheck clean (`docs/plans/artifacts/html-word-owns-word/build/build-all-a5.log`). Every new test failed at its base first (`red/`, `panel-d1-red/`, `panel-d2-red/`, `panel-d3-red/`).
- On a source-serving dev server, Chromium built a document through the slash menu, exported it through the real toolbar and imported it back. The Word XML passed 9 of 9 checks while a control file failed 8 of 9. Both equations came back as equations, the HTML file showed one checked and one unchecked marker, and `tests/browser/docx.spec.ts` passed 4 of 4 (`browser/final-drive-a3.log`, `browser/final-word-xml-a4.log`, `browser/docx-spec-a3.log`).
- Export of 200 inline equations is about 58 ms slower, from 175 to 234 ms, because each equation now runs through KaTeX and the converter. Import of a 3000-paragraph math-free file adds about 8 ms of measured work, mostly the equation walk; across 39 alternated pairs it was slower in 27, and larger gaps between batches are not explained (`perf/`).
- The plan panel ran three rounds and the diff panel three, each with Opus, Astra and Sol. Every critical finding was applied or reverted, and the decision log holds each row.
- No Word, LibreOffice or Pages is on this machine, so how Word draws the equations and markers is not checked. `x'` round-trips with a different MathML token class. Tasks re-import as bullets and callouts as two-cell tables. A Word-authored equation of normal text only imports its text as TeX. `pnpm check entrypoint-graph`'s import-migration half needs an `rg` binary this machine lacks.

- Review inputs, the tracked tests that prove the plan: `packages/platejs/src/docx/export/lib/exportDocx.lists.spec.tsx` (tests a and h), `packages/platejs/src/docx/export/lib/exportDocx.spec.ts` (b to e and i), `packages/platejs/src/docx/export/lib/sourcePreservation.spec.ts` (k), `packages/platejs/src/docx/import/lib/importDocx.math.slow.tsx` (f and g), `apps/www/src/registry/components/editor/docx-export.spec.tsx` (j) and `apps/www/tests/browser/docx.spec.ts`. The probe logs the plan read stay in its ignored run directory, which a fresh checkout does not have.

Of 22 items in Steps and Completion Gates, 20 are done, 1 is partial (the `pnpm check` steps above), 1 is skipped (`/pstack:correct`, tracked in `docs/plans/topics/correct.md`), 0 are blocked and 0 are open.

### Attention

reviewed by gpt-6.1-sol @xhigh (`docs/plans/artifacts/html-word-owns-word/trail-review/sol.md`), after the build, because the first close skipped this review.

- Critical: the first close skipped this review and reflect, citing the owner's ask to stop chasing edge cases, while AGENTS.md says a request for speed never drops a gate. Both ran on 2026-10-10 during the pull request's preparation.
- Warning: the performance hand-back named only the 8 ms the isolated stages measure. Import was slower in 27 of 39 pairs, and the larger gaps between batches stay unexplained, as Proof and limits says.
- Warning: the display-equation revert claimed comments and tracked changes both survive. The proof covers one commented equation, so the claim above now says that.
- Warning: the round-trip test's comparison ignores `fence` and `stretchy`, so "renders the same" holds only up to bracket sizing; the deferred oracle finding limits that claim.
- Warning: the entrypoint and knowledge gates were partial or stale at this close. The pull request's `pnpm check` later passed the entrypoint step with a PATH shim for `rg` and showed only the knowledge failure that also fails on `next` (`docs/plans/artifacts/html-static-repair-redo/pr/pnpm-check-a2.log`).
- Warning: "notation Word math cannot express" described this converter's coverage as a Word limit. The plan, the docx guide and the changeset now say "notation the converter does not cover".
- Nit: a listed deviation said the first red tests skipped `proof-worktree.mjs --expect-fail`; the transcript shows they used it, so the deviation is removed.

### Open work

- Display sums and integrals export as Word limits around a plain operator run, not `m:nary`; how Word draws them is not checked. owner: natamox. stop: a Word check of a display sum, or 2026-11-30. tracked: `docs/plans/topics/documents.md` Open work.
- The registry's unused `*ElementDocx` drawings still teach the old Word look; removing them is a hard cut. owner: natamox. stop: the owner says to remove them, or 2026-11-30. tracked: `docs/plans/topics/documents.md` Open work.
- A block equation exports an extra paragraph holding U+FEFF, which re-imports as an empty paragraph; base does the same. owner: natamox. stop: the next Word export change to void blocks, or 2026-11-30. tracked: `docs/plans/topics/documents.md` Open work.
- Check the exported equations and ☑ and ☐ markers in real Word. owner: natamox. stop: a machine with Word opens `docs/plans/artifacts/html-word-owns-word/browser/final-last/exported.docx`, or 2026-11-30. tracked: `docs/plans/topics/documents.md` Open work.
- Rare inputs the panel named and the owner asked not to chase: a fully transparent hex background shades black, an `rgba` text color exports black, the delimiter oracle ignores `fence`, `DELIMITERS` follows inherited keys, and a delimiter fallback reuses the "text only" message. owner: natamox. stop: a report of a Word file that hits one, or 2026-11-30. tracked: `docs/plans/topics/documents.md` Open work.
