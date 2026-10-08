---
review_scopes: [suggestions]
review_basis: [2026-10-04-suggestions-audit]
verdict: pursue
work_kind: implementation
review_commit: dc927288b261b6c798bd7c3c43439f68a8a5ee1d
review_inputs: [docs/research/decisions/authored-change-ownership.md, docs/research/review-records/2026-09-16-authored-writer-identity.json, VISION.md, apps/www/src/registry/examples/collaboration-demo.tsx, packages/platejs/src/yjs/react/YjsPlugin.tsx, packages/plitejs/src/yjs/core/controller-registry.ts, packages/platejs/src/features/comments/BaseCommentsPlugin.ts, packages/platejs/src/lib/editor/Editor.ts, packages/platejs/src/lib/editor/withPlite.ts, packages/platejs/src/react/editor/useCreateEditor.ts, packages/platejs/src/react/components/EditorContentView.internal.tsx, packages/platejs/src/lib/plugin/BasePlugin.ts, packages/plitejs/src/authored/format.ts, apps/www/src/registry/components/editor/comment.tsx, apps/www/src/registry/components/editor/import-toolbar-button.tsx, apps/www/src/registry/components/editor/plugins.ts, apps/www/src/registry/components/editor/html-export.tsx, apps/www/src/registry/examples/playground-demo.tsx, apps/www/src/registry/examples/discussion-demo.tsx, apps/www/src/registry/examples/version-history-demo.tsx, apps/www/src/registry/examples/find-demo.tsx, apps/www/tests/browser/runtime-read-regressions.spec.ts, content/docs/(plugins)/(collaboration)/suggestion.mdx, content/docs/(plugins)/(collaboration)/comment.mdx, content/docs/(plugins)/(collaboration)/discussion.mdx, docs/vision/plate.md, docs/research/decisions/suggestion-review-semantics.md]
review_upstreams: ['../BlockNote@1e26f1c5e1cd7df81df9d4ab2a853bf1b298b163', '../manuscripts-track-changes-plugin@62f4d19dda4c2d41afa5d9fdecea840fb6bfb0be', '../lexical@dd5c41b13193efa9ab1574234d8593d2c9e4f988', '../tiptap@91c51be53c4655ef07e29ec489471524debfa0ca', '../y-prosemirror@9200946f0ea455c681a7496c364ee998a9f064f7', '../prosemirror-suggest-changes@653fba70ba29ef6ea6af3ad8d60244a58df7281b']
---

# Suggestions: one acting user for edits and comments

Status: executed: built, reviewed and folded; the mechanism review continues in the next iteration; waiting on your commit
Playbook: plan

Pursue, superseding `2026-10-04-suggestions-audit`. Plate gives one person two writable identities. `createEditor({ userId })` attributes every authored write, and Comments' `currentUserId` attributes threads, replies and resolution. Nothing ties them, and in one editor a suggestion by bob and a comment by alice coexist with no error (`docs/plans/artifacts/2026-10-07-suggestions-review/probes/base-controls-a2.log`; `apps/www/src/registry/components/editor/discussion.spec.tsx:849` and `:868` pass that way). The strongest new reason is a shipped defect behind the same input. Every write in an editor that installs `SuggestionKit` or `AIKit` needs an author, yet `userId` is typed optional and the copied `EditorKit` includes both kits. In Chromium, `find-demo` (EditorKit, no `userId`) drops typed text and logs "An author ID is required for authored writes."; the same spec passes once `userId: 'demo'` is added (Evidence). That defect is repaired by its own bug fix, `docs/plans/2026-10-07-editorkit-missing-user.md`. `next` returned this scope. Its one uncommitted member file, `packages/platejs/package.json`, holds pagination partition scripts that `docs/plans/2026-10-06-pagination-review.md` owns, not suggestions work. The scope depends on `selection`, which is closed with a Stop.

The plan, picked by a three-runner `architect` arena with an Opus cross-judge, revised by eleven panel rounds and then by the owner's solo-mode review below, gives each Plate editor one immutable `editor.userId`. `createEditor({ userId })` sets it after checking it with native authored's own author rule. An editor with no `userId` writes as the local user, the fixed ID `'local'`, so a solo editor types, suggests and runs AI with no setup; an editor with a Yjs plugin and no user still works and warns once in development, at its first write or comment, that collaborators would share that user. Authored attribution, Comments and copied UI all read it, and a different signed-in user gets a different editor that the app hands the current document and comments. `DefaultAuthoredPlugin` becomes `AuthoredPlugin`, which apps configure for retained history beside suggestions and AI. User names stay in the Comments store. It builds in two phases under the Build playbook, `.agents/playbooks/build.md`.

## Brief

### What will change?

Suggestions, comments and the copied interface now use one fixed user per editor. An editor with no user writes as a local user, so solo editors and AI need no setup. This reverses the first plan.

### What could go wrong?

Proof is Chromium only. Two demos never open an editor. Collaborators without a user share one author. A supplied editor fails in development strict mode. The review asks for an API review of the editor option.

## Public API

A solo editor needs no user. `find-demo.tsx` and every other `EditorKit` setup keep their call without `userId` and type as the local user, so `userId: 'demo'` leaves the fourteen examples that set it and the AI page drops its `userId` lines. A solo editor shows `local` as the author of its changes unless the Comments user directory names it. An app with more than one user passes the acting user once, and Comments no longer takes a user of its own.

```tsx before
// content/docs/(plugins)/(collaboration)/discussion.mdx
const editor = useCreateEditor({
  plugins: [
    ...EditorKit,
    ...DiscussionKit,
    CommentsPlugin.configure({
      initialState: { initialComments, users, currentUserId },
    }),
  ],
  initialValue,
  userId: currentUserId,
});
```

```tsx after
// content/docs/(plugins)/(collaboration)/discussion.mdx
const editor = useCreateEditor({
  plugins: [
    ...EditorKit,
    ...DiscussionKit,
    CommentsPlugin.configure({
      initialState: { initialComments, users },
    }),
  ],
  initialValue,
  userId,
});
```

When the signed-in user changes, the app captures the outgoing editor's document and comments and passes them to the editor the hook builds for the new user. Given a different `userId`, the hook builds a new editor from that render's options and drops the old editor's unsaved document and comments, so the handoff passes them in. A supplied `editor` throws on every rebuild after it was built, and a new editor cannot bind a Yjs namespace an earlier editor still holds (Native behavior).

```tsx before
```

```tsx after
// content/docs/api/react-hooks.mdx
const [userId, setUserId] = useState(session.user.id);
const [snapshot, setSnapshot] = useState(saved);
const editor = useCreateEditor({
  initialValue: snapshot.document,
  plugins: [
    ...plugins,
    CommentsPlugin.configure({
      initialState: { initialComments: snapshot.comments },
    }),
  ],
  userId,
});

const switchUser = (nextUserId: string) => {
  setSnapshot({
    comments: editor.plugin(CommentsPlugin).api.toJSON(),
    document: editor.read.value(),
  });
  setUserId(nextUserId);
};
```

An app that wants revert beside suggestions configures the one authored plugin that suggestions and AI depend on, and stops copying Plate's private author resolver. Retention is read once, when the editor is created.

```tsx before
// apps/www/src/registry/examples/version-history-demo.tsx
authored({
  authorId: readPlateUserId,
  retainHistory: true,
}),
```

```tsx after
// apps/www/src/registry/examples/version-history-demo.tsx
AuthoredPlugin.configure({ initialState: { retainHistory: true } }),
```

Copied review UI reaches native authored decisions through the renamed plugin.

```tsx before
// apps/www/src/registry/components/editor/discussion.tsx
const authored = editor.plugin(DefaultAuthoredPlugin);
```

```tsx after
// apps/www/src/registry/components/editor/discussion.tsx
const authored = editor.plugin(AuthoredPlugin);
```

Copied UI reads "me" from the editor in both places, and the value cannot change under it.

```tsx before
// apps/www/src/registry/components/editor/suggestion.tsx
const currentUserId = editor.runtime.userId ?? '';
```

```tsx after
// apps/www/src/registry/components/editor/suggestion.tsx
if (authorId !== editor.userId) {
```

```tsx before
// apps/www/src/registry/components/editor/comment.tsx
const useCurrentCommentUserId = () =>
  usePluginStore(CommentsPlugin, 'currentUserId');
```

```tsx after
// apps/www/src/registry/components/editor/comment.tsx
const currentUser = useCommentUser(useEditor().userId);
```

The homepage playground loads its three authors' suggestions as data instead of replaying edits under a switched user on every mount.

```tsx before
// apps/www/src/registry/examples/playground-demo.tsx
current.runtime.userId = 'bob';
current.update((tx) => {
  tx.history.skip();
  tx.authored.propose();
  tx.text.delete({ at: { anchor, focus } });
});
current.runtime.userId = 'charlie';
```

```tsx after
// apps/www/src/registry/examples/playground-demo.tsx
initialValue: createAuthoredReviewDocument({
  accepted: baseline,
  revisions: [
    {
      id: 'playground1',
      authorId: 'alice',
      createdAt: createdAt - 900_000,
      change: DocumentChange.between(baseline, inserted),
    },
    {
      id: 'playground2',
      authorId: 'bob',
      createdAt: createdAt - 800_000,
      change: DocumentChange.between(inserted, deleted),
    },
    {
      id: overlapChangeId,
      authorId: 'charlie',
      createdAt: createdAt - 700_000,
      change: DocumentChange.between(deleted, capture()),
    },
  ],
}),
```

The version-history demo's "Edit as" control hands the document to a new editor for the chosen user instead of mutating the running editor's user.

```tsx before
// apps/www/src/registry/examples/version-history-demo.tsx
onChange={(event) => {
  Reflect.set(editor.runtime, 'userId', event.target.value);
  setAuthorId(event.target.value);
}}
```

```tsx after
// apps/www/src/registry/examples/version-history-demo.tsx
onChange={(event) => {
  setSnapshot(editor.read.value());
  setAuthorId(event.target.value);
}}
```

## Layer and owner

| Change | Layer (Plite or Plate) | Package | Why |
| --- | --- | --- | --- |
| One immutable `editor.userId`, checked with Plite's author rule | Plate | `platejs` core (`lib/editor/editorUser.internal.ts`, `withPlite.ts`, `Editor.ts`) | The acting user is editor-session configuration |
| The local user and the Yjs warning | Plate | `platejs` core (`withPlite.ts`, and a helper over `DebugPlugin`'s `api.debug.warn`) | Identity is editor-session configuration; core may not import `yjs`, so the warning reads published plugin keys, which `docs/vision/plite.md` keeps for diagnostics |
| `AuthoredPlugin`, configurable, author fixed to `editor.userId` | Plate | `platejs/authored`, gaining an `authored → core` edge in `tooling/entrypoints/entrypoint-dag.mjs` | A typed read replaces `Reflect`; the one descriptor that suggestions and AI depend on takes `.configure()` |
| Comments actor | Plate | `platejs/comments` | Reads `editor.userId` from `core`; no `authored` or suggestion dependency |
| Native author resolution, transaction cache, receive path, and the author ID rule | Plite | `plitejs/authored`; the rule also leaves through `plitejs/internal` | Its resolver contract already carries the job; Plate validates `userId` with the same copy of the rule |

## Hard cuts and app migration

The caller lists come from `git grep -w` over `packages`, `apps/www/src` and `content/docs`, saved under `docs/plans/artifacts/2026-10-07-suggestions-review/census/`.

| Removed or changed | Repository callers that break | App migration |
| --- | --- | --- |
| `DefaultAuthoredPlugin` | 38 files (`callers-DefaultAuthoredPlugin.txt`): suggestion, AI, comments and table specs, copied discussion, comment, export and mode toolbar UI, demos, docs | Import `AuthoredPlugin` instead |
| `authored` factory and `type AuthoredPlugin` re-exported from `platejs/authored` | 16 files (`callers-authored-factory.txt` plus the in-package specs): `version-history-demo.tsx`, `generate-rich-text-editor-value.ts`, authored, DOCX, upload, Markdown, migration and static specs, a type test, five docs pages | Install `AuthoredPlugin` with `createEditor({ userId })`; configure retention through `AuthoredPlugin.configure` |
| `editor.runtime` (`userId`, `isNormalizing`) | 14 files (`callers-runtime.txt`) | Read `editor.userId`; writers become a fixture, a handoff or a Yjs peer; a new editor cannot bind a Yjs namespace an earlier editor still holds (Native behavior) |
| `userId: null` in `createEditor` options | none found | Omit `userId` |
| A `userId` containing NUL, which native authored cannot store | none found | Pass the application's user ID |
| `CommentsPluginState.currentUserId` | 34 files (`callers-currentUserId.txt`) | Pass the ID as `userId` to `createEditor`, or omit it in a solo editor, which comments as the local user; for a new signed-in user, render a new editor from the latest document and comments, and a new editor cannot bind a Yjs namespace an earlier editor still holds (Native behavior) |
| `useCreateEditor` given a different `userId` | none found | It makes a new editor for that user from the options passed; pass the captured document and comments to keep work, or gate the editor with `enabled` while the session loads. When the app reuses the same supplied `editor`, it throws, as on any rebuild of that editor, and a new editor cannot bind a Yjs namespace an earlier editor still holds (Native behavior) |
| An empty `userId` | none found | It means the local user |
| `createEditor` with no `userId` | `userId: 'demo'` in fourteen registry examples, nine from the bug fix and five from before it, and the AI page's `userId` lines, which this plan removes | The editor writes as the local user `'local'`; pass `userId` whenever more than one person writes the document; an editor with a plugin keyed `yjs` warns once in development at its first write or comment as the local user, and a solo editor that uses Yjs only for persistence can pass any stable ID |

## Native behavior and proof

| Behavior | What changes | Proof surface |
| --- | --- | --- |
| Typing, suggesting and AI proposals in an editor that records authored changes and has no `userId` | Today each keystroke is dropped and an error is logged; after, each write is recorded as the local user `'local'` | Authored spec with no `userId`; Chromium find-demo spec with the demo user removed |
| Importing a compared revision with `proposeAuthoredComparison` and no `userId` | Today it returns `{ reason: 'actor', status: 'unavailable' }`; after, it proposes the revision as the local user | `blast/no-user-readers-a3.log`; the authored spec in Phase 1 step 2 |
| Writing or commenting with no `userId` in an editor with a Yjs plugin | Today an authored write throws and a comment returns `invalid`; after, each is stamped `'local'`, and the first one warns once in development, naming `userId` | Authored and Comments specs; alice, no write, a disabled Yjs plugin, production mode and a plain Yjs editor stay silent |
| Typing with a user | Unchanged; each write is stamped with `editor.userId` | Chromium find-demo spec and the playground browser case |
| Switching the signed-in user | The new editor starts from the handed-off document and comments; the old editor's undo stack leaves with it | React handoff spec; Chromium version-history case |
| A different `userId` passed to `useCreateEditor` | Today the hook keeps the old editor and its user; after, it builds a new editor from that render's options and drops the old editor's unsaved document and comments, including Comments state loaded outside an effect keyed on the editor; when the app reuses the same supplied `editor`, the rebuild throws, as any rebuild of that editor does today; the hook cannot build an editor with a Yjs binding or a supplied editor under StrictMode, today or after; with or without the hook, a Yjs binding claims its namespace, the `Y.Doc` and `rootName`, until the plugin that holds it is removed, and dropping or unmounting the editor does not free it; a binding installed at creation outside a plugin slot, which covers every `YjsPlugin` and `CollaborationPlugin` and any raw `yjs()` passed in `plugins`, cannot be removed, so a new editor on that namespace throws, while a raw `yjs()` installed through `editor.install` or a plugin slot can be released, after which a new editor binds and edits the same namespace | React specs in Phase 2 step 2; `probes/supplied-editor-reenhance-a1.log`; `probes/hook-strictmode-a2.log`; `probes/yjs-rebind-a1.log`; `probes/yjsplugin-release-a1.log`; `probes/yjs-release-a1.log`; `apps/www/src/registry/examples/collaboration-demo.tsx` lines 293-302 |

## Main changes

- `createEditor` checks `userId` with Plite's author rule, turns an omitted or empty `userId` into the local user `'local'`, and records it for the editor's runtime owner before construction runs. `userId` is a non-configurable getter with no setter that reads that record, so the editor and every view created after admission from the editor or from such a view read the same user, and a failed construction can retry with another user. A view created from the raw editor before admission, and any view created from it, keeps the properties it copied, but Plate stamps their writes and comments with the editor's user, and `createEditor` refuses any view as the editor to build. The `runtime` bag goes.
- A core helper warns once per editor through `editor.api.debug.warn`, which is silent in production, when a write or a comment is stamped with the local user while a published plugin is keyed `yjs`, because collaborators would then share one author.
- `AuthoredPlugin` builds its native plugin per editor through a stage callback, so the configured `retainHistory` reaches native activation.
- `BaseCommentsPlugin` stamps create, reply and resolve from `editor.userId`.

## Decision ledger

| Surface | Current | Target | Owner | Reason | Adoption | Proof | Risk | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Acting user | `runtime.userId` mutable, plus Comments `currentUserId` | readonly `editor.userId: string` getter over one record per runtime owner, the app's user or the local user `'local'`, checked with Plite's author rule and recorded before construction | Plate core | Two writable truths diverge silently | Phase 2 | Comments reply through a root view; mutation attempts; failed-construction retry; Phase 3's S1 to S6 and C1 to C3 | apps that switch users live must hand off | rearchitect |
| `runtime` bag | `userId` and an unread `isNormalizing` | deleted | none | One live field, one dead field | Phase 2 | `git grep` over live source | none found | cut |
| Default authored descriptor | frozen `DefaultAuthoredPlugin`, `Reflect` resolver | configurable `AuthoredPlugin`, typed resolver | `platejs/authored` | Apps cannot set retention beside suggestions or AI | Phase 1 | retention spec and the construction benchmark on the real plugin | none left after the stage probe | gate |
| `authored` factory and its type in `platejs/authored` | re-exports of Plite's | removed from the curated export list | `plitejs/authored` keeps them | A second resolver in a Plate app contradicts `editor.userId`; the type name collides with the new plugin | Phase 1 | `git grep` over live source | Plate specs migrate | cut |
| Missing user | dropped keystroke at first write | the editor writes as the local user; with a Yjs plugin, the first write or comment as the local user warns once in development | Plate core | The owner wants solo editors and AI with no setup; one person needs no named author, and collaboration still needs real identity | Phase 1 | authored, core and Chromium typing specs | collaborators who omit `userId` share one author, with a development warning only when a Yjs plugin is installed | rearchitect |
| `useCreateEditor` identity | ignores a changed `userId` | keys its editor on the normalized `userId` as it keys on `id`, so a change of user yields a new editor for that user from the options passed, or, when the app reuses the same supplied `editor`, throws as any rebuild of that editor does; `enabled: false` returns no editor | `react-core` | Four panel rounds showed that a guard which throws or replaces conditionally either crashes late sessions or loses work; keying never hands back an editor for the wrong user and keeps the existing `id` semantics | Phase 2 | React spec | apps that change the user without handing off lose the old editor's unsaved work; Yjs editors stay outside the hook, which cannot build them under StrictMode, and a new editor cannot bind a Yjs namespace an earlier editor still holds (Native behavior) | rearchitect |
| Comments actor | `currentUserId` store field | `editor.userId` | `platejs/comments` | Same person, one input | Phase 2 | Comments spec | a solo Comments editor comments as the local user | cut |
| User names | Comments `users` | unchanged | `platejs/comments` | No defect needs a new owner; the discussion card composes Comments | none | none | none | keep |
| Comment composers and suggestion decision controls | render with no user; submit fails, decisions throw | unchanged rendering; every editor has a user, so submit and decisions work | registry | The local user removes the failing state | Phase 2 | comment and discussion specs with no `userId` that fail at base | none | keep |
| AI author | the human `userId` | unchanged | `platejs/ai/react` | Vision: human and tracked AI edits share records | none | existing AI specs | none | keep |
| Yjs presence | `setCursorData` | unchanged | `plitejs/yjs` | Presence is display data, not attribution | none | none | none | keep |

## Steps

### Start gates

| Gate | Applies | Evidence |
| --- | --- | --- |
| Files that hold another session's uncommitted work, such as `tooling/entrypoints/entrypoint-dag.mjs`, are copied to the run directory before the first edit | yes | `docs/plans/artifacts/2026-10-07-suggestions-review/pre-edit/entrypoint-dag.mjs` and `platejs-entrypoint-sizes.json`, copied before the first edit |

Execution authority: the owner's `/best-api-review next`, which continues a Pursue into its plan and build, and the owner's mid-run "merge a new /best-api-review before continuing". The packet is Phase 1's slices, then Phase 2's, each frozen with `.agents/pstack/freeze.mjs` after its review fixes. The build base is `dc927288b261b6c798bd7c3c43439f68a8a5ee1d`.

### Completion gates

| Gate | Evidence |
| --- | --- |
| `pstack:blast-radius` on the public API change before code moves | `docs/plans/artifacts/2026-10-07-suggestions-review/blast/writeup.md`; `blast/no-user-readers-a3.log` |
| `pstack:thermo-nuclear-code-quality-review` on each slice that touches shared code, and a freeze per slice | Phase 1: `docs/plans/artifacts/2026-10-07-suggestions-review/review/thermo-phase1/reply.md` on freeze `a2dff95e`, with its findings in the 13:21:52 build rows. Phases 2 and 3: skip: the four diff panel rounds ran the same code-quality lens on every shared-code slice, on freezes `5bcf2224`, `4a87bd26`, `67959b5b` and `64594b82`, and the final tree is frozen as `5c307484` |
| Hard-cut sweep of callers, exports, tests, docs, examples, browser proof and benchmarks | `docs/plans/artifacts/2026-10-07-suggestions-review/build/hard-cut-sweep-a1.log` finds no `DefaultAuthoredPlugin`, `PlateAuthoredPlugin`, `runtime.userId`, `runtime.isNormalizing`, demo user or `authored` factory import, and `currentUserId` only in the CI-generated v1 `templates/**`; the DOCX benchmarks and the CLI test moved in diff rounds 1 and 2 |
| `best-api repair` for every artifact that teaches a rejected shape | the 12:59:22 build row: `docs/vision/plate.md` and `docs/research/decisions/authored-change-ownership.md`, and a search of rules, docs, examples and packages that finds no teaching of a required user |
| The construction benchmark rerun on the final `AuthoredPlugin` through `benchmark` | `docs/plans/artifacts/2026-10-07-suggestions-review/bench/authored-construction-a3.log`, within the frozen budget, with `pstack:benchmark-checklist` run before its verify row |
| `plate-docs` on every changed page, with its example coverage audit | the 12:59:22 and 13:43:51 build rows and the iteration 2 docs fixes; `docs/plans/artifacts/2026-10-07-suggestions-review/build/www-later-links-a3.log` passes build:source, the registry check and docs parity. skip: a separate example coverage audit, because the change adds one reader task, the user switch, which the hooks page shows as a snippet |
| `pnpm exec oxlint --type-aware` on the task's lintable files before the diff panel | `docs/plans/artifacts/2026-10-07-suggestions-review/panel/diff-iter2-round-1/phase3-lint-a1.log`, and `lint-type-aware` passes in `docs/plans/artifacts/2026-10-07-suggestions-review/build/pnpm-check-a2.log` |
| Writing passes: `deslop`, then `no-comments` on product code; `unslop` on docs and plans | the writing rows in the decision log, with `docs/plans/artifacts/2026-10-07-suggestions-review/panel/diff-iter2-round-1/no-comments-reply.md` and `docs/plans/artifacts/2026-10-07-suggestions-review/panel/diff-iter2-round-1/no-comments-post-panel-reply.md` |
| Panel on the diff (reviews: api-build) and its fixes | Panel gate rows Diff 1 to 3 and Iteration 2 diff 1; the last round raised no critical finding |
| Changeset for `platejs` and the registry changelog entry | `.changeset/platejs-editor-user.md` and `apps/www/src/registry/changelog/entries/2026-10-07-editor-user.mdx`; `registry-changelog` passes in `docs/plans/artifacts/2026-10-07-suggestions-review/build/pnpm-check-a2.log` |
| `pnpm brl`, `pnpm --filter www build:registry` and `pnpm check` | `barrels` passes in `docs/plans/artifacts/2026-10-07-suggestions-review/build/pnpm-check-a2.log`; `docs/plans/artifacts/2026-10-07-suggestions-review/build/build-registry-final-a2.log`; `pnpm check` with every failing step attributed to HEAD in the 'pnpm check on the final product bytes' verify row |
| Lint fix on the task's files | `docs/plans/artifacts/2026-10-07-suggestions-review/build/final-lint-a1.log`: fix, format, check and type-aware oxlint on the 92 lintable task files, with no change |
| Repeated acceptance proof on final bytes | `docs/plans/artifacts/2026-10-07-suggestions-review/proof/final-browser-a1.log` in a base worktree with the final files; the eight Phase 3 mutants on freeze `5c307484` (`docs/plans/artifacts/2026-10-07-suggestions-review/mutate/author-read-by-own-property-a1.log` and the `a2` logs); `docs/plans/artifacts/2026-10-07-suggestions-review/bench/authored-construction-a3.log` |
| Decision-trail review by a `codex:gpt-6.1-sol @xhigh` seat | round 1: `docs/plans/artifacts/2026-10-07-suggestions-review/trail/review-sol.md`; round 2: `docs/plans/artifacts/2026-10-07-suggestions-review/trail/round-2/review-opus.md`, same-family Opus because the Codex seat failed twice on account access (`docs/plans/artifacts/2026-10-07-suggestions-review/trail/round-2/review-sol.err`) |
| Fold the delta into `docs/plans/topics/suggestions.md`, ledger check and lookup, publish, and name the next ledger item | `docs/plans/topics/suggestions.md` holds the fold, with `docs/plans/artifacts/2026-10-07-suggestions-review/fold/suggestions.before-fold.md` as the copy before it; the folded render, ledger check, lookup, publish and `review-ledger next` are in the close's trail rows |
| `/pstack:reflect` | skip: reflect runs once at the end of this run, after the next iteration, `docs/plans/2026-10-07-suggestions-editor-input.md` |

### Phase 1: configurable `AuthoredPlugin` and the local user

- [x] Add the `authored → core` edge to `tooling/entrypoints/entrypoint-dag.mjs`, and replace `packages/platejs/src/authored/PlateAuthoredPlugin.ts` with `AuthoredPlugin.ts`, which is `definePlugin('authored', { initialState: { retainHistory: false } })` extended by a stage callback that returns Plite's `authored({ authorId, retainHistory })` with a typed author read from core and the configured retention. Remove the `authored` factory and `type AuthoredPlugin` re-exports from `packages/platejs/src/authored/index.ts`, which is a curated list of named exports. Proof: a new spec beside `authored.api.spec.ts` where `BaseSuggestionPlugin` plus `AuthoredPlugin.configure({ initialState: { retainHistory: true } })` reverts a closed change with `applied`, and the unconfigured control returns `unavailable`; at base the configured composition cannot be built (`probes/base-controls-a2.log`); `pnpm check entrypoint-graph`; and the construction benchmark, ported from `docs/plans/artifacts/2026-10-07-suggestions-review/bench/construction-probe.ts` into a repository runner that `benchmark` names, run against the real `AuthoredPlugin` with the frozen budget (candidate median at most 1.10 times the incumbent median plus 0.05 ms in each cohort) and both known-bad controls failing. The runner is a measured run, not a blocking test; its incumbent arm builds Plite's `authored()` directly, since `DefaultAuthoredPlugin` no longer exists; and each line passes on the median of three interleaved runs, with no further reruns.
  Closed by `docs/plans/artifacts/2026-10-07-suggestions-review/build/typecheck-authored-direct-a1.log`, `docs/plans/artifacts/2026-10-07-suggestions-review/build/entrypoint-graph-a2.log`, `docs/plans/artifacts/2026-10-07-suggestions-review/build/authored-spec-after-review-a1.log`, `docs/plans/artifacts/2026-10-07-suggestions-review/mutate/retention-ignored-a1.log` and `docs/plans/artifacts/2026-10-07-suggestions-review/bench/authored-construction-a2.log`. The export is a direct inferred chain; Plite's brand types became nameable instead of the planned cast.
- [x] Move Plite's author ID rule into a Plite root module beside the authored document capability, use it in `currentAuthorId`, and export it through `plitejs/internal`. In `createEditor`, reject a `userId` the rule rejects, turn an omitted or empty `userId` into the local user `'local'`, Add a core helper that warns once per editor through `editor.api.debug.warn` when a write or comment is stamped with the local user while a published, enabled plugin is keyed `yjs`, and call it from `AuthoredPlugin`'s resolver. Rewrite the `userId` JSDoc in `packages/platejs/src/lib/editor/withPlite.ts` and `Editor.ts`, which still names Yjs and combobox jobs, and the `createEditor` options in `content/docs/api/core.mdx` with its Chinese twin, to describe the local user. Run `best-api repair` on the Writer identity section of `docs/research/decisions/authored-change-ownership.md`, which says an app composition supplies a user before allowing edits, so it says Plate's resolver reads the app's user or the local user and every Plite write still needs a non-empty author. Proof: an authored spec where an editor with `BaseSuggestionPlugin` and no `userId` records a typed write and a proposal as `'local'`, failing at base, where the write throws (`proof/no-user-write-a2.log`), and `''` does the same; the three specs that assert the proposal-mode throw without an author (`BaseSuggestionPlugin.spec.ts` line 24, `mode-toolbar-button.spec.tsx` line 169 and `suggestion.spec.tsx` line 72) now enter Suggestion mode as the local user; `proposeAuthoredComparison` with no `userId` applies where base returns `unavailable`; a `userId` containing NUL is rejected at creation, where base accepts it (`probes/can-propose-check-a3.log`); specs where an editor with `BaseSuggestionPlugin` and no `userId` warns once naming `userId` at its first write, and not at the second, when `YjsPlugin` is installed directly, as another plugin's dependency, or as a raw `yjs()` through `editor.install`, failing at base, where nothing warns; it stays silent with alice, with the Yjs plugin disabled, with no write, in production mode, and for a plain Yjs editor without authored changes that types, the `collaboration-demo.tsx` shape; `pnpm check entrypoint-graph`.
  Closed by `docs/plans/artifacts/2026-10-07-suggestions-review/build/phase1-package-specs-a2.log`, `docs/plans/artifacts/2026-10-07-suggestions-review/mutate/empty-user-not-local-a1.log`, `docs/plans/artifacts/2026-10-07-suggestions-review/mutate/nul-accepted-a1.log`, `docs/plans/artifacts/2026-10-07-suggestions-review/mutate/warning-without-yjs-check-a1.log`, `docs/plans/artifacts/2026-10-07-suggestions-review/mutate/warning-for-named-user-a1.log`, `docs/plans/artifacts/2026-10-07-suggestions-review/mutate/warning-every-write-a1.log`, `docs/plans/artifacts/2026-10-07-suggestions-review/build/warning-production-a1.log` and `docs/plans/artifacts/2026-10-07-suggestions-review/build/no-user-readers-phase1-a1.log`.
- [x] Remove `userId: 'demo'` from the fourteen registry examples that set it, the nine the bug fix changed and `ai-demo`, `code-block-codemirror-demo`, `code-block-demo`, `code-block-huge-demo` and `demo`, which set it before, and rekey `ai-demo`'s Comments user to the local user, `currentUserId: 'local'` and `users: { local: { id: 'local', name: 'You' } }`, so its identities stay one. Remove the AI page's `userId` lines, its `AIEditor({ userId })` signature and its sentence that the editor rejects every edit without one, with the Chinese twin, and keep the bug fix's `find` and `comment` page corrections and the twin's code block repair. Delete the bug fix's changelog entry `apps/www/src/registry/changelog/entries/2026-10-07-fix-editor-kit-typing.mdx`, regenerate with `node tooling/scripts/generate-ui-changelog-entries.mjs --write` and `pnpm --filter www build:registry`, and note the reversal in `docs/plans/2026-10-07-editorkit-missing-user.md`'s Close. Proof: the bug fix's Chromium typing sweep (`proof/typing-sweep.sh`), with `ai-demo` and `demo` added, passes over its six routes that reach the editor and those two, with the demo users removed, against a server on the changed package source, while the same examples on the base package fail (`proof/typing-sweep-base-a3.log` for the six); `tabbable-demo` and `editable-voids-demo` never reach the editor in either run and stay named limits; `git grep -F "userId: 'demo'"` over `apps/www/src`, `git grep -n userId` over both AI pages and `git grep -F` for the English and Chinese rejection sentences over `content/docs` find nothing; `node tooling/scripts/generate-ui-changelog-entries.mjs --check`; `pnpm --filter www build:registry --check`.
  Closed by `docs/plans/artifacts/2026-10-07-suggestions-review/proof/typing-sweep-local-a1.log`, `docs/plans/artifacts/2026-10-07-suggestions-review/build/phase1-greps-a1.log`, `docs/plans/artifacts/2026-10-07-suggestions-review/build/changelog-check-a1.log` and `docs/plans/artifacts/2026-10-07-suggestions-review/build/build-registry-check-a1.log`.
- [x] Migrate every `DefaultAuthoredPlugin` and `authored(` caller in `census/` to `AuthoredPlugin`, and document in its JSDoc and the docs that retention is read once at creation. Proof: `pnpm --filter platejs typecheck`, the www typecheck, the affected package tests, and `git grep -w DefaultAuthoredPlugin` over live source, docs, skills and open plans finding only history.
  Closed by `docs/plans/artifacts/2026-10-07-suggestions-review/build/platejs-typecheck-a2.log`, `docs/plans/artifacts/2026-10-07-suggestions-review/build/www-later-links-a2.log`, `docs/plans/artifacts/2026-10-07-suggestions-review/build/www-tsc-integration-a1.log`, `docs/plans/artifacts/2026-10-07-suggestions-review/build/phase1-www-specs-a2.log` and `docs/plans/artifacts/2026-10-07-suggestions-review/build/phase1-greps-a1.log`, under the www typecheck Defaults row.
- [x] Keep, revert or quarantine Phase 1. Proof: the decision row in `docs/plans/2026-10-07-suggestions-review.decisions.tsv`.
  Closed by the keep row in `docs/plans/2026-10-07-suggestions-review.decisions.tsv`.

### Phase 2: one immutable `editor.userId`

- [x] Define a non-writable, non-configurable own `editor.userId` from `createEditor({ userId })` once construction succeeds. Construction runs a detached transaction with no authored attribution (`packages/plitejs/src/create-editor.ts` line 287, `packages/plitejs/src/core/public-state.ts` line 6733). The `initialValue` callback (`packages/platejs/src/lib/editor/withPlite.ts` lines 1084-1098) and Yjs start in `afterPublish` (`create-editor.ts` line 331) also run before it. No repository `initialValue` callback reads the user (`git grep` over `packages`, `apps/www/src` and `content`), and Yjs start resolves no local author, because for an authored document it only applies received effects through a trusted remote update (`packages/plitejs/src/yjs/core/controller.ts` lines 1221-1225, `packages/plitejs/src/yjs/core/editor-adapter.ts` lines 148-208). Delete the `runtime` bag and its `isNormalizing` writes. Proof: a runtime spec that reads `editor.userId` (absent at base) as `'local'` with no `userId` and as alice with one, tries assignment, redefinition and deletion through the owner and a view and still sees alice, and records an authored write as alice; a spec where a construction that fails and is retried on the same raw editor with a different user ends with the retried user.
  Closed by `docs/plans/artifacts/2026-10-07-suggestions-review/build/editor-user-spec-after-a1.log`, `docs/plans/artifacts/2026-10-07-suggestions-review/panel/diff-round-1/repro-after-a1.log` and `docs/plans/artifacts/2026-10-07-suggestions-review/mutate/editor-user-writable-a1.log`. Deviation: the editor's owner holds its user before construction runs, and `userId` is a getter that the editor and its views resolve through the owner, locked once construction succeeds (panel rounds 1 and 2). Phase 3 replaces this mechanism. Rebuilding a finished editor throws `createEditor cannot rebuild an editor that was already created`. Closed also by `docs/plans/artifacts/2026-10-07-suggestions-review/panel/diff-round-2/repro-after-a1.log`.
- [x] Make `useCreateEditor` key its editor on the normalized `userId` the way it keys on `id`, so a change of user yields a new editor for the requested user, made from the options passed in that render; `enabled: false` returns no editor. When the app reuses the same supplied `editor`, a change of user reruns construction on that editor and throws, as an `id` or dependency change does today (`probes/supplied-editor-reenhance-a1.log`), so the hook never hands back an editor for the wrong user. The hook adds no guard for work in the outgoing editor; the documented handoff passes the captured document and comments as the new options, and the hook's `userId` JSDoc says a change builds a new editor and drops the old editor's unsaved document and comments, or throws when the app reuses the same supplied `editor`, and that a new editor cannot bind a Yjs namespace the old editor still holds (Native behavior). Proof: React specs where the local user to alice, alice to bob and alice to the local user each return a new editor whose `userId` is the requested one with unchanged dependencies, failing at base, where the old editor comes back; a spec that types into an editor with no user, then switches `userId` from `undefined` to `''` and back, and keeps the same editor and the typed text, with a `mutate.mjs` run that keys on the raw `userId` and fails it; a spec outside StrictMode where the alice mount returns the supplied editor, reusing it after the change to bob throws instead of returning alice's editor, and, in the same mount after alice, a fresh supplied editor for bob returns that fresh editor object with `userId` bob, with `mutate.mjs` runs that drop the supplied editor in the hook, skip the user key when an editor is supplied, or throw whenever an editor is supplied and the user changes, each failing it; a handoff spec in the documented shape where a comment save started through the copied composer has finished before capture, and a document edited after a thread was created and that thread reach Bob's editor with their original authors while Bob's next write is Bob's.
  Closed by `docs/plans/artifacts/2026-10-07-suggestions-review/build/use-create-editor-user-after-a1.log`, `docs/plans/artifacts/2026-10-07-suggestions-review/build/discussion-user-specs-a2.log`, `docs/plans/artifacts/2026-10-07-suggestions-review/mutate/hook-keys-raw-user-a1.log`, `docs/plans/artifacts/2026-10-07-suggestions-review/mutate/hook-drops-supplied-editor-a1.log`, `docs/plans/artifacts/2026-10-07-suggestions-review/mutate/hook-skips-user-key-for-supplied-editor-a1.log` and `docs/plans/artifacts/2026-10-07-suggestions-review/mutate/hook-throws-for-any-supplied-user-change-a1.log`.
- [x] Make Comments create, reply and resolve read `editor.userId` and delete `currentUserId`. Proof: a spec where a thread's `userId` equals a suggestion's `authorId` in one editor, failing at base (`probes/base-controls-a2.log`), with a must-pass control where a reply issued through a root view records the owner's `userId`; a spec where an editor with no `userId` creates a thread authored `'local'`, failing at base, where `createThread` returns `invalid`; and Comments' actor read calls the Yjs warning helper, with a spec where a Comments-only editor with `YjsPlugin` and no `userId` warns once at its first comment, and a `mutate.mjs` run that requires the authored capability in the helper and fails it.
  Closed by `docs/plans/artifacts/2026-10-07-suggestions-review/build/comments-user-after-a2.log`, `docs/plans/artifacts/2026-10-07-suggestions-review/build/authored-spec-comments-a1.log`, `docs/plans/artifacts/2026-10-07-suggestions-review/mutate/comments-ignore-editor-user-a1.log` and `docs/plans/artifacts/2026-10-07-suggestions-review/mutate/warning-requires-authored-changes-a1.log`.
- [x] Migrate every writer of `runtime.userId`: the playground and `generate-rich-text-editor-value.ts` load `createAuthoredReviewDocument` with stable IDs; the version-history demo hands the value to a new editor per user; `discussion.spec.tsx` uses a handoff fixture; import copies one identity; of the two `AIChatPlugin.suggestions.spec.ts` cases, the accepted-edit case uses the same user and the proposing case gets Bob's edit from a second editor joined by Yjs. Proof: those specs, with the review-document and handoff fixtures matching the blocked rejection the switch produced (`probes/foreign-author-fixtures-a2.log`); Chromium playground with three authors and stable change IDs; Chromium version-history case where Bob reverts Alice; `git grep -E 'runtime\.userId|isNormalizing'` over live source finding only history. When a Plate spec cannot host the Yjs pair, the proposing case's claim narrows to the native decision it exercises, with a deviation row.
  Closed by `docs/plans/artifacts/2026-10-07-suggestions-review/build/ai-suggestions-yjs-pair-a3.log`, `docs/plans/artifacts/2026-10-07-suggestions-review/panel/diff-round-1/www-specs-a1.log`, `docs/plans/artifacts/2026-10-07-suggestions-review/proof/phase2-browser-a1.log`, `docs/plans/artifacts/2026-10-07-suggestions-review/proof/generate-rich-text-a1.log` and `docs/plans/artifacts/2026-10-07-suggestions-review/panel/diff-round-1/docx-benchmarks-after-a1.log`. Deviation: `generate-rich-text-editor-value.ts` hands the document between editors instead of loading `createAuthoredReviewDocument`, because its saved value carries random origin IDs either way (decision log).
- [x] Update every copied reader of "me" (`suggestion.tsx`, `comment.tsx`, `mode-toolbar-button.tsx`, `suggestion-toolbar-button.tsx`) to `editor.userId`, and fix the stale lint comment on `useCreateEditor`'s dependency list. Proof: their specs, and a discussion spec where an editor with no `userId` accepts a suggestion and posts a comment through the copied card, failing at base, where the decision throws and the composer is hidden.
  Closed by `docs/plans/artifacts/2026-10-07-suggestions-review/panel/diff-round-1/www-specs-a1.log` and `docs/plans/artifacts/2026-10-07-suggestions-review/build/discussion-user-specs-a2.log`. Deviation: the discussion spec cannot load at the run base, where `AuthoredPlugin` does not exist, so its failure before the fix ran on the post-Phase-1 freeze `418e4efb` instead (`docs/plans/artifacts/2026-10-07-suggestions-review/trail/round-2/discussion-phase1-run-a1.log`).
- [x] Run `plate-docs` on every docs page in `census/` that teaches `userId`, `currentUserId`, `DefaultAuthoredPlugin` or the `authored` factory, on the API references `content/docs/api/core.mdx`, which documents `createEditor`'s options, and `content/docs/api/react-hooks.mdx`, which documents `useCreateEditor`, and on `content/docs/(plugins)/(collaboration)/yjs.mdx`, Chinese twins included. The docs teach solo setups without `userId`, `userId` whenever more than one person writes, `enabled` while a session loads and the keyed handoff, with its capture step, for a user switch. They state that an editor with no `userId` writes as the local user `'local'`, which saved documents keep, that an editor with a Yjs plugin and no `userId` warns in development at its first write or comment because collaborators would share the local user, that a solo editor using Yjs only for persistence can pass any stable ID, and that `userId` is fixed for an editor's life and that a `userId` change drops the old editor's unsaved document and comments. They state that a comment change pending at the switch is missing from the new editor, and that saving the new editor's comments without a revision check can undo it in storage, restoring a removed thread or message included. They also state that a change of user throws when the app reuses the same supplied `editor`, and that a new editor cannot bind a Yjs namespace an earlier editor still holds (Native behavior). Run `best-api repair` for the `docs/vision/plate.md` sentence on the current reply identity and for `suggestion.mdx`'s rule against a second `authored(...)`. Proof: the `plate-docs` checks, `pnpm --filter www build:registry --check`, and `node .agents/rules/plate-next/scripts/sync-resources.mjs --check`.
  Closed by `docs/plans/artifacts/2026-10-07-suggestions-review/build/build-source-a2.log`, `docs/plans/artifacts/2026-10-07-suggestions-review/build/docs-parity-a1.log`, `docs/plans/artifacts/2026-10-07-suggestions-review/build/build-registry-check-a2.log` and `docs/plans/artifacts/2026-10-07-suggestions-review/build/sync-resources-check-a1.log`.
- [x] Keep, revert or quarantine Phase 2. Proof: the decision row in `docs/plans/2026-10-07-suggestions-review.decisions.tsv`.
  Closed by the Phase 2 keep row in `docs/plans/2026-10-07-suggestions-review.decisions.tsv`.

### Phase 3: one owner record for the editor's user (plan iteration 2)

Diff panel round 3 showed that a `userId` left configurable during construction lets a construction callback swap it before a view copies it, and that a nested `createEditor` on the same editor rewrites the recorded user before it is refused. The editor keeps one record of its user and construction phase, and `userId` is a fixed getter from the first admitted attempt. Plan rounds 14 to 16 added that a refused attempt owns no cleanup, that `createEditor` takes the editor and refuses any of its views, and that the public `userId` guarantee covers the editor and every view created after admission from the editor or from such a view; views created from a raw editor before its first admission, and their descendants, keep what they copied, because Plite copies a view's own properties from its source once and freezes it.

- [x] Replace `beginEditorUser` and `lockEditorUser` in `packages/platejs/src/lib/editor/editorUser.internal.ts` with one record per editor holding the user and a phase: constructing, built or failed. `applyEditor` admits an attempt immediately before its `try`, so a refused attempt runs no restore, candidate clear or settle. Admission refuses, before anything changes, an editor that is a view of another (`getEditorRuntimeOwner(editor) !== editor`) with `createEditor takes the editor, not one of its views`, an editor whose record is constructing with `createEditor cannot start while this editor is still being created`, and one whose record is built with `createEditor cannot rebuild an editor that was already created`; a failed record may be admitted again with another user. Admission then always defines `userId` as a non-configurable getter with no setter that reads the record through `getEditorRuntimeOwner`, which the engine allows again on Plate's own fixed getter and refuses on any other fixed `userId`, and writes the record as its last step. The admitted attempt settles the record as built on success, and as failed as the first statement of its `catch`, before `prepared.restore()`; that ordering carries no separate proof, and settling a missing record throws. `readEditorAuthor` reads the record through the runtime owner instead of `editor.userId`, so writes and comments through any view, the excluded ones included, stamp the editor's user, and a missing record throws. `useCreateEditor`'s JSDoc and `content/docs/api/react-hooks.mdx` say that any rebuild with the same supplied `editor` throws, StrictMode's second memo call included. Proof, specs that fail on round 3's tree `67959b5b45`: (S1) a construction callback that redefines `userId` and then creates a view is refused at the redefinition, while the view and a thread created through it record alice (finding 1, astra and sol); (S2) two caught nested `createEditor` calls inside the editor's `initialValue` callback throw the constructing message and the outer editor stays alice for writes and comments (finding 2); (S3) a caught nested `createEditor` inside a plugin stage leaves the outer construction to finish as alice (finding 2 at the plugin stage); (S4) a caught nested `createEditor` inside a plugin stage that passes a view of the editor being created throws the view message, and the outer construction finishes as alice (round 14's candidate-clear critical through a view); (S5) a supplied editor with a configurable `userId` accessor and setter ends with assignment refused through the editor and a later view (round 3 warning); (S6) a comment through a view created from the raw editor before admission records alice (opus round 3 warning). Cases for named mutants: (C1) two caught rebuilds of a built alice editor throw the rebuild message and the editor still stamps alice, which also passes on round 3; (C2) two caught constructions of a raw editor whose own `userId` is fixed and not Plate's both throw a `TypeError` and leave that `userId` unchanged. Must-still-accept: (C3) a construction through a view of a raw editor throws the view message and leaves the raw editor buildable as alice. Every earlier identity spec still passes. Separate `mutate.mjs` runs each fail the named case: defining the getter as configurable fails S1's redefinition assertion, removing the constructing refusal fails S2, removing the built refusal fails C1, moving admission inside the `try` fails S3, keeping the setter fails S5, writing the record before defining the getter fails C2, removing the view refusal fails S4, and keying `readEditorAuthor`'s lookup by the passed editor instead of its runtime owner fails S6.
  Closed by `docs/plans/artifacts/2026-10-07-suggestions-review/panel/plan-round-17/phase3-specs-on-round3-a1.log`, `docs/plans/artifacts/2026-10-07-suggestions-review/panel/plan-round-17/phase3-specs-after-a1.log`, `docs/plans/artifacts/2026-10-07-suggestions-review/panel/plan-round-17/platejs-test-a1.log` and the eight mutant logs, such as `docs/plans/artifacts/2026-10-07-suggestions-review/mutate/getter-configurable-a1.log` and `docs/plans/artifacts/2026-10-07-suggestions-review/mutate/author-read-by-passed-editor-a1.log`. C2 and C3 also fail on round 3's tree, because they assert the new refusal messages.
  Deviation (iteration 2 diff round 1): the JSDoc and docs no longer say that any rebuild with a supplied `editor` throws. They say that every rebuild after a build throws and that a StrictMode mount with a supplied `editor` throws in development. The second diff round of iteration 2 dropped their promise that an editor whose build threw builds again, because the retried editor keeps the failed attempt's `readOnly` and `maxLength`. The author-read mutant now reads `editor.userId` and fails S6 alone, and neither missing-record throw is reachable through `createEditor`, so neither has a proof. On the final freeze `5c307484` all eight mutants fail their cases again (`docs/plans/artifacts/2026-10-07-suggestions-review/mutate/author-read-by-own-property-a1.log`, `docs/plans/artifacts/2026-10-07-suggestions-review/mutate/getter-configurable-a2.log` and the other six at `a2`).
- [x] Keep, revert or quarantine Phase 3. Proof: the decision row in `docs/plans/2026-10-07-suggestions-review.decisions.tsv`.
  Closed by the Phase 3 keep row in `docs/plans/2026-10-07-suggestions-review.decisions.tsv`.

### Close

- [x] Changeset for `platejs` per `changeset`, and a registry changelog entry for the copied UI. Proof: the files and `node tooling/scripts/generate-ui-changelog-entries.mjs --check`.
  Closed by `.changeset/platejs-editor-user.md`, `apps/www/src/registry/changelog/entries/2026-10-07-editor-user.mdx` and `docs/plans/artifacts/2026-10-07-suggestions-review/build/changelog-check-a3.log`.
- [x] `pnpm brl` when exports changed, `pnpm --filter www build:registry`, and `pnpm check`. Proof: their logs.
  Closed by `docs/plans/artifacts/2026-10-07-suggestions-review/build/build-registry-final-a2.log` and `docs/plans/artifacts/2026-10-07-suggestions-review/build/pnpm-check-a2.log`, whose `barrels` step runs `pnpm brl` and passes. Its five failing steps fail the same way at HEAD, per the verify row.

## Close

### Reversals and deviations

- Plan iteration 2 skipped the `best-api-review` that the Build playbook requires before a plan iteration rebuilds a mechanism after its one replacement. It ran at this close, after the decision-trail review flagged the skip. Its Pursue verdict replaces Phase 3's record with a cut of the existing-editor input in the next iteration, `docs/plans/2026-10-07-suggestions-editor-input.md`.
- The owner's solo-mode review reversed this plan's first pick, under which an editor with no user would turn read-only and report the missing user. Such an editor now writes as the local user `'local'`. It also reversed the demo user IDs that the bug fix `docs/plans/2026-10-07-editorkit-missing-user.md` added, and that plan's Close records the reversal.
- Diff round 3 raised two critical findings against Phase 2's editor-user getter, which had already used its one replacement, so that mechanism went back to planning as plan iteration 2. Phase 3 replaced it with one record per editor that holds the user and a construction phase. Plan rounds 14 and 15 narrowed the claim. Views created from a raw editor before its first `createEditor`, and their descendants, keep the properties they copied, and Plate still stamps their writes and comments with the editor's user.
- After iteration 2's diff round, Phase 3's JSDoc and docs say that every rebuild after a build throws and that a failed build can be retried, instead of "any rebuild throws". The author-read mutant now reads `editor.userId` and fails S6 alone. Neither missing-record throw is reachable through `createEditor`, so neither has a proof.
- `generate-rich-text-editor-value.ts` hands the document between editors instead of loading `createAuthoredReviewDocument`, because its saved value carries random origin IDs either way.
- `AuthoredPlugin` exports a checked type annotation, because the package declaration build cannot print Plite's private plugin brand (TS4094). Open work tracks the repair.
- `editorUser.internal.ts` reaches `plitejs/internal` through the facade instead of a new lint exception. `AuthoredPlugin` joins the schema adoption audit's reviewed extend-stage list beside `HistoryPlugin` and `YjsPlugin`, whose stages also return a Plite factory.

### What landed

- `createEditor({ userId })` takes an optional user. An omitted or empty `userId` means the local user `'local'`, and a `userId` with a NUL character throws.
- `editor.userId` is a fixed string on the editor and on every view created after `createEditor` admits it, from the editor or from such a view. A view created from the raw editor before that, and any view created from it, keeps the property it copied, but its writes and comments still carry the editor's user. `editor.runtime` is gone.
- `createEditor` throws for an editor that is already built or still being built, and for a view of an editor. An editor whose build threw can be built again with another user, but it keeps the failed attempt's `readOnly` and `maxLength`, so the docs do not promise that retry.
- `AuthoredPlugin` replaces `DefaultAuthoredPlugin`, and `AuthoredPlugin.configure({ initialState: { retainHistory: true } })` keeps accepted history beside suggestions and AI. `platejs/authored` no longer re-exports Plite's `authored` factory and its type.
- Comments drops `currentUserId` and stamps threads, replies and resolutions with `editor.userId`.
- `useCreateEditor` builds a new editor when the normalized `userId` changes.
- An editor with a plugin keyed `yjs` warns once in development at its first write or comment as the local user.
- Copied UI reads `editor.userId`. Fourteen examples drop `userId: 'demo'`, the playground loads its three authors' suggestions as data, and the version-history demo hands the document to a new editor for each user.
- The docs, the Vision rule for the local user, a major `platejs` changeset and a registry changelog entry.
- A `/pstack:correct` pass took on the panels' repeated finding that a new test passed at base. `tooling/scripts/proof-worktree.mjs --expect-fail` refuses a run whose output lacks a case's failure line, so a case that passes at the base is refused even when other cases in its file fail, unless a longer case title that starts the same way fails. The verify command recipe, the `AGENTS.md` rules table and `docs/plans/topics/correct.md` name it, and running it stays rule-only. Its demonstration refused a case designed to pass at the base and accepted a sibling that fails there. No committed test in this run wrongly passed at base, because panels caught each instance as a plan claim, so the Corrections rule's past-mistake proof is partial.
- Delivery: commit `.agents/pstack/proof.mjs` and `.agents/pstack/mutate.mjs`, which the pstack sync staged and `HEAD` lacks, with or before `tooling/scripts/proof-worktree.mjs` and its test. The helper's command mode and those tests load `proof.mjs`, and the verify recipe cites `mutate.mjs`, so a commit without them turns `pnpm check` red. Another session's uncommitted work shares four of this run's files: the `--with`, `--dir` and `--name` modes of `tooling/scripts/proof-worktree.mjs`, the whole of `tooling/scripts/proof-worktree.test.mjs` before this run's cases, other rows and rules in `AGENTS.md`, and other lines of `docs/plans/topics/correct.md`. Committing those files commits that work too.

### Proof and its limits

- Phase 1: the authored, core and Comments specs fail at base and pass after; mutants that treat an empty user as named, accept NUL, warn without Yjs, warn for a named user or warn on every write each fail; the warning stays silent in production; the local-user typing sweep passes in Chromium in a base worktree (`docs/plans/artifacts/2026-10-07-suggestions-review/build/phase1-package-specs-a2.log`, `docs/plans/artifacts/2026-10-07-suggestions-review/build/warning-production-a1.log`, `docs/plans/artifacts/2026-10-07-suggestions-review/proof/typing-sweep-local-a1.log`).
- Phase 2: the identity, hook and Comments specs fail at base and pass after. The two new discussion specs cannot load at the run base, where `AuthoredPlugin` does not exist, so they ran on the post-Phase-1 freeze `418e4efb`, before Phase 2 gave the editor one user. Both fail there on their own assertions and pass after (`docs/plans/artifacts/2026-10-07-suggestions-review/trail/round-2/discussion-phase1-run-a1.log`). The hook mutants each fail their case (`docs/plans/artifacts/2026-10-07-suggestions-review/build/use-create-editor-user-after-a1.log`, `docs/plans/artifacts/2026-10-07-suggestions-review/build/discussion-user-specs-a2.log`, `docs/plans/artifacts/2026-10-07-suggestions-review/mutate/hook-keys-raw-user-a1.log`).
- Phase 3: the new editor-user specs fail on round 3's tree, 96 specs in four files pass after, and all eight mutants fail their named case on the final freeze `5c307484` (`docs/plans/artifacts/2026-10-07-suggestions-review/panel/plan-round-17/phase3-specs-on-round3-a1.log`, `docs/plans/artifacts/2026-10-07-suggestions-review/panel/diff-iter2-round-1/phase3-specs-after-lint-a2.log`, `docs/plans/artifacts/2026-10-07-suggestions-review/mutate/author-read-by-own-property-a1.log`).
- Final bytes: `pnpm check` passes 20 of 25 steps, and the 5 that fail fail the same way at HEAD. The links those failures keep from running pass on their own, except app type errors in two `next.config` files that another session is editing (`docs/plans/artifacts/2026-10-07-suggestions-review/build/pnpm-check-a2.log`, `docs/plans/artifacts/2026-10-07-suggestions-review/build/check-core-continue-a2.log`, `docs/plans/artifacts/2026-10-07-suggestions-review/build/www-later-links-a4.log`, `docs/plans/artifacts/2026-10-07-suggestions-review/build/build-www-ci-a1.log`).
- Final bytes in Chromium, in a base worktree with this run's files: the find spec, the playground's three authors with stable change IDs over two loads, bob reverting alice after the user switch, and typing with no user on eight routes (`docs/plans/artifacts/2026-10-07-suggestions-review/proof/final-browser-a1.log`).
- The construction benchmark stays within its frozen budget, about 0.1 ms more per one-block editor (`docs/plans/artifacts/2026-10-07-suggestions-review/bench/authored-construction-a3.log`).
- Limits: Chromium only. `tabbable-demo` and `editable-voids-demo` never mount an editor, at base or after. The AI suggestion pair joined by Yjs runs as an in-memory Plate spec, not in a browser. A supplied `editor` throws on a development mount under StrictMode. Views created from a raw editor before its first `createEditor` keep the properties they copied. The generated API reference still names `currentUserId` until the `HistoryApi` decision. `templates/**` keeps the v1 output CI generates. The playground's extra editor is unmeasured. The benchmark ran three interleaved runs on a loaded host.

- The review and the build read these inputs: `docs/research/decisions/authored-change-ownership.md`, `docs/research/review-records/2026-09-16-authored-writer-identity.json`, `VISION.md`, `apps/www/src/registry/examples/collaboration-demo.tsx`, `packages/platejs/src/yjs/react/YjsPlugin.tsx`, `packages/plitejs/src/yjs/core/controller-registry.ts`, `packages/platejs/src/features/comments/BaseCommentsPlugin.ts`, `packages/platejs/src/lib/editor/Editor.ts`, `packages/platejs/src/lib/editor/withPlite.ts`, `packages/platejs/src/react/editor/useCreateEditor.ts`, `packages/platejs/src/react/components/EditorContentView.internal.tsx`, `packages/platejs/src/lib/plugin/BasePlugin.ts`, `packages/plitejs/src/authored/format.ts`, `apps/www/src/registry/components/editor/comment.tsx`, `apps/www/src/registry/components/editor/import-toolbar-button.tsx`, `apps/www/src/registry/components/editor/plugins.ts`, `apps/www/src/registry/components/editor/html-export.tsx`, `apps/www/src/registry/examples/playground-demo.tsx`, `apps/www/src/registry/examples/discussion-demo.tsx`, `apps/www/src/registry/examples/version-history-demo.tsx`, `apps/www/src/registry/examples/find-demo.tsx`, `apps/www/tests/browser/runtime-read-regressions.spec.ts`, `content/docs/(plugins)/(collaboration)/suggestion.mdx`, `content/docs/(plugins)/(collaboration)/comment.mdx`, `content/docs/(plugins)/(collaboration)/discussion.mdx`, `docs/vision/plate.md`, `docs/research/decisions/suggestion-review-semantics.md`.

### Predicted benefits

- Held: no Comments store field or writer named `currentUserId` remains in `packages/platejs/src`.
- Held: no product file in `packages/platejs/src` or `apps/www/src` reads or writes `runtime` or `userId` through `Reflect`; only `editorUser.spec.ts` does, to prove the user cannot be reassigned.
- Held: `find-demo` and eight other routes type with no `userId` in Chromium, and no example or docs page passes `userId: 'demo'` (`docs/plans/artifacts/2026-10-07-suggestions-review/build/hard-cut-sweep-a1.log`).
- Held: `version-history-demo.tsx` keeps retained history through `AuthoredPlugin.configure`, with no resolver of its own.
- Held, with a cost: the playground mounts with no history skip and no user switch, but it builds one extra full editor per mount to stage the revisions, which is unmeasured and in Open work.

### Attention

Round 1 was reviewed by `codex:gpt-6.1-sol` at xhigh (`docs/plans/artifacts/2026-10-07-suggestions-review/trail/review-sol.md`). It found no critical flag and raised six warnings and one nit. The changes after iteration 2's first diff round had no code review, so diff rounds 2 and 3 reviewed them. The two gate substitutions became Defaults rows. The view guarantee was narrowed everywhere it appears. A paired typecheck cleared this run's files of the `next.config` errors. The global `CLAUDE.md` repair got its row.

Round 2 was reviewed first by Opus 5.5, same-family, because the Codex seat failed twice when the Codex login stopped accepting `gpt-6.1-sol` (`docs/plans/artifacts/2026-10-07-suggestions-review/trail/round-2/review-opus.md`). After the owner restored Codex access, `codex:gpt-6.1-sol` at xhigh reran it on the same frozen inputs and raised the same critical flag and warnings (`docs/plans/artifacts/2026-10-07-suggestions-review/trail/round-2/review-sol-a3.md`). Its critical flag was correct. The Build playbook makes a plan iteration that rebuilds a mechanism after its one replacement run `best-api-review` first, and iteration 2 skipped it. That review then ran. Its verdict is Pursue: cut the existing-editor input from `createEditor`, which no product, copied UI, example or docs caller passes, and collapse Phase 3's record to a fixed property. That work continues as the next iteration, `docs/plans/2026-10-07-suggestions-editor-input.md`. Its warnings are applied. The discussion specs now fail on the post-Phase-1 freeze before passing. The correct pass's past-mistake proof is partial. The Delivery bullet names the files shared with another session.

### Counts

The plan's 16 step boxes and 16 completion gates make 32 items: 29 done, 2 partial (the thermo review covers Phase 1 only, with the diff panels' code-quality lens on Phases 2 and 3, and the docs example coverage audit was skipped, each a Defaults row), 1 skipped (reflect, which runs once at the end of this run, after the next iteration), 0 blocked and 0 open.

### Open work

The eight items in `docs/plans/topics/suggestions.md` Open work, each with its owner and stop: the CI typing smoke, a Comments settled signal, `YjsPlugin` rebinding and StrictMode, the `AuthoredPlugin` and `HistoryPlugin` type debt, the `HistoryApi` API reference decision, the playground's extra editor, a raw authored descriptor beside Comments and the local user's label, and whether to cut the `editor` option. The mechanism review's Pursue answers the last one, and the next iteration builds the cut. The Codex login refused `gpt-6.1-sol` and `gpt-6-astra` for part of this close, and the owner restored access; the next iteration's arena ran on Opus, labeled same-family, and its panels run on the configured seats.

## Defaults

| Decision | Pick | Alternative | Word |
| --- | --- | --- | --- |
| What to do with the item the ledger returned | Review suggestions again, because its verdict is stale and its member files changed | Take another open item, or hold | next, or hold |
| What to do after this verdict | Write the plan on this page now, then build it | Stop at the verdict | hold |
| How the acting user changes | The user stays fixed while an editor lives; a new user gets a new editor, which cannot bind a Yjs namespace the old editor still holds | One user setting that apps can change while the editor runs | live user switch |
| How the web app typecheck counts for this change | It counts, because the chain stops only at the API reference check, which fails the same way before this change, and at two type errors in the web app config files another session is editing; no error names this change's files | Hold the change until the whole chain passes in this checkout | rerun www typecheck |
| How an app switches users | It captures the outgoing editor's document and comments and renders a new editor keyed by the user, except over a Yjs namespace the old editor still holds | The hook rebuilds the editor from its first value | rebuild on user change |
| What an app with more than one user renders while the session loads | No editor, through the hook's enabled option; without it the editor starts as the local user, comments and autosaves made before the user arrives are saved as the local user, and the hook replaces the editor when the user arrives, dropping unsaved work | Read-only content while no user is named | read-only while loading |
| Who the comment author is | Comments use the editor's user and lose their own current user setting | Comments keep their own current user setting | keep comment user |
| Where user names live | Comments keep the user directory | A new copied users plugin | users plugin |
| An editor with no user | It writes as one stable local user, so solo editors type and use AI with no setup | It turns read-only and reports the missing user, as this plan picked before the owner's solo-mode review | require user |
| The local user's ID | The fixed string local, stable across reloads so a solo author's own changes stay theirs | A random ID per editor | random local user |
| Collaboration without a named user | An editor with a Yjs plugin writes as the local user and warns once in development at its first write or comment | It refuses creation without a user, which blocks read-only viewers and one person using Yjs for persistence | refuse Yjs without user |
| An empty user ID | It means the local user | It is rejected when the editor is created | reject empty user |
| Rerun the architect arena for the solo default | No; the solo review compared five lanes, and the rest of the target stands | Run the arena on the revised target | architect |
| A change of user in the editor hook | The hook makes a new editor for the new user from the options passed, and the app hands off its work; reusing an editor the app supplied throws instead, and so does binding a Yjs namespace the old editor still holds | The hook refuses the change and keeps the old editor | refuse user change |
| Enhancing an existing editor through the editor hook | Kept as today, because round 7 found the cut's proof wrong and the owner decides the hook's build model in Open work; reusing one supplied editor throws on any rebuild, a change of user and StrictMode's second build in development included | Cut it from the hook and refuse it at run time | cut hook editor option |
| How apps keep history beside suggestions | Configure the one authored plugin that suggestions and AI use | A factory that takes the authored plugin as input | authored factory |
| Pending comment saves, drafts and composer text at a user switch | The handoff captures without waiting; a comment change still pending at the switch is not carried, and saving the new editor's comments without a revision check can undo it in storage, restoring a removed thread or message included; drafts and composer text do not carry over | A public Comments signal that settles once every queued save is published | add comments settled |
| Construction cost of the configurable authored plugin | Accept about a tenth of a millisecond more per editor, inside the frozen budget | Keep a plain native plugin with no Plate store | no plugin store |
| Who authors AI suggestions | The person who asked the AI | A separate AI author | AI author |
| The default demos that cannot type | The local user makes them type, and this plan removes the bug fix's demo user IDs | Keep the demo user IDs | keep demo users |
| Code-quality review of the Phase 2 and 3 code | The four diff panel rounds, which ran the same code-quality lens, stand in for a separate review | Run a separate code-quality review of that code | thermo review |
| The docs example coverage audit | Skipped, because the change adds one reader task, the user switch, which the hooks page shows | Run the coverage audit on every changed docs page | docs coverage |

## Panel gate

| Round | Seats | Reviewed | Critical | Result |
| --- | --- | --- | --- | --- |
| 1 | Opus, `gpt-6-astra` at xhigh, `gpt-6.1-sol` at xhigh | frozen commit `c1aa485a` | 2 applied | revised plan; round 2 reviews the changes |
| 2 | Opus, `gpt-6-astra` at xhigh, `gpt-6.1-sol` at xhigh | frozen commit `240884c0` | 2 applied | revised plan; round 3 reviews the changes |
| 3 | Opus, `gpt-6-astra` at xhigh, `gpt-6.1-sol` at xhigh | frozen commit `0e1dbdc5` | 1 applied | revised plan; round 4 reviews the changes |
| 4 | Opus, `gpt-6-astra` at xhigh, `gpt-6.1-sol` at xhigh | frozen commit `76936a6b` | 1 applied | revised plan; round 5 reviews the changes |
| 5 | Opus, `gpt-6-astra` at xhigh, `gpt-6.1-sol` at xhigh | frozen commit `911f8675` | 2 applied by removing the hook guard | narrowed claim; round 6 reviews the changes |
| 6 | Opus, `gpt-6-astra` at xhigh, `gpt-6.1-sol` at xhigh | frozen commit `c4e47eb1` | 2 applied by removing the save counter and cutting the hook's `editor` option | narrowed claim; round 7 reviews the changes |
| 7 | Opus, `gpt-6-astra` at xhigh, `gpt-6.1-sol` at xhigh | frozen commit `af24f717` | 1 applied by reverting the `editor` cut | narrowed claim; round 8 reviews the changes |
| 8 | Opus, `gpt-6-astra` at xhigh, `gpt-6.1-sol` at xhigh | frozen commit `59d79a59` | 1 applied by removing the Yjs advice | narrowed claim; round 9 reviews the changes |
| 9 | Opus, `gpt-6-astra` at xhigh, `gpt-6.1-sol` at xhigh | frozen commit `54adda8b` | 1 applied by stating the Yjs limit | narrowed claim; round 10 reviews the changes |
| 10 | Opus, `gpt-6-astra` at xhigh, `gpt-6.1-sol` at xhigh | frozen commit `7a1ffdfc` | 1 applied by narrowing the Yjs limit to `YjsPlugin` | narrowed claim; round 11 reviews the changes |
| 11 | Opus, `gpt-6-astra` at xhigh, `gpt-6.1-sol` at xhigh | frozen commit `80b25e0a` | none | loop ends; the owner's solo-mode review revises the plan, and round 12 reviews the revision |
| 12 | Opus, `gpt-6-astra` at xhigh, `gpt-6.1-sol` at xhigh | frozen commit `2a04e04c` | 4 applied by replacing the Yjs refusal with a warning | revised plan; round 13 reviews the changes |
| 13 | Opus, `gpt-6-astra` at xhigh, `gpt-6.1-sol` at xhigh | frozen commit `ba9c188f` | none | loop ends; warnings applied, the plan goes to its build |
| Diff 1 | Opus, `gpt-6-astra` at xhigh, `gpt-6.1-sol` at xhigh | frozen commit `5bcf2224` | 4 applied | diff round 2 reviews the fixes |
| Diff 2 | Opus, `gpt-6-astra` at xhigh, `gpt-6.1-sol` at xhigh | frozen commit `4a87bd26` | 3 applied | diff round 3 reviews the fixes |
| Diff 3 | Opus, `gpt-6-astra` at xhigh, `gpt-6.1-sol` at xhigh | frozen commit `67959b5b` | 2, against the editor user getter, which had used its one replacement | the mechanism goes back to planning as plan iteration 2 |
| 14 | Opus, `gpt-6-astra` at xhigh, `gpt-6.1-sol` at xhigh | frozen commit `49b09949` | 3 applied, one by narrowing the view claim | revised Phase 3; round 15 reviews the changes |
| 15 | Opus, `gpt-6-astra` at xhigh, `gpt-6.1-sol` at xhigh | frozen commit `0b19c468` | 1 applied by narrowing the view claim | revised Phase 3; round 16 reviews the changes |
| 16 | Opus, `gpt-6-astra` at xhigh, `gpt-6.1-sol` at xhigh | frozen commit `d958913c` | 1 applied | revised Phase 3; round 17 reviews the changes |
| 17 | Opus, `gpt-6-astra` at xhigh, `gpt-6.1-sol` at xhigh | frozen commit `3c0b4ce2` | none | loop ends; Phase 3 goes to its build |
| Iteration 2 diff 1 | Opus, `gpt-6-astra` at xhigh, `gpt-6.1-sol` at xhigh | frozen commit `64594b82` | none | loop ends; Opus's three warnings and five nits are applied, deferred or dismissed in the decision log |
| Iteration 2 diff 2 | Opus, `gpt-6-astra` at xhigh, `gpt-6.1-sol` at xhigh | frozen commit `734105b1`, the changes after diff 1 and the correct pass, which the decision-trail review asked for | 1 applied by loading `proof.mjs` only for a command | round 3 reviews the fixes |
| Iteration 2 diff 3 | Opus, `gpt-6-astra` at xhigh, `gpt-6.1-sol` at xhigh | frozen commit `b3482a20` | none | loop ends; five warnings and two nits applied |

## Evidence

Model: Claude Opus 5.5 (`claude-opus-5-5`) ran this review. Three Opus `how` explorers traced native authored attribution, Comments and copied UI, and collaboration readers with prior art; their replies and probes are saved under `docs/plans/artifacts/2026-10-07-suggestions-review/how/`. The lead verified the decisive claims at source and ran the proofs below. The explainer synthesis step of `how` was skipped, because this playbook replaces the `how` output with this page.

### Requirements

- Suggestions, accepted edits, AI proposals and comment actions attribute to the acting application user; authentication stays app policy (`content/docs/(plugins)/(collaboration)/comment.mdx` line 264).
- Hard law, `2026-09-16-authored-writer-identity` and `2026-10-04-authored-audit` (both Stop): every authored write, accepted or proposed, needs a non-empty author resolved once per write transaction; reads stay actorless; Plite never invents an anonymous author.
- Hard law, [plate.md](../vision/plate.md) lines 387-395 at `dc927288b2`: Plite's native authored capability owns suggestion semantics; Comments keeps its independent thread lifecycle; existing suggestions load through the complete `initialValue`, and initialization never replays edits under switched identities.
- Hard law, [plate.md](../vision/plate.md) lines 362-374 at `dc927288b2`, added on 2026-10-05 after the last review: "User records and the current reply identity live in the ordinary plugin store", and an authoritative import prepares document, comments, users and plugin state in a detached candidate editor swapped through a keyed remount.
- Comments works without suggestions, and suggestions work without comments (`2026-10-04-comments-audit`).
- Human and explicitly tracked AI edits use the same authored records; the AI proposal is owned by the initiating human ([plate.md](../vision/plate.md) lines 390-392 at `dc927288b2`; `docs/plans/2026-09-10-native-authored-changes-and-suggestions.md` line 259).
- The common setup must type. An editor that installs an authored-dependent kit cannot silently drop keystrokes.
- Explicit user constraint: the run was started with `/best-api-review next`, which runs the API review playbook in full.
- Explicit user constraint, typed mid-run: "hmm i dont like we need to put userId when not collaborating. AI could be used in solo mode. merge a new /best-api-review before continuing".

### Lanes

- **Keep the current design (Stop).** Loses. The two identities diverge with no error: `discussion.spec.tsx` passes with authored writes by bob and comments by alice, and the copied UI then colors a user's own suggestion by one ID and decides "mine" by the other. `DefaultAuthoredPlugin` reads an untyped path through `Reflect` ([PlateAuthoredPlugin.ts](../../packages/platejs/src/authored/PlateAuthoredPlugin.ts) lines 4-12). Its descriptor is frozen, so an app with `SuggestionKit` or `AIKit` cannot turn on `retainHistory`, and installing a second `authored(...)` throws a duplicate descriptor error (explorer 1, probes 5, 6, 9 and 10); `version-history-demo.tsx` lines 24-30 copy the private resolver to get it. `userId` is typed optional ([withPlite.ts](../../packages/platejs/src/lib/editor/withPlite.ts) lines 756-760) while every write requires it, and its JSDoc still names Yjs and combobox jobs that no live code has. The playground breaks the initialization law on every mount ([playground-demo.tsx](../../apps/www/src/registry/examples/playground-demo.tsx) lines 114-143).
- **The 2026-10-04 target as written: one typed session actor read by authored and Comments.** Its direction is right, but it is incomplete. It left open whether the actor can change while the editor runs, and it predates the 2026-10-05 law that puts the current reply identity in the Comments store. A settable shared actor needs change notification for copied UI and a rule for undo across authors; today a switch already blocks undo of the earlier author's edit (explorer 1, probe 8), and, from source, a Comments redo replays the original author (explorer 2). Superseded by the next lane.
- **One creation-time acting user (selected).** `createEditor({ userId })` stays the one input. It is fixed for the editor's life, so the illegal state of a history that changes author mid-session cannot arise, and copied UI needs no subscription. Comments stamps from it and loses `currentUserId`; this amends the 2026-10-05 sentence, whose source was the 2026-09-09 Comments choice of store fields over getter and setter methods ([2026-09-09-comments-package-data.md](2026-09-09-comments-package-data.md) line 118), not a decision to keep two actors. A user change renders a new editor, as authoritative import already does through a keyed remount. Users stay in the Comments store. The architect arena moved them to a copied plugin; the plan panel cut that move because it fixes no defect (Panel round 1 below).
- **Strongest deletion: delete `createEditor({ userId })`, `editor.runtime.userId` and the default resolver; apps install `authored({ authorId })` themselves.** Loses. It removes the `Reflect` read, but it keeps two inputs for one person, because Comments keeps `currentUserId`, and every app with suggestions writes a resolver. It also needs the same descriptor-composition repair the selected lane needs.
- **Comments owns the actor and authored reads it.** Loses. It couples suggestions and AI to Comments, which `EditorKit` does not install.
- **A shared users plugin with a current user and a directory, like BlockNote's `resolveUsers`.** Not now. The directory has one reader outside Comments, the discussion card, which composes Comments anyway. It reopens when a suggestion surface without Comments needs author names.
- **Move the actor into Plite.** Loses. Plite's resolver is already the neutral contract, and the session user is Plate product state.
- **Solo mode, require a user to write (this plan before the solo review).** Loses to the owner's constraint. A solo editor with suggestions or AI would need a `userId` that no other person ever reads.
- **Solo mode, kits supply a demo user (the solo explainer's pick).** Loses. A kit is a plugin list and cannot set `createEditor`'s user, so the kit's author would split from the `editor.userId` that Comments and copied UI read, and an app that composes plugins by hand would still need a user.
- **Solo mode, Plate defaults to the local user (selected).** The editor writes as `'local'` when the app names no user, and an editor with a Yjs plugin warns once in development at its first write or comment as the local user.
- **Solo mode, Plite accepts unauthored accepted writes (strongest deletion).** Loses. Two Stop verdicts keep one authored path for every write, and AI proposals in solo mode still need an author.
- **Solo mode, a random local user per editor.** Loses. The same person becomes a new author after each reload and can no longer amend their own pending changes (`authored.ts` lines 3457-3465).

### Proof

- Model level, `artifacts/2026-10-07-suggestions-review/proof/no-user-write.ts`, Bun from `packages/platejs` on the working tree at `dc927288b2`, no stubs, `BaseSuggestionPlugin` and the real `createEditor`: with `userId: 'alice'` the insert succeeds (`Base!`); with no `userId` it throws "An author ID is required for authored writes." Log `artifacts/2026-10-07-suggestions-review/proof/no-user-write-a2.log`, exit 0, which also prints that 338 package files loaded and none from `dist`.
- Browser, Chromium, `apps/www/tests/browser/runtime-read-regressions.spec.ts` "find: decorated input keeps exact history and follow-up typing", run against a `next dev` server in a fresh detached worktree at `dc927288b2` built by `tooling/scripts/proof-worktree.mjs --install`. At base the spec fails at line 39. The model keeps "This is editable text" without the typed "qwertyuiop", and the server log shows the authored error (`artifacts/2026-10-07-suggestions-review/proof/find-demo-typing-a1.log`, exit 1). The candidate control, the same worktree recipe with only `userId: 'demo'` added to `find-demo.tsx`, passes (`artifacts/2026-10-07-suggestions-review/proof/find-demo-typing-control-a1.log`, exit 0). `pnpm check` does not run the www browser specs (`tooling/scripts/check.mjs` line 137 lists them as manual), which is why this stayed red unnoticed.
- Census. A lexical search found 32 candidate setups; reading each in context found 20 broken sites (10 registry, 5 English docs and their 5 Chinese twins), the rest passing a user, read-only, or false matches (`artifacts/2026-10-07-suggestions-review/census/reply.md`). The bug fix repairs them.

### Architect

Three runners, Opus, `gpt-6-astra` at xhigh and `gpt-6.1-sol` at xhigh, each answered the same prompt (`artifacts/2026-10-07-suggestions-review/architect/prompt.md`), which stated the outcome and eleven must-answer cases and withheld the review's pick. An Opus cross-judge scored anonymized copies (`architect/judge/verdict.md`). The synthesis note is `architect/synthesis.md`.

- **Convergence.** All three chose one immutable `editor.userId`, deleted the `runtime` bag and Comments' `currentUserId`, moved user names out of the Comments package, loaded multi-author fixtures as data, and replaced a live user switch with a new editor.
- **Base.** The Opus candidate. The judge scored it 20, against 18 and 12, and the lead's scoring agreed. Its writable-mount check is the only one that sees writability, which Plate resolves in `EditorContentView.internal.tsx` lines 55-62 and 103-107; the other two required `userId` in the creation types unless `readOnly` was passed at creation, which rejects the shipped read-only `html-export.tsx` view. It keeps Suggestions' and AI's exact-descriptor dependency and adds retention through `.configure()`.
- **Grafts.** `useCreateEditor` refuses a changed `userId` (Astra), reversed in panel round 5, where the hook keys its editor on the user instead. Retention reaches native authored through a stage callback, so Plite's option type stays unchanged (judge). The removal inventory for the `authored` re-export (Astra). Comment composers render only with a user (judge side finding), reversed in the solo-mode review.
- **Rejected.** Creation-time typed requirements; a same-name Plate `authored()`; capability lookup instead of descriptor dependencies; factories for Suggestions, AI and kits; a React `UsersProvider` outside the editor; an acting user on `CommentMutationRequest`; a runtime rejection of raw Plite `authored`. Reasons are in the synthesis note.
- **Premises checked before the pick.** A configured Plate bridge over native authored installs beside a plugin that depends on it, and a second native `authored()` still throws (`probes/configured-authored-bridge-a2.log`). Bob's new editor reverts Alice's retained change after a reload, and `unavailable` without retention (`probes/retained-revert-after-reload-a2.log`). A handoff fixture and a review-document fixture both keep rejecting Alice's parent blocked behind Bob's dependent change, as the identity switch did (`probes/foreign-author-fixtures-a2.log`). All three probes loaded package source only.
- **Challenge delta.** Improved. The review kept user names in Comments and placed the missing-user failure "at setup"; the arena moved names to a copied `UsersPlugin`, put the failure at the writable mount, which the solo-mode review replaced with the local user, made `useCreateEditor` refuse a user change, which panel round 5 reversed, and turned the default authored descriptor into the configurable `AuthoredPlugin`.

### Panel round 1

Seats Opus, `gpt-6-astra` at xhigh and `gpt-6.1-sol` at xhigh reviewed frozen commit `c1aa485a`; their answers are `artifacts/2026-10-07-suggestions-review/panel/plan-round-1/seat-*.md`. Rows for each finding are in the decision log under phase `panel`.

- **Critical, applied (Astra, Sol; Opus as a warning).** The documented switch through the hook's dependencies rebuilt the editor from its first value and dropped the session's edits and comments. The plan now teaches a keyed handoff from the latest document and comments, the hook refuses a changed `userId`, and the handoff spec checks that a dirty document and a new thread survive.
- **Critical, applied (Astra, Sol; Opus as a nit).** A NUL-containing `userId` passed a non-empty check and still dropped keystrokes. The writable-content check now asks native `canPropose()`, which applies Plite's own author rule (`probes/can-propose-check-a3.log`).
- **Warnings, applied.** The stage-callback bridge was grounded before the build: retention reaches native authored, the stage runs once beside the dependency, and `tx.plugin(...).propose()` works, but the Plate plugin's own `activate` never runs, so the planned marker was dropped for the capability-and-`canPropose()` check (`probes/stage-callback-bridge-a1.log`; Opus, Sol). A throw at mount would unmount apps whose session loads after first render, so a missing author now makes content read-only and reports it (Opus). The check's file belongs to another session's uncommitted refactor, so a start gate picks the content component at build time and pre-edit copies are taken (Opus). The name `AuthoredPlugin` collided with Plite's re-exported type, so both Plite re-exports leave `platejs/authored` as a recorded facade exception (Opus). Identity commits only after construction succeeds, with a retry spec (Astra, Sol). The immutability gate now attempts mutation at runtime (Sol). Gates that passed at base were replaced (Opus). Decision controls and composers are gated on a user (Opus). The performance note counts the new plugin store (Astra, Sol). The pending-save race at a user switch is stated as a limit (Astra).
- **Warnings, applied by a cut.** Phase 3, the copied `UsersPlugin`, fixed no defect and contradicted the plan's own lane; it is cut and names stay in Comments (Opus, Sol). The AI proposing case keeps a real second editor joined by Yjs, and the accepted-edit case uses the same user (Opus).
- **Dismissed in part.** Making Comments actions throw without a user (Opus): `createThread` already returns a typed `invalid` result, and the gated copied UI no longer reaches that path.

### Panel round 2

The same three seats re-reviewed only the changes, frozen commit `240884c0`; answers are `artifacts/2026-10-07-suggestions-review/panel/plan-round-2/seat-*.md`.

- **Critical, applied (Astra, Sol; Opus as a warning).** A NUL-containing `userId` made content read-only but kept `editor.userId` set, so Accept and Reject stayed visible and failed. The fix moves to the producer: `createEditor` checks `userId` with Plite's own author rule, exported through `plitejs/internal`, so `editor.userId` is a valid author or nothing and every gate reads it. This also gives the content check a typed path, which Sol and Opus found the `canPropose()` probe lacked.
- **Critical, applied (Opus).** Throwing on any changed `userId` brought back the unmount for apps whose session loads after first render. The hook now throws only when it would hand back an editor whose user differs from the request, or replace one user's editor with another's; a no-user editor may be replaced when the session arrives. Docs teach `enabled` while loading and a keyed handoff to switch, and specs cover both, plus both alice to bob paths that Sol asked for.
- **Warnings, applied.** The handoff sample now shows the capture step, and its spec uses the same shape (Opus). The pending-save limit no longer promises recovery; drafts and composer text are named as dropped (Astra, Sol, Opus). The start gate names the shared read-only owner in the build tree, and the React spec mounts all three content variants (Astra, Sol, Opus). The facade exception claim is dropped, because `platejs/authored` is a curated list (Opus). The root-view reply case is a must-pass control, not a base failure (Opus). Two stale sentences are fixed (Opus).
- **Warning, applied with a receipt.** Astra and Sol asked for the construction comparison the architecture reference requires for a new store. `bench/construction-probe.ts` (Performance below) measured it before the build.

### Panel round 3

The same three seats re-reviewed only the changes, frozen commit `0e1dbdc5`; answers are `artifacts/2026-10-07-suggestions-review/panel/plan-round-3/seat-*.md`. The brief's opening line said "since round 1" while its change set named the round 2 to round 3 diff; the seats reviewed that diff.

- **Critical, applied (Astra, Sol; Opus as a warning).** Letting a dependency change replace a no-user editor rebuilt it from its first value, and a Comments-only editor accepts typing with no user, so text typed before the session arrived was lost. The hook now has one rule: with `enabled: false` it returns no editor; with no editor yet it makes one with the requested user; asked to give an existing editor a different user, including from no user and to no user, it throws whether or not the dependencies changed. Opus preferred rebuilding a no-user editor and stating the loss; a loud error beats a silent loss, so the rule throws.
- **Warnings, applied.** The construction probe now passes with a large-cohort control that adds a constant 20 ms, and Phase 1's exit reruns it on the real plugin, with the ledger row at `gate` until then (Astra, Sol, Opus). The pending-save limit says that with snapshot storage the new editor's next save drops the thread, and a public pending-save signal goes to Open work (Opus). Creation-time validation moved into Phase 1 with its NUL spec, and the author rule's owner is a Plite root module, because `plitejs/internal` cannot import `plitejs/authored` (Opus). The handoff sample fills its ref and handles a missing editor (Opus). Phase 2 keeps authored writes during construction stamped by reading the staged user (Opus side finding).

### Panel round 4

The same three seats re-reviewed only the changes, frozen commit `76936a6b`; answers are `artifacts/2026-10-07-suggestions-review/panel/plan-round-4/seat-*.md`.

- **Critical, applied (Opus).** The round 3 rule threw on every change of user, which brought back round 2's crash for apps whose session arrives after first render, and its throw unmounted the editor and the typed text with it, so it did not save the text it was added for. Rounds 2, 3 and 4 alternated between a crash and a silent loss; the rule now splits on whether the no-user editor holds work. An untouched no-user editor is replaced when the user arrives, an edited one throws, and any change away from a real user throws. This re-weighs round 2's critical (a frequent crash) against round 3's (a rare loss) and keeps both closed.
- **Warnings, applied.** The read-only state must reach the view that copied controls read, not only the DOM, so the spec checks `useEditorReadOnly()` and a disabled mark button (Opus). An empty `userId` means no user instead of a creation error (Opus). The construction-time staged read is replaced by defining `editor.userId` before plugins install as a configurable property, locked after success and deleted on failure, which also covers views made during construction; the vacuous normalization spec is dropped (Astra, Sol, Opus). The pending-save text now says apps can await their own saves, that Comments lacks only an aggregate signal, and that every pending change reverts, deletes included (Astra, Sol, Opus). The handoff sample fills its ref, waits for pending saves and fails loudly without an editor (Opus). The benchmark exit names a measured runner, an incumbent built from Plite's `authored()` and a median-of-three rule, and the mislabeled control is corrected (Opus).

### Panel round 5

The same three seats re-reviewed only the changes, frozen commit `911f8675`; answers are `artifacts/2026-10-07-suggestions-review/panel/plan-round-5/seat-*.md`.

- **Critical, applied by removing the mechanism (Astra, Sol, Opus).** The round 4 split still lost an edited no-user editor's text, now with a crash, because a render throw discards the editor; and "unchanged document" missed comment changes such as a deletion made with no user, which a rebuild from the first options would restore. The no-user-to-user rule had been redesigned in rounds 2, 3 and 4 without passing a round, so the guard leaves the plan instead of a fifth rule. `useCreateEditor` now keys its editor on the normalized `userId` as it keys on `id`: a change of user always yields a new editor for that user from the options passed, it never hands back an editor for the wrong user and never throws, and the claim narrows to say the hook does not keep the outgoing editor's work. The documented handoff passes it.
- **Warnings, applied.** The missing-user report fires once per editor in development, so a supported late-session load does not train teams to ignore it (Opus). The hook compares the normalized user, with a spec for `userId: ''` (Opus). The configurable-before-plugins step is dropped and `editor.userId` is defined once construction succeeds, because no construction-time reader was shown (Opus). The sample defines `savesInFlight` as a counter around the app's save adapter and says a queued save can still be pending; "reverts" became "can overwrite unless storage rejects the stale revision" (Astra, Opus). The mark-button check moved to a www spec beside the copied toolbar (Opus). The Brief now names the failure (Opus). `bench/construction-probe-a5-source-note.txt` records that only the probe's header comment changed after the a5 run (Opus).
- **Dismissed.** Opus's side finding that a manual load through `tx.value.replace` in an authored editor with no user throws: a whole-value replacement returns before the author resolver runs, which `packages/plitejs/test/authored-ingress-contract.test.ts` lines 136-164 prove with a resolver that throws if called.

### Panel round 6

The same three seats re-reviewed only the changes, frozen commit `c4e47eb1`; answers are `artifacts/2026-10-07-suggestions-review/panel/plan-round-6/seat-*.md`.

- **Critical, applied by removing the mechanism (Astra, Sol, Opus).** The sample's save counter resolved inside the app's save adapter, before Comments published the saved thread, so the capture missed every save in flight, not only a queued one; each seat reproduced the ordering, Opus with the real plugin. Round 5 had added the counter, so it leaves the sample, and the claim narrows to say that a comment save still pending at the switch is not carried. A public Comments signal stays Open work.
- **Critical, applied by a cut (Sol).** `useCreateEditor({ editor })` reran construction on the same raw editor, whose user cannot change, so keying could not promise a new editor. No repository call passes `editor` to the hook (`proof/uce-editor-option-a1.log`), so the option leaves the hook and `createEditor({ editor })` keeps it. The keying itself is unchanged.
- **Warnings, applied.** The empty-user spec now types into a Comments-only editor and switches between `undefined` and `''`, which a raw key fails (Astra, Opus). The Public API line, the Native behavior table, the hook's JSDoc and the docs step say a `userId` change drops the old editor's unsaved document and comments, including Comments state loaded outside an effect keyed on the editor, which also covers Opus's round 5 nit (Opus). For Yjs the claim narrows, because a new editor bound to the old editor's document throws while the old editor keeps its binding, so the docs teach a new document per user (Opus).
- **Warning, applied in part.** The Defaults alternative to the development-only report now names Opus's proposal, a report on the first attempted input in every environment. The pick stays, because read-only content takes no focus or text input to detect (inferred), and production users see the read-only content (Opus).
- **Nits, applied.** Phase 1's proof sentence, the construction-time readers named in Main changes and Phase 2, and the architect graft marked reversed (Opus).

### Panel round 7

The same three seats re-reviewed only the changes, frozen commit `af24f717`; answers are `artifacts/2026-10-07-suggestions-review/panel/plan-round-7/seat-*.md`.

- **Critical, applied by a revert (Sol; Astra and Opus as warnings).** Round 6's cut of `editor` from the hook was only proven by a type test, which an implementation that omits the type but still forwards the option passes, through an options variable or a spread. Round 6 had added the cut, so it is reverted and the claim narrows. With a supplied `editor`, a change of user reruns construction on that editor and throws "Plate plugins are fixed after model publication", as an `id` or dependency change already does (`probes/supplied-editor-reenhance-a1.log`), so the hook still never hands back an editor for the wrong user.
- **Warnings, applied.** The docs step names the API references for `createEditor` and `useCreateEditor`, which the census missed (Astra, Opus). A pending comment change, a removal or resolution included, is missing from the new editor, and saving that editor's comments can undo it in storage; the Brief, Defaults, sample and docs step say so (Opus). A Yjs editor gets a fresh document and binding for each new editor, a switch back to an earlier user's cached document included, and waits behind `enabled` while the session loads, which `probes/yjs-rebind-a1.log` checks with fresh-document controls (Sol, Opus).
- **Warning, deferred.** The hook never disposes the editor it replaces, so the old editor keeps its Yjs binding and subscriptions (Opus); it is Open work.
- **Nits, applied.** The empty-user spec names a `mutate.mjs` run that keys on the raw `userId`, and the Yjs-start claim cites the source that applies only received effects (Opus).

### Panel round 8

The same three seats re-reviewed only the changes, frozen commit `59d79a59`; answers are `artifacts/2026-10-07-suggestions-review/panel/plan-round-8/seat-*.md`.

- **Critical, applied by removing the mechanism (Opus).** Round 7's Yjs advice sent Yjs apps through `useCreateEditor`, whose `useMemo` factory runs twice under StrictMode in development, so a Yjs editor throws on its first mount, before any user switch (`probes/hook-strictmode-a2.log`, with a plain-editor control that mounts). The Yjs advice had been replaced once already, in round 7, so it leaves the plan and the claim narrows. Yjs editors stay outside the hook and come from `createEditor` outside render, as `yjs.mdx` and `collaboration-demo.tsx` already do. The hook's StrictMode double build predates this plan and is Open work.
- **Warnings, applied.** The supplied-editor throw now reaches the Public API line, the migration row, the loading default, the hook's JSDoc and the docs step, which cite `resolvePlugins.spec.tsx` line 941 (Astra, Sol, Opus). The round 7 fresh-document controls proved construction only; `probes/yjs-rebind-edit-a1.log` shows that a fresh document holding the room state accepts an edit and an empty one refuses edits until seeded, and the plan no longer teaches that remedy (Astra).
- **Warning, applied by reframing.** The dispose Open work had no working answer, because a hook that builds during render throws before any cleanup runs. It now asks who builds editors that claim outside resources, the root cause behind the supplied-editor and Yjs throws, and the plan and subject bullets match (Opus).
- **Nit, applied.** The round 7 probe's return switch failed against a document the no-user editor held, not an earlier Alice editor; one owner check decides both (Opus).

### Panel round 9

The same three seats re-reviewed only the changes, frozen commit `54adda8b`; answers are `artifacts/2026-10-07-suggestions-review/panel/plan-round-9/seat-*.md`.

- **Critical, applied as a stated limit (Opus).** Round 8's removal also deleted a fact that does not depend on the hook. A Plate editor's Yjs binding lasts the editor's life and has no public release, so a new editor on the same Yjs document throws even when `createEditor` runs outside render (`probes/yjs-rebind-a1.log`, `probes/yjs-rebind-edit-a1.log`). Because `userId` no longer changes in place, a Yjs app that switches users hits it. The Yjs advice already left the loop, so the plan adds no remedy. It states the limit in Hard cuts, Native behavior, the ledger, Defaults and the docs step, drops "as `yjs.mdx` teaches", and widens the Open work to every Plate editor built with a Yjs plugin.
- **Warnings, applied.** The supplied-editor exception now reads "reuses the same supplied `editor`", because a fresh supplied editor builds, and it reaches the last two rows that promised a new editor (Astra, Sol, Opus). Phase 2 step 2 adds a hook spec that reuses one supplied editor across a change of user, with mutations that drop the editor or skip the user key, in place of the `resolvePlugins` test, which never calls the hook (Sol, Opus).
- **Nit, applied.** The Defaults row that keeps the hook's `editor` option now gives its reason (Opus).
- **Side finding, deferred.** The docs do not say that a supplied editor fails on first mount under StrictMode; that predates this plan and is part of the Open work (Opus).

### Panel round 10

The same three seats re-reviewed only the changes, frozen commit `7a1ffdfc`; answers are `artifacts/2026-10-07-suggestions-review/panel/plan-round-10/seat-*.md`.

- **Critical, applied by narrowing (Sol, Astra, Opus).** Round 9 said no public release exists for a Yjs binding. Raw `yjs()` releases through the cleanup `editor.install` returns or a plugin slot, and a new editor then binds and edits the same document (`probes/yjs-release-a1.log`). Plate's `YjsPlugin`, which `yjs.mdx` teaches and the copied `CollaborationPlugin` builds on, installs only at creation and cannot sit in a slot, so it keeps the binding for the editor's life (`probes/yjsplugin-release-a1.log`). Every Yjs sentence now states that narrower limit, and the fresh-document clause is gone, so the plan adds no remedy.
- **Warnings, applied.** The limit reaches the Brief, the Public API line, the `editor.runtime` and switch rows, the switch Defaults, the hook's JSDoc and the docs step, which adds `yjs.mdx` (Sol, Astra, Opus). The supplied-editor spec runs outside StrictMode, checks the alice mount, and adds a fresh supplied editor that must return bob's editor, with a mutation that throws on any supplied editor (Opus).
- **Nit, applied.** The Defaults reason counts one round, round 7, that found the cut's proof wrong (Opus).
- **Side finding, deferred.** `YjsPlugin`'s install and slot errors do not say why they fail; that predates this plan and joins the Open work (Opus).

### Panel round 11

The same three seats re-reviewed only the changes, frozen commit `80b25e0a`; answers are `artifacts/2026-10-07-suggestions-review/panel/plan-round-11/seat-*.md`. No seat raised a critical finding, so the loop ends. The warnings and nits land in the solo-mode revision: the Yjs limit is one sentence in Native behavior, keyed to the `Y.Doc` and `rootName`, lasting as long as the document, drawn by how the binding was installed and citing the demo's install cleanup, and every other place points to it (Opus, Sol); the supplied-editor spec says "in the same mount after alice" and checks the fresh editor object (Opus); and the Open work asks whether a Plate plugin that claims an outside resource can be installed after creation, since every Plate plugin fails there (Opus).

### Solo-mode review

The owner typed "hmm i dont like we need to put userId when not collaborating. AI could be used in solo mode. merge a new /best-api-review before continuing". The review keeps the Pursue and changes one policy. An editor with no `userId` writes as the local user `'local'` instead of turning read-only. An Opus `how` explainer traced every reader of the acting user (`artifacts/2026-10-07-suggestions-review/how-solo/reply.md`). It argued for keeping a demo user in the copied kits instead; the review weighs that below.

- **Laws.** Plite never invents an author (`docs/research/decisions/authored-change-ownership.md`, Writer identity), and the 2026-09-16 Stop rejected optional authors inside the engine. A Plate default keeps every Plite write authored. The same section says Plate's default resolver reads the app's user and "A local example may use a stable demo identity"; Phase 1 step 2 repairs it to name the local user. `docs/vision/plate.md` lets Plate provide "product defaults". `VISION.md` line 90 asks packages for semantically neutral defaults; the local user names no person, and the owner's correction outranks the earlier reading that core must require one.
- **What changes for readers.** With the local user, typing, suggestion mode, AI proposals and Accept and Reject work in a solo `EditorKit` editor (`authored.ts` lines 774-788 and 3096; `AIChatPlugin.ts` lines 1258-1262). Because Comments reads `editor.userId` after Phase 2, solo comments work too, which the explainer showed a default alone would not give at base (`BaseCommentsPlugin.ts` lines 993-1002).
- **What it costs.** Saved documents keep `'local'` as the author of solo changes, so a signed-in user who later opens one sees them as another author's and cannot amend them (`authored.ts` lines 3457-3465). Collaborators who omit `userId` share one author and its same-author rules. With a Yjs plugin installed, the first write or comment as the local user warns once in development, and the docs tell multi-user apps to pass `userId`. Core may not import `yjs`, so the warning reads published plugin keys, which `docs/vision/plite.md` lines 104-106 keep for diagnostics. Multi-user Comments saved through a backend without Yjs, probably the most common Comments setup (inferred), shares the local user with no warning.
- **Cut.** The writable-content check, its start gate on another session's content component, the late-session read-only state and the no-user gating of copied controls all leave the plan.

### Panel round 12

The same three seats reviewed the solo-mode revision, frozen commit `2a04e04c`; answers are `artifacts/2026-10-07-suggestions-review/panel/plan-round-12/seat-*.md`.

- **Critical, applied by replacing the refusal with a warning (Astra, Sol, Opus).** The creation-time Yjs refusal failed four ways. It ran after the Yjs binding claimed its namespace, so a corrected retry on the same document threw (Opus, with Astra and Sol as warnings). It blocked read-only Yjs viewers, which the 2026-09-16 Stop keeps actorless (Opus). It refused one person using Yjs only for persistence (Sol, Opus as a warning). Comments-only Yjs editors passed it and shared the local user anyway (Astra, Sol as a warning). An editor created with a Yjs plugin and no user now builds and warns once, so it claims nothing early, blocks no reader and covers Comments-only editors. The claim narrows to a warning, and collaborators who ignore it share one author.
- **Warnings, applied.** The warning reads plugin names only as a diagnostic (Opus). Its proof runs `YjsPlugin` and a raw `yjs()` (Opus). Phase 1 step 3 names the bug fix's real docs edits, removes the five demo users set before it, regenerates the changelog output and reruns the eight-route typing sweep (Opus). The bug fix plan and the subject file no longer promise the read-only check or treat a no-user setup as a defect (Astra, Sol, Opus). The late-session Defaults row says what is saved as the local user (Opus). A discussion spec decides a suggestion and posts a comment with no `userId`, and the Writer identity repair moves into Phase 1 (Opus).
- **Nits, applied.** The lane count, the two places that still said Yjs document, the reversed graft and the `local` author label (Opus).

### Panel round 13

The same three seats re-reviewed only the changes, frozen commit `ba9c188f`; answers are `artifacts/2026-10-07-suggestions-review/panel/plan-round-13/seat-*.md`. No seat raised a critical finding, so the loop ends, and the warnings land without another round.

- **Warnings, applied.** A warning at creation fired for plain Yjs editors that never read the user, `yjs.mdx`'s setup and the collaboration demo included, and missed Yjs added as a dependency or through `editor.install`. The warning now goes through `DebugPlugin`, silent in production, at the first write or comment stamped with the local user while a published plugin is keyed `yjs`, and its proof covers direct, dependency, installed and Comments-only Yjs, with plain Yjs and a disabled plugin silent (Opus, Astra, Sol). The typing sweep gate counts the six routes that reach the editor plus `ai-demo` and `demo`, and names the other two as limits (Astra, Sol, Opus). `ai-demo`'s Comments user moves to the local user, so its identities stay one (Opus). The `userId` JSDoc and `core.mdx` move into Phase 1, and the Writer identity repair runs through `best-api repair` (Opus).
- **Nits, applied.** The selected lane, the Performance line and the Brief describe the warning; the AI page proof checks both languages and the `userId` lines; the bug fix plan reads in the future tense and states its six-route proof (Astra, Sol, Opus).
- **Side findings.** Multi-user Comments through a backend without Yjs shares the local user silently, now named in What it costs, and the 2026-09-16 record's reasons are named as costs the owner accepted (Opus).

### Performance

A pre-acceptance construction probe ran before the build: `artifacts/2026-10-07-suggestions-review/bench/construction-probe.ts`, Bun on package source (336 files, none from `dist`), interleaved rounds. Its budget, frozen before any candidate run, let the candidate median reach 1.10 times the incumbent median plus 0.05 ms in each cohort. The passing run is `bench/construction-probe-a5.log` (exit 0), whose own first line records load average 1.56 on 18 cores. On a one-block editor the stand-in bridge took 1.75 ms against 1.63 ms for the native descriptor, and 1.72 ms against 1.67 ms with a dependent plugin, about 0.05 to 0.12 ms more per editor. A known-bad bridge with a 1 ms stage failed that line. At 2,000 blocks the bridge sat within the cohort's noise of about 3 ms, and a known-bad arm that spent a constant 20 ms per build (420 ms over 21 builds, read back from the arm; its header calls it per-block, but it sizes the delay from the cohort, not from the loaded document) failed the line, so that cohort detects a cost of tens of milliseconds and no smaller. Earlier attempts are history: a1 and a2 used a fixed 12 ms or 1 ms large-cohort control that sat inside the budget, and a4's per-block control did no work because the stage runs before the document loads. The stand-in used a `Reflect` resolver, so Phase 1's exit reruns the probe against the real `AuthoredPlugin`; mount cost was not measured, and the limiter was not profiled. Phase 1 reran the same contract as the repository target `plate-authored-construction` (`benchmarks/editor/benchmarks/plate-authored-construction-benchmark.ts`), against the real `AuthoredPlugin` and Plite's `authored()` installed directly, each arm's median taken over three interleaved runs. On a one-block editor `AuthoredPlugin` took 1.42 ms against 1.34 ms, and 1.50 ms against 1.42 ms behind a dependent plugin, under limits of 1.52 ms and 1.61 ms. At 2,000 blocks both lines stayed within the cohort's noise, and both known-bad copies, with a 1 ms and a 20 ms stage, exceeded their lines (`bench/authored-construction-a2.log`, exit 0, load 2.8 to 4.5 on 18 cores; `a1` measured the same lines with a mislabeled ratio metric). The limiter of the 0.08 ms difference was not profiled. Per-keystroke work changes by a few constant-time lookups. The author resolver still runs once per write transaction (`packages/plitejs/src/authored/authored.ts` lines 774-788). Reading `editor.userId` resolves the owner and reads one `WeakMap` entry, and for the local user the resolver also reads a `WeakSet` and the installed plugin keyed `yjs` (`packages/platejs/src/lib/editor/editorUser.internal.ts`); the warning fires at most once per editor.

### Reconciled reviews and plans

- `2026-10-04-suggestions-audit`: supersedes. Its direction holds, but its target left actor mutability open, predates the 2026-10-05 Comments law, and missed the typing defect.
- `2026-09-23-suggestions-direct-delete-retained-selection` and the `2026-09-22-mixed-suggestion-selection-deletion.md` plan: retains. Their closed-set replacement rule is unchanged by this question.
- `2026-09-14-suggestions-initialization`: retains. Its target, loading suggestions without replay, is still unadopted in the playground, and this plan adopts it.
- `2026-09-16-authored-writer-identity` and `2026-10-04-authored-audit`: retains for the engine. The selected lane keeps write-time identity and actorless reads, and every Plite write still carries a non-empty author. The record's reasons against a generated author, fabricated attribution, weaker same-author rules and persistence on an implicit identity, also apply to the Plate default; the owner's solo-mode correction accepts those costs for editors with one writer.
- `2026-10-04-comments-audit`: retains its Stop on thread ownership; only the actor input moves.
- `2026-10-04-collaboration-audit`: retains. Yjs presence keeps its own cursor data and never read `userId` (explorer 3).

### Predicted benefits

The build's Close marks each one held or falsified.

- One identity input remains, so `git grep -n -w currentUserId -- packages/platejs/src` finds no Comments store field or writer.
- No `Reflect` read or write of `runtime` or `userId` in `packages/platejs/src` or `apps/www/src`.
- `find-demo` and every other `EditorKit` setup types in Chromium with no `userId`, and no example or docs page passes `userId: 'demo'`.
- `version-history-demo.tsx` keeps retained history without copying a resolver.
- The playground mounts with no `tx.history.skip()` replay and no identity switch.

### Proof limits

Source review, the runs above and the arena probes. The setup census was read in context; the caller census for the plan's cuts is lexical (`git grep -w`). Explorer 2's finding that a Comments redo replays the original author is from source, not run. Prior art covers the six local checkouts in the subject file; CKEditor 5's commercial users and track-changes packages were not read. The live-switch question has no product evidence either way beyond the demos and specs listed. The ledger reads this page stale at once, because four scope inputs (`packages/platejs/package.json`, `PlateContent.tsx`, `plite.tsx`, `entrypoint-dag.mjs`) carry another session's uncommitted pagination work and `docs/vision/plate.md` carries a staged 7-line insert at line 38; none touches identity code or the cited law.

## Open work

- Comments has no signal that settles once its queued saves are published, so a comment change pending at a user switch is not carried to the new editor. A counter around the app's `mutate` resolves before Comments publishes and does not help (panel round 6); Opus proposed an `api.settled()` over Comments' queues. owner: zbeyens, who decides whether Comments exposes one. stop: that decision is recorded in `docs/plans/topics/suggestions.md` Open work. Tracked in that subject file.

- Plate's `YjsPlugin`, which `yjs.mdx` teaches and the copied `CollaborationPlugin` builds on, installs only at creation and cannot sit in a plugin slot, so its Yjs binding holds its namespace for as long as the document exists and a new editor on that namespace throws, with or without the hook. Every Plate plugin fails the same way when installed after creation, and the errors do not say why. `useCreateEditor` also builds its editor inside `useMemo`, whose factory StrictMode runs twice in development, so an editor that claims an outside resource, a Yjs binding or a supplied `editor`, throws on its first mount there. The supplied-editor error also names `initialState`, not the rebuild (`probes/yjs-rebind-a1.log`, `probes/hook-strictmode-a2.log`, panel rounds 8 and 9). owner: zbeyens, who decides whether a Plate plugin that claims an outside resource can be installed after creation or in a slot and whether the hook builds editors outside render. stop: that decision is recorded in `docs/plans/topics/suggestions.md` Open work. Tracked in that subject file.

- `AuthoredPlugin` exports a checked `InternalBasePluginRuntimeExtension` annotation, and `HistoryPlugin` (`packages/platejs/src/lib/plugins/HistoryPlugin.ts` lines 48-51) an `as unknown as` cast, both transitional debt under `docs/vision/plate.md`. The package declaration build (tsdown with tsgo) cannot print Plite's private plugin brand (TS4094) even when `plitejs/internal` exports it, so the repair belongs to Plite's brand design or the declaration build. owner: zbeyens, who decides that repair. stop: a `platejs` package build passes with both exports inferred, recorded in `docs/plans/topics/suggestions.md` Open work. Tracked in that subject file.

- `api-reference:check` fails at base on `HistoryApi`, which `apps/www/api-reference.config.json` neither includes nor excludes (`build/api-reference-base-a1.log`), so the generated manifest still names Comments' `currentUserId`. owner: zbeyens, who records the `HistoryApi` decision. stop: the check passes and `pnpm --filter www api-reference` regenerates the manifest. Tracked in `docs/plans/topics/suggestions.md` Open work.

- The playground builds one extra full `EditorKit` editor per mount to stage its three authors' revisions, unmeasured. owner: zbeyens, who decides whether to measure the homepage mount or cache the revision values per locale. stop: that measurement or cache lands. Tracked in `docs/plans/topics/suggestions.md` Open work.

- A raw `plitejs/authored` descriptor with its own `authorId` can still sit beside Comments and split identity, and copied suggestion cards label the local user `local`. owner: zbeyens, who decides whether `applyEditor` asserts the authored descriptor and how copied UI names the local user. stop: those decisions are recorded in `docs/plans/topics/suggestions.md` Open work. Tracked in that subject file.

- `createEditor({ editor })` and `useCreateEditor({ editor })` accept an existing editor, and no code outside tests passes one (Opus, iteration 2 diff round 1, from a pattern search). That option alone needs Phase 3's construction phases, refusals and retry. With it, a retry keeps the failed attempt's `readOnly` (`docs/plans/artifacts/2026-10-07-suggestions-review/panel/diff-iter2-round-1/retry-readonly-probe-a2.log`) and, from source, its `maxLength`; the no-comments pass reports, without a run, that `id` and `lifecycleErrorSink` are ignored; and a development mount under StrictMode throws. owner: zbeyens, who decides whether to cut the option or keep it. stop: that decision is recorded in `docs/plans/topics/suggestions.md` Open work. Tracked in that subject file.
