# Current Proof Transport Resume

Date: 2026-06-14

Scope:
- Resume the WPT editing-oracle artifact during a timed `plite-auto` run.
- Avoid duplicate discovery while local behavior and huge-document proof are green.
- Promote only a current, Plite-native proof command.

Sources Sampled:
- Existing WPT artifact README, lead ledger, promoted ledger, and read log.
- Existing lead: `wpt:horizontal-caret-position-moveupdown`.

Top Lead:
- `wpt:horizontal-caret-position-moveupdown`
  - Evidence grade: A from prior WPT/source-backed artifact.
  - Current action: reran the Plite-native browser proof covering vertical movement across richtext paragraphs, image boundaries, and single-line code blocks.
  - Command:
    `cd /Users/zbeyens/git/plate-2/.tmp/plite && bun run playwright playwright/integration/examples/richtext.test.ts playwright/integration/examples/images.test.ts playwright/integration/examples/code-highlighting.test.ts --project=chromium --grep "keeps ArrowDown then ArrowRight in the browser-selected paragraph|keeps DOM caret synced after ArrowUp across paragraphs|keeps vertical arrow movement into an image synchronized|keeps ArrowDown navigation stable through a single-line code block"`
  - Result: 4 passed.

Rejected / Duplicate Leads:
- CodeMirror viewport/drawn-selection leads: already covered by the existing viewport selection artifact and this run's huge-document screenshot/no-double-highlight proof.
- Playwright timing/clipboard lead: already covered by the existing timing-oracles artifact and current stable behavior sweep.
- New GitHub broad search: no useful `gh search` results for the exact contenteditable/Playwright selection query; do not spend more time without a sharper query.

Promotion:
- No runtime patch.
- Keep as `plite-browser` proof packet: WPT movement pressure stays mapped to focused browser rows, not architecture work.

Next Query:
- If a fresh local bug appears, search specifically for that browser gesture and DOM shape.
- Otherwise next useful research shard should target a new proof family, not repeat selection/navigation leads already kept.
