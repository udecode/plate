# Comments and suggestions discussion recovery

Objective:
Recover one canonical Discussion UI over Comments and Suggestions. Sidebar and
Floating must be exclusive, complete views; AI, HTML, docs, scale, and package
behavior must remain correct.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-09-02-comments-view-switch.md

Task source:
- type: direct user request
- route: `http://localhost:3000/docs/comment`
- title: Recover the canonical comments-and-suggestions Discussion surface
- task type: public package API plus copied registry product correction
- root cause: an intermediate comments-only presentation split Discussion into
  competing owners and dropped product behavior from the demo

Latest user requirements:
- [x] Replace the comments-only presentation path with the existing combined
      `Discussion` model.
- [x] Preserve Sidebar and Floating as mutually exclusive views.
- [x] Keep one factory-created Comments plugin configured with anchors and a
      terminal `afterEditable: Discussion` slot.
- [x] Do not add `CommentKit`, restore `discussionPlugin`, or put
      `CommentsProvider` inside plugin `wrapRoot`.
- [x] Keep `CommentsProvider` application-owned so anchors, records, users,
      bodies, actions, and presentation choice have honest lifetimes.
- [x] Restore editor-ai discussion content and use `Discussion`.
- [x] Keep `AILoadingBar` in `afterContainer` and `AIMenu` in
      `afterEditable`.
- [x] Hide the AI Comment action when the Comments capability is absent.
- [x] Restore deterministic Plate-to-HTML Suggestion coverage without legacy
      comment marks.
- [x] Keep `block-discussion.tsx` deleted; recover its useful grouped behavior
      inside `Discussion`.
- [x] Simplify `comment-toolbar-button.tsx`: no second plugin, no duplicate
      keyboard behavior, and a narrow selection subscription.
- [x] Remove the temporary `comment-demo`.
- [x] Rebuild registry output and verify source, tests, scale, browser
      interactions, console state, and generated routes.
- [x] Do not commit or push.

Completion threshold:
- One controlled `sidebar | floating` choice exists at the copied Discussion
  composition boundary.
- The selected view combines comments and suggestion reviews. The other view is
  absent.
- Overlapping comments open in stable source order.
- Comment creation, reply, edit, delete, resolve, outside close, and Suggestion
  accept/reject remain functional.
- `createCommentsPlugin({ anchors })` is the only Comments behavior plugin.
  Thread data stays in the application channel and provider.
- AI integration, Plate-to-HTML Suggestion markup, English and Chinese docs,
  registry generation, package checks, WWW typecheck, and focused lint pass.
- The exact exclusive-view browser case passes five retry-free Chromium runs,
  and the full Comments browser file passes once.
- The mechanical goal checker passes.

Verification surface:
- `apps/www/tests/browser/comment.spec.ts` against
  `/blocks/discussion-demo`, `/blocks/editor-ai`,
  `/blocks/plate-to-html`, and the English/Chinese docs routes.
- Comments, Suggestion, AI menu, and static component tests.
- `platejs` Comments package typecheck and tests.
- Registry build/dev generation, changelog check, docs parity, WWW typecheck,
  barrel generation, changeset status, scoped Ultracite, and `git diff --check`.
- Fresh in-app Browser interaction for Sidebar, Floating, overlap, AI, HTML,
  docs, and console state.

Constraints:
- Preserve user-facing Comments and Suggestions behavior outside this owner set.
- Keep application records out of editor/plugin state.
- Keep copied UI out of the published package.
- Do not restore legacy comment marks or parallel presentation APIs.
- Do not commit, push, or create a PR.

Boundaries:
- Package behavior owner:
  `packages/platejs/src/react/features/comments/CommentsPlugin.ts`.
- Application data owner:
  `apps/www/src/registry/components/editor/comment.tsx`.
- Combined presentation owner:
  `apps/www/src/registry/components/editor/discussion.tsx`.
- Composition owners: Discussion demo, editor-ai block, AI slots, HTML fixture,
  registry metadata, collaboration docs, and Comments browser tests.
- Excluded owners: `CommentKit`, `discussionPlugin`, provider
  `wrapRoot`, `BlockDiscussion`, comments-only presentation, legacy comment
  marks, commit, push, and PR work.

Blocked condition:
Stop only if current annotation anchors cannot position a new-comment composer,
or the local route remains unavailable after the single dependency-recovery
path. Neither condition remains.

Task state:
- current phase: closeout
- phase status: complete
- goal status: ready for completion
- branch: `next`
- base ref: `a6afd55c30e97c74fe895d1ad005ca75413110f3`
- delivery state: local, uncommitted, and unpushed by explicit request

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Every user correction is copied into Latest user requirements and Completion threshold. |
| Timed checkpoint parsed | no | N/A: no duration or hard stop was requested. |
| Skill analysis before edits | yes | Loaded autogoal, plate-ui, best-api, shadcn, tdd, registry-changelog, docs-creator, unslop, Browser, and changeset. |
| Active goal created | yes | Active goal names the exclusive views, AI/HTML recovery, scale, registry, tests, and Browser proof. |
| Source owners read | yes | Read package Comments, copied channel/provider, Discussion, Suggestion, AI, toolbar, demos, registry, docs, and tests. |
| Tracker or video evidence | no | N/A: no external tracker or recording was supplied. |
| Existing solutions checked | yes | Checked `docs/solutions`; the old BlockDiscussion path-refresh note was relevant history, not authority to restore a second UI owner. |
| TDD decision | yes | Browser and slow-test reds were captured before the corresponding fixes. |
| Branch decision | yes | Worked directly on the required `next` checkout; no branch or worktree change. |
| Release artifacts | yes | Kept one major `platejs` changeset and one registry changelog source entry. |
| Browser strategy | yes | Used standalone block routes for product proof and docs routes for integration proof. |
| PR and tracker decision | no | N/A: the user explicitly excluded commit and push; no tracker exists. |
| Console policy | yes | Unexpected page errors fail proof; final fresh pages contain no error-level logs. |
| Package API boundary | yes | Package owns anchor projection and activation; the copied application owns records and UI. |
| Runtime scale | yes | Existing 10,000-subscriber test exercises per-thread notifications. |
| Docs lane | yes | Collaboration plugin docs were checked against source and rendered routes. |
| Output budget | yes | After two accidentally broad diagnostics, all searches and commands were narrowed and capped. |

Work Checklist:
- [x] Requirements, scope, non-goals, stop conditions, deliverables, and proof
      surfaces were recorded before the corrected implementation.
- [x] Current owners and historical solutions were read before final edits.
- [x] The hard-cut counterfactual rejected comments-only UI,
      `BlockDiscussion`, `CommentKit`, `discussionPlugin`, and provider
      `wrapRoot`.
- [x] The package/application/presentation lifetime split is explicit.
- [x] TDD reds cover the missing view switch, absent AI discussion integration,
      missing HTML Suggestion markup, and missing capability guard.
- [x] Sidebar and Floating are private implementations behind one public
      `Discussion` component.
- [x] Both views combine comments and Suggestions and use shared application
      state.
- [x] Exact overlap returns `ownership` then `overlap`.
- [x] The toolbar reuses the provider's plugin and subscribes only to selection
      existence.
- [x] AI slots and optional Comment command behavior match their real owners.
- [x] The editor-ai block seeds deterministic comments and Suggestions without
      hydration drift.
- [x] Plate-to-HTML uses the shared deterministic Suggestion fixture.
- [x] Deleted comments-only and block-specific owners remain absent from source
      and development registry payloads.
- [x] Registry metadata, generated payloads, docs, and changelog are current.
- [x] The major `platejs` changeset is relative to `main), one-package, and
      includes a migration example copied from the public source.
- [x] Package install metadata and barrels were regenerated.
- [x] Package tests, registry tests, slow tests, typechecks, docs checks, lint,
      registry generation, and diff checks pass.
- [x] Five retry-free exact browser runs and the full eight-case browser corpus
      pass.
- [x] Fresh Browser pages prove Sidebar, Floating, overlap, AI, HTML, docs, and
      clean console state.
- [x] Unslop file-edit audit covered all six edited collaboration pages; it
      found zero candidates and changed no protected literals or claims.
- [x] P1 autoreview is N/A because repo policy forbids autoreview on `next`.
- [x] Agent-native review is N/A because no agent, skill, hook, prompt, or
      command owner changed.
- [x] PR, tracker sync, commit, and push are N/A by explicit scope.
- [x] Final hashes and the local delivery caveat are recorded.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run every named owner check and Browser replay. | All commands and Browser observations below pass. |
| Bug reproduced before fix | yes | Capture the observable red. | Missing Floating control failed first; AI menu without a provider exposed Comment; AI editor lacked Discussion; HTML lacked `ins`. |
| Targeted behavior verification | yes | Run focused package, component, and browser cases. | 10 package tests, 10 component tests, two 4-test slow files, 5/5 exact browser runs, and 8/8 full browser cases pass. |
| TypeScript changed | yes | Run package and WWW typechecks. | Comments partition and WWW `tsc --noEmit` pass. |
| Package exports changed | yes | Run `pnpm brl`. | Four package barrel tasks pass. |
| Install graph changed | yes | Run `pnpm install`. | Lockfile was current; install and generated source setup passed. |
| Registry source changed | yes | Build production and development payloads. | `build:registry` and `rd` pass; stale deleted payloads are absent. |
| Browser surface changed | yes | Use Browser and durable Chromium tests. | Fresh Browser evidence and Playwright ledger are recorded below. |
| Browser paint classifier | no | N/A: this is an interaction/ownership regression, not a reporter-backed pixel classification claim. | Visual screenshots were inspected; DOM exclusivity and interaction are the acceptance oracles. |
| Clean pushed runtime | no | N/A: commit and push are explicitly excluded. | Claims are local only; no shipped or pushed claim is made. |
| Retry-free stability | yes | Repeat the exact view/overlap case five times with no retry. | 5/5 pass on Chromium with `testInfo.retry === 0`. |
| Package public API | yes | Audit factory, exports, types, runtime, and release note. | Source audit, typecheck, tests, barrels, and major changeset pass. |
| Runtime scale | yes | Exercise high subscriber cardinality and bounded invalidation. | 10,000 per-thread subscriptions receive only their changed thread; browser render-budget case passes. |
| Registry changelog | yes | Generate and check the source entry. | 107 registry events check successfully; Comments ownership entry is present. |
| Docs/content | yes | Validate claims, source parity, prose, and routes. | Docs parity passes, Unslop reports zero findings, and six English/Chinese routes pass. |
| Templates | no | N/A: generated templates are CI-owned and were not changed. | `git ls-files --modified --others -- templates` returns no paths. |
| Install corruption recovery | yes | Use the repo recovery policy once, then rerun exact failures. | Reinstall initially collided with the running dev server and another install; after the writer finished, docs and WWW typecheck reruns passed. |
| P1 autoreview | no | N/A: do not run autoreview on `next`. | Source review, focused tests, and Browser proof close this task instead. |
| Agent-native review | no | N/A: no agent-action surface changed. | Only this goal plan changed under workflow documentation. |
| PR, tracker, commit, push | no | N/A: excluded by the user. | No external mutation performed. |
| Final lint | yes | Run scoped Ultracite and diff validation. | 16 source/test files pass formatting and lint; `git diff --check` passes. |
| Goal plan checker | yes | Run the autogoal completion checker. | Must pass after this ledger update. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | Requirements and owner map recorded. | complete |
| Implementation | complete | One Discussion owner with exclusive private views; regressions recovered. | complete |
| Verification | complete | Package, app, registry, docs, scale, and browser proof pass. | complete |
| PR / tracker sync | N/A | Explicitly excluded. | complete |
| Closeout | complete | Final hashes and local-only caveat recorded. | complete |

Findings:
- The comments-only intermediate component was a product regression. Comments
  and Suggestions are one review experience, not parallel demos.
- A `CommentKit` would hide a runtime channel-bound plugin inside a static
  setup noun. One plugin does not justify a kit.
- `wrapRoot` is the wrong provider owner. One application channel spans the
  primary editor, read-only reviewer, and static projection; editor-local
  wrappers would split or duplicate that state.
- `plugin.configure({ anchors })` is also the wrong call shape because anchors
  are construction dependencies captured once per channel. Configuration is
  still correct for terminal presentation slots.
- `BlockDiscussion` had a real stale-path history, but retaining it would
  restore a second presentation/indexing path. Discussion now groups items by
  live block position.
- The AI slot change is required: the loading bar belongs after the container;
  the menu belongs after Editable. The loading/review bar must use fixed
  positioning because `afterContainer` is outside the relative editor box.
- The toolbar must not install another plugin. It must consume the exact
  provider plugin so actions target the same anchor source.

Decisions and tradeoffs:
- Keep one published Comments behavior factory and one copied `Discussion`
  presentation.
- Keep `CommentsProvider` application-owned and pass its exact channel/plugin
  pair to every view.
- Keep Sidebar/Floating selection in the provider because terminal slot
  components need it without editor recreation.
- Keep Suggestions as its existing editor behavior plugin; Discussion combines
  the two products without merging their stores.
- Keep `decorate` for range computation and Plite segment rendering for
  overlap painting. They solve different jobs.

Implementation notes:
- `comment.tsx` owns channel records, provider, cards, forms, actions, and
  narrow subscriptions; it exports no comments-only presentation.
- `discussion.tsx` owns private Sidebar and Floating views plus the one public
  `Discussion` component.
- `discussion-demo.tsx` owns the named view control and mounts Discussion
  through the terminal Comments plugin slot.
- editor-ai uses the same architecture and deterministic seeded review data.
- `suggestion-value.tsx` supplies one fixture to Discussion and Plate-to-HTML.
- AI hides Comment when `useOptionalComments()` returns no capability.
- `comment-demo.tsx`, `block-discussion.tsx`,
  `comment-static.tsx`, and their stale development payloads are absent.

Review fixes:
- Replaced hard-coded editor-ai anchor paths with text-derived ranges.
- Accounted for normalized adjacent text when locating the second AI comment.
- Replaced `Date.now()` hydration inputs with deterministic timestamps.
- Moved AI loading/review bars to fixed viewport positioning to prevent pointer
  interception after the slot correction.
- Rebuilt development registry data to remove stale deleted item payloads.
- Tightened the changeset to three user-visible imperative bullets and a
  factory-instance migration example.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Missing Floating control | 1 | Implement one controlled Discussion view choice. | Exact browser case passes. |
| AI editor anchor hard-coded to a changed path | 1 | Resolve ranges from stable text. | Two comments render. |
| Adjacent text normalization hid the second anchor | 1 | Match the normalized continuation text. | Two comments render. |
| Non-deterministic timestamps caused hydration mismatch | 1 | Use deterministic fixture dates. | Fresh AI page has no error logs. |
| AI bar intercepted the next panel after slot correction | 1 | Position it relative to the viewport. | Full browser corpus passes. |
| Slow runner had no matching comment unit file | 1 | Use Bun for component units and slow runner only for slow files. | Both correct lanes pass. |
| First final browser grep used an obsolete title | 1 | Read current test title and rerun exact case. | 5/5 pass. |
| Dependency recovery raced the dev server and another install | 2 | Stop owned server, wait for active writer, rerun exact checks. | Docs and WWW typecheck pass. |
| Two diagnostics emitted broad generated/dev output | 2 | Exclude generated trees and cap later searches. | All later diagnostics are bounded. |

Verification evidence:
- `pnpm --filter platejs typecheck:partition:comments-react` -> pass.
- `pnpm --filter platejs test:partition:comments-react` -> 10 pass,
  44 expectations.
- `bun test apps/www/src/registry/components/editor/comment.spec.tsx
  apps/www/src/registry/components/editor/suggestion.spec.tsx
  apps/www/src/registry/components/editor/suggestion-static.spec.ts` ->
  10 pass, 58 expectations.
- `pnpm test:slow -- ai-menu.slow.tsx suggestion.slow.tsx` -> both files
  pass in all runner modes.
- `NODE_OPTIONS=--max-old-space-size=8192 pnpm --filter www exec tsc
  --noEmit -p tsconfig.json --pretty false` -> pass.
- `pnpm --filter www check:docs` -> API-reference check, source build, and
  docs parity pass.
- `pnpm --filter www build:registry` and `pnpm --filter www rd` -> pass.
- `node tooling/scripts/generate-ui-changelog-entries.mjs --check` ->
  107 entries pass.
- `node tooling/scripts/check-inline-component-props.mjs` -> 20 retained
  contracts across 1,797 TSX files; pass.
- `pnpm brl`, `pnpm install`, scoped `ultracite check`,
  `git diff --check`, and `pnpm exec changeset status --since=main` ->
  pass. Changeset status resolves `platejs` at major with dependent bumps.
- Exact Chromium case repeated five times -> 5 passed, zero retry.
- Full `apps/www/tests/browser/comment.spec.ts` -> 8 passed:
  exclusive views/overlap; comment actions; Suggestion mutation and attached
  comments; paint/static/source/scale; AI Accept/Reject; editor-ai Discussion;
  HTML `ins`/`del`; English/Chinese routes.
- Fresh Browser `/blocks/discussion-demo`: Sidebar has 3 comments and
  2 Suggestions; Floating removes Sidebar and renders one floating owner;
  overlap opens `['ownership', 'overlap']`; switching back restores 3 + 2;
  no error logs.
- Fresh Browser `/blocks/editor-ai`: 2 comments, 3 Suggestions, one Comment
  command after Mod+J, no error logs.
- Fresh Browser `/blocks/plate-to-html`: iframe source contains `<ins>`,
  `<del>`, `tighten the wording`, and `keep this redundant phrase`; no
  error logs.
- Fresh Browser `/docs/comment`: Comments and Discussion headings plus the
  canonical demo render; no error logs.
- Source audit finds only `CommentsProvider`; no public `Comments`,
  `CommentsSidebar`, `CommentPopover`, `CommentKit`, `DiscussionKit`,
  `discussionPlugin`, `BlockDiscussion`, or comments-only demo remains.

Final ref and fingerprints:
- base ref: `a6afd55c30e97c74fe895d1ad005ca75413110f3`
- production source:
  `43700fc6834f7db76d1fd4cffcd39d07545fa2a228cc79f4fe1624fa5e81a448`
- tests:
  `d3f0f1f76249d5e0d356e34ec6a856e347a848064dfe5a30eef5df55d7c2917f`
- fixtures:
  `48ae0d04d9707eee8b7661331324df953df761778704950ad15fa5306a1f939a`
- generated registry payloads:
  `3417a8eebf6df99fc509ccda05d7abd561cc1bceddffaeb90a4d303aac36a739`
- delivery state: issue-owned changes are uncommitted and unpushed by request,
  so these hashes identify the verified local tree rather than a shipped ref.

Final handoff contract:
- PR: N/A: no PR requested.
- Issue / tracker: N/A: no external tracker supplied.
- Confidence: 98% for the verified local owner set.
- Reproduced: observable regressions failed before implementation.
- Verified: package, app, registry, docs, scale, and Browser proof pass.
- Browser check: Sidebar/Floating exclusivity, overlap, comments, Suggestions,
  AI, HTML, docs, and console state pass on fresh pages.
- Outcome: canonical combined Discussion is complete locally.
- Caveat: no commit, push, clean pushed checkout, or release claim.
- Design: the plugin owns anchor behavior; the application owns records and
  provider lifetime; copied Discussion owns presentation.
- Why not a quick patch: preserving comments-only or BlockDiscussion paths
  would leave callers able to choose the regressed product.
- Why not broader package UI: copied cards/forms/view policy are application UI,
  while only anchor mechanics need the published package.

Timeline:
- 2026-09-02: captured the corrected combined-product requirements.
- 2026-09-02: audited current owners, historical plans, solutions, and public API
  doctrine.
- 2026-09-02: implemented one Discussion owner and recovered AI/HTML/demo/docs
  behavior.
- 2026-09-02: fixed browser-found anchor, hydration, stacking, and stale payload
  defects.
- 2026-09-02: regenerated release/registry artifacts and completed package,
  app, scale, docs, and Browser proof.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout on the verified local `next` tree. |
| Where am I going? | Mechanical goal check, then local handoff. |
| What is the goal? | One complete combined Discussion with exclusive Sidebar/Floating views and no product regressions. |
| What have I learned? | The package, application data, and copied presentation need separate owners; kits and editor-local providers obscure those lifetimes. |
| What have I done? | Implemented the chosen shape and passed every named proof gate. |

Open risks:
- No known product defect remains in the verified owner set.
- The work is intentionally uncommitted and unpushed, so another local session
  can still change the verified files after these fingerprints.
