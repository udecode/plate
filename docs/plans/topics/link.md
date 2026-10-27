# Links

Page: https://claude.ai/artifact/5nHnMXT9CHZ4HkYsbmVxi8

How should link detection, editing, paste and navigation share one document contract? A link element stores one `url` that must clear the navigation floor in its schema validator, so no `javascript:`, `data:` or `blob:` destination is ever stored. The link feature checks every destination it inserts, wraps, imports or renders against `allowedSchemes`, and a stored destination the app no longer allows stays stored, renders inactive and exports as stored. One hook, `parseUrl`, decides which typed or pasted text becomes a link. The link input rules decline a refused URL, so the space, Enter or paste goes on as usual. HTML and Markdown import keep a refused link's label and report the lost destination. The package keeps no floating store, and the copied `link.tsx` owns the show, edit and submit flow (`docs/plans/2026-09-04-decouple-link-floating-ui.md`), including the rule that turns a typed draft into an address (`docs/plans/2026-10-12-link-toolbar-draft.md`). Linking selected text removes old links only where the selection covers them, then wraps it through Plite's inline wrap, which links from the first to the last selected character and refuses where a link cannot go (`docs/plans/2026-10-12-link-upsert.md`, `docs/plans/2026-10-12-link-upsert-edges.md`).

## Public API

The copied Link kit installs the plugin with its floating toolbar and the four input rules.

```tsx
// apps/www/src/registry/components/editor/link.tsx
export const LinkKit = [
  linkPlugin.configure({
    component: LinkElement,
    inputRules: [
      LinkRules.markdown(),
      LinkRules.autolink({ variant: 'paste' }),
      LinkRules.autolink({ variant: 'space' }),
      LinkRules.autolink({ variant: 'break' }),
    ],
    slots: {
      afterEditable: LinkFloatingToolbar,
    },
  }),
] as const;
```

Apps narrow or widen the allowed schemes above the navigation floor.

```tsx
// content/docs/(plugins)/(elements)/link.mdx
LinkPlugin.configure({
  initialState: {
    allowedSchemes: ['http', 'https', 'mailto', 'tel'],
  },
});
```

Copied UI in an editor that installs link passes that plugin's schemes to link's decision before it renders a stored address as a link.

```ts
// content/docs/(plugins)/(elements)/link.mdx
import { getLinkHref } from 'platejs';
import { LinkPlugin, usePluginStore } from 'platejs/react';

const allowedSchemes = usePluginStore(LinkPlugin, 'allowedSchemes');
const href = getLinkHref(url, { allowedSchemes });
```

The copied tag chip links its stored `url` only when that decision accepts it, with link's default schemes when the editor does not install link.

```tsx
// apps/www/src/registry/components/editor/tag.tsx
{readOnly && element.url ? (
  editor.plugin(BaseLinkPlugin).installed ? (
    <ConfiguredTagLink url={element.url}>{badge}</ConfiguredTagLink>
  ) : (
    <TagLink href={getLinkHref(element.url)}>{badge}</TagLink>
  )
) : (
  badge
)}

function ConfiguredTagLink({ children, url }) {
  const allowedSchemes = usePluginStore(BaseLinkPlugin, 'allowedSchemes');

  return <TagLink href={getLinkHref(url, { allowedSchemes })}>{children}</TagLink>;
}
```

One recognition hook maps typed or pasted text to an href. It gets the built-in recognizer as its second argument, so an app maps its own words and keeps the default for the rest.

```tsx
// packages/platejs/src/features/link/lib/LinkRules.spec.tsx
parseUrl: (text, defaultParseUrl) =>
  text === 'example' ? 'https://example.com' : defaultParseUrl(text),
```

An insert needs no separate check, because `upsert` refuses an address `allowedSchemes` does not allow and returns `undefined`. It also returns `undefined` where a link cannot land, such as a code block.

```tsx
// content/docs/(plugins)/(elements)/link.mdx
editor.update.link.upsert({ url });
```

Plite's inline wrap with `split` links from the first to the last character or inline void the selection holds, and returns `false` where the link cannot go.

```ts
// apps/www/src/app/(app)/examples/plite/_examples/inlines.tsx
tx.nodes.wrap(link, { split: true });
```

The copied floating toolbar keeps an unchanged address and sends any other draft that reads as an address to one `upsert`.

```tsx
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

## What other editors do

Read from each editor's source at the commits below; none was run. Each editor that ships autolink keeps two questions apart: which text counts as a link, and which destination may be stored or rendered.

| Editor | Which text becomes a link | Which destination is allowed | Where the allow check runs |
| --- | --- | --- | --- |
| Tiptap | linkify candidates filtered by `shouldAutoLink(url)` | `isAllowedUri(url, { protocols, defaultProtocol })` | HTML parse, render, `setLink`, `toggleLink`, autolink and paste |
| Lexical | `AutoLinkPlugin` matchers return `{ text, url }` | `validateUrl` on the link plugin; `sanitizeUrl` with a fixed protocol set on render | toggle and paste commands; render; anchor import keeps the href |
| CKEditor 5 | `AutoLink`'s URL pattern, then `defaultProtocol` for a bare address | `ensureSafeUrl(href, allowedProtocols)` | output conversion |

Sources: `ueberdosis/tiptap@91c51be53c4655ef07e29ec489471524debfa0ca:packages/extension-link/src/link.ts`, `facebook/lexical@dd5c41b13193efa9ab1574234d8593d2c9e4f988:packages/lexical-link/src/LexicalLinkExtension.ts`, `facebook/lexical@dd5c41b13193efa9ab1574234d8593d2c9e4f988:packages/lexical-link/src/LexicalLinkNode.ts`, `ckeditor/ckeditor5@14e73cc31b869ce483bd8449f40b9102ac7746da:packages/ckeditor5-link/src/autolink.ts`, `ckeditor/ckeditor5@14e73cc31b869ce483bd8449f40b9102ac7746da:packages/ckeditor5-link/src/utils.ts`.

Only Tiptap ships its link decision as a public function; CKEditor 5 exports its own under an internal name, and the others keep it on the link node or have none.

| Editor | Public function for a destination | Default schemes | Refused result |
| --- | --- | --- | --- |
| Tiptap `91c51be53` | `isAllowedUri(uri, protocols)` in `extension-link` | http, https, ftp, ftps, mailto, tel, callto, sms, cid, xmpp | falsy |
| CKEditor 5 `14e73cc31b` | `ensureSafeUrl(url, allowedProtocols)`, marked `@internal` and exported as `_ensureSafeLinkUrl` | the link package's default list | `'#'` |
| Lexical `dd5c41b13` | none; `LinkNode.sanitizeUrl` is a node method | fixed set on the node | `about:blank` |
| ProseMirror `prosemirror-schema-basic@6daea26` | none; the `link` mark validates `href` only as a string | none | not refused |
| Slate `945a484df` | none in the packages | none | not refused |

Sources: `ueberdosis/tiptap@91c51be53:packages/extension-link/src/link.ts` (line 167), `ckeditor/ckeditor5@14e73cc31b:packages/ckeditor5-link/src/utils.ts` (line 80) and its `index.ts`, `facebook/lexical@dd5c41b13:packages/lexical-link/src/LexicalLinkNode.ts` (line 166), `ProseMirror/prosemirror-schema-basic@6daea26:src/schema-basic.ts` (line 113).

## Layer and owner

| Change | Layer | Package | Why |
| --- | --- | --- | --- |
| `getLinkHref`, the navigation decision with link's default schemes | Plate | `platejs` root, `features/link/lib/BaseLinkPlugin.ts` | Link owns `allowedSchemes` and its default; root `platejs` is link's entrypoint (`docs/vision/plate.md:71-78`); a copied element that does not install link needs it, a cross-plugin job (`:1041`) |
| The role policy `decideUrl` and the floor | Plate | `platejs`, `internal/utils/urlPolicy.ts`, private | Media's roles stay private, as the 2026-10-04 link review decided |
| The chip's link | Plate copied UI | registry item `select-editor`, `tag.tsx` | The chip decides with link's function and an installed link plugin's schemes. Web and relative hrefs keep Next's link, which adds the base path and navigates in the app; other schemes render a plain anchor |

## Main changes

- `BaseLinkPlugin` owns the link schema, its HTML, Markdown and plain-text mappings, `upsert`, `upsertText`, `insert`, `wrap`, `unwrap`, `exitEnd` and the `LinkRules` input rules.
- One admission decision, the public `getLinkHref(url, { allowedSchemes })`, runs at `upsert`, `insert`, `wrap`, every input rule, HTML decode, Markdown decode, render and `api.getAttributes`, and copied UI outside link, such as the tag chip, calls it too. Export writes the stored URL. Link's default schemes are one private constant that `initialState` and `getLinkHref` share.
- Recognition runs only in the link feature's typing and paste rules, through `parseUrl(text, defaultParseUrl)`, whose default links a whole token with an explicit scheme. A rule's `resolve` recognizes, prepares and admits read-only, and a refused write in its `apply` returns `decline()`.
- Inside a link, after unfinished Markdown link source, in a code block or over selected nodes, the paste rule inserts a recognized URL as typed and passes other pastes on.
- `decideUrl` and `isStoredUrl` in `packages/platejs/src/internal/utils/urlPolicy.ts` own the navigation floor that link shares with media's own roles.
- The copied `link.tsx` owns the floating editor's state, show, hide, edit and submit, and its draft rule. Its `mod+k` shortcut names `trigger` with no handler, so Plate runs it on the view's command editor, which holds the selection.
- Plite's `tx.nodes.unwrap({ split: true })` splits an inline element that holds text at the range's edges and unwraps the selected piece, and unwraps the whole element at a caret or a point. `tx.nodes.unwrap` returns whether it changed the document.
- Plite's `tx.nodes.wrap` of an inline element over a range, with no `match` or `type`, tests the element that would hold the wrapper against the nodes it would move, through the internal schema helper `canWrap`, and stages nothing where nothing fits. With `split`, it wraps from the first to the last character or inline void the range holds and ignores `voids`. It leaves out an inline the range only touches and skips a block whose part of the range holds none. It stops short of a read-only inline at either end, though an inline around one can still move into the wrapper whole. A wrap with `match` or `type` gets neither rule and keeps its edge handling. When one match holds another, as `mode: 'all'` allows, the wrapper goes around the outer match.
- `BaseLinkPlugin`'s `unwrap` and `upsert` call Plite's unwrap and wrap on the live selection. Over a selection outside a link, `upsert` returns `true` only when the link lands, so the paste and typing rules decline a refused attempt and drop its unwrap.
- The copied `link.tsx` asks `editor.read.schema.allowsElementType` whether the selection's block can hold a link, so Cmd+K and the link button keep the form closed in a code block.
- The copied toolbar never reads editor or plugin state while it renders, because www builds with the React Compiler, which caches such a read on its receiver. `FloatingLinkUrlInput` and `FloatingLinkTextInput` read the store when the form opens, `LinkOpenButton` subscribes to the link under the caret with `useEditorSelector`, and the toolbar shows while `selectedLinkKey`, the subscribed key of the link under a collapsed caret, names a link (`docs/plans/2026-10-27-link-edit-toolbar.md`).
- Every way out of an open form goes through `api.closeForm()`: Enter, which ends `submit`, Escape, a click outside, focus moving from the form to another element, focus entering an iframe, and the editor taking focus, which the link plugin's `focus` handler sees. It drops the draft, goes back to the toolbar after an edit and hides the insert form, and it writes the store once. With no form open it returns `false` and changes nothing, so Escape on the toolbar alone still hides it. A blur to nothing keeps the form. No exit listens on the document, and the iframe check looks inside open shadow roots for the focused element.

## Open work

- The DOCX exemption from the `DOMParser` lint covers more than DOCX's own parsing. owner: zbeyens. stop: task_30539621 lands or the owner drops it.
- The link form refuses a draft without a message. owner: zbeyens. stop: a report of a silent link-form refusal.
- `upsertText` is typed with `UpsertLinkOptions`, so it takes a `url` it does not read. owner: zbeyens. stop: the next link API review.
- No browser test edits only a label through the real link form. owner: zbeyens. stop: a demo page gets a link whose address would change if saved again.
- A padded web URL cannot test trimming, because `new URL` trims it too, and two panels caught that; `verify`'s testing reference could say a normalization test picks an input no later step normalizes. owner: zbeyens. stop: the owner takes or drops it.
- The www browser tests, including both link Cmd+K tests, run in no blocking gate (`tooling/scripts/check.mjs` lists `test:www-browser:chromium` as manual, and no workflow runs it). owner: zbeyens. stop: the owner adds a browser lane to `pnpm check` or drops it.
- A refused wrap keeps the unwrap before it. A link command over a selection that holds a link and an inline a link cannot hold, such as a mention, unlinks the selected part of that link and does not relink it, through a direct call, the link form, or a URL pasted across blocks that links another block. The paste and typing rules drop a refused attempt. The Plite inlines example's Link button removes every link the selection touches when its wrap refuses. `HEAD` threw on the same calls. owner: zbeyens. stop: Plite gains a public read of whether a wrap fits, asked before the unwrap, or a report of a lost link.
- That public read would also cover four smaller gaps. The copied toolbar keeps the form closed in a preserved block of an unknown type, where a paste links. A path target without `split` or a selector skips the inline fit check, and a wrap with `match` or `type` gets none. `canWrap` checks types but not counts. The paste and Markdown link rules still name the code block. owner: zbeyens. stop: Plite gains a public placement read.
- With `keepSelectedTextOnPaste` off, a URL pasted over a selection that spans blocks links each block that can hold a link and replaces no text, as `HEAD` does for two plain paragraphs. owner: zbeyens. stop: a report, or the next link API review.
- Inside one link, `upsert` returns `true` even when the URL, target and text already match and it changed nothing. owner: zbeyens. stop: the next link API review.
- `upsert` still takes `insertNodesOptions`, whose `at` places a link inserted at a caret, and `children`, which it ignores. owner: zbeyens. stop: the next link API review.
- The range stops short of a read-only inline at either edge of the selection, though an inline around it can still move into the wrapper whole, and a wrap with `voids` inside a read-only block refuses where `HEAD` wrapped. No Plate element is read-only, and no caller passes `split` with `voids`. owner: zbeyens. stop: a read-only element type in Plate, a caller that wraps inline with `split` and `voids`, or a report.
- With `split` and `mode: 'all'`, a range inside an inline that the wrapper can hold wraps that whole inline, because the splits ignore `mode`, as they do at `HEAD`. Passing `mode` to the splits, as Slate does, would cut that inline at the range's edges. owner: zbeyens. stop: a caller that wraps with `split` and `mode: 'all'`, or a report.
- `link.wrap` still types and forwards `voids`, which the split wrap ignores. Cutting it is a hard cut. owner: zbeyens. stop: the owner cuts it, or a caller passes it.
- Benchmark's pre-acceptance probe has not run for the inline wrap's content range, and the final wrap was not timed; a timing check on an earlier version showed no measurable difference at 300 and 1000 paragraphs. owner: zbeyens. stop: a report of slow linking over a large selection, or the next change to Plite's inline wrap.
- Smaller wrap gaps: block wraps keep an edge move that can flip the range; a backward selection comes back forward; Plite fixtures for touched inlines with text between, an empty middle block and a void at an edge are missing. owner: zbeyens. stop: the next change to Plite's inline wrap, or a report.
- The render-read audit of the link toolbar plan lists 33 candidates outside the link toolbar in 18 copied files, in comments, discussion, footnotes, tables, lists, the table of contents, the AI preview and the static renderers. Each needs its compiled cache keys checked and a browser case that shows a stale value before a fix. owner: zbeyens. stop: the first candidate that shows a stale value in a browser.
- No check refuses a render-time read of editor or plugin state in copied UI, and the bun specs run without the compiler. Four link bugs came from such reads, and each would have failed such a check once 0231a088c4 removed the `eslint-disable` lines. owner: zbeyens. stop: the owner takes or drops its suggested task.
- Six findings of the link toolbar's thermo review wait for a refactor of the toolbar: one mode field, one floating hook, a rewrite of the shortcut's trigger, one input component, deleting `reset` and a toolbar derived from the store. owner: zbeyens. stop: a link toolbar refactor task.
- The link area has no generated check, so its specs stand in for one, and five warm runs replace its seed rounds. owner: zbeyens. stop: copied registry UI gets a generated check.
- The link shortcut opens no form in an editor mounted in a shadow root, and no route mounts one. owner: zbeyens. stop: a report of the link shortcut in a shadow-root editor.
- The link shortcut over a selection inside a link starts an edit mode with no form. Until Escape or the caret entering a link ends it, Insert link and the fixed toolbar's Link button do nothing and the formatting toolbar stays hidden (traced, not run). With the shortcut set to `ctrl+k` on macOS, a selection that runs from a link into the text after it reaches Plite's `ctrl+k` delete (probed), and so does one made while that mode holds (traced). Letting the key through to the editor over a selection inside a link made Plite delete that selection too, so the link toolbar plan reverted it. owner: zbeyens. stop: its suggested task, or a report of the formatting toolbar or Insert link not showing.
- In WebKit, which leaves buttons out of the Tab order by default, Shift+Tab from the link form's URL field focuses the editor. The caret then jumps from the link to the audio block at `[20,0]`, so the toolbar has no link to show, and `edit-link.spec.ts` skips that case there. A WebKit probe saw the same jump with f512cc3bed's `link.tsx`, without binding the served bytes, and a Tab forward into the editor keeps the caret in place. Playwright's WebKit is not Safari. owner: zbeyens. stop: a Safari report of the caret jumping on Shift+Tab.
- The home page AI menu case in `link-floating-toolbar.spec.ts` failed in Firefox twice, each time right after five Firefox runs of `edit-link.spec.ts`, while it waited 8 s for the editor's first paragraph. It passed alone and in its own batch with c66a382362's `link.tsx` and with f512cc3bed's, so nothing ties it to either. owner: zbeyens. stop: its next failure outside a long run.
- The macOS case with the link shortcut set to `ctrl+k` runs only as a scratch probe in its own process, because Plite caches the platform per window. A fresh window realm, as `hotkeys.spec.ts` uses, might run it in the suite; a happy-dom iframe realm threw. owner: zbeyens. stop: a committed macOS case for the link toolbar.
- After a blur to nothing, focus that reaches another control or a second editor leaves the form open, and the iframe check neither enters closed shadow roots nor sees focus leave an editor that sits in an iframe. owner: zbeyens. stop: a report of a link form left open after focus moved on.
- Only a scratch Chromium page, not committed, drives the shadow-root exits in a browser. owner: zbeyens. stop: the next shadow-root report against the link toolbar.
- The selected-link effect may end an open form when the link under the caret changes key, such as after a remote edit, which drops the draft (unverified). owner: zbeyens. stop: a report of a link draft lost while collaborating.
- Two other copied components read the document's focused element without looking inside shadow roots: `discussion.tsx` at line 1241 and `insert-toolbar-button.tsx` at lines 80, 290 and 326. Neither was driven in a shadow root. owner: zbeyens. stop: a shadow-root report against either.
- Plite takes happy-dom for WebKit, because `NON_BROWSER_DOM_USER_AGENT_RE` in `packages/plitejs/src/dom/utils/environment.ts` matches jsdom and not happy-dom, so the bun shadow-root cases stub `execCommand`. owner: zbeyens. stop: the next Plite test that needs the stub.
- `LinkElement` and the static link read the plugin's allowed schemes while they render, so a runtime change of allowed schemes keeps a mounted link's old address, as the 2026-10-11 URL-policy review found. owner: zbeyens. stop: an app that changes allowed schemes at runtime.
