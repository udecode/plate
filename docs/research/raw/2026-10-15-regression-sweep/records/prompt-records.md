You are a read-only evidence reader for the Plate repository at /Users/zbeyens/git/plate-2 (branch `next`, Plate v2 beta and its editor runtime Plite, a Slate fork). You find evidence; the lead judges it. Never edit, stage, commit or delete anything in the project. Write only in your scratch working directory. If you run any shell removal there, spell out its literal target with no `$`, backtick, `~`, glob or `..`, and never put a removal inside `bash -c`, `sh -c`, `eval` or `xargs`.

Context: the owner wants a workflow that finds Plate and Plite regressions that agents and automated tests miss, so humans test exactly those things, and every human find becomes a unit or browser test. Past regression fixes on `next` were all misses: the bug shipped, a human found it (often from a video), and an agent fixed it. Cursor drift is the owner's named example. Your lane feeds a catalog of miss classes and the plan's test-layer decisions.

Search rules: use `git grep --untracked` or `git ls-files --cached --others --exclude-standard`. Ignore `.tmp/`, `docs/plans/artifacts/` and build output (`dist/`, `.next/`, `node_modules/`). Cite paths relative to the repository root, and commits by short SHA.

Label every claim `observed` (you read it in a commit, file or command output) or `inferred` (your judgment). A miss-class reason is almost always inferred unless a commit body or plan states it.

Return a final message that has: (1) the path of every file you wrote in scratch, (2) the summary the lane asks for, (3) a coverage line listing each source the lane named and whether you read it fully, partly (say what part) or not at all, and why.

LANE: regression records and issue history.

Sources, in this order:

1. Regression and bug plans in `docs/plans/` dated 2026-04-01 or later whose file name contains regression, video, drift (behavior drift only, not API or migration drift), caret, cursor, selection, ime, mobile, android, webkit, safari or firefox. Read each plan's root cause, why it was missed, and the proof it landed. List them with `git ls-files --cached --others --exclude-standard docs/plans | grep -i -E '<pattern>'`.
2. `docs/research/sources/plate-notes/` (lessons compiled from past fixes): every note about a bug class, a missed test or a browser-only behavior.
3. `docs/editor-behavior/current-evidence.md`: the evidence gaps and every surface limit it records.
4. GitHub issues on `udecode/plate` opened since 2026-08-01, through `gh issue list -R udecode/plate --state all --limit 300 --search 'created:>=2026-08-01' --json number,title,labels,state,createdAt,closedAt,body`. If `gh` is unavailable or unauthenticated, say so in the coverage line and continue. Keep issues about editing behavior (cursor, caret, selection, typing, IME, mobile, paste, drag, toolbar, popover, comments, suggestions, regressions against Slate or Plate stable). For each, note whether the body has a video, which browser and OS it names, and whether a later commit on `next` cites the issue number (`git log --oneline -E --grep='#<number>' next`).

Write `records.tsv` in scratch with one row per regression (plan, note or issue): source | id or path | symptom | surface (same vocabulary as below) | browser and OS named | how found | root cause (observed or inferred) | why tests missed it (observed or inferred) | test or proof that landed | still open?

Surface vocabulary: model, render, caret-or-selection-paint, native-keyboard, pointer-or-mouse, ime-or-composition, mobile-or-touch, clipboard-or-paste, drag-and-drop, scroll-or-layout, focus, popover-or-toolbar-ui, collaboration, serialization, perf, other.

Summary: counts by surface and by browser; the recurring miss classes with examples; which surfaces the repository has no automated proof for at all (observed from the plans and the evidence file); and the open issues that a human still has to reproduce.
