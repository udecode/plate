# AI Explain regression

Status: Complete

## Outcome and scope

Repair the user's report that the AI menu's Explain command does nothing,
compared with `main`. Preserve document content until acceptance, normal editing
mode, and existing AI draft/review behavior. No publication is requested.

## Acceptance

- Reproduce Explain through the real Chrome AI menu on the current checkout;
  account for cursor and selected-text entry paths.
- Compare the relevant local `main` behavior and identify the canonical owner.
- Fix the cause and add the smallest valuable regression proof, first failing
  on the original implementation.
- Review the final implementation for ownership/complexity, replay Explain
  and its discard/accept follow-up, run affected checks, and regenerate registry
  output when copied source changes.

## Evidence

- Intake: `next`; localhost:3000 listener PID 2183 has cwd
  `/Users/zbeyens/git/plate-2/apps/www`.
- Native Chrome: `/docs/components/ai-menu` succeeded at the end of a paragraph;
  `/view/editor-ai` reproduced Thinking → no draft/menu, with console warning
  `No range found for AI comment`. The full fixture contains `comments`.
- Explain submits `toolName: 'generate'` and `Explain {editor}`. The demo endpoint
  scanned the expanded document for `comment`, emitted comment events, and the
  menu correctly hid itself for that tool. The isolated AI fixture lacked that
  word, so earlier streaming coverage missed the routing collision.
- Local `main` has the same substring classifier in its client fallback. Current
  no-key requests reach the demo endpoint directly. This is an inherited routing
  defect exposed by the current demo path, not a confirmed new package regression.
- Selected-text entry offers editing commands, not Explain, on both versions.
  Its package generation/session paths were checked by a read-only worker; no
  package mode or draft defect was found. The new test covers cursor-at-end and
  empty-paragraph Explain through actual menu commands.

## Repair and implementation review

- Canonical owner: `apps/www/src/lib/ai-chat-demo.ts`. Explicit comment/edit tools
  take precedence; prompt/table inference only chooses a tool when none is given.
  Dedicated Markdown/MDX sample commands match exactly.
- Keep: no package changes, UI compensations, effects, timers or new API. A
  read-only reviewer found no blocking ownership/complexity issue. Acceptance
  coverage was strengthened to assert the empty target and complete surrounding
  block sequence. Exact sample matching is a small demo behavior correction;
  existing Markdown/MDX browser cases verify those commands, rather than adding
  another sample-specific test.
- Registry generation/changelog, package changeset and barrel generation are
  N/A: only the site-owned demo endpoint and tests changed; no copied registry
  implementation, published package, or exports changed.

## Verification

- Red: full-fixture browser test received `data-toolName: comment` for an explicit
  generate request. Three endpoint cases failed for explicit generate/edit/comment
  priority before the production edit.
- Test setup repairs on unchanged product bytes: waiting for editor focus after
  Discard avoids delivering Enter before focus restoration. Playground deliberately
  mounts with `authored.intent: propose`; the normal-editing scenario explicitly
  selects Editing before testing and checks that it stays selected.
- Green: `bun test ./apps/www/src/lib/ai-chat-demo.spec.ts` — 5 passed.
- Green: `PLAYWRIGHT_BASE_URL=http://localhost:3000 pnpm --filter www
  test:www-browser:chromium ai-session.spec.ts -g 'Explain preserves|Continue
  writing streams|markdown|MDX'` — 5 passed, 30.1s. Explain preserves the original
  document during preview, Discard removes the preview, and empty-block Accept
  inserts the complete draft while preserving surrounding blocks. Existing
  Continue writing (two entry paths), Markdown/table acceptance and MDX streaming
  cases also pass.
- Native Chrome final replay on `/view/editor-ai`: reloaded source, clicked the
  heading, moved to its end, opened AI and clicked Explain. Three paragraphs
  appeared with Accept/Discard/Try again; Discard removed the draft.
- Serving identity: original PID 2183, cwd above; source aliases inspected. The
  same endpoint changed from wrong-tool red to correct-tool green after HMR,
  demonstrating the final routing source was rebuilt. Native tab was reloaded.
- Final formatting/lint, www source typecheck and diff whitespace checks run
  against the affected files. No live model/key-backed output claim is made.

## Final source identity

Base HEAD: `68898220fec48a27b0662862895628094898f066` (local, uncommitted repair).

SHA-256:

- `apps/www/src/lib/ai-chat-demo.ts`:
  `4b42150b903b6edbf5360453731b087f25e583de095b621c1aefd12c6529290b`
- `apps/www/src/lib/ai-chat-demo.spec.ts`:
  `a2a6a222c00ed4d5069a1a228af89c67ae7f88cd3445a23c1364b84cf5576fad`
- `apps/www/tests/browser/ai-session.spec.ts`:
  `9e13bc304dd446129a0541c6d8b68d1c4316f402a7d48e9cce20c3d795dd6517`

## Next action

None. Final lint, unit tests, source typecheck and browser proof passed. Local
acceptance is complete; no commit or publication was requested.
