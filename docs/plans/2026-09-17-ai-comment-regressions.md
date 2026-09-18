# AI Comment regression audit

Status: Complete

Objective:

User: AI Comment is not working; audit regressions via Patch. Inspect and repair
the Comment lifecycle against local main, with real Chrome reproduction,
valuable red/green coverage, and final implementation review. Preserve the
existing Explain repair and unrelated edits. No publication is authorized.

Completion threshold:

The Comment failures have owning repairs, regression prevention, accepted
implementation review and final source replay. Known broader check limits are explicit.

Verification surface:

AIChatPlugin, shared demo/prompt content, mounted transport/review UI, native
Chrome and the existing AI browser suite; commands and results are below.

Constraints:

Preserve document content and unrelated comments through review; retain the
Explain repair and avoid caller compensation or additional request protocols.

Boundaries:

Local Comment repair and affected shared AI behavior. No publication, release,
unrelated fixture edits or full repository regression-corpus claim.

Blocked condition:

No remaining blocker to the local Comment outcome. Broad typecheck and
live-model/installed-consumer verification limits are recorded under Open risks.

Work Checklist:

- [x] Reproduce cursor and selected-text Comment on the full playground and
  isolated AI demo; trace actual response and visible draft review.
- [x] Audit Comment targeting, rich content, multi-block generation, Stop,
  Accept, Reject and later-request cleanup; distinguish main regressions from
  inherited defects and intentional current draft behavior.
- [x] Repair observed failures at their owner and prove prevention with the
  smallest justified executable boundary.
- [x] Run current-source native replay, affected package/browser checks,
  implementation review, and generated registry/package gates if touched.

## Evidence and ownership

- Branch checked: next. Server port 3000 PID 2183; existing source host from
  the previous Explain repair. Bind current source again before final proof.
- Existing Comment browser test stubs the response and selects a plain paragraph;
  it does not exercise the actual demo response or collapsed-cursor path.
- Lead owns browser, site transport/review UI and final proof. Worker Volta owns
  the package targeting repair and shared request-content extraction used by
  the demo and production prompt; each file has one writer.

## Next step

None for this local Comment repair. The audit is bounded to AI Comment and
affected shared AI behavior. Broader typecheck limits are recorded below;
no publication is authorized.

## Findings and repairs

- Native `/blocks/ai-demo`: Comment on `Press "⌘ + J".` shows Thinking then no
  feedback. Unit red: invalid JSON (`Unrecognized token ⌘`). Real endpoint browser
  red: no `[data-ai-comment-review]`. Demo codec now uses JSON.stringify for the
  dynamic comment event; empty blocks cannot be sampled as comment targets.
- Error state was never rendered for Comment, and partial drafts were only
  reviewable with status ready. New lifecycle test failed for absent alert;
  repaired AILoadingBar displays error recovery and retains completed drafts.
- Warm heading Comment/Accept and selected quoted-paragraph Comment/Reject pass
  using the real endpoint. Initial full-page native hydration observation had
  no review; unchanged warm replay passed. Do not attribute that first transient
  observation to the codec fix.
- Worker confirmed inherited repeated-text and nested continuation targeting
  defects. Package repair passes selected-occurrence mapping, nested complete
  spans and noncontiguous-gap rejection.
- Current collapsed-cursor request refs only include the cursor block; main's
  Comment behavior reviews the document without a selection. This is an actual
  scope regression, especially from an empty block. The package repair restores it.
- 19 codec/transport lifecycle tests passed after the site repairs. Existing
  request-owned Accept, Reject, dismissal, replacement and delayed createThread
  lifecycle tests remain part of the final affected lane.
- A partial selection (`⌘ + J` inside the quoted paragraph) also reproduced
  no review in the real endpoint browser test after enforcing selection bounds.
  Both demo and production prompt had been using the complete referenced block.
  Both consumers now share a clipped-content extractor; real endpoint replay passes.
- Added delayed asynchronous createThread/Stop coverage to the existing lifecycle
  matrix: 14 lifecycle cases pass, including late-result disposal on Stop.
- Inspected the installed AI SDK Output.array implementation: its partial array
  stream excludes unfinished elements and validates completed ones. The route's
  incremental array forwarding is sound; no speculative stream rewrite.
- Broad www source typecheck currently fails outside this repair at
  playground-demo.tsx:60 (`splice` on readonly Descendant[]). This task did not
  edit that fixture. Package dependency-building typecheck also has unrelated
  plitejs TS6307 diagnostics; direct AI partition typecheck passes.

## Proof host

The original PID 2183 stopped during work; native Chrome reported connection
refused. Lead started an owned fresh source server on port 3000 with
`PLATE_WWW_DIST_DIR=.next-ai-comments pnpm --filter www dev:plite --port 3000`
(exec session 22545). This preserves the original literal route host and enables
final current-source replay independently of the stopped process.

## Implementation review

Keep the existing owners. AIChatPlugin captures request scope and resolves
request-local references against mapped live keys and selection. Comment ranges
must resolve completely and cannot cross an unselected gap. Demo events use the
JSON encoder instead of hand interpolation. The existing prompt module owns
one pure clipping helper shared with the demo; it preserves rich descendants.
AILoadingBar renders existing request status and request-owned draft IDs without
an extra state machine, timer, effect or synchronization protocol. No public API
or export changes; barrel/doctrine regeneration is not applicable.

Native full-playground cursor replay generated document-wide drafts from an
empty paragraph, and Reject removed the generated markers and returned editor
focus. Existing discussion data remained. The browser still reports the
unrelated details-control SSR/client ID hydration warning, also seen before
this repair; no comment range warning occurred during that replay.

Verification evidence:

- Package: `pnpm --filter platejs test:partition:ai-react` — 72 passed;
  `bun test ./packages/platejs/src/ai/react/AIChatPlugin.submit.slow.ts` — 20 passed.
  Direct `pnpm exec tsc --project packages/platejs/tsconfig.entrypoints/ai-react.json
  --pretty false` passed. Existing named-root, moved-reference and request
  lifecycle coverage remains green.
- Site: `bun test ./apps/www/src/lib/ai-chat-demo.spec.ts
  ./apps/www/src/registry/app/api/ai/command/prompt/getCommentPrompt.spec.ts`
  — 11 passed. `bun test ./apps/www/src/registry/components/editor/use-chat.lifecycle.spec.tsx`
  — 14 passed. Red evidence precedes the codec, error review, range and clipping fixes.
- Browser: `PLAYWRIGHT_BASE_URL=http://localhost:3000 pnpm --filter www
  test:www-browser:chromium ai-session.spec.ts -g 'Comment|Explain preserves|Continue
  writing streams|markdown|MDX|draft'` — 9 passed, 1.2m. Includes actual endpoint
  heading/quoted/partial Comment, Accept/Reject without document mutations,
  Explain, both Continue-writing entries, Markdown/table acceptance and MDX.
  Three real Comment cases passed again after a TypeScript-only test guard fix.
  The partial-selection case was then extended with Accept → new cursor request
  → first draft → Stop → Reject, and passed (5.9s) on unchanged product bytes.
- Native Chrome: verified the exact `⌘ + J` DOM selection, generated a matching
  excerpt, and accepted it; the AI draft badge and review controls disappeared,
  while the published thread remained and editor focus returned. Also verified
  document-wide Comment from an empty paragraph in the full playground.
- A follow-up native attempt lost state during dev-host Fast Refresh. No product
  edit was made for that observation. After all edits and typechecks, restarted
  the owned server again, reloaded `/blocks/ai-demo`, clicked its existing empty
  list item, generated Comment, stopped as the first draft appeared, and rejected
  it. Review stayed available after Stop; Reject removed the draft and restored
  editor focus. Native setup that split `AI Menu` into `A`/`I Menu` was discarded;
  the final cursor proof used the visible empty block through a real pointer click.
- Final scoped Ultracite and diff-whitespace checks pass. Registry changelog
  generation and check pass (174 events); `pnpm --filter www build:registry`
  passes (320 canonical payloads, 15 overlays). Read-back confirms the generated
  ai-api clipper and ai-menu recovery UI. Added the package patch changeset.
- Final source host: owned session 25106, PID 81665, port 3000, cwd
  `/Users/zbeyens/git/plate-2/apps/www`, `PLATE_WWW_DEV_SOURCE=1`,
  `PLATE_WWW_PLITE=1`, dist `.next-ai-comments`. This fresh restart served the
  final native Stop/Reject proof; earlier browser proof used the same final
  production bytes on the preceding owned source restart (PID 79273).

Open risks:

Broad www typecheck still reports only the unrelated readonly `.splice` at
`apps/www/src/registry/examples/playground-demo.tsx:60`. Dependency-building
package typecheck reports existing Plite TS6307 errors; the changed AI partition
checks directly. No packed/installed-consumer or live-model output claim is made.
The demo endpoint, shared production prompt extraction, package targeting and
mounted transport/review lifecycle were verified. Existing details hydration
warnings are outside this bounded Comment repair.

## Final source identity

Base HEAD: `68898220fec48a27b0662862895628094898f066`; local uncommitted changes.

SHA-256:

```text
5f4aef269ebb2f519fa9ccb50a03cc154d66f2723b3267702b4cee271b7b1159  packages/platejs/src/ai/react/AIChatPlugin.ts
5e87a663f2220a93c1283b013911ae0c96c2689f58881e7d548237cb6065e01c  packages/platejs/src/ai/react/AIChatPlugin.markdown.spec.tsx
a0952a4764c7bb6d27cc3601190b1eb01644489728e416c660d46ec01bd10338  apps/www/src/lib/ai-chat-demo.ts
3a20b2bfd52f262a4e0adfaed3a6d0c008e6948e2031349d6e3f44fd29ab18c9  apps/www/src/lib/ai-chat-demo.spec.ts
66bfffa20b7bde6c89cb539491442d43c5617597f35d6069a692d22ce3641aa0  apps/www/src/registry/app/api/ai/command/prompt/getCommentPrompt.ts
29d97d194b1285b3d4ed5df01f0dae074f89018b3c802c9fb145760b07bafcb9  apps/www/src/registry/app/api/ai/command/prompt/getCommentPrompt.spec.ts
35df34dcece62d40dfbd4ee4e5466d8d9b71a64f0db93331b004af049a361a1b  apps/www/src/registry/components/editor/ai-menu.tsx
dc802b0ab12617994a8e2a8f3003c5d741b046d1292989a884ea0998bdbc3b76  apps/www/src/registry/components/editor/use-chat.lifecycle.spec.tsx
a5b47ae8f60b27f5565f8069654b973661ac16e3bf2ab17474fe8b17651c971d  apps/www/tests/browser/ai-session.spec.ts
5e3eccfb5242c968c350f7b366b685586169bee7156bb8758eddfba659ff245f  apps/www/public/r/ai-api.json
322e82e4ff070a5139d2909a0ab63e137ebfd99ca7e322acb8639a134fda970b  apps/www/public/r/ai-menu.json
20ad09732d3e27d56a93e8faa8aa65362504bd20e628b23ec48c99ec621112e5  .changeset/ai-comment-target-ranges.md
```
