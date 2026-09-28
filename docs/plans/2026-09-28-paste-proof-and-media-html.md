---
review_scopes:
  - imports
  - exports
review_basis:
  - 2026-09-28-imports-paste-loss-reporting-review
  - 2026-09-27-exports-adversarial-audit-feedback
work_kind: implementation
---

# Paste proof and media HTML

Status: Completed

Objective:
Close the proof gaps and the most visible product gap left after
[the paste loss repairs](2026-09-28-paste-loss-reporting-repairs.md): commit a
proof of the registry toast, prove clipboard paste in Firefox and WebKit, give
video and audio an HTML mapping, and decide which removed graphics count as
content.

Goal plan:
docs/plans/2026-09-28-paste-proof-and-media-html.md

Template:
docs/plans/templates/task.md

Applied packs:
- none

Task source:
- The user's `go those` on the recommended next steps: a committed registry
  toast test, Firefox/WebKit clipboard projects, an HTML mapping for video, and
  an SVG icon noise decision without blanket exemptions. Native goal tools are
  unavailable in this Claude Code runtime; this plan is the acceptance ledger.

Completion threshold:
- A committed test fails when the kit's toast wiring is removed; the clipboard
  spec passes in Chromium, Firefox and WebKit, native and synthetic; pasted
  video and audio survive as media nodes and round-trip through HTML; decorative
  icon SVG pastes quietly while content graphics still warn; package, type,
  registry, doctrine and ledger gates pass.

Verification surface:
- `plugins.spec.tsx` paste-warning table, `BaseMediaPluginContracts.spec.ts`,
  `html.spec.ts`, the clipboard spec under all three Playwright projects, and
  the full package, `www`, doctrine and ledger gates.

Constraints:
- Local checkout on `next`; no commit, push, PR or release authority.

Boundaries:
- Allowed: media plugin HTML mappings, HTML sanitizer impact, registry kit
  spec, `www` Playwright config and scripts, clipboard browser spec, docs,
  changesets, doctrine, Verify Plate recipe, decision page, plan and ledger.
- Excluded: Yjs, Markdown streaming, Safari proof.

Blocked condition:
- None.

Task state:
- current_phase: closed
- next: none

Work Checklist:
- [x] Committed toast proof. `plugins.spec.tsx` "EditorKit paste warnings"
  pastes through the real `EditorKit` with sonner mocked: SVG text warns "left
  out", uninsertable content warns "could not be pasted", a mapped video,
  Google Docs HTML and decorative heading icons warn nothing, and kept content
  is asserted. Disabling the kit's report callback fails the two warning cases.
- [x] Firefox and WebKit. `playwright.config.ts` gains `firefox` and `webkit`
  projects with `test:www-browser:firefox` and `test:www-browser:webkit`
  scripts. Only Chromium supports clipboard permission grants, so the spec
  grants them there alone. The clipboard spec passes in all three engines,
  including trusted native paste.
- [x] Video and audio HTML. Both serialize to `<figure class="editor-video">`
  or `<figure class="editor-audio">` with native controls and a `<figcaption>`,
  and decode those figures plus bare elements from `src` or the first
  `<source>`, dropping browser fallback text. Figure priorities 18 and 16 keep
  them distinct from image (20) and media embed (10), because classes can
  co-occur. Guards: `BaseMediaPluginContracts.spec.ts` round-trip for both, and
  the browser case "HTML clipboard keeps a pasted video" in all three engines.
- [x] SVG icon noise. Removing a graphic inside an `aria-hidden="true"` subtree
  is lossless: icon sets such as GitHub octicons, Lucide and Heroicons mark
  decorative SVG that way. Unmarked SVG, MathML and objects stay lossy. Guards:
  `html.spec.ts` classification and the kit's heading-icon case, both failing
  without the rule.
- [x] Docs (clipboard and media, en/cn), changesets, Verify Plate recipe,
  decision page, Plate Next v246.
- [x] Final gates after the last `lint:fix`; execution record; ledger.

Decisions and tradeoffs:

| Decision | Owner and source | Chosen fix | Material alternative rejected | Proof |
| --- | --- | --- | --- | --- |
| Toast proof | registry kit spec | Unit test through `EditorKit` with sonner mocked | Mount a Toaster in plite mode (changes the proof lane's app shell) | kit spec |
| Cross-engine clipboard | `www` Playwright config | Firefox and WebKit projects; Chromium-only permission grants | Skip native mode outside Chromium (native passes) | clipboard spec ×3 |
| Media HTML | media plugins | Figure mapping plus bare element decode | Keep media Markdown-only (paste warns and drops) | contract spec, browser |
| Decorative graphics | HTML sanitizer | `aria-hidden` subtree is lossless | Exempt SVG wholesale (hides chart text) | HTML and kit specs |

Completion Gates:

| Gate | Applies | Required action | Evidence |
| --- | --- | --- | --- |
| Package behavior | yes | `platejs`/`plitejs` suites | 141/141 and 21/21 tasks; kit spec 8/8 |
| Types | yes | package typechecks, contracts, `www` typecheck | `plitejs` 13/13, `platejs` 90/90 and contracts, full `www` chain |
| Browser | yes | clipboard spec in Chromium, Firefox, WebKit | 6/6 in each engine |
| Registry | yes | build, changelog `--check` | fresh output; check passes |
| Doctrine | yes | v246, mirrors, `validate` | valid |
| Ledger | yes | execution record, render, check | `2026-09-28-paste-proof-and-media-html` |

Verification evidence:

- Final tree: `pnpm brl`; registry build; `plitejs` typecheck 13/13 and tests
  21/21 tasks; `platejs` typecheck 90/90, compiled contracts, tests 141/141
  tasks; `www` typecheck with `api-reference`, registry `--check`, docs parity
  and registry source checks; kit spec 8/8; `pnpm entrypoint:turbo:check`;
  registry changelog `--check`; Plate Next v246 `validate`; clipboard spec 6/6
  in Chromium, Firefox and WebKit; `git diff --check`.
- The first `www` typecheck failed on a readonly test table in
  `plugins.spec.tsx`; after removing `as const`, `lint:fix` changed nothing and
  the `www` typecheck, kit spec and diff check were rerun and pass.
- Guards fail without their changes: the kit toast cases without the report
  callback, the decorative-icon cases without the `aria-hidden` rule, and the
  kit video case without the video mapping (an unmapped video warns).

Final handoff:

- Outcome: the registry toast has committed proof; clipboard paste is proven
  in Chromium, Firefox and WebKit, native and synthetic; video and audio keep
  their media through HTML paste and copy; decorative icon SVG pastes quietly.
- Limits: Playwright's WebKit build is not Safari; the toast is proven through
  the kit callback with sonner mocked, and earlier normal-mode browser receipts
  remain the rendered-toast evidence.
- Local, uncommitted.

Timeline:

- 2026-09-28 Plan created; all four items implemented, proven and closed.

Open risks:

- Pages whose icon SVG lacks `aria-hidden` still warn on paste; that graphic is
  genuinely dropped.
- Playwright's WebKit build is not Safari.
