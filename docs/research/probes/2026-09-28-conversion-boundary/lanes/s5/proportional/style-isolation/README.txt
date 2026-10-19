AI preview style-recalculation isolation (lead request, 2026-09-30). The tree is pp3's; only apps/www/src/registry/components/editor/ai-menu.tsx varies.

Answer: the container purple selectors did not cause it.
  The AI preview's style recalculation comes from whole-subtree recalcs of the preview: 15-21 per 50 KB rich stream and 29-38 per CJK stream for A.
  Each one reaches about 33,700 elements (rich) or 49,000 (CJK) by the end of the stream; with C's extra spans, 42,400 and 60,300.
  - The preview root's :last-child flips whenever the fallback end-marker span after it (`streaming && (!last || !last.text) && <span data-editor-ai-end>`) appears or disappears.
  - Three global Tailwind utilities compile to `:is(:where(.group\/X):last-child *)`. Because of them, Blink invalidates the whole subtree of an element whose :last-child changes (invalidation set "allDescendantsMightBeInvalid").
    - `.group-last\/column\:pr-0` in registry/components/editor/column.tsx:80 and column-static.tsx:13
    - `.group-last\/column\:-right-1` in column.tsx:133
    - `.group-last\/toolbar-group\:hidden\!` in registry/bases/{base,radix}/toolbar.tsx
  Removing either half ends the whole-subtree recalcs (variants D and E).

Variants (variants/*.patch, against pp3's ai-menu.tsx 6f597c1fb762ecdd; candidate publication path, pp3 everywhere else)
  A  pp3 as is.
  B  the four container utilities `[&_[data-editor-string]]:border-b-2 / border-b-purple-100 / bg-purple-50 / text-purple-800` removed. The end-marker `::after` rules stay. Tailwind then emits no container purple rules.
  C  B plus the w-era purple decoration on every text, from w's ai-menu.tsx (764ad1530ccf3b8d, which is HEAD's). pp3's last-block end marker stays.
  D  A with the fallback marker span always rendered, `hidden` and without data-editor-ai-end when not needed. The preview root is then never the last child.
  E  A with the three group-last rules above deleted at runtime (CSSOM) before streaming. Measured with the invalidation probe only.

Method: the S5 harness (S5_BENCH, chained arrivals, CDP trace and profile, nice 5), one cell per run with S5_PAIRS=2 (scripts/run-si.sh). A is the baseline arm and B, C or D the candidate arm, so every variant has 2 measured streams per cell and A has 6.
  Style, layout and paint come from trace events on the renderer main thread in the stream window (../scripts/render-pipeline.mjs). Element counts are UpdateLayoutTree args.elementCount (scripts/ult-counts.py).
  Loads: 2.0-4.9 on measured pairs (runs/*/matrix, loadavg per stream). No stream recorded an error.

Results per preview commit (ms, candidate path, 50 KB)
                     UpdateLayoutTree   Layout   Paint   whole-subtree recalcs per stream (>10,000 elements)
  ai-rich-50000  A   5.4-7.2            0.56     1.0     15-21 (820-1,267 ms)
                 B   4.9-5.4            0.55     0.9     13-15 (738-817 ms)
                 C   7.1-9.0            0.59     1.0     15-22 (1,188-1,575 ms)
                 D   1.3                0.57     1.04    1 (89-91 ms, at the stream end)
  ai-cjk-50000   A   11.6-14.8          1.0      1.25    29-38 (2,096-2,791 ms)
                 B   12.6-14.3          1.0      1.15    32-38 (2,257-2,739 ms)
                 C   12.7-14.0          1.05     1.27    25-33 (2,263-2,591 ms)
                 D   1.8                1.05     1.29    1 (133 ms)
  For reference, the static demo on the same documents (pp3, ../chunking/render-pipeline.json) has UpdateLayoutTree 0.7 ms (rich) and 0.9 ms (CJK) per commit and never recalculates more than 1,000 elements in one pass.
  - B lowers the per-element cost only: about -20% in rich and nothing measurable in CJK. C adds wrapper spans, so it is the same or worse.
  - D brings style recalculation to 1.3-1.8 ms per commit, near the static demo.
    The one full recalc left per stream lands 115-167 ms before the final output change. It is the `streaming &&` className toggle on EditorStatic's root, which changes the descendant ::after rules.
  - Layout and Paint do not change across variants.

Invalidation tracking (invalidation/, one A and one E stream of ai-rich-50000; scripts/si-invalidation.mjs records devtools.timeline plus timeline.invalidationTracking and timeline.stack; scripts/si-analyze.py)
  A: 421 recalcs, 711 ms. The 10 recalcs over 10,000 elements take 524 ms. Each one follows `ScheduleStyleInvalidation pseudo last-child` on the preview root `div.editor-editor…`.
     StyleInvalidator then reports "Invalidation set invalidates subtree", allDescendantsMightBeInvalid, with the three group-last selectors (A-root-subtree-invalidation.json).
     Just before, StyleRecalc tracking shows "Node was inserted into tree" for the fallback span `span.inline-block.size-3.rounded-full.bg-purple-600`.
  E: the root still flips :last-child 16 times, but no recalc exceeds 1,000 elements. Total 162 ms against 711 ms.
  The traced probe runs slower than the harness (711 ms against 1.1-1.4 s for A), so compare A and E with each other only.
  Other per-commit invalidations are small in both: :last-child on the growing tail's block, span and link, and :hover on a gutter wrapper when content moves under the pointer.

The page and the host editor's own root attributes are not involved: every whole-subtree recalc is scheduled on the preview root. The fixes that would remove the cost are a product decision. Options:
  - keep the preview root's last-child state stable (as in D);
  - avoid `:is(... :last-child *)` utilities such as group-last/* in shared CSS;
  - both.

ai-session: the full spec ran on the pp3 candidate after the matrix (../reruns/ai-session-candidate.log): 18/19; the one failure is the known narrow-view test, which fails on the baseline as well. ai-session-generate-markdown-A.log reruns "Generate Markdown sample keeps its review visible and accepts a usable table" on variant A, a pp3 build: pass.

Files
  README.txt, summary.json (per variant and stream: commits, style, layout, paint and pre-paint ms, whole-subtree recalc count and ms, elements recalculated)
  variants/                variant-B.patch, variant-C.patch, variant-D.patch, variant-E-dropped-rules.txt
  runs/{AB,AC,AD}-{rich,cjk}/   harness receipts (matrix/), run.log, started.txt and render-pipeline.json; baseline arm = A, candidate arm = B, C or D
  invalidation/            A and E analyses, and the root subtree-invalidation event with its selectors
  builds/                  build logs for si-a (A), si-b (B), si-c (C) and si-d (D): production webpack, --no-mangling, the S5 paths
  scripts/                 run-si.sh, si-invalidation.mjs, si-analyze.py, ult-counts.py
  ai-session-generate-markdown-A.log
Raw traces (including the 260 MB invalidation traces) stayed in the scratchpad (s5/si-work).
