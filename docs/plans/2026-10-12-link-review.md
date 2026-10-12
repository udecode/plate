---
review_scopes: [link]
verdict: pursue
review_basis: [2026-10-04-link-audit]
work_kind: implementation
review_commit: 5fc246c291edeab138ff656a567f6517c11c4844
review_inputs: [packages/platejs/src/features/link/lib/BaseLinkPlugin.ts, packages/platejs/src/features/link/lib/LinkRules.spec.tsx, packages/platejs/src/features/link/lib/BaseLinkInput.spec.ts, packages/platejs/src/features/link/lib/BaseLinkPlugin.spec.tsx, packages/platejs/src/lib/utils/isUrl.ts, packages/platejs/src/internal/utils/urlPolicy.ts, packages/platejs/src/react/features/link/LinkPlugin.tsx, packages/platejs/src/utils/plugins/ExitBreakPlugin.ts, apps/www/src/registry/components/editor/link.tsx, apps/www/src/registry/components/editor/link-toolbar-button.tsx, apps/www/src/registry/components/editor/link-toolbar.spec.ts, apps/www/src/registry/components/editor/floating-toolbar.tsx, content/docs/(plugins)/(elements)/link.mdx, docs/vision/plate.md, docs/vision/common.md, VISION.md, docs/research/review-records/2026-10-04-link-audit.json, docs/research/review-records/2026-10-01-link-destination-contract.json, docs/plans/4591-custom-isurl-must-override-internal-links.md]
review_upstreams: ['../tiptap@91c51be53c4655ef07e29ec489471524debfa0ca', '../lexical@dd5c41b13193efa9ab1574234d8593d2c9e4f988', '../ckeditor5@14e73cc31b869ce483bd8449f40b9102ac7746da']
---

# Links: one rule for which addresses are allowed

Status: executed: built and verified, waiting on your commit
Topic: link
Playbook: plan

**Pursue, superseding the 2026-10-04 target.** Link text recognition and link admission are crossed today, and that one mix-up causes four bugs measured on this checkout. `isUrl` is a "looks like a web address" heuristic meant to spot URLs in typed text, yet it also gates the toolbar and HTML import. So a default `tel:` link and an allowed `vscode://settings/editor` link are refused there, while Markdown import keeps `tel:`. Paste does the reverse. It recognizes text with the admission check, which accepts relative and hash URLs, so pasting `#top` makes a link. A typed `ftp://` URL followed by a space eats the space and leaves the URL selected. The 2026-10-04 review chose one `parseUrl` hook for every path, which would repeat the same mix-up. This review keeps two decisions. `allowedSchemes` decides which addresses the link feature writes and shows as active, and one recognition hook decides only which text the link feature's typing and paste rules turn into a link. This session was asked for the next item that does not conflict with the running authored work. `next` returned `editor-public-naming`, which renames the browser handle inside authored's own browser specs and touches `create-editor.ts`, which the authored fill plan is editing. `exports` rewires authored projection, which the authored redesign replaces. `markdown`, `autocomplete`, `layout` and `proof` are in flight. `conversion-boundary`, `media` and `html` share files or uncommitted work with authored or the list session. `link` is the first open item clear of them, and the scope it depends on, `model`, is closed. The plan below continues this verdict on the same page; its target came from an `architect` arena of three runners and a cross-judge (`docs/plans/artifacts/2026-10-12-link-review/architect/synthesis.md`), the plan panel's first round revised it, and it builds in three phases.

## Brief

### What will change?

Typing, pasting, the link form, imports and display all check links against one list of allowed address types. Phone and app links you allow work everywhere, and a refused address never eats your space or Enter.

### What could go wrong?

Apps must switch to the new link option. Review dropped two planned paste guards, so a #top copied as a link pastes as one. The form refuses www.example.com silently. Browser proof stops at Chromium.

## Teach

A link stores an address. Plate gets addresses from typing, pasting, the link toolbar, and HTML or Markdown import.

Today each place checks differently. A loose "looks like a web address" test, meant to spot URLs in typed text, also decides what the toolbar and HTML import accept. So allowed phone and app links get refused there, while Markdown keeps them. Paste uses the allow list instead, which accepts #top, so pasting #top makes a link. When typing hits a refused URL, the space vanishes and the URL stays selected.

The fix splits two questions. Plate asks "Is this text a link?" only when you type or paste. It asks "Is this address allowed?" from one list whenever the link feature saves or imports an address, and again when it draws a link. A saved link whose type you later stop allowing keeps its address and shows as plain text when next drawn.

## Public API

Apps configure which schemes are allowed and, when they need it, one recognition hook. The hook gets the built-in recognizer as its second argument, so an app maps its own words and keeps the default for the rest. `isUrl`, `getUrlHref` and `transformInput` go, with no alias. Whatever the hook returns still has to pass `allowedSchemes`.

```tsx before
// packages/platejs/src/features/link/lib/LinkRules.spec.tsx
getUrlHref: (url) =>
  url === 'example' ? 'https://example.com' : undefined,
```

```tsx after
// packages/platejs/src/features/link/lib/LinkRules.spec.tsx
parseUrl: (text, defaultParseUrl) =>
  text === 'example' ? 'https://example.com' : defaultParseUrl(text),
```

An insert needs no separate check, because `upsert` already refuses an address the rule does not allow. `api.validateUrl` goes.

```tsx before
// content/docs/(plugins)/(elements)/link.mdx
const { api } = editor.plugin(LinkPlugin);

if (api.validateUrl(url)) {
  editor.update.link.upsert({ url });
}
```

```tsx after
// content/docs/(plugins)/(elements)/link.mdx
editor.update.link.upsert({ url });
```

The copied toolbar submits without a skip switch and turns its draft into an address itself. `skipValidation` and the copied `forceSubmit` state go, because skipping `allowedSchemes` stored links that render without an `href`. A draft shaped like a host, such as `www.example.com` or `example.com:8080`, gets `https://`. A draft with a scheme, or one that starts with `/`, `#`, `?` or `.`, passes as typed. The toolbar refuses any other draft, such as `google`, and stays open. Editing a link keeps an unchanged address as stored, though `upsert` still refuses one that `allowedSchemes` no longer allows. A changed draft follows the same rule as a new one, so a relative link renamed to another file needs `./`, such as `./guide2.html`. Diff round 2 reverted this draft rule. The retry that round 1 added turned an unchanged address that `allowedSchemes` no longer allows into an `https://` one. [The toolbar draft iteration](2026-10-12-link-toolbar-draft.md) rebuilt the rule with no `https://` guess, which the after fence shows.

```tsx before
// apps/www/src/registry/components/editor/link.tsx
const { forceSubmit, newTab, text, url } = store.get();
const inserted = update.upsert({
  skipValidation: forceSubmit,
  target: newTab ? '_blank' : undefined,
  text,
  url,
});
```

```tsx after
// apps/www/src/registry/components/editor/link.tsx
const { newTab, text, url } = store.get();
const editedLink = editor.read.nodes.above({
  at: selection,
  type: linkPlugin,
});

if (editedLink && url === editedLink[0].url) {
  update.upsertText({ text: text || url, url });
} else {
  const draft = url.trim();

  if (
    !DRAFT_ADDRESS.test(draft) ||
    !update.upsert({
      target: newTab ? '_blank' : undefined,
      text,
      url: draft,
    })
  ) {
    return undefined;
  }
}
```

## Layer and owner

| Change | Layer (Plite or Plate) | Package | Why |
| --- | --- | --- | --- |
| One admission decision for link destinations | Plate | `platejs` (`features/link/lib/BaseLinkPlugin.ts`, private) | The link feature owns its URL policy; `urlPolicy.ts` keeps the role floor shared with media |
| Recognition hook and its default | Plate | `platejs` (`BaseLinkPlugin` state) | Product policy on which text is a link, not a Plite law |
| Toolbar draft rule | Plate copied UI | `apps/www/src/registry/components/editor/link.tsx` | The copied UI already owns the draft and its submit |
| Stored-URL law wording | Doctrine | `docs/vision/plate.md` | Say, for navigation only, that the schema holds the floor, the feature's writes and imports admit with configuration, and display rechecks it |

Nothing moves between entrypoints; `tooling/entrypoints/entrypoint-dag.mjs` is unaffected because no file is added or moved.

## Hard cuts and app migration

The Pursue verdict on the review the owner asked for clears these cuts (`.agents/playbooks/references/architecture.md`, Hard cut).

Deleted from `platejs`: the `isUrl`, `getUrlHref` and `transformInput` link state fields, `UpsertLinkOptions.skipValidation` and `UpsertLinkOptions.insertTextInLink`, `api.validateUrl`, the `ValidateUrlOptions` type and `read.findAutolink`, which becomes a private rule helper. Deleted from the copied UI: the `forceSubmit` state. Deleted inside the feature: `validateUrlWithOptions`, `MARKDOWN_HEADING_PATTERN` and the custom-`isUrl` special case for `/` and `#` URLs. Core `isUrl` stays exported, because Markdown paste routing still uses it.

Behavior that changes for apps:

- A typed or pasted token with an allowed scheme now links, such as `tel:+15551234` and `https://intranet`; before, only `scheme://` text with a dotted or localhost host, or `mailto:`, did. Placeholders such as `http://...` and `https://…` stay text.
- Pasting plain `#top` or `/docs/intro` stays text.
- Inside a link or after unfinished Markdown link source, a pasted URL stays text even when the clipboard also holds HTML, and other pastes go to the next handler, as today, so a mention or rich text keeps its content. A pasted `#top` or `/docs` whose clipboard HTML holds a link now becomes a link there; before, it stayed text. A pasted URL in a code block stays text, as today.
- HTML import keeps `tel:` and relative destinations, as Markdown import already did.
- `upsert` admits a destination without a scheme as relative, so `upsert({ url: 'google' })` stores a relative link that `upsert` refused before. The copied toolbar's draft rule, which the toolbar draft iteration rebuilt, refuses such drafts.
- `isUrl` can no longer refuse relative or hash destinations at `upsert`, the toolbar or HTML import, the explicit-entry half of the #4591 fix. Typed and pasted text never recognizes them by default, and an app's copied toolbar submit can refuse them. No package option replaces this half.
- Typing Markdown link source whose destination is `example.com` now makes a relative link, as Markdown import of the same text does.
- Typing Markdown image source whose destination is `https://example.com/a.png` stays text; today it leaves `!` followed by a link.
- With Markdown paste installed, GFM still links `www.example.com` and URLs inside pasted prose, as it does today. `parseUrl` governs only the link feature's own rules.
- `update.link.insert` and `update.link.wrap` refuse a refused URL and return `true` or `undefined`. `upsert` returns `undefined` when it refuses the URL or has no selection to link, among other cases; with a custom `wrapNodesOptions` whose wrap the schema refuses, it still returns `true`, after splitting and unwrapping links in the selection or without any change.
- Export writes the stored URL, as today, also for a link that the current `allowedSchemes` shows as inactive.
- Changing `allowedSchemes` while links are mounted reaches each link when it next renders, as today.

Callers that break, from the `git grep` of each removed name on 2026-10-12 outside plans and research: the link specs (`BaseLinkPlugin.spec.tsx`, `LinkRules.spec.tsx`, `BaseLinkInput.spec.ts`), `apps/www/src/registry/components/editor/link.tsx` and `link-toolbar.spec.ts`, `apps/www/src/__tests__/package-integration/core-runtime/editor-api-inference.contract.ts`, `apps/www/api-reference.config.json` (which lists `ValidateUrlOptions`), `content/docs/(plugins)/(elements)/link.mdx` and `link.cn.mdx`, `content/docs/api/utils.mdx` and `utils.cn.mdx`, `docs/editor-behavior/markdown-editing-spec.md` and `current-evidence.md`. Generated outputs that name them regenerate: the registry under `apps/www/public/r/` and `apps/www/src/__registry__/`, and `apps/www/src/generated/api-reference-manifest.json`, which the www typecheck compares with its source. The build reruns `pstack:blast-radius` before code moves.

An app that mapped display text moves the mapping into `parseUrl`:

```tsx
// before
LinkPlugin.configure({
  initialState: { getUrlHref: (text) => (text === 'example' ? 'https://example.com' : undefined) },
});

// after
LinkPlugin.configure({
  initialState: {
    parseUrl: (text, defaultParseUrl) =>
      text === 'example' ? 'https://example.com' : defaultParseUrl(text),
  },
});
```

An app that vetoed typed or pasted URLs with a custom `isUrl` returns `undefined` from `parseUrl`. To refuse a scheme at every link-feature entry and in display, it removes the scheme from `allowedSchemes`; exact editor fragments and generic node writes still keep such a stored destination, which renders inactive. To refuse relative or hash destinations in its toolbar, it refuses them in its copied `submit`. An app that normalized toolbar input with `transformInput` edits its copied `submit`. An app that checked `api.validateUrl` before inserting reads `upsert`'s return instead.

## Native behavior and proof

| Behavior | What changes | Proof surface |
| --- | --- | --- |
| Space after a URL the app does not allow | The space is typed, nothing stays selected, and the next typed character lands after the space | Package test (Bun, happy-dom); Chromium browser spec on the www link demo, model and DOM selection, five warm runs |
| Enter after a URL the app does not allow | The block splits, nothing stays selected, and typing continues in the new block | Package test; the same Chromium spec |
| Space after `tel:+15551234` | Autolinks, then types the space | Package test; the same Chromium spec |
| Paste of `#top`, `/docs/intro` or a URL `allowedSchemes` refuses | With only plain text on the clipboard, stays text through the next paste handler; with a link in the clipboard HTML, the usual paste imports it, so `#top` and `/docs/intro` become links and a refused URL keeps only its label | Package test through `insertData`, with and without `MarkdownPlugin`; native clipboard unproven |
| Paste of a URL that `parseUrl` recognizes and `allowedSchemes` allows, with plain and HTML clipboard data, after unfinished Markdown link source or inside a link | Stays literal text | Package test through `insertData`; Chromium spec through the native clipboard |
| Typed Markdown image source | Stays text | Package test |
| Toolbar submit of `www.example.com`, `google`, a label-only edit of `guide.html`, and edits of `guide.html` to `./guide2.html` and to `www.example.com` | Stores `https://www.example.com`; refuses `google` with the toolbar open; keeps `guide.html`; stores `./guide2.html` and `https://www.example.com`. Superseded by the toolbar draft iteration, which refuses `www.example.com` and guesses no `https://` | `link-toolbar.spec.ts`; Chromium spec submits through the floating toolbar |

## Main changes

- One private admission decision, the navigation role decision with `allowedSchemes`, runs at `upsert`, `insert`, `wrap`, every input rule, HTML decode, Markdown decode, render and `api.getAttributes`. `isUrl` no longer gates admission. Export writes the stored URL, as today. Both decoders share one refusal message that names the reason, each keeps its own `report` kind, and HTML import stores the trimmed URL the decision returns.
- Recognition runs only in the link feature's typing and paste rules: `parseUrl(text, defaultParseUrl)`, whose default links a whole token with an explicit scheme. A `scheme://` token also needs a host with a character other than a dot, and `http` and `https` need the `//`. A rule's `resolve` recognizes, prepares and admits read-only, so a refused URL never matches.
- `upsert`, `insert` and `wrap` prepare raw input and admit it. The rules pass `upsert` an href they already prepared, which preparing again leaves unchanged (`encode-idempotence-a1.log`), so no private writer is needed.
- A refused write in a rule's `apply` returns `decline()`, which discards the rule's selection change and delegates the original input. Inside a link, after unfinished Markdown link source, in a code block or over selected nodes, the paste rule inserts a recognized URL as typed, so clipboard HTML cannot build a link from it there, and passes other pastes on. When it does not recognize the text, or `upsert` refuses it, the next paste handler runs. The link-source check accepts what the old `/!?\[[^\]\n]*]\([^)\n]*$/` accepted and scans the block text before the caret in linear time.
- The Markdown typing rule skips image source, a `!` right before the `[`.
- A refused URL renders without an `href`, even when `defaultLinkAttributes` carries one. Render reads `allowedSchemes` when a link renders, as today.
- The Markdown-heading pattern check and the custom `isUrl` special case for relative and hash URLs go, because recognition never accepts relative or hash text by default.

## Decision ledger

| Surface | Current | Target | Owner | Reason | Adoption | Proof | Risk | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Link admission | `validateUrl` with `isUrl` at `upsert` and HTML decode; `allowedSchemes` alone at Markdown decode and render; none at `insert` and `wrap` | One decision, floor plus `allowedSchemes`, at every feature write, both decoders and render; export unchanged | `BaseLinkPlugin.ts` | Stored-URL law; probe sections 1 to 3 | Specs, docs, copied UI | Link specs failing at `HEAD` | Generic node writes and exact editor fragments keep any URL above the floor, shown inactive when refused | rearchitect |
| Link recognition | `isUrl` plus `getUrlHref` for typing; `validateUrl` for paste | `parseUrl(text, defaultParseUrl)` in the link rules, default scheme token with a real host, then admission | `BaseLinkPlugin.ts` state | Probe sections 4 and 5; `#4591`; `#4452` | Docs and spec migration | `LinkRules.spec.tsx` | Typed `tel:` and `https://intranet` now autolink; Markdown paste keeps its GFM links | rearchitect |
| `isUrl`, `getUrlHref`, `transformInput` options | Three hooks | Cut; `parseUrl` and the copied submit carry their jobs | `BaseLinkPlugin.ts`, `link.tsx` | Two ways to map text; a UI hook in the package | App migration above | `git grep` of each name | Apps using them break at type check; explicit-entry relative veto lost | cut |
| `skipValidation`, `forceSubmit` | Skip `isUrl` and `allowedSchemes` | Cut | `BaseLinkPlugin.ts`, `link.tsx` | Stores links that render without an `href`; no shipped setter | Copied UI | `link-toolbar.spec.ts` | None found | cut |
| Toolbar draft | `transformInput`, then `upsert` with `isUrl` | Copied submit: unchanged address kept, host-shaped draft gets `https://`, scheme or path passes, other drafts refused; reverted in diff round 2 and rebuilt by the toolbar draft iteration | `link.tsx` | `upsert` admits relative text; `toolbar-draft-a1.log` | Copied UI | `link-toolbar.spec.ts` | A new or changed `guide.html` draft becomes `https://guide.html`; relative needs `./`; superseded: the toolbar draft iteration refuses `guide.html` and guesses no `https://` | rearchitect |
| `insertTextInLink` | `upsert` option that inserts raw text inside a link | Cut; the paste rule inserts text itself | `BaseLinkPlugin.ts` | Its one caller was the paste rule; a second way to insert text | Specs, docs | `git grep` of the name | An app passing it gets a type error | cut |
| `api.validateUrl` | Public check | Cut; `upsert` returns the refusal | `BaseLinkPlugin.ts` | No consumer outside docs, specs and a type contract | Docs, contract file | Typecheck | An app that pre-checks reads `upsert`'s return | cut |
| `read.findAutolink` | Public read | Private rule helper | `BaseLinkPlugin.ts` | Only the link rules call it | None | `git grep` | None found | cut |
| `insert`, `wrap` | Write any URL above the floor | Prepare and admit like `upsert`; return `true` or `undefined` | `BaseLinkPlugin.ts` | Bypass of the one decision | Specs | `BaseLinkPlugin.spec.tsx` | Return type changes | rearchitect |
| Input rule refusal | Consumes the space or Enter and leaves the URL selected | `resolve` admits; `apply` returns `decline()` on refusal | `BaseLinkPlugin.ts` | Input-rule law | None | `LinkRules.spec.tsx` | None | rearchitect |
| Paste guard contexts | Literal insert of text `validateUrl` accepts in code blocks, inside links and after unfinished Markdown link source | Inside links, after link source and in code blocks, recognized URLs only, as today | `BaseLinkPlugin.ts` | For a recognized URL, delegating would let HTML decode build a link in link source or beside the link (`paste-guard-a2.log`, `paste-context-a1.log`); other text there delegates, accepting that a `#top` with an HTML anchor becomes a link (`paste-guard-hash-a1.log`), so a pasted mention keeps its data; a real code block already keeps pasted HTML anchors as text | None | `LinkRules.spec.tsx` with mixed clipboard data for an `https:` destination, and a copied mention pasted inside a link and after link source | A pasted `#top` or `/docs` with a clipboard HTML link inside a link or after link source becomes a link | rearchitect |
| Markdown typing rule | Matches link source right after `!` | Skips image source | `BaseLinkPlugin.ts` | `image-source-a1.log` | None | `LinkRules.spec.tsx` | None | rearchitect |
| Mounted link activation | Reads `allowedSchemes` when a link renders | Unchanged | `BaseLinkPlugin.ts` | A subscription in the copied element re-rendered it but kept the `href` the package renderer already merged (`packages/platejs/src/react/utils/pluginRenderElement.internal.tsx:53-59`) | None | None | A policy change reaches a mounted link only when it next renders | keep |
| Schema validator | Navigation floor | Unchanged | `BaseLinkPlugin.ts` | Narrowing `allowedSchemes` must not fail loading documents that hold now-refused links | None | Existing specs | None | keep |
| Stored-URL law wording | One sentence binds configuration to the schema validator and rechecks output | For navigation: the schema holds the floor; the feature's writes and imports admit with configuration; display rechecks it; a refused stored URL stays stored, renders inactive and exports as stored. Other roles keep their wording | `docs/vision/plate.md` | Match the design; an export-time recheck would drop clipboard HTML on any reported loss and lose plain-text destinations without a report | Doctrine | `pnpm check knowledge` | None | keep |

## Steps

Phase 1 makes the package right; phase 2 moves the copied UI, docs and law; phase 3 proves it on the real surfaces. Each phase ends with a keep or revert decision row.

### Phase 1. One admission, one recognition, in the package

- [x] Load `plate-plugins`, `verify`'s testing reference and `.agents/pstack/rules/tests.md`; run `pstack:blast-radius` on the removed names. Proof: the skill invocations and the blast-radius answer saved under `docs/plans/artifacts/2026-10-12-link-review/blast-radius/`. Done: `docs/plans/artifacts/2026-10-12-link-review/blast-radius/answer.md`, census `docs/plans/artifacts/2026-10-12-link-review/blast-radius/census-a2.log`.
- [x] Write the public-boundary specs. Failing at `HEAD`, one per named defect: `upsert` admits `tel:` under defaults and `vscode://settings/editor` with `vscode` allowed; HTML import keeps `tel:` and `docs/page.html`; space and Enter after `ftp://example.com` keep the input and leave nothing selected; pasting `#top` stays text; typed `tel:+15551234` and space autolinks; a refused URL renders without a default `href`; `insert` and `wrap` refuse `ftp:`; typed Markdown image source whose destination is `https://example.com/a.png` stays text; pasting `#top` and `/docs/intro` with `MarkdownPlugin` installed stays text; typed Markdown source whose destination is `example.com/a%20path` makes a relative link. Passing at `HEAD` and kept: pasting a URL inside an existing link inserts the pasted text; a single line of plain and HTML clipboard data, for `https://example.com`, `#top` and `/docs/intro`, pasted after unfinished Markdown link source stays literal, and so does `https://example.com` in a code block; typed `http://...`, `https://…`, `http:foo` and `tel://` stay text; `#top` with an HTML anchor pasted inside a link stays text in that link; export writes a stored `ftp:` URL. Run them at `HEAD` in a detached worktree with `node tooling/scripts/proof-worktree.mjs --with` and `--expect-fail` on each failing case's title. Proof: `docs/plans/artifacts/2026-10-12-link-review/base-control-a<N>.log`, exit 0 with every failing title failing and the kept cases passing. Done: `docs/plans/artifacts/2026-10-12-link-review/base-control-a2.log`, the 22 named titles fail and the other 70 pass. Later reversed for `#top` and `/docs/intro` with clipboard HTML. Diff round 3 inside a link, and the toolbar iteration's plan round 2 after link source, keep only a recognized URL literal there, so a pasted mention keeps its data.
- [x] Build admission, recognition and the rule shapes in `BaseLinkPlugin.ts` as Main changes says, and cut the deleted surface. Migrate the existing specs that use removed names to `parseUrl` or cut the ones that test removed behavior. The original probes call deleted APIs, so their logs stay as the baseline and these specs replace a rerun. Proof: `bun test ./packages/platejs/src/features/link/` passes; `pnpm --filter platejs typecheck` passes; `git grep` of each removed name on live source is empty. Done: `docs/plans/artifacts/2026-10-12-link-review/link-specs-a1.log` and `docs/plans/artifacts/2026-10-12-link-review/platejs-typecheck-a1.log`.
- [x] Phase exit: keep or revert, logged as a `build` row with `built:` and the changed files. Done: kept, `built:` row in `docs/plans/2026-10-12-link-review.decisions.tsv`.

### Phase 2. Copied UI, docs and law

- [x] Through `plate-ui`, drop `forceSubmit` from `link.tsx`, add the draft rule to `submit`, and move `link-toolbar.spec.ts` off `forceSubmit` and `transformInput`. Proof: `bun test ./apps/www/src/registry/components/editor/link-toolbar.spec.ts` passes with submits of `www.example.com`, `example.com:8080` and `www.example.com#top` stored with `https://`, `google` refused with the toolbar open, a label-only edit of `guide.html` keeping `guide.html`, and edits of `guide.html` to `./guide2.html` and to `www.example.com` stored as `./guide2.html` and `https://www.example.com`. Done: `docs/plans/artifacts/2026-10-12-link-review/link-toolbar-a1.log`, 18 pass.
- [x] Through `plate-docs`, rewrite `content/docs/(plugins)/(elements)/link.mdx` and `link.cn.mdx` (options, `upsert` paragraph, plugin API table, the validate-before-insert example) and `content/docs/api/utils.mdx` and `utils.cn.mdx` (the `isSafeLink` example), with its example coverage audit. Proof: the docs checks `plate-docs` names and a rendered preview of the link page. `docs/plans/artifacts/2026-10-12-link-review/tb-check-docs-a1.log` runs `build:source` and the parity check on the final bytes, and `docs/plans/artifacts/2026-10-12-link-review/tb-docs-forward-a1.log` runs the link page's snippets on package source. Done: on a source-serving dev server from this checkout (port 3321, `devSource: true`), `/docs/link` renders the new option, toolbar, `upsert` and plugin API text with its preview editor loaded and no console error (`docs/plans/artifacts/2026-10-12-link-review/docs-link-preview-a1.jpg`), and `/cn/docs/link`, `/docs/api/utils`, `/cn/docs/api/utils` and `/docs/plugin-input-rules` serve the new sentences.
- [x] Reword the stored-URL paragraph in `docs/vision/plate.md` as the ledger's law row says, and update the autolink-heuristics and `getUrlHref` notes in `docs/editor-behavior/markdown-editing-spec.md` and `current-evidence.md` as the spec's opening section says. Proof: `pnpm check knowledge` passes. Done: on the final bytes, `docs/plans/artifacts/2026-10-12-link-review/tb-knowledge-a2.log` reports K7 findings only in `docs/plans/topics/emoji.md` and another session's tags files, and `docs/plans/artifacts/2026-10-12-link-review/tb-knowledge-head-a1.log` reports the same `emoji.md` finding at `HEAD`. The three Markdown-rule specs carry `[EDIT-INTERACT-LINK-AUTOMD-001]`.
- [x] Update `editor-api-inference.contract.ts` for the removed method and drop `ValidateUrlOptions` from `apps/www/api-reference.config.json`. Proof: `pnpm --filter www api-reference:check` and the www typecheck step of `pnpm check` that covers the contract file pass. Done: `api-reference:check` passes at the final source in `docs/plans/artifacts/2026-10-12-link-review/manifest-regen-a1.log`. The package-integration typecheck reports the same seven errors, on the `list` API key and the DOCX list round trip, in this checkout (`docs/plans/artifacts/2026-10-12-link-review/tb-www-pi-tsc-a1.log`) and at `HEAD` (`docs/plans/artifacts/2026-10-12-link-review/tb-www-pi-tsc-head-a1.log`), and none on the link assertion. The app typecheck's only errors are in another session's `import-toolbar-button.spec.tsx` (`docs/plans/artifacts/2026-10-12-link-review/tb-www-tsc-a3.log`).
- [x] Run `best-api repair` and `tooling/scripts/teaching-sweep.mjs` on the removed names. Proof: the sweep log under the run directory lists no live teaching hit. Done: `docs/plans/artifacts/2026-10-12-link-review/tb-teaching-sweep-a1.log`. Its one live teaching line, in `content/docs/(guides)/plugin-input-rules.mdx`, is rewritten. Its other live hits are this plan, the link subject, older plans for the deleted `packages/link` package, the private `findAutolink` rule helper, the registry entry's release note, and identifiers that only share words, such as `TransformInputRuleContext` and `isStoredUrl`. `docs/plans/artifacts/2026-10-12-link-review/tb-census-a1.log` finds no live file outside the planned set.
- [x] Through `changeset`, add the `platejs` changeset and the registry changelog entry for `link`. Proof: the changeset files and `changeset`'s check. Done: `.changeset/link-url-recognition.md`; the URL sentences of `.changeset/link-v54-runtime.md` and `.changeset/platejs-url-policy.md` amended; `apps/www/src/registry/changelog/entries/2026-10-12-link-draft-addresses.mdx`, with `generate-ui-changelog-entries.mjs --check` passing.
- [x] Run `pnpm --filter www build:registry`, then `pnpm --filter platejs build`, because `api-reference` packs the built `dist`, then `pnpm --filter www api-reference` last. The `platejs` declaration build reads the `plitejs` `dist` already present, which this run does not rebuild. Proof: `pnpm check registry-changelog`, `pnpm --filter www api-reference:check` and the generated-output steps pass. Done: `docs/plans/artifacts/2026-10-12-link-review/tb-build-registry-a1.log` and `docs/plans/artifacts/2026-10-12-link-review/tb-build-registry-check-a1.log` on the final bytes; `docs/plans/artifacts/2026-10-12-link-review/manifest-regen-a1.log` builds `plitejs` and `platejs`, generates the manifest and passes `api-reference:check` in a fresh worktree at the final source, and the checkout's link symbols equal that output.
- [x] Phase exit: keep or revert, logged as a `build` row. Done: kept, `built:` row in `docs/plans/2026-10-12-link-review.decisions.tsv`.

### Phase 3. Proof on the real surfaces and review

- [x] Add a Chromium browser spec beside `apps/www/tests/browser/link-floating-toolbar.spec.ts` on the www link demo route: native Space and Enter after `ftp://example.com`, each checking model text, model and DOM selection and a follow-up typed character; `tel:+15551234` and Space autolinks; a `www.example.com` submit through the floating toolbar, which moved to the toolbar draft iteration in diff round 2; a constructed paste event with plain and HTML data after unfinished Markdown link source stays literal. Run it five times warm without retries. Proof: five run logs under the run directory, each exit 0, plus one screenshot per case opened and described in a `verify` row. Done: `docs/plans/artifacts/2026-10-12-link-review/final-browser-link-a1.log` to `docs/plans/artifacts/2026-10-12-link-review/final-browser-link-a5.log`, five of five tests in each, and the `verify` row; the harness pastes through Chromium's native clipboard (`apps/www/playwright.config.ts:25`), not a constructed event.
- [x] Writing passes on the diff (`deslop`, then `no-comments`; `unslop` on docs and this plan), then the panel on the diff (reviews: api-build), then `pnpm lint:task` on the task's files. Proof: the `writing`, `panel` and `build` rows. Done: the `writing` and `panel` rows of all three diff rounds, and `docs/plans/artifacts/2026-10-12-link-review/tb-lint-task-a1.log`.
- [x] Run the `pnpm check` steps the diff reaches (core typechecks, knowledge, registry, review-ledger). Proof: each step's log. Done: `docs/plans/artifacts/2026-10-12-link-review/tb-platejs-typecheck-a1.log`, `docs/plans/artifacts/2026-10-12-link-review/tb-knowledge-a2.log`, `docs/plans/artifacts/2026-10-12-link-review/tb-registry-changelog-a1.log`, `docs/plans/artifacts/2026-10-12-link-review/tb-build-registry-check-a1.log` and `docs/plans/artifacts/2026-10-12-link-review/tb-review-ledger-a1.log`; the knowledge and review-ledger failures name only other sessions' files.

## Completion gates

| Gate | Applies | Artifact |
| --- | --- | --- |
| `pstack:blast-radius` before code moves | yes | `docs/plans/artifacts/2026-10-12-link-review/blast-radius/answer.md` |
| Hard cut sweep of removed names | yes | `docs/plans/artifacts/2026-10-12-link-review/tb-census-a1.log` |
| `best-api repair` | yes | `docs/plans/artifacts/2026-10-12-link-review/tb-teaching-sweep-a1.log`, `docs/plans/artifacts/2026-10-12-link-review/tb-docs-forward-a1.log` |
| `plate-docs` on the link and utils pages | yes | `docs/plans/artifacts/2026-10-12-link-review/tb-check-docs-a1.log`, `docs/plans/artifacts/2026-10-12-link-review/docs-link-preview-a1.jpg` |
| `changeset` | yes | `.changeset/link-url-recognition.md` and the registry entry `2026-10-12-link-draft-addresses` |
| `build:registry` and API reference manifest | yes | `docs/plans/artifacts/2026-10-12-link-review/tb-build-registry-check-a1.log`, `docs/plans/artifacts/2026-10-12-link-review/manifest-regen-a1.log` |
| `pnpm brl` | no: no file is added, moved or removed under an exported folder | skip: no barrel input changes |
| Benchmark | no: admission runs once per feature write or import; the paste rule reads the block text before the caret once per recognized URL paste, as the rule at `HEAD` did with a regex, and scans it in linear time; render already runs the same decision at `HEAD`; export gains no check | skip: not scale-sensitive |
| Writing passes | yes | the `writing` rows in `docs/plans/2026-10-12-link-review.decisions.tsv` |
| Panel on the diff (api-build) | yes | the `panel` rows of diff rounds 1 to 3 in `docs/plans/2026-10-12-link-review.decisions.tsv` |
| `pnpm lint:task` | yes | `docs/plans/artifacts/2026-10-12-link-review/tb-lint-task-a1.log` |
| Decision-trail review | yes: unattended run | `docs/plans/artifacts/2026-10-12-link-review/trail-review/seat-sol.md` |
| `review-ledger.mjs check` | yes | `docs/plans/artifacts/2026-10-12-link-review/tb-review-ledger-a1.log` |

## Defaults

| Decision | Pick | Alternative | Word | Impact |
| --- | --- | --- | --- | --- |
| Which item to take | Links, the first open item that touches none of the authored work | Neutral editor naming, which renames things inside authored's own browser tests | naming | big |
| How link addresses are checked | Two rules, one list for which addresses are allowed and one setting for which typed or pasted text counts as a link | One setting for both, as the last review picked | one setting | big |
| Which typed text links by default | Any word that starts with an allowed address type, such as https or tel, with a real host after the slashes (look) | Keep today's web-address test | web test | big |
| Links whose address type you stopped allowing | They keep their address, show as plain text once redrawn, and export as before (look) | Export drops the address and reports it | drop export | big |
| Text typed in the link toolbar | Moved to the toolbar draft iteration in diff round 2, which picks again | Save any text as typed | save as typed | small |
| Refusing relative links | No package switch; your copied toolbar can refuse them (look) | A switch in the one allow check | relative switch | small |
| Pasting with Markdown on | Markdown keeps turning www.example.com and URLs in pasted prose into links, as today (look) | Run the link hook on Markdown paste too | hook markdown | small |
| Where toolbar address cleanup lives | In the copied toolbar code apps own | A package setting | cleanup setting | small |
| The force-insert switch | Remove it, because it stored links that show without a working address | Keep it | keep force | small |
| The check-before-insert method | Remove it, because inserting already refuses a bad address (look) | A read that returns the allowed address | get href | small |
| Pasting "#top" or "/docs" | Stays plain text when you copied plain text; copied as a link, it pastes as a link | Keeps turning into a link | link paths | small |
| Pasted link label | Stays as today, the address when nothing was selected | The pasted words | pasted words | detail |
| Changing allowed address types while links are on screen | A link picks up the change when it next redraws, as today (look) | Redraw every link at once, which needs a change to the package renderer | live policy | small |
| The law sentence about stored addresses | Reword it so the safety floor stays in the schema, the allow list runs when the link feature saves or imports, and display checks again (look) | Move the allowed list into the schema | schema list | small |
| Shared generated files | Rebuild the registry and API reference from the whole tree, which can include other sessions' unfinished changes | Leave them stale for their owners | skip regen | small |
| Lint against a second HTML parser in Plate source | Blocks DOMParser by name, or read by name from any object, outside DOCX and tests, and names the existing parser; Reflect.get or a name held in a variable still gets through, and a line can still switch it off without a reason (look) | Also block those lookups, HTML parsed through a template element or a blank document, and require a reason to switch it off | ban dom html | small |
| What happens after this review | Write the plan and build it now, since it touches none of authored's files | Stop at this review | hold | big |

## Evidence

Model: claude-opus-5-5 at xhigh effort for the lead's reads, probes and synthesis; architect runners claude-opus-5-5 @high, gpt-6-astra @xhigh and gpt-6.1-sol @xhigh, and cross-judge claude-opus-5-5 @high, each through `cross.mjs` read-only.

### Requirements

- A stored URL meets one role policy at every admission through its feature's schema validator; configuration narrows or widens navigation schemes only above the script-capable floor; a conversion keeps a refused URL's label and reports the removal; output rechecks the same decision; no option bypasses the floor ([Plate vision](../vision/plate.md), stored-URL law, before this plan's rewording).
- Link validation and insertion stay in the link feature; core owns matcher primitives only (`docs/vision/plate.md`, matcher extraction heuristic).
- An input rule whose conversion does not apply delegates the original input with `decline()`; returning `undefined` consumes it (`docs/vision/plate.md`, input rules).
- Apps can map display text to an href, as `LinkRules.spec.tsx` maps `example` to `https://example.com`, and normalize toolbar input, as `BaseLinkInput.spec.ts` prefixes `https://`.
- An app can keep internal paths and anchors from becoming links (`#4591`, `docs/plans/4591-custom-isurl-must-override-internal-links.md`).
- The package has no floating store for link editing; the copied `link.tsx` owns show, hide and submit (`docs/plans/2026-09-04-decouple-link-floating-ui.md`).
- The owner asked for the next item that does not conflict with the running authored work.

### Findings

Runtime probe of [BaseLinkPlugin.ts](../../packages/platejs/src/features/link/lib/BaseLinkPlugin.ts) and [isUrl.ts](../../packages/platejs/src/lib/utils/isUrl.ts) on this checkout's source, `docs/plans/artifacts/2026-10-12-link-review/probe.ts`, logs `probe-a1.log` to `probe-a3.log` there. It ran `bun --preload ../../config/plite-source-aliases.ts` from `packages/platejs` and loaded 338 package files from `src`, none from `dist`.

- With default options, `upsert` refuses `tel:+15551234` and `validateUrl` returns false, though `tel` is in the default `allowedSchemes` (`probe-a3.log` section 1).
- With `vscode` added to `allowedSchemes`, `upsert` refuses `vscode://settings/editor` while render would give it an `href`. `vscode://file/a.ts` passes only because `a.ts` contains a dot that `isUrl` reads as a domain (section 2).
- HTML import drops the `tel:+15551234` destination with an `html-unsupported-content` warning; Markdown import of the same link keeps it (section 3).
- Typing a space after `see ftp://example.com` leaves the text without the space and selects offsets 4 to 21, the URL; `https://example.com` links and keeps the space (section 4).
- Pasting plain `#top` or `/docs/intro` makes a link; `# Heading` stays text only because of a dedicated heading pattern (section 5).
- The parallel tags session sent its own link probe; the lead reran it here (`docs/plans/artifacts/2026-10-12-link-review/peer-probe-a1.log`). Enter after `see ftp://example.com` leaves the paragraph unsplit with the URL selected; HTML import drops the relative `docs/page.html` while Markdown keeps it; a pasted `https://example.com/a b` stays text while `upsert` encodes and accepts it; with `getUrlHref`, typed `www.example.com` links but `upsert` refuses it.
- No shipped copied UI sets `forceSubmit`; only `link-toolbar.spec.ts` does. `api.validateUrl` has no caller outside the link feature, its specs, the docs and a type contract (`git grep` on `apps/www/src` and `packages`, 2026-10-12).
- Panel round 1 probes, each at `HEAD` in a clean detached worktree. Plain and HTML clipboard data pasted after unfinished Markdown link source stays literal with the link paste rule and becomes a link without it, so delegating there would regress (`paste-guard-a2.log`). With Markdown and GFM installed, pasted `www.example.com` and `Visit https://example.com` already become links outside the link rule (same log). Typed Markdown image source with the destination `https://example.com/a.png` and its closing parenthesis leaves `!alt` with a link, while relative `image.png` stays text only because `isUrl` refuses it (`image-source-a1.log`). The round-1 toolbar regex turned a label-only edit of `guide.html` into `https://guide.html` and missed ports and fragments; the revised rule keeps the edit and handles both (`toolbar-draft-a1.log`). Node's URL parser accepts the host `...` in `http://...` (`url-placeholder-a1.log`). Panel round 2 probe: plain `#top` with an HTML anchor pasted after unfinished Markdown link source stays literal with the link paste rule and becomes a link without it (`paste-guard-hash-a1.log`). Panel round 3 probe: without the link paste rule, an HTML anchor pasted into a real code block stays text, while one pasted inside a link becomes a sibling link (`paste-context-a1.log`).

### Lanes

- **Keep the current design.** Loses on the four measured defects above.
- **Patch each path.** Make HTML decode skip `isUrl`, teach `isUrl` about `tel:` and hostless schemes, and return `decline()` from the rules. Loses, because three overlapping hooks stay, five admission sites stay in step by hand, and every scheme an app adds needs an `isUrl` change too.
- **One `parseUrl` for recognition and admission (the 2026-10-04 target).** Loses. Decoders would run recognition on stored hrefs, and the default hook would have to either accept `/docs`, so typing `/docs ` autolinks, or refuse it, so HTML import drops relative links. It is today's mix-up under one name.
- **Two decisions (chosen).** `allowedSchemes` through the navigation role decision admits at every feature write and import and at render; one recognition hook, `parseUrl`, decides only which text the link rules turn into a link and maps it to an href. `isUrl`, `getUrlHref`, `transformInput`, `skipValidation`, `forceSubmit` and `api.validateUrl` go. Predicted benefits for the plan's Close to mark held or falsified: probe sections 1 to 3 admit `tel:` and `vscode://settings/editor` at every feature entry; section 4 keeps the space and leaves nothing selected; section 5 leaves `#top` and `/docs/intro` as text with no heading pattern; the link option surface drops from four URL fields to two.
- **Strongest deletion.** Delete every hook and build recognition in, with no app mapping. Loses the tested job of mapping display text to an href, and app-specific recognition such as internal short links; Tiptap and Lexical both keep an app hook for it.
- **A public URL helper shared by link and media.** Loses, because media checks other roles, and the 2026-09-07 extraction audit rejected a public URL helper.

### Design

The `architect` arena (reviews: api-plan) ran three runners on one task (`docs/plans/artifacts/2026-10-12-link-review/architect/task.md`) and an anonymized cross-judge. All three split recognition from admission and cut `isUrl`, `getUrlHref`, `api.validateUrl` and `skipValidation`. The judge scored Astra 24, Opus 21 and Sol 20; the lead took Astra as base with four grafts from Opus. The synthesis (`docs/plans/artifacts/2026-10-12-link-review/architect/synthesis.md`) records each graft and rejection. Probes run before the pick: input preparation is idempotent on eight inputs (`encode-idempotence-a1.log`); `decline()` discards the rule's prefix (`packages/platejs/src/lib/plugins/input-rules/InputRulesPlugin.ts:279-280`); the link paste rule runs before `MarkdownPlugin`'s paste handler (`paste-order-a1.log`). Two picks came only from the Codex-family runners. The plan panel's first round dropped one, the export recheck, because clipboard HTML is dropped on any reported loss (`packages/platejs/src/lib/plugins/html/HtmlPlugin.ts:3497`) and plain-text export cannot report one (`packages/platejs/src/lib/plugin/PlainTextNodeMapping.ts:5`). HTML serialize itself only warns on a lost attribute (`HtmlPlugin.ts:3280`). It kept the other, scheme-token recognition, with a host check against placeholders. The second round moved the paste guard ahead of recognition and dropped a planned subscription in the copied link element, which would have re-rendered it with the stale `href` the package renderer had already merged. The third round reverted the second round's relative-edit toolbar branch, which skipped the web-address rule, moved the inside-link paste check ahead of recognition, kept the code-block check after it, and cut `insertTextInLink`.

Ingress census, the object each path hands the admission decision: `upsert`, `insert` and `wrap` get the caller's raw string (toolbar draft, Markdown rule capture, autolink range text) and prepare it with `encodeUrlInput`; HTML decode gets the raw `href` attribute; Markdown decode gets the MDAST `url` the parser already normalized; render gets the stored `url`. Two writes skip the feature's admission and keep only the schema floor: generic node writes and exact editor fragments pasted through `packages/plitejs/src/dom/plugin/dom-clipboard-runtime.ts`. Render shows their refused URLs inactive.

### Dependents

- `distribution`: `packages/platejs/src/utils/plugins/ExitBreakPlugin.ts`. Unaffected, because it imports only the shared plugin-name map from `plate-keys.ts`, whose link entry stays.
- `editing`: `packages/platejs/src/utils/plugins/ExitBreakPlugin.ts`. Unaffected, for the same reason.
- `react`: `packages/platejs/src/react/features/link/LinkPlugin.tsx`. It wraps `BaseLinkPlugin` with `toReactPlugin`, so its state type follows the base plugin with no code change.
- `ui`: `apps/www/src/registry/components/editor/floating-toolbar.tsx`. Unaffected, because it reads only the copied link plugin's floating `mode`.

### Reconciled reviews

- This review supersedes `2026-10-04-link-audit`. Its findings and its `decline()` correction stand, but its single `parseUrl` for every path repeats the recognition and admission mix-up the probe measured.
- `2026-10-01-link-destination-contract` was already reaffirmed and corrected by the 2026-10-04 review; this review supersedes it for the same reason.
- This review retains `2026-09-18-recovered-2026-09-04-decouple-link-floating-ui`, because the no-floating-store rule holds and the copied UI keeps its flow.
- This review retains `2026-09-18-recovered-2026-09-07-full-plate-ui-extraction-audit`, because `upsert` stays the one place that prepares input.

### Proof limits

The probes ran once each, in Bun with happy-dom, against package source; no browser, real clipboard or copied UI ran. The other editors were read from source at the commits in the front matter and not run. `pstack:why` was not run on the heading pattern or the relative-URL special case; their history comes from the `#4591` plan and the `#4452` release note in `apps/www/src/generated/release-index.json`. After the build, the Chromium spec pastes through the native clipboard; Firefox, WebKit, Safari and native IME were not run.

## Close

Reversals and deviations come first.

- Reversal of the copied toolbar's draft rule. Phase 2 approved "submits of `www.example.com`, `example.com:8080` and `www.example.com#top` stored with `https://`, `google` refused with the toolbar open". Diff round 1 replaced that order with a retry, and diff round 2 reverted the retry, because a label-only edit rewrote an unchanged address the app no longer allows into `https://com.example.app:1234`. The toolbar iteration, [2026-10-12-link-toolbar-draft](2026-10-12-link-toolbar-draft.md), rebuilt the rule with no `https://` guess. The form now refuses `www.example.com` and `google` and keeps an unchanged address.
- Reversal of the paste guard inside a link. The approved guard kept any single plain line literal inside a link, and Phase 1 kept "`#top` with an HTML anchor pasted inside a link stays text in that link". Diff round 3 removed that half, because a copied mention pasted inside a link lost its reference. Only a URL that `parseUrl` recognizes and `allowedSchemes` allows stays literal there now.
- Reversal of the paste guard after unfinished link source. Phase 1 kept "a single line of plain and HTML clipboard data, for `https://example.com`, `#top` and `/docs/intro`, pasted after unfinished Markdown link source stays literal". The toolbar iteration's plan round 2 moved that check behind recognition for the same mention loss. A `#top` or `/docs` copied as a link now pastes as a link, there and everywhere else.
- Diff round 2 also reverted two round-1 fixes that no round had approved: `upsert` returning the wrap result, and a `DOMParser` check inside links.

What landed:

- One admission decision. `insert`, `wrap`, `upsert`, HTML import and render check a destination against `allowedSchemes` through the navigation decision, so `tel:`, relative links and allowed app schemes such as `vscode://settings/editor` work at each of them. A refused stored destination stays stored and renders inactive.
- One recognition hook. `parseUrl(text, defaultParseUrl)` replaces `isUrl`, `getUrlHref` and `transformInput` and decides only which typed or pasted text the link rules turn into a link.
- Hard cuts with no aliases: `api.link.validateUrl`, `ValidateUrlOptions`, `read.link.findAutolink`, `UpsertLinkOptions.skipValidation` and `insertTextInLink`, and the copied `forceSubmit` state.
- The rules decline on refusal, so Space and Enter after a refused URL type as usual, and typed image source stays text.
- The copied link form, through the toolbar iteration.
- Docs in English and Chinese, the stored-URL law in `docs/vision/plate.md`, the editor-behavior spec and evidence, the `platejs` changesets, the registry entry and payloads, and the type contract.
- A lint against a second HTML parser in Plate source, with its rules-table row in `CODING_STANDARDS.md`.

Proof, from each row's `scope:`:

- At `HEAD`, in a detached worktree, the 22 specs named for a defect fail and the other 70 pass (`docs/plans/artifacts/2026-10-12-link-review/base-control-a2.log`).
- On the final bytes, the toolbar and link package specs pass, 102 of 102 (`docs/plans/artifacts/2026-10-12-link-review/tb-final-specs-a1.log`), and the `platejs` typecheck passes (`docs/plans/artifacts/2026-10-12-link-review/tb-platejs-typecheck-a1.log`).
- Each review round's fixes failed their own spec when planted back or removed, through `mutate.mjs` on a frozen commit; the logs are under `docs/plans/artifacts/2026-10-12-link-review/mutate/`.
- Five warm Chromium runs of `apps/www/tests/browser/link-url-policy.spec.ts` on a source-serving dev server pass five of five tests each, with the clipboard pasted natively (`docs/plans/artifacts/2026-10-12-link-review/final-browser-link-a1.log` to `docs/plans/artifacts/2026-10-12-link-review/final-browser-link-a5.log`). One screenshot per case was opened, under `docs/plans/artifacts/2026-10-12-link-review/final-browser/run-5/data/`.
- `check:docs` and `build:registry --check` pass (`docs/plans/artifacts/2026-10-12-link-review/tb-check-docs-a1.log`, `docs/plans/artifacts/2026-10-12-link-review/tb-build-registry-check-a1.log`). The four link symbols in the API reference manifest equal a fresh generation from `HEAD` plus this run's changes (`docs/plans/artifacts/2026-10-12-link-review/manifest-regen-a1.log`). Nine list, indent and schema symbols differ, because the checkout's manifest holds other sessions' uncommitted changes to them and that generation does not.
- The rendered `/docs/link` page on the source-serving dev server shows the new toolbar sentence, and its preview editor loads (`docs/plans/artifacts/2026-10-12-link-review/docs-link-rendered-a1.txt`).
- A copied link whose label reads as a URL, `https://visible.example` with the address `https://b.example`, pastes as an editor fragment and keeps its stored address. The probe used a map instead of the real clipboard (`docs/plans/artifacts/2026-10-12-link-review/fragment-paste-a1-a1.log`).
- The lint refuses `DOMParser` by name and as a named property in every probe form and passes the two string lookups (`docs/plans/artifacts/2026-10-12-link-review/correct-domparser-bypass4-control-a1.log`, `docs/plans/artifacts/2026-10-12-link-review/correct-domparser-gate-a2.log`).

Only Chromium ran in a browser; Firefox, WebKit, Safari, mobile and native IME did not. Package proof runs in Bun with happy-dom. The lint misses `Reflect.get`, a name held in a variable, HTML parsed through a template element and a disable directive with no reason, as the `ban dom html` row accepts. The other editors were read from source, not run. `pnpm check` steps that fail in this checkout fail only in other sessions' files: knowledge on `emoji.md`, which fails the same way at `HEAD`, and the tags files; the review ledger on other plans; and the www typecheck on `import-toolbar-button.spec.tsx`.

The review read these inputs at `review_commit`: `packages/platejs/src/features/link/lib/BaseLinkPlugin.ts`, `packages/platejs/src/features/link/lib/LinkRules.spec.tsx`, `packages/platejs/src/features/link/lib/BaseLinkInput.spec.ts`, `packages/platejs/src/features/link/lib/BaseLinkPlugin.spec.tsx`, `packages/platejs/src/lib/utils/isUrl.ts`, `packages/platejs/src/internal/utils/urlPolicy.ts`, `packages/platejs/src/react/features/link/LinkPlugin.tsx`, `packages/platejs/src/utils/plugins/ExitBreakPlugin.ts`, `apps/www/src/registry/components/editor/link.tsx`, `apps/www/src/registry/components/editor/link-toolbar-button.tsx`, `apps/www/src/registry/components/editor/link-toolbar.spec.ts`, `apps/www/src/registry/components/editor/floating-toolbar.tsx`, `content/docs/(plugins)/(elements)/link.mdx`, `docs/vision/plate.md`, `docs/vision/common.md`, `VISION.md`, `docs/research/review-records/2026-10-04-link-audit.json`, `docs/research/review-records/2026-10-01-link-destination-contract.json` and `docs/plans/4591-custom-isurl-must-override-internal-links.md`.

Counts: 15 steps, 15 done, 0 partial, 0 skipped, 0 blocked, 0 open. The plan had three panel rounds and its diff three; the toolbar iteration's plan rounds 2 and 3 reviewed this review's last fixes.

The review ledger passes both link plans (`docs/plans/artifacts/2026-10-12-link-review/close-review-ledger-a1.log`); it still fails on seven older plans, six of them unchanged since `HEAD` and one another session is editing. Its next item is `editor-public-naming`.

Open work, tracked in the link subject's `## Open work`:

- `upsert`'s expanded branch throws in a code block, as it does at `HEAD` (`docs/plans/artifacts/2026-10-12-link-review/codeblock-head-a1.log`), and a range that ends inside a link unwraps the wrong half. The spec for these cases checks the return value and the commit, not the resulting document. owner: zbeyens. stop: task_52cc5e25 lands or the owner drops it.
- The DOCX exemption from the `DOMParser` lint covers more than DOCX's own parsing. owner: zbeyens. stop: task_30539621 lands or the owner drops it.
- Cmd+K on a selected word does not open the link form. owner: zbeyens. stop: task_bbdc15e4 lands or the owner drops it.
- The link form refuses a draft without a message. owner: zbeyens. stop: a report of a silent link-form refusal.
- `upsertText` is typed with `UpsertLinkOptions`, so it takes a `url` it does not read. owner: zbeyens. stop: the next link API review.

### Attention

reviewed by gpt-6.1-sol @xhigh

- The run froze the review packets before it rebuilt the registry, so no frozen tree held the new payloads. The panel read `link.tsx`, which the payloads copy, and `build:registry --check` shows the checkout's payloads match it.
- The Close claimed the whole API reference manifest matched a fresh generation. Only the four link symbols do, and the Close now says so.
- `upsert`'s code-block throw and wrong-half unwrap stay open, and the spec that covers them checks only the return value and the commit.
- Two of the reviewer's concerns did not hold: a copied link with a URL label keeps its stored address, and the paste rule reads the same block text `HEAD` read.

### Reflect

One Opus reviewer applied the judgment, tooling and divergent lenses to the whole session (`docs/plans/artifacts/2026-10-12-link-review/reflect/reviewer.md`), and the lead sorted the findings (`docs/plans/artifacts/2026-10-12-link-review/reflect/synthesis.md`).

- Applied without waiting: none. No finding fixes a helper that refuses a case its own rule allows with a fix the lead can show, or rewords a rule with no net words.
- Built: none. The two repeats of earlier reflect Backlog items, the in-flight flag in `review-ledger.mjs next` and `freeze.mjs` path reporting, need an owner call or go through sync-pstack.
- Backlog, owner: zbeyens, stop: the owner takes or drops each. A `proposed` review page counts as in flight, and the first stop writes it before research; the lead wrongly called the peer session's report of this a timing race. `decisions-check.mjs` refuses a verified row whose log has no `exit=` line. `lead.mjs` finds its session without a command marker. Generated outputs are rebuilt before a diff freeze and spliced back from a worktree instead of copied whole. `freeze.mjs` prints each path's delta size. The Close shape names a review's inputs before the fold. A warning fix that adds code is deferred by default, and a mechanism's replacements count across plan rounds. Paste claims get one probe per clipboard kind. A Close sentence copies its proof row's `scope:`. Drafting a step's code in a copy counts as its first edit. The verify notes gain the Playwright HTML reporter for passing-run screenshots, the `modelValue` shape and macOS Shift+Home. `RTK.md` sends list lookups through `rtk proxy` first.
- Rejected: reloading `verify` after a compaction, a run-the-typo rule, the typecheck chain note, a swap helper, an overlap recheck, `/pstack:correct`'s threshold and a base run before a "predates" brief, each already covered or not decision-changing, as the synthesis says.
- Side finding: icon-only toolbar buttons have no accessible name. owner: zbeyens. stop: task_06e9ad29 lands or the owner drops it.
