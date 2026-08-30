# Lexical Portable Test-Name Index

source report: [report.md](./report.md)
target: `../lexical`
source_commit: `dd5c41b13193efa9ab1574234d8593d2c9e4f988`
generated_at: 2026-07-29
inventory_mode: incremental

Indexed runnable portable and portable-mixed files: 278.
Extracted test/describe/it call sites: 4212.
Files with zero extracted names: 0.

The extractor records each direct test/describe/it call site. Dynamic and
multiline title expressions remain source pointers, so any implementation pass
must read the cited range rather than infer behavior from this index alone.

## `../lexical/dev-examples/mdast-editor/src/__tests__/browser/MarkdownPersistence.test.ts`

category: portable-mixed
family: serialization-parsing / Plate plugin
target: indexed; target Plate feature package, with raw transport split to Plite only when generic

- `../lexical/dev-examples/mdast-editor/src/__tests__/browser/MarkdownPersistence.test.ts:24` test: 'docToHash/docFromHash round-trip a serialized document', async () => {
- `../lexical/dev-examples/mdast-editor/src/__tests__/browser/MarkdownPersistence.test.ts:36` test: 'docFromHash rejects on a malformed payload', async () => {
- `../lexical/dev-examples/mdast-editor/src/__tests__/browser/MarkdownPersistence.test.ts:40` test: 'a malformed #doc= link logs and falls back instead of rejecting unhandled', async () => {

## `../lexical/dev-examples/mdast-editor/src/__tests__/browser/MdastEditorChrome.test.ts`

category: portable-mixed
family: serialization-parsing / Plate plugin
target: indexed; target Plate feature package, with raw transport split to Plite only when generic

- `../lexical/dev-examples/mdast-editor/src/__tests__/browser/MdastEditorChrome.test.ts:98` describe: 'collapsible chevron', () => {
- `../lexical/dev-examples/mdast-editor/src/__tests__/browser/MdastEditorChrome.test.ts:102` test: 'toggles the open NodeState and the data-open attribute', async () => {
- `../lexical/dev-examples/mdast-editor/src/__tests__/browser/MdastEditorChrome.test.ts:122` test: 'reveals the summary slot in the summary row', () => {
- `../lexical/dev-examples/mdast-editor/src/__tests__/browser/MdastEditorChrome.test.ts:132` describe: 'alert title dropdown', () => {
- `../lexical/dev-examples/mdast-editor/src/__tests__/browser/MdastEditorChrome.test.ts:144` test: 'renders the chrome for an imported alert', () => {
- `../lexical/dev-examples/mdast-editor/src/__tests__/browser/MdastEditorChrome.test.ts:154` test: 'the menu survives inside the editor DOM (setDOMUnmanaged)', async () => {
- `../lexical/dev-examples/mdast-editor/src/__tests__/browser/MdastEditorChrome.test.ts:166` test: 'lists the five types in GitHub order plus convert', () => {
- `../lexical/dev-examples/mdast-editor/src/__tests__/browser/MdastEditorChrome.test.ts:185` test: 'selecting a type updates the chrome and the Markdown', async () => {
- `../lexical/dev-examples/mdast-editor/src/__tests__/browser/MdastEditorChrome.test.ts:202` test: 'an outside pointerdown dismisses without changes', () => {
- `../lexical/dev-examples/mdast-editor/src/__tests__/browser/MdastEditorChrome.test.ts:212` test: 'Escape dismisses without changes', () => {
- `../lexical/dev-examples/mdast-editor/src/__tests__/browser/MdastEditorChrome.test.ts:222` test: 'convert to blockquote strips the chrome and the marker', async () => {
- `../lexical/dev-examples/mdast-editor/src/__tests__/browser/MdastEditorChrome.test.ts:237` describe: 'footnotes', () => {
- `../lexical/dev-examples/mdast-editor/src/__tests__/browser/MdastEditorChrome.test.ts:238` test: 'footnotes render at the document bottom from the root slot', () => {
- `../lexical/dev-examples/mdast-editor/src/__tests__/browser/MdastEditorChrome.test.ts:257` test: 'removing the last definition drops the section and its refs', async () => {
- `../lexical/dev-examples/mdast-editor/src/__tests__/browser/MdastEditorChrome.test.ts:270` test: 'exposes GitHub/DAISY-style anchors, ids, and roles', async () => {
- `../lexical/dev-examples/mdast-editor/src/__tests__/browser/MdastEditorChrome.test.ts:313` test: 'clicking a ref moves the caret into the definition body', async () => {
- `../lexical/dev-examples/mdast-editor/src/__tests__/browser/MdastEditorChrome.test.ts:332` test: 'a real copy event carries the selected refs definitions in the HTML', () => {
- `../lexical/dev-examples/mdast-editor/src/__tests__/browser/MdastEditorChrome.test.ts:370` test: 'one backlink per reference after the note text, each jumping to its ref', async () => {
- `../lexical/dev-examples/mdast-editor/src/__tests__/browser/MdastEditorChrome.test.ts:404` describe: 'read-only', () => {
- `../lexical/dev-examples/mdast-editor/src/__tests__/browser/MdastEditorChrome.test.ts:415` test: 'the chevron still toggles, as view state only', async () => {
- `../lexical/dev-examples/mdast-editor/src/__tests__/browser/MdastEditorChrome.test.ts:432` test: 'the alert menu does not open', () => {
- `../lexical/dev-examples/mdast-editor/src/__tests__/browser/MdastEditorChrome.test.ts:439` test: 'footnote deletion is blocked', () => {
- `../lexical/dev-examples/mdast-editor/src/__tests__/browser/MdastEditorChrome.test.ts:449` test: 'mutating commands are inert; ref navigation still moves the selection', async () => {

## `../lexical/dev-examples/mdast-editor/src/__tests__/unit/MdastCustomConstructs.test.ts`

category: portable-mixed
family: serialization-parsing / Plate plugin
target: indexed; target Plate feature package, with raw transport split to Plite only when generic

- `../lexical/dev-examples/mdast-editor/src/__tests__/unit/MdastCustomConstructs.test.ts:126` describe: 'CollapsibleNode', () => {
- `../lexical/dev-examples/mdast-editor/src/__tests__/unit/MdastCustomConstructs.test.ts:136` it: 'imports the GFM-style encoding into a collapsible', () => {
- `../lexical/dev-examples/mdast-editor/src/__tests__/unit/MdastCustomConstructs.test.ts:161` it: 'round-trips the encoding as a fixed point', () => {
- `../lexical/dev-examples/mdast-editor/src/__tests__/unit/MdastCustomConstructs.test.ts:167` it: 'imports and re-exports the open attribute', () => {
- `../lexical/dev-examples/mdast-editor/src/__tests__/unit/MdastCustomConstructs.test.ts:182` it: 'setOpen accepts a value or an updater', () => {
- `../lexical/dev-examples/mdast-editor/src/__tests__/unit/MdastCustomConstructs.test.ts:202` it: 'exports clipboard HTML with the summary content and no marker', () => {
- `../lexical/dev-examples/mdast-editor/src/__tests__/unit/MdastCustomConstructs.test.ts:218` it: 'INSERT_COLLAPSIBLE_COMMAND inserts an open section with a summary slot', () => {
- `../lexical/dev-examples/mdast-editor/src/__tests__/unit/MdastCustomConstructs.test.ts:242` describe: 'KbdNode', () => {
- `../lexical/dev-examples/mdast-editor/src/__tests__/unit/MdastCustomConstructs.test.ts:243` it: 'imports an inline <kbd> run and round-trips it', () => {
- `../lexical/dev-examples/mdast-editor/src/__tests__/unit/MdastCustomConstructs.test.ts:263` it: 'keeps Markdown formatting inside the tags', () => {
- `../lexical/dev-examples/mdast-editor/src/__tests__/unit/MdastCustomConstructs.test.ts:281` it: 'FORMAT_KBD_COMMAND wraps the selection and unwraps from within', () => {
- `../lexical/dev-examples/mdast-editor/src/__tests__/unit/MdastCustomConstructs.test.ts:325` describe: 'alerts', () => {
- `../lexical/dev-examples/mdast-editor/src/__tests__/unit/MdastCustomConstructs.test.ts:326` it: [
- `../lexical/dev-examples/mdast-editor/src/__tests__/unit/MdastCustomConstructs.test.ts:348` it: 'imports the marker as NodeState on a shadow-root QuoteNode', () => {
- `../lexical/dev-examples/mdast-editor/src/__tests__/unit/MdastCustomConstructs.test.ts:368` it: 'INSERT_ALERT_COMMAND inserts a typed alert with an editable body', () => {
- `../lexical/dev-examples/mdast-editor/src/__tests__/unit/MdastCustomConstructs.test.ts:386` it: 'exports clipboard HTML as GitHub-rendered alert markup', () => {
- `../lexical/dev-examples/mdast-editor/src/__tests__/unit/MdastCustomConstructs.test.ts:399` it: 'imports GitHub-rendered alert markup, stripping the title chrome', () => {
- `../lexical/dev-examples/mdast-editor/src/__tests__/unit/MdastCustomConstructs.test.ts:428` it: 'leaves plain blockquotes alone (shadow-root import branch)', () => {
- `../lexical/dev-examples/mdast-editor/src/__tests__/unit/MdastCustomConstructs.test.ts:446` describe: 'footnotes', () => {
- `../lexical/dev-examples/mdast-editor/src/__tests__/unit/MdastCustomConstructs.test.ts:447` it: [
- `../lexical/dev-examples/mdast-editor/src/__tests__/unit/MdastCustomConstructs.test.ts:471` it: [
- `../lexical/dev-examples/mdast-editor/src/__tests__/unit/MdastCustomConstructs.test.ts:484` it: 'a surrounding format imports onto the ref (DecoratorTextNode)', () => {
- `../lexical/dev-examples/mdast-editor/src/__tests__/unit/MdastCustomConstructs.test.ts:503` it: 'imports refs inline and relocates definitions to the root slot', () => {
- `../lexical/dev-examples/mdast-editor/src/__tests__/unit/MdastCustomConstructs.test.ts:535` it: 'matches definitions case-insensitively', () => {
- `../lexical/dev-examples/mdast-editor/src/__tests__/unit/MdastCustomConstructs.test.ts:548` it: 'INSERT_FOOTNOTE_COMMAND mints an auto-numbered ref and definition', () => {
- `../lexical/dev-examples/mdast-editor/src/__tests__/unit/MdastCustomConstructs.test.ts:568` it: 'the [^label] typing shortcut materializes a ref and definition', () => {
- `../lexical/dev-examples/mdast-editor/src/__tests__/unit/MdastCustomConstructs.test.ts:605` it: '$removeFootnoteDefinition cascades to the references', () => {
- `../lexical/dev-examples/mdast-editor/src/__tests__/unit/MdastCustomConstructs.test.ts:628` it: 'a selection export carries only the definitions its refs use', () => {
- `../lexical/dev-examples/mdast-editor/src/__tests__/unit/MdastCustomConstructs.test.ts:663` it: 'clipboard HTML from a ref selection appends its definition', () => {
- `../lexical/dev-examples/mdast-editor/src/__tests__/unit/MdastCustomConstructs.test.ts:691` it: 'imports the definition envelope from clipboard HTML', () => {
- `../lexical/dev-examples/mdast-editor/src/__tests__/unit/MdastCustomConstructs.test.ts:715` it: 'exports the ref as clipboard HTML and imports it back', () => {
- `../lexical/dev-examples/mdast-editor/src/__tests__/unit/MdastCustomConstructs.test.ts:748` describe: 'read-only', () => {
- `../lexical/dev-examples/mdast-editor/src/__tests__/unit/MdastCustomConstructs.test.ts:749` it: 'mutating commands are inert on a read-only editor', () => {
- `../lexical/dev-examples/mdast-editor/src/__tests__/unit/MdastCustomConstructs.test.ts:776` describe: 'HtmlTextFormatExtension', () => {
- `../lexical/dev-examples/mdast-editor/src/__tests__/unit/MdastCustomConstructs.test.ts:777` it: 'round-trips the formats Markdown cannot express', () => {
- `../lexical/dev-examples/mdast-editor/src/__tests__/unit/MdastCustomConstructs.test.ts:783` it: 'composes html tags with Markdown formatting', () => {
- `../lexical/dev-examples/mdast-editor/src/__tests__/unit/MdastCustomConstructs.test.ts:787` it: 'imports allowlisted span styles onto the text', () => {

## `../lexical/dev-examples/shadow-dom-web-component/tests/web-component.spec.ts`

category: portable-mixed
family: portable editor behavior
target: indexed; target current Plite package proof and browser proof when DOM-dependent

- `../lexical/dev-examples/shadow-dom-web-component/tests/web-component.spec.ts:25` test: async ({page}) => {
- `../lexical/dev-examples/shadow-dom-web-component/tests/web-component.spec.ts:30` test: 'renders three light-DOM editors plus one nested inside a wrapper shadow', async ({
- `../lexical/dev-examples/shadow-dom-web-component/tests/web-component.spec.ts:59` test: 'types and formats inside a web component shadow root', async ({page}) => {
- `../lexical/dev-examples/shadow-dom-web-component/tests/web-component.spec.ts:78` test: 'the two editors are independent', async ({page}) => {
- `../lexical/dev-examples/shadow-dom-web-component/tests/web-component.spec.ts:85` test: 'deletes by word inside the shadow root', async ({page}) => {
- `../lexical/dev-examples/shadow-dom-web-component/tests/web-component.spec.ts:96` test: 'is form-associated via ElementInternals', async ({page}) => {
- `../lexical/dev-examples/shadow-dom-web-component/tests/web-component.spec.ts:111` test: 'dispatches a composed input event across the shadow boundary', async ({
- `../lexical/dev-examples/shadow-dom-web-component/tests/web-component.spec.ts:120` test: 'a slotted light-DOM button drives the editor through the host API', async ({
- `../lexical/dev-examples/shadow-dom-web-component/tests/web-component.spec.ts:154` test: 'the page themes each editor through inherited CSS custom properties', async ({
- `../lexical/dev-examples/shadow-dom-web-component/tests/web-component.spec.ts:182` test: 'readonly blocks edits but still submits the value', async ({page}) => {
- `../lexical/dev-examples/shadow-dom-web-component/tests/web-component.spec.ts:206` test: 'disabled drops the editor out of form submission', async ({page}) => {
- `../lexical/dev-examples/shadow-dom-web-component/tests/web-component.spec.ts:230` test: 'the floating popover anchors to the shadow-root selection', async ({
- `../lexical/dev-examples/shadow-dom-web-component/tests/web-component.spec.ts:278` test: 'mirrors aria-label and aria-invalid onto the contentEditable', async ({
- `../lexical/dev-examples/shadow-dom-web-component/tests/web-component.spec.ts:317` test: 'a visible error message follows the required validation state', async ({
- `../lexical/dev-examples/shadow-dom-web-component/tests/web-component.spec.ts:338` test: 'the shadow root is attached with delegatesFocus and the contentEditable is tab-focusable', async ({
- `../lexical/dev-examples/shadow-dom-web-component/tests/web-component.spec.ts:376` test: 'setCustomValidity flags a customError and clears it with an empty message', async ({
- `../lexical/dev-examples/shadow-dom-web-component/tests/web-component.spec.ts:439` test: 'DOM move (re-attach to a different parent) preserves the editor state', async ({
- `../lexical/dev-examples/shadow-dom-web-component/tests/web-component.spec.ts:455` test: 'reuses a declarative shadow DOM `.content` element instead of creating a new one', async ({
- `../lexical/dev-examples/shadow-dom-web-component/tests/web-component.spec.ts:485` test: 'defineLexicalEditorElement guards against a duplicate customElement registration', async ({
- `../lexical/dev-examples/shadow-dom-web-component/tests/web-component.spec.ts:503` test: 'connectedCallback failures surface through the host without crashing the page', async ({
- `../lexical/dev-examples/shadow-dom-web-component/tests/web-component.spec.ts:538` test: 'exposes CSS Shadow Parts for the toolbar and content', async ({page}) => {
- `../lexical/dev-examples/shadow-dom-web-component/tests/web-component.spec.ts:563` test: 'a MutationObserver registered against the shadow root sees content edits', async ({
- `../lexical/dev-examples/shadow-dom-web-component/tests/web-component.spec.ts:601` test: 'the host spellcheck attribute mirrors onto the contentEditable', async ({
- `../lexical/dev-examples/shadow-dom-web-component/tests/web-component.spec.ts:646` test: 'lang on the host inherits into the shadow contentEditable', async ({
- `../lexical/dev-examples/shadow-dom-web-component/tests/web-component.spec.ts:668` test: 'focusin / focusout bubble across the shadow boundary', async ({page}) => {
- `../lexical/dev-examples/shadow-dom-web-component/tests/web-component.spec.ts:712` test: 'customElements.whenDefined resolves with the already-mounted host class', async ({
- `../lexical/dev-examples/shadow-dom-web-component/tests/web-component.spec.ts:733` test: 'the form reset button drives formResetCallback on every editor', async ({
- `../lexical/dev-examples/shadow-dom-web-component/tests/web-component.spec.ts:745` test: 'the form reset button re-syncs the readonly checkbox to the host', async ({
- `../lexical/dev-examples/shadow-dom-web-component/tests/web-component.spec.ts:763` test: 'the form reset button re-syncs the inert checkbox to the host', async ({
- `../lexical/dev-examples/shadow-dom-web-component/tests/web-component.spec.ts:780` test: 'outerHTML / serialization carries the host element but not the shadow content by default', async ({
- `../lexical/dev-examples/shadow-dom-web-component/tests/web-component.spec.ts:796` test: 'host.form reflects ElementInternals and fires formAssociatedCallback', async ({
- `../lexical/dev-examples/shadow-dom-web-component/tests/web-component.spec.ts:854` test: 'formStateRestoreCallback restores a serialized editor state', async ({
- `../lexical/dev-examples/shadow-dom-web-component/tests/web-component.spec.ts:891` test: 'inert on the host blocks input across the shadow boundary', async ({
- `../lexical/dev-examples/shadow-dom-web-component/tests/web-component.spec.ts:913` test: 'a required <lexical-editor> participates in form validation', async ({
- `../lexical/dev-examples/shadow-dom-web-component/tests/web-component.spec.ts:971` test: 'renders an editor inside two nested shadow roots', async ({page}) => {
- `../lexical/dev-examples/shadow-dom-web-component/tests/web-component.spec.ts:999` test: 'floating popover anchors to a selection inside the nested shadow root', async ({

## `../lexical/dev-examples/shadow-dom/tests/shadow-dom.spec.ts`

category: portable-mixed
family: portable editor behavior
target: indexed; target current Plite package proof and browser proof when DOM-dependent

- `../lexical/dev-examples/shadow-dom/tests/shadow-dom.spec.ts:30` test: 'renders both editors with the inner one inside an open shadow root', async ({
- `../lexical/dev-examples/shadow-dom/tests/shadow-dom.spec.ts:55` test: 'types and reconciles text in the inner shadow editor', async ({page}) => {
- `../lexical/dev-examples/shadow-dom/tests/shadow-dom.spec.ts:61` test: 'types and reconciles text in the outer light-DOM editor', async ({
- `../lexical/dev-examples/shadow-dom/tests/shadow-dom.spec.ts:69` test: 'formats an outer selection from the light-DOM toolbar', async ({
- `../lexical/dev-examples/shadow-dom/tests/shadow-dom.spec.ts:89` test: 'deletes by word in the inner shadow editor', async ({page}) => {

## `../lexical/examples/markdown-editor/src/__tests__/unit/MarkdownExtension.test.ts`

category: portable-mixed
family: serialization-parsing / Plate plugin
target: indexed; target Plate feature package, with raw transport split to Plite only when generic

- `../lexical/examples/markdown-editor/src/__tests__/unit/MarkdownExtension.test.ts:66` describe: 'MARKDOWN_TRANSFORMERS', () => {
- `../lexical/examples/markdown-editor/src/__tests__/unit/MarkdownExtension.test.ts:67` test: 'round-trips a heading', () => {
- `../lexical/examples/markdown-editor/src/__tests__/unit/MarkdownExtension.test.ts:72` test: 'round-trips inline formats', () => {
- `../lexical/examples/markdown-editor/src/__tests__/unit/MarkdownExtension.test.ts:81` test: 'round-trips an unordered list', () => {
- `../lexical/examples/markdown-editor/src/__tests__/unit/MarkdownExtension.test.ts:87` test: 'round-trips an ordered list', () => {
- `../lexical/examples/markdown-editor/src/__tests__/unit/MarkdownExtension.test.ts:93` test: 'round-trips a check list', () => {
- `../lexical/examples/markdown-editor/src/__tests__/unit/MarkdownExtension.test.ts:99` test: 'CHECK_LIST is matched before UNORDERED_LIST on import', () => {
- `../lexical/examples/markdown-editor/src/__tests__/unit/MarkdownExtension.test.ts:113` describe: 'CHECK_LIST_ITEM typing-time transformer', () => {
- `../lexical/examples/markdown-editor/src/__tests__/unit/MarkdownExtension.test.ts:134` test: 'typing `[x] ` inside a bullet list item flips it to a checklist', () => {
- `../lexical/examples/markdown-editor/src/__tests__/unit/MarkdownExtension.test.ts:148` test: 'typing `[ ] ` inside a bullet list item flips it to an unchecked item', () => {
- `../lexical/examples/markdown-editor/src/__tests__/unit/MarkdownExtension.test.ts:161` test: 'typing nothing matching is left alone', () => {
- `../lexical/examples/markdown-editor/src/__tests__/unit/MarkdownExtension.test.ts:172` describe: 'MarkdownExtension markdown signal', () => {
- `../lexical/examples/markdown-editor/src/__tests__/unit/MarkdownExtension.test.ts:173` test: 'updates as the editor state changes', () => {

## `../lexical/packages/lexical-a11y/src/__tests__/unit/AriaLiveRegionExtension.test.ts`

category: portable-mixed
family: portable editor behavior
target: indexed; target current Plite package proof and browser proof when DOM-dependent

- `../lexical/packages/lexical-a11y/src/__tests__/unit/AriaLiveRegionExtension.test.ts:35` describe: 'AriaLiveRegionExtension', () => {
- `../lexical/packages/lexical-a11y/src/__tests__/unit/AriaLiveRegionExtension.test.ts:36` test: 'mounts a polite live region on the root document by default', () => {
- `../lexical/packages/lexical-a11y/src/__tests__/unit/AriaLiveRegionExtension.test.ts:51` test: 'disposes the live region when the editor is disposed', () => {
- `../lexical/packages/lexical-a11y/src/__tests__/unit/AriaLiveRegionExtension.test.ts:65` test: 'mounts the region in the editor root element document (e.g. an iframe)', () => {
- `../lexical/packages/lexical-a11y/src/__tests__/unit/AriaLiveRegionExtension.test.ts:89` test: 'respects assertive politeness from config', () => {
- `../lexical/packages/lexical-a11y/src/__tests__/unit/AriaLiveRegionExtension.test.ts:105` test: 'reflects politeness changes from the output signal at runtime', () => {
- `../lexical/packages/lexical-a11y/src/__tests__/unit/AriaLiveRegionExtension.test.ts:123` test: 'mounts onto a custom owner element regardless of the root', () => {
- `../lexical/packages/lexical-a11y/src/__tests__/unit/AriaLiveRegionExtension.test.ts:139` test: 'exposes a stable announce sink via dependency output', () => {
- `../lexical/packages/lexical-a11y/src/__tests__/unit/AriaLiveRegionExtension.test.ts:156` test: 'does not replay the last message into a region re-created on remount', () => {
- `../lexical/packages/lexical-a11y/src/__tests__/unit/AriaLiveRegionExtension.test.ts:197` test: 'announcing before a region is mounted is a no-op, not buffered for mount', () => {
- `../lexical/packages/lexical-a11y/src/__tests__/unit/AriaLiveRegionExtension.test.ts:224` test: 'keeps a custom-owner region across editor root changes (no churn)', () => {

## `../lexical/packages/lexical-a11y/src/__tests__/unit/EditorModeAnnounceExtension.test.ts`

category: portable-mixed
family: portable editor behavior
target: indexed; target current Plite package proof and browser proof when DOM-dependent

- `../lexical/packages/lexical-a11y/src/__tests__/unit/EditorModeAnnounceExtension.test.ts:38` describe: 'EditorModeAnnounceExtension', () => {
- `../lexical/packages/lexical-a11y/src/__tests__/unit/EditorModeAnnounceExtension.test.ts:39` test: 'announces the default editable / read-only messages on the dependency sink', () => {
- `../lexical/packages/lexical-a11y/src/__tests__/unit/EditorModeAnnounceExtension.test.ts:53` test: 'respects message overrides from configExtension', () => {
- `../lexical/packages/lexical-a11y/src/__tests__/unit/EditorModeAnnounceExtension.test.ts:73` test: 'reflects message signal changes at runtime', () => {
- `../lexical/packages/lexical-a11y/src/__tests__/unit/EditorModeAnnounceExtension.test.ts:93` test: 'does not announce while disabled, and resumes when re-enabled', () => {

## `../lexical/packages/lexical-a11y/src/__tests__/unit/FocusManagerExtension.shadow.test.ts`

category: portable-mixed
family: portable editor behavior
target: indexed; target current Plite package proof and browser proof when DOM-dependent

- `../lexical/packages/lexical-a11y/src/__tests__/unit/FocusManagerExtension.shadow.test.ts:66` describe: 'FocusManagerExtension (shadow DOM)', () => {
- `../lexical/packages/lexical-a11y/src/__tests__/unit/FocusManagerExtension.shadow.test.ts:67` test: 'Alt+F10 focuses the first item of a shadow-hosted toolbar', () => {
- `../lexical/packages/lexical-a11y/src/__tests__/unit/FocusManagerExtension.shadow.test.ts:82` test: 'Escape from a descendant of a shadow-hosted toolbar item returns focus to the editor root', () => {

## `../lexical/packages/lexical-a11y/src/__tests__/unit/FocusManagerExtension.test.ts`

category: portable-mixed
family: portable editor behavior
target: indexed; target current Plite package proof and browser proof when DOM-dependent

- `../lexical/packages/lexical-a11y/src/__tests__/unit/FocusManagerExtension.test.ts:39` describe: 'FocusManagerExtension', () => {
- `../lexical/packages/lexical-a11y/src/__tests__/unit/FocusManagerExtension.test.ts:40` test: 'no registered toolbar leaves Alt+F10 a no-op (no focus move)', () => {
- `../lexical/packages/lexical-a11y/src/__tests__/unit/FocusManagerExtension.test.ts:58` test: 'Alt+F10 focuses the toolbar first item when toolbar is registered', () => {
- `../lexical/packages/lexical-a11y/src/__tests__/unit/FocusManagerExtension.test.ts:75` test: 'Escape on the toolbar returns focus to the editor root', () => {
- `../lexical/packages/lexical-a11y/src/__tests__/unit/FocusManagerExtension.test.ts:101` test: 'deactivates when the registration is disposed', () => {

## `../lexical/packages/lexical-a11y/src/__tests__/unit/FocusTrapExtension.shadow.test.ts`

category: portable-mixed
family: portable editor behavior
target: indexed; target current Plite package proof and browser proof when DOM-dependent

- `../lexical/packages/lexical-a11y/src/__tests__/unit/FocusTrapExtension.shadow.test.ts:74` describe: 'FocusTrapExtension (shadow DOM)', () => {
- `../lexical/packages/lexical-a11y/src/__tests__/unit/FocusTrapExtension.shadow.test.ts:75` test: 'initial focus lands on the first focusable inside the shadow root', () => {
- `../lexical/packages/lexical-a11y/src/__tests__/unit/FocusTrapExtension.shadow.test.ts:85` test: 'Tab cycles to the next focusable across the shadow boundary', () => {
- `../lexical/packages/lexical-a11y/src/__tests__/unit/FocusTrapExtension.shadow.test.ts:99` test: 'Shift+Tab from the first item wraps to the last across the shadow boundary', () => {
- `../lexical/packages/lexical-a11y/src/__tests__/unit/FocusTrapExtension.shadow.test.ts:116` test: 'focus is restored to the previously-focused element inside the shadow root on deactivate', () => {
- `../lexical/packages/lexical-a11y/src/__tests__/unit/FocusTrapExtension.shadow.test.ts:133` test: 'focusin from outside the shadow host is pulled back inside the container', () => {
- `../lexical/packages/lexical-a11y/src/__tests__/unit/FocusTrapExtension.shadow.test.ts:152` test: 'focusin retargeted to a foreign shadow host is resolved via composedPath and pulled back', () => {

## `../lexical/packages/lexical-a11y/src/__tests__/unit/FocusTrapExtension.test.ts`

category: portable-mixed
family: portable editor behavior
target: indexed; target current Plite package proof and browser proof when DOM-dependent

- `../lexical/packages/lexical-a11y/src/__tests__/unit/FocusTrapExtension.test.ts:39` describe: 'FocusTrapExtension', () => {
- `../lexical/packages/lexical-a11y/src/__tests__/unit/FocusTrapExtension.test.ts:40` test: 'no registered container keeps the trap inert', () => {
- `../lexical/packages/lexical-a11y/src/__tests__/unit/FocusTrapExtension.test.ts:55` test: 'activates when a container is registered', () => {
- `../lexical/packages/lexical-a11y/src/__tests__/unit/FocusTrapExtension.test.ts:67` test: 'initialFocus="container" lands focus on the container itself', () => {
- `../lexical/packages/lexical-a11y/src/__tests__/unit/FocusTrapExtension.test.ts:81` test: 'deactivates when the registration is disposed', () => {
- `../lexical/packages/lexical-a11y/src/__tests__/unit/FocusTrapExtension.test.ts:100` test: 'reference counting keeps the trap active until the last disposer runs', () => {
- `../lexical/packages/lexical-a11y/src/__tests__/unit/FocusTrapExtension.test.ts:128` test: 'Tab inside the container cycles to the next focusable', () => {

## `../lexical/packages/lexical-a11y/src/__tests__/unit/HistoryAnnounceExtension.test.ts`

category: portable-mixed
family: portable editor behavior
target: indexed; target current Plite package proof and browser proof when DOM-dependent

- `../lexical/packages/lexical-a11y/src/__tests__/unit/HistoryAnnounceExtension.test.ts:38` describe: 'HistoryAnnounceExtension', () => {
- `../lexical/packages/lexical-a11y/src/__tests__/unit/HistoryAnnounceExtension.test.ts:39` test: 'announces the default Undone / Redone messages on the dependency sink', () => {
- `../lexical/packages/lexical-a11y/src/__tests__/unit/HistoryAnnounceExtension.test.ts:53` test: 'respects message overrides from configExtension', () => {
- `../lexical/packages/lexical-a11y/src/__tests__/unit/HistoryAnnounceExtension.test.ts:73` test: 'reflects message signal changes at runtime', () => {
- `../lexical/packages/lexical-a11y/src/__tests__/unit/HistoryAnnounceExtension.test.ts:93` test: 'does not announce while disabled, and resumes when re-enabled', () => {
- `../lexical/packages/lexical-a11y/src/__tests__/unit/HistoryAnnounceExtension.test.ts:115` test: 'keeps the history command chain intact (returns false)', () => {

## `../lexical/packages/lexical-a11y/src/__tests__/unit/RovingTabIndexExtension.shadow.test.ts`

category: portable-mixed
family: portable editor behavior
target: indexed; target current Plite package proof and browser proof when DOM-dependent

- `../lexical/packages/lexical-a11y/src/__tests__/unit/RovingTabIndexExtension.shadow.test.ts:73` describe: 'RovingTabIndexExtension (shadow DOM)', () => {
- `../lexical/packages/lexical-a11y/src/__tests__/unit/RovingTabIndexExtension.shadow.test.ts:74` test: 'applies the roving tabindex pattern to items inside a shadow root', () => {
- `../lexical/packages/lexical-a11y/src/__tests__/unit/RovingTabIndexExtension.shadow.test.ts:83` test: 'ArrowRight moves focus to the next item across the shadow boundary', () => {
- `../lexical/packages/lexical-a11y/src/__tests__/unit/RovingTabIndexExtension.shadow.test.ts:103` test: 'ArrowLeft from the first item wraps to the last across the shadow boundary', () => {
- `../lexical/packages/lexical-a11y/src/__tests__/unit/RovingTabIndexExtension.shadow.test.ts:122` test: 'End jumps to the last item across the shadow boundary', () => {

## `../lexical/packages/lexical-a11y/src/__tests__/unit/RovingTabIndexExtension.test.ts`

category: portable-mixed
family: portable editor behavior
target: indexed; target current Plite package proof and browser proof when DOM-dependent

- `../lexical/packages/lexical-a11y/src/__tests__/unit/RovingTabIndexExtension.test.ts:41` describe: 'RovingTabIndexExtension', () => {
- `../lexical/packages/lexical-a11y/src/__tests__/unit/RovingTabIndexExtension.test.ts:42` test: 'no registered container leaves item tab indices untouched', () => {
- `../lexical/packages/lexical-a11y/src/__tests__/unit/RovingTabIndexExtension.test.ts:57` test: 'applies tabindex=0 on the first item and -1 on the rest when container is registered', () => {
- `../lexical/packages/lexical-a11y/src/__tests__/unit/RovingTabIndexExtension.test.ts:73` test: 'disposing the registration restores the natural tab order', () => {
- `../lexical/packages/lexical-a11y/src/__tests__/unit/RovingTabIndexExtension.test.ts:89` test: 'ArrowRight moves focus to the next button (horizontal default)', () => {
- `../lexical/packages/lexical-a11y/src/__tests__/unit/RovingTabIndexExtension.test.ts:111` test: 'Home jumps to the first item from the middle', () => {
- `../lexical/packages/lexical-a11y/src/__tests__/unit/RovingTabIndexExtension.test.ts:129` test: 'vertical orientation responds to ArrowDown, not ArrowRight', () => {

## `../lexical/packages/lexical-clipboard/src/__tests__/unit/ClipboardImportExtension.test.ts`

category: portable
family: clipboard / drag transport
target: indexed; target current Plite package proof and browser proof when DOM-dependent

- `../lexical/packages/lexical-clipboard/src/__tests__/unit/ClipboardImportExtension.test.ts:64` describe: 'ClipboardImportExtension', () => {
- `../lexical/packages/lexical-clipboard/src/__tests__/unit/ClipboardImportExtension.test.ts:65` test: 'default importer handles a basic <p> paste (no extension configured)', () => {
- `../lexical/packages/lexical-clipboard/src/__tests__/unit/ClipboardImportExtension.test.ts:77` test: 'a registered text/html handler runs before the default and can stop the chain', () => {
- `../lexical/packages/lexical-clipboard/src/__tests__/unit/ClipboardImportExtension.test.ts:110` test: 'handler can call next() to defer to the default', () => {
- `../lexical/packages/lexical-clipboard/src/__tests__/unit/ClipboardImportExtension.test.ts:139` test: 'app-defined MIME type is reached when added to both stack and priority', () => {
- `../lexical/packages/lexical-clipboard/src/__tests__/unit/ClipboardImportExtension.test.ts:190` test: 'priority weights compose without coordination between extensions', () => {
- `../lexical/packages/lexical-clipboard/src/__tests__/unit/ClipboardImportExtension.test.ts:238` test: 'text/html can be routed through DOMImportExtension', () => {

## `../lexical/packages/lexical-clipboard/src/__tests__/unit/GetClipboardDataExtension.test.ts`

category: portable
family: clipboard / drag transport
target: indexed; target current Plite package proof and browser proof when DOM-dependent

- `../lexical/packages/lexical-clipboard/src/__tests__/unit/GetClipboardDataExtension.test.ts:42` describe: 'GetClipboardDataExtension', () => {
- `../lexical/packages/lexical-clipboard/src/__tests__/unit/GetClipboardDataExtension.test.ts:43` it: 'produces default text/plain, text/html, and application/x-lexical-editor entries', () => {
- `../lexical/packages/lexical-clipboard/src/__tests__/unit/GetClipboardDataExtension.test.ts:59` it: 'lets an override replace the default output for an existing MIME type', () => {
- `../lexical/packages/lexical-clipboard/src/__tests__/unit/GetClipboardDataExtension.test.ts:73` it: 'falls through to the default handler when the override calls next()', () => {
- `../lexical/packages/lexical-clipboard/src/__tests__/unit/GetClipboardDataExtension.test.ts:85` it: 'omits a MIME type when its top handler returns null without calling next()', () => {
- `../lexical/packages/lexical-clipboard/src/__tests__/unit/GetClipboardDataExtension.test.ts:100` it: 'registers a brand-new custom MIME type', () => {
- `../lexical/packages/lexical-clipboard/src/__tests__/unit/GetClipboardDataExtension.test.ts:122` it: 'runs higher-indexed handlers first within a single MIME stack', () => {
- `../lexical/packages/lexical-clipboard/src/__tests__/unit/GetClipboardDataExtension.test.ts:147` describe: '$exportMimeTypeFromSelection', () => {
- `../lexical/packages/lexical-clipboard/src/__tests__/unit/GetClipboardDataExtension.test.ts:148` it: 'returns the configured stack output for known MIME types', () => {
- `../lexical/packages/lexical-clipboard/src/__tests__/unit/GetClipboardDataExtension.test.ts:162` it: 'returns null for MIME types that have no registered handler', () => {
- `../lexical/packages/lexical-clipboard/src/__tests__/unit/GetClipboardDataExtension.test.ts:171` it: 'uses the default config when GetClipboardDataExtension is not built into the editor', () => {
- `../lexical/packages/lexical-clipboard/src/__tests__/unit/GetClipboardDataExtension.test.ts:185` it: 'setLexicalClipboardDataTransfer wires custom MIME types into the DataTransfer', () => {

## `../lexical/packages/lexical-clipboard/src/__tests__/unit/SlotClipboardExport.test.ts`

category: portable
family: selection-dom-mapping / nested-root
target: indexed; target current Plite package proof and browser proof when DOM-dependent

- `../lexical/packages/lexical-clipboard/src/__tests__/unit/SlotClipboardExport.test.ts:107` describe: 'slot clipboard export', () => {
- `../lexical/packages/lexical-clipboard/src/__tests__/unit/SlotClipboardExport.test.ts:108` test: 'throws when a slot value is excluded from copy', () => {
- `../lexical/packages/lexical-clipboard/src/__tests__/unit/SlotClipboardExport.test.ts:131` test: 'a host outside the selection does not gate the export on its slot', () => {
- `../lexical/packages/lexical-clipboard/src/__tests__/unit/SlotClipboardExport.test.ts:174` test: 'a slot-bearing host round-trips through JSON copy + insert', () => {
- `../lexical/packages/lexical-clipboard/src/__tests__/unit/SlotClipboardExport.test.ts:243` test: 'a selection inside a slot exports its content on both channels', () => {
- `../lexical/packages/lexical-clipboard/src/__tests__/unit/SlotClipboardExport.test.ts:289` test: 'a partial range over an element host does not over-export', () => {
- `../lexical/packages/lexical-clipboard/src/__tests__/unit/SlotClipboardExport.test.ts:351` test: 'a NodeSelection on a node inside a slot exports the node, not an empty list', () => {
- `../lexical/packages/lexical-clipboard/src/__tests__/unit/SlotClipboardExport.test.ts:398` test: 'throws when a 1-child excluded slot value would export its child instead', () => {

## `../lexical/packages/lexical-code-core/src/__tests__/unit/CodeExtension.test.ts`

category: portable-mixed
family: serialization-parsing / Plate plugin
target: indexed; target Plate feature package, with raw transport split to Plite only when generic

- `../lexical/packages/lexical-code-core/src/__tests__/unit/CodeExtension.test.ts:24` describe: 'CodeExtension', () => {
- `../lexical/packages/lexical-code-core/src/__tests__/unit/CodeExtension.test.ts:25` it: 'should not escape code block when content has consecutive blank lines (paste scenario)', () => {
- `../lexical/packages/lexical-code-core/src/__tests__/unit/CodeExtension.test.ts:53` it: 'should escape code block on Enter when cursor is after two trailing blank lines', () => {
- `../lexical/packages/lexical-code-core/src/__tests__/unit/CodeExtension.test.ts:98` it: 'should not escape code block on Enter with only one trailing blank line', () => {
- `../lexical/packages/lexical-code-core/src/__tests__/unit/CodeExtension.test.ts:139` it: 'should strip format from TabNode inside CodeNode', () => {
- `../lexical/packages/lexical-code-core/src/__tests__/unit/CodeExtension.test.ts:167` it: 'should not escape code block on Enter when cursor is not at the end', () => {

## `../lexical/packages/lexical-code-core/src/__tests__/unit/CodeImportExtension.test.ts`

category: portable-mixed
family: serialization-parsing / Plate plugin
target: indexed; target Plate feature package, with raw transport split to Plite only when generic

- `../lexical/packages/lexical-code-core/src/__tests__/unit/CodeImportExtension.test.ts:67` describe: 'CodeImportExtension', () => {
- `../lexical/packages/lexical-code-core/src/__tests__/unit/CodeImportExtension.test.ts:68` test: '<pre> imports as CodeNode', () => {
- `../lexical/packages/lexical-code-core/src/__tests__/unit/CodeImportExtension.test.ts:77` test: '<pre data-language="ts"> sets the language', () => {
- `../lexical/packages/lexical-code-core/src/__tests__/unit/CodeImportExtension.test.ts:86` test: 'multi-line <code> imports as CodeNode (not inline)', () => {
- `../lexical/packages/lexical-code-core/src/__tests__/unit/CodeImportExtension.test.ts:96` test: 'single-line <code> defers to inline-format (no CodeNode)', () => {
- `../lexical/packages/lexical-code-core/src/__tests__/unit/CodeImportExtension.test.ts:109` test: '<div style="font-family: monospace"> imports as CodeNode', () => {
- `../lexical/packages/lexical-code-core/src/__tests__/unit/CodeImportExtension.test.ts:119` test: 'GitHub raw-file-view table imports as CodeNode', () => {
- `../lexical/packages/lexical-code-core/src/__tests__/unit/CodeImportExtension.test.ts:138` test: 'GitHub raw-file-view table still wins when TableExtension is present', () => {
- `../lexical/packages/lexical-code-core/src/__tests__/unit/CodeImportExtension.test.ts:166` test: 'plain <table> falls through (no CodeNode)', () => {
- `../lexical/packages/lexical-code-core/src/__tests__/unit/CodeImportExtension.test.ts:178` test: 'deprecated CodeImportExtension alias still imports <pre>', () => {
- `../lexical/packages/lexical-code-core/src/__tests__/unit/CodeImportExtension.test.ts:246` describe: 'CodeImportExtension — VS Code paste', () => {
- `../lexical/packages/lexical-code-core/src/__tests__/unit/CodeImportExtension.test.ts:247` test: 'Chrome (single outer monospace wrapper) → one CodeNode', () => {
- `../lexical/packages/lexical-code-core/src/__tests__/unit/CodeImportExtension.test.ts:258` test: 'Safari (flat sibling monospace divs / brs) → one CodeNode', () => {
- `../lexical/packages/lexical-code-core/src/__tests__/unit/CodeImportExtension.test.ts:272` test: 'paste without the VS Code structural signal does not install the overlay', () => {

## `../lexical/packages/lexical-code-core/src/__tests__/unit/CodeIndentation.test.ts`

category: portable-mixed
family: serialization-parsing / Plate plugin
target: indexed; target Plate feature package, with raw transport split to Plite only when generic

- `../lexical/packages/lexical-code-core/src/__tests__/unit/CodeIndentation.test.ts:29` describe: 'CodeIndentExtension', () => {
- `../lexical/packages/lexical-code-core/src/__tests__/unit/CodeIndentation.test.ts:30` describe: 'escapeWithArrows', () => {
- `../lexical/packages/lexical-code-core/src/__tests__/unit/CodeIndentation.test.ts:31` it: [
- `../lexical/packages/lexical-code-core/src/__tests__/unit/CodeIndentation.test.ts:67` it: [
- `../lexical/packages/lexical-code-core/src/__tests__/unit/CodeIndentation.test.ts:103` it: [
- `../lexical/packages/lexical-code-core/src/__tests__/unit/CodeIndentation.test.ts:139` it: [
- `../lexical/packages/lexical-code-core/src/__tests__/unit/CodeIndentation.test.ts:175` it: [
- `../lexical/packages/lexical-code-core/src/__tests__/unit/CodeIndentation.test.ts:210` it: [
- `../lexical/packages/lexical-code-core/src/__tests__/unit/CodeIndentation.test.ts:246` it: [
- `../lexical/packages/lexical-code-core/src/__tests__/unit/CodeIndentation.test.ts:280` it: [
- `../lexical/packages/lexical-code-core/src/__tests__/unit/CodeIndentation.test.ts:314` it: 'should not escape code block to a new paragraph by Alt/Option + ArrowDown when cursor is at the end', () => {
- `../lexical/packages/lexical-code-core/src/__tests__/unit/CodeIndentation.test.ts:346` it: 'should not escape code block to a new paragraph by Alt/Option + ArrowUp when cursor is at the beginning', () => {

## `../lexical/packages/lexical-code-core/src/__tests__/unit/CodeNode.test.ts`

category: portable-mixed
family: serialization-parsing / Plate plugin
target: indexed; target Plate feature package, with raw transport split to Plite only when generic

- `../lexical/packages/lexical-code-core/src/__tests__/unit/CodeNode.test.ts:21` describe: 'CodeNode', () => {
- `../lexical/packages/lexical-code-core/src/__tests__/unit/CodeNode.test.ts:24` it: 'applies and replaces styles through DOM style properties', async () => {
- `../lexical/packages/lexical-code-core/src/__tests__/unit/CodeNode.test.ts:53` it: 'exports styles through DOM style properties', async () => {

## `../lexical/packages/lexical-code-prism/src/__tests__/unit/CodePrismLanguageOptions.test.ts`

category: portable-mixed
family: serialization-parsing / Plate plugin
target: indexed; target Plate feature package, with raw transport split to Plite only when generic

- `../lexical/packages/lexical-code-prism/src/__tests__/unit/CodePrismLanguageOptions.test.ts:17` describe: 'Prism code language options', () => {
- `../lexical/packages/lexical-code-prism/src/__tests__/unit/CodePrismLanguageOptions.test.ts:18` test: 'includes Go (#7704)', () => {

## `../lexical/packages/lexical-code-prism/src/__tests__/unit/CodePrismNullDefaultLanguage.test.ts`

category: portable-mixed
family: serialization-parsing / Plate plugin
target: indexed; target Plate feature package, with raw transport split to Plite only when generic

- `../lexical/packages/lexical-code-prism/src/__tests__/unit/CodePrismNullDefaultLanguage.test.ts:30` describe: 'Prism defaultLanguage: null (#7235)', () => {
- `../lexical/packages/lexical-code-prism/src/__tests__/unit/CodePrismNullDefaultLanguage.test.ts:31` test: 'leaves `__language` unset and skips highlight mutation', () => {
- `../lexical/packages/lexical-code-prism/src/__tests__/unit/CodePrismNullDefaultLanguage.test.ts:49` test: 'splits text into CodeHighlightNode + LineBreakNode + TabNode for `\\n` / `\\t` so indent + line-move handlers stay compatible', () => {

## `../lexical/packages/lexical-code-prism/src/__tests__/unit/LexicalCodeNodeTabs.test.ts`

category: portable-mixed
family: serialization-parsing / Plate plugin
target: indexed; target Plate feature package, with raw transport split to Plite only when generic

- `../lexical/packages/lexical-code-prism/src/__tests__/unit/LexicalCodeNodeTabs.test.ts:46` describe: 'LexicalCodeNode tests', () => {
- `../lexical/packages/lexical-code-prism/src/__tests__/unit/LexicalCodeNodeTabs.test.ts:48` describe: 'Tabs', () => {
- `../lexical/packages/lexical-code-prism/src/__tests__/unit/LexicalCodeNodeTabs.test.ts:95` test: `testing ${scenario[2]}: ${scenario[0]} => ${scenario[1]} (${direction})`, async () => {
- `../lexical/packages/lexical-code-prism/src/__tests__/unit/LexicalCodeNodeTabs.test.ts:252` describe: 'tabSize (#8410): outdent space-indented lines', () => {
- `../lexical/packages/lexical-code-prism/src/__tests__/unit/LexicalCodeNodeTabs.test.ts:253` test: OUTDENT_SCENARIOS)(

## `../lexical/packages/lexical-code-shiki/src/__tests__/unit/CodeShikiHistory.test.ts`

category: portable-mixed
family: serialization-parsing / Plate plugin
target: indexed; target Plate feature package, with raw transport split to Plite only when generic

- `../lexical/packages/lexical-code-shiki/src/__tests__/unit/CodeShikiHistory.test.ts:41` describe: 'CodeShiki async loads do not pollute history stack', () => {
- `../lexical/packages/lexical-code-shiki/src/__tests__/unit/CodeShikiHistory.test.ts:42` test: 'creating a CodeNode with an unloaded language does not push to the undo stack', async () => {

## `../lexical/packages/lexical-code-shiki/src/__tests__/unit/CodeShikiNullDefaultLanguage.test.ts`

category: portable-mixed
family: serialization-parsing / Plate plugin
target: indexed; target Plate feature package, with raw transport split to Plite only when generic

- `../lexical/packages/lexical-code-shiki/src/__tests__/unit/CodeShikiNullDefaultLanguage.test.ts:30` describe: 'Shiki defaultLanguage: null (#7235)', () => {
- `../lexical/packages/lexical-code-shiki/src/__tests__/unit/CodeShikiNullDefaultLanguage.test.ts:31` test: 'leaves `__language` unset and skips highlight mutation', () => {
- `../lexical/packages/lexical-code-shiki/src/__tests__/unit/CodeShikiNullDefaultLanguage.test.ts:49` test: 'splits text into CodeHighlightNode + LineBreakNode + TabNode for `\\n` / `\\t` so indent + line-move handlers stay compatible', () => {

## `../lexical/packages/lexical-code-shiki/src/__tests__/unit/LexicalCodeNodeTabs.test.ts`

category: portable
family: core package behavior
target: indexed 3 test/describe lines; target packages/plite/test; add focused browser proof only when behavior depends on DOM/runtime transport

- `../lexical/packages/lexical-code-shiki/src/__tests__/unit/LexicalCodeNodeTabs.test.ts:57` describe: 'LexicalCodeNode tests', () => {
- `../lexical/packages/lexical-code-shiki/src/__tests__/unit/LexicalCodeNodeTabs.test.ts:59` describe: 'Tabs', () => {
- `../lexical/packages/lexical-code-shiki/src/__tests__/unit/LexicalCodeNodeTabs.test.ts:106` test: `testing ${scenario[2]}: ${scenario[0]} => ${scenario[1]} (${direction})`, async () => {
- `../lexical/packages/lexical-code-shiki/src/__tests__/unit/LexicalCodeNodeTabs.test.ts:289` describe: 'tabSize (#8410): outdent space-indented lines', async () => {
- `../lexical/packages/lexical-code-shiki/src/__tests__/unit/LexicalCodeNodeTabs.test.ts:294` test: OUTDENT_SCENARIOS)(

## `../lexical/packages/lexical-code/src/__tests__/unit/LexicalCodeNode.test.ts`

category: portable
family: core package behavior
target: indexed 24 test/describe lines; target packages/plite/test; add focused browser proof only when behavior depends on DOM/runtime transport

- `../lexical/packages/lexical-code/src/__tests__/unit/LexicalCodeNode.test.ts:58` describe: 'LexicalCodeNode tests', () => {
- `../lexical/packages/lexical-code/src/__tests__/unit/LexicalCodeNode.test.ts:60` test: 'CodeNode.constructor', async () => {
- `../lexical/packages/lexical-code/src/__tests__/unit/LexicalCodeNode.test.ts:71` test: 'CodeNode.createDOM()', async () => {
- `../lexical/packages/lexical-code/src/__tests__/unit/LexicalCodeNode.test.ts:88` test: 'CodeNode.updateDOM()', async () => {
- `../lexical/packages/lexical-code/src/__tests__/unit/LexicalCodeNode.test.ts:109` test: 'CodeNode.exportJSON() should return and object conforming to the expected schema', async () => {
- `../lexical/packages/lexical-code/src/__tests__/unit/LexicalCodeNode.test.ts:131` test: 'CodeNode.insertNewAfter()', async () => {
- `../lexical/packages/lexical-code/src/__tests__/unit/LexicalCodeNode.test.ts:165` test: '$createCodeNode()', async () => {
- `../lexical/packages/lexical-code/src/__tests__/unit/LexicalCodeNode.test.ts:177` test: 'can tab with collapsed selection', async () => {
- `../lexical/packages/lexical-code/src/__tests__/unit/LexicalCodeNode.test.ts:213` test: 'can tab with non-collapsed selection', async () => {
- `../lexical/packages/lexical-code/src/__tests__/unit/LexicalCodeNode.test.ts:237` test: 'can indent/outdent one line by forward selecting all line (with tabs)', async () => {
- `../lexical/packages/lexical-code/src/__tests__/unit/LexicalCodeNode.test.ts:277` test: 'can indent/outdent one line by backward selecting all line (with tabs)', async () => {
- `../lexical/packages/lexical-code/src/__tests__/unit/LexicalCodeNode.test.ts:317` test: 'can indent/outdent with collapsed selection at start of line (with tabs)', async () => {
- `../lexical/packages/lexical-code/src/__tests__/unit/LexicalCodeNode.test.ts:355` test: 'can indent/outdent multiline (with tabs)', async () => {
- `../lexical/packages/lexical-code/src/__tests__/unit/LexicalCodeNode.test.ts:389` test: 'can indent at the start of the second line', async () => {
- `../lexical/packages/lexical-code/src/__tests__/unit/LexicalCodeNode.test.ts:407` test: 'can indent when selection has a CodeNode element (with indent)', async () => {
- `../lexical/packages/lexical-code/src/__tests__/unit/LexicalCodeNode.test.ts:433` test: 'can outdent at arbitrary points in the line (with tabs)', async () => {
- `../lexical/packages/lexical-code/src/__tests__/unit/LexicalCodeNode.test.ts:457` test: 'code blocks can shift lines (with tab)', async () => {
- `../lexical/packages/lexical-code/src/__tests__/unit/LexicalCodeNode.test.ts:479` test: 'code blocks can shift multiple lines (with tab)', async () => {
- `../lexical/packages/lexical-code/src/__tests__/unit/LexicalCodeNode.test.ts:515` describe: 'arrows', () => {
- `../lexical/packages/lexical-code/src/__tests__/unit/LexicalCodeNode.test.ts:516` describe: 'rtl code lines', () => {
- `../lexical/packages/lexical-code/src/__tests__/unit/LexicalCodeNode.test.ts:539` test: 'MOVE_TO_END moves caret to visual right', async () => {
- `../lexical/packages/lexical-code/src/__tests__/unit/LexicalCodeNode.test.ts:561` test: 'MOVE_TO_START moves caret to visual left', async () => {
- `../lexical/packages/lexical-code/src/__tests__/unit/LexicalCodeNode.test.ts:585` test: 'Shift+MOVE_TO_END preserves anchor and extends focus', async () => {
- `../lexical/packages/lexical-code/src/__tests__/unit/LexicalCodeNode.test.ts:607` test: 'Shift+MOVE_TO_START preserves anchor and extends focus', async () => {
- `../lexical/packages/lexical-code/src/__tests__/unit/LexicalCodeNode.test.ts:1051` describe: 'initial editor state before transforms', () => {
- `../lexical/packages/lexical-code/src/__tests__/unit/LexicalCodeNode.test.ts:1052` test: 'can be registered after initial editor state (regression #7014)', async () => {

## `../lexical/packages/lexical-devtools-core/src/__tests__/unit/generateContentSlots.test.ts`

category: portable
family: selection-dom-mapping / nested-root
target: indexed; target current Plite package proof and browser proof when DOM-dependent

- `../lexical/packages/lexical-devtools-core/src/__tests__/unit/generateContentSlots.test.ts:25` describe: 'generateContent named slots', () => {
- `../lexical/packages/lexical-devtools-core/src/__tests__/unit/generateContentSlots.test.ts:29` test: "prints a decorator host's slot subtree reached through the children channel", () => {

## `../lexical/packages/lexical-dragon/src/__tests__/unit/LexicalDragon.test.ts`

category: portable
family: portable editor behavior
target: indexed; target current Plite package proof and browser proof when DOM-dependent

- `../lexical/packages/lexical-dragon/src/__tests__/unit/LexicalDragon.test.ts:73` describe: 'DragonExtension', () => {
- `../lexical/packages/lexical-dragon/src/__tests__/unit/LexicalDragon.test.ts:74` test: 'installDragonSupport at the entrypoint wins the registration race', () => {
- `../lexical/packages/lexical-dragon/src/__tests__/unit/LexicalDragon.test.ts:99` test: 'dispatches to the focused editor', () => {
- `../lexical/packages/lexical-dragon/src/__tests__/unit/LexicalDragon.test.ts:114` test: 'keeps working for editors created after others are disposed', () => {
- `../lexical/packages/lexical-dragon/src/__tests__/unit/LexicalDragon.test.ts:129` test: 'replaces the addressed range on makeChanges', () => {
- `../lexical/packages/lexical-dragon/src/__tests__/unit/LexicalDragon.test.ts:140` test: 'moves the selection without touching the text when text is -1', () => {
- `../lexical/packages/lexical-dragon/src/__tests__/unit/LexicalDragon.test.ts:155` test: 'applies a correction after a selection-only makeChanges', () => {
- `../lexical/packages/lexical-dragon/src/__tests__/unit/LexicalDragon.test.ts:167` test: 'collapses a final selection whose end precedes its start', () => {
- `../lexical/packages/lexical-dragon/src/__tests__/unit/LexicalDragon.test.ts:182` test: 'collapses a final selection with negative offsets', () => {
- `../lexical/packages/lexical-dragon/src/__tests__/unit/LexicalDragon.test.ts:197` test: 'ignores malformed makeChanges payloads', () => {
- `../lexical/packages/lexical-dragon/src/__tests__/unit/LexicalDragon.test.ts:211` test: 'formats the final selection when formatCommand is present', () => {
- `../lexical/packages/lexical-dragon/src/__tests__/unit/LexicalDragon.test.ts:228` test: 'does not toggle format when the final selection is collapsed', () => {
- `../lexical/packages/lexical-dragon/src/__tests__/unit/LexicalDragon.test.ts:242` test: 'ignores unknown formatCommand values', () => {
- `../lexical/packages/lexical-dragon/src/__tests__/unit/LexicalDragon.test.ts:259` test: 'handles editors mounted inside an iframe', () => {

## `../lexical/packages/lexical-extension/src/__tests__/browser/BuildEditorFromExtensions.test.ts`

category: portable-mixed
family: portable editor behavior
target: indexed; target current Plite package proof and browser proof when DOM-dependent

- `../lexical/packages/lexical-extension/src/__tests__/browser/BuildEditorFromExtensions.test.ts:56` describe: 'buildEditorFromExtensions (browser)', () => {
- `../lexical/packages/lexical-extension/src/__tests__/browser/BuildEditorFromExtensions.test.ts:57` test: 'reconciles the initial editor state into the real DOM', () => {
- `../lexical/packages/lexical-extension/src/__tests__/browser/BuildEditorFromExtensions.test.ts:67` test: 'Range.getBoundingClientRect reports real layout', () => {
- `../lexical/packages/lexical-extension/src/__tests__/browser/BuildEditorFromExtensions.test.ts:81` test: 'the native Selection API round-trips a real range', () => {

## `../lexical/packages/lexical-extension/src/__tests__/unit/ClearEditorExtension.test.ts`

category: portable-mixed
family: portable editor behavior
target: indexed; target current Plite package proof and browser proof when DOM-dependent

- `../lexical/packages/lexical-extension/src/__tests__/unit/ClearEditorExtension.test.ts:40` describe: 'ClearEditorExtension', () => {
- `../lexical/packages/lexical-extension/src/__tests__/unit/ClearEditorExtension.test.ts:41` test: 'CLEAR_EDITOR_COMMAND empties the document', () => {
- `../lexical/packages/lexical-extension/src/__tests__/unit/ClearEditorExtension.test.ts:49` test: 'a configured $onClear replaces the default behavior', () => {
- `../lexical/packages/lexical-extension/src/__tests__/unit/ClearEditorExtension.test.ts:67` test: '$onClear runs inline when dispatched from inside an update', () => {

## `../lexical/packages/lexical-extension/src/__tests__/unit/ClickAfterLastBlock.test.ts`

category: portable-mixed
family: portable editor behavior
target: indexed; target current Plite package proof and browser proof when DOM-dependent

- `../lexical/packages/lexical-extension/src/__tests__/unit/ClickAfterLastBlock.test.ts:92` describe: 'ClickAfterLastBlockExtension', () => {
- `../lexical/packages/lexical-extension/src/__tests__/unit/ClickAfterLastBlock.test.ts:93` test: 'inserts a paragraph after the last block when the last child is a block decorator', () => {
- `../lexical/packages/lexical-extension/src/__tests__/unit/ClickAfterLastBlock.test.ts:114` test: 'does nothing when the predicate rejects the last child', () => {
- `../lexical/packages/lexical-extension/src/__tests__/unit/ClickAfterLastBlock.test.ts:127` test: 'respects disabled config', () => {
- `../lexical/packages/lexical-extension/src/__tests__/unit/ClickAfterLastBlock.test.ts:140` test: 'does nothing in read-only mode', () => {
- `../lexical/packages/lexical-extension/src/__tests__/unit/ClickAfterLastBlock.test.ts:153` test: 'does nothing on an empty root with no last child', () => {

## `../lexical/packages/lexical-extension/src/__tests__/unit/DecoratorTextExtension.test.ts`

category: portable-mixed
family: selection-dom-mapping / nested-root
target: indexed; target current Plite package proof and browser proof when DOM-dependent

- `../lexical/packages/lexical-extension/src/__tests__/unit/DecoratorTextExtension.test.ts:33` test: '$applyFormatToDom is a compatibility alias for applyFormatToDom', () => {
- `../lexical/packages/lexical-extension/src/__tests__/unit/DecoratorTextExtension.test.ts:39` describe: 'DecoratorTextExtension FORMAT_TEXT_COMMAND', () => {
- `../lexical/packages/lexical-extension/src/__tests__/unit/DecoratorTextExtension.test.ts:40` test: 'aligns DecoratorTextNode to not-bold when TextNode is bold', () => {
- `../lexical/packages/lexical-extension/src/__tests__/unit/DecoratorTextExtension.test.ts:84` test: 'aligns DecoratorTextNode to bold when TextNode is not-bold', () => {
- `../lexical/packages/lexical-extension/src/__tests__/unit/DecoratorTextExtension.test.ts:119` test: 'removes bold from all nodes when every node in selection is already bold', () => {

## `../lexical/packages/lexical-extension/src/__tests__/unit/NodeSelectionDataSelected.test.ts`

category: portable-mixed
family: selection-dom-mapping / nested-root
target: indexed; target current Plite package proof and browser proof when DOM-dependent

- `../lexical/packages/lexical-extension/src/__tests__/unit/NodeSelectionDataSelected.test.ts:71` describe: 'NodeSelectionDataSelectedExtension', () => {
- `../lexical/packages/lexical-extension/src/__tests__/unit/NodeSelectionDataSelected.test.ts:72` test: 'mirrors NodeSelection onto the configured node host', () => {
- `../lexical/packages/lexical-extension/src/__tests__/unit/NodeSelectionDataSelected.test.ts:89` test: 'matches a registered subclass of the configured node', () => {
- `../lexical/packages/lexical-extension/src/__tests__/unit/NodeSelectionDataSelected.test.ts:108` test: 'removes the attribute when the node leaves the selection', () => {
- `../lexical/packages/lexical-extension/src/__tests__/unit/NodeSelectionDataSelected.test.ts:126` test: 'mirrors a NodeSelection already committed when register() runs', () => {
- `../lexical/packages/lexical-extension/src/__tests__/unit/NodeSelectionDataSelected.test.ts:181` test: 'clears the attribute from still-mounted DOM on teardown', () => {
- `../lexical/packages/lexical-extension/src/__tests__/unit/NodeSelectionDataSelected.test.ts:202` test: 'throws when a configured class is not registered on the editor', () => {

## `../lexical/packages/lexical-extension/src/__tests__/unit/NormalizeInlineElements.test.ts`

category: portable-mixed
family: portable editor behavior
target: indexed; target current Plite package proof and browser proof when DOM-dependent

- `../lexical/packages/lexical-extension/src/__tests__/unit/NormalizeInlineElements.test.ts:24` describe: 'NormalizeInlineElements', () => {
- `../lexical/packages/lexical-extension/src/__tests__/unit/NormalizeInlineElements.test.ts:25` test: 'should remove empty inline elements by default', async () => {
- `../lexical/packages/lexical-extension/src/__tests__/unit/NormalizeInlineElements.test.ts:74` test: 'should not to remove empty inline elements if extension is disabled', async () => {

## `../lexical/packages/lexical-extension/src/__tests__/unit/SelectBlockExtension.test.ts`

category: portable-mixed
family: portable editor behavior
target: indexed; target current Plite package proof and browser proof when DOM-dependent

- `../lexical/packages/lexical-extension/src/__tests__/unit/SelectBlockExtension.test.ts:120` describe: 'SelectBlockExtension', () => {
- `../lexical/packages/lexical-extension/src/__tests__/unit/SelectBlockExtension.test.ts:121` test: 'selects the block first and then the whole document', () => {
- `../lexical/packages/lexical-extension/src/__tests__/unit/SelectBlockExtension.test.ts:150` test: 'repeated select all does not change the selection', () => {
- `../lexical/packages/lexical-extension/src/__tests__/unit/SelectBlockExtension.test.ts:186` test: 'a selection spanning multiple blocks expands to the whole document', () => {
- `../lexical/packages/lexical-extension/src/__tests__/unit/SelectBlockExtension.test.ts:207` test: 'a selection anchored on the root still selects all', () => {
- `../lexical/packages/lexical-extension/src/__tests__/unit/SelectBlockExtension.test.ts:226` test: 'select all works after the document changes while fully selected', () => {
- `../lexical/packages/lexical-extension/src/__tests__/unit/SelectBlockExtension.test.ts:257` test: 'select all preserves a manually created full selection', () => {
- `../lexical/packages/lexical-extension/src/__tests__/unit/SelectBlockExtension.test.ts:284` test: 'select all in a single-block document', () => {
- `../lexical/packages/lexical-extension/src/__tests__/unit/SelectBlockExtension.test.ts:316` test: 'a node selection of an inline decorator selects its block', () => {
- `../lexical/packages/lexical-extension/src/__tests__/unit/SelectBlockExtension.test.ts:338` test: 'a node selection of a top-level decorator selects all', () => {
- `../lexical/packages/lexical-extension/src/__tests__/unit/SelectBlockExtension.test.ts:359` test: 'an empty node selection defers to other handlers', () => {
- `../lexical/packages/lexical-extension/src/__tests__/unit/SelectBlockExtension.test.ts:373` test: 'respects disabled config', () => {
- `../lexical/packages/lexical-extension/src/__tests__/unit/SelectBlockExtension.test.ts:389` test: 'enables and disables PreventSelectAllExtension together', () => {
- `../lexical/packages/lexical-extension/src/__tests__/unit/SelectBlockExtension.test.ts:407` describe: 'SelectBlockExtension with nested editors', () => {
- `../lexical/packages/lexical-extension/src/__tests__/unit/SelectBlockExtension.test.ts:408` test: 'ignores commands bubbled from a nested editor when cascadeSelection is off', () => {
- `../lexical/packages/lexical-extension/src/__tests__/unit/SelectBlockExtension.test.ts:440` test: 'cascadeSelection ignores the command until the nested editor is fully selected', () => {
- `../lexical/packages/lexical-extension/src/__tests__/unit/SelectBlockExtension.test.ts:478` test: 'cascadeSelection works when dispatched from inside a nested editor update', () => {
- `../lexical/packages/lexical-extension/src/__tests__/unit/SelectBlockExtension.test.ts:509` test: 'cascadeSelection handles the command from an empty nested editor', () => {
- `../lexical/packages/lexical-extension/src/__tests__/unit/SelectBlockExtension.test.ts:528` describe: 'PreventSelectAllExtension', () => {
- `../lexical/packages/lexical-extension/src/__tests__/unit/SelectBlockExtension.test.ts:529` test: 'does not intercept select all from an input inside the editor', () => {
- `../lexical/packages/lexical-extension/src/__tests__/unit/SelectBlockExtension.test.ts:544` test: 'select all targeting the editor itself is still intercepted', () => {

## `../lexical/packages/lexical-extension/src/__tests__/unit/SelectBlockSlots.test.ts`

category: portable-mixed
family: selection-dom-mapping / nested-root
target: indexed; target current Plite package proof and browser proof when DOM-dependent

- `../lexical/packages/lexical-extension/src/__tests__/unit/SelectBlockSlots.test.ts:177` describe: 'SelectBlockExtension with named slots', () => {
- `../lexical/packages/lexical-extension/src/__tests__/unit/SelectBlockSlots.test.ts:178` test: 'select all inside a slot selects exactly the in-slot block', () => {
- `../lexical/packages/lexical-extension/src/__tests__/unit/SelectBlockSlots.test.ts:202` test: 'repeated select all expands block, then slot, then document', () => {
- `../lexical/packages/lexical-extension/src/__tests__/unit/SelectBlockSlots.test.ts:253` test: 'a one-block slot escalates block, then document, with no dead press', () => {
- `../lexical/packages/lexical-extension/src/__tests__/unit/SelectBlockSlots.test.ts:276` test: '$isBlockFullySelected is slot-frame aware instead of throwing', () => {
- `../lexical/packages/lexical-extension/src/__tests__/unit/SelectBlockSlots.test.ts:311` test: 'a block-shaped slot value escalates value, then document', () => {
- `../lexical/packages/lexical-extension/src/__tests__/unit/SelectBlockSlots.test.ts:381` test: 'with SelectBlockExtension disabled, the rich-text default scopes select all to the slot', () => {

## `../lexical/packages/lexical-history/src/__tests__/unit/HistorySnapshotCutPaste.test.ts`

category: portable
family: clipboard / drag transport
target: indexed; target current Plite package proof and browser proof when DOM-dependent

- `../lexical/packages/lexical-history/src/__tests__/unit/HistorySnapshotCutPaste.test.ts:80` describe: [
- `../lexical/packages/lexical-history/src/__tests__/unit/HistorySnapshotCutPaste.test.ts:84` test: 'a tagged single-character change is isolated between keystrokes', () => {
- `../lexical/packages/lexical-history/src/__tests__/unit/HistorySnapshotCutPaste.test.ts:112` describe: [
- `../lexical/packages/lexical-history/src/__tests__/unit/HistorySnapshotCutPaste.test.ts:118` test: 'paste tags the update with PASTE_TAG', async () => {
- `../lexical/packages/lexical-history/src/__tests__/unit/HistorySnapshotCutPaste.test.ts:133` test: 'cut tags the update with CUT_TAG', async () => {
- `../lexical/packages/lexical-history/src/__tests__/unit/HistorySnapshotCutPaste.test.ts:164` describe: 'rich-text paste is isolated from the preceding typing (#8609)', () => {
- `../lexical/packages/lexical-history/src/__tests__/unit/HistorySnapshotCutPaste.test.ts:165` test: 'a single undo after a paste keeps the text typed before it', () => {

## `../lexical/packages/lexical-history/src/__tests__/unit/LexicalHistory.test.tsx`

category: portable
family: core package behavior
target: indexed 8 test/describe lines; target packages/plite/test; add focused browser proof only when behavior depends on DOM/runtime transport

- `../lexical/packages/lexical-history/src/__tests__/unit/LexicalHistory.test.tsx:213` describe: 'LexicalHistory tests', () => {
- `../lexical/packages/lexical-history/src/__tests__/unit/LexicalHistory.test.tsx:256` test: 'LexicalHistory after clearing', async () => {
- `../lexical/packages/lexical-history/src/__tests__/unit/LexicalHistory.test.tsx:290` test: 'LexicalHistory.Redo after Quote Node', async () => {
- `../lexical/packages/lexical-history/src/__tests__/unit/LexicalHistory.test.tsx:355` test: 'LexicalHistory in sequence: change, undo, redo, undo, change', async () => {
- `../lexical/packages/lexical-history/src/__tests__/unit/LexicalHistory.test.tsx:440` test: 'undoStack selection points to the same editor', async () => {
- `../lexical/packages/lexical-history/src/__tests__/unit/LexicalHistory.test.tsx:484` test: 'Changes to TextNode leaf are detected properly #6409', async () => {
- `../lexical/packages/lexical-history/src/__tests__/unit/LexicalHistory.test.tsx:544` describe: 'HistoryExtension canUndo/canRedo signals', () => {
- `../lexical/packages/lexical-history/src/__tests__/unit/LexicalHistory.test.tsx:578` test: 'signals start as false', () => {
- `../lexical/packages/lexical-history/src/__tests__/unit/LexicalHistory.test.tsx:585` test: 'canUndo becomes true after a push, canRedo stays false', () => {
- `../lexical/packages/lexical-history/src/__tests__/unit/LexicalHistory.test.tsx:592` test: 'canRedo becomes true after undo, canUndo goes false', () => {
- `../lexical/packages/lexical-history/src/__tests__/unit/LexicalHistory.test.tsx:600` test: 'canRedo clears after redo, canUndo returns true', () => {
- `../lexical/packages/lexical-history/src/__tests__/unit/LexicalHistory.test.tsx:609` test: 'signals reset to false after CLEAR_HISTORY_COMMAND', () => {
- `../lexical/packages/lexical-history/src/__tests__/unit/LexicalHistory.test.tsx:618` test: 'canRedo clears when a new edit is made after undo', () => {
- `../lexical/packages/lexical-history/src/__tests__/unit/LexicalHistory.test.tsx:632` test: 'canUndo is true immediately when initialized with a non-empty undoStack', () => {
- `../lexical/packages/lexical-history/src/__tests__/unit/LexicalHistory.test.tsx:646` test: 'canRedo is true immediately when initialized with a non-empty redoStack', () => {
- `../lexical/packages/lexical-history/src/__tests__/unit/LexicalHistory.test.tsx:661` test: 'signals update when historyState signal is reassigned to a populated state', () => {
- `../lexical/packages/lexical-history/src/__tests__/unit/LexicalHistory.test.tsx:679` describe: 'HistoryExtension maxDepth', () => {
- `../lexical/packages/lexical-history/src/__tests__/unit/LexicalHistory.test.tsx:702` test: 'defaults to null (unbounded) and matches the historical behavior', () => {
- `../lexical/packages/lexical-history/src/__tests__/unit/LexicalHistory.test.tsx:710` test: 'caps the undoStack to maxDepth via FIFO eviction', () => {
- `../lexical/packages/lexical-history/src/__tests__/unit/LexicalHistory.test.tsx:719` test: 'reactively respects a maxDepth signal update for future events', () => {
- `../lexical/packages/lexical-history/src/__tests__/unit/LexicalHistory.test.tsx:735` describe: 'SharedHistoryExtension', () => {
- `../lexical/packages/lexical-history/src/__tests__/unit/LexicalHistory.test.tsx:736` test: 'can create a parent editor', async () => {

## `../lexical/packages/lexical-html/src/__tests__/unit/CoreImportExtension.test.ts`

category: portable-mixed
family: serialization-parsing / Plate plugin
target: indexed; target Plate feature package, with raw transport split to Plite only when generic

- `../lexical/packages/lexical-html/src/__tests__/unit/CoreImportExtension.test.ts:79` describe: 'CoreImportExtension', () => {
- `../lexical/packages/lexical-html/src/__tests__/unit/CoreImportExtension.test.ts:80` test: 'paragraph + text', () => {
- `../lexical/packages/lexical-html/src/__tests__/unit/CoreImportExtension.test.ts:90` test: 'inline format tags propagate via ImportTextFormat', () => {
- `../lexical/packages/lexical-html/src/__tests__/unit/CoreImportExtension.test.ts:103` test: 'span with Google-Docs-style CSS pushes formats into context', () => {
- `../lexical/packages/lexical-html/src/__tests__/unit/CoreImportExtension.test.ts:117` test: '<b style="font-weight:normal"> (Google Docs wrapper) does NOT add bold', () => {
- `../lexical/packages/lexical-html/src/__tests__/unit/CoreImportExtension.test.ts:126` test: '<pre> preserves whitespace, splits on \\n into LineBreakNode', () => {
- `../lexical/packages/lexical-html/src/__tests__/unit/CoreImportExtension.test.ts:145` test: 'whitespace collapsing matches legacy behavior', () => {
- `../lexical/packages/lexical-html/src/__tests__/unit/CoreImportExtension.test.ts:155` test: '<br> creates a LineBreakNode', () => {
- `../lexical/packages/lexical-html/src/__tests__/unit/CoreImportExtension.test.ts:167` test: 'paragraph align attribute fallback', () => {
- `../lexical/packages/lexical-html/src/__tests__/unit/CoreImportExtension.test.ts:177` test: 'inline style with font-weight:normal clears inherited bold', () => {
- `../lexical/packages/lexical-html/src/__tests__/unit/CoreImportExtension.test.ts:202` test: 'sub/sup mutex: <sub><sup>x</sup></sub> ⇒ superscript only', () => {
- `../lexical/packages/lexical-html/src/__tests__/unit/CoreImportExtension.test.ts:212` test: 'text-decoration:none clears inherited underline/strikethrough', () => {
- `../lexical/packages/lexical-html/src/__tests__/unit/CoreImportExtension.test.ts:233` test: 'whitespace config can override what counts as preserving whitespace', () => {
- `../lexical/packages/lexical-html/src/__tests__/unit/CoreImportExtension.test.ts:266` test: 'whitespace config can override what counts as an inline sibling', () => {
- `../lexical/packages/lexical-html/src/__tests__/unit/CoreImportExtension.test.ts:296` test: 'session can be written by an early rule and read by a later one', () => {
- `../lexical/packages/lexical-html/src/__tests__/unit/CoreImportExtension.test.ts:345` test: '<style> can be overridden by an app-specific rule (default is now a rule, not a framework skip)', () => {
- `../lexical/packages/lexical-html/src/__tests__/unit/CoreImportExtension.test.ts:375` test: 'unconverted block elements (not just <div>) preserve block boundaries', () => {
- `../lexical/packages/lexical-html/src/__tests__/unit/CoreImportExtension.test.ts:387` test: 'text-align on a non-<div> block element is propagated to its paragraph', () => {

## `../lexical/packages/lexical-html/src/__tests__/unit/DOMImportExtension.test.ts`

category: portable-mixed
family: serialization-parsing / Plate plugin
target: indexed; target Plate feature package, with raw transport split to Plite only when generic

- `../lexical/packages/lexical-html/src/__tests__/unit/DOMImportExtension.test.ts:164` test: code.className)) {
- `../lexical/packages/lexical-html/src/__tests__/unit/DOMImportExtension.test.ts:236` describe: 'DOMImportExtension', () => {
- `../lexical/packages/lexical-html/src/__tests__/unit/DOMImportExtension.test.ts:237` test: 'basic anchor import + id decorator', () => {
- `../lexical/packages/lexical-html/src/__tests__/unit/DOMImportExtension.test.ts:259` test: 'text format propagation via ImportTextFormat context', () => {
- `../lexical/packages/lexical-html/src/__tests__/unit/DOMImportExtension.test.ts:283` test: 'RootSchema wraps stray inline runs in paragraphs', () => {
- `../lexical/packages/lexical-html/src/__tests__/unit/DOMImportExtension.test.ts:294` test: 'sibling-emitting rule (<figure> -> two paragraphs)', () => {
- `../lexical/packages/lexical-html/src/__tests__/unit/DOMImportExtension.test.ts:308` test: '$next() deferral: code rule defers to next on non-language code', () => {
- `../lexical/packages/lexical-html/src/__tests__/unit/DOMImportExtension.test.ts:322` test: 'regex capture is exposed on ctx.captures without re-running', () => {
- `../lexical/packages/lexical-html/src/__tests__/unit/DOMImportExtension.test.ts:331` test: 'per-call context: ImportSource flows to rule body', () => {
- `../lexical/packages/lexical-html/src/__tests__/unit/DOMImportExtension.test.ts:349` test: 'per-call context default is "unknown"', () => {
- `../lexical/packages/lexical-html/src/__tests__/unit/DOMImportExtension.test.ts:358` test: 'rule priority: later-registered rule runs first; can call $next()', () => {
- `../lexical/packages/lexical-html/src/__tests__/unit/DOMImportExtension.test.ts:373` test: 'CSS parser: parseSelector("p.foo") matches as expected', () => {
- `../lexical/packages/lexical-html/src/__tests__/unit/DOMImportExtension.test.ts:392` test: 'CSS parser via sel.css() chains with combinators', () => {
- `../lexical/packages/lexical-html/src/__tests__/unit/DOMImportExtension.test.ts:413` test: 'CSS selector lists dispatch tag-restricted and unrestricted groups', () => {
- `../lexical/packages/lexical-html/src/__tests__/unit/DOMImportExtension.test.ts:436` test: 'isElementOfTag narrows correctly without instanceof', () => {
- `../lexical/packages/lexical-html/src/__tests__/unit/DOMImportExtension.test.ts:448` test: 'compileImportRules: unknown tags hit wildcard bucket', () => {
- `../lexical/packages/lexical-html/src/__tests__/unit/DOMImportExtension.test.ts:465` describe: 'BlockSchema / InlineSchema', () => {
- `../lexical/packages/lexical-html/src/__tests__/unit/DOMImportExtension.test.ts:482` test: 'BlockSchema wraps inline runs in paragraphs', () => {
- `../lexical/packages/lexical-html/src/__tests__/unit/DOMImportExtension.test.ts:493` describe: 'regression sanity for the existing $generateNodesFromDOM', () => {
- `../lexical/packages/lexical-html/src/__tests__/unit/DOMImportExtension.test.ts:494` test: 'importer state does not leak between $generateNodesFromDOM calls', () => {
- `../lexical/packages/lexical-html/src/__tests__/unit/DOMImportExtension.test.ts:517` describe: '$importChildren `rules` overlay', () => {
- `../lexical/packages/lexical-html/src/__tests__/unit/DOMImportExtension.test.ts:518` test: 'overlay rules take precedence over main rules inside the subtree, and are absent outside', () => {
- `../lexical/packages/lexical-html/src/__tests__/unit/DOMImportExtension.test.ts:570` test: 'overlay rule `$next()` falls through to the main dispatcher', () => {
- `../lexical/packages/lexical-html/src/__tests__/unit/DOMImportExtension.test.ts:604` describe: 'overlay composition via defineOverlayRules', () => {
- `../lexical/packages/lexical-html/src/__tests__/unit/DOMImportExtension.test.ts:605` test: 'inlines nested overlays in priority order (earlier entry wins)', () => {
- `../lexical/packages/lexical-html/src/__tests__/unit/DOMImportExtension.test.ts:654` test: 'lower-priority overlay rule fires when the higher one calls $next()', () => {
- `../lexical/packages/lexical-html/src/__tests__/unit/DOMImportExtension.test.ts:688` describe: 'ImportContext helpers', () => {
- `../lexical/packages/lexical-html/src/__tests__/unit/DOMImportExtension.test.ts:689` test: '$getImportContextValue reads default outside an active import', () => {
- `../lexical/packages/lexical-html/src/__tests__/unit/DOMImportExtension.test.ts:696` test: 'createImportState creates a fresh state with its own default', () => {
- `../lexical/packages/lexical-html/src/__tests__/unit/DOMImportExtension.test.ts:704` test: 'an import session chains to the ambient import context', () => {

## `../lexical/packages/lexical-html/src/__tests__/unit/DOMPreprocess.test.ts`

category: portable-mixed
family: serialization-parsing / Plate plugin
target: indexed; target Plate feature package, with raw transport split to Plite only when generic

- `../lexical/packages/lexical-html/src/__tests__/unit/DOMPreprocess.test.ts:53` describe: 'DOMImportExtension preprocess', () => {
- `../lexical/packages/lexical-html/src/__tests__/unit/DOMPreprocess.test.ts:54` test: 'default $inlineStylesFromStyleSheets resolves <style> rules to inline styles', () => {
- `../lexical/packages/lexical-html/src/__tests__/unit/DOMPreprocess.test.ts:74` test: 'app preprocess can mutate the DOM before walking', () => {
- `../lexical/packages/lexical-html/src/__tests__/unit/DOMPreprocess.test.ts:102` test: 'preprocess can write to the session for the rest of the import', () => {
- `../lexical/packages/lexical-html/src/__tests__/unit/DOMPreprocess.test.ts:152` test: 'preprocess can write to the import session (shared with rules)', () => {
- `../lexical/packages/lexical-html/src/__tests__/unit/DOMPreprocess.test.ts:202` test: 'middleware chain: a wrapper preprocess can defer to a lower one via $next()', () => {
- `../lexical/packages/lexical-html/src/__tests__/unit/DOMPreprocess.test.ts:236` test: 'per-call preprocess runs in addition to config-level ones', () => {

## `../lexical/packages/lexical-html/src/__tests__/unit/DOMRenderConditionalOverrides.test.ts`

category: portable-mixed
family: serialization-parsing / Plate plugin
target: indexed; target Plate feature package, with raw transport split to Plite only when generic

- `../lexical/packages/lexical-html/src/__tests__/unit/DOMRenderConditionalOverrides.test.ts:115` describe: 'DOMRender conditional overrides', () => {
- `../lexical/packages/lexical-html/src/__tests__/unit/DOMRenderConditionalOverrides.test.ts:116` test: 'disabledForEditor removes the override and recreates live DOM', () => {
- `../lexical/packages/lexical-html/src/__tests__/unit/DOMRenderConditionalOverrides.test.ts:146` test: 'disabledForEditor re-render reuses node instances (no node map clone)', () => {
- `../lexical/packages/lexical-html/src/__tests__/unit/DOMRenderConditionalOverrides.test.ts:163` test: 'disabledForEditor $decorateDOM recreates to apply and revert decoration', () => {
- `../lexical/packages/lexical-html/src/__tests__/unit/DOMRenderConditionalOverrides.test.ts:206` test: 'disabledForSession gates export participation', () => {
- `../lexical/packages/lexical-html/src/__tests__/unit/DOMRenderConditionalOverrides.test.ts:225` test: 'disabledForSession does not affect live reconciliation', () => {

## `../lexical/packages/lexical-html/src/__tests__/unit/DOMRenderExtension.test.ts`

category: portable-mixed
family: serialization-parsing / Plate plugin
target: indexed; target Plate feature package, with raw transport split to Plite only when generic

- `../lexical/packages/lexical-html/src/__tests__/unit/DOMRenderExtension.test.ts:44` describe: 'DOMRenderExtension', () => {
- `../lexical/packages/lexical-html/src/__tests__/unit/DOMRenderExtension.test.ts:45` test: 'can override DOM create + update', () => {
- `../lexical/packages/lexical-html/src/__tests__/unit/DOMRenderExtension.test.ts:144` test: 'can override DOM export', () => {
- `../lexical/packages/lexical-html/src/__tests__/unit/DOMRenderExtension.test.ts:179` test: result.element.textContent)
- `../lexical/packages/lexical-html/src/__tests__/unit/DOMRenderExtension.test.ts:210` test: '$decorateDOM runs on create and update with correct prevNode', () => {
- `../lexical/packages/lexical-html/src/__tests__/unit/DOMRenderExtension.test.ts:291` test: '$decorateDOM overrides all run in order (base, specific, wildcard last)', () => {
- `../lexical/packages/lexical-html/src/__tests__/unit/DOMRenderExtension.test.ts:348` test: '$decorateDOM runs after children are reconciled', () => {
- `../lexical/packages/lexical-html/src/__tests__/unit/DOMRenderExtension.test.ts:385` test: 'type merge', () => {
- `../lexical/packages/lexical-html/src/__tests__/unit/DOMRenderExtension.test.ts:461` test: 'leaf-node extension can wrap createDOM and expose inner via $getDOMSlot (visible-linebreak)', () => {
- `../lexical/packages/lexical-html/src/__tests__/unit/DOMRenderExtension.test.ts:519` test: 'default leaf-node slot returns DOMSlot pointing at keyed DOM', () => {
- `../lexical/packages/lexical-html/src/__tests__/unit/DOMRenderExtension.test.ts:547` test: '$getDOMSlot returns ElementDOMSlot for ElementNode through the hook', () => {
- `../lexical/packages/lexical-html/src/__tests__/unit/DOMRenderExtension.test.ts:571` test: '$setTextContent routes text writes through a TextNode $getDOMSlot override', () => {
- `../lexical/packages/lexical-html/src/__tests__/unit/DOMRenderExtension.test.ts:574` it: slot.after). An in-place text edit must consult this

## `../lexical/packages/lexical-html/src/__tests__/unit/HorizontalRuleImportExtension.test.ts`

category: portable-mixed
family: serialization-parsing / Plate plugin
target: indexed; target Plate feature package, with raw transport split to Plite only when generic

- `../lexical/packages/lexical-html/src/__tests__/unit/HorizontalRuleImportExtension.test.ts:60` describe: 'HorizontalRuleImportExtension', () => {
- `../lexical/packages/lexical-html/src/__tests__/unit/HorizontalRuleImportExtension.test.ts:61` test: '<hr> imports as HorizontalRuleNode', () => {
- `../lexical/packages/lexical-html/src/__tests__/unit/HorizontalRuleImportExtension.test.ts:70` test: '<hr> between paragraphs preserves surrounding structure', () => {
- `../lexical/packages/lexical-html/src/__tests__/unit/HorizontalRuleImportExtension.test.ts:84` test: '<hr> is dropped when HorizontalRuleNode is not registered', () => {
- `../lexical/packages/lexical-html/src/__tests__/unit/HorizontalRuleImportExtension.test.ts:102` test: 'deprecated HorizontalRuleImportExtension alias still imports <hr>', () => {

## `../lexical/packages/lexical-html/src/__tests__/unit/Issue8391WhitespaceAroundUnknownInline.test.ts`

category: portable-mixed
family: serialization-parsing / Plate plugin
target: indexed; target Plate feature package, with raw transport split to Plite only when generic

- `../lexical/packages/lexical-html/src/__tests__/unit/Issue8391WhitespaceAroundUnknownInline.test.ts:110` describe: 'issue #8391 — whitespace around unknown inline elements', () => {
- `../lexical/packages/lexical-html/src/__tests__/unit/Issue8391WhitespaceAroundUnknownInline.test.ts:111` test: 'default config: spaces are trimmed against an unknown <tooltip> (reproduces the bug)', () => {
- `../lexical/packages/lexical-html/src/__tests__/unit/Issue8391WhitespaceAroundUnknownInline.test.ts:134` test: 'override isInline to recognize <tooltip>: spaces preserved', () => {
- `../lexical/packages/lexical-html/src/__tests__/unit/Issue8391WhitespaceAroundUnknownInline.test.ts:167` test: 'per-call override: pass the isInline predicate via the context option', () => {

## `../lexical/packages/lexical-html/src/__tests__/unit/LexicalHtml.test.ts`

category: portable
family: core package behavior
target: indexed 7 test/describe lines; target packages/plite/test; add focused browser proof only when behavior depends on DOM/runtime transport

- `../lexical/packages/lexical-html/src/__tests__/unit/LexicalHtml.test.ts:40` describe: 'HTML', () => {
- `../lexical/packages/lexical-html/src/__tests__/unit/LexicalHtml.test.ts:81` test: `[Lexical -> HTML]: ${name}`, () => {
- `../lexical/packages/lexical-html/src/__tests__/unit/LexicalHtml.test.ts:103` test: `[Lexical -> HTML]: Use provided selection`, () => {
- `../lexical/packages/lexical-html/src/__tests__/unit/LexicalHtml.test.ts:150` test: `[Lexical -> HTML]: Default selection (undefined) should serialize entire editor state`, () => {
- `../lexical/packages/lexical-html/src/__tests__/unit/LexicalHtml.test.ts:195` test: `If alignment is set on the paragraph, don't overwrite from parent empty format`, () => {
- `../lexical/packages/lexical-html/src/__tests__/unit/LexicalHtml.test.ts:225` test: `If alignment is set on the paragraph, it should take precedence over its parent block alignment`, () => {
- `../lexical/packages/lexical-html/src/__tests__/unit/LexicalHtml.test.ts:255` test: 'It should output correctly nodes whose export is DocumentFragment', () => {
- `../lexical/packages/lexical-html/src/__tests__/unit/LexicalHtml.test.ts:305` describe: '$generateNodesFromDOM: CSS class style inlining', () => {
- `../lexical/packages/lexical-html/src/__tests__/unit/LexicalHtml.test.ts:306` test: 'HTML with <style> tags inlines styles by class', () => {
- `../lexical/packages/lexical-html/src/__tests__/unit/LexicalHtml.test.ts:331` test: 'existing inline styles are preserved after inlining pass', () => {
- `../lexical/packages/lexical-html/src/__tests__/unit/LexicalHtml.test.ts:353` test: 'HTML without <style> tags works as before', () => {
- `../lexical/packages/lexical-html/src/__tests__/unit/LexicalHtml.test.ts:377` describe: 'importDOM preserves dir attribute', () => {
- `../lexical/packages/lexical-html/src/__tests__/unit/LexicalHtml.test.ts:399` test: [
- `../lexical/packages/lexical-html/src/__tests__/unit/LexicalHtml.test.ts:431` test: '[Lexical -> HTML]: slots are not auto-serialized to HTML', () => {

## `../lexical/packages/lexical-html/src/__tests__/unit/LexicalHtmlBackwardCompat.test.ts`

category: portable-mixed
family: serialization-parsing / Plate plugin
target: indexed; target Plate feature package, with raw transport split to Plite only when generic

- `../lexical/packages/lexical-html/src/__tests__/unit/LexicalHtmlBackwardCompat.test.ts:14` describe: '$generateHtmlFromNodes backward compatibility', () => {
- `../lexical/packages/lexical-html/src/__tests__/unit/LexicalHtmlBackwardCompat.test.ts:15` test: 'works inside legacy editor.getEditorState().read(cb) scope (no active editor)', () => {
- `../lexical/packages/lexical-html/src/__tests__/unit/LexicalHtmlBackwardCompat.test.ts:40` test: 'still works inside editor.read() scope (active editor present)', () => {

## `../lexical/packages/lexical-html/src/__tests__/unit/compileDOMRenderConfigOverrides.test.ts`

category: portable-mixed
family: serialization-parsing / Plate plugin
target: indexed; target Plate feature package, with raw transport split to Plite only when generic

- `../lexical/packages/lexical-html/src/__tests__/unit/compileDOMRenderConfigOverrides.test.ts:15` describe: 'precompileDOMRenderConfigOverrides', () => {
- `../lexical/packages/lexical-html/src/__tests__/unit/compileDOMRenderConfigOverrides.test.ts:16` test: 'precompiles with only type overrides', () => {
- `../lexical/packages/lexical-html/src/__tests__/unit/compileDOMRenderConfigOverrides.test.ts:79` test: 'precompiles with wildcards, predicates, and type overrides', () => {

## `../lexical/packages/lexical-link/src/__tests__/unit/AutoLinkUrlMatcher.test.ts`

category: portable-mixed
family: serialization-parsing / Plate plugin
target: indexed; target Plate feature package, with raw transport split to Plite only when generic

- `../lexical/packages/lexical-link/src/__tests__/unit/AutoLinkUrlMatcher.test.ts:13` describe: 'autoLinkUrlMatcher', () => {
- `../lexical/packages/lexical-link/src/__tests__/unit/AutoLinkUrlMatcher.test.ts:14` test: [
- `../lexical/packages/lexical-link/src/__tests__/unit/AutoLinkUrlMatcher.test.ts:41` test: [
- `../lexical/packages/lexical-link/src/__tests__/unit/AutoLinkUrlMatcher.test.ts:78` test: [
- `../lexical/packages/lexical-link/src/__tests__/unit/AutoLinkUrlMatcher.test.ts:105` test: [
- `../lexical/packages/lexical-link/src/__tests__/unit/AutoLinkUrlMatcher.test.ts:132` test: [
- `../lexical/packages/lexical-link/src/__tests__/unit/AutoLinkUrlMatcher.test.ts:159` test: [
- `../lexical/packages/lexical-link/src/__tests__/unit/AutoLinkUrlMatcher.test.ts:186` test: [

## `../lexical/packages/lexical-link/src/__tests__/unit/LinkImportExtension.test.ts`

category: portable-mixed
family: serialization-parsing / Plate plugin
target: indexed; target Plate feature package, with raw transport split to Plite only when generic

- `../lexical/packages/lexical-link/src/__tests__/unit/LinkImportExtension.test.ts:71` describe: 'LinkImportExtension', () => {
- `../lexical/packages/lexical-link/src/__tests__/unit/LinkImportExtension.test.ts:72` test: '<a href="…">text</a> → LinkNode with TextNode child', () => {
- `../lexical/packages/lexical-link/src/__tests__/unit/LinkImportExtension.test.ts:83` test: 'rel, target, title preserved', () => {
- `../lexical/packages/lexical-link/src/__tests__/unit/LinkImportExtension.test.ts:97` test: 'empty <a> with no children is skipped', () => {
- `../lexical/packages/lexical-link/src/__tests__/unit/LinkImportExtension.test.ts:107` test: 'deprecated LinkImportExtension alias still imports <a>', () => {
- `../lexical/packages/lexical-link/src/__tests__/unit/LinkImportExtension.test.ts:121` describe: 'LinkImportExtension — block children lifted out of inline parent', () => {
- `../lexical/packages/lexical-link/src/__tests__/unit/LinkImportExtension.test.ts:131` test: '<a><h1>x</h1><div>y</div></a> lifts the heading and re-wraps both runs with the link', () => {
- `../lexical/packages/lexical-link/src/__tests__/unit/LinkImportExtension.test.ts:158` test: '<a><h1>x</h1>y<h1>z</h1></a> wraps the middle inline run in its own paragraph + link', () => {
- `../lexical/packages/lexical-link/src/__tests__/unit/LinkImportExtension.test.ts:185` test: 'all-inline <a> retains the single-wrapping fast path', () => {

## `../lexical/packages/lexical-list/src/__tests__/unit/LexicalListItemNode.test.ts`

category: portable
family: serialization-parsing / marks-inline
target: indexed 34 test/describe lines; target packages/plite/test; packages/plite-history/test; apps/www/tests/plite-browser/donor/examples/richtext.test.ts

- `../lexical/packages/lexical-list/src/__tests__/unit/LexicalListItemNode.test.ts:56` describe: 'LexicalListItemNode tests', () => {
- `../lexical/packages/lexical-list/src/__tests__/unit/LexicalListItemNode.test.ts:58` test: 'ListItemNode.constructor', async () => {
- `../lexical/packages/lexical-list/src/__tests__/unit/LexicalListItemNode.test.ts:72` test: 'ListItemNode.createDOM()', async () => {
- `../lexical/packages/lexical-list/src/__tests__/unit/LexicalListItemNode.test.ts:97` describe: 'ListItemNode.updateDOM()', () => {
- `../lexical/packages/lexical-list/src/__tests__/unit/LexicalListItemNode.test.ts:98` test: 'base', async () => {
- `../lexical/packages/lexical-list/src/__tests__/unit/LexicalListItemNode.test.ts:131` test: 'nested list', async () => {
- `../lexical/packages/lexical-list/src/__tests__/unit/LexicalListItemNode.test.ts:170` describe: 'ListItemNode.replace()', () => {
- `../lexical/packages/lexical-list/src/__tests__/unit/LexicalListItemNode.test.ts:218` test: 'another list item node', async () => {
- `../lexical/packages/lexical-list/src/__tests__/unit/LexicalListItemNode.test.ts:251` test: 'first list item with a non list item node', async () => {
- `../lexical/packages/lexical-list/src/__tests__/unit/LexicalListItemNode.test.ts:306` test: 'last list item with a non list item node', async () => {
- `../lexical/packages/lexical-list/src/__tests__/unit/LexicalListItemNode.test.ts:335` test: 'middle list item with a non list item node', async () => {
- `../lexical/packages/lexical-list/src/__tests__/unit/LexicalListItemNode.test.ts:366` test: 'the only list item with a non list item node', async () => {
- `../lexical/packages/lexical-list/src/__tests__/unit/LexicalListItemNode.test.ts:409` describe: 'ListItemNode.remove()', () => {
- `../lexical/packages/lexical-list/src/__tests__/unit/LexicalListItemNode.test.ts:413` test: 'siblings are not nested', async () => {
- `../lexical/packages/lexical-list/src/__tests__/unit/LexicalListItemNode.test.ts:481` test: 'the previous sibling is nested', async () => {
- `../lexical/packages/lexical-list/src/__tests__/unit/LexicalListItemNode.test.ts:561` test: 'the next sibling is nested', async () => {
- `../lexical/packages/lexical-list/src/__tests__/unit/LexicalListItemNode.test.ts:641` test: 'both siblings are nested', async () => {
- `../lexical/packages/lexical-list/src/__tests__/unit/LexicalListItemNode.test.ts:730` test: 'the previous sibling is nested deeper than the next sibling', async () => {
- `../lexical/packages/lexical-list/src/__tests__/unit/LexicalListItemNode.test.ts:840` test: 'the next sibling is nested deeper than the previous sibling', async () => {
- `../lexical/packages/lexical-list/src/__tests__/unit/LexicalListItemNode.test.ts:951` test: 'both siblings are deeply nested', async () => {
- `../lexical/packages/lexical-list/src/__tests__/unit/LexicalListItemNode.test.ts:1075` describe: 'ListItemNode.insertNewAfter(): non-empty list items', () => {
- `../lexical/packages/lexical-list/src/__tests__/unit/LexicalListItemNode.test.ts:1123` test: 'first list item', async () => {
- `../lexical/packages/lexical-list/src/__tests__/unit/LexicalListItemNode.test.ts:1154` test: 'last list item', async () => {
- `../lexical/packages/lexical-list/src/__tests__/unit/LexicalListItemNode.test.ts:1185` test: 'middle list item', async () => {
- `../lexical/packages/lexical-list/src/__tests__/unit/LexicalListItemNode.test.ts:1216` test: 'the only list item', async () => {
- `../lexical/packages/lexical-list/src/__tests__/unit/LexicalListItemNode.test.ts:1263` test: '$createListItemNode()', async () => {
- `../lexical/packages/lexical-list/src/__tests__/unit/LexicalListItemNode.test.ts:1277` test: '$isListItemNode()', async () => {
- `../lexical/packages/lexical-list/src/__tests__/unit/LexicalListItemNode.test.ts:1287` describe: 'ListItemNode.setIndent()', () => {
- `../lexical/packages/lexical-list/src/__tests__/unit/LexicalListItemNode.test.ts:1308` it: 'indents and outdents list item', async () => {
- `../lexical/packages/lexical-list/src/__tests__/unit/LexicalListItemNode.test.ts:1368` it: 'handles fractional indent values', async () => {
- `../lexical/packages/lexical-list/src/__tests__/unit/LexicalListItemNode.test.ts:1381` test: 'Can serialize a node that is not attached', async () => {
- `../lexical/packages/lexical-list/src/__tests__/unit/LexicalListItemNode.test.ts:1400` test: 'ListItemNode marker style inheritance on indent', async () => {
- `../lexical/packages/lexical-list/src/__tests__/unit/LexicalListItemNode.test.ts:1427` test: 'Default: Splitting a list resets numbering to 1 (Backward Compatibility)', async () => {
- `../lexical/packages/lexical-list/src/__tests__/unit/LexicalListItemNode.test.ts:1467` test: 'Option Enabled: Splitting a list preserves numbering (Smart Behavior)', async () => {
- `../lexical/packages/lexical-list/src/__tests__/unit/LexicalListItemNode.test.ts:1506` describe: 'ListItemNode $transform wraps orphan ListItemNodes', () => {
- `../lexical/packages/lexical-list/src/__tests__/unit/LexicalListItemNode.test.ts:1507` test: 'wraps a single orphan ListItemNode under root in a ListNode', () => {
- `../lexical/packages/lexical-list/src/__tests__/unit/LexicalListItemNode.test.ts:1537` test: 'wraps adjacent orphan ListItemNodes in a single ListNode', () => {
- `../lexical/packages/lexical-list/src/__tests__/unit/LexicalListItemNode.test.ts:1563` test: 'does not merge orphan ListItemNodes separated by a ParagraphNode', () => {
- `../lexical/packages/lexical-list/src/__tests__/unit/LexicalListItemNode.test.ts:1591` test: 'parses HTML with orphan <li> outside of <ul>', () => {
- `../lexical/packages/lexical-list/src/__tests__/unit/LexicalListItemNode.test.ts:1633` test: 'preserves the selection on the orphan when it is wrapped', () => {
- `../lexical/packages/lexical-list/src/__tests__/unit/LexicalListItemNode.test.ts:1664` test: 'preserves a selection anchored outside the orphan', () => {
- `../lexical/packages/lexical-list/src/__tests__/unit/LexicalListItemNode.test.ts:1695` test: 'wraps orphan ListItemNode inside a paragraph with no siblings', () => {
- `../lexical/packages/lexical-list/src/__tests__/unit/LexicalListItemNode.test.ts:1722` test: 'wraps orphan ListItemNode inside a paragraph with prev siblings', () => {
- `../lexical/packages/lexical-list/src/__tests__/unit/LexicalListItemNode.test.ts:1752` test: 'wraps orphan ListItemNode inside a paragraph with next siblings', () => {
- `../lexical/packages/lexical-list/src/__tests__/unit/LexicalListItemNode.test.ts:1782` test: 'wraps orphan ListItemNode inside a paragraph with both siblings', () => {
- `../lexical/packages/lexical-list/src/__tests__/unit/LexicalListItemNode.test.ts:1815` test: 'wraps orphan ListItemNode inside a shadow-root table cell', () => {

## `../lexical/packages/lexical-list/src/__tests__/unit/LexicalListNode.test.ts`

category: portable
family: serialization-parsing / marks-inline
target: indexed 23 test/describe lines; target packages/plite/test; packages/plite-history/test; apps/www/tests/plite-browser/donor/examples/richtext.test.ts

- `../lexical/packages/lexical-list/src/__tests__/unit/LexicalListNode.test.ts:55` describe: 'LexicalListNode tests', () => {
- `../lexical/packages/lexical-list/src/__tests__/unit/LexicalListNode.test.ts:57` test: 'ListNode.constructor', async () => {
- `../lexical/packages/lexical-list/src/__tests__/unit/LexicalListNode.test.ts:71` test: 'ListNode.getTag()', async () => {
- `../lexical/packages/lexical-list/src/__tests__/unit/LexicalListNode.test.ts:84` test: 'ListNode.createDOM()', async () => {
- `../lexical/packages/lexical-list/src/__tests__/unit/LexicalListNode.test.ts:109` test: 'ListNode.createDOM() correctly applies classes to a nested ListNode', async () => {
- `../lexical/packages/lexical-list/src/__tests__/unit/LexicalListNode.test.ts:190` test: 'ListNode.updateDOM()', async () => {
- `../lexical/packages/lexical-list/src/__tests__/unit/LexicalListNode.test.ts:215` test: 'ListNode.append() should properly transform a ListItemNode', async () => {
- `../lexical/packages/lexical-list/src/__tests__/unit/LexicalListNode.test.ts:232` test: 'ListNode.append() should properly transform a ListNode', async () => {
- `../lexical/packages/lexical-list/src/__tests__/unit/LexicalListNode.test.ts:257` test: 'ListNode.append() should properly transform a ParagraphNode', async () => {
- `../lexical/packages/lexical-list/src/__tests__/unit/LexicalListNode.test.ts:273` test: 'ListNode.append() should wrap an InlineNode in a ListItemNode without converting it to TextNode', async () => {
- `../lexical/packages/lexical-list/src/__tests__/unit/LexicalListNode.test.ts:312` test: 'ListNode.splice() should wrap multiple non-ListItem nodes in individual ListItem nodes', async () => {
- `../lexical/packages/lexical-list/src/__tests__/unit/LexicalListNode.test.ts:345` test: 'Should update list children when switching from checklist to bullet', async () => {
- `../lexical/packages/lexical-list/src/__tests__/unit/LexicalListNode.test.ts:374` test: 'Should clear checklist attributes when nesting lists', async () => {
- `../lexical/packages/lexical-list/src/__tests__/unit/LexicalListNode.test.ts:438` test: '$createListNode()', async () => {
- `../lexical/packages/lexical-list/src/__tests__/unit/LexicalListNode.test.ts:452` test: '$isListNode()', async () => {
- `../lexical/packages/lexical-list/src/__tests__/unit/LexicalListNode.test.ts:462` test: '$createListNode() with tag name (backward compatibility)', async () => {
- `../lexical/packages/lexical-list/src/__tests__/unit/LexicalListNode.test.ts:475` describe: 'LexicalListNode subclassing tests ($config)', () => {
- `../lexical/packages/lexical-list/src/__tests__/unit/LexicalListNode.test.ts:504` describe: 'ListNode as-is', () =>
- `../lexical/packages/lexical-list/src/__tests__/unit/LexicalListNode.test.ts:507` test: 'applies transform', () => {
- `../lexical/packages/lexical-list/src/__tests__/unit/LexicalListNode.test.ts:523` describe: 'ListNodeConfig (no replacement)', () =>
- `../lexical/packages/lexical-list/src/__tests__/unit/LexicalListNode.test.ts:526` test: 'applies transform', () => {
- `../lexical/packages/lexical-list/src/__tests__/unit/LexicalListNode.test.ts:542` describe: 'ListNodeSubclass (no replacement)', () =>
- `../lexical/packages/lexical-list/src/__tests__/unit/LexicalListNode.test.ts:545` test: 'applies transform', () => {

## `../lexical/packages/lexical-list/src/__tests__/unit/ListExtension.test.ts`

category: portable
family: serialization-parsing / marks-inline
target: indexed 5 test/describe lines; target packages/plite/test; packages/plite-history/test; apps/www/tests/plite-browser/donor/examples/richtext.test.ts

- `../lexical/packages/lexical-list/src/__tests__/unit/ListExtension.test.ts:23` describe: 'ListExtension', () => {
- `../lexical/packages/lexical-list/src/__tests__/unit/ListExtension.test.ts:36` it: 'Creates the list', () => {
- `../lexical/packages/lexical-list/src/__tests__/unit/ListExtension.test.ts:47` describe: 'CheckListExtension', () => {
- `../lexical/packages/lexical-list/src/__tests__/unit/ListExtension.test.ts:61` it: 'Preserves numbering when configured via extension', () => {
- `../lexical/packages/lexical-list/src/__tests__/unit/ListExtension.test.ts:118` it: 'Creates the list', () => {

## `../lexical/packages/lexical-list/src/__tests__/unit/ListImportExtension.test.ts`

category: portable-mixed
family: serialization-parsing / Plate plugin
target: indexed; target Plate feature package, with raw transport split to Plite only when generic

- `../lexical/packages/lexical-list/src/__tests__/unit/ListImportExtension.test.ts:89` describe: 'ListImportExtension', () => {
- `../lexical/packages/lexical-list/src/__tests__/unit/ListImportExtension.test.ts:90` test: '<ul><li>a</li><li>b</li></ul> → bullet list with two items', () => {
- `../lexical/packages/lexical-list/src/__tests__/unit/ListImportExtension.test.ts:103` test: '<ol start="3"> → number list with start=3', () => {
- `../lexical/packages/lexical-list/src/__tests__/unit/ListImportExtension.test.ts:113` test: 'GitHub task-list-item → checklist item', () => {
- `../lexical/packages/lexical-list/src/__tests__/unit/ListImportExtension.test.ts:129` test: 'aria-checked drives checklist state', () => {
- `../lexical/packages/lexical-list/src/__tests__/unit/ListImportExtension.test.ts:140` test: 'stray text inside <ul> gets wrapped via $normalizeListChildren', () => {
- `../lexical/packages/lexical-list/src/__tests__/unit/ListImportExtension.test.ts:155` test: 'deprecated ListImportExtension alias still imports lists', () => {
- `../lexical/packages/lexical-list/src/__tests__/unit/ListImportExtension.test.ts:224` test: marker) ? 'number' : 'bullet';
- `../lexical/packages/lexical-list/src/__tests__/unit/ListImportExtension.test.ts:246` test: node.className);
- `../lexical/packages/lexical-list/src/__tests__/unit/ListImportExtension.test.ts:336` test: meta.getAttribute('content') \|\| '')) {
- `../lexical/packages/lexical-list/src/__tests__/unit/ListImportExtension.test.ts:422` describe: 'MS Word paste — preprocess-installed overlay', () => {
- `../lexical/packages/lexical-list/src/__tests__/unit/ListImportExtension.test.ts:423` test: 'converts MsoListParagraph runs into nested ListNodes', () => {
- `../lexical/packages/lexical-list/src/__tests__/unit/ListImportExtension.test.ts:468` test: 'without the Generator meta the overlay is not installed', () => {
- `../lexical/packages/lexical-list/src/__tests__/unit/ListImportExtension.test.ts:484` describe: 'ListItemNode block flattening', () => {
- `../lexical/packages/lexical-list/src/__tests__/unit/ListImportExtension.test.ts:493` test: 'keeps contiguous inlines together, breaking only at block boundaries', () => {
- `../lexical/packages/lexical-list/src/__tests__/unit/ListImportExtension.test.ts:508` test: 'treats a non-paragraph block (<hr>) as a boundary, not inline content', () => {
- `../lexical/packages/lexical-list/src/__tests__/unit/ListImportExtension.test.ts:529` test: 'preserves a nested list instead of flattening it', () => {

## `../lexical/packages/lexical-list/src/__tests__/unit/checkList.test.tsx`

category: portable-mixed
family: serialization-parsing / Plate plugin
target: indexed; target Plate feature package, with raw transport split to Plite only when generic

- `../lexical/packages/lexical-list/src/__tests__/unit/checkList.test.tsx:31` describe: 'CheckListExtension mobile tap toggle', () => {
- `../lexical/packages/lexical-list/src/__tests__/unit/checkList.test.tsx:101` it: 'touch pointerup over the marker area toggles the item', () => {
- `../lexical/packages/lexical-list/src/__tests__/unit/checkList.test.tsx:121` it: 'mouse pointerup is ignored (click stays the desktop path)', () => {
- `../lexical/packages/lexical-list/src/__tests__/unit/checkList.test.tsx:139` it: 'pointerup followed by a synthesized click does not double-toggle', () => {
- `../lexical/packages/lexical-list/src/__tests__/unit/checkList.test.tsx:170` it: 'rapid taps on two different items toggle both within the dedup window', () => {

## `../lexical/packages/lexical-list/src/__tests__/unit/formatList.test.ts`

category: portable
family: serialization-parsing / marks-inline
target: indexed 16 test/describe lines; target packages/plite/test; packages/plite-history/test; apps/www/tests/plite-browser/donor/examples/richtext.test.ts

- `../lexical/packages/lexical-list/src/__tests__/unit/formatList.test.ts:86` describe: 'insertList', () => {
- `../lexical/packages/lexical-list/src/__tests__/unit/formatList.test.ts:88` test: 'inserting with empty root selection', async () => {
- `../lexical/packages/lexical-list/src/__tests__/unit/formatList.test.ts:110` test: 'inserting in root selection with existing child', async () => {
- `../lexical/packages/lexical-list/src/__tests__/unit/formatList.test.ts:135` test: 'inserting with empty shadow root selection', async () => {
- `../lexical/packages/lexical-list/src/__tests__/unit/formatList.test.ts:163` test: 'formatting empty list items', async () => {
- `../lexical/packages/lexical-list/src/__tests__/unit/formatList.test.ts:190` test: 'preserves element-anchored selection when converting paragraph with linebreak to list', async () => {
- `../lexical/packages/lexical-list/src/__tests__/unit/formatList.test.ts:236` describe: '$handleListInsertParagraph', () => {
- `../lexical/packages/lexical-list/src/__tests__/unit/formatList.test.ts:238` test: 'exits list when list item is completely empty', async () => {
- `../lexical/packages/lexical-list/src/__tests__/unit/formatList.test.ts:265` test: 'exits list when list item contains only whitespace', async () => {
- `../lexical/packages/lexical-list/src/__tests__/unit/formatList.test.ts:294` test: 'extends list when list item contains non-whitespace content', async () => {
- `../lexical/packages/lexical-list/src/__tests__/unit/formatList.test.ts:320` test: 'extends list when list item contains a decorator node', async () => {
- `../lexical/packages/lexical-list/src/__tests__/unit/formatList.test.ts:346` test: 'splits list when the empty element is not the last one', async () => {
- `../lexical/packages/lexical-list/src/__tests__/unit/formatList.test.ts:389` describe: '$handleIndent', () => {
- `../lexical/packages/lexical-list/src/__tests__/unit/formatList.test.ts:392` test: 'creates a new nested sublist', async () => {
- `../lexical/packages/lexical-list/src/__tests__/unit/formatList.test.ts:425` describe: '$handleOutdent', () => {
- `../lexical/packages/lexical-list/src/__tests__/unit/formatList.test.ts:427` test: 'removes the nested list and replaces list item', async () => {
- `../lexical/packages/lexical-list/src/__tests__/unit/formatList.test.ts:462` describe: 'ListItemNode.collapseAtStart', () => {
- `../lexical/packages/lexical-list/src/__tests__/unit/formatList.test.ts:463` test: 'top-level single item converts to paragraph', () => {
- `../lexical/packages/lexical-list/src/__tests__/unit/formatList.test.ts:488` test: 'top-level first item extracts as paragraph, keeps remaining list', () => {
- `../lexical/packages/lexical-list/src/__tests__/unit/formatList.test.ts:520` test: 'indented item outdents instead of converting to paragraph', () => {
- `../lexical/packages/lexical-list/src/__tests__/unit/formatList.test.ts:558` test: 'indented item with siblings outdents without breaking list', () => {
- `../lexical/packages/lexical-list/src/__tests__/unit/formatList.test.ts:606` test: 'middle item converts to paragraph and splits list', () => {
- `../lexical/packages/lexical-list/src/__tests__/unit/formatList.test.ts:641` test: 'split preserves list type', () => {
- `../lexical/packages/lexical-list/src/__tests__/unit/formatList.test.ts:672` test: 'last item converts to paragraph without splitting', () => {
- `../lexical/packages/lexical-list/src/__tests__/unit/formatList.test.ts:703` test: 'empty middle item converts to empty paragraph and splits list', () => {
- `../lexical/packages/lexical-list/src/__tests__/unit/formatList.test.ts:742` test: 'empty indented item outdents', () => {

## `../lexical/packages/lexical-list/src/__tests__/unit/registerListBackspaceDecorator.test.ts`

category: portable-mixed
family: selection-dom-mapping / nested-root
target: indexed; target Plate feature package, with raw transport split to Plite only when generic

- `../lexical/packages/lexical-list/src/__tests__/unit/registerListBackspaceDecorator.test.ts:57` describe: 'registerList — Backspace adjacent to DecoratorNode (#5072)', () => {
- `../lexical/packages/lexical-list/src/__tests__/unit/registerListBackspaceDecorator.test.ts:58` describe: 'preserves the decorator and demotes the first list item', () => {
- `../lexical/packages/lexical-list/src/__tests__/unit/registerListBackspaceDecorator.test.ts:146` test: 'block decorator + single-item list — list is removed', () => {
- `../lexical/packages/lexical-list/src/__tests__/unit/registerListBackspaceDecorator.test.ts:185` test: 'two adjacent block decorators + list — both preserved', () => {
- `../lexical/packages/lexical-list/src/__tests__/unit/registerListBackspaceDecorator.test.ts:230` describe: 'first item converts to paragraph via collapseAtStart', () => {
- `../lexical/packages/lexical-list/src/__tests__/unit/registerListBackspaceDecorator.test.ts:231` test: 'no decorator before the list', () => {
- `../lexical/packages/lexical-list/src/__tests__/unit/registerListBackspaceDecorator.test.ts:274` test: 'caret on the second list item — converts to paragraph via collapseAtStart', () => {
- `../lexical/packages/lexical-list/src/__tests__/unit/registerListBackspaceDecorator.test.ts:315` test: 'caret in the middle of the first list item', () => {
- `../lexical/packages/lexical-list/src/__tests__/unit/registerListBackspaceDecorator.test.ts:348` test: 'nested list — outdents inner item', () => {
- `../lexical/packages/lexical-list/src/__tests__/unit/registerListBackspaceDecorator.test.ts:376` test: 'isolated decorator before the list', () => {
- `../lexical/packages/lexical-list/src/__tests__/unit/registerListBackspaceDecorator.test.ts:413` test: 'empty first list item — converts to empty paragraph', () => {

## `../lexical/packages/lexical-list/src/__tests__/unit/registerListStrictIndentTransform.test.ts`

category: portable
family: serialization-parsing / marks-inline
target: indexed 2 test/describe lines; target packages/plite/test; packages/plite-history/test; apps/www/tests/plite-browser/donor/examples/richtext.test.ts

- `../lexical/packages/lexical-list/src/__tests__/unit/registerListStrictIndentTransform.test.ts:18` describe: 'Lexical List StrictIndentTransform tests', () => {
- `../lexical/packages/lexical-list/src/__tests__/unit/registerListStrictIndentTransform.test.ts:25` test: 'applyStrictListIndentation', async () => {

## `../lexical/packages/lexical-list/src/__tests__/unit/utils.test.ts`

category: portable
family: core package behavior
target: indexed 11 test/describe lines; target packages/plite/test; add focused browser proof only when behavior depends on DOM/runtime transport

- `../lexical/packages/lexical-list/src/__tests__/unit/utils.test.ts:19` describe: 'Lexical List Utils tests', () => {
- `../lexical/packages/lexical-list/src/__tests__/unit/utils.test.ts:21` test: 'getListDepth should return the 1-based depth of a list with one levels', async () => {
- `../lexical/packages/lexical-list/src/__tests__/unit/utils.test.ts:39` test: 'getListDepth should return the 1-based depth of a list with two levels', async () => {
- `../lexical/packages/lexical-list/src/__tests__/unit/utils.test.ts:72` test: 'getListDepth should return the 1-based depth of a list with five levels', async () => {
- `../lexical/packages/lexical-list/src/__tests__/unit/utils.test.ts:117` test: 'getTopListNode should return the top list node when the list is a direct child of the RootNode', async () => {
- `../lexical/packages/lexical-list/src/__tests__/unit/utils.test.ts:148` test: 'getTopListNode should return the top list node when the list is not a direct child of the RootNode', async () => {
- `../lexical/packages/lexical-list/src/__tests__/unit/utils.test.ts:180` test: 'getTopListNode should return the top list node when the list item is deeply nested.', async () => {
- `../lexical/packages/lexical-list/src/__tests__/unit/utils.test.ts:218` test: 'isLastItemInList should return true if the listItem is the last in a nested list.', async () => {
- `../lexical/packages/lexical-list/src/__tests__/unit/utils.test.ts:253` test: 'isLastItemInList should return true if the listItem is the last in a non-nested list.', async () => {
- `../lexical/packages/lexical-list/src/__tests__/unit/utils.test.ts:279` test: 'isLastItemInList should return false if the listItem is not the last in a nested list.', async () => {
- `../lexical/packages/lexical-list/src/__tests__/unit/utils.test.ts:314` test: 'isLastItemInList should return true if the listItem is not the last in a non-nested list.', async () => {

## `../lexical/packages/lexical-markdown/src/__tests__/unit/LexicalMarkdown.test.ts`

category: portable
family: serialization-parsing / marks-inline
target: indexed 41 test/describe lines; target packages/plite/test; packages/plite-history/test; apps/www/tests/plite-browser/donor/examples/richtext.test.ts

- `../lexical/packages/lexical-markdown/src/__tests__/unit/LexicalMarkdown.test.ts:281` describe: 'Markdown', () => {
- `../lexical/packages/lexical-markdown/src/__tests__/unit/LexicalMarkdown.test.ts:884` it: `can import "${md.replace(/\n/g, '\\n')}"`, () => {
- `../lexical/packages/lexical-markdown/src/__tests__/unit/LexicalMarkdown.test.ts:932` it: `can export "${md.replace(/\n/g, '\\n')}"`, () => {
- `../lexical/packages/lexical-markdown/src/__tests__/unit/LexicalMarkdown.test.ts:980` it: `should not select when importing "${md.replace(/\n/g, '\\n')}"`, () => {
- `../lexical/packages/lexical-markdown/src/__tests__/unit/LexicalMarkdown.test.ts:1014` it: 'should not remove leading node and transform if replace returns false', () => {
- `../lexical/packages/lexical-markdown/src/__tests__/unit/LexicalMarkdown.test.ts:1061` it: 'should remove leading node and execute transform if replace does not return false', () => {
- `../lexical/packages/lexical-markdown/src/__tests__/unit/LexicalMarkdown.test.ts:1108` it: ['1. ', '- ', '* ', '+ '])(
- `../lexical/packages/lexical-markdown/src/__tests__/unit/LexicalMarkdown.test.ts:1157` it: 'can round-trip nested fenced code blocks (4 backticks wrapping 3 backticks)', () => {
- `../lexical/packages/lexical-markdown/src/__tests__/unit/LexicalMarkdown.test.ts:1191` it: 'can round-trip deeply nested fenced code blocks (5 backticks wrapping 4 backticks)', () => {
- `../lexical/packages/lexical-markdown/src/__tests__/unit/LexicalMarkdown.test.ts:1226` it: 'computes fence dynamically when code block content contains backticks', () => {
- `../lexical/packages/lexical-markdown/src/__tests__/unit/LexicalMarkdown.test.ts:1254` describe: 'overlapping inline formats (#4895)', () => {
- `../lexical/packages/lexical-markdown/src/__tests__/unit/LexicalMarkdown.test.ts:1322` it: 'round-trips bold overlapping italic (the issue example)', () => {
- `../lexical/packages/lexical-markdown/src/__tests__/unit/LexicalMarkdown.test.ts:1335` it: 'round-trips italic overlapping bold', () => {
- `../lexical/packages/lexical-markdown/src/__tests__/unit/LexicalMarkdown.test.ts:1348` it: 'round-trips strikethrough overlapping bold', () => {
- `../lexical/packages/lexical-markdown/src/__tests__/unit/LexicalMarkdown.test.ts:1359` it: 'round-trips a code span inside a bold run', () => {
- `../lexical/packages/lexical-markdown/src/__tests__/unit/LexicalMarkdown.test.ts:1370` it: 'imports a partially consumed delimiter run like CommonMark', () => {
- `../lexical/packages/lexical-markdown/src/__tests__/unit/LexicalMarkdown.test.ts:1392` describe: 'list marker', () => {
- `../lexical/packages/lexical-markdown/src/__tests__/unit/LexicalMarkdown.test.ts:1393` it: 'should remember marker used on import', () => {
- `../lexical/packages/lexical-markdown/src/__tests__/unit/LexicalMarkdown.test.ts:1415` it: 'should not use [ as a marker for an implicit check list', () => {
- `../lexical/packages/lexical-markdown/src/__tests__/unit/LexicalMarkdown.test.ts:1439` it: 'should remember the marker for checkbox with an explicit marker', () => {
- `../lexical/packages/lexical-markdown/src/__tests__/unit/LexicalMarkdown.test.ts:1464` it: 'should remember marker used on export', () => {
- `../lexical/packages/lexical-markdown/src/__tests__/unit/LexicalMarkdown.test.ts:1492` describe: 'Enter key triggers', () => {
- `../lexical/packages/lexical-markdown/src/__tests__/unit/LexicalMarkdown.test.ts:1493` it: 'should create an empty code block when ``` is typed and Enter is pressed', () => {
- `../lexical/packages/lexical-markdown/src/__tests__/unit/LexicalMarkdown.test.ts:1533` it: 'should create a code block with language when ```javascript is typed and Enter is pressed', () => {
- `../lexical/packages/lexical-markdown/src/__tests__/unit/LexicalMarkdown.test.ts:1573` it: 'should not transform on Enter when replace returns false', () => {
- `../lexical/packages/lexical-markdown/src/__tests__/unit/LexicalMarkdown.test.ts:1626` it: 'should transform element markdown on Enter when trailing space was not required (custom element transformer)', () => {
- `../lexical/packages/lexical-markdown/src/__tests__/unit/LexicalMarkdown.test.ts:1682` it: 'should transform heading on Enter when a line was inserted at once (no trailing space listener trigger)', () => {
- `../lexical/packages/lexical-markdown/src/__tests__/unit/LexicalMarkdown.test.ts:1723` describe: 'composition-end trigger characters (#7026)', () => {
- `../lexical/packages/lexical-markdown/src/__tests__/unit/LexicalMarkdown.test.ts:1750` it: 'applies inline code when the closing backtick is committed via compositionend', () => {
- `../lexical/packages/lexical-markdown/src/__tests__/unit/LexicalMarkdown.test.ts:1799` it: 'applies inline code when compositionend commits the trigger as a multi-character chunk', () => {
- `../lexical/packages/lexical-markdown/src/__tests__/unit/LexicalMarkdown.test.ts:1844` describe: 'normalizeMarkdown - shouldMergeAdjacentLines = true', () => {
- `../lexical/packages/lexical-markdown/src/__tests__/unit/LexicalMarkdown.test.ts:1845` it: 'should combine lines separated by a single \n unless they are in a codeblock', () => {
- `../lexical/packages/lexical-markdown/src/__tests__/unit/LexicalMarkdown.test.ts:1909` it: 'keeps fence-like lines that carry an info string as code content', () => {
- `../lexical/packages/lexical-markdown/src/__tests__/unit/LexicalMarkdown.test.ts:1925` it: 'does not close a longer fence on a shorter inner fence', () => {
- `../lexical/packages/lexical-markdown/src/__tests__/unit/LexicalMarkdown.test.ts:1936` it: 'closes a shorter opening fence with a longer closing fence', () => {
- `../lexical/packages/lexical-markdown/src/__tests__/unit/LexicalMarkdown.test.ts:1954` it: 'keeps content unmerged in an unclosed code block', () => {
- `../lexical/packages/lexical-markdown/src/__tests__/unit/LexicalMarkdown.test.ts:1966` it: 'tables', () => {
- `../lexical/packages/lexical-markdown/src/__tests__/unit/LexicalMarkdown.test.ts:1975` it: 'merges adjacent plain text lines with a single space', () => {
- `../lexical/packages/lexical-markdown/src/__tests__/unit/LexicalMarkdown.test.ts:1981` it: 'merges while trimming the next line and inserting a single space', () => {
- `../lexical/packages/lexical-markdown/src/__tests__/unit/LexicalMarkdown.test.ts:1987` it: 'does not merge across HTML-like tags (opening, content, closing, after)', () => {
- `../lexical/packages/lexical-markdown/src/__tests__/unit/LexicalMarkdown.test.ts:1996` it: 'does not merge the fence line with the first line after a code block', () => {
- `../lexical/packages/lexical-markdown/src/__tests__/unit/LexicalMarkdown.test.ts:2002` it: 'preserves hard-break trailing spaces when merging adjacent lines', () => {
- `../lexical/packages/lexical-markdown/src/__tests__/unit/LexicalMarkdown.test.ts:2007` it: 'preserves exact hard-break trailing spaces when merging adjacent lines', () => {
- `../lexical/packages/lexical-markdown/src/__tests__/unit/LexicalMarkdown.test.ts:2012` it: 'preserves backslash hard-breaks when merging adjacent lines', () => {
- `../lexical/packages/lexical-markdown/src/__tests__/unit/LexicalMarkdown.test.ts:2018` it: 'merges a soft break before a hard-breaking line', () => {
- `../lexical/packages/lexical-markdown/src/__tests__/unit/LexicalMarkdown.test.ts:2023` it: 'treats whitespace-only lines as empty separators (no merge across them)', () => {
- `../lexical/packages/lexical-markdown/src/__tests__/unit/LexicalMarkdown.test.ts:2033` it: 'mdx start tag followed by content, than closing tag preceded by content', () => {
- `../lexical/packages/lexical-markdown/src/__tests__/unit/LexicalMarkdown.test.ts:2042` describe: 'normalizeMarkdown - shouldMergeAdjacentLines = false', () => {
- `../lexical/packages/lexical-markdown/src/__tests__/unit/LexicalMarkdown.test.ts:2043` it: 'should not combine lines separated by a single \n', () => {
- `../lexical/packages/lexical-markdown/src/__tests__/unit/LexicalMarkdown.test.ts:2110` it: 'tables', () => {
- `../lexical/packages/lexical-markdown/src/__tests__/unit/LexicalMarkdown.test.ts:2119` it: 'preserves trailing whitespace on content lines', () => {
- `../lexical/packages/lexical-markdown/src/__tests__/unit/LexicalMarkdown.test.ts:2124` it: 'collapses whitespace-only lines to empty (paragraph separator)', () => {
- `../lexical/packages/lexical-markdown/src/__tests__/unit/LexicalMarkdown.test.ts:2129` it: 'preserves leading whitespace on content lines', () => {
- `../lexical/packages/lexical-markdown/src/__tests__/unit/LexicalMarkdown.test.ts:2134` it: 'preserves indented fenced code blocks nested inside tags', () => {
- `../lexical/packages/lexical-markdown/src/__tests__/unit/LexicalMarkdown.test.ts:2146` describe: 'markdown hard line break import', () => {
- `../lexical/packages/lexical-markdown/src/__tests__/unit/LexicalMarkdown.test.ts:2147` it: 'preserves hard line break when shouldPreserveNewLines is true', () => {
- `../lexical/packages/lexical-markdown/src/__tests__/unit/LexicalMarkdown.test.ts:2185` it: 'preserves backslash hard line break when shouldPreserveNewLines is true', () => {
- `../lexical/packages/lexical-markdown/src/__tests__/unit/LexicalMarkdown.test.ts:2224` describe: 'markdown whitespace import (default mode)', () => {
- `../lexical/packages/lexical-markdown/src/__tests__/unit/LexicalMarkdown.test.ts:2309` it: 'preserves trailing whitespace on a standalone paragraph line (default mode)', () => {
- `../lexical/packages/lexical-markdown/src/__tests__/unit/LexicalMarkdown.test.ts:2333` it: 'preserves leading whitespace on a standalone paragraph line (default mode)', () => {
- `../lexical/packages/lexical-markdown/src/__tests__/unit/LexicalMarkdown.test.ts:2356` it: 'preserves two-space hard line break in default mode', () => {
- `../lexical/packages/lexical-markdown/src/__tests__/unit/LexicalMarkdown.test.ts:2362` it: 'preserves exact hard line break spaces in default mode', () => {
- `../lexical/packages/lexical-markdown/src/__tests__/unit/LexicalMarkdown.test.ts:2366` it: 'preserves backslash hard line break in default mode', () => {
- `../lexical/packages/lexical-markdown/src/__tests__/unit/LexicalMarkdown.test.ts:2370` it: 'stores a two-space hard line break marker after formatted text', () => {
- `../lexical/packages/lexical-markdown/src/__tests__/unit/LexicalMarkdown.test.ts:2374` it: 'stores exact hard line break spaces after formatted text', () => {
- `../lexical/packages/lexical-markdown/src/__tests__/unit/LexicalMarkdown.test.ts:2378` it: 'stores a two-space hard line break marker after a link', () => {
- `../lexical/packages/lexical-markdown/src/__tests__/unit/LexicalMarkdown.test.ts:2385` it: 'does not infer a hard line break marker from spaces inside a link', () => {
- `../lexical/packages/lexical-markdown/src/__tests__/unit/LexicalMarkdown.test.ts:2420` it: 'stores a two-space hard line break marker after formatted blockquote text', () => {
- `../lexical/packages/lexical-markdown/src/__tests__/unit/LexicalMarkdown.test.ts:2424` it: 'preserves two-space hard line break in merge-adjacent mode', () => {
- `../lexical/packages/lexical-markdown/src/__tests__/unit/LexicalMarkdown.test.ts:2428` it: 'preserves exact hard line break spaces in merge-adjacent mode', () => {
- `../lexical/packages/lexical-markdown/src/__tests__/unit/LexicalMarkdown.test.ts:2432` it: 'preserves backslash hard line break in merge-adjacent mode', () => {
- `../lexical/packages/lexical-markdown/src/__tests__/unit/LexicalMarkdown.test.ts:2436` it: 'preserves two-space hard line break between blockquote lines', () => {
- `../lexical/packages/lexical-markdown/src/__tests__/unit/LexicalMarkdown.test.ts:2440` it: 'preserves exact hard line break spaces between blockquote lines', () => {
- `../lexical/packages/lexical-markdown/src/__tests__/unit/LexicalMarkdown.test.ts:2444` it: 'preserves backslash hard line break between blockquote lines', () => {
- `../lexical/packages/lexical-markdown/src/__tests__/unit/LexicalMarkdown.test.ts:2448` it: 'exports exact hard line break markers from line break state', () => {
- `../lexical/packages/lexical-markdown/src/__tests__/unit/LexicalMarkdown.test.ts:2479` it: 'does not copy markdown hard line break markers when line breaks are copied', () => {
- `../lexical/packages/lexical-markdown/src/__tests__/unit/LexicalMarkdown.test.ts:2501` describe: 'markdown Safari compatibility (issue #8012)', () => {
- `../lexical/packages/lexical-markdown/src/__tests__/unit/LexicalMarkdown.test.ts:2523` it: 'does not throw when constructing markdown regex patterns', () => {
- `../lexical/packages/lexical-markdown/src/__tests__/unit/LexicalMarkdown.test.ts:2532` it: 'parses a code span at the start of a string', () => {
- `../lexical/packages/lexical-markdown/src/__tests__/unit/LexicalMarkdown.test.ts:2536` it: 'parses a code span in the middle of text', () => {
- `../lexical/packages/lexical-markdown/src/__tests__/unit/LexicalMarkdown.test.ts:2540` it: 'parses multiple code spans on the same line', () => {
- `../lexical/packages/lexical-markdown/src/__tests__/unit/LexicalMarkdown.test.ts:2544` it: 'does not parse a backtick preceded by a backslash as a code span', () => {
- `../lexical/packages/lexical-markdown/src/__tests__/unit/LexicalMarkdown.test.ts:2556` it: 'correctly captures code span content', () => {
- `../lexical/packages/lexical-markdown/src/__tests__/unit/LexicalMarkdown.test.ts:2561` it: 'does not apply emphasis formatting inside a code span', () => {
- `../lexical/packages/lexical-markdown/src/__tests__/unit/LexicalMarkdown.test.ts:2566` describe: 'inline code with backticks (CommonMark code spans)', () => {
- `../lexical/packages/lexical-markdown/src/__tests__/unit/LexicalMarkdown.test.ts:2603` it: 'round-trips code spans whose content contains backticks', () => {
- `../lexical/packages/lexical-markdown/src/__tests__/unit/LexicalMarkdown.test.ts:2609` it: 'exports a content-derived fence longer than any backtick run', () => {
- `../lexical/packages/lexical-markdown/src/__tests__/unit/LexicalMarkdown.test.ts:2616` it: 'normalizes a redundant inline fence to the minimal valid fence', () => {
- `../lexical/packages/lexical-markdown/src/__tests__/unit/LexicalMarkdown.test.ts:2623` it: 'keeps the code fence innermost when combined with bold', () => {
- `../lexical/packages/lexical-markdown/src/__tests__/unit/LexicalMarkdown.test.ts:2628` describe: '$convertSelectionToMarkdownString', () => {
- `../lexical/packages/lexical-markdown/src/__tests__/unit/LexicalMarkdown.test.ts:2642` it: 'converts full selection to markdown', () => {
- `../lexical/packages/lexical-markdown/src/__tests__/unit/LexicalMarkdown.test.ts:2661` it: 'converts partial text selection to markdown', () => {
- `../lexical/packages/lexical-markdown/src/__tests__/unit/LexicalMarkdown.test.ts:2680` it: 'converts selection with bold text to markdown', () => {
- `../lexical/packages/lexical-markdown/src/__tests__/unit/LexicalMarkdown.test.ts:2707` it: 'returns empty string for null selection', () => {
- `../lexical/packages/lexical-markdown/src/__tests__/unit/LexicalMarkdown.test.ts:2712` it: 'returns empty string for collapsed selection', () => {
- `../lexical/packages/lexical-markdown/src/__tests__/unit/LexicalMarkdown.test.ts:2731` it: 'converts backward selection to markdown', () => {
- `../lexical/packages/lexical-markdown/src/__tests__/unit/LexicalMarkdown.test.ts:2750` it: 'converts multi-paragraph selection to markdown', () => {
- `../lexical/packages/lexical-markdown/src/__tests__/unit/LexicalMarkdown.test.ts:2777` it: 'converts selection within a list to markdown', () => {
- `../lexical/packages/lexical-markdown/src/__tests__/unit/LexicalMarkdown.test.ts:2806` it: 'preserves link when partially selecting link text', () => {
- `../lexical/packages/lexical-markdown/src/__tests__/unit/LexicalMarkdown.test.ts:2829` it: 'list partial selection only includes selected items', () => {
- `../lexical/packages/lexical-markdown/src/__tests__/unit/LexicalMarkdown.test.ts:2861` it: 'quote partial selection only includes selected text', () => {
- `../lexical/packages/lexical-markdown/src/__tests__/unit/LexicalMarkdown.test.ts:2882` it: 'nested list partial selection only includes selected nested items', () => {
- `../lexical/packages/lexical-markdown/src/__tests__/unit/LexicalMarkdown.test.ts:2917` describe: 'Ordered list start adjustment (#8677)', () => {
- `../lexical/packages/lexical-markdown/src/__tests__/unit/LexicalMarkdown.test.ts:2927` it: 'updates list start when typed marker precedes an existing ordered list', () => {
- `../lexical/packages/lexical-markdown/src/__tests__/unit/LexicalMarkdown.test.ts:2961` it: 'respects an arbitrary typed start number', () => {
- `../lexical/packages/lexical-markdown/src/__tests__/unit/LexicalMarkdown.test.ts:2994` it: 'does not change start when typed marker follows an existing ordered list', () => {
- `../lexical/packages/lexical-markdown/src/__tests__/unit/LexicalMarkdown.test.ts:3030` it: 'creates a fresh ordered list when the next sibling is a different list type', () => {
- `../lexical/packages/lexical-markdown/src/__tests__/unit/LexicalMarkdown.test.ts:3067` describe: '$generateNodesFromMarkdownString', () => {
- `../lexical/packages/lexical-markdown/src/__tests__/unit/LexicalMarkdown.test.ts:3081` it: 'returns nodes without modifying the root', () => {
- `../lexical/packages/lexical-markdown/src/__tests__/unit/LexicalMarkdown.test.ts:3111` it: 'produces the same nodes as $convertFromMarkdownString', () => {
- `../lexical/packages/lexical-markdown/src/__tests__/unit/LexicalMarkdown.test.ts:3139` it: 'returned nodes can be inserted at selection', () => {
- `../lexical/packages/lexical-markdown/src/__tests__/unit/LexicalMarkdown.test.ts:3176` it: 'handles adjacent line merging (commonmark)', () => {

## `../lexical/packages/lexical-markdown/src/__tests__/unit/MarkdownTransformers.test.ts`

category: portable
family: serialization-parsing / marks-inline
target: indexed 5 test/describe lines; target packages/plite/test; packages/plite-history/test; apps/www/tests/plite-browser/donor/examples/richtext.test.ts

- `../lexical/packages/lexical-markdown/src/__tests__/unit/MarkdownTransformers.test.ts:56` describe: 'LINK', () => {
- `../lexical/packages/lexical-markdown/src/__tests__/unit/MarkdownTransformers.test.ts:57` test: 'text before a markdown link is preserved', () => {
- `../lexical/packages/lexical-markdown/src/__tests__/unit/MarkdownTransformers.test.ts:72` test: 'formatted text before a markdown link is preserved', () => {
- `../lexical/packages/lexical-markdown/src/__tests__/unit/MarkdownTransformers.test.ts:94` test: 'LINK is not too greedy if there is a preceding match that was not processed', () => {
- `../lexical/packages/lexical-markdown/src/__tests__/unit/MarkdownTransformers.test.ts:127` test: 'markdown link should not be created inside another link.', async () => {
- `../lexical/packages/lexical-markdown/src/__tests__/unit/MarkdownTransformers.test.ts:164` describe: 'CODE_SPAN_PRECEDENCE', () => {
- `../lexical/packages/lexical-markdown/src/__tests__/unit/MarkdownTransformers.test.ts:165` test: '__bold__ inside backticks is not formatted as bold', () => {
- `../lexical/packages/lexical-markdown/src/__tests__/unit/MarkdownTransformers.test.ts:181` test: '**bold** inside backticks is not formatted as bold', () => {
- `../lexical/packages/lexical-markdown/src/__tests__/unit/MarkdownTransformers.test.ts:197` test: '*italic* inside backticks is not formatted as italic', () => {
- `../lexical/packages/lexical-markdown/src/__tests__/unit/MarkdownTransformers.test.ts:213` test: '__bold__ without backticks still formats as bold', () => {
- `../lexical/packages/lexical-markdown/src/__tests__/unit/MarkdownTransformers.test.ts:228` test: '__bold__ after a completed code span still formats as bold', () => {
- `../lexical/packages/lexical-markdown/src/__tests__/unit/MarkdownTransformers.test.ts:247` describe: 'WRAPPING_PRESERVES_FORMAT', () => {
- `../lexical/packages/lexical-markdown/src/__tests__/unit/MarkdownTransformers.test.ts:248` test: '**...** around already-bold text preserves bold', () => {
- `../lexical/packages/lexical-markdown/src/__tests__/unit/MarkdownTransformers.test.ts:274` test: '**...** around mixed-format text formats every wrapped node bold', () => {
- `../lexical/packages/lexical-markdown/src/__tests__/unit/MarkdownTransformers.test.ts:304` describe: 'HISTORY', () => {
- `../lexical/packages/lexical-markdown/src/__tests__/unit/MarkdownTransformers.test.ts:305` test: 'undo after markdown format transform preserves typed markdown text', () => {

## `../lexical/packages/lexical-mdast/src/__tests__/unit/MdastExtension.test.ts`

category: portable-mixed
family: serialization-parsing / Plate plugin
target: indexed; target Plate feature package, with raw transport split to Plite only when generic

- `../lexical/packages/lexical-mdast/src/__tests__/unit/MdastExtension.test.ts:38` describe: '@lexical/mdast extensions', () => {
- `../lexical/packages/lexical-mdast/src/__tests__/unit/MdastExtension.test.ts:39` it: 'feature extensions ship the nodes their rules need', () => {
- `../lexical/packages/lexical-mdast/src/__tests__/unit/MdastExtension.test.ts:59` it: 'exposes the Markdown API through extension outputs', () => {
- `../lexical/packages/lexical-mdast/src/__tests__/unit/MdastExtension.test.ts:81` it: 'MdastExtension bundles import and export', () => {
- `../lexical/packages/lexical-mdast/src/__tests__/unit/MdastExtension.test.ts:99` it: 'wires up streaming shortcuts via MdastShortcutsExtension', () => {
- `../lexical/packages/lexical-mdast/src/__tests__/unit/MdastExtension.test.ts:130` it: 'block shortcuts only fire for features in the editor', () => {

## `../lexical/packages/lexical-mdast/src/__tests__/unit/MdastHtmlExtension.test.ts`

category: portable-mixed
family: serialization-parsing / Plate plugin
target: indexed; target Plate feature package, with raw transport split to Plite only when generic

- `../lexical/packages/lexical-mdast/src/__tests__/unit/MdastHtmlExtension.test.ts:335` describe: 'MdastHtmlExtension', () => {
- `../lexical/packages/lexical-mdast/src/__tests__/unit/MdastHtmlExtension.test.ts:336` describe: 'routing raw HTML through the DOM import rules', () => {
- `../lexical/packages/lexical-mdast/src/__tests__/unit/MdastHtmlExtension.test.ts:337` it: 'imports a custom element with only a DOM rule registered', () => {
- `../lexical/packages/lexical-mdast/src/__tests__/unit/MdastHtmlExtension.test.ts:354` it: 'imports node-package DOM rules (headings, lists, links)', () => {
- `../lexical/packages/lexical-mdast/src/__tests__/unit/MdastHtmlExtension.test.ts:374` it: 'hoists unknown wrappers to their imported children', () => {
- `../lexical/packages/lexical-mdast/src/__tests__/unit/MdastHtmlExtension.test.ts:380` it: 'leaves unclosed raw HTML as literal text', () => {
- `../lexical/packages/lexical-mdast/src/__tests__/unit/MdastHtmlExtension.test.ts:393` it: 'keeps unclosed inline raw HTML literal', () => {
- `../lexical/packages/lexical-mdast/src/__tests__/unit/MdastHtmlExtension.test.ts:406` it: 'drops HTML comments like GitHub does', () => {
- `../lexical/packages/lexical-mdast/src/__tests__/unit/MdastHtmlExtension.test.ts:418` it: 'drops a comment-only html block', () => {
- `../lexical/packages/lexical-mdast/src/__tests__/unit/MdastHtmlExtension.test.ts:422` it: 'keeps an unclosed tag prefix as literal text', () => {
- `../lexical/packages/lexical-mdast/src/__tests__/unit/MdastHtmlExtension.test.ts:441` it: 'imports every typing prefix of a details block without crashing', () => {
- `../lexical/packages/lexical-mdast/src/__tests__/unit/MdastHtmlExtension.test.ts:461` describe: 'sequence reassembly (tag balance)', () => {
- `../lexical/packages/lexical-mdast/src/__tests__/unit/MdastHtmlExtension.test.ts:462` it: 'reassembles interleaved Markdown blocks in order', () => {
- `../lexical/packages/lexical-mdast/src/__tests__/unit/MdastHtmlExtension.test.ts:468` it: 'handles nested elements split across fragments', () => {
- `../lexical/packages/lexical-mdast/src/__tests__/unit/MdastHtmlExtension.test.ts:476` it: 'counts balance across a fragment with both open and close tags', () => {
- `../lexical/packages/lexical-mdast/src/__tests__/unit/MdastHtmlExtension.test.ts:483` it: 'ignores void tags for balance', () => {
- `../lexical/packages/lexical-mdast/src/__tests__/unit/MdastHtmlExtension.test.ts:489` it: 'reassembles sequences nested in Markdown containers', () => {
- `../lexical/packages/lexical-mdast/src/__tests__/unit/MdastHtmlExtension.test.ts:496` describe: 'Markdown text embedded in the raw HTML', () => {
- `../lexical/packages/lexical-mdast/src/__tests__/unit/MdastHtmlExtension.test.ts:497` it: 'parses Markdown on the tag line (the <summary> idiom)', () => {
- `../lexical/packages/lexical-mdast/src/__tests__/unit/MdastHtmlExtension.test.ts:504` it: 'parses a fully inline construct', () => {
- `../lexical/packages/lexical-mdast/src/__tests__/unit/MdastHtmlExtension.test.ts:510` it: 'uses the registry grammar (GFM strikethrough)', () => {
- `../lexical/packages/lexical-mdast/src/__tests__/unit/MdastHtmlExtension.test.ts:514` it: 'preserves spacing around inline HTML neighbors', () => {
- `../lexical/packages/lexical-mdast/src/__tests__/unit/MdastHtmlExtension.test.ts:520` it: 'applies inline HTML formatting to its raw text', () => {
- `../lexical/packages/lexical-mdast/src/__tests__/unit/MdastHtmlExtension.test.ts:538` it: 'never parses Markdown inside raw-content elements', () => {
- `../lexical/packages/lexical-mdast/src/__tests__/unit/MdastHtmlExtension.test.ts:554` it: 'collapses formatting whitespace at element boundaries', () => {
- `../lexical/packages/lexical-mdast/src/__tests__/unit/MdastHtmlExtension.test.ts:560` describe: 'inline raw HTML inside phrasing content', () => {
- `../lexical/packages/lexical-mdast/src/__tests__/unit/MdastHtmlExtension.test.ts:561` it: 'imports an inline tag run through the DOM rules', () => {
- `../lexical/packages/lexical-mdast/src/__tests__/unit/MdastHtmlExtension.test.ts:580` it: 'imports a span with attributes as its content', () => {
- `../lexical/packages/lexical-mdast/src/__tests__/unit/MdastHtmlExtension.test.ts:598` it: 'inherits an ImportTextStyle context onto the wrapped Markdown', () => {
- `../lexical/packages/lexical-mdast/src/__tests__/unit/MdastHtmlExtension.test.ts:623` it: 'composes html formatting with Markdown formatting', () => {
- `../lexical/packages/lexical-mdast/src/__tests__/unit/MdastHtmlExtension.test.ts:640` it: 'imports an inline <br> as a line break', () => {
- `../lexical/packages/lexical-mdast/src/__tests__/unit/MdastHtmlExtension.test.ts:644` it: 'drops an inline comment', () => {
- `../lexical/packages/lexical-mdast/src/__tests__/unit/MdastHtmlExtension.test.ts:657` it: 'handles inline runs inside headings and emphasis', () => {
- `../lexical/packages/lexical-mdast/src/__tests__/unit/MdastHtmlExtension.test.ts:676` it: 'imports an inline custom element with only a DOM rule registered', () => {
- `../lexical/packages/lexical-mdast/src/__tests__/unit/MdastHtmlExtension.test.ts:695` it: 'round-trips an inline custom element as phrasing', () => {
- `../lexical/packages/lexical-mdast/src/__tests__/unit/MdastHtmlExtension.test.ts:700` it: 'serializes Markdown formatting inside the inline wrapper', () => {
- `../lexical/packages/lexical-mdast/src/__tests__/unit/MdastHtmlExtension.test.ts:723` describe: 'interaction with plain spans and templates', () => {
- `../lexical/packages/lexical-mdast/src/__tests__/unit/MdastHtmlExtension.test.ts:724` it: 'does not treat ordinary spans/templates as placeholders', () => {
- `../lexical/packages/lexical-mdast/src/__tests__/unit/MdastHtmlExtension.test.ts:733` describe: 'rawHtmlBlock export templates', () => {
- `../lexical/packages/lexical-mdast/src/__tests__/unit/MdastHtmlExtension.test.ts:734` it: 'round-trips a phrasing template verbatim', () => {
- `../lexical/packages/lexical-mdast/src/__tests__/unit/MdastHtmlExtension.test.ts:740` it: 'serializes flow blocks with blank-line joins', () => {
- `../lexical/packages/lexical-mdast/src/__tests__/unit/MdastHtmlExtension.test.ts:752` it: 'escapes the embedded Markdown edges', () => {
- `../lexical/packages/lexical-mdast/src/__tests__/unit/MdastHtmlExtension.test.ts:759` describe: '$exportViaDOM', () => {
- `../lexical/packages/lexical-mdast/src/__tests__/unit/MdastHtmlExtension.test.ts:760` it: 'derives the Markdown encoding from the exportDOM shell', () => {
- `../lexical/packages/lexical-mdast/src/__tests__/unit/MdastHtmlExtension.test.ts:784` it: 'is a fixed point of the round trip', () => {
- `../lexical/packages/lexical-mdast/src/__tests__/unit/MdastHtmlExtension.test.ts:791` it: 'follows the $getChildNodes override of the exportDOM shell', () => {
- `../lexical/packages/lexical-mdast/src/__tests__/unit/MdastHtmlExtension.test.ts:800` it: 'normalizes boolean attributes and strips the slot markers', () => {
- `../lexical/packages/lexical-mdast/src/__tests__/unit/MdastHtmlExtension.test.ts:809` it: 'sets RenderContextMarkdownExport so exportDOM can diverge', () => {
- `../lexical/packages/lexical-mdast/src/__tests__/unit/MdastHtmlExtension.test.ts:830` describe: 'ImportContextMarkdown', () => {
- `../lexical/packages/lexical-mdast/src/__tests__/unit/MdastHtmlExtension.test.ts:831` it: 'distinguishes Markdown import from a direct DOM import', () => {
- `../lexical/packages/lexical-mdast/src/__tests__/unit/MdastHtmlExtension.test.ts:853` it: 'context layered by an mdast handler reaches DOM rules in raw HTML', () => {

## `../lexical/packages/lexical-mdast/src/__tests__/unit/MdastImportExport.test.ts`

category: portable-mixed
family: serialization-parsing / Plate plugin
target: indexed; target Plate feature package, with raw transport split to Plite only when generic

- `../lexical/packages/lexical-mdast/src/__tests__/unit/MdastImportExport.test.ts:93` describe: '@lexical/mdast import/export', () => {
- `../lexical/packages/lexical-mdast/src/__tests__/unit/MdastImportExport.test.ts:94` describe: 'round-trips simple constructs', () => {
- `../lexical/packages/lexical-mdast/src/__tests__/unit/MdastImportExport.test.ts:120` it: name, () => {
- `../lexical/packages/lexical-mdast/src/__tests__/unit/MdastImportExport.test.ts:126` describe: 'overlapping inline formats (#4895)', () => {
- `../lexical/packages/lexical-mdast/src/__tests__/unit/MdastImportExport.test.ts:185` it: 'round-trips bold overlapping italic (the issue example)', () => {
- `../lexical/packages/lexical-mdast/src/__tests__/unit/MdastImportExport.test.ts:198` it: 'round-trips italic overlapping bold', () => {
- `../lexical/packages/lexical-mdast/src/__tests__/unit/MdastImportExport.test.ts:211` it: 'round-trips strikethrough overlapping bold', () => {
- `../lexical/packages/lexical-mdast/src/__tests__/unit/MdastImportExport.test.ts:222` it: 'round-trips a code span inside a bold run', () => {
- `../lexical/packages/lexical-mdast/src/__tests__/unit/MdastImportExport.test.ts:234` it: 'round-trips an ordered list with a custom start', () => {
- `../lexical/packages/lexical-mdast/src/__tests__/unit/MdastImportExport.test.ts:238` it: 'round-trips a fenced code block with a language', () => {
- `../lexical/packages/lexical-mdast/src/__tests__/unit/MdastImportExport.test.ts:243` it: 'round-trips a multi-line fenced code block', () => {
- `../lexical/packages/lexical-mdast/src/__tests__/unit/MdastImportExport.test.ts:248` it: 'imports a heading with inline formatting into the right structure', () => {
- `../lexical/packages/lexical-mdast/src/__tests__/unit/MdastImportExport.test.ts:270` it: 'imports nested unordered lists', () => {
- `../lexical/packages/lexical-mdast/src/__tests__/unit/MdastImportExport.test.ts:286` it: 'keeps blank lines as paragraph separators (not empty paragraphs)', () => {
- `../lexical/packages/lexical-mdast/src/__tests__/unit/MdastImportExport.test.ts:290` describe: 'preserves the original Markdown syntax', () => {
- `../lexical/packages/lexical-mdast/src/__tests__/unit/MdastImportExport.test.ts:313` it: name, () => {
- `../lexical/packages/lexical-mdast/src/__tests__/unit/MdastImportExport.test.ts:318` it: 'keeps distinct bullet styles on different lists', () => {
- `../lexical/packages/lexical-mdast/src/__tests__/unit/MdastImportExport.test.ts:323` it: 'keeps setext style when the content starts with #', () => {
- `../lexical/packages/lexical-mdast/src/__tests__/unit/MdastImportExport.test.ts:332` it: 'normalizes mixed emphasis markers to the document delimiter', () => {
- `../lexical/packages/lexical-mdast/src/__tests__/unit/MdastImportExport.test.ts:340` it: 'round-trips autolink literals without normalizing to <...>', () => {
- `../lexical/packages/lexical-mdast/src/__tests__/unit/MdastImportExport.test.ts:370` describe: 'mdast tree interop', () => {
- `../lexical/packages/lexical-mdast/src/__tests__/unit/MdastImportExport.test.ts:371` it: '$convertToMdast exposes the mdast tree before serialization', () => {
- `../lexical/packages/lexical-mdast/src/__tests__/unit/MdastImportExport.test.ts:397` it: '$convertFromMdast imports a programmatically-built tree', () => {
- `../lexical/packages/lexical-mdast/src/__tests__/unit/MdastImportExport.test.ts:423` it: 'round-trips editor -> tree -> editor', () => {
- `../lexical/packages/lexical-mdast/src/__tests__/unit/MdastImportExport.test.ts:444` it: 'applies contributed document-level toMarkdown options', () => {
- `../lexical/packages/lexical-mdast/src/__tests__/unit/MdastImportExport.test.ts:490` it: '$generateNodesFromMarkdownString returns detached nodes without touching the document', () => {
- `../lexical/packages/lexical-mdast/src/__tests__/unit/MdastImportExport.test.ts:515` it: 'generated nodes can be inserted at an arbitrary position', () => {
- `../lexical/packages/lexical-mdast/src/__tests__/unit/MdastImportExport.test.ts:547` it: '$generateNodesFromMdast returns detached nodes for a pre-parsed tree', () => {
- `../lexical/packages/lexical-mdast/src/__tests__/unit/MdastImportExport.test.ts:570` describe: '$convertSelectionToMarkdownString', () => {
- `../lexical/packages/lexical-mdast/src/__tests__/unit/MdastImportExport.test.ts:608` it: 'exports a partial text selection', () => {
- `../lexical/packages/lexical-mdast/src/__tests__/unit/MdastImportExport.test.ts:614` it: 'keeps formatting on a selection spanning formatted text', () => {
- `../lexical/packages/lexical-mdast/src/__tests__/unit/MdastImportExport.test.ts:622` it: 'returns an empty string for a null or collapsed selection', () => {
- `../lexical/packages/lexical-mdast/src/__tests__/unit/MdastImportExport.test.ts:637` it: 'exports a multi-paragraph selection and skips unselected blocks', () => {
- `../lexical/packages/lexical-mdast/src/__tests__/unit/MdastImportExport.test.ts:648` it: 'exports only the selected list items', () => {
- `../lexical/packages/lexical-mdast/src/__tests__/unit/MdastImportExport.test.ts:656` it: 'keeps the heading structure for a partial heading selection', () => {
- `../lexical/packages/lexical-mdast/src/__tests__/unit/MdastImportExport.test.ts:662` it: 'keeps the link wrapper when link text is partially selected', () => {
- `../lexical/packages/lexical-mdast/src/__tests__/unit/MdastImportExport.test.ts:671` it: 'exposes the selection to contributed to-markdown handlers', () => {
- `../lexical/packages/lexical-mdast/src/__tests__/unit/MdastImportExport.test.ts:718` describe: 'import context', () => {
- `../lexical/packages/lexical-mdast/src/__tests__/unit/MdastImportExport.test.ts:726` it: 'runs handlers under ImportContextMarkdown with nested layering', () => {
- `../lexical/packages/lexical-mdast/src/__tests__/unit/MdastImportExport.test.ts:786` it: 'unwraps constructs the editor has no extension for', () => {
- `../lexical/packages/lexical-mdast/src/__tests__/unit/MdastImportExport.test.ts:812` it: 'imports an autolink literal (gfm) as a link', () => {
- `../lexical/packages/lexical-mdast/src/__tests__/unit/MdastImportExport.test.ts:836` it: 'is idempotent for a complex document', () => {
- `../lexical/packages/lexical-mdast/src/__tests__/unit/MdastImportExport.test.ts:859` describe: 'with MdastTableExtension', () => {
- `../lexical/packages/lexical-mdast/src/__tests__/unit/MdastImportExport.test.ts:860` it: 'round-trips a GFM table', () => {
- `../lexical/packages/lexical-mdast/src/__tests__/unit/MdastImportExport.test.ts:874` it: 'imports a table into @lexical/table nodes', () => {
- `../lexical/packages/lexical-mdast/src/__tests__/unit/MdastImportExport.test.ts:888` it: 'preserves column alignment', () => {
- `../lexical/packages/lexical-mdast/src/__tests__/unit/MdastImportExport.test.ts:897` it: 'joins multi-paragraph cells instead of fusing their text', () => {
- `../lexical/packages/lexical-mdast/src/__tests__/unit/MdastImportExport.test.ts:919` describe: 'with MdastShadowRootQuoteExtension', () => {
- `../lexical/packages/lexical-mdast/src/__tests__/unit/MdastImportExport.test.ts:956` it: name, () => {
- `../lexical/packages/lexical-mdast/src/__tests__/unit/MdastImportExport.test.ts:961` it: 'imports the quote as a shadow root with block children', () => {
- `../lexical/packages/lexical-mdast/src/__tests__/unit/MdastImportExport.test.ts:978` describe: 'reference links', () => {
- `../lexical/packages/lexical-mdast/src/__tests__/unit/MdastImportExport.test.ts:979` it: 'resolves full references against definitions', () => {
- `../lexical/packages/lexical-mdast/src/__tests__/unit/MdastImportExport.test.ts:985` it: 'resolves collapsed and shortcut references', () => {
- `../lexical/packages/lexical-mdast/src/__tests__/unit/MdastImportExport.test.ts:994` it: 'resolves references with titles', () => {
- `../lexical/packages/lexical-mdast/src/__tests__/unit/MdastImportExport.test.ts:1000` it: 'keeps unresolved references as literal text', () => {
- `../lexical/packages/lexical-mdast/src/__tests__/unit/MdastImportExport.test.ts:1007` it: 'imports tab characters as TabNodes', () => {
- `../lexical/packages/lexical-mdast/src/__tests__/unit/MdastImportExport.test.ts:1025` it: 'tolerates explicitly-undefined config keys in configExtension', () => {

## `../lexical/packages/lexical-mdast/src/__tests__/unit/MdastShortcuts.test.ts`

category: portable-mixed
family: serialization-parsing / Plate plugin
target: indexed; target Plate feature package, with raw transport split to Plite only when generic

- `../lexical/packages/lexical-mdast/src/__tests__/unit/MdastShortcuts.test.ts:81` describe: '@lexical/mdast streaming shortcuts', () => {
- `../lexical/packages/lexical-mdast/src/__tests__/unit/MdastShortcuts.test.ts:92` describe: 'block shortcuts (on space)', () => {
- `../lexical/packages/lexical-mdast/src/__tests__/unit/MdastShortcuts.test.ts:93` it: '# -> heading', () => {
- `../lexical/packages/lexical-mdast/src/__tests__/unit/MdastShortcuts.test.ts:105` it: '### -> heading level 3', () => {
- `../lexical/packages/lexical-mdast/src/__tests__/unit/MdastShortcuts.test.ts:117` it: '> -> quote', () => {
- `../lexical/packages/lexical-mdast/src/__tests__/unit/MdastShortcuts.test.ts:123` it: '- -> bullet list', () => {
- `../lexical/packages/lexical-mdast/src/__tests__/unit/MdastShortcuts.test.ts:132` it: '1. -> ordered list', () => {
- `../lexical/packages/lexical-mdast/src/__tests__/unit/MdastShortcuts.test.ts:141` it: '- [ ] -> check list', () => {
- `../lexical/packages/lexical-mdast/src/__tests__/unit/MdastShortcuts.test.ts:150` it: '- [x] -> checked check list item', () => {
- `../lexical/packages/lexical-mdast/src/__tests__/unit/MdastShortcuts.test.ts:161` it: '- [] does not become a check list (GFM requires one character)', () => {
- `../lexical/packages/lexical-mdast/src/__tests__/unit/MdastShortcuts.test.ts:171` describe: 'inline shortcuts (on closing delimiter)', () => {
- `../lexical/packages/lexical-mdast/src/__tests__/unit/MdastShortcuts.test.ts:184` it: '**bold** applies bold', () => {
- `../lexical/packages/lexical-mdast/src/__tests__/unit/MdastShortcuts.test.ts:193` it: '*italic* applies italic', () => {
- `../lexical/packages/lexical-mdast/src/__tests__/unit/MdastShortcuts.test.ts:202` it: '`code` applies code', () => {
- `../lexical/packages/lexical-mdast/src/__tests__/unit/MdastShortcuts.test.ts:211` it: '~~strike~~ applies strikethrough', () => {
- `../lexical/packages/lexical-mdast/src/__tests__/unit/MdastShortcuts.test.ts:220` it: '[text](url) becomes a link', () => {
- `../lexical/packages/lexical-mdast/src/__tests__/unit/MdastShortcuts.test.ts:235` it: 'only fires when the closing delimiter is at the caret', () => {
- `../lexical/packages/lexical-mdast/src/__tests__/unit/MdastShortcuts.test.ts:246` describe: 'fenced code (on Enter)', () => {
- `../lexical/packages/lexical-mdast/src/__tests__/unit/MdastShortcuts.test.ts:247` it: '```js + Enter -> empty code block with the language', () => {
- `../lexical/packages/lexical-mdast/src/__tests__/unit/MdastShortcuts.test.ts:259` it: '```js title=x + Enter keeps the info-string meta and fence', () => {
- `../lexical/packages/lexical-mdast/src/__tests__/unit/MdastShortcuts.test.ts:272` describe: 'does not fire destructively', () => {
- `../lexical/packages/lexical-mdast/src/__tests__/unit/MdastShortcuts.test.ts:273` it: 'Enter does not convert a line with content after the marker', () => {
- `../lexical/packages/lexical-mdast/src/__tests__/unit/MdastShortcuts.test.ts:277` it: undo-escape hatch).
- `../lexical/packages/lexical-mdast/src/__tests__/unit/MdastShortcuts.test.ts:286` it: 'Enter does not convert prose that happens to parse as a list', () => {
- `../lexical/packages/lexical-mdast/src/__tests__/unit/MdastShortcuts.test.ts:293` it: 'multi-character insertion (paste) does not transform', () => {
- `../lexical/packages/lexical-mdast/src/__tests__/unit/MdastShortcuts.test.ts:301` it: 'deleting back to a delimiter does not transform', () => {
- `../lexical/packages/lexical-mdast/src/__tests__/unit/MdastShortcuts.test.ts:325` it: 'does not transform inside an inline code span', () => {
- `../lexical/packages/lexical-mdast/src/__tests__/unit/MdastShortcuts.test.ts:350` it: 'block markers wrapped in inline formatting keep their delimiters', () => {

## `../lexical/packages/lexical-mdast/src/__tests__/unit/MdastTextRuns.test.ts`

category: portable-mixed
family: serialization-parsing / Plate plugin
target: indexed; target Plate feature package, with raw transport split to Plite only when generic

- `../lexical/packages/lexical-mdast/src/__tests__/unit/MdastTextRuns.test.ts:124` describe: 'phrasingFromTextRuns', () => {
- `../lexical/packages/lexical-mdast/src/__tests__/unit/MdastTextRuns.test.ts:125` it: 'round-trips arbitrary bold/italic overlap exactly', () => {
- `../lexical/packages/lexical-mdast/src/__tests__/unit/MdastTextRuns.test.ts:138` it: 'never round-trips worse than per-run nesting, for any format mix', () => {

## `../lexical/packages/lexical-playground/__tests__/e2e/AutoLinks.spec.mjs`

category: portable-mixed
family: selection-dom-mapping / void-atom
target: indexed 45 test/describe lines; target packages/plite/test; packages/plite-react/test/editable-behavior.test.tsx; apps/www/tests/plite-browser/donor/stress/generated-editing.test.ts

- `../lexical/packages/lexical-playground/__tests__/e2e/AutoLinks.spec.mjs:29` test: 'Auto Links', () => {
- `../lexical/packages/lexical-playground/__tests__/e2e/AutoLinks.spec.mjs:30` test: ({isCollab, page}) => initialize({isCollab, page}));
- `../lexical/packages/lexical-playground/__tests__/e2e/AutoLinks.spec.mjs:32` test: 'Can convert url-like text into links', async ({page, isPlainText}) => {
- `../lexical/packages/lexical-playground/__tests__/e2e/AutoLinks.spec.mjs:33` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/AutoLinks.spec.mjs:63` test: 'Can convert url-like text into links for email', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/AutoLinks.spec.mjs:67` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/AutoLinks.spec.mjs:92` test: 'Can destruct links if add non-spacing text in front or right after it', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/AutoLinks.spec.mjs:96` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/AutoLinks.spec.mjs:156` test: 'Can create link when pasting text with urls', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/AutoLinks.spec.mjs:160` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/AutoLinks.spec.mjs:191` test: 'Can create link for email when pasting text with urls', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/AutoLinks.spec.mjs:195` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/AutoLinks.spec.mjs:225` test: 'Does not create redundant auto-link', async ({page, isPlainText}) => {
- `../lexical/packages/lexical-playground/__tests__/e2e/AutoLinks.spec.mjs:226` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/AutoLinks.spec.mjs:263` test: 'Can create links when pasting text with multiple autolinks in a row separated by non-alphanumeric characters, but not whitespaces', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/AutoLinks.spec.mjs:267` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/AutoLinks.spec.mjs:300` test: 'Handles multiple autolinks in a row', async ({page, isPlainText}) => {
- `../lexical/packages/lexical-playground/__tests__/e2e/AutoLinks.spec.mjs:301` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/AutoLinks.spec.mjs:337` test: 'Handles autolink following an invalid autolink', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/AutoLinks.spec.mjs:341` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/AutoLinks.spec.mjs:360` test: 'Handles autolink following an invalid autolink to email', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/AutoLinks.spec.mjs:364` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/AutoLinks.spec.mjs:391` test: 'Can convert url-like text with formatting into links', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/AutoLinks.spec.mjs:395` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/AutoLinks.spec.mjs:440` test: 'Can convert url-like text with styles into links', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/AutoLinks.spec.mjs:444` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/AutoLinks.spec.mjs:491` test: 'Can convert URL into an autolink', () => {
- `../lexical/packages/lexical-playground/__tests__/e2e/AutoLinks.spec.mjs:542` test: testUrl, async ({page, isPlainText}) => {
- `../lexical/packages/lexical-playground/__tests__/e2e/AutoLinks.spec.mjs:543` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/AutoLinks.spec.mjs:567` test: 'Can convert URL into an email autolink', () => {
- `../lexical/packages/lexical-playground/__tests__/e2e/AutoLinks.spec.mjs:583` test: testUrl, async ({page, isPlainText}) => {
- `../lexical/packages/lexical-playground/__tests__/e2e/AutoLinks.spec.mjs:584` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/AutoLinks.spec.mjs:607` test: `Can not convert bad URLs into links`, async ({page, isPlainText}) => {
- `../lexical/packages/lexical-playground/__tests__/e2e/AutoLinks.spec.mjs:636` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/AutoLinks.spec.mjs:652` test: `Can not convert bad URLs into email links`, async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/AutoLinks.spec.mjs:675` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/AutoLinks.spec.mjs:691` test: 'Can unlink the autolink and then make it link again', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/AutoLinks.spec.mjs:695` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/AutoLinks.spec.mjs:752` test: 'Unlinked autolink is preserved when adding punctuation before or after it', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/AutoLinks.spec.mjs:756` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/AutoLinks.spec.mjs:839` test: 'Adding an invalid character will destruct an unlinked autolink', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/AutoLinks.spec.mjs:843` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/AutoLinks.spec.mjs:893` test: 'Adding an emoji inside an unlinked autolink will destruct it', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/AutoLinks.spec.mjs:897` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/AutoLinks.spec.mjs:952` test: 'Pressing Enter inside an AutoLinkNode does not insert extra paragraph', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/AutoLinks.spec.mjs:956` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/AutoLinks.spec.mjs:998` test: 'Can convert Unicode url-like text with Arabic path into links', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/AutoLinks.spec.mjs:1002` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/AutoLinks.spec.mjs:1021` test: 'Can convert Unicode url-like text with Korean IDN into links', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/AutoLinks.spec.mjs:1025` test: isPlainText);

## `../lexical/packages/lexical-playground/__tests__/e2e/AutoScroll.spec.mjs`

category: portable
family: beforeinput-input / browser-engine
target: indexed 3 test/describe lines; target packages/plite-react/test/model-input-strategy-contract.test.ts; apps/www/tests/plite-browser/donor/stress/generated-editing.test.ts

- `../lexical/packages/lexical-playground/__tests__/e2e/AutoScroll.spec.mjs:18` test: 'Auto scroll while typing', () => {
- `../lexical/packages/lexical-playground/__tests__/e2e/AutoScroll.spec.mjs:19` test: ({isCollab, page}) => initialize({isCollab, page}));
- `../lexical/packages/lexical-playground/__tests__/e2e/AutoScroll.spec.mjs:67` test: `${testCase.name}${
- `../lexical/packages/lexical-playground/__tests__/e2e/AutoScroll.spec.mjs:70` test: isPlainText \|\| isSoftLineBreak);
- `../lexical/packages/lexical-playground/__tests__/e2e/AutoScroll.spec.mjs:92` test: 'Auto scroll respects mobile visual viewport', () => {
- `../lexical/packages/lexical-playground/__tests__/e2e/AutoScroll.spec.mjs:93` test: ({isCollab, page}) => initialize({isCollab, page}));
- `../lexical/packages/lexical-playground/__tests__/e2e/AutoScroll.spec.mjs:175` test: 'Pressing Enter scrolls new caret above the on-screen keyboard', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/AutoScroll.spec.mjs:179` test: isPlainText);

## `../lexical/packages/lexical-playground/__tests__/e2e/Autocomplete.spec.mjs`

category: portable-mixed
family: mixed portable invariant
target: indexed 7 test/describe lines; target packages/plite/test; add focused browser proof only when behavior depends on DOM/runtime transport

- `../lexical/packages/lexical-playground/__tests__/e2e/Autocomplete.spec.mjs:27` test: 'Autocomplete', () => {
- `../lexical/packages/lexical-playground/__tests__/e2e/Autocomplete.spec.mjs:28` test: ({isCollab, page}) =>
- `../lexical/packages/lexical-playground/__tests__/e2e/Autocomplete.spec.mjs:31` test: 'Can autocomplete a word', async ({page, isPlainText}) => {
- `../lexical/packages/lexical-playground/__tests__/e2e/Autocomplete.spec.mjs:71` test: 'Can autocomplete in the same format as the original text', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/Autocomplete.spec.mjs:75` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/Autocomplete.spec.mjs:145` test: 'Undo does not cause an exception', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/Autocomplete.spec.mjs:150` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/Autocomplete.spec.mjs:152` test: isCollab);

## `../lexical/packages/lexical-playground/__tests__/e2e/CardSlot.spec.mjs`

category: portable-mixed
family: selection-dom-mapping / nested-root
target: indexed; target current Plite package proof and browser proof when DOM-dependent

- `../lexical/packages/lexical-playground/__tests__/e2e/CardSlot.spec.mjs:146` test: 'Card slot deletion boundaries', () => {
- `../lexical/packages/lexical-playground/__tests__/e2e/CardSlot.spec.mjs:147` test: async ({isCollab, isPlainText, page}) => {
- `../lexical/packages/lexical-playground/__tests__/e2e/CardSlot.spec.mjs:148` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/CardSlot.spec.mjs:154` test: 'backspace at empty title-slot start is a no-op', async ({page}) => {
- `../lexical/packages/lexical-playground/__tests__/e2e/CardSlot.spec.mjs:173` test: 'backspace at non-empty title-slot start is a no-op', async ({page}) => {
- `../lexical/packages/lexical-playground/__tests__/e2e/CardSlot.spec.mjs:184` test: 'forward-delete at title-slot end is a no-op', async ({page}) => {
- `../lexical/packages/lexical-playground/__tests__/e2e/CardSlot.spec.mjs:197` test: 'backspace deletes one char within title slot', async ({page}) => {
- `../lexical/packages/lexical-playground/__tests__/e2e/CardSlot.spec.mjs:208` test: 'forward-delete one char within body', async ({page}) => {
- `../lexical/packages/lexical-playground/__tests__/e2e/CardSlot.spec.mjs:223` test: 'backspace from the title of an empty card deletes the card', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/CardSlot.spec.mjs:238` test: 'backspace from the block after an empty card leaves the card alone (#8712)', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/CardSlot.spec.mjs:257` test: 'select-all + Backspace replaces a first-block card with a paragraph', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/CardSlot.spec.mjs:291` test: 'Enter inside the title slot is a no-op (single-line slot)', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/CardSlot.spec.mjs:308` test: 'Card HTML serialization round-trip', () => {
- `../lexical/packages/lexical-playground/__tests__/e2e/CardSlot.spec.mjs:309` test: async ({isCollab, isPlainText, page}) => {
- `../lexical/packages/lexical-playground/__tests__/e2e/CardSlot.spec.mjs:310` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/CardSlot.spec.mjs:314` test: 'copying a card and pasting it as HTML-only rebuilds its slots', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/CardSlot.spec.mjs:348` test: 'Card host data-selected mirroring', () => {
- `../lexical/packages/lexical-playground/__tests__/e2e/CardSlot.spec.mjs:349` test: async ({isCollab, isPlainText, page}) => {
- `../lexical/packages/lexical-playground/__tests__/e2e/CardSlot.spec.mjs:350` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/CardSlot.spec.mjs:360` test: 'selecting a card sets data-selected on its host', async ({page}) => {
- `../lexical/packages/lexical-playground/__tests__/e2e/CardSlot.spec.mjs:378` test: 'Card slot wrapper click does not promote', () => {
- `../lexical/packages/lexical-playground/__tests__/e2e/CardSlot.spec.mjs:379` test: async ({isCollab, isPlainText, page}) => {
- `../lexical/packages/lexical-playground/__tests__/e2e/CardSlot.spec.mjs:380` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/CardSlot.spec.mjs:384` test: 'clicking inside the title slot keeps the click in the slot', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/CardSlot.spec.mjs:402` test: 'Card empty-field placeholders', () => {
- `../lexical/packages/lexical-playground/__tests__/e2e/CardSlot.spec.mjs:403` test: async ({isCollab, isPlainText, page}) => {
- `../lexical/packages/lexical-playground/__tests__/e2e/CardSlot.spec.mjs:404` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/CardSlot.spec.mjs:408` test: 'an inserted card starts empty with CSS placeholders, which clear on typing', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/CardSlot.spec.mjs:450` test: 'the body placeholder shows only for a single empty body paragraph', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/CardSlot.spec.mjs:491` test: 'Card Tab / Shift+Tab slot caret navigation', () => {
- `../lexical/packages/lexical-playground/__tests__/e2e/CardSlot.spec.mjs:492` test: async ({isCollab, isPlainText, page}) => {
- `../lexical/packages/lexical-playground/__tests__/e2e/CardSlot.spec.mjs:493` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/CardSlot.spec.mjs:497` test: 'Tab from the title slot moves the caret into the body', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/CardSlot.spec.mjs:514` test: 'Shift+Tab from the body moves the caret into the title slot', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/CardSlot.spec.mjs:534` test: 'Card SELECT_ALL stays slot-scoped', () => {
- `../lexical/packages/lexical-playground/__tests__/e2e/CardSlot.spec.mjs:535` test: async ({isCollab, isPlainText, page}) => {
- `../lexical/packages/lexical-playground/__tests__/e2e/CardSlot.spec.mjs:536` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/CardSlot.spec.mjs:540` test: 'Cmd+A inside the title slot replaces only the title text', async ({

## `../lexical/packages/lexical-playground/__tests__/e2e/CharacterLimit.spec.mjs`

category: portable-mixed
family: mixed portable invariant
target: indexed 23 test/describe lines; target packages/plite/test; add focused browser proof only when behavior depends on DOM/runtime transport

- `../lexical/packages/lexical-playground/__tests__/e2e/CharacterLimit.spec.mjs:24` test: 'displays overflow on text', async ({page, isCollab}) => {
- `../lexical/packages/lexical-playground/__tests__/e2e/CharacterLimit.spec.mjs:25` test: isCollab);
- `../lexical/packages/lexical-playground/__tests__/e2e/CharacterLimit.spec.mjs:79` test: 'handles auto link nodes', async ({page, isCollab}) => {
- `../lexical/packages/lexical-playground/__tests__/e2e/CharacterLimit.spec.mjs:80` test: isCollab);
- `../lexical/packages/lexical-playground/__tests__/e2e/CharacterLimit.spec.mjs:121` test: 'displays overflow on token nodes', async ({page, isCollab}) => {
- `../lexical/packages/lexical-playground/__tests__/e2e/CharacterLimit.spec.mjs:127` test: isCollab);
- `../lexical/packages/lexical-playground/__tests__/e2e/CharacterLimit.spec.mjs:157` test: 'can type new lines inside overflow', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/CharacterLimit.spec.mjs:162` test: isCollab);
- `../lexical/packages/lexical-playground/__tests__/e2e/CharacterLimit.spec.mjs:212` test: 'can delete text in front and overflow is recomputed', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/CharacterLimit.spec.mjs:217` test: isCollab);
- `../lexical/packages/lexical-playground/__tests__/e2e/CharacterLimit.spec.mjs:286` test: 'can delete text in front and overflow is recomputed (token nodes)', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/CharacterLimit.spec.mjs:290` test: isCollab);
- `../lexical/packages/lexical-playground/__tests__/e2e/CharacterLimit.spec.mjs:331` test: 'can overflow in lists', async ({page, isCollab, isPlainText}) => {
- `../lexical/packages/lexical-playground/__tests__/e2e/CharacterLimit.spec.mjs:332` test: isCollab \|\| isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/CharacterLimit.spec.mjs:352` test: 'can delete an overflowed paragraph', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/CharacterLimit.spec.mjs:357` test: isCollab \|\| isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/CharacterLimit.spec.mjs:392` test: 'handles accented characters', async ({page, isCollab}) => {
- `../lexical/packages/lexical-playground/__tests__/e2e/CharacterLimit.spec.mjs:393` test: isCollab);
- `../lexical/packages/lexical-playground/__tests__/e2e/CharacterLimit.spec.mjs:425` test: 'handles graphemes', async ({page, isCollab, browserName}) => {
- `../lexical/packages/lexical-playground/__tests__/e2e/CharacterLimit.spec.mjs:426` test: isCollab);
- `../lexical/packages/lexical-playground/__tests__/e2e/CharacterLimit.spec.mjs:443` test: 'CharacterLimit', () => {
- `../lexical/packages/lexical-playground/__tests__/e2e/CharacterLimit.spec.mjs:444` test: 'UTF-16', () => {
- `../lexical/packages/lexical-playground/__tests__/e2e/CharacterLimit.spec.mjs:445` test: {isCharLimit: true});
- `../lexical/packages/lexical-playground/__tests__/e2e/CharacterLimit.spec.mjs:446` test: ({isCollab, page, isCharLimit, isCharLimitUtf8}) =>
- `../lexical/packages/lexical-playground/__tests__/e2e/CharacterLimit.spec.mjs:452` test: 'UTF-8', () => {
- `../lexical/packages/lexical-playground/__tests__/e2e/CharacterLimit.spec.mjs:453` test: {isCharLimitUtf8: true});
- `../lexical/packages/lexical-playground/__tests__/e2e/CharacterLimit.spec.mjs:454` test: ({isCollab, page, isCharLimit, isCharLimitUtf8}) =>

## `../lexical/packages/lexical-playground/__tests__/e2e/ClearFormatting.spec.mjs`

category: portable
family: serialization-parsing / marks-inline
target: indexed 10 test/describe lines; target packages/plite/test; packages/plite-history/test; apps/www/tests/plite-browser/donor/examples/richtext.test.ts

- `../lexical/packages/lexical-playground/__tests__/e2e/ClearFormatting.spec.mjs:35` test: 'Clear All Formatting', () => {
- `../lexical/packages/lexical-playground/__tests__/e2e/ClearFormatting.spec.mjs:36` test: ({isPlainText, isCollab, page}) => {
- `../lexical/packages/lexical-playground/__tests__/e2e/ClearFormatting.spec.mjs:37` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/ClearFormatting.spec.mjs:40` test: `Can clear BIU formatting`, async ({page}) => {
- `../lexical/packages/lexical-playground/__tests__/e2e/ClearFormatting.spec.mjs:61` test: `Should preserve the default styling of links and quoted text`, async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/ClearFormatting.spec.mjs:108` test: `Should preserve the default styling of hashtags and mentions`, async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/ClearFormatting.spec.mjs:185` test: `Can clear left/center/right alignment when BIU formatting already applied`, async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/ClearFormatting.spec.mjs:207` test: `Can clear left/center/right alignment when BIU formatting not applied`, async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/ClearFormatting.spec.mjs:228` test: `Can clear when only indent/outdent alignment is applied`, async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/ClearFormatting.spec.mjs:249` test: `Can clear indent/outdent alignment when other formatting options like BIU or left/right/center align are also applied`, async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/ClearFormatting.spec.mjs:276` test: `Can clear alignment and indent with a collapsed selection`, async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/ClearFormatting.spec.mjs:295` test: `Should clear formatting of selected text which spans over 1 paragraph`, async ({

## `../lexical/packages/lexical-playground/__tests__/e2e/CodeBlock.spec.mjs`

category: portable
family: serialization-parsing / marks-inline
target: indexed 24 test/describe lines; target packages/plite/test; packages/plite-history/test; apps/www/tests/plite-browser/donor/examples/richtext.test.ts

- `../lexical/packages/lexical-playground/__tests__/e2e/CodeBlock.spec.mjs:34` test: 'CodeBlock', () => {
- `../lexical/packages/lexical-playground/__tests__/e2e/CodeBlock.spec.mjs:35` test: ({isCollab, page}) => initialize({isCollab, page}));
- `../lexical/packages/lexical-playground/__tests__/e2e/CodeBlock.spec.mjs:36` test: 'Can create code block with markdown', async ({page, isRichText}) => {
- `../lexical/packages/lexical-playground/__tests__/e2e/CodeBlock.spec.mjs:82` test: 'Can create code block with markdown and wrap existing text', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/CodeBlock.spec.mjs:121` test: 'Can select multiple paragraphs and convert to code block', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/CodeBlock.spec.mjs:125` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/CodeBlock.spec.mjs:182` test: 'Can select partial paragraphs and convert to code block', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/CodeBlock.spec.mjs:186` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/CodeBlock.spec.mjs:248` test: 'Can select a line within line breaks and convert to code block', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/CodeBlock.spec.mjs:252` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/CodeBlock.spec.mjs:297` test: 'Can switch highlighting language in a toolbar', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/CodeBlock.spec.mjs:361` test: 'Can maintain indent when creating new lines', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/CodeBlock.spec.mjs:366` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/CodeBlock.spec.mjs:399` test: 'Can indent text via tab when selecting the line with Shift+Down', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/CodeBlock.spec.mjs:404` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/CodeBlock.spec.mjs:437` test: 'Can (un)indent multiple lines at once', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/CodeBlock.spec.mjs:442` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/CodeBlock.spec.mjs:570` test: 'Can move around lines with option+arrow keys', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/CodeBlock.spec.mjs:574` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/CodeBlock.spec.mjs:639` test: 'should not prevent selection and typing outside code block boundaries if block has siblings', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/CodeBlock.spec.mjs:643` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/CodeBlock.spec.mjs:728` test: 'When pressing CMD/Ctrl + Left, CMD/Ctrl + Right, the cursor should go to the start of the code', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/CodeBlock.spec.mjs:732` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/CodeBlock.spec.mjs:809` test: 'Can create code block with language `diff`', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/CodeBlock.spec.mjs:869` test: 'Can create code block with language `diff-javascript`', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/CodeBlock.spec.mjs:995` test: `${key} key should exit from the code block inside the layout`, async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/CodeBlock.spec.mjs:1000` test: isPlainText \|\| isCollab);

## `../lexical/packages/lexical-playground/__tests__/e2e/Collaboration.spec.mjs`

category: portable
family: collaboration-remote / history-undo-redo
target: indexed 13 test/describe lines; target packages/plite/test/collab-history-runtime-contract.ts; future slate-yjs browser lane

- `../lexical/packages/lexical-playground/__tests__/e2e/Collaboration.spec.mjs:36` test: 'Collaboration', () => {
- `../lexical/packages/lexical-playground/__tests__/e2e/Collaboration.spec.mjs:37` test: ({isCollab, page}) => initialize({isCollab, page}));
- `../lexical/packages/lexical-playground/__tests__/e2e/Collaboration.spec.mjs:39` test: 'Undo with collaboration on', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/Collaboration.spec.mjs:45` test: !isCollab);
- `../lexical/packages/lexical-playground/__tests__/e2e/Collaboration.spec.mjs:228` test: 'Remove dangling text from YJS when there is no preceding text node', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/Collaboration.spec.mjs:234` test: !isCollab);
- `../lexical/packages/lexical-playground/__tests__/e2e/Collaboration.spec.mjs:310` test: 'Merge dangling text into preceding text node', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/Collaboration.spec.mjs:316` test: !isCollab);
- `../lexical/packages/lexical-playground/__tests__/e2e/Collaboration.spec.mjs:406` test: 'Undo/redo where text node is split by formatting change', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/Collaboration.spec.mjs:412` test: !isCollab);
- `../lexical/packages/lexical-playground/__tests__/e2e/Collaboration.spec.mjs:530` test: 'Undo/redo where text node is split by inline element node', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/Collaboration.spec.mjs:536` test: !isCollab);
- `../lexical/packages/lexical-playground/__tests__/e2e/Collaboration.spec.mjs:660` test: '$handleNormalizationMergeConflicts handles nodes that have been reparented', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/Collaboration.spec.mjs:664` test: !isCollab);

## `../lexical/packages/lexical-playground/__tests__/e2e/ColumnLayoutBackspaceAtEnd.spec.mjs`

category: portable-mixed
family: mixed portable invariant
target: indexed 2 test/describe lines; target packages/plite/test; add focused browser proof only when behavior depends on DOM/runtime transport

- `../lexical/packages/lexical-playground/__tests__/e2e/ColumnLayoutBackspaceAtEnd.spec.mjs:22` test: 'Layout - removes layout completely when both columns are empty and backspace is pressed at the first layout item', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/ColumnLayoutBackspaceAtEnd.spec.mjs:27` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/ColumnLayoutBackspaceAtEnd.spec.mjs:95` test: `Layout - ${key} key should exit from the layout if the selection is at the end of the element`, async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/ColumnLayoutBackspaceAtEnd.spec.mjs:100` test: isPlainText \|\| isCollab);

## `../lexical/packages/lexical-playground/__tests__/e2e/Composition.spec.mjs`

category: portable
family: ime-composition / history-undo-redo
target: indexed 28 test/describe lines; target apps/www/tests/plite-browser/donor/stress/generated-editing.test.ts; packages/test/src/playwright/ime.ts; packages/plite-history/test

- `../lexical/packages/lexical-playground/__tests__/e2e/Composition.spec.mjs:37` test: {launchOptions: {slowMo: 50}});
- `../lexical/packages/lexical-playground/__tests__/e2e/Composition.spec.mjs:38` test: 'Composition', () => {
- `../lexical/packages/lexical-playground/__tests__/e2e/Composition.spec.mjs:39` test: ({isCollab, page}) => initialize({isCollab, page}));
- `../lexical/packages/lexical-playground/__tests__/e2e/Composition.spec.mjs:40` test: 'Handles Hiragana characters', async ({page}) => {
- `../lexical/packages/lexical-playground/__tests__/e2e/Composition.spec.mjs:95` test: 'Handles Arabic characters with diacritics', async ({page}) => {
- `../lexical/packages/lexical-playground/__tests__/e2e/Composition.spec.mjs:182` test: 'IME', () => {
- `../lexical/packages/lexical-playground/__tests__/e2e/Composition.spec.mjs:183` test: 'Can type Hiragana via IME', async ({page, browserName}) => {
- `../lexical/packages/lexical-playground/__tests__/e2e/Composition.spec.mjs:185` test: browserName !== 'chromium');
- `../lexical/packages/lexical-playground/__tests__/e2e/Composition.spec.mjs:208` test: 'Can type Hiragana via IME between line breaks', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/Composition.spec.mjs:213` test: browserName !== 'chromium');
- `../lexical/packages/lexical-playground/__tests__/e2e/Composition.spec.mjs:250` test: 'Can type Hiragana via IME into a new bold format', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/Composition.spec.mjs:256` test: browserName !== 'chromium' \|\| isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/Composition.spec.mjs:291` test: 'Can type Hiragana via IME between emojis', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/Composition.spec.mjs:295` test: browserName !== 'chromium');
- `../lexical/packages/lexical-playground/__tests__/e2e/Composition.spec.mjs:377` test: 'Can type Hiragana via IME at the end of a mention', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/Composition.spec.mjs:382` test: browserName !== 'chromium');
- `../lexical/packages/lexical-playground/__tests__/e2e/Composition.spec.mjs:421` test: 'Can type Hiragana via IME part way through a mention', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/Composition.spec.mjs:426` test: browserName !== 'chromium');
- `../lexical/packages/lexical-playground/__tests__/e2e/Composition.spec.mjs:461` test: 'Typing after mention with IME should not break it', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/Composition.spec.mjs:467` test: browserName !== 'chromium');
- `../lexical/packages/lexical-playground/__tests__/e2e/Composition.spec.mjs:496` test: 'Can type Hiragana via IME with hashtags', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/Composition.spec.mjs:502` test: browserName !== 'chromium');
- `../lexical/packages/lexical-playground/__tests__/e2e/Composition.spec.mjs:555` test: 'Can type, delete and cancel Hiragana via IME', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/Composition.spec.mjs:560` test: browserName !== 'chromium');
- `../lexical/packages/lexical-playground/__tests__/e2e/Composition.spec.mjs:612` test: 'Floating toolbar should not be displayed when using IME', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/Composition.spec.mjs:618` test: browserName !== 'chromium' \|\| isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/Composition.spec.mjs:671` test: 'Typeahead menu should not close during IME composition', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/Composition.spec.mjs:676` test: browserName !== 'chromium');
- `../lexical/packages/lexical-playground/__tests__/e2e/Composition.spec.mjs:720` test: 'Can replace multiple formatted text nodes with IME composition (Korean)', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/Composition.spec.mjs:726` test: browserName !== 'chromium' \|\| isPlainText);

## `../lexical/packages/lexical-playground/__tests__/e2e/CopyAndPaste/html/HTMLCopyAndPaste.spec.mjs`

category: portable
family: clipboard-paste / browser-engine
target: indexed 9 test/describe lines; target packages/plite/test/clipboard-contract.ts; packages/plite-dom/test/clipboard-boundary.test.ts; apps/www/tests/plite-browser/donor/examples/paste-html.test.ts; apps/www/tests/plite-browser/donor/stress/generated-editing.test.ts

- `../lexical/packages/lexical-playground/__tests__/e2e/CopyAndPaste/html/HTMLCopyAndPaste.spec.mjs:22` test: 'HTML CopyAndPaste', () => {
- `../lexical/packages/lexical-playground/__tests__/e2e/CopyAndPaste/html/HTMLCopyAndPaste.spec.mjs:23` test: ({isCollab, page}) => initialize({isCollab, page}));
- `../lexical/packages/lexical-playground/__tests__/e2e/CopyAndPaste/html/HTMLCopyAndPaste.spec.mjs:25` test: 'Copy + paste multi line html with extra newlines', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/CopyAndPaste/html/HTMLCopyAndPaste.spec.mjs:30` test: isPlainText \|\| isCollab);
- `../lexical/packages/lexical-playground/__tests__/e2e/CopyAndPaste/html/HTMLCopyAndPaste.spec.mjs:53` test: 'Copy + paste a code block with BR', async ({page, isPlainText}) => {
- `../lexical/packages/lexical-playground/__tests__/e2e/CopyAndPaste/html/HTMLCopyAndPaste.spec.mjs:54` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/CopyAndPaste/html/HTMLCopyAndPaste.spec.mjs:135` test: 'Copy + paste a paragraph element between horizontal rules', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/CopyAndPaste/html/HTMLCopyAndPaste.spec.mjs:140` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/CopyAndPaste/html/HTMLCopyAndPaste.spec.mjs:199` test: 'Paste top level element in the middle of paragraph', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/CopyAndPaste/html/HTMLCopyAndPaste.spec.mjs:204` test: isPlainText \|\| isCollab);

## `../lexical/packages/lexical-playground/__tests__/e2e/CopyAndPaste/html/ImageHTMLCopyAndPaste.spec.mjs`

category: portable
family: clipboard-paste / browser-engine
target: indexed 7 test/describe lines; target packages/plite/test/clipboard-contract.ts; packages/plite-dom/test/clipboard-boundary.test.ts; apps/www/tests/plite-browser/donor/examples/paste-html.test.ts; apps/www/tests/plite-browser/donor/stress/generated-editing.test.ts

- `../lexical/packages/lexical-playground/__tests__/e2e/CopyAndPaste/html/ImageHTMLCopyAndPaste.spec.mjs:26` test: 'HTML Image CopyAndPaste', () => {
- `../lexical/packages/lexical-playground/__tests__/e2e/CopyAndPaste/html/ImageHTMLCopyAndPaste.spec.mjs:27` test: ({isCollab, page}) =>
- `../lexical/packages/lexical-playground/__tests__/e2e/CopyAndPaste/html/ImageHTMLCopyAndPaste.spec.mjs:31` test: 'Copy + paste HTML of a figure with img and figcaption', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/CopyAndPaste/html/ImageHTMLCopyAndPaste.spec.mjs:37` test: isPlainText \|\| isCollab);
- `../lexical/packages/lexical-playground/__tests__/e2e/CopyAndPaste/html/ImageHTMLCopyAndPaste.spec.mjs:134` test: 'Copy + paste an image', async ({page, isPlainText}) => {
- `../lexical/packages/lexical-playground/__tests__/e2e/CopyAndPaste/html/ImageHTMLCopyAndPaste.spec.mjs:135` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/CopyAndPaste/html/ImageHTMLCopyAndPaste.spec.mjs:172` test: 'Copy + paste + undo multiple image', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/CopyAndPaste/html/ImageHTMLCopyAndPaste.spec.mjs:177` test: isPlainText \|\| isCollab);

## `../lexical/packages/lexical-playground/__tests__/e2e/CopyAndPaste/html/LinksHTMLCopyAndPaste.spec.mjs`

category: portable
family: clipboard-paste / browser-engine
target: indexed 19 test/describe lines; target packages/plite/test/clipboard-contract.ts; packages/plite-dom/test/clipboard-boundary.test.ts; apps/www/tests/plite-browser/donor/examples/paste-html.test.ts; apps/www/tests/plite-browser/donor/stress/generated-editing.test.ts

- `../lexical/packages/lexical-playground/__tests__/e2e/CopyAndPaste/html/LinksHTMLCopyAndPaste.spec.mjs:34` test: 'HTML Links CopyAndPaste', () => {
- `../lexical/packages/lexical-playground/__tests__/e2e/CopyAndPaste/html/LinksHTMLCopyAndPaste.spec.mjs:35` test: ({isCollab, page}) => initialize({isCollab, page}));
- `../lexical/packages/lexical-playground/__tests__/e2e/CopyAndPaste/html/LinksHTMLCopyAndPaste.spec.mjs:37` test: 'Copy + paste an anchor element', async ({page, isPlainText}) => {
- `../lexical/packages/lexical-playground/__tests__/e2e/CopyAndPaste/html/LinksHTMLCopyAndPaste.spec.mjs:38` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/CopyAndPaste/html/LinksHTMLCopyAndPaste.spec.mjs:99` test: 'Copy + paste in front of or after a link', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/CopyAndPaste/html/LinksHTMLCopyAndPaste.spec.mjs:103` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/CopyAndPaste/html/LinksHTMLCopyAndPaste.spec.mjs:130` test: 'Copy + paste link by selecting its (partial) content', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/CopyAndPaste/html/LinksHTMLCopyAndPaste.spec.mjs:134` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/CopyAndPaste/html/LinksHTMLCopyAndPaste.spec.mjs:166` test: 'Copy + paste empty link #3193', async ({page, isPlainText}) => {
- `../lexical/packages/lexical-playground/__tests__/e2e/CopyAndPaste/html/LinksHTMLCopyAndPaste.spec.mjs:167` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/CopyAndPaste/html/LinksHTMLCopyAndPaste.spec.mjs:213` test: 'Paste a link into text', async ({page, isPlainText}) => {
- `../lexical/packages/lexical-playground/__tests__/e2e/CopyAndPaste/html/LinksHTMLCopyAndPaste.spec.mjs:214` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/CopyAndPaste/html/LinksHTMLCopyAndPaste.spec.mjs:247` test: 'Paste text into a link', async ({page, isPlainText}) => {
- `../lexical/packages/lexical-playground/__tests__/e2e/CopyAndPaste/html/LinksHTMLCopyAndPaste.spec.mjs:248` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/CopyAndPaste/html/LinksHTMLCopyAndPaste.spec.mjs:284` test: 'Paste formatted text into a link', async ({page, isPlainText}) => {
- `../lexical/packages/lexical-playground/__tests__/e2e/CopyAndPaste/html/LinksHTMLCopyAndPaste.spec.mjs:285` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/CopyAndPaste/html/LinksHTMLCopyAndPaste.spec.mjs:326` test: 'Paste a link into a link', async ({page, isPlainText}) => {
- `../lexical/packages/lexical-playground/__tests__/e2e/CopyAndPaste/html/LinksHTMLCopyAndPaste.spec.mjs:327` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/CopyAndPaste/html/LinksHTMLCopyAndPaste.spec.mjs:366` test: 'Paste multiple blocks into a link', async ({page, isPlainText}) => {
- `../lexical/packages/lexical-playground/__tests__/e2e/CopyAndPaste/html/LinksHTMLCopyAndPaste.spec.mjs:367` test: isPlainText);

## `../lexical/packages/lexical-playground/__tests__/e2e/CopyAndPaste/html/ListsHTMLCopyAndPaste.spec.mjs`

category: portable
family: clipboard-paste / browser-engine
target: indexed 15 test/describe lines; target packages/plite/test/clipboard-contract.ts; packages/plite-dom/test/clipboard-boundary.test.ts; apps/www/tests/plite-browser/donor/examples/paste-html.test.ts; apps/www/tests/plite-browser/donor/stress/generated-editing.test.ts

- `../lexical/packages/lexical-playground/__tests__/e2e/CopyAndPaste/html/ListsHTMLCopyAndPaste.spec.mjs:21` test: 'HTML Lists CopyAndPaste', () => {
- `../lexical/packages/lexical-playground/__tests__/e2e/CopyAndPaste/html/ListsHTMLCopyAndPaste.spec.mjs:22` test: ({isCollab, page}) => initialize({isCollab, page}));
- `../lexical/packages/lexical-playground/__tests__/e2e/CopyAndPaste/html/ListsHTMLCopyAndPaste.spec.mjs:24` test: 'Copy + paste a list element', async ({page, isPlainText}) => {
- `../lexical/packages/lexical-playground/__tests__/e2e/CopyAndPaste/html/ListsHTMLCopyAndPaste.spec.mjs:25` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/CopyAndPaste/html/ListsHTMLCopyAndPaste.spec.mjs:93` test: 'Copy + paste a list element with right alignment', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/CopyAndPaste/html/ListsHTMLCopyAndPaste.spec.mjs:97` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/CopyAndPaste/html/ListsHTMLCopyAndPaste.spec.mjs:136` test: 'Copy + paste a Lexical nested list', async ({page, isPlainText}) => {
- `../lexical/packages/lexical-playground/__tests__/e2e/CopyAndPaste/html/ListsHTMLCopyAndPaste.spec.mjs:137` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/CopyAndPaste/html/ListsHTMLCopyAndPaste.spec.mjs:172` test: 'Copy + paste (Nested List - directly nested ul)', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/CopyAndPaste/html/ListsHTMLCopyAndPaste.spec.mjs:176` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/CopyAndPaste/html/ListsHTMLCopyAndPaste.spec.mjs:260` test: 'Copy + paste (Nested List - li with non-list content plus ul child)', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/CopyAndPaste/html/ListsHTMLCopyAndPaste.spec.mjs:264` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/CopyAndPaste/html/ListsHTMLCopyAndPaste.spec.mjs:342` test: 'Copy + paste a checklist', async ({page, isPlainText}) => {
- `../lexical/packages/lexical-playground/__tests__/e2e/CopyAndPaste/html/ListsHTMLCopyAndPaste.spec.mjs:343` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/CopyAndPaste/html/ListsHTMLCopyAndPaste.spec.mjs:415` test: 'Paste top level element in the middle of list', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/CopyAndPaste/html/ListsHTMLCopyAndPaste.spec.mjs:420` test: isPlainText \|\| isCollab);
- `../lexical/packages/lexical-playground/__tests__/e2e/CopyAndPaste/html/ListsHTMLCopyAndPaste.spec.mjs:470` test: 'Copy + paste a nested divs in a list', async ({page, isPlainText}) => {
- `../lexical/packages/lexical-playground/__tests__/e2e/CopyAndPaste/html/ListsHTMLCopyAndPaste.spec.mjs:471` test: isPlainText);

## `../lexical/packages/lexical-playground/__tests__/e2e/CopyAndPaste/html/TablesHTMLCopyAndPaste.spec.mjs`

category: portable
family: clipboard-paste / browser-engine
target: indexed 20 test/describe lines; target packages/plite/test/clipboard-contract.ts; packages/plite-dom/test/clipboard-boundary.test.ts; apps/www/tests/plite-browser/donor/examples/paste-html.test.ts; apps/www/tests/plite-browser/donor/stress/generated-editing.test.ts

- `../lexical/packages/lexical-playground/__tests__/e2e/CopyAndPaste/html/TablesHTMLCopyAndPaste.spec.mjs:19` test: 'HTML Tables CopyAndPaste', () => {
- `../lexical/packages/lexical-playground/__tests__/e2e/CopyAndPaste/html/TablesHTMLCopyAndPaste.spec.mjs:20` test: ({isCollab, page}) =>
- `../lexical/packages/lexical-playground/__tests__/e2e/CopyAndPaste/html/TablesHTMLCopyAndPaste.spec.mjs:24` test: 'Copy + paste (Table - Google Docs)', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/CopyAndPaste/html/TablesHTMLCopyAndPaste.spec.mjs:29` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/CopyAndPaste/html/TablesHTMLCopyAndPaste.spec.mjs:31` test: <multiline or generated title>
- `../lexical/packages/lexical-playground/__tests__/e2e/CopyAndPaste/html/TablesHTMLCopyAndPaste.spec.mjs:95` test: 'Copy + paste (Table - Google Docs with custom widths)', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/CopyAndPaste/html/TablesHTMLCopyAndPaste.spec.mjs:100` test: isPlainText \|\| isCollab);
- `../lexical/packages/lexical-playground/__tests__/e2e/CopyAndPaste/html/TablesHTMLCopyAndPaste.spec.mjs:163` test: 'Copy + paste (Table - Quip)', async ({page, isPlainText}) => {
- `../lexical/packages/lexical-playground/__tests__/e2e/CopyAndPaste/html/TablesHTMLCopyAndPaste.spec.mjs:164` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/CopyAndPaste/html/TablesHTMLCopyAndPaste.spec.mjs:241` test: 'Copy + paste (Table - Google Sheets)', async ({page, isPlainText}) => {
- `../lexical/packages/lexical-playground/__tests__/e2e/CopyAndPaste/html/TablesHTMLCopyAndPaste.spec.mjs:242` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/CopyAndPaste/html/TablesHTMLCopyAndPaste.spec.mjs:320` test: 'Copy + paste - Merge Grids', async ({page, isPlainText, isCollab}) => {
- `../lexical/packages/lexical-playground/__tests__/e2e/CopyAndPaste/html/TablesHTMLCopyAndPaste.spec.mjs:321` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/CopyAndPaste/html/TablesHTMLCopyAndPaste.spec.mjs:322` test: <multiline or generated title>
- `../lexical/packages/lexical-playground/__tests__/e2e/CopyAndPaste/html/TablesHTMLCopyAndPaste.spec.mjs:493` test: 'Copy + paste nested block and inline html in a table', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/CopyAndPaste/html/TablesHTMLCopyAndPaste.spec.mjs:498` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/CopyAndPaste/html/TablesHTMLCopyAndPaste.spec.mjs:500` test: <multiline or generated title>
- `../lexical/packages/lexical-playground/__tests__/e2e/CopyAndPaste/html/TablesHTMLCopyAndPaste.spec.mjs:593` test: 'Copy + paste table with merged cells and unequal number of cells in rows', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/CopyAndPaste/html/TablesHTMLCopyAndPaste.spec.mjs:598` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/CopyAndPaste/html/TablesHTMLCopyAndPaste.spec.mjs:766` test: 'Copy + paste table with empty row', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/CopyAndPaste/html/TablesHTMLCopyAndPaste.spec.mjs:771` test: isPlainText);

## `../lexical/packages/lexical-playground/__tests__/e2e/CopyAndPaste/html/TextFormatHTMLCopyAndPaste.spec.mjs`

category: portable
family: clipboard-paste / browser-engine
target: indexed 5 test/describe lines; target packages/plite/test/clipboard-contract.ts; packages/plite-dom/test/clipboard-boundary.test.ts; apps/www/tests/plite-browser/donor/examples/paste-html.test.ts; apps/www/tests/plite-browser/donor/stress/generated-editing.test.ts

- `../lexical/packages/lexical-playground/__tests__/e2e/CopyAndPaste/html/TextFormatHTMLCopyAndPaste.spec.mjs:17` test: 'HTML CopyAndPaste', () => {
- `../lexical/packages/lexical-playground/__tests__/e2e/CopyAndPaste/html/TextFormatHTMLCopyAndPaste.spec.mjs:18` test: ({isCollab, page}) => initialize({isCollab, page}));
- `../lexical/packages/lexical-playground/__tests__/e2e/CopyAndPaste/html/TextFormatHTMLCopyAndPaste.spec.mjs:20` test: 'Copy + paste html with BIU formatting', async ({page, isPlainText}) => {
- `../lexical/packages/lexical-playground/__tests__/e2e/CopyAndPaste/html/TextFormatHTMLCopyAndPaste.spec.mjs:21` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/CopyAndPaste/html/TextFormatHTMLCopyAndPaste.spec.mjs:70` test: 'Copy + paste html with highlight formatting', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/CopyAndPaste/html/TextFormatHTMLCopyAndPaste.spec.mjs:74` test: isPlainText);

## `../lexical/packages/lexical-playground/__tests__/e2e/CopyAndPaste/lexical/ContextMenuCopyAndPaste.spec.mjs`

category: portable
family: clipboard-paste / browser-engine
target: indexed 5 test/describe lines; target packages/plite/test/clipboard-contract.ts; packages/plite-dom/test/clipboard-boundary.test.ts; apps/www/tests/plite-browser/donor/examples/paste-html.test.ts; apps/www/tests/plite-browser/donor/stress/generated-editing.test.ts

- `../lexical/packages/lexical-playground/__tests__/e2e/CopyAndPaste/lexical/ContextMenuCopyAndPaste.spec.mjs:23` test: 'ContextMenuCopyAndPaste', () => {
- `../lexical/packages/lexical-playground/__tests__/e2e/CopyAndPaste/lexical/ContextMenuCopyAndPaste.spec.mjs:24` test: {shouldUseLexicalContextMenu: true});
- `../lexical/packages/lexical-playground/__tests__/e2e/CopyAndPaste/lexical/ContextMenuCopyAndPaste.spec.mjs:25` test: ({isCollab, page, shouldUseLexicalContextMenu}) =>
- `../lexical/packages/lexical-playground/__tests__/e2e/CopyAndPaste/lexical/ContextMenuCopyAndPaste.spec.mjs:29` test: 'Basic copy-paste #6231', async ({page, isPlainText}) => {
- `../lexical/packages/lexical-playground/__tests__/e2e/CopyAndPaste/lexical/ContextMenuCopyAndPaste.spec.mjs:30` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/CopyAndPaste/lexical/ContextMenuCopyAndPaste.spec.mjs:56` test: 'Rich text Copy and Paste with different Font Size', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/CopyAndPaste/lexical/ContextMenuCopyAndPaste.spec.mjs:62` test: isCollab \|\| isPlainText \|\| browserName !== 'chromium');

## `../lexical/packages/lexical-playground/__tests__/e2e/CopyAndPaste/lexical/CopyAndPaste.spec.mjs`

category: portable
family: clipboard-paste / browser-engine
target: indexed 20 test/describe lines; target packages/plite/test/clipboard-contract.ts; packages/plite-dom/test/clipboard-boundary.test.ts; apps/www/tests/plite-browser/donor/examples/paste-html.test.ts; apps/www/tests/plite-browser/donor/stress/generated-editing.test.ts

- `../lexical/packages/lexical-playground/__tests__/e2e/CopyAndPaste/lexical/CopyAndPaste.spec.mjs:33` test: 'CopyAndPaste', () => {
- `../lexical/packages/lexical-playground/__tests__/e2e/CopyAndPaste/lexical/CopyAndPaste.spec.mjs:34` test: ({isCollab, page}) => initialize({isCollab, page}));
- `../lexical/packages/lexical-playground/__tests__/e2e/CopyAndPaste/lexical/CopyAndPaste.spec.mjs:35` test: 'Basic copy + paste', async ({isRichText, page, browserName}) => {
- `../lexical/packages/lexical-playground/__tests__/e2e/CopyAndPaste/lexical/CopyAndPaste.spec.mjs:215` test: `Copy and paste heading`, async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/CopyAndPaste/lexical/CopyAndPaste.spec.mjs:221` test: isCollab && IS_LINUX, 'Flaky on Linux + Collab');
- `../lexical/packages/lexical-playground/__tests__/e2e/CopyAndPaste/lexical/CopyAndPaste.spec.mjs:222` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/CopyAndPaste/lexical/CopyAndPaste.spec.mjs:223` test: <multiline or generated title>
- `../lexical/packages/lexical-playground/__tests__/e2e/CopyAndPaste/lexical/CopyAndPaste.spec.mjs:271` test: `Copy and paste between sections`, async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/CopyAndPaste/lexical/CopyAndPaste.spec.mjs:693` test: 'Copy and paste an inline element into a leaf node', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/CopyAndPaste/lexical/CopyAndPaste.spec.mjs:697` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/CopyAndPaste/lexical/CopyAndPaste.spec.mjs:746` test: 'Copy + paste multi-line plain text into rich text produces separate paragraphs', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/CopyAndPaste/lexical/CopyAndPaste.spec.mjs:750` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/CopyAndPaste/lexical/CopyAndPaste.spec.mjs:769` test: 'Pasting a decorator node on a blank line inserts before the line', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/CopyAndPaste/lexical/CopyAndPaste.spec.mjs:775` test: isPlainText \|\| isCollab);
- `../lexical/packages/lexical-playground/__tests__/e2e/CopyAndPaste/lexical/CopyAndPaste.spec.mjs:825` test: 'Copy and paste paragraph into quote', async ({page, isPlainText}) => {
- `../lexical/packages/lexical-playground/__tests__/e2e/CopyAndPaste/lexical/CopyAndPaste.spec.mjs:826` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/CopyAndPaste/lexical/CopyAndPaste.spec.mjs:855` test: 'Process font-size from content copied from Google Docs/MS Word', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/CopyAndPaste/lexical/CopyAndPaste.spec.mjs:859` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/CopyAndPaste/lexical/CopyAndPaste.spec.mjs:883` test: 'test font-size in pt and px both are processed correctly', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/CopyAndPaste/lexical/CopyAndPaste.spec.mjs:887` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/CopyAndPaste/lexical/CopyAndPaste.spec.mjs:915` test: 'Cut then copy empty selection preserves clipboard', async ({

## `../lexical/packages/lexical-playground/__tests__/e2e/CopyAndPaste/lexical/ListsCopyAndPaste.spec.mjs`

category: portable
family: clipboard-paste / browser-engine
target: indexed 16 test/describe lines; target packages/plite/test/clipboard-contract.ts; packages/plite-dom/test/clipboard-boundary.test.ts; apps/www/tests/plite-browser/donor/examples/paste-html.test.ts; apps/www/tests/plite-browser/donor/stress/generated-editing.test.ts

- `../lexical/packages/lexical-playground/__tests__/e2e/CopyAndPaste/lexical/ListsCopyAndPaste.spec.mjs:30` test: 'Lists CopyAndPaste', () => {
- `../lexical/packages/lexical-playground/__tests__/e2e/CopyAndPaste/lexical/ListsCopyAndPaste.spec.mjs:31` test: ({isCollab, page}) => initialize({isCollab, page}));
- `../lexical/packages/lexical-playground/__tests__/e2e/CopyAndPaste/lexical/ListsCopyAndPaste.spec.mjs:33` test: 'Copy and paste of partial list items into an empty editor', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/CopyAndPaste/lexical/ListsCopyAndPaste.spec.mjs:37` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/CopyAndPaste/lexical/ListsCopyAndPaste.spec.mjs:141` test: 'Copy and paste of partial list items into the list', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/CopyAndPaste/lexical/ListsCopyAndPaste.spec.mjs:147` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/CopyAndPaste/lexical/ListsCopyAndPaste.spec.mjs:283` test: 'Copy list items and paste back into list', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/CopyAndPaste/lexical/ListsCopyAndPaste.spec.mjs:288` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/CopyAndPaste/lexical/ListsCopyAndPaste.spec.mjs:404` test: 'Copy list items and paste into list', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/CopyAndPaste/lexical/ListsCopyAndPaste.spec.mjs:409` test: isCollab && IS_LINUX, 'Flaky on Linux + Collab');
- `../lexical/packages/lexical-playground/__tests__/e2e/CopyAndPaste/lexical/ListsCopyAndPaste.spec.mjs:410` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/CopyAndPaste/lexical/ListsCopyAndPaste.spec.mjs:538` test: 'Copy and paste of list items and paste back into list on an existing item', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/CopyAndPaste/lexical/ListsCopyAndPaste.spec.mjs:543` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/CopyAndPaste/lexical/ListsCopyAndPaste.spec.mjs:668` test: 'Copy and paste two paragraphs into list on an existing item', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/CopyAndPaste/lexical/ListsCopyAndPaste.spec.mjs:672` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/CopyAndPaste/lexical/ListsCopyAndPaste.spec.mjs:771` test: 'Copy and paste two paragraphs at the end of a list', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/CopyAndPaste/lexical/ListsCopyAndPaste.spec.mjs:775` test: isPlainText);

## `../lexical/packages/lexical-playground/__tests__/e2e/DateTime.spec.mjs`

category: portable-mixed
family: mixed portable invariant
target: indexed 7 test/describe lines; target packages/plite/test; add focused browser proof only when behavior depends on DOM/runtime transport

- `../lexical/packages/lexical-playground/__tests__/e2e/DateTime.spec.mjs:20` test: 'DateTime', () => {
- `../lexical/packages/lexical-playground/__tests__/e2e/DateTime.spec.mjs:21` test: ({isCollab, page}) => initialize({isCollab, page}));
- `../lexical/packages/lexical-playground/__tests__/e2e/DateTime.spec.mjs:23` test: 'can insert a DateTime node via the Insert dropdown', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/DateTime.spec.mjs:27` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/DateTime.spec.mjs:62` test: 'Datetime should be inserted into the link', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/DateTime.spec.mjs:66` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/DateTime.spec.mjs:114` test: 'Datetime should apply the current selection format', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/DateTime.spec.mjs:118` test: isPlainText);

## `../lexical/packages/lexical-playground/__tests__/e2e/DraggableBlock.spec.mjs`

category: portable
family: portable editor behavior
target: indexed 17 test/describe lines; target packages/plite/test; add focused browser proof only when behavior depends on DOM/runtime transport

- `../lexical/packages/lexical-playground/__tests__/e2e/DraggableBlock.spec.mjs:18` test: 'DraggableBlock', () => {
- `../lexical/packages/lexical-playground/__tests__/e2e/DraggableBlock.spec.mjs:19` test: ({isCollab, page}) => initialize({isCollab, page}));
- `../lexical/packages/lexical-playground/__tests__/e2e/DraggableBlock.spec.mjs:21` test: 'Paragraph one can be successfully dragged below paragraph two', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/DraggableBlock.spec.mjs:27` test: isCollab);
- `../lexical/packages/lexical-playground/__tests__/e2e/DraggableBlock.spec.mjs:28` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/DraggableBlock.spec.mjs:29` test: browserName === 'firefox');
- `../lexical/packages/lexical-playground/__tests__/e2e/DraggableBlock.spec.mjs:70` test: 'Dragging a paragraph to the end of itself does not change the content', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/DraggableBlock.spec.mjs:76` test: isCollab);
- `../lexical/packages/lexical-playground/__tests__/e2e/DraggableBlock.spec.mjs:77` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/DraggableBlock.spec.mjs:78` test: browserName === 'firefox');
- `../lexical/packages/lexical-playground/__tests__/e2e/DraggableBlock.spec.mjs:112` test: 'Drag a paragraph to the bottom of its previous paragraph and nothing happens', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/DraggableBlock.spec.mjs:118` test: isCollab);
- `../lexical/packages/lexical-playground/__tests__/e2e/DraggableBlock.spec.mjs:119` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/DraggableBlock.spec.mjs:120` test: browserName === 'firefox');
- `../lexical/packages/lexical-playground/__tests__/e2e/DraggableBlock.spec.mjs:154` test: 'Dragging the first paragraph to an empty space in the middle of the editor works correctly', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/DraggableBlock.spec.mjs:160` test: isCollab);
- `../lexical/packages/lexical-playground/__tests__/e2e/DraggableBlock.spec.mjs:161` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/DraggableBlock.spec.mjs:162` test: browserName === 'firefox');

## `../lexical/packages/lexical-playground/__tests__/e2e/ElementFormat.spec.mjs`

category: portable
family: serialization-parsing / marks-inline
target: indexed 4 test/describe lines; target packages/plite/test; packages/plite-history/test; apps/www/tests/plite-browser/donor/examples/richtext.test.ts

- `../lexical/packages/lexical-playground/__tests__/e2e/ElementFormat.spec.mjs:20` test: 'Element format', () => {
- `../lexical/packages/lexical-playground/__tests__/e2e/ElementFormat.spec.mjs:21` test: ({isCollab, isPlainText, page}) => {
- `../lexical/packages/lexical-playground/__tests__/e2e/ElementFormat.spec.mjs:22` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/ElementFormat.spec.mjs:26` test: 'Can indent/align paragraph when caret is within link', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/ElementFormat.spec.mjs:59` test: 'Can center align an empty paragraph', async ({page, isPlainText}) => {

## `../lexical/packages/lexical-playground/__tests__/e2e/Emoticons.spec.mjs`

category: portable-mixed
family: mixed portable invariant
target: indexed 4 test/describe lines; target packages/plite/test; add focused browser proof only when behavior depends on DOM/runtime transport

- `../lexical/packages/lexical-playground/__tests__/e2e/Emoticons.spec.mjs:24` test: 'Emoticons', () => {
- `../lexical/packages/lexical-playground/__tests__/e2e/Emoticons.spec.mjs:25` test: ({isCollab, page}) => initialize({isCollab, page}));
- `../lexical/packages/lexical-playground/__tests__/e2e/Emoticons.spec.mjs:26` test: `Can handle a single emoticon`, async ({page, browserName}) => {
- `../lexical/packages/lexical-playground/__tests__/e2e/Emoticons.spec.mjs:107` test: `Can enter multiple emoticons`, async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/Emoticons.spec.mjs:577` test: `Can handle single emoticon replaced with text`, async ({page}) => {

## `../lexical/packages/lexical-playground/__tests__/e2e/EquationNode.spec.mjs`

category: portable-mixed
family: mixed portable invariant
target: indexed 4 test/describe lines; target packages/plite/test; add focused browser proof only when behavior depends on DOM/runtime transport

- `../lexical/packages/lexical-playground/__tests__/e2e/EquationNode.spec.mjs:62` test: 'EquationNode', () => {
- `../lexical/packages/lexical-playground/__tests__/e2e/EquationNode.spec.mjs:63` test: ({isCollab, isPlainText, page}) => {
- `../lexical/packages/lexical-playground/__tests__/e2e/EquationNode.spec.mjs:64` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/EquationNode.spec.mjs:70` test: 'inline EquationNode is wrapped in a paragraph', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/EquationNode.spec.mjs:88` test: 'block EquationNode is a child of the root', async ({

## `../lexical/packages/lexical-playground/__tests__/e2e/Events.spec.mjs`

category: portable
family: beforeinput-input / browser-engine
target: indexed 3 test/describe lines; target packages/plite-react/test/model-input-strategy-contract.test.ts; apps/www/tests/plite-browser/donor/stress/generated-editing.test.ts

- `../lexical/packages/lexical-playground/__tests__/e2e/Events.spec.mjs:21` test: 'Events', () => {
- `../lexical/packages/lexical-playground/__tests__/e2e/Events.spec.mjs:22` test: ({isCollab, page}) => initialize({isCollab, page}));
- `../lexical/packages/lexical-playground/__tests__/e2e/Events.spec.mjs:24` test: 'Autocapitalization (MacOS specific)', async ({page, isPlainText}) => {
- `../lexical/packages/lexical-playground/__tests__/e2e/Events.spec.mjs:99` test: 'Caret ends after text replacement acceptance boundary - using Space (MacOS specific)', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/Events.spec.mjs:208` test: 'Caret ends after text replacement acceptance boundary - using Enter (MacOS specific)', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/Events.spec.mjs:360` test: 'Add period with double-space after emoji (MacOS specific) #3953', async ({

## `../lexical/packages/lexical-playground/__tests__/e2e/Extensions.spec.mjs`

category: portable
family: clipboard-paste / browser-engine
target: indexed 9 test/describe lines; target packages/plite/test/clipboard-contract.ts; packages/plite-dom/test/clipboard-boundary.test.ts; apps/www/tests/plite-browser/donor/examples/paste-html.test.ts; apps/www/tests/plite-browser/donor/stress/generated-editing.test.ts

- `../lexical/packages/lexical-playground/__tests__/e2e/Extensions.spec.mjs:23` test: 'Extensions', () => {
- `../lexical/packages/lexical-playground/__tests__/e2e/Extensions.spec.mjs:24` test: ({isCollab, page}) => initialize({isCollab, page}));
- `../lexical/packages/lexical-playground/__tests__/e2e/Extensions.spec.mjs:25` test: `document.execCommand("insertText")`, async ({page}) => {
- `../lexical/packages/lexical-playground/__tests__/e2e/Extensions.spec.mjs:47` test: `ClipboardEvent("paste")`, async ({page, browserName}) => {
- `../lexical/packages/lexical-playground/__tests__/e2e/Extensions.spec.mjs:128` test: `ClipboardEvent("paste") + document.execCommand("insertText")`, async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/Extensions.spec.mjs:183` test: `document.execCommand("insertText") with selection`, async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/Extensions.spec.mjs:189` test: isCollab);
- `../lexical/packages/lexical-playground/__tests__/e2e/Extensions.spec.mjs:190` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/Extensions.spec.mjs:237` test: 'document.execCommand("insertText") with all text backward selection', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/Extensions.spec.mjs:274` test: 'document.execCommand("insertText") with all text forward selection', async ({

## `../lexical/packages/lexical-playground/__tests__/e2e/Focus.spec.mjs`

category: portable
family: beforeinput-input / browser-engine
target: indexed 5 test/describe lines; target packages/plite-react/test/model-input-strategy-contract.test.ts; apps/www/tests/plite-browser/donor/stress/generated-editing.test.ts

- `../lexical/packages/lexical-playground/__tests__/e2e/Focus.spec.mjs:18` test: 'Focus', () => {
- `../lexical/packages/lexical-playground/__tests__/e2e/Focus.spec.mjs:19` test: ({isCollab, page}) => initialize({isCollab, page}));
- `../lexical/packages/lexical-playground/__tests__/e2e/Focus.spec.mjs:20` test: `can tab out of the editor`, async ({browserName, page, isRichText}) => {
- `../lexical/packages/lexical-playground/__tests__/e2e/Focus.spec.mjs:23` test: isRichText \|\| browserName === 'webkit');
- `../lexical/packages/lexical-playground/__tests__/e2e/Focus.spec.mjs:34` test: `selection remains internally when clicking outside the editor`, async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/Focus.spec.mjs:38` test: isCollab);

## `../lexical/packages/lexical-playground/__tests__/e2e/HTML.spec.mjs`

category: portable
family: portable editor behavior
target: indexed; target current Plite package proof and browser proof when DOM-dependent

- `../lexical/packages/lexical-playground/__tests__/e2e/HTML.spec.mjs:29` test: 'HTML', () => {
- `../lexical/packages/lexical-playground/__tests__/e2e/HTML.spec.mjs:30` test: ({isCollab, page}) => initialize({isCollab, page}));
- `../lexical/packages/lexical-playground/__tests__/e2e/HTML.spec.mjs:31` test: `Can export HTML using the button`, async ({page, isPlainText}) => {
- `../lexical/packages/lexical-playground/__tests__/e2e/HTML.spec.mjs:32` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/HTML.spec.mjs:126` test: `Can import HTML using the button`, async ({page, isPlainText}) => {
- `../lexical/packages/lexical-playground/__tests__/e2e/HTML.spec.mjs:127` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/HTML.spec.mjs:193` test: `Formats a terse HTML export with prettier`, async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/HTML.spec.mjs:197` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/HTML.spec.mjs:223` test: `Can switch from Pages mode`, async ({page, isPlainText, isCollab}) => {
- `../lexical/packages/lexical-playground/__tests__/e2e/HTML.spec.mjs:224` test: isPlainText \|\| isCollab);

## `../lexical/packages/lexical-playground/__tests__/e2e/Hashtags.spec.mjs`

category: portable
family: selection-dom-mapping / void-atom
target: indexed 13 test/describe lines; target packages/plite/test; packages/plite-react/test/editable-behavior.test.tsx; apps/www/tests/plite-browser/donor/stress/generated-editing.test.ts

- `../lexical/packages/lexical-playground/__tests__/e2e/Hashtags.spec.mjs:28` test: 'Hashtags', () => {
- `../lexical/packages/lexical-playground/__tests__/e2e/Hashtags.spec.mjs:29` test: ({isCollab, page}) => initialize({isCollab, page}));
- `../lexical/packages/lexical-playground/__tests__/e2e/Hashtags.spec.mjs:30` test: `Can handle a single hashtag`, async ({page}) => {
- `../lexical/packages/lexical-playground/__tests__/e2e/Hashtags.spec.mjs:90` test: `Can handle adjacent hashtags`, async ({page, browserName}) => {
- `../lexical/packages/lexical-playground/__tests__/e2e/Hashtags.spec.mjs:195` test: `Can insert many hashtags mixed with text and delete them all correctly`, async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/Hashtags.spec.mjs:271` test: 'Hashtag inherits format', async ({page, isPlainText}) => {
- `../lexical/packages/lexical-playground/__tests__/e2e/Hashtags.spec.mjs:272` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/Hashtags.spec.mjs:292` test: 'Should not break with multiple leading "#" #5636', async ({page}) => {
- `../lexical/packages/lexical-playground/__tests__/e2e/Hashtags.spec.mjs:331` test: 'Should not break while skipping invalid hashtags #5703', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/Hashtags.spec.mjs:367` test: 'Can handle hashtags following multiple invalid hashtags', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/Hashtags.spec.mjs:422` test: 'Should not break when pasting multiple matches', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/Hashtags.spec.mjs:426` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/Hashtags.spec.mjs:446` test: 'Should not break while importing and exporting multiple matches', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/Hashtags.spec.mjs:450` test: isPlainText);

## `../lexical/packages/lexical-playground/__tests__/e2e/Headings/HeadingsBackspaceAtStart.spec.mjs`

category: portable
family: serialization-parsing / marks-inline
target: indexed 2 test/describe lines; target packages/plite/test; packages/plite-history/test; apps/www/tests/plite-browser/donor/examples/richtext.test.ts

- `../lexical/packages/lexical-playground/__tests__/e2e/Headings/HeadingsBackspaceAtStart.spec.mjs:22` test: 'Headings - stays as a heading when you backspace at the start of a heading with no previous sibling nodes present', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/Headings/HeadingsBackspaceAtStart.spec.mjs:27` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/Headings/HeadingsBackspaceAtStart.spec.mjs:59` test: 'Headings - removes only the empty previous paragraph and preserves heading on backspace at start (#4359)', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/Headings/HeadingsBackspaceAtStart.spec.mjs:64` test: isPlainText);

## `../lexical/packages/lexical-playground/__tests__/e2e/Headings/HeadingsEnterAtEnd.spec.mjs`

category: portable
family: serialization-parsing / marks-inline
target: indexed 2 test/describe lines; target packages/plite/test; packages/plite-history/test; apps/www/tests/plite-browser/donor/examples/richtext.test.ts

- `../lexical/packages/lexical-playground/__tests__/e2e/Headings/HeadingsEnterAtEnd.spec.mjs:18` test: 'Headings - changes to a paragraph when you press enter at the end of a heading', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/Headings/HeadingsEnterAtEnd.spec.mjs:23` test: isPlainText);

## `../lexical/packages/lexical-playground/__tests__/e2e/Headings/HeadingsEnterInMiddle.spec.mjs`

category: portable
family: serialization-parsing / marks-inline
target: indexed 2 test/describe lines; target packages/plite/test; packages/plite-history/test; apps/www/tests/plite-browser/donor/examples/richtext.test.ts

- `../lexical/packages/lexical-playground/__tests__/e2e/Headings/HeadingsEnterInMiddle.spec.mjs:23` test: `Headings - stays as a heading when you press enter in the middle of a heading`, async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/Headings/HeadingsEnterInMiddle.spec.mjs:28` test: isPlainText);

## `../lexical/packages/lexical-playground/__tests__/e2e/HorizontalRule.spec.mjs`

category: portable
family: selection-dom-mapping / void-atom
target: indexed 15 test/describe lines; target packages/plite/test; packages/plite-react/test/editable-behavior.test.tsx; apps/www/tests/plite-browser/donor/stress/generated-editing.test.ts

- `../lexical/packages/lexical-playground/__tests__/e2e/HorizontalRule.spec.mjs:38` test: 'HorizontalRule', () => {
- `../lexical/packages/lexical-playground/__tests__/e2e/HorizontalRule.spec.mjs:39` test: ({isCollab, page}) => initialize({isCollab, page}));
- `../lexical/packages/lexical-playground/__tests__/e2e/HorizontalRule.spec.mjs:40` test: 'Can create a horizontal rule and move selection around it', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/HorizontalRule.spec.mjs:46` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/HorizontalRule.spec.mjs:167` test: 'Will add a horizontal rule at the end of a current TextNode and move selection to the new ParagraphNode.', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/HorizontalRule.spec.mjs:171` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/HorizontalRule.spec.mjs:221` test: 'Will add a horizontal rule and split a TextNode across 2 paragraphs if the caret is in the middle of the TextNode, moving selection to the start of the new ParagraphNode.', async
- `../lexical/packages/lexical-playground/__tests__/e2e/HorizontalRule.spec.mjs:225` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/HorizontalRule.spec.mjs:283` test: 'Will add a horizontal rule and split a TextNode across 2 ListItemNode if the caret is in the middle of the TextNode, moving selection to the start of the new ParagraphNode', async
- `../lexical/packages/lexical-playground/__tests__/e2e/HorizontalRule.spec.mjs:287` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/HorizontalRule.spec.mjs:352` test: 'Will add a horizontal rule and split a TextNode across 2 ListItemNode if the caret is in an empty ListItemNode, moving selection to the start of the new ListItemNode (#6849)', asy
- `../lexical/packages/lexical-playground/__tests__/e2e/HorizontalRule.spec.mjs:356` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/HorizontalRule.spec.mjs:410` test: 'Can copy and paste a horizontal rule', async ({page, isPlainText}) => {
- `../lexical/packages/lexical-playground/__tests__/e2e/HorizontalRule.spec.mjs:411` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/HorizontalRule.spec.mjs:517` test: 'Can delete empty paragraph after a horizontal rule without deleting the horizontal rule', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/HorizontalRule.spec.mjs:523` test: isPlainText \|\| isCollab);
- `../lexical/packages/lexical-playground/__tests__/e2e/HorizontalRule.spec.mjs:608` test: 'ArrowDown from middle of multi-line paragraph does not jump to adjacent decorator', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/HorizontalRule.spec.mjs:613` test: isPlainText \|\| isCollab);
- `../lexical/packages/lexical-playground/__tests__/e2e/HorizontalRule.spec.mjs:653` test: 'ArrowUp navigates through consecutive decorators', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/HorizontalRule.spec.mjs:658` test: isPlainText \|\| isCollab);
- `../lexical/packages/lexical-playground/__tests__/e2e/HorizontalRule.spec.mjs:693` test: 'ArrowDown from last line of paragraph stops at adjacent decorator', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/HorizontalRule.spec.mjs:698` test: isPlainText \|\| isCollab);
- `../lexical/packages/lexical-playground/__tests__/e2e/HorizontalRule.spec.mjs:720` test: 'ArrowDown from last list item selects adjacent decorator', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/HorizontalRule.spec.mjs:725` test: isPlainText \|\| isCollab);
- `../lexical/packages/lexical-playground/__tests__/e2e/HorizontalRule.spec.mjs:759` test: 'Clicking between consecutive block decorators creates selection (#6775)', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/HorizontalRule.spec.mjs:764` test: isPlainText \|\| isCollab);
- `../lexical/packages/lexical-playground/__tests__/e2e/HorizontalRule.spec.mjs:826` test: 'ArrowDown from block cursor between shadow root and decorator selects the decorator', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/HorizontalRule.spec.mjs:831` test: isPlainText \|\| isCollab);

## `../lexical/packages/lexical-playground/__tests__/e2e/Images.spec.mjs`

category: portable
family: portable editor behavior
target: indexed 25 test/describe lines; target packages/plite/test; add focused browser proof only when behavior depends on DOM/runtime transport

- `../lexical/packages/lexical-playground/__tests__/e2e/Images.spec.mjs:35` test: 'Images', () => {
- `../lexical/packages/lexical-playground/__tests__/e2e/Images.spec.mjs:37` test: IS_COLLAB_V2);
- `../lexical/packages/lexical-playground/__tests__/e2e/Images.spec.mjs:39` test: ({isCollab, page}) => initialize({isCollab, page}));
- `../lexical/packages/lexical-playground/__tests__/e2e/Images.spec.mjs:40` test: `Can create a decorator and move selection around it`, async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/Images.spec.mjs:45` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/Images.spec.mjs:225` test: 'Can add images and delete them correctly', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/Images.spec.mjs:229` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/Images.spec.mjs:399` test: 'Can add images by arbitrary URL', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/Images.spec.mjs:404` test: isPlainText \|\| isCollab, 'Skip in plain text and collab mode');
- `../lexical/packages/lexical-playground/__tests__/e2e/Images.spec.mjs:450` test: 'Can be dragged and dropped correctly when the image is clicked', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/Images.spec.mjs:456` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/Images.spec.mjs:457` test: browserName === 'firefox' && isCollab);
- `../lexical/packages/lexical-playground/__tests__/e2e/Images.spec.mjs:458` test: browserName === 'firefox' && IS_WINDOWS);
- `../lexical/packages/lexical-playground/__tests__/e2e/Images.spec.mjs:543` test: 'Cannot be dragged without being clicked', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/Images.spec.mjs:547` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/Images.spec.mjs:585` test: 'Select image, then select text - EditorState._selection updates with mousedown #2901', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/Images.spec.mjs:592` test: isCollab);
- `../lexical/packages/lexical-playground/__tests__/e2e/Images.spec.mjs:593` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/Images.spec.mjs:618` test: 'Node selection: can select multiple image nodes and replace them with a new image', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/Images.spec.mjs:623` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/Images.spec.mjs:730` test: 'Can resolve selection correctly when the image is clicked and dragged right', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/Images.spec.mjs:736` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/Images.spec.mjs:775` test: `Verifies image dimensions are properly calculated for both SVG and JPG formats`, async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/Images.spec.mjs:780` test: isPlainText \|\| isCollab, 'Skip in plain text and collab mode');
- `../lexical/packages/lexical-playground/__tests__/e2e/Images.spec.mjs:825` test: 'Dimensionless SVG renders with a visible bounding box instead of collapsing', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/Images.spec.mjs:830` test: !isRichText \|\| isCollab);

## `../lexical/packages/lexical-playground/__tests__/e2e/Indentation.spec.mjs`

category: portable
family: serialization-parsing / marks-inline
target: indexed 13 test/describe lines; target packages/plite/test; packages/plite-history/test; apps/www/tests/plite-browser/donor/examples/richtext.test.ts

- `../lexical/packages/lexical-playground/__tests__/e2e/Indentation.spec.mjs:41` test: 'Identation', () => {
- `../lexical/packages/lexical-playground/__tests__/e2e/Indentation.spec.mjs:42` test: ({isCollab, page}) =>
- `../lexical/packages/lexical-playground/__tests__/e2e/Indentation.spec.mjs:46` test: `Can create content and indent and outdent it all`, async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/Indentation.spec.mjs:53` test: isPlainText \|\| isCollab);
- `../lexical/packages/lexical-playground/__tests__/e2e/Indentation.spec.mjs:463` test: `Can only indent paragraph until the max depth`, async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/Indentation.spec.mjs:467` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/Indentation.spec.mjs:481` test: `Can only indent until the max depth when list is empty`, async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/Indentation.spec.mjs:485` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/Indentation.spec.mjs:593` test: `Can only indent until the max depth when list has content`, async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/Indentation.spec.mjs:597` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/Indentation.spec.mjs:706` test: `Can only indent until the max depth a list with nested lists`, async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/Indentation.spec.mjs:710` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/Indentation.spec.mjs:1009` test: `Cannot have negative indents (#7410)`, async ({page, isPlainText}) => {
- `../lexical/packages/lexical-playground/__tests__/e2e/Indentation.spec.mjs:1010` test: isPlainText);

## `../lexical/packages/lexical-playground/__tests__/e2e/Keyboard.spec.mjs`

category: portable
family: beforeinput-input / browser-engine
target: indexed 3 test/describe lines; target packages/plite-react/test/model-input-strategy-contract.test.ts; apps/www/tests/plite-browser/donor/stress/generated-editing.test.ts

- `../lexical/packages/lexical-playground/__tests__/e2e/Keyboard.spec.mjs:21` test: 'Keyboard shortcuts', () => {
- `../lexical/packages/lexical-playground/__tests__/e2e/Keyboard.spec.mjs:22` test: <multiline or generated title>
- `../lexical/packages/lexical-playground/__tests__/e2e/Keyboard.spec.mjs:26` test: 'handles "insertTranspose" event from Control+T on MAC', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/Keyboard.spec.mjs:32` test: !supportsTranspose);

## `../lexical/packages/lexical-playground/__tests__/e2e/KeyboardShortcuts.spec.mjs`

category: portable
family: beforeinput-input / browser-engine
target: indexed 9 test/describe lines; target packages/plite-react/test/model-input-strategy-contract.test.ts; apps/www/tests/plite-browser/donor/stress/generated-editing.test.ts

- `../lexical/packages/lexical-playground/__tests__/e2e/KeyboardShortcuts.spec.mjs:179` test: 'Keyboard shortcuts', () => {
- `../lexical/packages/lexical-playground/__tests__/e2e/KeyboardShortcuts.spec.mjs:180` test: ({isPlainText, isCollab, page}) => {
- `../lexical/packages/lexical-playground/__tests__/e2e/KeyboardShortcuts.spec.mjs:181` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/KeyboardShortcuts.spec.mjs:186` test: `Can use ${format} format with the shortcut`, async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/KeyboardShortcuts.spec.mjs:211` test: `Can use ${alignment} with the shortcut`, async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/KeyboardShortcuts.spec.mjs:229` test: `Can use ${style} with the shortcut`, async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/KeyboardShortcuts.spec.mjs:246` test: 'Can increase and decrease font size with the shortcuts', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/KeyboardShortcuts.spec.mjs:264` test: 'Can clear formatting with the shortcut', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/KeyboardShortcuts.spec.mjs:312` test: 'Can toggle Insert Code Block with the shortcut', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/KeyboardShortcuts.spec.mjs:335` test: 'Can indent and outdent with the shortcuts', async ({

## `../lexical/packages/lexical-playground/__tests__/e2e/Keywords.spec.mjs`

category: portable-mixed
family: selection-dom-mapping / void-atom
target: indexed 7 test/describe lines; target packages/plite/test; packages/plite-react/test/editable-behavior.test.tsx; apps/www/tests/plite-browser/donor/stress/generated-editing.test.ts

- `../lexical/packages/lexical-playground/__tests__/e2e/Keywords.spec.mjs:24` test: 'Keywords', () => {
- `../lexical/packages/lexical-playground/__tests__/e2e/Keywords.spec.mjs:25` test: ({isCollab, page}) => initialize({isCollab, page}));
- `../lexical/packages/lexical-playground/__tests__/e2e/Keywords.spec.mjs:26` test: `Can create a decorator and move selection around it`, async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/Keywords.spec.mjs:190` test: 'Can type congrats[Team]!', async ({page}) => {
- `../lexical/packages/lexical-playground/__tests__/e2e/Keywords.spec.mjs:217` test: 'Can type "congrats Bob!" where " Bob!" is bold', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/Keywords.spec.mjs:222` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/Keywords.spec.mjs:335` test: 'Can type "Everyone congrats!" where "Everyone " and "!" are bold', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/Keywords.spec.mjs:339` test: isPlainText);

## `../lexical/packages/lexical-playground/__tests__/e2e/Links.spec.mjs`

category: portable
family: selection-dom-mapping / void-atom
target: indexed 65 test/describe lines; target packages/plite/test; packages/plite-react/test/editable-behavior.test.tsx; apps/www/tests/plite-browser/donor/stress/generated-editing.test.ts

- `../lexical/packages/lexical-playground/__tests__/e2e/Links.spec.mjs:38` test: ({isPlainText}) => {
- `../lexical/packages/lexical-playground/__tests__/e2e/Links.spec.mjs:39` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/Links.spec.mjs:42` test: 'Links', () => {
- `../lexical/packages/lexical-playground/__tests__/e2e/Links.spec.mjs:43` test: ({isCollab, page}) => initialize({isCollab, page}));
- `../lexical/packages/lexical-playground/__tests__/e2e/Links.spec.mjs:44` test: `Can convert a text node into a link`, async ({page}) => {
- `../lexical/packages/lexical-playground/__tests__/e2e/Links.spec.mjs:127` test: `Can convert multi-formatted text into a link (backward)`, async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/Links.spec.mjs:244` test: `Can convert multi-formatted text into a link (forward)`, async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/Links.spec.mjs:361` test: `Can create a link in a list and insert a paragraph at the start`, async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/Links.spec.mjs:412` test: `Can create a link with some text after, insert paragraph, then backspace, it should merge correctly`, async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/Links.spec.mjs:487` test: `Can backspace across a link and it deletes text, not the whole link`, async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/Links.spec.mjs:539` test: `Can create a link then replace it with plain text`, async ({page}) => {
- `../lexical/packages/lexical-playground/__tests__/e2e/Links.spec.mjs:578` test: `Can create a link then replace it with plain text #2`, async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/Links.spec.mjs:604` test: `Can create a link then partly replace it with plain text`, async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/Links.spec.mjs:637` test: 'Inserting text either side of links', () => {
- `../lexical/packages/lexical-playground/__tests__/e2e/Links.spec.mjs:661` test: 'Inserting text before links', () => {
- `../lexical/packages/lexical-playground/__tests__/e2e/Links.spec.mjs:662` test: 'Start-of-paragraph links', () => {
- `../lexical/packages/lexical-playground/__tests__/e2e/Links.spec.mjs:709` test: `Can insert text before a start-of-paragraph link, via typing`, async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/Links.spec.mjs:715` test: `Can insert text before a start-of-paragraph link, via pasting plain text`, async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/Links.spec.mjs:721` test: `Can insert text before a start-of-paragraph link, via pasting HTML`, async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/Links.spec.mjs:727` test: `Can insert text before a start-of-paragraph link, via pasting Lexical text`, async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/Links.spec.mjs:734` test: 'Mid-paragraph links', () => {
- `../lexical/packages/lexical-playground/__tests__/e2e/Links.spec.mjs:781` test: `Can insert text before a mid-paragraph link, via typing`, async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/Links.spec.mjs:787` test: `Can insert text before a mid-paragraph link, via pasting plain text`, async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/Links.spec.mjs:793` test: `Can insert text before a mid-paragraph link, via pasting HTML`, async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/Links.spec.mjs:799` test: `Can insert text before a mid-paragraph link, via pasting Lexical text`, async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/Links.spec.mjs:806` test: 'End-of-paragraph links', () => {
- `../lexical/packages/lexical-playground/__tests__/e2e/Links.spec.mjs:851` test: `Can insert text before an end-of-paragraph link, via typing`, async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/Links.spec.mjs:857` test: `Can insert text before an end-of-paragraph link, via pasting plain text`, async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/Links.spec.mjs:863` test: `Can insert text before an end-of-paragraph link, via pasting HTML`, async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/Links.spec.mjs:869` test: `Can insert text before an end-of-paragraph link, via pasting Lexical text`, async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/Links.spec.mjs:877` test: 'Inserting text after links', () => {
- `../lexical/packages/lexical-playground/__tests__/e2e/Links.spec.mjs:878` test: 'Start-of-paragraph links', () => {
- `../lexical/packages/lexical-playground/__tests__/e2e/Links.spec.mjs:924` test: `Can insert text after a start-of-paragraph link, via typing`, async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/Links.spec.mjs:930` test: `Can insert text after a start-of-paragraph link, via pasting plain text`, async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/Links.spec.mjs:936` test: `Can insert text after a start-of-paragraph link, via pasting HTML`, async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/Links.spec.mjs:942` test: `Can insert text after a start-of-paragraph link, via pasting Lexical text`, async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/Links.spec.mjs:949` test: 'Mid-paragraph links', () => {
- `../lexical/packages/lexical-playground/__tests__/e2e/Links.spec.mjs:996` test: `Can insert text after a mid-paragraph link, via typing`, async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/Links.spec.mjs:1002` test: `Can insert text after a mid-paragraph link, via pasting plain text`, async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/Links.spec.mjs:1008` test: `Can insert text after a mid-paragraph link, via pasting HTML`, async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/Links.spec.mjs:1014` test: `Can insert text after a mid-paragraph link, via pasting Lexical text`, async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/Links.spec.mjs:1021` test: 'End-of-paragraph links', () => {
- `../lexical/packages/lexical-playground/__tests__/e2e/Links.spec.mjs:1067` test: `Can insert text after an end-of-paragraph link, via typing`, async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/Links.spec.mjs:1073` test: `Can insert text after an end-of-paragraph link, via pasting plain text`, async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/Links.spec.mjs:1079` test: `Can insert text after an end-of-paragraph link, via pasting HTML`, async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/Links.spec.mjs:1085` test: `Can insert text after an end-of-paragraph link, via pasting Lexical text`, async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/Links.spec.mjs:1094` test: `Can convert multi-formatted text into a link and then modify text after`, async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/Links.spec.mjs:1219` test: `It can insert text inside a link after a formatted text node`, async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/Links.spec.mjs:1304` test: `It can insert text inside a link before a formatted text node`, async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/Links.spec.mjs:1392` test: 'Can edit link with collapsed selection', async ({page}) => {
- `../lexical/packages/lexical-playground/__tests__/e2e/Links.spec.mjs:1432` test: `Can type text before and after`, async ({page}) => {
- `../lexical/packages/lexical-playground/__tests__/e2e/Links.spec.mjs:1484` test: `Can delete text up to a link and then add text after`, async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/Links.spec.mjs:1548` test: `Can convert part of a text node into a link with forwards selection`, async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/Links.spec.mjs:1640` test: `Can convert part of a text node into a link with backwards selection`, async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/Links.spec.mjs:1744` test: `Can convert part of a text node into a link and change block type`, async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/Links.spec.mjs:1792` test: 'Can create multiline links', async ({page}) => {
- `../lexical/packages/lexical-playground/__tests__/e2e/Links.spec.mjs:1828` test: 'Can handle pressing Enter inside a Link', async ({page}) => {
- `../lexical/packages/lexical-playground/__tests__/e2e/Links.spec.mjs:1862` test: 'Can handle pressing Enter inside a Link containing multiple TextNodes', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/Links.spec.mjs:1904` test: 'Can handle pressing Enter at the beginning of a Link', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/Links.spec.mjs:1934` test: 'Can handle pressing Enter at the end of a Link', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/Links.spec.mjs:1938` test: true, 'Flaky');
- `../lexical/packages/lexical-playground/__tests__/e2e/Links.spec.mjs:1968` test: 'Can add, edit and remove links on images', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/Links.spec.mjs:1974` test: <multiline or generated title>
- `../lexical/packages/lexical-playground/__tests__/e2e/Links.spec.mjs:2119` test: 'Can add, edit and remove links on multiple selected images', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/Links.spec.mjs:2125` test: <multiline or generated title>
- `../lexical/packages/lexical-playground/__tests__/e2e/Links.spec.mjs:2375` test: 'Link attributes', () => {
- `../lexical/packages/lexical-playground/__tests__/e2e/Links.spec.mjs:2376` test: {hasLinkAttributes: true});
- `../lexical/packages/lexical-playground/__tests__/e2e/Links.spec.mjs:2377` test: ({isCollab, hasLinkAttributes, page}) =>
- `../lexical/packages/lexical-playground/__tests__/e2e/Links.spec.mjs:2380` test: 'Can add attributes with paste', async ({

## `../lexical/packages/lexical-playground/__tests__/e2e/List.spec.mjs`

category: portable
family: serialization-parsing / marks-inline
target: indexed 40 test/describe lines; target packages/plite/test; packages/plite-history/test; apps/www/tests/plite-browser/donor/examples/richtext.test.ts

- `../lexical/packages/lexical-playground/__tests__/e2e/List.spec.mjs:74` test: ({isPlainText}) => {
- `../lexical/packages/lexical-playground/__tests__/e2e/List.spec.mjs:75` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/List.spec.mjs:78` test: 'Checklist focus option', () => {
- `../lexical/packages/lexical-playground/__tests__/e2e/List.spec.mjs:79` test: '(shouldDisableFocusOnClickChecklist: true) Keeps focus outside the editor when clicking a checklist item', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/List.spec.mjs:83` test: isCollab);
- `../lexical/packages/lexical-playground/__tests__/e2e/List.spec.mjs:120` test: '(shouldDisableFocusOnClickChecklist: false) Moves focus into the editor/listItem when clicking a checklist item', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/List.spec.mjs:124` test: isCollab);
- `../lexical/packages/lexical-playground/__tests__/e2e/List.spec.mjs:169` test: 'Nested List', () => {
- `../lexical/packages/lexical-playground/__tests__/e2e/List.spec.mjs:170` test: ({isCollab, page}) => initialize({isCollab, page}));
- `../lexical/packages/lexical-playground/__tests__/e2e/List.spec.mjs:172` test: `Can create a list and partially copy some content out of it`, async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/List.spec.mjs:221` test: 'Should outdent if indented when the backspace key is pressed', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/List.spec.mjs:315` test: 'Should outdent if indented when the backspace key is pressed only at the front', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/List.spec.mjs:366` test: 'Should retain selection style when exiting list', async ({page}) => {
- `../lexical/packages/lexical-playground/__tests__/e2e/List.spec.mjs:446` test: `Can indent/outdent multiple list nodes in a list with multiple levels of indentation`, async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/List.spec.mjs:672` test: `Can indent a list with a list item in between nested lists`, async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/List.spec.mjs:720` test: `Can create a list and then toggle it back to original state.`, async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/List.spec.mjs:926` test: `Can toggle format for multi-line list of each type without losing indentation state.`, async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/List.spec.mjs:1247` test: `Can create a list containing inline blocks and then toggle it back to original state.`, async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/List.spec.mjs:1336` test: `Can create multiple bullet lists and then toggle off the list.`, async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/List.spec.mjs:1467` test: `Can create an unordered list and convert it to an ordered list `, async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/List.spec.mjs:1514` test: `Can create a single item unordered list with text and convert it to an ordered list `, async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/List.spec.mjs:1550` test: `Can create a multi-line unordered list and convert it to an ordered list `, async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/List.spec.mjs:1641` test: `Can create a multi-line unordered list and convert it to an ordered list when no nodes are in the selection`, async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/List.spec.mjs:1731` test: `Can create an indented multi-line unordered list and convert it to an ordered list `, async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/List.spec.mjs:1864` test: `Can create an indented multi-line unordered list and convert individual lists in the nested structure to a numbered list. `, async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/List.spec.mjs:2150` test: `Should merge selected nodes into existing list siblings of the same type when formatting to a list`, async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/List.spec.mjs:2227` test: `Should NOT merge selected nodes into existing list siblings of a different type when formatting to a list`, async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/List.spec.mjs:2303` test: `Should create list with start number markdown`, async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/List.spec.mjs:2334` test: `Should not process paragraph markdown inside list.`, async ({page}) => {
- `../lexical/packages/lexical-playground/__tests__/e2e/List.spec.mjs:2351` test: `Un-indents list empty list items when the user presses enter`, async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/List.spec.mjs:2410` test: `Converts a List with one ListItem to a Paragraph when Normal is selected in the format menu`, async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/List.spec.mjs:2439` test: `Converts the last ListItem in a List with multiple ListItem to a Paragraph when Normal is selected in the format menu`, async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/List.spec.mjs:2478` test: `Converts the middle ListItem in a List with multiple ListItem to a Paragraph when Normal is selected in the format menu`, async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/List.spec.mjs:2528` test: 'Can create check list, toggle it to bullet-list and back', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/List.spec.mjs:2656` test: 'can navigate and check/uncheck with keyboard', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/List.spec.mjs:2719` test: 'replaces existing element node', async ({page}) => {
- `../lexical/packages/lexical-playground/__tests__/e2e/List.spec.mjs:2743` test: 'remove list breaks when selection in empty nested list item', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/List.spec.mjs:2775` test: 'remove list breaks when selection in empty nested list item 2', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/List.spec.mjs:2821` test: 'new list item should preserve format from previous list item even after new list item is indented', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/List.spec.mjs:2859` test: 'collapseAtStart for trivial bullet list', async ({page}) => {
- `../lexical/packages/lexical-playground/__tests__/e2e/List.spec.mjs:2882` test: 'collapseAtStart for bullet list with text', async ({page}) => {
- `../lexical/packages/lexical-playground/__tests__/e2e/List.spec.mjs:2907` test: 'collapseAtStart for bullet list with text inside autolink', async ({

## `../lexical/packages/lexical-playground/__tests__/e2e/Markdown.spec.mjs`

category: portable
family: serialization-parsing / marks-inline
target: indexed 28 test/describe lines; target packages/plite/test; packages/plite-history/test; apps/www/tests/plite-browser/donor/examples/richtext.test.ts

- `../lexical/packages/lexical-playground/__tests__/e2e/Markdown.spec.mjs:55` test: 'Markdown', () => {
- `../lexical/packages/lexical-playground/__tests__/e2e/Markdown.spec.mjs:56` test: ({isCollab, page}) => initialize({isCollab, page}));
- `../lexical/packages/lexical-playground/__tests__/e2e/Markdown.spec.mjs:225` test: `Should create stylized (e.g. BIUS) text from plain text using a markdown shortcut e.g. ${markdownText}`, async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/Markdown.spec.mjs:230` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/Markdown.spec.mjs:256` test: `Should create stylized (e.g. BIUS) text from already stylized text using a markdown shortcut e.g. ${markdownText}`, async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/Markdown.spec.mjs:261` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/Markdown.spec.mjs:314` test: `Should test markdown with the (${markdownText}) trigger. Should include undo and redo.`, async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/Markdown.spec.mjs:319` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/Markdown.spec.mjs:339` test: `Should test importing markdown (${markdownText}) trigger.`, async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/Markdown.spec.mjs:344` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/Markdown.spec.mjs:386` test: 'Markdown', () => {
- `../lexical/packages/lexical-playground/__tests__/e2e/Markdown.spec.mjs:387` test: ({isCollab, isPlainText, page}) => {
- `../lexical/packages/lexical-playground/__tests__/e2e/Markdown.spec.mjs:388` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/Markdown.spec.mjs:660` test: `can convert "${testCase.text}" shortcut`, async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/Markdown.spec.mjs:684` test: `can convert "${testCase.text}" shortcut`, async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/Markdown.spec.mjs:696` test: `can convert "${testCase.text}" shortcut`, async ({page}) => {
- `../lexical/packages/lexical-playground/__tests__/e2e/Markdown.spec.mjs:704` test: 'can undo/redo nested transformations', async ({page, isCollab}) => {
- `../lexical/packages/lexical-playground/__tests__/e2e/Markdown.spec.mjs:769` test: 'can convert already styled text (overlapping ranges)', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/Markdown.spec.mjs:816` test: 'can convert markdown text into rich text', async ({page, isCollab}) => {
- `../lexical/packages/lexical-playground/__tests__/e2e/Markdown.spec.mjs:845` test: 'can type text with markdown', async ({page}) => {
- `../lexical/packages/lexical-playground/__tests__/e2e/Markdown.spec.mjs:851` test: 'intraword text format', async ({page}) => {
- `../lexical/packages/lexical-playground/__tests__/e2e/Markdown.spec.mjs:877` test: 'can export text format next to a newline', async ({page}) => {
- `../lexical/packages/lexical-playground/__tests__/e2e/Markdown.spec.mjs:913` test: 'can import single decorator node (#2604)', async ({page}) => {
- `../lexical/packages/lexical-playground/__tests__/e2e/Markdown.spec.mjs:915` test: IS_COLLAB_V2);
- `../lexical/packages/lexical-playground/__tests__/e2e/Markdown.spec.mjs:947` test: 'can import several text match transformers in a same line (#5385)', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/Markdown.spec.mjs:951` test: IS_COLLAB_V2);
- `../lexical/packages/lexical-playground/__tests__/e2e/Markdown.spec.mjs:1015` test: 'does not use code-formatted text in text format transformers (#7349)', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/Markdown.spec.mjs:1036` test: 'can adjust selection after text match transformer', async ({page}) => {
- `../lexical/packages/lexical-playground/__tests__/e2e/Markdown.spec.mjs:1063` test: 'keep list marker on its own items', async ({page}) => {
- `../lexical/packages/lexical-playground/__tests__/e2e/Markdown.spec.mjs:1077` test: 'keep list marker on its own items with copy/paste', async ({page}) => {

## `../lexical/packages/lexical-playground/__tests__/e2e/MaxLength.spec.mjs`

category: portable-mixed
family: mixed portable invariant
target: indexed 6 test/describe lines; target packages/plite/test; add focused browser proof only when behavior depends on DOM/runtime transport

- `../lexical/packages/lexical-playground/__tests__/e2e/MaxLength.spec.mjs:24` test: 'MaxLength', () => {
- `../lexical/packages/lexical-playground/__tests__/e2e/MaxLength.spec.mjs:25` test: {isMaxLength: true});
- `../lexical/packages/lexical-playground/__tests__/e2e/MaxLength.spec.mjs:26` test: ({isCollab, isMaxLength, page}) =>
- `../lexical/packages/lexical-playground/__tests__/e2e/MaxLength.spec.mjs:29` test: `can restrict the text to specified length`, async ({page}) => {
- `../lexical/packages/lexical-playground/__tests__/e2e/MaxLength.spec.mjs:56` test: `can restrict pasted text to specified length`, async ({page}) => {
- `../lexical/packages/lexical-playground/__tests__/e2e/MaxLength.spec.mjs:73` test: `can restrict emojis on boundaries`, async ({page}) => {
- `../lexical/packages/lexical-playground/__tests__/e2e/MaxLength.spec.mjs:125` test: `paste with empty paragraph in between #3773`, async ({page}) => {
- `../lexical/packages/lexical-playground/__tests__/e2e/MaxLength.spec.mjs:142` test: `paste with empty paragraph at end #3773`, async ({page}) => {

## `../lexical/packages/lexical-playground/__tests__/e2e/Mentions.spec.mjs`

category: portable
family: selection-dom-mapping / void-atom
target: indexed 11 test/describe lines; target packages/plite/test; packages/plite-react/test/editable-behavior.test.tsx; apps/www/tests/plite-browser/donor/stress/generated-editing.test.ts

- `../lexical/packages/lexical-playground/__tests__/e2e/Mentions.spec.mjs:30` test: 'Mentions', () => {
- `../lexical/packages/lexical-playground/__tests__/e2e/Mentions.spec.mjs:31` test: ({isCollab, page}) => initialize({isCollab, page}));
- `../lexical/packages/lexical-playground/__tests__/e2e/Mentions.spec.mjs:33` test: `Can enter the Luke Skywalker mention`, async ({page}) => {
- `../lexical/packages/lexical-playground/__tests__/e2e/Mentions.spec.mjs:103` test: `Can enter and delete part of the Luke Skywalker mention`, async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/Mentions.spec.mjs:197` test: `Can enter and backspace part of the Luke Skywalker mention in the middle`, async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/Mentions.spec.mjs:270` test: `Can enter and delete part of the Luke Skywalker mention in the middle`, async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/Mentions.spec.mjs:343` test: `Can enter and backspace part of the Luke Skywalker mention`, async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/Mentions.spec.mjs:511` test: `Can enter multiple Luke Skywalker mentions and then delete them from start`, async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/Mentions.spec.mjs:835` test: `Can enter a mention then delete it and partially remove text after`, async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/Mentions.spec.mjs:914` test: `Pasting over a mention does not lead to crash`, async ({page}) => {
- `../lexical/packages/lexical-playground/__tests__/e2e/Mentions.spec.mjs:963` test: `Sets correct attributes on typeahead menu container`, async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/Mentions.spec.mjs:967` test: isCollab);

## `../lexical/packages/lexical-playground/__tests__/e2e/Mutations.spec.mjs`

category: portable
family: beforeinput-input / browser-engine
target: indexed 3 test/describe lines; target packages/plite-react/test/model-input-strategy-contract.test.ts; apps/www/tests/plite-browser/donor/stress/generated-editing.test.ts

- `../lexical/packages/lexical-playground/__tests__/e2e/Mutations.spec.mjs:51` test: 'Mutations', () => {
- `../lexical/packages/lexical-playground/__tests__/e2e/Mutations.spec.mjs:52` test: ({isCollab, page}) => initialize({isCollab, page}));
- `../lexical/packages/lexical-playground/__tests__/e2e/Mutations.spec.mjs:53` test: `Text mutation observers also manage the selection`, async ({page}) => {
- `../lexical/packages/lexical-playground/__tests__/e2e/Mutations.spec.mjs:156` test: `Can restore the DOM to the editor state state`, async ({page}) => {

## `../lexical/packages/lexical-playground/__tests__/e2e/Navigation.spec.mjs`

category: portable
family: selection-dom-mapping / void-atom
target: indexed 12 test/describe lines; target packages/plite/test; packages/plite-react/test/editable-behavior.test.tsx; apps/www/tests/plite-browser/donor/stress/generated-editing.test.ts

- `../lexical/packages/lexical-playground/__tests__/e2e/Navigation.spec.mjs:44` test: 'Keyboard Navigation', () => {
- `../lexical/packages/lexical-playground/__tests__/e2e/Navigation.spec.mjs:45` test: ({isCollab, page}) => initialize({isCollab, page}));
- `../lexical/packages/lexical-playground/__tests__/e2e/Navigation.spec.mjs:47` test: 'can type several paragraphs', async ({isRichText, page}) => {
- `../lexical/packages/lexical-playground/__tests__/e2e/Navigation.spec.mjs:66` test: 'can move to the beginning of the current line, then back to the end of the current line', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/Navigation.spec.mjs:105` test: 'can move to the top of the editor', async ({page}) => {
- `../lexical/packages/lexical-playground/__tests__/e2e/Navigation.spec.mjs:116` test: 'can move one word to the right', async ({page, browserName}) => {
- `../lexical/packages/lexical-playground/__tests__/e2e/Navigation.spec.mjs:153` test: 'can move to the beginning of the previous word', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/Navigation.spec.mjs:198` test: 'can move to the bottom of the editor', async ({isRichText, page}) => {
- `../lexical/packages/lexical-playground/__tests__/e2e/Navigation.spec.mjs:219` test: 'can move to the beginning of the current paragraph', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/Navigation.spec.mjs:242` test: 'can move to the top of the editor, then to the bottom of the current paragraph', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/Navigation.spec.mjs:260` test: 'can navigate through the plain text word by word', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/Navigation.spec.mjs:474` test: 'can navigate through the formatted text word by word', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/Navigation.spec.mjs:762` test: 'can navigate through the text with emoji word by word', async ({

## `../lexical/packages/lexical-playground/__tests__/e2e/Placeholder.spec.mjs`

category: portable
family: portable editor behavior
target: indexed 2 test/describe lines; target packages/plite/test; add focused browser proof only when behavior depends on DOM/runtime transport

- `../lexical/packages/lexical-playground/__tests__/e2e/Placeholder.spec.mjs:20` test: 'Placeholder', () => {
- `../lexical/packages/lexical-playground/__tests__/e2e/Placeholder.spec.mjs:21` test: ({isCollab, page}) => initialize({isCollab, page}));
- `../lexical/packages/lexical-playground/__tests__/e2e/Placeholder.spec.mjs:22` test: `Displays a placeholder when no content is present`, async ({

## `../lexical/packages/lexical-playground/__tests__/e2e/PullQuoteSlot.spec.mjs`

category: portable-mixed
family: selection-dom-mapping / nested-root
target: indexed; target current Plite package proof and browser proof when DOM-dependent

- `../lexical/packages/lexical-playground/__tests__/e2e/PullQuoteSlot.spec.mjs:90` test: 'PullQuote slot host', () => {
- `../lexical/packages/lexical-playground/__tests__/e2e/PullQuoteSlot.spec.mjs:91` test: async ({isCollab, isPlainText, page}) => {
- `../lexical/packages/lexical-playground/__tests__/e2e/PullQuoteSlot.spec.mjs:92` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/PullQuoteSlot.spec.mjs:96` test: 'inserts a PullQuote with two seeded editable slots', async ({page}) => {
- `../lexical/packages/lexical-playground/__tests__/e2e/PullQuoteSlot.spec.mjs:105` test: 'typing inside the quote slot replaces only its text', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/PullQuoteSlot.spec.mjs:122` test: 'typing inside the attribution slot replaces only its text', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/PullQuoteSlot.spec.mjs:145` test: 'backspace at 2nd-paragraph start merges within the quote slot', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/PullQuoteSlot.spec.mjs:178` test: 'Enter inside the attribution slot is a no-op (single-line slot)', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/PullQuoteSlot.spec.mjs:200` test: 'chrome click sets data-selected on the host', async ({page}) => {
- `../lexical/packages/lexical-playground/__tests__/e2e/PullQuoteSlot.spec.mjs:215` test: 'slot wrapper click stays in the slot', async ({page}) => {
- `../lexical/packages/lexical-playground/__tests__/e2e/PullQuoteSlot.spec.mjs:227` test: 'Enter on the selected PullQuote drops the caret into the quote', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/PullQuoteSlot.spec.mjs:244` test: 'Escape from the quote selects the whole PullQuote', async ({page}) => {
- `../lexical/packages/lexical-playground/__tests__/e2e/PullQuoteSlot.spec.mjs:256` test: 'Escape from the attribution selects the whole PullQuote', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/PullQuoteSlot.spec.mjs:273` test: 'backspace from the quote of an empty pullquote deletes it', async ({

## `../lexical/packages/lexical-playground/__tests__/e2e/ReviewSlot.spec.mjs`

category: portable-mixed
family: selection-dom-mapping / nested-root
target: indexed; target current Plite package proof and browser proof when DOM-dependent

- `../lexical/packages/lexical-playground/__tests__/e2e/ReviewSlot.spec.mjs:118` test: 'Review React-chromed ElementNode', () => {
- `../lexical/packages/lexical-playground/__tests__/e2e/ReviewSlot.spec.mjs:119` test: ({isCollab, isPlainText, page}) => {
- `../lexical/packages/lexical-playground/__tests__/e2e/ReviewSlot.spec.mjs:120` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/ReviewSlot.spec.mjs:124` test: 'inserts a Review with React chrome, editable regions, and a rating widget', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/ReviewSlot.spec.mjs:160` test: 'clicking a star sets the rating, and clicking it again clears it', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/ReviewSlot.spec.mjs:181` test: 'hovering a star previews the rating without committing it', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/ReviewSlot.spec.mjs:205` test: 'the rating persists across a body edit', async ({page}) => {
- `../lexical/packages/lexical-playground/__tests__/e2e/ReviewSlot.spec.mjs:225` test: 'typing inside the author slot replaces only its text', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/ReviewSlot.spec.mjs:242` test: 'typing inside the body children replaces only its text', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/ReviewSlot.spec.mjs:265` test: 'document text outside the Review stays editable around it', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/ReviewSlot.spec.mjs:293` test: 'exports to HTML and re-imports through the DOMImportExtension rule', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/ReviewSlot.spec.mjs:298` test: isCollab);
- `../lexical/packages/lexical-playground/__tests__/e2e/ReviewSlot.spec.mjs:341` test: 'backspace from the body of an empty review deletes it', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/ReviewSlot.spec.mjs:357` test: 'backspace deletes a textless review even with a rating set', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/ReviewSlot.spec.mjs:379` test: 'select-all + Backspace replaces a first-block review with a paragraph', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/ReviewSlot.spec.mjs:409` test: 'select-all in the author slot keeps the review', async ({page}) => {
- `../lexical/packages/lexical-playground/__tests__/e2e/ReviewSlot.spec.mjs:428` test: 'select-all + forward Delete replaces a first-block review', async ({

## `../lexical/packages/lexical-playground/__tests__/e2e/Ruby.spec.mjs`

category: portable-mixed
family: portable editor behavior
target: indexed; target current Plite package proof and browser proof when DOM-dependent

- `../lexical/packages/lexical-playground/__tests__/e2e/Ruby.spec.mjs:139` test: 'Ruby', () => {
- `../lexical/packages/lexical-playground/__tests__/e2e/Ruby.spec.mjs:140` test: ({isCollab, page}) => initialize({isCollab, page}));
- `../lexical/packages/lexical-playground/__tests__/e2e/Ruby.spec.mjs:142` test: 'Can insert a ruby annotation via toolbar', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/Ruby.spec.mjs:147` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/Ruby.spec.mjs:148` test: isCollab);
- `../lexical/packages/lexical-playground/__tests__/e2e/Ruby.spec.mjs:175` test: 'Ruby DOM has wrapper span with inner annotated span', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/Ruby.spec.mjs:180` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/Ruby.spec.mjs:181` test: isCollab);
- `../lexical/packages/lexical-playground/__tests__/e2e/Ruby.spec.mjs:211` test: 'Arrow left skips over ruby node', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/Ruby.spec.mjs:216` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/Ruby.spec.mjs:217` test: isCollab);
- `../lexical/packages/lexical-playground/__tests__/e2e/Ruby.spec.mjs:238` test: 'Arrow right skips over ruby node', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/Ruby.spec.mjs:243` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/Ruby.spec.mjs:244` test: isCollab);
- `../lexical/packages/lexical-playground/__tests__/e2e/Ruby.spec.mjs:265` test: 'Backspace at ruby boundary deletes ruby as atomic unit', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/Ruby.spec.mjs:270` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/Ruby.spec.mjs:271` test: isCollab);
- `../lexical/packages/lexical-playground/__tests__/e2e/Ruby.spec.mjs:297` test: 'Delete key at ruby boundary deletes ruby as atomic unit', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/Ruby.spec.mjs:302` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/Ruby.spec.mjs:303` test: isCollab);
- `../lexical/packages/lexical-playground/__tests__/e2e/Ruby.spec.mjs:329` test: 'Select-all and typing replaces ruby', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/Ruby.spec.mjs:334` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/Ruby.spec.mjs:335` test: isCollab);
- `../lexical/packages/lexical-playground/__tests__/e2e/Ruby.spec.mjs:361` test: 'Toggle ruby off removes annotation and restores plain text', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/Ruby.spec.mjs:366` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/Ruby.spec.mjs:367` test: isCollab);
- `../lexical/packages/lexical-playground/__tests__/e2e/Ruby.spec.mjs:394` test: 'Copy and paste preserves ruby annotation', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/Ruby.spec.mjs:399` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/Ruby.spec.mjs:400` test: isCollab);
- `../lexical/packages/lexical-playground/__tests__/e2e/Ruby.spec.mjs:427` test: 'Ruby node serializes correctly to JSON', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/Ruby.spec.mjs:432` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/Ruby.spec.mjs:433` test: isCollab);
- `../lexical/packages/lexical-playground/__tests__/e2e/Ruby.spec.mjs:463` test: 'Multiple adjacent ruby nodes are independent', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/Ruby.spec.mjs:468` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/Ruby.spec.mjs:469` test: isCollab);
- `../lexical/packages/lexical-playground/__tests__/e2e/Ruby.spec.mjs:501` test: 'Ruby exportDOM produces semantic <ruby> with <rt>', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/Ruby.spec.mjs:506` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/Ruby.spec.mjs:507` test: isCollab);
- `../lexical/packages/lexical-playground/__tests__/e2e/Ruby.spec.mjs:533` test: 'Ruby node with collapsed selection is a no-op', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/Ruby.spec.mjs:538` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/Ruby.spec.mjs:539` test: isCollab);
- `../lexical/packages/lexical-playground/__tests__/e2e/Ruby.spec.mjs:564` test: 'Ruby — Shift+arrow selection', () => {
- `../lexical/packages/lexical-playground/__tests__/e2e/Ruby.spec.mjs:565` test: ({isCollab, page}) => initialize({isCollab, page}));
- `../lexical/packages/lexical-playground/__tests__/e2e/Ruby.spec.mjs:567` test: 'Shift+Right extends selection past ruby to next text', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/Ruby.spec.mjs:572` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/Ruby.spec.mjs:573` test: isCollab);
- `../lexical/packages/lexical-playground/__tests__/e2e/Ruby.spec.mjs:601` test: 'Shift+Left extends selection past ruby to previous text', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/Ruby.spec.mjs:606` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/Ruby.spec.mjs:607` test: isCollab);
- `../lexical/packages/lexical-playground/__tests__/e2e/Ruby.spec.mjs:632` test: 'repeated Shift+Right across a ruby keeps extending the selection', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/Ruby.spec.mjs:637` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/Ruby.spec.mjs:638` test: isCollab);
- `../lexical/packages/lexical-playground/__tests__/e2e/Ruby.spec.mjs:677` test: 'Shift+Right skips consecutive ruby group', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/Ruby.spec.mjs:682` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/Ruby.spec.mjs:683` test: isCollab);
- `../lexical/packages/lexical-playground/__tests__/e2e/Ruby.spec.mjs:729` test: 'Shift+Left skips consecutive ruby group', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/Ruby.spec.mjs:734` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/Ruby.spec.mjs:735` test: isCollab);
- `../lexical/packages/lexical-playground/__tests__/e2e/Ruby.spec.mjs:781` test: 'Ruby — line boundary navigation', () => {
- `../lexical/packages/lexical-playground/__tests__/e2e/Ruby.spec.mjs:782` test: ({isCollab, page}) => initialize({isCollab, page}));
- `../lexical/packages/lexical-playground/__tests__/e2e/Ruby.spec.mjs:784` test: 'Arrow left at line start when ruby is first child does not get stuck', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/Ruby.spec.mjs:789` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/Ruby.spec.mjs:790` test: isCollab);
- `../lexical/packages/lexical-playground/__tests__/e2e/Ruby.spec.mjs:829` test: 'Arrow right at line end when ruby is last child does not get stuck', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/Ruby.spec.mjs:834` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/Ruby.spec.mjs:835` test: isCollab);
- `../lexical/packages/lexical-playground/__tests__/e2e/Ruby.spec.mjs:858` test: 'Shift+Left at line start when ruby is first child extends to boundary', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/Ruby.spec.mjs:863` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/Ruby.spec.mjs:864` test: isCollab);
- `../lexical/packages/lexical-playground/__tests__/e2e/Ruby.spec.mjs:902` test: 'Shift+Right at line end when ruby is last child extends to boundary', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/Ruby.spec.mjs:907` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/Ruby.spec.mjs:908` test: isCollab);
- `../lexical/packages/lexical-playground/__tests__/e2e/Ruby.spec.mjs:930` test: 'Arrow keys do not get stuck when ruby is the only child', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/Ruby.spec.mjs:935` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/Ruby.spec.mjs:936` test: isCollab);
- `../lexical/packages/lexical-playground/__tests__/e2e/Ruby.spec.mjs:975` test: 'Ruby — floating editor in shadow DOM', () => {
- `../lexical/packages/lexical-playground/__tests__/e2e/Ruby.spec.mjs:976` test: ({isCollab, isPlainText, page}) => {
- `../lexical/packages/lexical-playground/__tests__/e2e/Ruby.spec.mjs:979` test: isPlainText \|\| isCollab);
- `../lexical/packages/lexical-playground/__tests__/e2e/Ruby.spec.mjs:983` test: 'focusout without relatedTarget keeps the popup open while its input has focus', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/Ruby.spec.mjs:1020` test: 'popup opens on ruby click and closes when focus moves back into the editor', async ({

## `../lexical/packages/lexical-playground/__tests__/e2e/SelectBlock.spec.mjs`

category: portable
family: portable editor behavior
target: indexed; target current Plite package proof and browser proof when DOM-dependent

- `../lexical/packages/lexical-playground/__tests__/e2e/SelectBlock.spec.mjs:45` test: 'SelectBlock', () => {
- `../lexical/packages/lexical-playground/__tests__/e2e/SelectBlock.spec.mjs:46` test: ({isCollab, page}) =>
- `../lexical/packages/lexical-playground/__tests__/e2e/SelectBlock.spec.mjs:50` test: 'Select paragraph with simple text only', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/SelectBlock.spec.mjs:54` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/SelectBlock.spec.mjs:77` test: 'Select paragraph with formatted text', async ({page, isPlainText}) => {
- `../lexical/packages/lexical-playground/__tests__/e2e/SelectBlock.spec.mjs:78` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/SelectBlock.spec.mjs:103` test: 'Select paragraph with inline element', async ({page, isPlainText}) => {
- `../lexical/packages/lexical-playground/__tests__/e2e/SelectBlock.spec.mjs:104` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/SelectBlock.spec.mjs:129` test: 'Select paragraph with [inline decorator, text]', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/SelectBlock.spec.mjs:133` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/SelectBlock.spec.mjs:157` test: 'Select paragraph with [text, inline decorator]', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/SelectBlock.spec.mjs:161` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/SelectBlock.spec.mjs:185` test: 'Select paragraph with [text, inline decorator, text]', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/SelectBlock.spec.mjs:189` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/SelectBlock.spec.mjs:214` test: 'Select paragraph with [element, inline decorator]', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/SelectBlock.spec.mjs:218` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/SelectBlock.spec.mjs:245` test: 'Select paragraph with [inline decorator, element]', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/SelectBlock.spec.mjs:249` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/SelectBlock.spec.mjs:275` test: 'Select empty paragraph should trigger selectAll', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/SelectBlock.spec.mjs:279` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/SelectBlock.spec.mjs:299` test: 'Repeated selectAll should not change the current selection', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/SelectBlock.spec.mjs:303` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/SelectBlock.spec.mjs:332` test: 'The block is selected if part of the text is already selected', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/SelectBlock.spec.mjs:336` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/SelectBlock.spec.mjs:367` test: 'Selection spanning multiple blocks selects all content', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/SelectBlock.spec.mjs:371` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/SelectBlock.spec.mjs:391` test: 'Select paragraph with focus on decorator', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/SelectBlock.spec.mjs:396` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/SelectBlock.spec.mjs:497` test: 'Select with node selection on multiple decorators within one parent', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/SelectBlock.spec.mjs:503` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/SelectBlock.spec.mjs:641` test: 'Select with node selection on multiple decorators from different parent elements', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/SelectBlock.spec.mjs:647` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/SelectBlock.spec.mjs:776` test: 'Select within shadow root', async ({page, isPlainText}) => {
- `../lexical/packages/lexical-playground/__tests__/e2e/SelectBlock.spec.mjs:777` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/SelectBlock.spec.mjs:809` test: 'Select within nested editor', async ({page, isPlainText}) => {
- `../lexical/packages/lexical-playground/__tests__/e2e/SelectBlock.spec.mjs:810` test: isPlainText);

## `../lexical/packages/lexical-playground/__tests__/e2e/Selection.spec.mjs`

category: portable
family: selection-dom-mapping / void-atom
target: indexed 93 test/describe lines; target packages/plite/test; packages/plite-react/test/editable-behavior.test.tsx; apps/www/tests/plite-browser/donor/stress/generated-editing.test.ts

- `../lexical/packages/lexical-playground/__tests__/e2e/Selection.spec.mjs:60` test: 'Selection', () => {
- `../lexical/packages/lexical-playground/__tests__/e2e/Selection.spec.mjs:61` test: ({isCollab, page}) =>
- `../lexical/packages/lexical-playground/__tests__/e2e/Selection.spec.mjs:64` test: 'does not focus the editor on load', async ({page}) => {
- `../lexical/packages/lexical-playground/__tests__/e2e/Selection.spec.mjs:85` test: 'keeps single active selection for nested editors', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/Selection.spec.mjs:91` test: isPlainText \|\| IS_COLLAB_V2);
- `../lexical/packages/lexical-playground/__tests__/e2e/Selection.spec.mjs:140` test: 'can wrap post-linebreak nodes into new element', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/Selection.spec.mjs:144` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/Selection.spec.mjs:170` test: 'can delete text by line backwards with CMD+delete', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/Selection.spec.mjs:174` test: isPlainText \|\| !IS_MAC);
- `../lexical/packages/lexical-playground/__tests__/e2e/Selection.spec.mjs:211` test: 'can delete text by line forwards with opt+CMD+delete', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/Selection.spec.mjs:215` test: isPlainText \|\| !IS_MAC);
- `../lexical/packages/lexical-playground/__tests__/e2e/Selection.spec.mjs:261` test: 'can delete text by line forwards with control+K', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/Selection.spec.mjs:271` test: isPlainText \|\| !IS_MAC);
- `../lexical/packages/lexical-playground/__tests__/e2e/Selection.spec.mjs:317` test: 'can delete line which ends with element backwards with CMD+delete', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/Selection.spec.mjs:321` test: isPlainText \|\| !IS_MAC);
- `../lexical/packages/lexical-playground/__tests__/e2e/Selection.spec.mjs:358` test: 'can delete line which starts with element forwards with opt+CMD+delete', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/Selection.spec.mjs:362` test: isPlainText \|\| !IS_MAC);
- `../lexical/packages/lexical-playground/__tests__/e2e/Selection.spec.mjs:538` test: 'can delete line by collapse', async ({page, isPlainText}) => {
- `../lexical/packages/lexical-playground/__tests__/e2e/Selection.spec.mjs:539` test: isPlainText \|\| !IS_MAC);
- `../lexical/packages/lexical-playground/__tests__/e2e/Selection.spec.mjs:563` test: 'Can insert inline element within text and put selection after it', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/Selection.spec.mjs:567` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/Selection.spec.mjs:586` test: 'Can delete at boundary #4221', async ({page, isPlainText}) => {
- `../lexical/packages/lexical-playground/__tests__/e2e/Selection.spec.mjs:587` test: !isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/Selection.spec.mjs:624` test: 'Can select all with node selection', async ({page, isPlainText}) => {
- `../lexical/packages/lexical-playground/__tests__/e2e/Selection.spec.mjs:625` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/Selection.spec.mjs:642` test: `Can't delete forward a Collapsible`, async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/Selection.spec.mjs:647` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/Selection.spec.mjs:688` test: `Can't delete backward a Collapsible`, async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/Selection.spec.mjs:693` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/Selection.spec.mjs:739` test: 'Arrow keys navigate into/out of collapsible content in all browsers (#8348)', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/Selection.spec.mjs:744` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/Selection.spec.mjs:808` test: `Can't delete forward a Table`, async ({page, isPlainText}) => {
- `../lexical/packages/lexical-playground/__tests__/e2e/Selection.spec.mjs:809` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/Selection.spec.mjs:856` test: `Can't delete backward a Table`, async ({page, isPlainText}) => {
- `../lexical/packages/lexical-playground/__tests__/e2e/Selection.spec.mjs:857` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/Selection.spec.mjs:905` test: 'Can delete block elements', async ({page, isPlainText}) => {
- `../lexical/packages/lexical-playground/__tests__/e2e/Selection.spec.mjs:906` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/Selection.spec.mjs:961` test: 'Can delete sibling elements forward', async ({page, isPlainText}) => {
- `../lexical/packages/lexical-playground/__tests__/e2e/Selection.spec.mjs:962` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/Selection.spec.mjs:979` test: 'Can adjust triple click selection paragraph', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/Selection.spec.mjs:984` test: isPlainText \|\| isCollab);
- `../lexical/packages/lexical-playground/__tests__/e2e/Selection.spec.mjs:1032` test: 'Can adjust triple click selection linebreak', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/Selection.spec.mjs:1036` test: isCollab);
- `../lexical/packages/lexical-playground/__tests__/e2e/Selection.spec.mjs:1098` test: 'Can adjust triple click selection with', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/Selection.spec.mjs:1103` test: isPlainText \|\| isCollab);
- `../lexical/packages/lexical-playground/__tests__/e2e/Selection.spec.mjs:1140` test: 'Select all from Node selection #4658', async ({page, isPlainText}) => {
- `../lexical/packages/lexical-playground/__tests__/e2e/Selection.spec.mjs:1142` test: isPlainText \|\| IS_LINUX);
- `../lexical/packages/lexical-playground/__tests__/e2e/Selection.spec.mjs:1161` test: 'Select all (DecoratorNode at start) #4670', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/Selection.spec.mjs:1166` test: isPlainText \|\| IS_LINUX);
- `../lexical/packages/lexical-playground/__tests__/e2e/Selection.spec.mjs:1187` test: 'Can use block controls on selections including decorator nodes #5371', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/Selection.spec.mjs:1192` test: isPlainText \|\| isCollab);
- `../lexical/packages/lexical-playground/__tests__/e2e/Selection.spec.mjs:1219` test: 'Select previous with RTL (DecoratorNode) #7685', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/Selection.spec.mjs:1224` test: isPlainText \|\| isCollab);
- `../lexical/packages/lexical-playground/__tests__/e2e/Selection.spec.mjs:1246` test: 'Select next with RTL (DecoratorNode) #7685', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/Selection.spec.mjs:1251` test: isPlainText \|\| isCollab);
- `../lexical/packages/lexical-playground/__tests__/e2e/Selection.spec.mjs:1274` test: 'Move left from DecoratorNode in RTL #7771', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/Selection.spec.mjs:1279` test: isPlainText \|\| isCollab);
- `../lexical/packages/lexical-playground/__tests__/e2e/Selection.spec.mjs:1307` test: 'Move right from DecoratorNode in RTL #7771', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/Selection.spec.mjs:1312` test: isPlainText \|\| isCollab);
- `../lexical/packages/lexical-playground/__tests__/e2e/Selection.spec.mjs:1339` test: 'Move right from last node in RTL #7775', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/Selection.spec.mjs:1344` test: isPlainText \|\| isCollab);
- `../lexical/packages/lexical-playground/__tests__/e2e/Selection.spec.mjs:1356` test: 'Move left from last node in RTL #7775', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/Selection.spec.mjs:1361` test: isPlainText \|\| isCollab);
- `../lexical/packages/lexical-playground/__tests__/e2e/Selection.spec.mjs:1379` test: 'Can delete table node present at the end #5543', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/Selection.spec.mjs:1385` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/Selection.spec.mjs:1404` test: 'Triple-clicking last cell in table should not select entire document', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/Selection.spec.mjs:1410` test: isPlainText \|\| isCollab);
- `../lexical/packages/lexical-playground/__tests__/e2e/Selection.spec.mjs:1459` test: 'Selecting table cell then dragging to outside of table should select entire table', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/Selection.spec.mjs:1465` test: isPlainText \|\| isCollab);
- `../lexical/packages/lexical-playground/__tests__/e2e/Selection.spec.mjs:1506` test: 'Can persist the text format from the paragraph', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/Selection.spec.mjs:1510` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/Selection.spec.mjs:1551` test: 'toggle format at the start of paragraph to a different format persists the format', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/Selection.spec.mjs:1555` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/Selection.spec.mjs:1594` test: 'formatting is persisted after deleting all nodes from the paragraph node', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/Selection.spec.mjs:1598` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/Selection.spec.mjs:1625` test: 'Can persist the text style (color) from the paragraph', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/Selection.spec.mjs:1629` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/Selection.spec.mjs:1666` test: 'shift+arrowdown into a table selects the whole table', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/Selection.spec.mjs:1672` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/Selection.spec.mjs:1673` test: browserName === 'firefox' \|\| IS_LINUX);
- `../lexical/packages/lexical-playground/__tests__/e2e/Selection.spec.mjs:1688` test: 'shift+arrowup into a table selects the whole table', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/Selection.spec.mjs:1694` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/Selection.spec.mjs:1695` test: browserName === 'firefox' \|\| IS_LINUX);
- `../lexical/packages/lexical-playground/__tests__/e2e/Selection.spec.mjs:1710` test: 'shift+arrowdown into a table, when the table is the last node, selects the whole table', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/Selection.spec.mjs:1716` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/Selection.spec.mjs:1733` test: 'shift+arrowup into a table, when the table is the first node, selects the whole table', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/Selection.spec.mjs:1739` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/Selection.spec.mjs:1756` test: 'shift+arrowdown into a table, when the table is the only node, selects the whole table', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/Selection.spec.mjs:1762` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/Selection.spec.mjs:1786` test: 'shift+arrowup into a table, when the table is the only node, selects the whole table', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/Selection.spec.mjs:1792` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/Selection.spec.mjs:1817` test: 'shift+arrowdown into a table does not select element after', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/Selection.spec.mjs:1823` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/Selection.spec.mjs:1842` test: 'shift+arrowup into a table does not select element before', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/Selection.spec.mjs:1848` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/Selection.spec.mjs:1866` test: 'programatic update on blurred editor does not kill selection', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/Selection.spec.mjs:1871` test: isPlainText \|\| isCollab);

## `../lexical/packages/lexical-playground/__tests__/e2e/SelectionAlwaysOnDisplay.spec.mjs`

category: portable-mixed
family: selection-dom-mapping / void-atom
target: indexed 5 test/describe lines; target packages/plite/test; packages/plite-react/test/editable-behavior.test.tsx; apps/www/tests/plite-browser/donor/stress/generated-editing.test.ts

- `../lexical/packages/lexical-playground/__tests__/e2e/SelectionAlwaysOnDisplay.spec.mjs:20` test: 'SelectionAlwaysOnDisplay', () => {
- `../lexical/packages/lexical-playground/__tests__/e2e/SelectionAlwaysOnDisplay.spec.mjs:21` test: ({isCollab, page}) =>
- `../lexical/packages/lexical-playground/__tests__/e2e/SelectionAlwaysOnDisplay.spec.mjs:24` test: `retain selection works`, async ({page, isPlainText, browserName}) => {
- `../lexical/packages/lexical-playground/__tests__/e2e/SelectionAlwaysOnDisplay.spec.mjs:25` test: isPlainText); // Fixed in #6873
- `../lexical/packages/lexical-playground/__tests__/e2e/SelectionAlwaysOnDisplay.spec.mjs:62` test: `retain selection works with reverse selection`, async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/SelectionAlwaysOnDisplay.spec.mjs:67` test: isPlainText); // Fixed in #6873

## `../lexical/packages/lexical-playground/__tests__/e2e/ShadowDOM.spec.mjs`

category: portable-mixed
family: portable editor behavior
target: indexed; target current Plite package proof and browser proof when DOM-dependent

- `../lexical/packages/lexical-playground/__tests__/e2e/ShadowDOM.spec.mjs:30` test: 'Shadow DOM', () => {
- `../lexical/packages/lexical-playground/__tests__/e2e/ShadowDOM.spec.mjs:31` test: ({isCollab, isPlainText, page}) => {
- `../lexical/packages/lexical-playground/__tests__/e2e/ShadowDOM.spec.mjs:34` test: isPlainText \|\| isCollab);
- `../lexical/packages/lexical-playground/__tests__/e2e/ShadowDOM.spec.mjs:38` test: 'renders the editor inside an open shadow root', async ({page}) => {
- `../lexical/packages/lexical-playground/__tests__/e2e/ShadowDOM.spec.mjs:44` it: it pierces open shadow roots).
- `../lexical/packages/lexical-playground/__tests__/e2e/ShadowDOM.spec.mjs:54` test: 'types and reconciles text inside the shadow root', async ({page}) => {
- `../lexical/packages/lexical-playground/__tests__/e2e/ShadowDOM.spec.mjs:67` test: 'selects a word with Selection.modify and formats it', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/ShadowDOM.spec.mjs:89` test: 'select all and delete clears the editor', async ({page}) => {
- `../lexical/packages/lexical-playground/__tests__/e2e/ShadowDOM.spec.mjs:104` test: 'deletes by word inside the shadow root', async ({page}) => {
- `../lexical/packages/lexical-playground/__tests__/e2e/ShadowDOM.spec.mjs:120` test: 'clicking a table cell creates a range selection inside the cell', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/ShadowDOM.spec.mjs:126` test: browserName === 'webkit');
- `../lexical/packages/lexical-playground/__tests__/e2e/ShadowDOM.spec.mjs:159` test: 'component picker opens, navigates and inserts a heading', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/ShadowDOM.spec.mjs:186` test: 'inserts a sample image through the shadow toolbar', async ({page}) => {
- `../lexical/packages/lexical-playground/__tests__/e2e/ShadowDOM.spec.mjs:196` test: 'pastes a file image into the shadow editor', async ({page}) => {
- `../lexical/packages/lexical-playground/__tests__/e2e/ShadowDOM.spec.mjs:233` test: 'clicking an image inside the shadow root selects the ImageNode', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/ShadowDOM.spec.mjs:247` test: 'blur and re-focus on the shadow-internal editor exercise the focus path', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/ShadowDOM.spec.mjs:274` test: 'survives a Korean IME composition cycle inside the shadow root', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/ShadowDOM.spec.mjs:307` test: 'survives a Chinese pinyin IME composition cycle inside the shadow root', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/ShadowDOM.spec.mjs:338` test: 'copy and paste round-trips text inside the shadow root', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/ShadowDOM.spec.mjs:391` test: 'markdown shortcuts and a list run inside the shadow root', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/ShadowDOM.spec.mjs:417` test: 'undo / redo round-trip from the lexical-history plugin works inside the shadow root', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/ShadowDOM.spec.mjs:443` test: 'the playground tree-view mirrors the shadow-mounted editor state', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/ShadowDOM.spec.mjs:458` test: 'file drop into the shadow editor inserts an ImageNode', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/ShadowDOM.spec.mjs:495` test: 'typing 1000 characters inside the shadow root completes without hanging', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/ShadowDOM.spec.mjs:517` test: 'populates shadowRoot.adoptedStyleSheets with document stylesheets', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/ShadowDOM.spec.mjs:543` test: rule.cssText),
- `../lexical/packages/lexical-playground/__tests__/e2e/ShadowDOM.spec.mjs:567` test: 'characterData update on a <style> refreshes adoptedStyleSheets', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/ShadowDOM.spec.mjs:626` test: 'Shadow DOM (collab)', () => {
- `../lexical/packages/lexical-playground/__tests__/e2e/ShadowDOM.spec.mjs:627` test: ({isCollab, isPlainText, page}) => {
- `../lexical/packages/lexical-playground/__tests__/e2e/ShadowDOM.spec.mjs:632` test: isPlainText \|\| !isCollab);
- `../lexical/packages/lexical-playground/__tests__/e2e/ShadowDOM.spec.mjs:636` test: 'text typed on one client converges on the other inside shadow roots', async ({

## `../lexical/packages/lexical-playground/__tests__/e2e/SlotCollabConvergence.spec.mjs`

category: portable-mixed
family: selection-dom-mapping / nested-root
target: indexed; target current Plite package proof and browser proof when DOM-dependent

- `../lexical/packages/lexical-playground/__tests__/e2e/SlotCollabConvergence.spec.mjs:105` test: 'Named slot collaborative convergence', () => {
- `../lexical/packages/lexical-playground/__tests__/e2e/SlotCollabConvergence.spec.mjs:106` test: async ({isCollab, isPlainText, page}) => {
- `../lexical/packages/lexical-playground/__tests__/e2e/SlotCollabConvergence.spec.mjs:108` test: !isCollab);
- `../lexical/packages/lexical-playground/__tests__/e2e/SlotCollabConvergence.spec.mjs:109` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/SlotCollabConvergence.spec.mjs:113` test: 'an ElementNode slot host and its slot text converge to the other client', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/SlotCollabConvergence.spec.mjs:126` test: 'editing slot text on one client converges to the other', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/SlotCollabConvergence.spec.mjs:145` test: 'a DecoratorNode slot host converges with both editable slots intact', async ({

## `../lexical/packages/lexical-playground/__tests__/e2e/SlotHostArrowEscape.spec.mjs`

category: portable-mixed
family: selection-dom-mapping / nested-root
target: indexed; target current Plite package proof and browser proof when DOM-dependent

- `../lexical/packages/lexical-playground/__tests__/e2e/SlotHostArrowEscape.spec.mjs:166` test: 'Slot host ArrowDown/Up escape', () => {
- `../lexical/packages/lexical-playground/__tests__/e2e/SlotHostArrowEscape.spec.mjs:167` test: ({isCollab, isPlainText, page}) => {
- `../lexical/packages/lexical-playground/__tests__/e2e/SlotHostArrowEscape.spec.mjs:168` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/SlotHostArrowEscape.spec.mjs:175` test: 'Review: ArrowDown at the end of the author (last block) exits below it', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/SlotHostArrowEscape.spec.mjs:204` test: 'Review: ArrowUp at the start of the body (first block) exits above it', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/SlotHostArrowEscape.spec.mjs:223` test: 'Review: ArrowDown from the body steps into the author', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/SlotHostArrowEscape.spec.mjs:252` test: 'Review: ArrowUp from the author steps into the body', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/SlotHostArrowEscape.spec.mjs:273` test: 'Card: ArrowDown at the end of the body (last block) exits below it', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/SlotHostArrowEscape.spec.mjs:291` test: 'Card: ArrowUp at the start of the title (first block) exits above it', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/SlotHostArrowEscape.spec.mjs:309` test: 'PullQuote: ArrowDown at the end of the attribution (last block) exits below it', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/SlotHostArrowEscape.spec.mjs:325` test: 'PullQuote: ArrowUp at the start of the quote (first block) exits above it', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/SlotHostArrowEscape.spec.mjs:342` test: 'PullQuote: ArrowDown from the quote steps into the attribution', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/SlotHostArrowEscape.spec.mjs:362` test: 'PullQuote: ArrowUp from the attribution steps into the quote', async ({

## `../lexical/packages/lexical-playground/__tests__/e2e/SpecialTexts.spec.mjs`

category: portable-mixed
family: mixed portable invariant
target: indexed 4 test/describe lines; target packages/plite/test; add focused browser proof only when behavior depends on DOM/runtime transport

- `../lexical/packages/lexical-playground/__tests__/e2e/SpecialTexts.spec.mjs:18` test: 'Special Text', () => {
- `../lexical/packages/lexical-playground/__tests__/e2e/SpecialTexts.spec.mjs:19` test: {shouldAllowHighlightingWithBrackets: true});
- `../lexical/packages/lexical-playground/__tests__/e2e/SpecialTexts.spec.mjs:20` test: ({isCollab, page, shouldAllowHighlightingWithBrackets}) =>
- `../lexical/packages/lexical-playground/__tests__/e2e/SpecialTexts.spec.mjs:27` test: 'should handle a single special text', async ({page, isCollab}) => {
- `../lexical/packages/lexical-playground/__tests__/e2e/SpecialTexts.spec.mjs:45` test: 'should handle multiple special texts', async ({page, isCollab}) => {
- `../lexical/packages/lexical-playground/__tests__/e2e/SpecialTexts.spec.mjs:69` test: 'should not work when the option to use brackets for highlighting is disabled', async ({

## `../lexical/packages/lexical-playground/__tests__/e2e/Tab.spec.mjs`

category: portable
family: portable editor behavior
target: indexed 7 test/describe lines; target packages/plite/test; add focused browser proof only when behavior depends on DOM/runtime transport

- `../lexical/packages/lexical-playground/__tests__/e2e/Tab.spec.mjs:21` test: 'Tab', () => {
- `../lexical/packages/lexical-playground/__tests__/e2e/Tab.spec.mjs:22` test: ({isCollab, page}) => initialize({isCollab, page}));
- `../lexical/packages/lexical-playground/__tests__/e2e/Tab.spec.mjs:23` test: `can tab + IME`, async ({page, isPlainText, browserName}) => {
- `../lexical/packages/lexical-playground/__tests__/e2e/Tab.spec.mjs:25` test: <multiline or generated title>
- `../lexical/packages/lexical-playground/__tests__/e2e/Tab.spec.mjs:92` test: 'can tab inside code block #4399', async ({page, isPlainText}) => {
- `../lexical/packages/lexical-playground/__tests__/e2e/Tab.spec.mjs:93` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/Tab.spec.mjs:116` test: 'can go to start of line after a tab character', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/Tab.spec.mjs:120` test: isPlainText);

## `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs`

category: portable
family: tables-grid / selection-dom-mapping
target: indexed 193 test/describe lines; target apps/www/tests/plite-browser/donor/stress/generated-editing.test.ts; apps/www/tests/plite-browser/donor/examples/tables.test.ts; packages/plite/test/transforms/insertFragment

- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:94` test: 'Tables', () => {
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:95` test: `Can a table be inserted from the toolbar`, async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:100` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:139` test: `Selection placed on a <col> element resolves into the first cell`, async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:144` test: isPlainText \|\| isCollab);
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:192` test: `TableSelection converts to RangeSelection when DOM selection extends onto the editor root (Issue #8584 follow-up)`, async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:197` test: isPlainText \|\| isCollab);
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:259` test: `Can type inside of table cell`, async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:264` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:305` test: `Can exit table with the horizontal arrow keys`, () => {
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:306` test: `Can exit the first cell of a table`, async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:311` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:352` test: `Can exit the last cell of a table`, async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:357` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:397` test: `Can exit the first cell of a nested table into the parent table cell`, async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:402` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:425` test: `Can exit the last cell of a nested table into the parent table cell`, async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:430` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:455` test: `Can insert a paragraph after a table, that is the last node, with the "Enter" key`, async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:461` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:562` test: `Can type text after a table that is the last node`, async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:568` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:620` test: `Can't backwards delete from text to a table`, async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:626` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:714` test: `Can enter a table from a paragraph underneath via the left arrow key`, async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:719` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:742` test: `Can navigate table with keyboard`, () => {
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:743` test: `Can navigate cells horizontally`, async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:748` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:842` test: `Can navigate cells vertically`, async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:847` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:877` test: 'Should not navigate cells when typeahead menu is open and focused', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:882` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:916` test: `Can select cells using Table selection`, async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:921` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:976` test: `Can select cells using Table selection via keyboard`, async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:982` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:1060` test: `Can style text using Table selection`, async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:1065` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:1125` test: `Can style on empty table cells and paragraphs with no text`, async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:1130` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:1188` test: `Align selection style for table cells`, async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:1193` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:1260` test: `Can copy + paste (internal) using Table selection`, async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:1265` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:1353` test: `Can clear text using Table selection`, async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:1358` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:1416` test: `Range Selection is corrected when it contains a partial Table.`, async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:1421` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:1457` test: `Select All when document contains tables adds custom table styles.`, async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:1462` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:1512` test: 'Can delete all with node selection', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:1517` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:1538` test: 'Can delete all with range selection anchored in table', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:1543` test: isPlainText \|\| isCollab);
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:1586` test: `Horizontal rule inside cell`, async ({page, isPlainText, isCollab}) => {
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:1587` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:1622` test: 'Table selection: can select multiple cells and insert a decorator', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:1628` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:1696` test: 'Table selection: can backspace lines, backspacing empty cell does not destroy it #3278', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:1701` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:1788` test: 'Can remove new lines in a collapsible section inside of a table', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:1794` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:1927` test: 'Resize merged cells width (1)', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:1933` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:2024` test: 'Resize merged cells width (2)', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:2029` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:2120` test: 'Resize merged cells height', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:2126` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:2228` test: 'Merge/unmerge cells (1)', async ({page, isPlainText, isCollab}) => {
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:2229` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:2334` test: 'Merge/unmerge cells (2)', async ({page, isPlainText, isCollab}) => {
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:2335` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:2506` test: 'Merge/unmerge with already merged cells', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:2511` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:2921` test: 'Merged cell tab navigation forward', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:2926` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:2927` test: isCollab);
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:3093` test: 'Merged cell tab navigation reverse', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:3098` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:3099` test: isCollab);
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:3267` test: 'Merge with content', async ({page, isPlainText, isCollab}) => {
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:3268` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:3371` test: 'Select multiple merged cells (selection expands to a rectangle)', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:3376` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:3551` test: 'Merge multiple merged cells and then unmerge', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:3556` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:3737` test: 'Insert row above (with conflicting merged cell)', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:3742` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:3816` test: 'Insert column before (with conflicting merged cell)', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:3821` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:3891` test: 'Insert column before (with selected cell with rowspan > 1)', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:3896` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:3959` test: 'Insert column before (with 1+ selected cells in a row)', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:3964` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:4056` test: 'Delete rows (with conflicting merged cell)', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:4061` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:4129` test: 'Delete selected rows (with merged cell overflowing selection from top and bottom)', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:4134` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:4402` test: 'Delete selected rows (with merged cell overflowing selection from the top)', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:4407` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:4682` test: 'Delete selected rows (with merged cell overflowing selection from the bottom)', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:4687` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:4962` test: 'Delete columns (with conflicting merged cell)', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:4967` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:5035` test: 'Delete columns backward', async ({page, isPlainText, isCollab}) => {
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:5036` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:5089` test: 'Delete columns forward at end of table', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:5094` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:5147` test: 'Deselect when click outside #3785 #4138', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:5152` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:5171` test: 'Background color to cell', async ({page, isPlainText, isCollab}) => {
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:5172` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:5210` test: 'Cell merge feature disabled', async ({page, isPlainText, isCollab}) => {
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:5211` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:5313` test: 'Cell background color feature disabled', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:5318` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:5355` test: 'Add column header after merging cells #4378', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:5360` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:5486` test: 'Can align text using Table selection', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:5491` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:5568` test: 'Aligns the table itself (not cell text) when the whole table is selected in reverse, e.g. bottom-right to top-left (#8880)', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:5573` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:5606` test: 'Paste and insert new lines after unmerging cells', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:5611` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:5823` test: 'Can delete table row when previous cell is a merged cell', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:5828` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:6151` test: 'Can delete table row when siblings are merged cell', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:6156` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:6463` test: 'Can insert multiple rows above the selection', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:6469` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:6470` test: isCollab);
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:6774` test: 'Can insert multiple rows below the selection', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:6780` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:6781` test: isCollab);
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:7084` test: 'with context menu', () => {
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:7085` test: {shouldUseLexicalContextMenu: true});
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:7086` test: `Can select cells using Table selection and cut them with the context menu`, async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:7093` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:7096` test: browserName === 'firefox');
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:7202` test: `Cannot insert nested tables`, async ({page, isPlainText, isCollab}) => {
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:7203` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:7250` test: `Cannot paste tables inside table cells`, async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:7255` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:7309` test: `Can paste tables inside table cells (with hasNestedTables)`, async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:7314` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:7398` test: `Can paste and autofit tables inside table cells (with hasNestedTables, hasFitNestedTables)`, async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:7403` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:7404` test: IS_TABLE_HORIZONTAL_SCROLL); // hasFitNestedTables disables horizontally scrollable tables
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:7501` test: `Click and drag to create selection in Firefox #7245`, async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:7506` test: isPlainText \|\| isCollab);
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:8101` test: 'Resize row with merged cells spanning multiple rows', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:8107` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:8206` test: `Table action menu is hidden when cell overflows`, async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:8214` test: browserName === 'firefox');
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:8215` test: isPlainText \|\| isCollab);
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:8252` test: `Can expand table to fit content when pasting table into table`, async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:8257` test: isPlainText \|\| isCollab);
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:8553` test: `Can paste table containing merged cells into table`, async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:8558` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:8825` test: `Can paste table into table while having table selection`, async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:8830` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:8952` test: 'Can delete table when fully selected with merged cells', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:8957` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:8958` test: isCollab, 'Flaky on Collab');
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:9002` test: 'Ctrl+A selects all cells in table with merged cells when table is only content', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:9008` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:9062` test: 'Drag-select column in 2x2 table selects all cells in that column', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:9067` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:9243` test: 'Can clear table selection in table by selecting cell in another table', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:9248` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:9302` test: 'Table selection is properly cleared when clicking and dragging a cell in the same table', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:9307` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:9367` test: `Drag-selecting to the edge of a scrollable table auto-scrolls it #7153`, async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:9372` test: isPlainText \|\| isCollab);
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:9374` test: !IS_TABLE_HORIZONTAL_SCROLL);
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:9432` test: 'shift-selection tests', () => {
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:9433` test: 'Range-select from above table into it selects the entire table', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:9438` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:9470` test: 'Range-select from below table into it selects the entire table', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:9475` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:9505` test: 'Range-select from inside table to text above it selects the entire table', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:9510` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:9541` test: 'Range-select from inside table to text below it selects the entire table', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:9546` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:9576` test: 'nested table shift-selection tests', () => {
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:9594` test: 'Range-select from above nested table into it selects the entire table, but not the outer table', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:9600` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:9601` test: isCollab);
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:9602` test: <multiline or generated title>
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:9633` test: 'Range-select from below nested table into it selects the entire table, but not the outer table', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:9639` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:9640` test: isCollab);
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:9663` test: 'Range-select from inside nested table to text above it selects the entire table, but not the outer table', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:9669` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:9670` test: isCollab);
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:9671` test: <multiline or generated title>
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:9701` test: 'Range-select from inside nested table to text below it selects the entire table, but not the outer table', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:9707` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:9708` test: isCollab);
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:9709` test: <multiline or generated title>

## `../lexical/packages/lexical-playground/__tests__/e2e/TextDragDrop.spec.mjs`

category: portable
family: clipboard / drag transport
target: indexed; target current Plite package proof and browser proof when DOM-dependent

- `../lexical/packages/lexical-playground/__tests__/e2e/TextDragDrop.spec.mjs:92` test: 'Text drag and drop', () => {
- `../lexical/packages/lexical-playground/__tests__/e2e/TextDragDrop.spec.mjs:93` test: ({isCollab, page}) => initialize({isCollab, page}));
- `../lexical/packages/lexical-playground/__tests__/e2e/TextDragDrop.spec.mjs:95` test: 'moves a selected word forward within the same block (rich text)', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/TextDragDrop.spec.mjs:99` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/TextDragDrop.spec.mjs:121` test: 'moves a selected word backward within the same block (rich text)', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/TextDragDrop.spec.mjs:125` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/TextDragDrop.spec.mjs:146` test: 'dropping inside the source range is a no-op (rich text)', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/TextDragDrop.spec.mjs:150` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/TextDragDrop.spec.mjs:171` test: 'moves a selected word forward within the same block (plain text)', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/TextDragDrop.spec.mjs:175` test: !isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/TextDragDrop.spec.mjs:195` test: 'native drop of text from a non-Lexical drag source inserts it', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/TextDragDrop.spec.mjs:207` test: browserName !== 'chromium');
- `../lexical/packages/lexical-playground/__tests__/e2e/TextDragDrop.spec.mjs:208` test: !!isCollab);

## `../lexical/packages/lexical-playground/__tests__/e2e/TextEntry.spec.mjs`

category: portable
family: beforeinput-input / browser-engine
target: indexed 17 test/describe lines; target packages/plite-react/test/model-input-strategy-contract.test.ts; apps/www/tests/plite-browser/donor/stress/generated-editing.test.ts

- `../lexical/packages/lexical-playground/__tests__/e2e/TextEntry.spec.mjs:27` test: 'TextEntry', () => {
- `../lexical/packages/lexical-playground/__tests__/e2e/TextEntry.spec.mjs:28` test: ({isCollab, page}) => initialize({isCollab, page}));
- `../lexical/packages/lexical-playground/__tests__/e2e/TextEntry.spec.mjs:29` test: `Can type 'Hello Lexical' in the editor`, async ({page}) => {
- `../lexical/packages/lexical-playground/__tests__/e2e/TextEntry.spec.mjs:49` test: `Can insert text and replace it`, async ({isCollab, page}) => {
- `../lexical/packages/lexical-playground/__tests__/e2e/TextEntry.spec.mjs:50` test: isCollab);
- `../lexical/packages/lexical-playground/__tests__/e2e/TextEntry.spec.mjs:69` test: `Can type 'Hello' as a header and insert a paragraph before`, async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/TextEntry.spec.mjs:73` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/TextEntry.spec.mjs:115` test: `Can insert a paragraph between two text nodes`, async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/TextEntry.spec.mjs:119` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/TextEntry.spec.mjs:148` test: `Can type 'Hello Lexical' in the editor and replace it with foo`, async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/TextEntry.spec.mjs:176` test: `Can type 'Hello Lexical' in the editor and replace it with an empty space`, async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/TextEntry.spec.mjs:204` test: 'Paragraphed text entry and selection', async ({page, isRichText}) => {
- `../lexical/packages/lexical-playground/__tests__/e2e/TextEntry.spec.mjs:275` test: `Can delete characters after they're typed`, async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/TextEntry.spec.mjs:303` test: `Can type characters, and select and replace a part`, async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/TextEntry.spec.mjs:355` test: `Can select and delete a word`, async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/TextEntry.spec.mjs:397` test: 'First paragraph backspace handling', async ({page, isRichText}) => {
- `../lexical/packages/lexical-playground/__tests__/e2e/TextEntry.spec.mjs:482` test: 'Mix of paragraphs and break points', async ({page, isRichText}) => {
- `../lexical/packages/lexical-playground/__tests__/e2e/TextEntry.spec.mjs:608` test: 'Empty paragraph and new line node selection', async ({

## `../lexical/packages/lexical-playground/__tests__/e2e/TextFormatting.spec.mjs`

category: portable
family: serialization-parsing / marks-inline
target: indexed 43 test/describe lines; target packages/plite/test; packages/plite-history/test; apps/www/tests/plite-browser/donor/examples/richtext.test.ts

- `../lexical/packages/lexical-playground/__tests__/e2e/TextFormatting.spec.mjs:37` test: 'TextFormatting', () => {
- `../lexical/packages/lexical-playground/__tests__/e2e/TextFormatting.spec.mjs:38` test: ({isCollab, page}) => initialize({isCollab, page}));
- `../lexical/packages/lexical-playground/__tests__/e2e/TextFormatting.spec.mjs:39` test: `Can create bold text using the shortcut`, async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/TextFormatting.spec.mjs:43` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/TextFormatting.spec.mjs:93` test: `Can create italic text using the shortcut`, async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/TextFormatting.spec.mjs:97` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/TextFormatting.spec.mjs:147` test: `Can select text and boldify it with the shortcut`, async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/TextFormatting.spec.mjs:151` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/TextFormatting.spec.mjs:203` test: 'Should not format the text in the subsequent paragraph after a triple click selection event.', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/TextFormatting.spec.mjs:207` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/TextFormatting.spec.mjs:245` test: `Can select text and italicify it with the shortcut`, async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/TextFormatting.spec.mjs:249` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/TextFormatting.spec.mjs:301` test: `Can select text and underline+strikethrough`, async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/TextFormatting.spec.mjs:305` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/TextFormatting.spec.mjs:424` test: `Can select text and change it to ${format}`, async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/TextFormatting.spec.mjs:428` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/TextFormatting.spec.mjs:500` test: `Pressing ${key} resets ${format} format`, async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/TextFormatting.spec.mjs:504` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/TextFormatting.spec.mjs:532` test: `Can select text and increase the font-size`, async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/TextFormatting.spec.mjs:536` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/TextFormatting.spec.mjs:571` test: `Can select text with different size and increase the font-size relatively`, async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/TextFormatting.spec.mjs:575` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/TextFormatting.spec.mjs:596` test: `Can select text and decrease the font-size`, async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/TextFormatting.spec.mjs:600` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/TextFormatting.spec.mjs:635` test: `Can select text with different size and decrease the font-size relatively`, async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/TextFormatting.spec.mjs:639` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/TextFormatting.spec.mjs:660` test: `Can select text and change the font-size and font-family`, async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/TextFormatting.spec.mjs:664` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/TextFormatting.spec.mjs:749` test: `Can select text and update font size by entering the value`, async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/TextFormatting.spec.mjs:753` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/TextFormatting.spec.mjs:790` test: `Can select text with different size and update font size by entering the value`, async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/TextFormatting.spec.mjs:794` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/TextFormatting.spec.mjs:817` test: `Can select multiple text parts and format them with shortcuts`, async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/TextFormatting.spec.mjs:822` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/TextFormatting.spec.mjs:1015` test: `Can insert range of formatted text and select part and replace with character`, async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/TextFormatting.spec.mjs:1019` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/TextFormatting.spec.mjs:1112` test: `Regression #2439: can format backwards when at first text node boundary`, async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/TextFormatting.spec.mjs:1116` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/TextFormatting.spec.mjs:1164` test: `The active state of the button in the toolbar should to be displayed correctly`, async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/TextFormatting.spec.mjs:1168` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/TextFormatting.spec.mjs:1202` test: 'Regression #2523: can toggle format when selecting a TextNode edge followed by a non TextNode; ', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/TextFormatting.spec.mjs:1207` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/e2e/TextFormatting.spec.mjs:1260` test: 'Multiline selection format ignores new lines', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/TextFormatting.spec.mjs:1265` test: isPlainText);

## `../lexical/packages/lexical-playground/__tests__/e2e/Toolbar.spec.mjs`

category: portable-mixed
family: mixed portable invariant
target: indexed 9 test/describe lines; target packages/plite/test; add focused browser proof only when behavior depends on DOM/runtime transport

- `../lexical/packages/lexical-playground/__tests__/e2e/Toolbar.spec.mjs:34` test: 'Toolbar', () => {
- `../lexical/packages/lexical-playground/__tests__/e2e/Toolbar.spec.mjs:35` test: ({isCollab, page}) =>
- `../lexical/packages/lexical-playground/__tests__/e2e/Toolbar.spec.mjs:44` test: 'Insert image caption + table', async ({page, isPlainText}) => {
- `../lexical/packages/lexical-playground/__tests__/e2e/Toolbar.spec.mjs:46` test: isPlainText \|\| IS_COLLAB_V2);
- `../lexical/packages/lexical-playground/__tests__/e2e/Toolbar.spec.mjs:271` test: 'Center align image', async ({page, isPlainText, isCollab}) => {
- `../lexical/packages/lexical-playground/__tests__/e2e/Toolbar.spec.mjs:273` test: isPlainText \|\| isCollab);
- `../lexical/packages/lexical-playground/__tests__/e2e/Toolbar.spec.mjs:351` test: 'When we select three textNodes with different formatting at the same time, the selection formatting should show no formatting at all', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/Toolbar.spec.mjs:356` test: isPlainText \|\| isCollab);
- `../lexical/packages/lexical-playground/__tests__/e2e/Toolbar.spec.mjs:373` test: 'Selecting empty paragraphs has empty selection format', async ({
- `../lexical/packages/lexical-playground/__tests__/e2e/Toolbar.spec.mjs:378` test: isPlainText \|\| isCollab);

## `../lexical/packages/lexical-playground/__tests__/regression/1055-fast-typing-undo.spec.mjs`

category: portable
family: portable editor behavior
target: indexed 3 test/describe lines; target packages/plite/test; add focused browser proof only when behavior depends on DOM/runtime transport

- `../lexical/packages/lexical-playground/__tests__/regression/1055-fast-typing-undo.spec.mjs:19` test: 'Regression test #1055', () => {
- `../lexical/packages/lexical-playground/__tests__/regression/1055-fast-typing-undo.spec.mjs:20` test: ({isCollab, page}) => initialize({isCollab, page}));
- `../lexical/packages/lexical-playground/__tests__/regression/1055-fast-typing-undo.spec.mjs:21` test: `Adds new editor state into undo stack right after undo was done`, async ({
- `../lexical/packages/lexical-playground/__tests__/regression/1055-fast-typing-undo.spec.mjs:25` test: isCollab);

## `../lexical/packages/lexical-playground/__tests__/regression/1083-backspace-with-element-at-front.spec.mjs`

category: portable
family: portable editor behavior
target: indexed 5 test/describe lines; target packages/plite/test; add focused browser proof only when behavior depends on DOM/runtime transport

- `../lexical/packages/lexical-playground/__tests__/regression/1083-backspace-with-element-at-front.spec.mjs:23` test: 'Regression test #1083', () => {
- `../lexical/packages/lexical-playground/__tests__/regression/1083-backspace-with-element-at-front.spec.mjs:24` test: ({isCollab, page}) => initialize({isCollab, page}));
- `../lexical/packages/lexical-playground/__tests__/regression/1083-backspace-with-element-at-front.spec.mjs:25` test: `Backspace with ElementNode at the front of the paragraph`, async ({
- `../lexical/packages/lexical-playground/__tests__/regression/1083-backspace-with-element-at-front.spec.mjs:29` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/regression/1083-backspace-with-element-at-front.spec.mjs:68` test: `Backspace with ElementNode at the front of the selection`, async ({
- `../lexical/packages/lexical-playground/__tests__/regression/1083-backspace-with-element-at-front.spec.mjs:72` test: isPlainText);

## `../lexical/packages/lexical-playground/__tests__/regression/1113-link-newline-at-end.spec.mjs`

category: portable
family: portable editor behavior
target: indexed 3 test/describe lines; target packages/plite/test; add focused browser proof only when behavior depends on DOM/runtime transport

- `../lexical/packages/lexical-playground/__tests__/regression/1113-link-newline-at-end.spec.mjs:18` test: 'Regression test #1113', () => {
- `../lexical/packages/lexical-playground/__tests__/regression/1113-link-newline-at-end.spec.mjs:19` test: ({isCollab, page}) => initialize({isCollab, page}));
- `../lexical/packages/lexical-playground/__tests__/regression/1113-link-newline-at-end.spec.mjs:20` test: `Selects new line when inserting a new line at the end of a link`, async ({
- `../lexical/packages/lexical-playground/__tests__/regression/1113-link-newline-at-end.spec.mjs:24` test: isRichText);

## `../lexical/packages/lexical-playground/__tests__/regression/1258-delete-forward.spec.mjs`

category: portable
family: selection-dom-mapping / void-atom
target: indexed 2 test/describe lines; target packages/plite/test; packages/plite-react/test/editable-behavior.test.tsx; apps/www/tests/plite-browser/donor/stress/generated-editing.test.ts

- `../lexical/packages/lexical-playground/__tests__/regression/1258-delete-forward.spec.mjs:22` test: 'Regression test #1258', () => {
- `../lexical/packages/lexical-playground/__tests__/regression/1258-delete-forward.spec.mjs:23` test: ({isCollab, page}) => initialize({isCollab, page}));
- `../lexical/packages/lexical-playground/__tests__/regression/1258-delete-forward.spec.mjs:24` test: `Can delete forward with keyboard`, async ({page}) => {

## `../lexical/packages/lexical-playground/__tests__/regression/1384-insert-nodes.spec.mjs`

category: portable
family: portable editor behavior
target: indexed 3 test/describe lines; target packages/plite/test; add focused browser proof only when behavior depends on DOM/runtime transport

- `../lexical/packages/lexical-playground/__tests__/regression/1384-insert-nodes.spec.mjs:21` test: 'Regression test #1384', () => {
- `../lexical/packages/lexical-playground/__tests__/regression/1384-insert-nodes.spec.mjs:22` test: ({isCollab, page}) => initialize({isCollab, page}));
- `../lexical/packages/lexical-playground/__tests__/regression/1384-insert-nodes.spec.mjs:23` test: `Properly pastes in code blocks`, async ({
- `../lexical/packages/lexical-playground/__tests__/regression/1384-insert-nodes.spec.mjs:28` test: isPlainText \|\| isCollab);

## `../lexical/packages/lexical-playground/__tests__/regression/1730-delete-backword.spec.mjs`

category: portable
family: selection-dom-mapping / void-atom
target: indexed 2 test/describe lines; target packages/plite/test; packages/plite-react/test/editable-behavior.test.tsx; apps/www/tests/plite-browser/donor/stress/generated-editing.test.ts

- `../lexical/packages/lexical-playground/__tests__/regression/1730-delete-backword.spec.mjs:19` test: 'Regression test #1730', () => {
- `../lexical/packages/lexical-playground/__tests__/regression/1730-delete-backword.spec.mjs:20` test: ({isCollab, page}) => initialize({isCollab, page}));
- `../lexical/packages/lexical-playground/__tests__/regression/1730-delete-backword.spec.mjs:21` test: `Can delete backward with keyboard`, async ({page}) => {

## `../lexical/packages/lexical-playground/__tests__/regression/221-editing-hashtags.spec.mjs`

category: portable
family: portable editor behavior
target: indexed 4 test/describe lines; target packages/plite/test; add focused browser proof only when behavior depends on DOM/runtime transport

- `../lexical/packages/lexical-playground/__tests__/regression/221-editing-hashtags.spec.mjs:20` test: 'Regression test #221', () => {
- `../lexical/packages/lexical-playground/__tests__/regression/221-editing-hashtags.spec.mjs:21` test: ({isCollab, page}) => initialize({isCollab, page}));
- `../lexical/packages/lexical-playground/__tests__/regression/221-editing-hashtags.spec.mjs:22` test: `Can handle space in hashtag`, async ({page}) => {
- `../lexical/packages/lexical-playground/__tests__/regression/221-editing-hashtags.spec.mjs:64` test: `Can handle delete in hashtag`, async ({page}) => {
- `../lexical/packages/lexical-playground/__tests__/regression/221-editing-hashtags.spec.mjs:106` test: `Can handle backspace into hashtag`, async ({page}) => {

## `../lexical/packages/lexical-playground/__tests__/regression/230-navigation-around-hashtags.spec.mjs`

category: portable
family: portable editor behavior
target: indexed 2 test/describe lines; target packages/plite/test; add focused browser proof only when behavior depends on DOM/runtime transport

- `../lexical/packages/lexical-playground/__tests__/regression/230-navigation-around-hashtags.spec.mjs:20` test: 'Regression test #230', () => {
- `../lexical/packages/lexical-playground/__tests__/regression/230-navigation-around-hashtags.spec.mjs:21` test: ({isCollab, page}) => initialize({isCollab, page}));
- `../lexical/packages/lexical-playground/__tests__/regression/230-navigation-around-hashtags.spec.mjs:22` test: `Is able to right arrow before hashtag after inserting text node`, async ({

## `../lexical/packages/lexical-playground/__tests__/regression/231-empty-text-nodes.spec.mjs`

category: portable
family: core package behavior
target: indexed 2 test/describe lines; target packages/plite/test; add focused browser proof only when behavior depends on DOM/runtime transport

- `../lexical/packages/lexical-playground/__tests__/regression/231-empty-text-nodes.spec.mjs:24` test: 'Regression test #231', () => {
- `../lexical/packages/lexical-playground/__tests__/regression/231-empty-text-nodes.spec.mjs:25` test: ({isCollab, page}) => initialize({isCollab, page}));
- `../lexical/packages/lexical-playground/__tests__/regression/231-empty-text-nodes.spec.mjs:26` test: `Does not generate segment error when editing empty text nodes`, async ({

## `../lexical/packages/lexical-playground/__tests__/regression/3136-insert-nodes-adjacent-to-inline.spec.mjs`

category: portable
family: portable editor behavior
target: indexed 7 test/describe lines; target packages/plite/test; add focused browser proof only when behavior depends on DOM/runtime transport

- `../lexical/packages/lexical-playground/__tests__/regression/3136-insert-nodes-adjacent-to-inline.spec.mjs:24` test: 'Regression test #3136', () => {
- `../lexical/packages/lexical-playground/__tests__/regression/3136-insert-nodes-adjacent-to-inline.spec.mjs:25` test: ({isCollab, page}) => initialize({isCollab, page}));
- `../lexical/packages/lexical-playground/__tests__/regression/3136-insert-nodes-adjacent-to-inline.spec.mjs:26` test: 'Correctly pastes rich content when the selection is followed by an inline element', async ({
- `../lexical/packages/lexical-playground/__tests__/regression/3136-insert-nodes-adjacent-to-inline.spec.mjs:30` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/regression/3136-insert-nodes-adjacent-to-inline.spec.mjs:47` it: needs to be rich text in order to exercise
- `../lexical/packages/lexical-playground/__tests__/regression/3136-insert-nodes-adjacent-to-inline.spec.mjs:67` test: 'Correctly pastes rich content when the selection is preceded by an inline element', async ({
- `../lexical/packages/lexical-playground/__tests__/regression/3136-insert-nodes-adjacent-to-inline.spec.mjs:71` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/regression/3136-insert-nodes-adjacent-to-inline.spec.mjs:89` it: needs to be rich text in order to exercise

## `../lexical/packages/lexical-playground/__tests__/regression/3433-merge-markdown-lists.spec.mjs`

category: portable
family: core package behavior
target: indexed 3 test/describe lines; target packages/plite/test; add focused browser proof only when behavior depends on DOM/runtime transport

- `../lexical/packages/lexical-playground/__tests__/regression/3433-merge-markdown-lists.spec.mjs:17` test: 'Regression test #3433', () => {
- `../lexical/packages/lexical-playground/__tests__/regression/3433-merge-markdown-lists.spec.mjs:18` test: ({isCollab, page}) => initialize({isCollab, page}));
- `../lexical/packages/lexical-playground/__tests__/regression/3433-merge-markdown-lists.spec.mjs:19` test: 'can merge markdown lists created immediately before existing lists', async ({
- `../lexical/packages/lexical-playground/__tests__/regression/3433-merge-markdown-lists.spec.mjs:23` test: isPlainText);

## `../lexical/packages/lexical-playground/__tests__/regression/379-backspace-with-mentions.spec.mjs`

category: portable
family: portable editor behavior
target: indexed 2 test/describe lines; target packages/plite/test; add focused browser proof only when behavior depends on DOM/runtime transport

- `../lexical/packages/lexical-playground/__tests__/regression/379-backspace-with-mentions.spec.mjs:20` test: 'Regression test #379', () => {
- `../lexical/packages/lexical-playground/__tests__/regression/379-backspace-with-mentions.spec.mjs:21` test: ({isCollab, page}) => initialize({isCollab, page}));
- `../lexical/packages/lexical-playground/__tests__/regression/379-backspace-with-mentions.spec.mjs:22` test: `Is able to correctly handle backspace press at the line boundary`, async ({

## `../lexical/packages/lexical-playground/__tests__/regression/399-open-line.spec.mjs`

category: portable
family: portable editor behavior
target: indexed 2 test/describe lines; target packages/plite/test; add focused browser proof only when behavior depends on DOM/runtime transport

- `../lexical/packages/lexical-playground/__tests__/regression/399-open-line.spec.mjs:20` test: 'Regression test #399', () => {
- `../lexical/packages/lexical-playground/__tests__/regression/399-open-line.spec.mjs:21` test: ({isCollab, page}) => initialize({isCollab, page}));
- `../lexical/packages/lexical-playground/__tests__/regression/399-open-line.spec.mjs:22` test: `Supports Ctrl-O as an open line command`, async ({

## `../lexical/packages/lexical-playground/__tests__/regression/429-swapping-emoji.spec.mjs`

category: portable
family: portable editor behavior
target: indexed 2 test/describe lines; target packages/plite/test; add focused browser proof only when behavior depends on DOM/runtime transport

- `../lexical/packages/lexical-playground/__tests__/regression/429-swapping-emoji.spec.mjs:19` test: 'Regression test #429', () => {
- `../lexical/packages/lexical-playground/__tests__/regression/429-swapping-emoji.spec.mjs:20` test: ({isCollab, page}) => initialize({isCollab, page}));
- `../lexical/packages/lexical-playground/__tests__/regression/429-swapping-emoji.spec.mjs:21` test: `Can add new lines before the line with emoji`, async ({

## `../lexical/packages/lexical-playground/__tests__/regression/4661-insert-column-selection.spec.mjs`

category: portable
family: core package behavior
target: indexed 5 test/describe lines; target packages/plite/test; add focused browser proof only when behavior depends on DOM/runtime transport

- `../lexical/packages/lexical-playground/__tests__/regression/4661-insert-column-selection.spec.mjs:22` test: 'Regression test #4661', () => {
- `../lexical/packages/lexical-playground/__tests__/regression/4661-insert-column-selection.spec.mjs:23` test: ({isCollab, page}) =>
- `../lexical/packages/lexical-playground/__tests__/regression/4661-insert-column-selection.spec.mjs:26` test: 'inserting 2 columns before inserts before selection', async ({
- `../lexical/packages/lexical-playground/__tests__/regression/4661-insert-column-selection.spec.mjs:31` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/regression/4661-insert-column-selection.spec.mjs:123` test: 'inserting 2 columns after inserts after selection', async ({
- `../lexical/packages/lexical-playground/__tests__/regression/4661-insert-column-selection.spec.mjs:128` test: isPlainText);

## `../lexical/packages/lexical-playground/__tests__/regression/4697-repeated-table-selection.spec.mjs`

category: portable
family: core package behavior
target: indexed 3 test/describe lines; target packages/plite/test; add focused browser proof only when behavior depends on DOM/runtime transport

- `../lexical/packages/lexical-playground/__tests__/regression/4697-repeated-table-selection.spec.mjs:19` test: 'Regression test #4697', () => {
- `../lexical/packages/lexical-playground/__tests__/regression/4697-repeated-table-selection.spec.mjs:20` test: ({isCollab, page}) => initialize({isCollab, page}));
- `../lexical/packages/lexical-playground/__tests__/regression/4697-repeated-table-selection.spec.mjs:21` test: 'repeated table selection results in table selection', async ({
- `../lexical/packages/lexical-playground/__tests__/regression/4697-repeated-table-selection.spec.mjs:26` test: isPlainText);

## `../lexical/packages/lexical-playground/__tests__/regression/4872-full-row-span-cell-merge.spec.mjs`

category: portable
family: portable editor behavior
target: indexed 3 test/describe lines; target packages/plite/test; add focused browser proof only when behavior depends on DOM/runtime transport

- `../lexical/packages/lexical-playground/__tests__/regression/4872-full-row-span-cell-merge.spec.mjs:19` test: 'Regression test #4872', () => {
- `../lexical/packages/lexical-playground/__tests__/regression/4872-full-row-span-cell-merge.spec.mjs:20` test: ({isCollab, page}) => initialize({isCollab, page}));
- `../lexical/packages/lexical-playground/__tests__/regression/4872-full-row-span-cell-merge.spec.mjs:21` test: 'merging two full rows does not break table selection', async ({
- `../lexical/packages/lexical-playground/__tests__/regression/4872-full-row-span-cell-merge.spec.mjs:26` test: isPlainText);

## `../lexical/packages/lexical-playground/__tests__/regression/4876-unmerge-cell.spec.mjs`

category: portable
family: portable editor behavior
target: indexed 3 test/describe lines; target packages/plite/test; add focused browser proof only when behavior depends on DOM/runtime transport

- `../lexical/packages/lexical-playground/__tests__/regression/4876-unmerge-cell.spec.mjs:21` test: 'Regression test #4876', () => {
- `../lexical/packages/lexical-playground/__tests__/regression/4876-unmerge-cell.spec.mjs:22` test: ({isCollab, page}) => initialize({isCollab, page}));
- `../lexical/packages/lexical-playground/__tests__/regression/4876-unmerge-cell.spec.mjs:23` test: 'unmerging cells should add cells to correct rows', async ({
- `../lexical/packages/lexical-playground/__tests__/regression/4876-unmerge-cell.spec.mjs:28` test: isPlainText);

## `../lexical/packages/lexical-playground/__tests__/regression/5251-paste-into-inline-element.spec.mjs`

category: portable
family: portable editor behavior
target: indexed 3 test/describe lines; target packages/plite/test; add focused browser proof only when behavior depends on DOM/runtime transport

- `../lexical/packages/lexical-playground/__tests__/regression/5251-paste-into-inline-element.spec.mjs:29` test: 'Regression test #5251', () => {
- `../lexical/packages/lexical-playground/__tests__/regression/5251-paste-into-inline-element.spec.mjs:30` test: ({isCollab, page}) => initialize({isCollab, page}));
- `../lexical/packages/lexical-playground/__tests__/regression/5251-paste-into-inline-element.spec.mjs:31` test: 'Correctly pastes rich content inside an inline element', async ({
- `../lexical/packages/lexical-playground/__tests__/regression/5251-paste-into-inline-element.spec.mjs:35` test: isPlainText);

## `../lexical/packages/lexical-playground/__tests__/regression/5583-select-list-followed-by-element-node.spec.mjs`

category: portable
family: core package behavior
target: indexed 3 test/describe lines; target packages/plite/test; add focused browser proof only when behavior depends on DOM/runtime transport

- `../lexical/packages/lexical-playground/__tests__/regression/5583-select-list-followed-by-element-node.spec.mjs:25` test: 'Regression test #5251', () => {
- `../lexical/packages/lexical-playground/__tests__/regression/5583-select-list-followed-by-element-node.spec.mjs:26` test: ({isCollab, page}) => initialize({isCollab, page}));
- `../lexical/packages/lexical-playground/__tests__/regression/5583-select-list-followed-by-element-node.spec.mjs:27` test: `Element node in the middle of a bullet list and selecting doesn't crash`, async ({
- `../lexical/packages/lexical-playground/__tests__/regression/5583-select-list-followed-by-element-node.spec.mjs:31` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/regression/5583-select-list-followed-by-element-node.spec.mjs:40` test: );

## `../lexical/packages/lexical-playground/__tests__/regression/6870-table-left-arrow-selection.spec.mjs`

category: portable
family: tables-grid / selection-dom-mapping
target: indexed 7 test/describe lines; target apps/www/tests/plite-browser/donor/stress/generated-editing.test.ts; apps/www/tests/plite-browser/donor/examples/tables.test.ts; packages/plite/test/transforms/insertFragment

- `../lexical/packages/lexical-playground/__tests__/regression/6870-table-left-arrow-selection.spec.mjs:22` test: 'Regression test #6870', () => {
- `../lexical/packages/lexical-playground/__tests__/regression/6870-table-left-arrow-selection.spec.mjs:23` test: ({isCollab, page}) => initialize({isCollab, page}));
- `../lexical/packages/lexical-playground/__tests__/regression/6870-table-left-arrow-selection.spec.mjs:24` test: 'left arrow moves selection around decorators near tables', async ({
- `../lexical/packages/lexical-playground/__tests__/regression/6870-table-left-arrow-selection.spec.mjs:29` test: isCollab);
- `../lexical/packages/lexical-playground/__tests__/regression/6870-table-left-arrow-selection.spec.mjs:30` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/regression/6870-table-left-arrow-selection.spec.mjs:66` test: 'left arrow expands selection around decorators near tables', async ({
- `../lexical/packages/lexical-playground/__tests__/regression/6870-table-left-arrow-selection.spec.mjs:71` test: isCollab);
- `../lexical/packages/lexical-playground/__tests__/regression/6870-table-left-arrow-selection.spec.mjs:72` test: isPlainText);

## `../lexical/packages/lexical-playground/__tests__/regression/6974-delete-character-backward.spec.mjs`

category: portable
family: selection-dom-mapping / void-atom
target: indexed 3 test/describe lines; target packages/plite/test; packages/plite-react/test/editable-behavior.test.tsx; apps/www/tests/plite-browser/donor/stress/generated-editing.test.ts

- `../lexical/packages/lexical-playground/__tests__/regression/6974-delete-character-backward.spec.mjs:21` test: 'Regression tests for #6974', () => {
- `../lexical/packages/lexical-playground/__tests__/regression/6974-delete-character-backward.spec.mjs:22` test: ({isPlainText, isCollab, page}) =>
- `../lexical/packages/lexical-playground/__tests__/regression/6974-delete-character-backward.spec.mjs:26` test: `deleteCharacter merges children from adjacent blocks even if the previous leaf is an inline decorator`, async ({
- `../lexical/packages/lexical-playground/__tests__/regression/6974-delete-character-backward.spec.mjs:31` test: isCollab \|\| isPlainText);

## `../lexical/packages/lexical-playground/__tests__/regression/7163-graphemes.spec.mjs`

category: portable
family: selection-dom-mapping / void-atom
target: indexed 3 test/describe lines; target packages/plite/test; packages/plite-react/test/editable-behavior.test.tsx; apps/www/tests/plite-browser/donor/stress/generated-editing.test.ts

- `../lexical/packages/lexical-playground/__tests__/regression/7163-graphemes.spec.mjs:20` test: {mode: 'parallel'});
- `../lexical/packages/lexical-playground/__tests__/regression/7163-graphemes.spec.mjs:21` test: 'Grapheme deleteCharacter', () => {
- `../lexical/packages/lexical-playground/__tests__/regression/7163-graphemes.spec.mjs:22` test: ({isPlainText, isCollab, page}) =>
- `../lexical/packages/lexical-playground/__tests__/regression/7163-graphemes.spec.mjs:133` test: description, async ({page, browserName, isCollab, isPlainText}) => {
- `../lexical/packages/lexical-playground/__tests__/regression/7163-graphemes.spec.mjs:135` test: isCollab \|\| skip);

## `../lexical/packages/lexical-playground/__tests__/regression/7246-delete-character-backward-list.spec.mjs`

category: portable
family: selection-dom-mapping / void-atom
target: indexed 3 test/describe lines; target packages/plite/test; packages/plite-react/test/editable-behavior.test.tsx; apps/www/tests/plite-browser/donor/stress/generated-editing.test.ts

- `../lexical/packages/lexical-playground/__tests__/regression/7246-delete-character-backward-list.spec.mjs:21` test: 'Regression tests for #7246', () => {
- `../lexical/packages/lexical-playground/__tests__/regression/7246-delete-character-backward-list.spec.mjs:22` test: ({isPlainText, isCollab, page}) =>
- `../lexical/packages/lexical-playground/__tests__/regression/7246-delete-character-backward-list.spec.mjs:26` test: `deleteCharacter merges children from block adjacent to ListNode`, async ({
- `../lexical/packages/lexical-playground/__tests__/regression/7246-delete-character-backward-list.spec.mjs:31` test: isCollab \|\| isPlainText);

## `../lexical/packages/lexical-playground/__tests__/regression/7266-column-header-merged-cells.spec.mjs`

category: portable
family: portable editor behavior
target: indexed 5 test/describe lines; target packages/plite/test; add focused browser proof only when behavior depends on DOM/runtime transport

- `../lexical/packages/lexical-playground/__tests__/regression/7266-column-header-merged-cells.spec.mjs:22` test: 'Regression test #7266', () => {
- `../lexical/packages/lexical-playground/__tests__/regression/7266-column-header-merged-cells.spec.mjs:23` test: ({isCollab, page}) => initialize({isCollab, page}));
- `../lexical/packages/lexical-playground/__tests__/regression/7266-column-header-merged-cells.spec.mjs:25` test: 'toggling column header with merged column cells should only apply column header to the selected column', async ({
- `../lexical/packages/lexical-playground/__tests__/regression/7266-column-header-merged-cells.spec.mjs:30` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/regression/7266-column-header-merged-cells.spec.mjs:174` test: 'toggling row header with merged row cells should only apply row header to the selected row', async ({
- `../lexical/packages/lexical-playground/__tests__/regression/7266-column-header-merged-cells.spec.mjs:179` test: isPlainText);

## `../lexical/packages/lexical-playground/__tests__/regression/7319-delete-character-backward-nodeselection.spec.mjs`

category: portable
family: selection-dom-mapping / void-atom
target: indexed 5 test/describe lines; target packages/plite/test; packages/plite-react/test/editable-behavior.test.tsx; apps/www/tests/plite-browser/donor/stress/generated-editing.test.ts

- `../lexical/packages/lexical-playground/__tests__/regression/7319-delete-character-backward-nodeselection.spec.mjs:19` test: 'Regression tests for #7319', () => {
- `../lexical/packages/lexical-playground/__tests__/regression/7319-delete-character-backward-nodeselection.spec.mjs:20` test: ({isPlainText, isCollab, page}) =>
- `../lexical/packages/lexical-playground/__tests__/regression/7319-delete-character-backward-nodeselection.spec.mjs:24` test: `deleteCharacter after hr with RangeSelection`, async ({
- `../lexical/packages/lexical-playground/__tests__/regression/7319-delete-character-backward-nodeselection.spec.mjs:29` test: isCollab \|\| isPlainText);
- `../lexical/packages/lexical-playground/__tests__/regression/7319-delete-character-backward-nodeselection.spec.mjs:62` test: `deleteCharacter after hr with NodeSelection`, async ({
- `../lexical/packages/lexical-playground/__tests__/regression/7319-delete-character-backward-nodeselection.spec.mjs:67` test: isCollab \|\| isPlainText);

## `../lexical/packages/lexical-playground/__tests__/regression/7354-firefox-decorator-paste.spec.mjs`

category: portable
family: portable editor behavior
target: indexed 3 test/describe lines; target packages/plite/test; add focused browser proof only when behavior depends on DOM/runtime transport

- `../lexical/packages/lexical-playground/__tests__/regression/7354-firefox-decorator-paste.spec.mjs:23` test: 'HTML CopyAndPaste', () => {
- `../lexical/packages/lexical-playground/__tests__/regression/7354-firefox-decorator-paste.spec.mjs:24` test: ({isCollab, page}) => initialize({isCollab, page}));
- `../lexical/packages/lexical-playground/__tests__/regression/7354-firefox-decorator-paste.spec.mjs:26` test: 'Copy + paste multi line html with extra newlines', async ({
- `../lexical/packages/lexical-playground/__tests__/regression/7354-firefox-decorator-paste.spec.mjs:31` test: isPlainText \|\| isCollab);

## `../lexical/packages/lexical-playground/__tests__/regression/7635-SELECTION_INSERT_CLIPBOARD_NODES_COMMAND.spec.mjs`

category: portable
family: portable editor behavior
target: indexed 3 test/describe lines; target packages/plite/test; add focused browser proof only when behavior depends on DOM/runtime transport

- `../lexical/packages/lexical-playground/__tests__/regression/7635-SELECTION_INSERT_CLIPBOARD_NODES_COMMAND.spec.mjs:34` test: 'Regression #7635', () => {
- `../lexical/packages/lexical-playground/__tests__/regression/7635-SELECTION_INSERT_CLIPBOARD_NODES_COMMAND.spec.mjs:35` test: ({isCollab, page}) =>
- `../lexical/packages/lexical-playground/__tests__/regression/7635-SELECTION_INSERT_CLIPBOARD_NODES_COMMAND.spec.mjs:39` test: 'Paste into image caption', async ({page, isPlainText, isCollab}) => {
- `../lexical/packages/lexical-playground/__tests__/regression/7635-SELECTION_INSERT_CLIPBOARD_NODES_COMMAND.spec.mjs:40` test: isPlainText \|\| isCollab);

## `../lexical/packages/lexical-playground/__tests__/regression/8153-safari-ime-delete-selection.spec.mjs`

category: portable
family: ime-composition / history-undo-redo
target: indexed 9 test/describe lines; target apps/www/tests/plite-browser/donor/stress/generated-editing.test.ts; packages/test/src/playwright/ime.ts; packages/plite-history/test

- `../lexical/packages/lexical-playground/__tests__/regression/8153-safari-ime-delete-selection.spec.mjs:36` test: 'Regression #8153', () => {
- `../lexical/packages/lexical-playground/__tests__/regression/8153-safari-ime-delete-selection.spec.mjs:37` test: ({isCollab, page}) => initialize({isCollab, page}));
- `../lexical/packages/lexical-playground/__tests__/regression/8153-safari-ime-delete-selection.spec.mjs:39` test: 'Can delete all text selected with Cmd+A after IME composition end on Safari', async ({
- `../lexical/packages/lexical-playground/__tests__/regression/8153-safari-ime-delete-selection.spec.mjs:45` test: browserName !== 'webkit');
- `../lexical/packages/lexical-playground/__tests__/regression/8153-safari-ime-delete-selection.spec.mjs:46` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/regression/8153-safari-ime-delete-selection.spec.mjs:47` test: isCollab);
- `../lexical/packages/lexical-playground/__tests__/regression/8153-safari-ime-delete-selection.spec.mjs:75` test: 'Can delete multi-paragraph selection with Shift+ArrowUp after IME composition end on Safari', async ({
- `../lexical/packages/lexical-playground/__tests__/regression/8153-safari-ime-delete-selection.spec.mjs:81` test: browserName !== 'webkit');
- `../lexical/packages/lexical-playground/__tests__/regression/8153-safari-ime-delete-selection.spec.mjs:82` test: isPlainText);
- `../lexical/packages/lexical-playground/__tests__/regression/8153-safari-ime-delete-selection.spec.mjs:83` test: isCollab);

## `../lexical/packages/lexical-playground/__tests__/unit/CardNode.test.ts`

category: portable
family: portable editor behavior
target: indexed; target current Plite package proof and browser proof when DOM-dependent

- `../lexical/packages/lexical-playground/__tests__/unit/CardNode.test.ts:78` describe: 'CardNode named slots', () => {
- `../lexical/packages/lexical-playground/__tests__/unit/CardNode.test.ts:79` it: 'round-trips the title slot and body children through clipboard copy -> paste', () => {
- `../lexical/packages/lexical-playground/__tests__/unit/CardNode.test.ts:115` it: 'round-trips the title slot and body children through HTML export -> DOMImportExtension', () => {
- `../lexical/packages/lexical-playground/__tests__/unit/CardNode.test.ts:160` it: 'keeps the body in HTML export when the Card is in a NodeSelection', () => {
- `../lexical/packages/lexical-playground/__tests__/unit/CardNode.test.ts:187` it: 'does not fabricate the seeded title when importing a Card without a title wrapper', () => {
- `../lexical/packages/lexical-playground/__tests__/unit/CardNode.test.ts:209` it: 'seeds the title slot with a bare paragraph value (no container wrapper)', () => {
- `../lexical/packages/lexical-playground/__tests__/unit/CardNode.test.ts:244` it: 'serializes the title slot as a bare paragraph (no container level)', () => {
- `../lexical/packages/lexical-playground/__tests__/unit/CardNode.test.ts:263` it: 'SELECT_ALL inside a slot scopes to the slot value, not the root', () => {
- `../lexical/packages/lexical-playground/__tests__/unit/CardNode.test.ts:300` it: 'Backspace at slot start is a no-op at the virtual shadow boundary', () => {
- `../lexical/packages/lexical-playground/__tests__/unit/CardNode.test.ts:336` it: 'mid-text deletion resolves its scope at the bare title value', () => {
- `../lexical/packages/lexical-playground/__tests__/unit/CardNode.test.ts:384` it: 'Tab from the title slot moves the caret into the body', () => {
- `../lexical/packages/lexical-playground/__tests__/unit/CardNode.test.ts:423` it: 'Shift+Tab from the body moves the caret into the title slot', () => {
- `../lexical/packages/lexical-playground/__tests__/unit/CardNode.test.ts:465` it: 'Tab from the title seeds an empty body paragraph when none exists', () => {
- `../lexical/packages/lexical-playground/__tests__/unit/CardNode.test.ts:511` it: '$defaultShouldInsertAfter matches a CardNode without an override', () => {
- `../lexical/packages/lexical-playground/__tests__/unit/CardNode.test.ts:535` it: 'clicking the title slot wrapper does not promote to a whole-Card NodeSelection', () => {

## `../lexical/packages/lexical-playground/__tests__/unit/CollapsibleContainerNode.test.ts`

category: portable
family: portable editor behavior
target: indexed; target current Plite package proof and browser proof when DOM-dependent

- `../lexical/packages/lexical-playground/__tests__/unit/CollapsibleContainerNode.test.ts:53` describe: 'CollapsibleContainerNode HTML import (issue #8407)', () => {
- `../lexical/packages/lexical-playground/__tests__/unit/CollapsibleContainerNode.test.ts:54` describe: 'importDOM', () => {
- `../lexical/packages/lexical-playground/__tests__/unit/CollapsibleContainerNode.test.ts:55` it: 'imports <details> with loose text body without crashing', () => {
- `../lexical/packages/lexical-playground/__tests__/unit/CollapsibleContainerNode.test.ts:95` it: 'preserves the open attribute on import', () => {
- `../lexical/packages/lexical-playground/__tests__/unit/CollapsibleContainerNode.test.ts:111` it: 'handles <summary> appearing after body content', () => {
- `../lexical/packages/lexical-playground/__tests__/unit/CollapsibleContainerNode.test.ts:140` it: 'imports <details> with no <summary> without crashing', () => {
- `../lexical/packages/lexical-playground/__tests__/unit/CollapsibleContainerNode.test.ts:173` it: 'imports <details> with summary and block body siblings', () => {
- `../lexical/packages/lexical-playground/__tests__/unit/CollapsibleContainerNode.test.ts:201` it: 'imports <details> with element body (round-trip shape)', () => {
- `../lexical/packages/lexical-playground/__tests__/unit/CollapsibleContainerNode.test.ts:234` describe: 'importDOM + transforms', () => {
- `../lexical/packages/lexical-playground/__tests__/unit/CollapsibleContainerNode.test.ts:235` it: 'well-formed <details> survives transforms intact', () => {
- `../lexical/packages/lexical-playground/__tests__/unit/CollapsibleContainerNode.test.ts:260` it: 'missing <summary> unwraps to bare paragraphs after transforms', () => {
- `../lexical/packages/lexical-playground/__tests__/unit/CollapsibleContainerNode.test.ts:289` describe: 'CollapsibleExtension transforms', () => {
- `../lexical/packages/lexical-playground/__tests__/unit/CollapsibleContainerNode.test.ts:295` it: 'wraps inline content children in paragraphs', () => {
- `../lexical/packages/lexical-playground/__tests__/unit/CollapsibleContainerNode.test.ts:325` it: 'adds a paragraph to empty content loaded from serialized state', () => {
- `../lexical/packages/lexical-playground/__tests__/unit/CollapsibleContainerNode.test.ts:410` it: 'leaves block decorator content children unwrapped', () => {

## `../lexical/packages/lexical-playground/__tests__/unit/EquationNodeAria.test.ts`

category: portable
family: portable editor behavior
target: indexed; target current Plite package proof and browser proof when DOM-dependent

- `../lexical/packages/lexical-playground/__tests__/unit/EquationNodeAria.test.ts:21` describe: 'EquationNode ARIA attributes', () => {
- `../lexical/packages/lexical-playground/__tests__/unit/EquationNodeAria.test.ts:36` test: 'createDOM sets role="math" and aria-label with the equation text', () => {
- `../lexical/packages/lexical-playground/__tests__/unit/EquationNodeAria.test.ts:57` test: 'aria-label tracks setEquation updates without recreating the DOM', () => {

## `../lexical/packages/lexical-playground/__tests__/unit/ImageHTML.test.ts`

category: portable-mixed
family: clipboard-paste / browser-engine
target: indexed 4 test/describe lines; target packages/plite/test/clipboard-contract.ts; packages/plite-dom/test/clipboard-boundary.test.ts; apps/www/tests/plite-browser/donor/examples/paste-html.test.ts; apps/www/tests/plite-browser/donor/stress/generated-editing.test.ts

- `../lexical/packages/lexical-playground/__tests__/unit/ImageHTML.test.ts:25` describe: 'ImageNode HTML serialization', () => {
- `../lexical/packages/lexical-playground/__tests__/unit/ImageHTML.test.ts:26` describe: 'ImageNode export', () => {
- `../lexical/packages/lexical-playground/__tests__/unit/ImageHTML.test.ts:27` it: 'with no caption', async () => {
- `../lexical/packages/lexical-playground/__tests__/unit/ImageHTML.test.ts:53` it: 'with plain text caption', async () => {

## `../lexical/packages/lexical-playground/__tests__/unit/Issue8724Collapsible.test.ts`

category: portable
family: portable editor behavior
target: indexed; target current Plite package proof and browser proof when DOM-dependent

- `../lexical/packages/lexical-playground/__tests__/unit/Issue8724Collapsible.test.ts:45` describe: 'Pasting a HorizontalRuleNode into a CollapsibleTitleNode (#8724)', () => {
- `../lexical/packages/lexical-playground/__tests__/unit/Issue8724Collapsible.test.ts:52` test: 'drops the pasted block and keeps the collapsible intact', () => {

## `../lexical/packages/lexical-playground/__tests__/unit/MarkdownTransformers.test.ts`

category: portable
family: portable editor behavior
target: indexed; target current Plite package proof and browser proof when DOM-dependent

- `../lexical/packages/lexical-playground/__tests__/unit/MarkdownTransformers.test.ts:62` describe: 'playground EQUATION markdown transformer', () => {
- `../lexical/packages/lexical-playground/__tests__/unit/MarkdownTransformers.test.ts:63` it: 'exports inline equations with single dollar delimiters', () => {
- `../lexical/packages/lexical-playground/__tests__/unit/MarkdownTransformers.test.ts:82` it: 'exports block equations with double dollar delimiters', () => {
- `../lexical/packages/lexical-playground/__tests__/unit/MarkdownTransformers.test.ts:99` it: 'imports multiline double dollar equations as block equations', () => {
- `../lexical/packages/lexical-playground/__tests__/unit/MarkdownTransformers.test.ts:120` it: 'imports single dollar equations as inline equations', () => {
- `../lexical/packages/lexical-playground/__tests__/unit/MarkdownTransformers.test.ts:144` it: 'imports escaped dollars inside inline equations', () => {
- `../lexical/packages/lexical-playground/__tests__/unit/MarkdownTransformers.test.ts:168` it: 'exports inline equations without creating block-equation ambiguity', () => {
- `../lexical/packages/lexical-playground/__tests__/unit/MarkdownTransformers.test.ts:215` it: 'exports inline equations containing dollar signs without block-equation ambiguity', () => {
- `../lexical/packages/lexical-playground/__tests__/unit/MarkdownTransformers.test.ts:255` it: 'uses a block equation when typing double dollar markdown', () => {
- `../lexical/packages/lexical-playground/__tests__/unit/MarkdownTransformers.test.ts:274` describe: 'playground IMAGE markdown transformer', () => {
- `../lexical/packages/lexical-playground/__tests__/unit/MarkdownTransformers.test.ts:275` it: 'imports image with the same default maxWidth as $createImageNode', () => {

## `../lexical/packages/lexical-playground/__tests__/unit/PullQuoteNode.test.ts`

category: portable
family: portable editor behavior
target: indexed; target current Plite package proof and browser proof when DOM-dependent

- `../lexical/packages/lexical-playground/__tests__/unit/PullQuoteNode.test.ts:58` describe: 'PullQuoteNode atomic decorator host', () => {
- `../lexical/packages/lexical-playground/__tests__/unit/PullQuoteNode.test.ts:59` it: 'holds a multi-block quote container and a bare-paragraph attribution', () => {
- `../lexical/packages/lexical-playground/__tests__/unit/PullQuoteNode.test.ts:103` it: 'serializes the attribution slot as a bare paragraph (no container level)', () => {
- `../lexical/packages/lexical-playground/__tests__/unit/PullQuoteNode.test.ts:128` it: 'canonicalizes slots set in reverse to the declared order', () => {
- `../lexical/packages/lexical-playground/__tests__/unit/PullQuoteNode.test.ts:167` it: 'links both slot values to the host without making them children', () => {
- `../lexical/packages/lexical-playground/__tests__/unit/PullQuoteNode.test.ts:193` it: 'round-trips both slots through clipboard copy -> paste', () => {
- `../lexical/packages/lexical-playground/__tests__/unit/PullQuoteNode.test.ts:238` it: 'round-trips through HTML export -> DOMImportExtension', () => {
- `../lexical/packages/lexical-playground/__tests__/unit/PullQuoteNode.test.ts:300` it: 'does not leak default seed into missing slots on import', () => {
- `../lexical/packages/lexical-playground/__tests__/unit/PullQuoteNode.test.ts:335` it: 'imports non-slot children into the quote slot instead of dropping them', () => {
- `../lexical/packages/lexical-playground/__tests__/unit/PullQuoteNode.test.ts:367` it: 'appends trailing non-slot children after the imported quote content', () => {

## `../lexical/packages/lexical-playground/__tests__/unit/ReviewNode.test.ts`

category: portable
family: portable editor behavior
target: indexed; target current Plite package proof and browser proof when DOM-dependent

- `../lexical/packages/lexical-playground/__tests__/unit/ReviewNode.test.ts:63` describe: 'ReviewNode HTML round-trip', () => {
- `../lexical/packages/lexical-playground/__tests__/unit/ReviewNode.test.ts:64` it: 'round-trips the author slot, body children, and rating through HTML export -> DOMImportExtension', () => {
- `../lexical/packages/lexical-playground/__tests__/unit/ReviewNode.test.ts:103` it: 'keeps the body and rating in HTML export when the Review is in a NodeSelection', () => {
- `../lexical/packages/lexical-playground/__tests__/unit/ReviewNode.test.ts:127` it: 'does not fabricate the seeded author when importing a Review without an author wrapper', () => {
- `../lexical/packages/lexical-playground/__tests__/unit/ReviewNode.test.ts:149` it: 'clamps an out-of-range rating on import', () => {
- `../lexical/packages/lexical-playground/__tests__/unit/ReviewNode.test.ts:169` it: 'defaults the rating to 0 when the attribute is absent', () => {

## `../lexical/packages/lexical-playground/src/__tests__/unit/RubyComposition.test.ts`

category: portable-mixed
family: beforeinput-input / browser-engine
target: indexed; target current Plite package proof and browser proof when DOM-dependent

- `../lexical/packages/lexical-playground/src/__tests__/unit/RubyComposition.test.ts:87` describe: 'RubyNode composition at boundary (Safari IME)', () => {
- `../lexical/packages/lexical-playground/src/__tests__/unit/RubyComposition.test.ts:113` test: 'insertText at end of ruby inserts into next TextNode', () => {
- `../lexical/packages/lexical-playground/src/__tests__/unit/RubyComposition.test.ts:129` test: 'insertText at start of ruby inserts into prev TextNode', () => {
- `../lexical/packages/lexical-playground/src/__tests__/unit/RubyComposition.test.ts:145` test: 'insertText between adjacent rubies creates new TextNode', () => {
- `../lexical/packages/lexical-playground/src/__tests__/unit/RubyComposition.test.ts:161` test: 'CONTROLLED_TEXT_INSERTION at end of ruby inserts into next TextNode', () => {
- `../lexical/packages/lexical-playground/src/__tests__/unit/RubyComposition.test.ts:178` test: 'CONTROLLED_TEXT_INSERTION at start of ruby inserts into prev TextNode', () => {
- `../lexical/packages/lexical-playground/src/__tests__/unit/RubyComposition.test.ts:195` test: '$nudgeOffRuby skips when ruby node is composing', () => {
- `../lexical/packages/lexical-playground/src/__tests__/unit/RubyComposition.test.ts:217` test: '$nudgeOffRuby moves selection when NOT composing', () => {
- `../lexical/packages/lexical-playground/src/__tests__/unit/RubyComposition.test.ts:238` test: '$nudgeOffRuby at end of ruby moves to next TextNode', () => {
- `../lexical/packages/lexical-playground/src/__tests__/unit/RubyComposition.test.ts:261` test: 'token node skips markDirty while composing', () => {
- `../lexical/packages/lexical-playground/src/__tests__/unit/RubyComposition.test.ts:292` test: [
- `../lexical/packages/lexical-playground/src/__tests__/unit/RubyComposition.test.ts:383` test: 'COMPOSITION_END on ruby redirects text to next TextNode', () => {
- `../lexical/packages/lexical-playground/src/__tests__/unit/RubyComposition.test.ts:407` test: 'COMPOSITION_END between adjacent rubies creates new TextNode', () => {
- `../lexical/packages/lexical-playground/src/__tests__/unit/RubyComposition.test.ts:431` test: 'COMPOSITION_END at offset 0 redirects to prev TextNode', () => {
- `../lexical/packages/lexical-playground/src/__tests__/unit/RubyComposition.test.ts:449` test: [
- `../lexical/packages/lexical-playground/src/__tests__/unit/RubyComposition.test.ts:508` test: 'ruby text content is preserved after COMPOSITION_END redirect', () => {

## `../lexical/packages/lexical-playground/src/__tests__/unit/RubyNode.test.ts`

category: portable-mixed
family: portable editor behavior
target: indexed; target current Plite package proof and browser proof when DOM-dependent

- `../lexical/packages/lexical-playground/src/__tests__/unit/RubyNode.test.ts:50` describe: 'RubyNode', () => {
- `../lexical/packages/lexical-playground/src/__tests__/unit/RubyNode.test.ts:74` describe: '$createRubyNode', () => {
- `../lexical/packages/lexical-playground/src/__tests__/unit/RubyNode.test.ts:75` test: 'creates node with correct text and annotation', () => {
- `../lexical/packages/lexical-playground/src/__tests__/unit/RubyNode.test.ts:104` describe: '$isRubyNode', () => {
- `../lexical/packages/lexical-playground/src/__tests__/unit/RubyNode.test.ts:105` test: 'returns true for RubyNode', () => {
- `../lexical/packages/lexical-playground/src/__tests__/unit/RubyNode.test.ts:119` test: 'returns false for TextNode', () => {
- `../lexical/packages/lexical-playground/src/__tests__/unit/RubyNode.test.ts:134` test: 'returns false for null/undefined', () => {
- `../lexical/packages/lexical-playground/src/__tests__/unit/RubyNode.test.ts:140` describe: 'serialization', () => {
- `../lexical/packages/lexical-playground/src/__tests__/unit/RubyNode.test.ts:141` test: 'importJSON/exportJSON round-trip preserves text and annotation', () => {
- `../lexical/packages/lexical-playground/src/__tests__/unit/RubyNode.test.ts:174` describe: 'exportDOM', () => {
- `../lexical/packages/lexical-playground/src/__tests__/unit/RubyNode.test.ts:175` test: 'produces <ruby>text<rp>(<rp><rt>annotation</rt><rp>)</rp></ruby>', () => {
- `../lexical/packages/lexical-playground/src/__tests__/unit/RubyNode.test.ts:204` describe: 'createDOM', () => {
- `../lexical/packages/lexical-playground/src/__tests__/unit/RubyNode.test.ts:205` test: 'produces wrapper span > inner span with data-ruby-annotation', () => {
- `../lexical/packages/lexical-playground/src/__tests__/unit/RubyNode.test.ts:229` describe: 'getDOMSlot', () => {
- `../lexical/packages/lexical-playground/src/__tests__/unit/RubyNode.test.ts:230` test: 'returns slot pointing to inner element', () => {
- `../lexical/packages/lexical-playground/src/__tests__/unit/RubyNode.test.ts:251` describe: '$toggleRuby', () => {
- `../lexical/packages/lexical-playground/src/__tests__/unit/RubyNode.test.ts:252` test: 'with annotation on selection creates RubyNode', () => {
- `../lexical/packages/lexical-playground/src/__tests__/unit/RubyNode.test.ts:282` test: 'with null unwraps RubyNode back to TextNode', () => {
- `../lexical/packages/lexical-playground/src/__tests__/unit/RubyNode.test.ts:311` test: 'on collapsed selection is no-op', () => {
- `../lexical/packages/lexical-playground/src/__tests__/unit/RubyNode.test.ts:338` test: 'preserves format and style from source text', () => {
- `../lexical/packages/lexical-playground/src/__tests__/unit/RubyNode.test.ts:366` test: 'unwrap preserves format and style on resulting TextNode', () => {
- `../lexical/packages/lexical-playground/src/__tests__/unit/RubyNode.test.ts:395` describe: '$unwrapRubiesInSelection', () => {
- `../lexical/packages/lexical-playground/src/__tests__/unit/RubyNode.test.ts:407` test: 'typing over selection that includes rubies unwraps them', () => {
- `../lexical/packages/lexical-playground/src/__tests__/unit/RubyNode.test.ts:453` test: 'collapsed selection does not unwrap rubies', () => {
- `../lexical/packages/lexical-playground/src/__tests__/unit/RubyNode.test.ts:494` describe: 'token mode', () => {
- `../lexical/packages/lexical-playground/src/__tests__/unit/RubyNode.test.ts:495` test: 'canInsertTextBefore returns false', () => {
- `../lexical/packages/lexical-playground/src/__tests__/unit/RubyNode.test.ts:510` test: 'canInsertTextAfter returns false', () => {
- `../lexical/packages/lexical-playground/src/__tests__/unit/RubyNode.test.ts:527` describe: 'RubyExtension Shift+arrow skip', () => {
- `../lexical/packages/lexical-playground/src/__tests__/unit/RubyNode.test.ts:561` test: 'Shift+Right from collapsed cursor at text end jumps past ruby', () => {
- `../lexical/packages/lexical-playground/src/__tests__/unit/RubyNode.test.ts:596` test: 'Shift+Left from collapsed cursor at text start jumps past ruby', () => {
- `../lexical/packages/lexical-playground/src/__tests__/unit/RubyNode.test.ts:627` test: 'Shift+Right extends existing selection past ruby', () => {
- `../lexical/packages/lexical-playground/src/__tests__/unit/RubyNode.test.ts:658` describe: 'RubyExtension Shift+arrow — consecutive rubies', () => {
- `../lexical/packages/lexical-playground/src/__tests__/unit/RubyNode.test.ts:693` test: 'Shift+Right from text end skips consecutive rubies to next text', () => {
- `../lexical/packages/lexical-playground/src/__tests__/unit/RubyNode.test.ts:718` test: 'Shift+Left from text start skips consecutive rubies to prev text', () => {
- `../lexical/packages/lexical-playground/src/__tests__/unit/RubyNode.test.ts:743` test: 'Shift+Right extends existing forward selection past consecutive rubies', () => {
- `../lexical/packages/lexical-playground/src/__tests__/unit/RubyNode.test.ts:768` test: 'Shift+Left extends existing backward selection past consecutive rubies', () => {
- `../lexical/packages/lexical-playground/src/__tests__/unit/RubyNode.test.ts:796` describe: 'RubyExtension Shift+arrow — focus on RubyNode (Safari)', () => {
- `../lexical/packages/lexical-playground/src/__tests__/unit/RubyNode.test.ts:831` test: 'Shift+Right with focus on first ruby walks forward past all rubies', () => {
- `../lexical/packages/lexical-playground/src/__tests__/unit/RubyNode.test.ts:858` test: 'Shift+Left with focus on last ruby walks backward past all rubies', () => {
- `../lexical/packages/lexical-playground/src/__tests__/unit/RubyNode.test.ts:884` test: 'Shift+Right from ruby uses safe offset (≥1) to avoid normalization bounce', () => {
- `../lexical/packages/lexical-playground/src/__tests__/unit/RubyNode.test.ts:908` test: 'composing ruby is skipped — Shift+arrow returns false', () => {
- `../lexical/packages/lexical-playground/src/__tests__/unit/RubyNode.test.ts:930` describe: 'RubyExtension arrow — line boundary', () => {
- `../lexical/packages/lexical-playground/src/__tests__/unit/RubyNode.test.ts:954` test: 'Left from text:0 when ruby is first child moves to parent element', () => {
- `../lexical/packages/lexical-playground/src/__tests__/unit/RubyNode.test.ts:984` test: 'Right from text end when ruby is last child moves to parent element', () => {
- `../lexical/packages/lexical-playground/src/__tests__/unit/RubyNode.test.ts:1011` test: 'Shift+Left at paragraph start (ruby first) moves focus to parent:0', () => {
- `../lexical/packages/lexical-playground/src/__tests__/unit/RubyNode.test.ts:1041` test: 'Shift+Right at paragraph end (ruby last) moves focus to parent:childrenSize', () => {
- `../lexical/packages/lexical-playground/src/__tests__/unit/RubyNode.test.ts:1068` test: 'Shift+Right when focus is on ruby and ruby is last child goes to parent', () => {
- `../lexical/packages/lexical-playground/src/__tests__/unit/RubyNode.test.ts:1096` test: 'Shift+Left when focus is on ruby and ruby is first child goes to parent:0', () => {
- `../lexical/packages/lexical-playground/src/__tests__/unit/RubyNode.test.ts:1130` describe: 'RubyExtension backspace', () => {
- `../lexical/packages/lexical-playground/src/__tests__/unit/RubyNode.test.ts:1154` test: 'Backspace at text:0 with preceding ruby removes the ruby', () => {
- `../lexical/packages/lexical-playground/src/__tests__/unit/RubyNode.test.ts:1190` test: 'Backspace at text offset > 0 does not remove ruby', () => {
- `../lexical/packages/lexical-playground/src/__tests__/unit/RubyNode.test.ts:1212` test: 'Backspace with non-collapsed selection is not handled by ruby', () => {
- `../lexical/packages/lexical-playground/src/__tests__/unit/RubyNode.test.ts:1234` test: 'Backspace at text:0 when prev is not ruby is not handled', () => {
- `../lexical/packages/lexical-playground/src/__tests__/unit/RubyNode.test.ts:1256` test: 'Backspace at parent-end element point removes the preceding ruby', () => {
- `../lexical/packages/lexical-playground/src/__tests__/unit/RubyNode.test.ts:1295` test: 'Backspace at element point whose previous child is not a ruby is not handled', () => {
- `../lexical/packages/lexical-playground/src/__tests__/unit/RubyNode.test.ts:1320` describe: 'RubyExtension arrow — guard conditions', () => {
- `../lexical/packages/lexical-playground/src/__tests__/unit/RubyNode.test.ts:1360` test: [
- `../lexical/packages/lexical-playground/src/__tests__/unit/RubyNode.test.ts:1374` test: 'Non-collapsed selection without shift — arrow does not skip ruby', () => {
- `../lexical/packages/lexical-playground/src/__tests__/unit/RubyNode.test.ts:1394` test: 'Arrow at text middle (not at boundary) does not skip ruby', () => {
- `../lexical/packages/lexical-playground/src/__tests__/unit/RubyNode.test.ts:1418` describe: 'RubyExtension arrow — element points', () => {
- `../lexical/packages/lexical-playground/src/__tests__/unit/RubyNode.test.ts:1452` test: 'Arrow right at parent-end element point (ruby last) is not handled', () => {
- `../lexical/packages/lexical-playground/src/__tests__/unit/RubyNode.test.ts:1477` test: 'Arrow left at parent-start element point (ruby first) is not handled', () => {
- `../lexical/packages/lexical-playground/src/__tests__/unit/RubyNode.test.ts:1500` test: 'Arrow left from parent-end element point skips back over the ruby', () => {
- `../lexical/packages/lexical-playground/src/__tests__/unit/RubyNode.test.ts:1537` test: 'Shift+Right from element point before consecutive rubies extends past the chain', () => {
- `../lexical/packages/lexical-playground/src/__tests__/unit/RubyNode.test.ts:1580` describe: 'RubyImportRule — HTML <ruby> import', () => {
- `../lexical/packages/lexical-playground/src/__tests__/unit/RubyNode.test.ts:1637` test: 'basic <ruby> with <rt>', () => {
- `../lexical/packages/lexical-playground/src/__tests__/unit/RubyNode.test.ts:1644` test: '<ruby> with <rp> tags (graceful skip)', () => {
- `../lexical/packages/lexical-playground/src/__tests__/unit/RubyNode.test.ts:1653` test: 'multi-segment ruby', () => {
- `../lexical/packages/lexical-playground/src/__tests__/unit/RubyNode.test.ts:1661` test: 'trailing text without <rt> becomes TextNode', () => {
- `../lexical/packages/lexical-playground/src/__tests__/unit/RubyNode.test.ts:1669` test: 'empty <rt> produces empty annotation', () => {

## `../lexical/packages/lexical-react/src/__tests__/browser/LexicalExtensionComposer.test.tsx`

category: portable-mixed
family: portable editor behavior
target: indexed; target current Plite package proof and browser proof when DOM-dependent

- `../lexical/packages/lexical-react/src/__tests__/browser/LexicalExtensionComposer.test.tsx:51` describe: 'LexicalExtensionComposer (browser)', () => {
- `../lexical/packages/lexical-react/src/__tests__/browser/LexicalExtensionComposer.test.tsx:52` test: 'renders a real contentEditable with the initial editor state', () => {

## `../lexical/packages/lexical-react/src/__tests__/unit/CollaborationConcurrentReconcile.test.ts`

category: portable-mixed
family: portable editor behavior
target: indexed; target current Plite package proof and browser proof when DOM-dependent

- `../lexical/packages/lexical-react/src/__tests__/unit/CollaborationConcurrentReconcile.test.ts:118` test: which is what we want without the fix).
- `../lexical/packages/lexical-react/src/__tests__/unit/CollaborationConcurrentReconcile.test.ts:292` describe: 'Concurrent collaborative reconciliation does not crash', () => {
- `../lexical/packages/lexical-react/src/__tests__/unit/CollaborationConcurrentReconcile.test.ts:293` it: 'survives a remove racing a text edit (syncChildrenFromYjs)', async () => {
- `../lexical/packages/lexical-react/src/__tests__/unit/CollaborationConcurrentReconcile.test.ts:310` it: 'survives an undo referencing a deleted shared type (type attribute)', async () => {

## `../lexical/packages/lexical-react/src/__tests__/unit/CollaborationLocalEditAfterRemoteSync.test.ts`

category: portable-mixed
family: portable editor behavior
target: indexed; target current Plite package proof and browser proof when DOM-dependent

- `../lexical/packages/lexical-react/src/__tests__/unit/CollaborationLocalEditAfterRemoteSync.test.ts:10` test: found by fuzzing) for a collaborative desync where a local
- `../lexical/packages/lexical-react/src/__tests__/unit/CollaborationLocalEditAfterRemoteSync.test.ts:271` describe: 'Local edits after a no-op remote sync stay in sync with Yjs', () => {
- `../lexical/packages/lexical-react/src/__tests__/unit/CollaborationLocalEditAfterRemoteSync.test.ts:272` it: 'a paragraph removal that follows a no-op remote sync is persisted', async () => {

## `../lexical/packages/lexical-react/src/__tests__/unit/CollaborationUndoEcho.test.ts`

category: portable-mixed
family: portable editor behavior
target: indexed; target current Plite package proof and browser proof when DOM-dependent

- `../lexical/packages/lexical-react/src/__tests__/unit/CollaborationUndoEcho.test.ts:242` describe: 'Collaborative undo empty-paragraph echo (#8651)', () => {
- `../lexical/packages/lexical-react/src/__tests__/unit/CollaborationUndoEcho.test.ts:243` it: 'does not echo a recovery paragraph into the shared document', async () => {

## `../lexical/packages/lexical-react/src/__tests__/unit/useLexicalAriaLiveRegion.test.tsx`

category: portable-mixed
family: portable editor behavior
target: indexed; target current Plite package proof and browser proof when DOM-dependent

- `../lexical/packages/lexical-react/src/__tests__/unit/useLexicalAriaLiveRegion.test.tsx:64` describe: 'useLexicalAriaLiveRegion', () => {
- `../lexical/packages/lexical-react/src/__tests__/unit/useLexicalAriaLiveRegion.test.tsx:90` test: 'mounts an aria-live region with polite default and aria-atomic', () => {
- `../lexical/packages/lexical-react/src/__tests__/unit/useLexicalAriaLiveRegion.test.tsx:105` test: 'writes a message into the region when announce is called', () => {
- `../lexical/packages/lexical-react/src/__tests__/unit/useLexicalAriaLiveRegion.test.tsx:120` test: 'repeating the same message toggles a zero-width space so SR re-announces', () => {
- `../lexical/packages/lexical-react/src/__tests__/unit/useLexicalAriaLiveRegion.test.tsx:139` test: 'politeness=assertive sets aria-live="assertive"', () => {

## `../lexical/packages/lexical-react/src/__tests__/unit/useLexicalFocusManagerRef.test.tsx`

category: portable-mixed
family: portable editor behavior
target: indexed; target current Plite package proof and browser proof when DOM-dependent

- `../lexical/packages/lexical-react/src/__tests__/unit/useLexicalFocusManagerRef.test.tsx:79` describe: 'useLexicalFocusManagerRef', () => {
- `../lexical/packages/lexical-react/src/__tests__/unit/useLexicalFocusManagerRef.test.tsx:104` test: 'Alt+F10 inside the editor focuses the first toolbar item', () => {
- `../lexical/packages/lexical-react/src/__tests__/unit/useLexicalFocusManagerRef.test.tsx:121` test: 'Alt+F10 without Alt modifier is a no-op', () => {
- `../lexical/packages/lexical-react/src/__tests__/unit/useLexicalFocusManagerRef.test.tsx:138` test: 'Escape inside the toolbar returns focus to the editor', () => {

## `../lexical/packages/lexical-react/src/__tests__/unit/useLexicalFocusTrapRef.test.tsx`

category: portable-mixed
family: portable editor behavior
target: indexed; target current Plite package proof and browser proof when DOM-dependent

- `../lexical/packages/lexical-react/src/__tests__/unit/useLexicalFocusTrapRef.test.tsx:59` describe: 'useLexicalFocusTrapRef', () => {
- `../lexical/packages/lexical-react/src/__tests__/unit/useLexicalFocusTrapRef.test.tsx:84` test: 'focuses the first focusable element on activate', () => {
- `../lexical/packages/lexical-react/src/__tests__/unit/useLexicalFocusTrapRef.test.tsx:95` test: 'wraps Tab from the last focusable back to the first', () => {
- `../lexical/packages/lexical-react/src/__tests__/unit/useLexicalFocusTrapRef.test.tsx:113` test: 'wraps Shift+Tab from the first focusable back to the last', () => {
- `../lexical/packages/lexical-react/src/__tests__/unit/useLexicalFocusTrapRef.test.tsx:130` test: 'deactivates the trap when isActive becomes false', () => {
- `../lexical/packages/lexical-react/src/__tests__/unit/useLexicalFocusTrapRef.test.tsx:156` test: 'deactivates the trap on unmount', () => {
- `../lexical/packages/lexical-react/src/__tests__/unit/useLexicalFocusTrapRef.test.tsx:178` test: 'no-op when isActive is false', () => {
- `../lexical/packages/lexical-react/src/__tests__/unit/useLexicalFocusTrapRef.test.tsx:193` test: 'handles an empty container by preventing Tab without throwing', () => {
- `../lexical/packages/lexical-react/src/__tests__/unit/useLexicalFocusTrapRef.test.tsx:208` test: "focuses the container itself when initialFocus is 'container'", () => {
- `../lexical/packages/lexical-react/src/__tests__/unit/useLexicalFocusTrapRef.test.tsx:219` test: "Tab from container (initialFocus 'container') lands on first focusable", () => {
- `../lexical/packages/lexical-react/src/__tests__/unit/useLexicalFocusTrapRef.test.tsx:232` test: "Shift+Tab from container (initialFocus 'container') lands on last focusable", () => {
- `../lexical/packages/lexical-react/src/__tests__/unit/useLexicalFocusTrapRef.test.tsx:245` test: 'advances Tab through middle focusables', () => {
- `../lexical/packages/lexical-react/src/__tests__/unit/useLexicalFocusTrapRef.test.tsx:261` test: 'advances Shift+Tab through middle focusables', () => {
- `../lexical/packages/lexical-react/src/__tests__/unit/useLexicalFocusTrapRef.test.tsx:277` test: 'focusin safety net pulls focus back inside when it escapes', () => {
- `../lexical/packages/lexical-react/src/__tests__/unit/useLexicalFocusTrapRef.test.tsx:295` test: 'allowOutside lets a matching element keep focus (no pull-back)', () => {

## `../lexical/packages/lexical-react/src/__tests__/unit/useLexicalRovingTabIndexRef.test.tsx`

category: portable-mixed
family: portable editor behavior
target: indexed; target current Plite package proof and browser proof when DOM-dependent

- `../lexical/packages/lexical-react/src/__tests__/unit/useLexicalRovingTabIndexRef.test.tsx:52` describe: 'useLexicalRovingTabIndexRef', () => {
- `../lexical/packages/lexical-react/src/__tests__/unit/useLexicalRovingTabIndexRef.test.tsx:77` test: 'sets tabindex=0 on the first item, -1 on the rest', () => {
- `../lexical/packages/lexical-react/src/__tests__/unit/useLexicalRovingTabIndexRef.test.tsx:90` test: 'ArrowRight moves focus to the next item and updates tabindex', () => {
- `../lexical/packages/lexical-react/src/__tests__/unit/useLexicalRovingTabIndexRef.test.tsx:107` test: 'ArrowLeft wraps from the first item to the last', () => {
- `../lexical/packages/lexical-react/src/__tests__/unit/useLexicalRovingTabIndexRef.test.tsx:122` test: 'ArrowRight wraps from the last item to the first', () => {
- `../lexical/packages/lexical-react/src/__tests__/unit/useLexicalRovingTabIndexRef.test.tsx:137` test: 'Home jumps to the first item, End to the last', () => {
- `../lexical/packages/lexical-react/src/__tests__/unit/useLexicalRovingTabIndexRef.test.tsx:154` test: 'vertical orientation ignores ArrowLeft/Right', () => {
- `../lexical/packages/lexical-react/src/__tests__/unit/useLexicalRovingTabIndexRef.test.tsx:171` test: 're-registers with new options when deps change but the node stays mounted', () => {
- `../lexical/packages/lexical-react/src/__tests__/unit/useLexicalRovingTabIndexRef.test.tsx:212` test: 'does nothing when the group is empty', () => {

## `../lexical/packages/lexical-react/src/__tests__/unit/useMenuAnchorRef.shadow.test.tsx`

category: portable-mixed
family: portable editor behavior
target: indexed; target current Plite package proof and browser proof when DOM-dependent

- `../lexical/packages/lexical-react/src/__tests__/unit/useMenuAnchorRef.shadow.test.tsx:25` describe: 'useMenuAnchorRef shadow DOM', () => {
- `../lexical/packages/lexical-react/src/__tests__/unit/useMenuAnchorRef.shadow.test.tsx:53` it: 'appends anchor to the shadow root when no explicit parent is provided', async () => {
- `../lexical/packages/lexical-react/src/__tests__/unit/useMenuAnchorRef.shadow.test.tsx:72` it: 'removes anchor from shadow root on unmount', async () => {
- `../lexical/packages/lexical-react/src/__tests__/unit/useMenuAnchorRef.shadow.test.tsx:95` it: 'uses explicit parent even when editor is in shadow', async () => {

## `../lexical/packages/lexical-rich-text/src/__tests__/unit/EscapeFormatTriggers.test.ts`

category: portable
family: portable editor behavior
target: indexed; target current Plite package proof and browser proof when DOM-dependent

- `../lexical/packages/lexical-rich-text/src/__tests__/unit/EscapeFormatTriggers.test.ts:57` describe: 'RichTextExtension escapeFormatTriggers', () => {
- `../lexical/packages/lexical-rich-text/src/__tests__/unit/EscapeFormatTriggers.test.ts:86` describe: 'CLICK_COMMAND', () => {
- `../lexical/packages/lexical-rich-text/src/__tests__/unit/EscapeFormatTriggers.test.ts:87` test: 'clears format when clicking at the end of a code node with no next sibling', () => {
- `../lexical/packages/lexical-rich-text/src/__tests__/unit/EscapeFormatTriggers.test.ts:103` test: 'clears format when clicking at the start of a code node with no previous sibling', () => {
- `../lexical/packages/lexical-rich-text/src/__tests__/unit/EscapeFormatTriggers.test.ts:119` test: 'does not clear format when clicking in the middle of a code node', () => {
- `../lexical/packages/lexical-rich-text/src/__tests__/unit/EscapeFormatTriggers.test.ts:134` test: 'does not clear format at end of code node when it has a next sibling', () => {
- `../lexical/packages/lexical-rich-text/src/__tests__/unit/EscapeFormatTriggers.test.ts:153` describe: 'KEY_ENTER_COMMAND', () => {
- `../lexical/packages/lexical-rich-text/src/__tests__/unit/EscapeFormatTriggers.test.ts:154` test: 'clears format when pressing Enter at the end of a code node', () => {
- `../lexical/packages/lexical-rich-text/src/__tests__/unit/EscapeFormatTriggers.test.ts:170` test: 'clears format when pressing Enter at the start of a code node', () => {
- `../lexical/packages/lexical-rich-text/src/__tests__/unit/EscapeFormatTriggers.test.ts:186` test: 'preserves code format when pressing Enter in the middle of a code node', () => {
- `../lexical/packages/lexical-rich-text/src/__tests__/unit/EscapeFormatTriggers.test.ts:202` describe: 'KEY_ARROW_RIGHT_COMMAND', () => {
- `../lexical/packages/lexical-rich-text/src/__tests__/unit/EscapeFormatTriggers.test.ts:203` test: 'clears format when arrowing right at the end of a code node', () => {
- `../lexical/packages/lexical-rich-text/src/__tests__/unit/EscapeFormatTriggers.test.ts:220` test: 'does not clear format when shift is held (extending selection)', () => {
- `../lexical/packages/lexical-rich-text/src/__tests__/unit/EscapeFormatTriggers.test.ts:239` test: 'does not clear format in the middle of a code node', () => {
- `../lexical/packages/lexical-rich-text/src/__tests__/unit/EscapeFormatTriggers.test.ts:256` describe: 'KEY_ARROW_LEFT_COMMAND', () => {
- `../lexical/packages/lexical-rich-text/src/__tests__/unit/EscapeFormatTriggers.test.ts:257` test: 'clears format when arrowing left at the start of a code node', () => {
- `../lexical/packages/lexical-rich-text/src/__tests__/unit/EscapeFormatTriggers.test.ts:274` test: 'does not clear format when shift is held (extending selection)', () => {
- `../lexical/packages/lexical-rich-text/src/__tests__/unit/EscapeFormatTriggers.test.ts:293` test: 'does not clear format in the middle of a code node', () => {
- `../lexical/packages/lexical-rich-text/src/__tests__/unit/EscapeFormatTriggers.test.ts:311` describe: 'RichTextExtension default capitalization reset', () => {
- `../lexical/packages/lexical-rich-text/src/__tests__/unit/EscapeFormatTriggers.test.ts:313` describe: `${format} format`, () => {
- `../lexical/packages/lexical-rich-text/src/__tests__/unit/EscapeFormatTriggers.test.ts:338` test: `clears on ${COMMAND.type}`, () => {
- `../lexical/packages/lexical-rich-text/src/__tests__/unit/EscapeFormatTriggers.test.ts:354` describe: 'RichTextExtension escapeFormatTriggers mergeConfig', () => {
- `../lexical/packages/lexical-rich-text/src/__tests__/unit/EscapeFormatTriggers.test.ts:379` test: 'overriding one format preserves default capitalization resets', () => {
- `../lexical/packages/lexical-rich-text/src/__tests__/unit/EscapeFormatTriggers.test.ts:393` test: 'null disables a default format', () => {
- `../lexical/packages/lexical-rich-text/src/__tests__/unit/EscapeFormatTriggers.test.ts:407` test: 'escapeFormatTriggers can be modified as a signal', () => {

## `../lexical/packages/lexical-rich-text/src/__tests__/unit/LexicalHeadingNode.test.ts`

category: portable
family: core package behavior
target: indexed 11 test/describe lines; target packages/plite/test; add focused browser proof only when behavior depends on DOM/runtime transport

- `../lexical/packages/lexical-rich-text/src/__tests__/unit/LexicalHeadingNode.test.ts:55` describe: 'LexicalHeadingNode tests', () => {
- `../lexical/packages/lexical-rich-text/src/__tests__/unit/LexicalHeadingNode.test.ts:57` test: 'HeadingNode.constructor', async () => {
- `../lexical/packages/lexical-rich-text/src/__tests__/unit/LexicalHeadingNode.test.ts:68` test: 'HeadingNode.createDOM()', async () => {
- `../lexical/packages/lexical-rich-text/src/__tests__/unit/LexicalHeadingNode.test.ts:92` test: 'HeadingNode.updateDOM()', async () => {
- `../lexical/packages/lexical-rich-text/src/__tests__/unit/LexicalHeadingNode.test.ts:118` test: 'HeadingNode.insertNewAfter() empty', async () => {
- `../lexical/packages/lexical-rich-text/src/__tests__/unit/LexicalHeadingNode.test.ts:140` test: 'HeadingNode.insertNewAfter() middle', async () => {
- `../lexical/packages/lexical-rich-text/src/__tests__/unit/LexicalHeadingNode.test.ts:164` test: 'HeadingNode.insertNewAfter() end', async () => {
- `../lexical/packages/lexical-rich-text/src/__tests__/unit/LexicalHeadingNode.test.ts:190` test: 'HeadingNode.setTag()', async () => {
- `../lexical/packages/lexical-rich-text/src/__tests__/unit/LexicalHeadingNode.test.ts:220` test: '$createHeadingNode()', async () => {
- `../lexical/packages/lexical-rich-text/src/__tests__/unit/LexicalHeadingNode.test.ts:231` test: '$isHeadingNode()', async () => {
- `../lexical/packages/lexical-rich-text/src/__tests__/unit/LexicalHeadingNode.test.ts:239` test: 'creates a h2 with text and can insert a new paragraph after', async () => {
- `../lexical/packages/lexical-rich-text/src/__tests__/unit/LexicalHeadingNode.test.ts:265` describe: 'Backspace at start of heading (#4359)', () => {
- `../lexical/packages/lexical-rich-text/src/__tests__/unit/LexicalHeadingNode.test.ts:403` test: 'HeadingNode.collapseAtStart preserves a non-empty heading', () => {
- `../lexical/packages/lexical-rich-text/src/__tests__/unit/LexicalHeadingNode.test.ts:429` test: 'preserves heading wrapped inside another ElementNode', () => {
- `../lexical/packages/lexical-rich-text/src/__tests__/unit/LexicalHeadingNode.test.ts:459` test: 'preserves heading when followed by a non-paragraph sibling', () => {
- `../lexical/packages/lexical-rich-text/src/__tests__/unit/LexicalHeadingNode.test.ts:487` test: 'HeadingNode.collapseAtStart converts an empty heading to a paragraph', () => {

## `../lexical/packages/lexical-rich-text/src/__tests__/unit/LexicalQuoteNode.test.ts`

category: portable
family: core package behavior
target: indexed 6 test/describe lines; target packages/plite/test; add focused browser proof only when behavior depends on DOM/runtime transport

- `../lexical/packages/lexical-rich-text/src/__tests__/unit/LexicalQuoteNode.test.ts:21` describe: 'LexicalQuoteNode tests', () => {
- `../lexical/packages/lexical-rich-text/src/__tests__/unit/LexicalQuoteNode.test.ts:23` test: 'QuoteNode.constructor', async () => {
- `../lexical/packages/lexical-rich-text/src/__tests__/unit/LexicalQuoteNode.test.ts:33` test: 'QuoteNode.createDOM()', async () => {
- `../lexical/packages/lexical-rich-text/src/__tests__/unit/LexicalQuoteNode.test.ts:49` test: 'QuoteNode.updateDOM()', async () => {
- `../lexical/packages/lexical-rich-text/src/__tests__/unit/LexicalQuoteNode.test.ts:70` test: 'QuoteNode.insertNewAfter()', async () => {
- `../lexical/packages/lexical-rich-text/src/__tests__/unit/LexicalQuoteNode.test.ts:91` test: '$createQuoteNode()', async () => {

## `../lexical/packages/lexical-rich-text/src/__tests__/unit/LexicalTabNode.test.ts`

category: portable
family: clipboard-paste / browser-engine
target: indexed 3 test/describe lines; target packages/plite/test/clipboard-contract.ts; packages/plite-dom/test/clipboard-boundary.test.ts; apps/www/tests/plite-browser/donor/examples/paste-html.test.ts; apps/www/tests/plite-browser/donor/stress/generated-editing.test.ts

- `../lexical/packages/lexical-rich-text/src/__tests__/unit/LexicalTabNode.test.ts:23` describe: 'LexicalTabNode tests', () => {
- `../lexical/packages/lexical-rich-text/src/__tests__/unit/LexicalTabNode.test.ts:25` test: 'INSERT_TAB_COMMAND applies selection format and style to TabNode', async () => {
- `../lexical/packages/lexical-rich-text/src/__tests__/unit/LexicalTabNode.test.ts:58` test: 'format preserved when typing between tabs inserted in bold text', async () => {

## `../lexical/packages/lexical-rich-text/src/__tests__/unit/QuoteNodeShadowRoot.test.ts`

category: portable
family: portable editor behavior
target: indexed; target current Plite package proof and browser proof when DOM-dependent

- `../lexical/packages/lexical-rich-text/src/__tests__/unit/QuoteNodeShadowRoot.test.ts:33` describe: 'QuoteNode shadow root opt-in', () => {
- `../lexical/packages/lexical-rich-text/src/__tests__/unit/QuoteNodeShadowRoot.test.ts:34` test: 'isShadowRoot() defaults to false and serializes nothing', () => {
- `../lexical/packages/lexical-rich-text/src/__tests__/unit/QuoteNodeShadowRoot.test.ts:46` test: 'opt-in with $createQuoteNode and setIsShadowRoot', () => {
- `../lexical/packages/lexical-rich-text/src/__tests__/unit/QuoteNodeShadowRoot.test.ts:63` test: 'shadow root round-trips through JSON', () => {
- `../lexical/packages/lexical-rich-text/src/__tests__/unit/QuoteNodeShadowRoot.test.ts:79` test: 'collapseAtStart() lifts blocks out of a shadow root quote', () => {
- `../lexical/packages/lexical-rich-text/src/__tests__/unit/QuoteNodeShadowRoot.test.ts:100` test: 'getTopLevelElement() stops at a shadow root quote', () => {

## `../lexical/packages/lexical-rich-text/src/__tests__/unit/RichTextBlockCursorShadowRoot.test.ts`

category: portable
family: portable editor behavior
target: indexed; target current Plite package proof and browser proof when DOM-dependent

- `../lexical/packages/lexical-rich-text/src/__tests__/unit/RichTextBlockCursorShadowRoot.test.ts:84` describe: '$exitNodeSelectionToward — decorator → block cursor beside shadow root (#8736)', () => {
- `../lexical/packages/lexical-rich-text/src/__tests__/unit/RichTextBlockCursorShadowRoot.test.ts:85` test: [
- `../lexical/packages/lexical-rich-text/src/__tests__/unit/RichTextBlockCursorShadowRoot.test.ts:119` describe: '$tryEnterFromBlockCursor — block cursor → enter shadow root (#8736)', () => {
- `../lexical/packages/lexical-rich-text/src/__tests__/unit/RichTextBlockCursorShadowRoot.test.ts:120` test: 'ArrowRight from block cursor before shadow root enters at selectStart', () => {
- `../lexical/packages/lexical-rich-text/src/__tests__/unit/RichTextBlockCursorShadowRoot.test.ts:151` test: 'ArrowDown from block cursor before shadow root enters at selectStart', () => {
- `../lexical/packages/lexical-rich-text/src/__tests__/unit/RichTextBlockCursorShadowRoot.test.ts:177` test: 'ArrowUp from block cursor after shadow root enters at selectEnd', () => {
- `../lexical/packages/lexical-rich-text/src/__tests__/unit/RichTextBlockCursorShadowRoot.test.ts:203` test: 'ArrowLeft from block cursor after shadow root enters at selectEnd', () => {
- `../lexical/packages/lexical-rich-text/src/__tests__/unit/RichTextBlockCursorShadowRoot.test.ts:232` describe: '$tryExitShadowRootToBlockCursor — shadow root → block cursor (#8736)', () => {
- `../lexical/packages/lexical-rich-text/src/__tests__/unit/RichTextBlockCursorShadowRoot.test.ts:233` test: 'ArrowLeft at start of shadow root exits to block cursor before it', () => {
- `../lexical/packages/lexical-rich-text/src/__tests__/unit/RichTextBlockCursorShadowRoot.test.ts:259` test: 'ArrowUp at start of shadow root exits to block cursor before it', () => {
- `../lexical/packages/lexical-rich-text/src/__tests__/unit/RichTextBlockCursorShadowRoot.test.ts:285` test: 'ArrowDown at end of shadow root exits to block cursor after it', () => {
- `../lexical/packages/lexical-rich-text/src/__tests__/unit/RichTextBlockCursorShadowRoot.test.ts:313` test: 'ArrowRight at end of shadow root exits to block cursor after it', () => {
- `../lexical/packages/lexical-rich-text/src/__tests__/unit/RichTextBlockCursorShadowRoot.test.ts:345` describe: 'nested shadow root exit (#8736)', () => {
- `../lexical/packages/lexical-rich-text/src/__tests__/unit/RichTextBlockCursorShadowRoot.test.ts:353` test: 'ArrowLeft at start of inner shadow root walks up and exits to block cursor', () => {
- `../lexical/packages/lexical-rich-text/src/__tests__/unit/RichTextBlockCursorShadowRoot.test.ts:397` test: 'ArrowRight at end of inner shadow root walks up and exits to block cursor', () => {
- `../lexical/packages/lexical-rich-text/src/__tests__/unit/RichTextBlockCursorShadowRoot.test.ts:447` describe: 'no block cursor between sibling shadow roots inside a shadow root parent (#8736)', () => {
- `../lexical/packages/lexical-rich-text/src/__tests__/unit/RichTextBlockCursorShadowRoot.test.ts:455` test: 'ArrowLeft at start of sibling shadow root does not produce block cursor', () => {
- `../lexical/packages/lexical-rich-text/src/__tests__/unit/RichTextBlockCursorShadowRoot.test.ts:498` describe: 'full round-trip: decorator → block cursor → shadow root → block cursor → decorator (#8736)', () => {
- `../lexical/packages/lexical-rich-text/src/__tests__/unit/RichTextBlockCursorShadowRoot.test.ts:499` test: 'ArrowRight traversal: decorator → enter shadow root → exit → reach next decorator', () => {

## `../lexical/packages/lexical-rich-text/src/__tests__/unit/RichTextImportExtension.test.ts`

category: portable
family: portable editor behavior
target: indexed; target current Plite package proof and browser proof when DOM-dependent

- `../lexical/packages/lexical-rich-text/src/__tests__/unit/RichTextImportExtension.test.ts:64` describe: 'RichTextImportExtension', () => {
- `../lexical/packages/lexical-rich-text/src/__tests__/unit/RichTextImportExtension.test.ts:65` test: [
- `../lexical/packages/lexical-rich-text/src/__tests__/unit/RichTextImportExtension.test.ts:82` test: 'blockquote imports as quote', () => {
- `../lexical/packages/lexical-rich-text/src/__tests__/unit/RichTextImportExtension.test.ts:92` test: 'blockquote does not import as a shadow root by default', () => {
- `../lexical/packages/lexical-rich-text/src/__tests__/unit/RichTextImportExtension.test.ts:102` test: 'ShadowRootQuoteRule imports blockquote as a shadow root quote', () => {
- `../lexical/packages/lexical-rich-text/src/__tests__/unit/RichTextImportExtension.test.ts:126` test: 'ShadowRootQuoteRule wraps bare inline content in a paragraph', () => {
- `../lexical/packages/lexical-rich-text/src/__tests__/unit/RichTextImportExtension.test.ts:148` test: 'Google Docs title (26pt span) promoted to h1', () => {
- `../lexical/packages/lexical-rich-text/src/__tests__/unit/RichTextImportExtension.test.ts:159` test: 'deprecated RichTextImportExtension alias still imports headings', () => {

## `../lexical/packages/lexical-rich-text/src/__tests__/unit/RichTextInlineDecoratorMoveToEnd.test.ts`

category: portable
family: selection-dom-mapping / nested-root
target: indexed; target current Plite package proof and browser proof when DOM-dependent

- `../lexical/packages/lexical-rich-text/src/__tests__/unit/RichTextInlineDecoratorMoveToEnd.test.ts:48` describe: 'MOVE_TO_END on a leading inline DecoratorNode (Issue #8555)', () => {
- `../lexical/packages/lexical-rich-text/src/__tests__/unit/RichTextInlineDecoratorMoveToEnd.test.ts:49` test: 'Cmd+ArrowRight at offset 0 moves caret past the inline decorator', () => {
- `../lexical/packages/lexical-rich-text/src/__tests__/unit/RichTextInlineDecoratorMoveToEnd.test.ts:74` test: 'Shift+Cmd+ArrowRight at offset 0 selects to end of element', () => {
- `../lexical/packages/lexical-rich-text/src/__tests__/unit/RichTextInlineDecoratorMoveToEnd.test.ts:100` test: 'Same fix applies inside HeadingNode', () => {
- `../lexical/packages/lexical-rich-text/src/__tests__/unit/RichTextInlineDecoratorMoveToEnd.test.ts:125` describe: 'MOVE_TO_END no-op cases (Issue #8555)', () => {
- `../lexical/packages/lexical-rich-text/src/__tests__/unit/RichTextInlineDecoratorMoveToEnd.test.ts:126` test: [
- `../lexical/packages/lexical-rich-text/src/__tests__/unit/RichTextInlineDecoratorMoveToEnd.test.ts:172` describe: 'MOVE_TO_END with no trailing text (Issue #8601)', () => {
- `../lexical/packages/lexical-rich-text/src/__tests__/unit/RichTextInlineDecoratorMoveToEnd.test.ts:173` test: 'Cmd+ArrowRight on decorator-only element moves caret past the last child', () => {
- `../lexical/packages/lexical-rich-text/src/__tests__/unit/RichTextInlineDecoratorMoveToEnd.test.ts:199` test: 'Shift+Cmd+ArrowRight on decorator-only element selects past the last child', () => {
- `../lexical/packages/lexical-rich-text/src/__tests__/unit/RichTextInlineDecoratorMoveToEnd.test.ts:228` test: 'Cmd+ArrowRight on [decorator][text][decorator] sandwich moves caret past the trailing decorator', () => {
- `../lexical/packages/lexical-rich-text/src/__tests__/unit/RichTextInlineDecoratorMoveToEnd.test.ts:261` describe: 'MOVE_TO_END on a NodeSelection (Issue #8604)', () => {
- `../lexical/packages/lexical-rich-text/src/__tests__/unit/RichTextInlineDecoratorMoveToEnd.test.ts:262` test: [

## `../lexical/packages/lexical-rich-text/src/__tests__/unit/RichTextInlineDecoratorMoveToStart.test.ts`

category: portable
family: selection-dom-mapping / nested-root
target: indexed; target current Plite package proof and browser proof when DOM-dependent

- `../lexical/packages/lexical-rich-text/src/__tests__/unit/RichTextInlineDecoratorMoveToStart.test.ts:48` describe: 'MOVE_TO_START on a leading inline DecoratorNode (Issue #8555)', () => {
- `../lexical/packages/lexical-rich-text/src/__tests__/unit/RichTextInlineDecoratorMoveToStart.test.ts:49` test: 'Cmd+ArrowLeft from text caret moves caret before the inline decorator', () => {
- `../lexical/packages/lexical-rich-text/src/__tests__/unit/RichTextInlineDecoratorMoveToStart.test.ts:74` test: 'Shift+Cmd+ArrowLeft selects from text caret back to element start', () => {
- `../lexical/packages/lexical-rich-text/src/__tests__/unit/RichTextInlineDecoratorMoveToStart.test.ts:101` test: 'Same fix applies inside HeadingNode', () => {
- `../lexical/packages/lexical-rich-text/src/__tests__/unit/RichTextInlineDecoratorMoveToStart.test.ts:127` describe: 'MOVE_TO_START no-op cases (Issue #8555)', () => {
- `../lexical/packages/lexical-rich-text/src/__tests__/unit/RichTextInlineDecoratorMoveToStart.test.ts:128` test: [
- `../lexical/packages/lexical-rich-text/src/__tests__/unit/RichTextInlineDecoratorMoveToStart.test.ts:174` describe: 'MOVE_TO_START with no leading text (Issue #8601)', () => {
- `../lexical/packages/lexical-rich-text/src/__tests__/unit/RichTextInlineDecoratorMoveToStart.test.ts:175` test: 'Cmd+ArrowLeft on decorator-only element moves caret to element offset 0', () => {
- `../lexical/packages/lexical-rich-text/src/__tests__/unit/RichTextInlineDecoratorMoveToStart.test.ts:201` test: 'Cmd+ArrowLeft from text caret inside [decorator][text][decorator] moves to element offset 0', () => {
- `../lexical/packages/lexical-rich-text/src/__tests__/unit/RichTextInlineDecoratorMoveToStart.test.ts:233` test: 'Shift+Cmd+ArrowLeft from text caret inside [decorator][text][decorator] selects back to element offset 0', () => {
- `../lexical/packages/lexical-rich-text/src/__tests__/unit/RichTextInlineDecoratorMoveToStart.test.ts:268` describe: 'MOVE_TO_START on a NodeSelection (Issue #8604)', () => {
- `../lexical/packages/lexical-rich-text/src/__tests__/unit/RichTextInlineDecoratorMoveToStart.test.ts:269` test: [

## `../lexical/packages/lexical-rich-text/src/__tests__/unit/RichTextNodeSelectionBackspace.test.ts`

category: portable
family: selection-dom-mapping / nested-root
target: indexed; target current Plite package proof and browser proof when DOM-dependent

- `../lexical/packages/lexical-rich-text/src/__tests__/unit/RichTextNodeSelectionBackspace.test.ts:50` describe: 'KEY_BACKSPACE_COMMAND on a single-decorator NodeSelection', () => {
- `../lexical/packages/lexical-rich-text/src/__tests__/unit/RichTextNodeSelectionBackspace.test.ts:56` test: 'block decorator: deletes the node', () => {
- `../lexical/packages/lexical-rich-text/src/__tests__/unit/RichTextNodeSelectionBackspace.test.ts:92` describe: 'KEY_DELETE_COMMAND on a single-decorator NodeSelection', () => {
- `../lexical/packages/lexical-rich-text/src/__tests__/unit/RichTextNodeSelectionBackspace.test.ts:96` test: 'block decorator: deletes the node', () => {

## `../lexical/packages/lexical-rich-text/src/__tests__/unit/RichTextNodeSelectionEnter.test.ts`

category: portable
family: selection-dom-mapping / nested-root
target: indexed; target current Plite package proof and browser proof when DOM-dependent

- `../lexical/packages/lexical-rich-text/src/__tests__/unit/RichTextNodeSelectionEnter.test.ts:43` describe: 'KEY_ENTER_COMMAND on a single-decorator NodeSelection', () => {
- `../lexical/packages/lexical-rich-text/src/__tests__/unit/RichTextNodeSelectionEnter.test.ts:44` test: 'block decorator: inserts a paragraph after it and moves the caret', () => {
- `../lexical/packages/lexical-rich-text/src/__tests__/unit/RichTextNodeSelectionEnter.test.ts:61` test: 'inline decorator: no-op', () => {

## `../lexical/packages/lexical-selection/src/__tests__/browser/dedupeSelectionRectsUnderpaint.test.ts`

category: portable
family: selection-dom-mapping / nested-root
target: indexed; target current Plite package proof and browser proof when DOM-dependent

- `../lexical/packages/lexical-selection/src/__tests__/browser/dedupeSelectionRectsUnderpaint.test.ts:65` describe: 'dedupeSelectionRects under-paints real content for overlapping inline boxes', () => {
- `../lexical/packages/lexical-selection/src/__tests__/browser/dedupeSelectionRectsUnderpaint.test.ts:66` it: 'drops the wider rect that uniquely covers part of the selection', () => {

## `../lexical/packages/lexical-selection/src/__tests__/unit/$sliceSelectedTextNodeContent.test.ts`

category: portable
family: core package behavior
target: indexed 6 test/describe lines; target packages/plite/test; add focused browser proof only when behavior depends on DOM/runtime transport

- `../lexical/packages/lexical-selection/src/__tests__/unit/$sliceSelectedTextNodeContent.test.ts:21` describe: '$sliceSelectedTextNodeContent', () => {
- `../lexical/packages/lexical-selection/src/__tests__/unit/$sliceSelectedTextNodeContent.test.ts:55` describe: 'clone', () => {
- `../lexical/packages/lexical-selection/src/__tests__/unit/$sliceSelectedTextNodeContent.test.ts:56` test: 'does not clone with full selection (both nodes)', () => {
- `../lexical/packages/lexical-selection/src/__tests__/unit/$sliceSelectedTextNodeContent.test.ts:72` test: 'clones only with partial selection (last node)', () => {
- `../lexical/packages/lexical-selection/src/__tests__/unit/$sliceSelectedTextNodeContent.test.ts:95` test: 'clones only with partial selection (first node)', () => {
- `../lexical/packages/lexical-selection/src/__tests__/unit/$sliceSelectedTextNodeContent.test.ts:116` test: 'can slice a node from both sides', () => {

## `../lexical/packages/lexical-selection/src/__tests__/unit/LexicalIsAtEdgeOfElement.test.ts`

category: portable
family: selection-dom-mapping / nested-root
target: indexed; target current Plite package proof and browser proof when DOM-dependent

- `../lexical/packages/lexical-selection/src/__tests__/unit/LexicalIsAtEdgeOfElement.test.ts:47` describe: '$isAtEdgeOfElement', () => {
- `../lexical/packages/lexical-selection/src/__tests__/unit/LexicalIsAtEdgeOfElement.test.ts:48` test: 'text point at the start/end of a block', async () => {
- `../lexical/packages/lexical-selection/src/__tests__/unit/LexicalIsAtEdgeOfElement.test.ts:78` test: 'a sibling between the point and the edge disqualifies it', async () => {
- `../lexical/packages/lexical-selection/src/__tests__/unit/LexicalIsAtEdgeOfElement.test.ts:104` test: 'descends through nested inline elements', async () => {
- `../lexical/packages/lexical-selection/src/__tests__/unit/LexicalIsAtEdgeOfElement.test.ts:130` test: 'an empty element is at both of its edges', async () => {
- `../lexical/packages/lexical-selection/src/__tests__/unit/LexicalIsAtEdgeOfElement.test.ts:147` test: 'element points at the leading/trailing child edge', async () => {
- `../lexical/packages/lexical-selection/src/__tests__/unit/LexicalIsAtEdgeOfElement.test.ts:171` test: 'a point outside the element is never at its edge', async () => {
- `../lexical/packages/lexical-selection/src/__tests__/unit/LexicalIsAtEdgeOfElement.test.ts:193` test: 'resolves against a named slot value (slot boundary)', async () => {

## `../lexical/packages/lexical-selection/src/__tests__/unit/LexicalSelection.test.tsx`

category: portable
family: selection-dom-mapping / void-atom
target: indexed 42 test/describe lines; target packages/plite/test; packages/plite-react/test/editable-behavior.test.tsx; apps/www/tests/plite-browser/donor/stress/generated-editing.test.ts

- `../lexical/packages/lexical-selection/src/__tests__/unit/LexicalSelection.test.tsx:131` describe: 'LexicalSelection tests', () => {
- `../lexical/packages/lexical-selection/src/__tests__/unit/LexicalSelection.test.tsx:234` test: 'Expect initial output to be a block with no text.', () => {
- `../lexical/packages/lexical-selection/src/__tests__/unit/LexicalSelection.test.tsx:240` test: 'Bold format preserved when typing between consecutive line breaks', async () => {
- `../lexical/packages/lexical-selection/src/__tests__/unit/LexicalSelection.test.tsx:300` test: 'Ctrl+Backspace deletes list created by typing "- "', async () => {
- `../lexical/packages/lexical-selection/src/__tests__/unit/LexicalSelection.test.tsx:1301` test: name + ` (#${i + 1})`, async () => {
- `../lexical/packages/lexical-selection/src/__tests__/unit/LexicalSelection.test.tsx:1315` test: 'insert text one selected node element selection', async () => {
- `../lexical/packages/lexical-selection/src/__tests__/unit/LexicalSelection.test.tsx:1342` test: 'getNodes resolves nested block nodes', async () => {
- `../lexical/packages/lexical-selection/src/__tests__/unit/LexicalSelection.test.tsx:1367` describe: 'Block selection moves when new nodes are inserted', () => {
- `../lexical/packages/lexical-selection/src/__tests__/unit/LexicalSelection.test.tsx:1973` describe: 'Selection correctly resolves to a sibling ElementNode when a node is removed', () => {
- `../lexical/packages/lexical-selection/src/__tests__/unit/LexicalSelection.test.tsx:1974` test: '', async () => {
- `../lexical/packages/lexical-selection/src/__tests__/unit/LexicalSelection.test.tsx:2003` describe: 'Selection correctly resolves to a sibling ElementNode when a selected node child is removed', () => {
- `../lexical/packages/lexical-selection/src/__tests__/unit/LexicalSelection.test.tsx:2004` test: '', async () => {
- `../lexical/packages/lexical-selection/src/__tests__/unit/LexicalSelection.test.tsx:2038` describe: 'Selection correctly resolves to a sibling ElementNode that has multiple children with the correct offset when a node is removed', () => {
- `../lexical/packages/lexical-selection/src/__tests__/unit/LexicalSelection.test.tsx:2039` test: '', async () => {
- `../lexical/packages/lexical-selection/src/__tests__/unit/LexicalSelection.test.tsx:2090` test: 'isBackward', async () => {
- `../lexical/packages/lexical-selection/src/__tests__/unit/LexicalSelection.test.tsx:2137` describe: 'Decorator text content for selection', () => {
- `../lexical/packages/lexical-selection/src/__tests__/unit/LexicalSelection.test.tsx:2218` it: name, async () => {
- `../lexical/packages/lexical-selection/src/__tests__/unit/LexicalSelection.test.tsx:2255` describe: 'insertParagraph', () => {
- `../lexical/packages/lexical-selection/src/__tests__/unit/LexicalSelection.test.tsx:2256` test: 'three text nodes at offset 0 on third node', async () => {
- `../lexical/packages/lexical-selection/src/__tests__/unit/LexicalSelection.test.tsx:2301` test: 'four text nodes at offset 0 on third node', async () => {
- `../lexical/packages/lexical-selection/src/__tests__/unit/LexicalSelection.test.tsx:2349` it: 'adjust offset for inline elements text formatting', async () => {
- `../lexical/packages/lexical-selection/src/__tests__/unit/LexicalSelection.test.tsx:2394` describe: 'Node.replace', () => {
- `../lexical/packages/lexical-selection/src/__tests__/unit/LexicalSelection.test.tsx:2449` test: testCase.name, async () => {
- `../lexical/packages/lexical-selection/src/__tests__/unit/LexicalSelection.test.tsx:2468` describe: 'Testing that $getStyleObjectFromRawCSS handles unformatted css text ', () => {
- `../lexical/packages/lexical-selection/src/__tests__/unit/LexicalSelection.test.tsx:2469` test: '', async () => {
- `../lexical/packages/lexical-selection/src/__tests__/unit/LexicalSelection.test.tsx:2523` describe: 'Testing that getStyleObjectFromRawCSS handles values with colons', () => {
- `../lexical/packages/lexical-selection/src/__tests__/unit/LexicalSelection.test.tsx:2524` test: '', async () => {
- `../lexical/packages/lexical-selection/src/__tests__/unit/LexicalSelection.test.tsx:2578` describe: 'Testing that getStyleObjectFromRawCSS handles comments and semicolons inside values', () => {
- `../lexical/packages/lexical-selection/src/__tests__/unit/LexicalSelection.test.tsx:2579` test: '', async () => {
- `../lexical/packages/lexical-selection/src/__tests__/unit/LexicalSelection.test.tsx:2635` describe: '$patchStyle', () => {
- `../lexical/packages/lexical-selection/src/__tests__/unit/LexicalSelection.test.tsx:2636` it: 'should patch the style with the new style object', async () => {
- `../lexical/packages/lexical-selection/src/__tests__/unit/LexicalSelection.test.tsx:2685` it: 'should patch the style with property function', async () => {
- `../lexical/packages/lexical-selection/src/__tests__/unit/LexicalSelection.test.tsx:2740` describe: '$setBlocksType', () => {
- `../lexical/packages/lexical-selection/src/__tests__/unit/LexicalSelection.test.tsx:2741` test: 'Collapsed selection in text', async () => {
- `../lexical/packages/lexical-selection/src/__tests__/unit/LexicalSelection.test.tsx:2780` test: 'Collapsed selection in element', async () => {
- `../lexical/packages/lexical-selection/src/__tests__/unit/LexicalSelection.test.tsx:2815` test: 'Two elements, same top-element', async () => {
- `../lexical/packages/lexical-selection/src/__tests__/unit/LexicalSelection.test.tsx:2854` test: 'Two empty elements, same top-element', async () => {
- `../lexical/packages/lexical-selection/src/__tests__/unit/LexicalSelection.test.tsx:2895` test: 'Two elements, same top-element', async () => {
- `../lexical/packages/lexical-selection/src/__tests__/unit/LexicalSelection.test.tsx:2934` test: 'Collapsed in element inside top-element', async () => {
- `../lexical/packages/lexical-selection/src/__tests__/unit/LexicalSelection.test.tsx:2978` test: 'Collapsed in text inside top-element', async () => {
- `../lexical/packages/lexical-selection/src/__tests__/unit/LexicalSelection.test.tsx:3022` test: 'Full editor selection with a mix of top-elements', async () => {
- `../lexical/packages/lexical-selection/src/__tests__/unit/LexicalSelection.test.tsx:3086` test: 'Paragraph with links to heading with links', async () => {
- `../lexical/packages/lexical-selection/src/__tests__/unit/LexicalSelection.test.tsx:3134` test: 'Nested list', async () => {
- `../lexical/packages/lexical-selection/src/__tests__/unit/LexicalSelection.test.tsx:3177` test: 'Triple-click overselection: focus at element offset 0 of non-empty next block is skipped', () => {
- `../lexical/packages/lexical-selection/src/__tests__/unit/LexicalSelection.test.tsx:3206` test: 'Triple-click overselection: focus at element offset 0 of empty next block is converted', () => {
- `../lexical/packages/lexical-selection/src/__tests__/unit/LexicalSelection.test.tsx:3232` test: 'Triple-click overselection: focus at offset 0 of next block is skipped', () => {
- `../lexical/packages/lexical-selection/src/__tests__/unit/LexicalSelection.test.tsx:3260` test: 'Triple-click overselection: focus inside nested inline at offset 0 is skipped', () => {
- `../lexical/packages/lexical-selection/src/__tests__/unit/LexicalSelection.test.tsx:3290` test: 'Non-zero focus offset in next block still converts both blocks', () => {
- `../lexical/packages/lexical-selection/src/__tests__/unit/LexicalSelection.test.tsx:3315` test: 'Triple-click overselection spanning multiple blocks skips only the focus block', () => {
- `../lexical/packages/lexical-selection/src/__tests__/unit/LexicalSelection.test.tsx:3343` test: 'Focus at offset 0 in next block whose first descendant has a prior sibling still converts focus block', () => {
- `../lexical/packages/lexical-selection/src/__tests__/unit/LexicalSelection.test.tsx:3373` test: 'Nested list with listItem twice indented from its parent', async () => {
- `../lexical/packages/lexical-selection/src/__tests__/unit/LexicalSelection.test.tsx:3411` test: 'Backward selection: focus at block end is skipped', () => {
- `../lexical/packages/lexical-selection/src/__tests__/unit/LexicalSelection.test.tsx:3438` test: 'Backward selection: non-zero focus offset converts both blocks', () => {
- `../lexical/packages/lexical-selection/src/__tests__/unit/LexicalSelection.test.tsx:3465` test: 'Backward selection spanning multiple blocks skips only focus block', () => {
- `../lexical/packages/lexical-selection/src/__tests__/unit/LexicalSelection.test.tsx:3500` test: 'Backward selection: focus at block end with element point is skipped', () => {

## `../lexical/packages/lexical-selection/src/__tests__/unit/LexicalSelectionHelpers.test.ts`

category: portable
family: selection-dom-mapping / void-atom
target: indexed 65 test/describe lines; target packages/plite/test; packages/plite-react/test/editable-behavior.test.tsx; apps/www/tests/plite-browser/donor/stress/generated-editing.test.ts

- `../lexical/packages/lexical-selection/src/__tests__/unit/LexicalSelectionHelpers.test.ts:90` describe: 'LexicalSelectionHelpers tests', () => {
- `../lexical/packages/lexical-selection/src/__tests__/unit/LexicalSelectionHelpers.test.ts:91` describe: 'Collapsed', () => {
- `../lexical/packages/lexical-selection/src/__tests__/unit/LexicalSelectionHelpers.test.ts:92` test: 'Can handle a text point', () => {
- `../lexical/packages/lexical-selection/src/__tests__/unit/LexicalSelectionHelpers.test.ts:267` test: 'Has correct text point after removal after merge', async () => {
- `../lexical/packages/lexical-selection/src/__tests__/unit/LexicalSelectionHelpers.test.ts:348` test: 'Has correct text point after removal after merge (2)', async () => {
- `../lexical/packages/lexical-selection/src/__tests__/unit/LexicalSelectionHelpers.test.ts:424` test: 'Has correct text point adjust to element point after removal of a single empty text node', async () => {
- `../lexical/packages/lexical-selection/src/__tests__/unit/LexicalSelectionHelpers.test.ts:485` test: 'Has correct element point after removal of an empty text node in a group #1', async () => {
- `../lexical/packages/lexical-selection/src/__tests__/unit/LexicalSelectionHelpers.test.ts:551` test: 'Has correct element point after removal of an empty text node in a group #2', async () => {
- `../lexical/packages/lexical-selection/src/__tests__/unit/LexicalSelectionHelpers.test.ts:627` test: 'Has correct text point after removal of an empty text node in a group #3', async () => {
- `../lexical/packages/lexical-selection/src/__tests__/unit/LexicalSelectionHelpers.test.ts:703` test: 'Can handle an element point on empty element', () => {
- `../lexical/packages/lexical-selection/src/__tests__/unit/LexicalSelectionHelpers.test.ts:840` test: 'Can handle a start element point', () => {
- `../lexical/packages/lexical-selection/src/__tests__/unit/LexicalSelectionHelpers.test.ts:993` test: 'Can handle an end element point', () => {
- `../lexical/packages/lexical-selection/src/__tests__/unit/LexicalSelectionHelpers.test.ts:1146` test: 'Has correct element point after merge from middle', async () => {
- `../lexical/packages/lexical-selection/src/__tests__/unit/LexicalSelectionHelpers.test.ts:1217` test: 'Has correct element point after merge from end', async () => {
- `../lexical/packages/lexical-selection/src/__tests__/unit/LexicalSelectionHelpers.test.ts:1289` describe: 'Simple range', () => {
- `../lexical/packages/lexical-selection/src/__tests__/unit/LexicalSelectionHelpers.test.ts:1290` test: 'Can handle multiple text points', () => {
- `../lexical/packages/lexical-selection/src/__tests__/unit/LexicalSelectionHelpers.test.ts:1468` test: 'Can handle multiple element points', () => {
- `../lexical/packages/lexical-selection/src/__tests__/unit/LexicalSelectionHelpers.test.ts:1625` test: 'Can handle a mix of text and element points', () => {
- `../lexical/packages/lexical-selection/src/__tests__/unit/LexicalSelectionHelpers.test.ts:1795` describe: 'can insert non-element nodes correctly', () => {
- `../lexical/packages/lexical-selection/src/__tests__/unit/LexicalSelectionHelpers.test.ts:1796` describe: 'with an empty paragraph node selected', () => {
- `../lexical/packages/lexical-selection/src/__tests__/unit/LexicalSelectionHelpers.test.ts:1797` test: 'a single text node', async () => {
- `../lexical/packages/lexical-selection/src/__tests__/unit/LexicalSelectionHelpers.test.ts:1836` test: 'two text nodes', async () => {
- `../lexical/packages/lexical-selection/src/__tests__/unit/LexicalSelectionHelpers.test.ts:1877` test: 'link insertion without parent element', async () => {
- `../lexical/packages/lexical-selection/src/__tests__/unit/LexicalSelectionHelpers.test.ts:1922` test: 'a single heading node with a child text node', async () => {
- `../lexical/packages/lexical-selection/src/__tests__/unit/LexicalSelectionHelpers.test.ts:1966` describe: 'with a paragraph node selected on some existing text', () => {
- `../lexical/packages/lexical-selection/src/__tests__/unit/LexicalSelectionHelpers.test.ts:1967` test: 'a single text node', async () => {
- `../lexical/packages/lexical-selection/src/__tests__/unit/LexicalSelectionHelpers.test.ts:2008` test: 'two text nodes', async () => {
- `../lexical/packages/lexical-selection/src/__tests__/unit/LexicalSelectionHelpers.test.ts:2053` test: 'a single heading node with a child text node', async () => {
- `../lexical/packages/lexical-selection/src/__tests__/unit/LexicalSelectionHelpers.test.ts:2100` test: 'a paragraph with a child text and a child italic text and a child text', async () => {
- `../lexical/packages/lexical-selection/src/__tests__/unit/LexicalSelectionHelpers.test.ts:2172` describe: 'with a fully-selected text node', () => {
- `../lexical/packages/lexical-selection/src/__tests__/unit/LexicalSelectionHelpers.test.ts:2173` test: 'a single text node', async () => {
- `../lexical/packages/lexical-selection/src/__tests__/unit/LexicalSelectionHelpers.test.ts:2215` describe: 'with a fully-selected text node followed by an inline element', () => {
- `../lexical/packages/lexical-selection/src/__tests__/unit/LexicalSelectionHelpers.test.ts:2216` test: 'a single text node', async () => {
- `../lexical/packages/lexical-selection/src/__tests__/unit/LexicalSelectionHelpers.test.ts:2262` describe: 'with a fully-selected text node preceded by an inline element', () => {
- `../lexical/packages/lexical-selection/src/__tests__/unit/LexicalSelectionHelpers.test.ts:2263` test: 'a single text node', async () => {
- `../lexical/packages/lexical-selection/src/__tests__/unit/LexicalSelectionHelpers.test.ts:2309` test: 'can insert a linebreak node before an inline element node', async () => {
- `../lexical/packages/lexical-selection/src/__tests__/unit/LexicalSelectionHelpers.test.ts:2334` describe: 'can insert block element nodes correctly', () => {
- `../lexical/packages/lexical-selection/src/__tests__/unit/LexicalSelectionHelpers.test.ts:2335` describe: 'with a fully-selected text node', () => {
- `../lexical/packages/lexical-selection/src/__tests__/unit/LexicalSelectionHelpers.test.ts:2336` test: 'a paragraph node', async () => {
- `../lexical/packages/lexical-selection/src/__tests__/unit/LexicalSelectionHelpers.test.ts:2381` describe: 'with a fully-selected text node followed by an inline element', () => {
- `../lexical/packages/lexical-selection/src/__tests__/unit/LexicalSelectionHelpers.test.ts:2382` test: 'a paragraph node', async () => {
- `../lexical/packages/lexical-selection/src/__tests__/unit/LexicalSelectionHelpers.test.ts:2431` describe: 'with a fully-selected text node preceded by an inline element', () => {
- `../lexical/packages/lexical-selection/src/__tests__/unit/LexicalSelectionHelpers.test.ts:2432` test: 'a paragraph node', async () => {
- `../lexical/packages/lexical-selection/src/__tests__/unit/LexicalSelectionHelpers.test.ts:2481` test: 'Can insert link into empty paragraph', async () => {
- `../lexical/packages/lexical-selection/src/__tests__/unit/LexicalSelectionHelpers.test.ts:2500` test: 'Can insert link into empty paragraph (2)', async () => {
- `../lexical/packages/lexical-selection/src/__tests__/unit/LexicalSelectionHelpers.test.ts:2520` test: 'Can insert an ElementNode after ShadowRoot', async () => {
- `../lexical/packages/lexical-selection/src/__tests__/unit/LexicalSelectionHelpers.test.ts:2542` describe: 'extract', () => {
- `../lexical/packages/lexical-selection/src/__tests__/unit/LexicalSelectionHelpers.test.ts:2543` test: 'Should return the selected node when collapsed on a TextNode', async () => {
- `../lexical/packages/lexical-selection/src/__tests__/unit/LexicalSelectionHelpers.test.ts:2579` describe: 'insertNodes', () => {
- `../lexical/packages/lexical-selection/src/__tests__/unit/LexicalSelectionHelpers.test.ts:2584` it: 'can insert element next to top level decorator node', async () => {
- `../lexical/packages/lexical-selection/src/__tests__/unit/LexicalSelectionHelpers.test.ts:2615` it: 'can insert when previous selection was null', async () => {
- `../lexical/packages/lexical-selection/src/__tests__/unit/LexicalSelectionHelpers.test.ts:2644` it: 'can insert when before empty text node', async () => {
- `../lexical/packages/lexical-selection/src/__tests__/unit/LexicalSelectionHelpers.test.ts:2664` it: 'last node is LineBreakNode', async () => {
- `../lexical/packages/lexical-selection/src/__tests__/unit/LexicalSelectionHelpers.test.ts:2694` describe: '$patchStyleText', () => {
- `../lexical/packages/lexical-selection/src/__tests__/unit/LexicalSelectionHelpers.test.ts:2695` test: 'can patch a selection anchored to the end of a TextNode before an inline element', async () => {
- `../lexical/packages/lexical-selection/src/__tests__/unit/LexicalSelectionHelpers.test.ts:2751` test: 'can patch a selection anchored to the end of a TextNode at the end of a paragraph', async () => {
- `../lexical/packages/lexical-selection/src/__tests__/unit/LexicalSelectionHelpers.test.ts:2801` test: 'can patch a selection that ends on an element', async () => {
- `../lexical/packages/lexical-selection/src/__tests__/unit/LexicalSelectionHelpers.test.ts:2854` test: 'can patch a reversed selection that ends on an element', async () => {
- `../lexical/packages/lexical-selection/src/__tests__/unit/LexicalSelectionHelpers.test.ts:2907` test: 'can patch a selection that starts and ends on an element', async () => {
- `../lexical/packages/lexical-selection/src/__tests__/unit/LexicalSelectionHelpers.test.ts:2949` test: 'can clear a style', async () => {
- `../lexical/packages/lexical-selection/src/__tests__/unit/LexicalSelectionHelpers.test.ts:2987` test: 'can toggle a style on a collapsed selection', async () => {
- `../lexical/packages/lexical-selection/src/__tests__/unit/LexicalSelectionHelpers.test.ts:3036` test: 'updates cached styles when setting on a collapsed selection', async () => {
- `../lexical/packages/lexical-selection/src/__tests__/unit/LexicalSelectionHelpers.test.ts:3085` test: '$getSelectionStyleValueForProperty returns consistent value regardless of selection direction', async () => {
- `../lexical/packages/lexical-selection/src/__tests__/unit/LexicalSelectionHelpers.test.ts:3144` test: '$getSelectionStyleValueForProperty ignores nodes with zero characters selected at boundaries', async () => {
- `../lexical/packages/lexical-selection/src/__tests__/unit/LexicalSelectionHelpers.test.ts:3235` test: 'preserve backward selection when changing style of 2 different text nodes', async () => {

## `../lexical/packages/lexical-table/src/__tests__/browser/StickyScrollbar.test.ts`

category: portable-mixed
family: portable editor behavior
target: indexed; target current Plite package proof and browser proof when DOM-dependent

- `../lexical/packages/lexical-table/src/__tests__/browser/StickyScrollbar.test.ts:100` describe: 'sticky scrollbar (browser)', () => {
- `../lexical/packages/lexical-table/src/__tests__/browser/StickyScrollbar.test.ts:101` test: 'shows the sticky scrollbar only while the table overflows', async () => {
- `../lexical/packages/lexical-table/src/__tests__/browser/StickyScrollbar.test.ts:122` test: 'mirrors scroll position between the wrapper and the sticky scrollbar', async () => {
- `../lexical/packages/lexical-table/src/__tests__/browser/StickyScrollbar.test.ts:138` test: 'hides the scrollbar when frozen rows make the wrapper unscrollable', async () => {
- `../lexical/packages/lexical-table/src/__tests__/browser/StickyScrollbar.test.ts:187` test: 'falls back to the native scrollbar when the unthemed proxy cannot render', async () => {

## `../lexical/packages/lexical-table/src/__tests__/unit/LexicalTableCellNode.test.ts`

category: portable
family: tables-grid / selection-dom-mapping
target: indexed 10 test/describe lines; target apps/www/tests/plite-browser/donor/stress/generated-editing.test.ts; apps/www/tests/plite-browser/donor/examples/tables.test.ts; packages/plite/test/transforms/insertFragment

- `../lexical/packages/lexical-table/src/__tests__/unit/LexicalTableCellNode.test.ts:32` describe: 'LexicalTableCellNode tests', () => {
- `../lexical/packages/lexical-table/src/__tests__/unit/LexicalTableCellNode.test.ts:34` test: 'TableCellNode.constructor', async () => {
- `../lexical/packages/lexical-table/src/__tests__/unit/LexicalTableCellNode.test.ts:48` test: 'TableCellNode.createDOM()', async () => {
- `../lexical/packages/lexical-table/src/__tests__/unit/LexicalTableCellNode.test.ts:103` test: 'TableCellNode.importDOM', async () => {
- `../lexical/packages/lexical-table/src/__tests__/unit/LexicalTableCellNode.test.ts:244` test: 'DOM Conversion: <th> with scope="col" becomes COLUMN header', async () => {
- `../lexical/packages/lexical-table/src/__tests__/unit/LexicalTableCellNode.test.ts:259` test: 'DOM Conversion: <th> with scope="row" becomes ROW header', async () => {
- `../lexical/packages/lexical-table/src/__tests__/unit/LexicalTableCellNode.test.ts:274` test: 'DOM Conversion: <th> without scope defaults to ROW header', async () => {
- `../lexical/packages/lexical-table/src/__tests__/unit/LexicalTableCellNode.test.ts:293` test: 'DOM Conversion: <th> in first row without scope becomes ROW header', async () => {
- `../lexical/packages/lexical-table/src/__tests__/unit/LexicalTableCellNode.test.ts:313` test: 'DOM Conversion: <th> in first column of non-first row becomes COLUMN header', async () => {
- `../lexical/packages/lexical-table/src/__tests__/unit/LexicalTableCellNode.test.ts:339` test: 'DOM Conversion: <th> in thead without scope becomes ROW header', async () => {
- `../lexical/packages/lexical-table/src/__tests__/unit/LexicalTableCellNode.test.ts:361` test: 'DOM Conversion: <td> with style.backgroundColor reads inline background-color', async () => {
- `../lexical/packages/lexical-table/src/__tests__/unit/LexicalTableCellNode.test.ts:376` test: 'DOM Conversion: <td> with no background color sets backgroundColor to null', async () => {
- `../lexical/packages/lexical-table/src/__tests__/unit/LexicalTableCellNode.test.ts:389` test: 'DOM Conversion: <td> with color propagates color to child TextNodes via after callback', async () => {
- `../lexical/packages/lexical-table/src/__tests__/unit/LexicalTableCellNode.test.ts:406` test: 'DOM Conversion: <td> color does not overwrite existing child TextNode color', async () => {

## `../lexical/packages/lexical-table/src/__tests__/unit/LexicalTableExtension.test.ts`

category: portable
family: tables-grid / selection-dom-mapping
target: indexed 17 test/describe lines; target apps/www/tests/plite-browser/donor/stress/generated-editing.test.ts; apps/www/tests/plite-browser/donor/examples/tables.test.ts; packages/plite/test/transforms/insertFragment

- `../lexical/packages/lexical-table/src/__tests__/unit/LexicalTableExtension.test.ts:56` describe: 'TableExtension', () => {
- `../lexical/packages/lexical-table/src/__tests__/unit/LexicalTableExtension.test.ts:72` it: 'Creates a table with INSERT_TABLE_COMMAND', () => {
- `../lexical/packages/lexical-table/src/__tests__/unit/LexicalTableExtension.test.ts:106` it: 'repaints existing tables when hasHorizontalScroll toggles', async () => {
- `../lexical/packages/lexical-table/src/__tests__/unit/LexicalTableExtension.test.ts:143` it: 'renders and removes the sticky scrollbar DOM when hasStickyScrollbar toggles', async () => {
- `../lexical/packages/lexical-table/src/__tests__/unit/LexicalTableExtension.test.ts:188` it: 'Prevents nested tables by default', async () => {
- `../lexical/packages/lexical-table/src/__tests__/unit/LexicalTableExtension.test.ts:228` it: 'Allows nested tables when hasNestedTables is true', async () => {
- `../lexical/packages/lexical-table/src/__tests__/unit/LexicalTableExtension.test.ts:271` describe: '$insertGeneratedNodes', () => {
- `../lexical/packages/lexical-table/src/__tests__/unit/LexicalTableExtension.test.ts:272` test: 'SELECTION_INSERT_CLIPBOARD_NODES_COMMAND handler prevents pasting whole table into cells by default', () => {
- `../lexical/packages/lexical-table/src/__tests__/unit/LexicalTableExtension.test.ts:323` test: 'SELECTION_INSERT_CLIPBOARD_NODES_COMMAND handler allows pasting whole table into a single cell when hasNestedTables is true', () => {
- `../lexical/packages/lexical-table/src/__tests__/unit/LexicalTableExtension.test.ts:379` test: 'SELECTION_INSERT_CLIPBOARD_NODES_COMMAND handler allows extending table when hasNestedTables is true', () => {
- `../lexical/packages/lexical-table/src/__tests__/unit/LexicalTableExtension.test.ts:451` test: 'SELECTION_INSERT_CLIPBOARD_NODES_COMMAND clips to selection boundary with TableSelection', () => {
- `../lexical/packages/lexical-table/src/__tests__/unit/LexicalTableExtension.test.ts:521` describe: 'colWidths', () => {
- `../lexical/packages/lexical-table/src/__tests__/unit/LexicalTableExtension.test.ts:522` it: 'removes colWidths if it is an empty array', () => {
- `../lexical/packages/lexical-table/src/__tests__/unit/LexicalTableExtension.test.ts:544` it: 'uses the last column width if the column count is greater than the number of column widths', () => {
- `../lexical/packages/lexical-table/src/__tests__/unit/LexicalTableExtension.test.ts:566` it: 'shortens the colWidths if the column count is less than the number of column widths', () => {
- `../lexical/packages/lexical-table/src/__tests__/unit/LexicalTableExtension.test.ts:589` describe: 'SELECT_ALL_COMMAND', () => {
- `../lexical/packages/lexical-table/src/__tests__/unit/LexicalTableExtension.test.ts:590` it: 'Selects all cells in table without merged cells when table is only content', () => {
- `../lexical/packages/lexical-table/src/__tests__/unit/LexicalTableExtension.test.ts:675` it: 'Selects all cells in table with merged cells when table is only content', () => {
- `../lexical/packages/lexical-table/src/__tests__/unit/LexicalTableExtension.test.ts:774` it: 'Does not intercept SELECT_ALL_COMMAND when cursor is outside table', () => {
- `../lexical/packages/lexical-table/src/__tests__/unit/LexicalTableExtension.test.ts:812` it: 'Does not intercept SELECT_ALL_COMMAND when there is paragraph after table', () => {
- `../lexical/packages/lexical-table/src/__tests__/unit/LexicalTableExtension.test.ts:856` describe: 'drag selection', () => {
- `../lexical/packages/lexical-table/src/__tests__/unit/LexicalTableExtension.test.ts:887` it: 'attaches the window pointerdown handler when setRootElement is called after register', () => {
- `../lexical/packages/lexical-table/src/__tests__/unit/LexicalTableExtension.test.ts:956` describe: 'FORMAT_ELEMENT_COMMAND on a full table selection (#8880)', () => {
- `../lexical/packages/lexical-table/src/__tests__/unit/LexicalTableExtension.test.ts:1006` it: `aligns the table when selected ${name}`, () => {
- `../lexical/packages/lexical-table/src/__tests__/unit/LexicalTableExtension.test.ts:1037` it: 'aligns the table when the full selection includes a merged cell, selected in reverse', () => {
- `../lexical/packages/lexical-table/src/__tests__/unit/LexicalTableExtension.test.ts:1065` it: 'applies per-cell alignment (not table alignment) when only part of the table is selected, even in reverse direction', () => {

## `../lexical/packages/lexical-table/src/__tests__/unit/LexicalTableMobileSelection.test.tsx`

category: portable
family: tables-grid / selection-dom-mapping
target: indexed 7 test/describe lines; target apps/www/tests/plite-browser/donor/stress/generated-editing.test.ts; apps/www/tests/plite-browser/donor/examples/tables.test.ts; packages/plite/test/transforms/insertFragment

- `../lexical/packages/lexical-table/src/__tests__/unit/LexicalTableMobileSelection.test.tsx:53` describe: 'LexicalTableMobileSelection', () => {
- `../lexical/packages/lexical-table/src/__tests__/unit/LexicalTableMobileSelection.test.tsx:108` test: 'mouse click should set anchor cell for selection (existing behavior)', async () => {
- `../lexical/packages/lexical-table/src/__tests__/unit/LexicalTableMobileSelection.test.tsx:137` test: 'touch tap on single cell should not create table selection', async () => {
- `../lexical/packages/lexical-table/src/__tests__/unit/LexicalTableMobileSelection.test.tsx:164` test: 'touch tap between different cells should not create table selection', async () => {
- `../lexical/packages/lexical-table/src/__tests__/unit/LexicalTableMobileSelection.test.tsx:201` test: 'touch drag (with isSelecting=true) should still create table selection', async () => {
- `../lexical/packages/lexical-table/src/__tests__/unit/LexicalTableMobileSelection.test.tsx:241` test: 'mixed pointer types should be handled correctly', async () => {
- `../lexical/packages/lexical-table/src/__tests__/unit/LexicalTableMobileSelection.test.tsx:272` test: 'mouse leaving browser window during selection should stop selection', async () => {

## `../lexical/packages/lexical-table/src/__tests__/unit/LexicalTableNode.test.tsx`

category: portable
family: tables-grid / selection-dom-mapping
target: indexed 23 test/describe lines; target apps/www/tests/plite-browser/donor/stress/generated-editing.test.ts; apps/www/tests/plite-browser/donor/examples/tables.test.ts; packages/plite/test/transforms/insertFragment

- `../lexical/packages/lexical-table/src/__tests__/unit/LexicalTableNode.test.tsx:121` describe: 'LexicalTableNode tests', () => {
- `../lexical/packages/lexical-table/src/__tests__/unit/LexicalTableNode.test.tsx:123` describe: `hasHorizontalScroll={${hasHorizontalScroll}}`, () => {
- `../lexical/packages/lexical-table/src/__tests__/unit/LexicalTableNode.test.tsx:159` test: 'TableNode.constructor', () => {
- `../lexical/packages/lexical-table/src/__tests__/unit/LexicalTableNode.test.tsx:174` test: 'TableNode.createDOM()', () => {
- `../lexical/packages/lexical-table/src/__tests__/unit/LexicalTableNode.test.tsx:192` test: 'TableNode.createDOM() and updateDOM() style', () => {
- `../lexical/packages/lexical-table/src/__tests__/unit/LexicalTableNode.test.tsx:281` test: 'TableNode.exportDOM() with range selection', () => {
- `../lexical/packages/lexical-table/src/__tests__/unit/LexicalTableNode.test.tsx:355` test: 'TableNode.exportDOM() with partial table selection', () => {
- `../lexical/packages/lexical-table/src/__tests__/unit/LexicalTableNode.test.tsx:415` test: 'Copy table from an external source', () => {
- `../lexical/packages/lexical-table/src/__tests__/unit/LexicalTableNode.test.tsx:470` test: 'Copy table with caption/tbody/thead/tfoot from an external source', () => {
- `../lexical/packages/lexical-table/src/__tests__/unit/LexicalTableNode.test.tsx:613` test: 'Copy table with caption from an external source', () => {
- `../lexical/packages/lexical-table/src/__tests__/unit/LexicalTableNode.test.tsx:783` test: 'Copy table from an external source like gdoc with formatting', () => {
- `../lexical/packages/lexical-table/src/__tests__/unit/LexicalTableNode.test.tsx:851` test: 'Cut table in the middle of a range selection', () => {
- `../lexical/packages/lexical-table/src/__tests__/unit/LexicalTableNode.test.tsx:893` test: 'Cut table as last node in range selection ', () => {
- `../lexical/packages/lexical-table/src/__tests__/unit/LexicalTableNode.test.tsx:933` test: 'Cut table as first node in range selection ', () => {
- `../lexical/packages/lexical-table/src/__tests__/unit/LexicalTableNode.test.tsx:973` test: 'Cut table is whole selection, should remove it', () => {
- `../lexical/packages/lexical-table/src/__tests__/unit/LexicalTableNode.test.tsx:1021` test: 'Cut subsection of table cells, should just clear contents', () => {
- `../lexical/packages/lexical-table/src/__tests__/unit/LexicalTableNode.test.tsx:1072` test: 'Table plain text output validation', () => {
- `../lexical/packages/lexical-table/src/__tests__/unit/LexicalTableNode.test.tsx:1128` test: 'Toggle row striping ON/OFF', () => {
- `../lexical/packages/lexical-table/src/__tests__/unit/LexicalTableNode.test.tsx:1184` test: 'Toggle frozen first column ON/OFF', () => {
- `../lexical/packages/lexical-table/src/__tests__/unit/LexicalTableNode.test.tsx:1695` test: 'Change Table-level alignment', () => {
- `../lexical/packages/lexical-table/src/__tests__/unit/LexicalTableNode.test.tsx:1743` test: 'Update column widths', () => {
- `../lexical/packages/lexical-table/src/__tests__/unit/LexicalTableNode.test.tsx:1839` describe: `hasHorizontalScroll false -> true`, () => {
- `../lexical/packages/lexical-table/src/__tests__/unit/LexicalTableNode.test.tsx:1860` test: 'table is re-rendered when scroll changes', () => {

## `../lexical/packages/lexical-table/src/__tests__/unit/LexicalTablePlugin.test.tsx`

category: portable
family: tables-grid / selection-dom-mapping
target: indexed 3 test/describe lines; target apps/www/tests/plite-browser/donor/stress/generated-editing.test.ts; apps/www/tests/plite-browser/donor/examples/tables.test.ts; packages/plite/test/transforms/insertFragment

- `../lexical/packages/lexical-table/src/__tests__/unit/LexicalTablePlugin.test.tsx:26` describe: 'LexicalTablePlugin', () => {
- `../lexical/packages/lexical-table/src/__tests__/unit/LexicalTablePlugin.test.tsx:43` test: 'INSERT_TABLE_COMMAND inserts a table', async () => {
- `../lexical/packages/lexical-table/src/__tests__/unit/LexicalTablePlugin.test.tsx:77` test: 'INSERT_TABLE_COMMAND inserts a table when the editor is blurred', async () => {

## `../lexical/packages/lexical-table/src/__tests__/unit/LexicalTableRowNode.test.ts`

category: portable
family: tables-grid / selection-dom-mapping
target: indexed 3 test/describe lines; target apps/www/tests/plite-browser/donor/stress/generated-editing.test.ts; apps/www/tests/plite-browser/donor/examples/tables.test.ts; packages/plite/test/transforms/insertFragment

- `../lexical/packages/lexical-table/src/__tests__/unit/LexicalTableRowNode.test.ts:20` describe: 'LexicalTableRowNode tests', () => {
- `../lexical/packages/lexical-table/src/__tests__/unit/LexicalTableRowNode.test.ts:22` test: 'TableRowNode.constructor', async () => {
- `../lexical/packages/lexical-table/src/__tests__/unit/LexicalTableRowNode.test.ts:34` test: 'TableRowNode.createDOM()', async () => {

## `../lexical/packages/lexical-table/src/__tests__/unit/LexicalTableSelection.test.tsx`

category: portable
family: tables-grid / selection-dom-mapping
target: indexed 6 test/describe lines; target apps/www/tests/plite-browser/donor/stress/generated-editing.test.ts; apps/www/tests/plite-browser/donor/examples/tables.test.ts; packages/plite/test/transforms/insertFragment

- `../lexical/packages/lexical-table/src/__tests__/unit/LexicalTableSelection.test.tsx:35` describe: 'table selection', () => {
- `../lexical/packages/lexical-table/src/__tests__/unit/LexicalTableSelection.test.tsx:71` describe: 'regression #7076', () => {
- `../lexical/packages/lexical-table/src/__tests__/unit/LexicalTableSelection.test.tsx:72` test: '$patchStyleText works on a TableSelection', () => {
- `../lexical/packages/lexical-table/src/__tests__/unit/LexicalTableSelection.test.tsx:94` test: '$patchStyleText applies styles to empty table cells', () => {
- `../lexical/packages/lexical-table/src/__tests__/unit/LexicalTableSelection.test.tsx:128` describe: 'insertRawText', () => {
- `../lexical/packages/lexical-table/src/__tests__/unit/LexicalTableSelection.test.tsx:136` test: 'fills 2x2 table with matching TSV', () => {
- `../lexical/packages/lexical-table/src/__tests__/unit/LexicalTableSelection.test.tsx:149` test: 'single value fills anchor cell only', () => {
- `../lexical/packages/lexical-table/src/__tests__/unit/LexicalTableSelection.test.tsx:162` test: 'single row TSV fills one row with two columns', () => {
- `../lexical/packages/lexical-table/src/__tests__/unit/LexicalTableSelection.test.tsx:175` test: 'expands rows when TSV has more rows', () => {
- `../lexical/packages/lexical-table/src/__tests__/unit/LexicalTableSelection.test.tsx:189` test: 'expands columns when TSV has more columns', () => {
- `../lexical/packages/lexical-table/src/__tests__/unit/LexicalTableSelection.test.tsx:201` test: 'expands both rows and columns', () => {
- `../lexical/packages/lexical-table/src/__tests__/unit/LexicalTableSelection.test.tsx:216` test: 'strips trailing newline from clipboard', () => {
- `../lexical/packages/lexical-table/src/__tests__/unit/LexicalTableSelection.test.tsx:229` test: 'paste from non-origin anchor fills offset cells', () => {
- `../lexical/packages/lexical-table/src/__tests__/unit/LexicalTableSelection.test.tsx:248` test: 'unmerges and fills merged cells', () => {
- `../lexical/packages/lexical-table/src/__tests__/unit/LexicalTableSelection.test.tsx:294` test: 'empty string is no-op', () => {
- `../lexical/packages/lexical-table/src/__tests__/unit/LexicalTableSelection.test.tsx:308` describe: 'getShape', () => {
- `../lexical/packages/lexical-table/src/__tests__/unit/LexicalTableSelection.test.tsx:309` test: 'returns correct shape for non-merged table', () => {
- `../lexical/packages/lexical-table/src/__tests__/unit/LexicalTableSelection.test.tsx:323` describe: 'regression #7140', () => {
- `../lexical/packages/lexical-table/src/__tests__/unit/LexicalTableSelection.test.tsx:324` test: 'selection points to missing nodes after deleting table rows', () => {

## `../lexical/packages/lexical-table/src/__tests__/unit/LexicalTableSelectionHelpers.test.ts`

category: portable
family: selection-dom-mapping / nested-root
target: indexed; target current Plite package proof and browser proof when DOM-dependent

- `../lexical/packages/lexical-table/src/__tests__/unit/LexicalTableSelectionHelpers.test.ts:37` describe: 'LexicalTableSelectionHelpers', () => {
- `../lexical/packages/lexical-table/src/__tests__/unit/LexicalTableSelectionHelpers.test.ts:38` describe: 'regression #8670', () => {
- `../lexical/packages/lexical-table/src/__tests__/unit/LexicalTableSelectionHelpers.test.ts:67` test: 'selection change ignores the table recorded on ArrowDown when it was removed', () => {
- `../lexical/packages/lexical-table/src/__tests__/unit/LexicalTableSelectionHelpers.test.ts:94` test: 'selection change self-heals observers for tables removed while the root element was detached', () => {
- `../lexical/packages/lexical-table/src/__tests__/unit/LexicalTableSelectionHelpers.test.ts:128` describe: 'regression #8832', () => {
- `../lexical/packages/lexical-table/src/__tests__/unit/LexicalTableSelectionHelpers.test.ts:165` test: 'document-level copy dispatches COPY_COMMAND for table selection in read-only mode', () => {
- `../lexical/packages/lexical-table/src/__tests__/unit/LexicalTableSelectionHelpers.test.ts:198` test: 'document-level copy is not dispatched without table selection', () => {
- `../lexical/packages/lexical-table/src/__tests__/unit/LexicalTableSelectionHelpers.test.ts:231` test: 'document-level copy is skipped when event is already defaultPrevented', () => {
- `../lexical/packages/lexical-table/src/__tests__/unit/LexicalTableSelectionHelpers.test.ts:266` test: 'document-level copy is skipped when focus is outside the editor', () => {
- `../lexical/packages/lexical-table/src/__tests__/unit/LexicalTableSelectionHelpers.test.ts:306` describe: 'DELETE_LINE_COMMAND in table cells', () => {
- `../lexical/packages/lexical-table/src/__tests__/unit/LexicalTableSelectionHelpers.test.ts:327` test: 'DELETE_LINE_COMMAND propagates past the table handler in the first cell paragraph', () => {

## `../lexical/packages/lexical-table/src/__tests__/unit/LexicalTableUtils.test.ts`

category: portable
family: tables-grid / selection-dom-mapping
target: indexed 13 test/describe lines; target apps/www/tests/plite-browser/donor/stress/generated-editing.test.ts; apps/www/tests/plite-browser/donor/examples/tables.test.ts; packages/plite/test/transforms/insertFragment

- `../lexical/packages/lexical-table/src/__tests__/unit/LexicalTableUtils.test.ts:91` describe: '$moveTableColumn', () => {
- `../lexical/packages/lexical-table/src/__tests__/unit/LexicalTableUtils.test.ts:92` test: 'moves a column forward', () => {
- `../lexical/packages/lexical-table/src/__tests__/unit/LexicalTableUtils.test.ts:118` test: 'moves a column backward', () => {
- `../lexical/packages/lexical-table/src/__tests__/unit/LexicalTableUtils.test.ts:144` test: 'moves a column to the first position', () => {
- `../lexical/packages/lexical-table/src/__tests__/unit/LexicalTableUtils.test.ts:170` test: 'moves a column to the last position', () => {
- `../lexical/packages/lexical-table/src/__tests__/unit/LexicalTableUtils.test.ts:196` test: 'is a no-op when origin equals target', () => {
- `../lexical/packages/lexical-table/src/__tests__/unit/LexicalTableUtils.test.ts:222` test: 'is a no-op when origin is out of bounds', () => {
- `../lexical/packages/lexical-table/src/__tests__/unit/LexicalTableUtils.test.ts:248` test: 'is a no-op when target is out of bounds', () => {
- `../lexical/packages/lexical-table/src/__tests__/unit/LexicalTableUtils.test.ts:274` test: 'is a no-op when origin is negative', () => {
- `../lexical/packages/lexical-table/src/__tests__/unit/LexicalTableUtils.test.ts:300` test: 'reorders colWidths when present', () => {
- `../lexical/packages/lexical-table/src/__tests__/unit/LexicalTableUtils.test.ts:325` test: 'does not modify table with merged cells', () => {
- `../lexical/packages/lexical-table/src/__tests__/unit/LexicalTableUtils.test.ts:380` test: 'swaps adjacent columns', () => {
- `../lexical/packages/lexical-table/src/__tests__/unit/LexicalTableUtils.test.ts:407` test: 'preserves table structure after move', () => {
- `../lexical/packages/lexical-table/src/__tests__/unit/LexicalTableUtils.test.ts:436` describe: '$moveTableRow', () => {
- `../lexical/packages/lexical-table/src/__tests__/unit/LexicalTableUtils.test.ts:437` test: 'moves a row forward', () => {
- `../lexical/packages/lexical-table/src/__tests__/unit/LexicalTableUtils.test.ts:465` test: 'moves a row backward', () => {
- `../lexical/packages/lexical-table/src/__tests__/unit/LexicalTableUtils.test.ts:493` test: 'moves a row to the first position', () => {
- `../lexical/packages/lexical-table/src/__tests__/unit/LexicalTableUtils.test.ts:521` test: 'moves a row to the last position', () => {
- `../lexical/packages/lexical-table/src/__tests__/unit/LexicalTableUtils.test.ts:549` test: 'is a no-op when origin equals target', () => {
- `../lexical/packages/lexical-table/src/__tests__/unit/LexicalTableUtils.test.ts:576` test: 'is a no-op when origin is out of bounds', () => {
- `../lexical/packages/lexical-table/src/__tests__/unit/LexicalTableUtils.test.ts:603` test: 'is a no-op when target is out of bounds', () => {
- `../lexical/packages/lexical-table/src/__tests__/unit/LexicalTableUtils.test.ts:630` test: 'is a no-op when origin is negative', () => {
- `../lexical/packages/lexical-table/src/__tests__/unit/LexicalTableUtils.test.ts:657` test: 'does not modify table with merged cells', () => {
- `../lexical/packages/lexical-table/src/__tests__/unit/LexicalTableUtils.test.ts:712` test: 'swaps adjacent rows', () => {
- `../lexical/packages/lexical-table/src/__tests__/unit/LexicalTableUtils.test.ts:738` test: 'moves header cells along with the row', () => {
- `../lexical/packages/lexical-table/src/__tests__/unit/LexicalTableUtils.test.ts:788` test: 'preserves table structure after move', () => {
- `../lexical/packages/lexical-table/src/__tests__/unit/LexicalTableUtils.test.ts:817` describe: '$setTableRowIsHeader', () => {
- `../lexical/packages/lexical-table/src/__tests__/unit/LexicalTableUtils.test.ts:818` test: 'sets a row as header', () => {
- `../lexical/packages/lexical-table/src/__tests__/unit/LexicalTableUtils.test.ts:844` test: 'clears a header row', () => {
- `../lexical/packages/lexical-table/src/__tests__/unit/LexicalTableUtils.test.ts:884` test: 'preserves COLUMN bits when setting ROW header', () => {
- `../lexical/packages/lexical-table/src/__tests__/unit/LexicalTableUtils.test.ts:919` test: 'handles colSpan cells', () => {
- `../lexical/packages/lexical-table/src/__tests__/unit/LexicalTableUtils.test.ts:952` test: 'handles rowSpan cells', () => {
- `../lexical/packages/lexical-table/src/__tests__/unit/LexicalTableUtils.test.ts:992` test: 'sets a middle row as header', () => {
- `../lexical/packages/lexical-table/src/__tests__/unit/LexicalTableUtils.test.ts:1018` test: 'throws on out-of-range row index', () => {
- `../lexical/packages/lexical-table/src/__tests__/unit/LexicalTableUtils.test.ts:1040` test: 'clears ROW from BOTH header state, preserving COLUMN', () => {
- `../lexical/packages/lexical-table/src/__tests__/unit/LexicalTableUtils.test.ts:1074` describe: '$setTableColumnIsHeader', () => {
- `../lexical/packages/lexical-table/src/__tests__/unit/LexicalTableUtils.test.ts:1075` test: 'sets a column as header', () => {
- `../lexical/packages/lexical-table/src/__tests__/unit/LexicalTableUtils.test.ts:1101` test: 'clears a header column', () => {
- `../lexical/packages/lexical-table/src/__tests__/unit/LexicalTableUtils.test.ts:1137` test: 'preserves ROW bits when setting COLUMN header', () => {
- `../lexical/packages/lexical-table/src/__tests__/unit/LexicalTableUtils.test.ts:1172` test: 'handles rowSpan cells', () => {
- `../lexical/packages/lexical-table/src/__tests__/unit/LexicalTableUtils.test.ts:1212` test: 'throws on out-of-range column index', () => {
- `../lexical/packages/lexical-table/src/__tests__/unit/LexicalTableUtils.test.ts:1234` test: 'clears COLUMN from BOTH header state, preserving ROW', () => {

## `../lexical/packages/lexical-table/src/__tests__/unit/TableImportExtension.test.ts`

category: portable
family: portable editor behavior
target: indexed; target current Plite package proof and browser proof when DOM-dependent

- `../lexical/packages/lexical-table/src/__tests__/unit/TableImportExtension.test.ts:79` describe: 'TableImportExtension', () => {
- `../lexical/packages/lexical-table/src/__tests__/unit/TableImportExtension.test.ts:80` test: 'basic 2x2 table imports with correct structure', () => {
- `../lexical/packages/lexical-table/src/__tests__/unit/TableImportExtension.test.ts:97` test: '<th scope="col"> → header cell', () => {
- `../lexical/packages/lexical-table/src/__tests__/unit/TableImportExtension.test.ts:106` test: 'table picks up <thead>/<tbody> rows via $descendantsMatching', () => {
- `../lexical/packages/lexical-table/src/__tests__/unit/TableImportExtension.test.ts:120` test: 'row picks up cells via $descendantsMatching', () => {
- `../lexical/packages/lexical-table/src/__tests__/unit/TableImportExtension.test.ts:129` test: 'deprecated TableImportExtension alias still imports tables', () => {

## `../lexical/packages/lexical-utils/src/__tests__/unit/LexicalSlotDfs.test.ts`

category: portable
family: selection-dom-mapping / nested-root
target: indexed; target current Plite package proof and browser proof when DOM-dependent

- `../lexical/packages/lexical-utils/src/__tests__/unit/LexicalSlotDfs.test.ts:72` describe: 'named-slots: $dfs traversal', () => {
- `../lexical/packages/lexical-utils/src/__tests__/unit/LexicalSlotDfs.test.ts:102` test: '$dfsWithSlots visits slot subtrees, slots-first, ahead of children', () => {
- `../lexical/packages/lexical-utils/src/__tests__/unit/LexicalSlotDfs.test.ts:124` test: '$dfsWithSlots slot traversal matches the reference slots-first walk', () => {
- `../lexical/packages/lexical-utils/src/__tests__/unit/LexicalSlotDfs.test.ts:139` test: '$reverseDfsWithSlots visits slots-last, mirroring $dfsWithSlots (#7112 invariant)', () => {
- `../lexical/packages/lexical-utils/src/__tests__/unit/LexicalSlotDfs.test.ts:166` test: 'endNode slot subtrees are not emitted past the inclusive stop', () => {
- `../lexical/packages/lexical-utils/src/__tests__/unit/LexicalSlotDfs.test.ts:191` test: 'reconciler text cache includes slot text (RootNode.__cachedText)', () => {
- `../lexical/packages/lexical-utils/src/__tests__/unit/LexicalSlotDfs.test.ts:206` describe: 'named-slots: $dfs traversal into a decorator host', () => {
- `../lexical/packages/lexical-utils/src/__tests__/unit/LexicalSlotDfs.test.ts:233` test: "$dfsWithSlots descends into a decorator host's slots", () => {
- `../lexical/packages/lexical-utils/src/__tests__/unit/LexicalSlotDfs.test.ts:252` test: "$reverseDfsWithSlots descends into a decorator host's slots", () => {

## `../lexical/packages/lexical-utils/src/__tests__/unit/LexicalUtilsInsertNodeToNearestRoot.test.tsx`

category: portable
family: core package behavior
target: indexed 2 test/describe lines; target packages/plite/test; add focused browser proof only when behavior depends on DOM/runtime transport

- `../lexical/packages/lexical-utils/src/__tests__/unit/LexicalUtilsInsertNodeToNearestRoot.test.tsx:25` describe: 'LexicalUtils#insertNodeToNearestRoot', () => {
- `../lexical/packages/lexical-utils/src/__tests__/unit/LexicalUtilsInsertNodeToNearestRoot.test.tsx:137` it: testCase._, async () => {

## `../lexical/packages/lexical-utils/src/__tests__/unit/LexicalUtilsInsertNodeToNearestRootAtCaret.test.ts`

category: portable
family: selection-dom-mapping / nested-root
target: indexed; target current Plite package proof and browser proof when DOM-dependent

- `../lexical/packages/lexical-utils/src/__tests__/unit/LexicalUtilsInsertNodeToNearestRootAtCaret.test.ts:236` describe: '$insertNodeToNearestRootAtCaret edge cases', () => {
- `../lexical/packages/lexical-utils/src/__tests__/unit/LexicalUtilsInsertNodeToNearestRootAtCaret.test.ts:239` describe: `${kind} with ${
- `../lexical/packages/lexical-utils/src/__tests__/unit/LexicalUtilsInsertNodeToNearestRootAtCaret.test.ts:245` test: scenario.label, () => {

## `../lexical/packages/lexical-utils/src/__tests__/unit/LexicalUtilsIsBlockFullySelected.test.ts`

category: portable
family: portable editor behavior
target: indexed; target current Plite package proof and browser proof when DOM-dependent

- `../lexical/packages/lexical-utils/src/__tests__/unit/LexicalUtilsIsBlockFullySelected.test.ts:48` describe: '$isBlockFullySelected', () => {
- `../lexical/packages/lexical-utils/src/__tests__/unit/LexicalUtilsIsBlockFullySelected.test.ts:51` it: 'reports whether the selection covers the block', () => {
- `../lexical/packages/lexical-utils/src/__tests__/unit/LexicalUtilsIsBlockFullySelected.test.ts:74` it: 'accepts a CaretRange and backward selections', () => {
- `../lexical/packages/lexical-utils/src/__tests__/unit/LexicalUtilsIsBlockFullySelected.test.ts:95` it: 'a selection that extends beyond the block still fully selects it', () => {
- `../lexical/packages/lexical-utils/src/__tests__/unit/LexicalUtilsIsBlockFullySelected.test.ts:123` it: 'handles element points on an ancestor', () => {
- `../lexical/packages/lexical-utils/src/__tests__/unit/LexicalUtilsIsBlockFullySelected.test.ts:140` it: 'handles blocks that end with a decorator', () => {
- `../lexical/packages/lexical-utils/src/__tests__/unit/LexicalUtilsIsBlockFullySelected.test.ts:160` it: 'an empty block is fully selected by its caret', () => {
- `../lexical/packages/lexical-utils/src/__tests__/unit/LexicalUtilsIsBlockFullySelected.test.ts:183` it: 'a fully selected block fully selects its ancestor block', () => {

## `../lexical/packages/lexical-utils/src/__tests__/unit/LexicalUtilsSplitNode.test.tsx`

category: portable
family: core package behavior
target: indexed 3 test/describe lines; target packages/plite/test; add focused browser proof only when behavior depends on DOM/runtime transport

- `../lexical/packages/lexical-utils/src/__tests__/unit/LexicalUtilsSplitNode.test.tsx:20` describe: 'LexicalUtils#splitNode', () => {
- `../lexical/packages/lexical-utils/src/__tests__/unit/LexicalUtilsSplitNode.test.tsx:105` it: testCase._, async () => {
- `../lexical/packages/lexical-utils/src/__tests__/unit/LexicalUtilsSplitNode.test.tsx:140` it: 'throws when splitting root', async () => {

## `../lexical/packages/lexical-utils/src/__tests__/unit/dedupeSelectionRects.test.ts`

category: portable
family: selection-dom-mapping / nested-root
target: indexed; target current Plite package proof and browser proof when DOM-dependent

- `../lexical/packages/lexical-utils/src/__tests__/unit/dedupeSelectionRects.test.ts:26` describe: 'dedupeSelectionRects', () => {
- `../lexical/packages/lexical-utils/src/__tests__/unit/dedupeSelectionRects.test.ts:27` it: 'keeps one of two identical rects (the doubled-opacity duplicate)', () => {
- `../lexical/packages/lexical-utils/src/__tests__/unit/dedupeSelectionRects.test.ts:36` it: 'keeps the smaller text rect when a wider rect contains it (#7106 extra area)', () => {
- `../lexical/packages/lexical-utils/src/__tests__/unit/dedupeSelectionRects.test.ts:44` it: 'keeps the smaller rect regardless of input order', () => {
- `../lexical/packages/lexical-utils/src/__tests__/unit/dedupeSelectionRects.test.ts:51` it: 'preserves genuine multi-line rects (different rows are not contained)', () => {
- `../lexical/packages/lexical-utils/src/__tests__/unit/dedupeSelectionRects.test.ts:59` it: 'drops zero-area rects', () => {
- `../lexical/packages/lexical-utils/src/__tests__/unit/dedupeSelectionRects.test.ts:68` it: 'returns empty for an empty list', () => {
- `../lexical/packages/lexical-utils/src/__tests__/unit/dedupeSelectionRects.test.ts:72` it: 'treats near-identical rects within 1px as duplicates', () => {
- `../lexical/packages/lexical-utils/src/__tests__/unit/dedupeSelectionRects.test.ts:87` it: 'keeps horizontally disjoint rects on the same row (no false containment)', () => {
- `../lexical/packages/lexical-utils/src/__tests__/unit/dedupeSelectionRects.test.ts:96` it: 'does not clip a wide rect (e.g. trailing whitespace) against a disjoint narrower row', () => {
- `../lexical/packages/lexical-utils/src/__tests__/unit/dedupeSelectionRects.test.ts:105` it: 'keeps every row of a ragged multi-row selection (varying offsets, e.g. RTL)', () => {
- `../lexical/packages/lexical-utils/src/__tests__/unit/dedupeSelectionRects.test.ts:144` describe: 'dedupeSelectionRects + createRectsFromDOMRange', () => {
- `../lexical/packages/lexical-utils/src/__tests__/unit/dedupeSelectionRects.test.ts:155` it: 'createRectsFromDOMRange leaves the contained pair (its adjacent-only pass does not catch it)', () => {
- `../lexical/packages/lexical-utils/src/__tests__/unit/dedupeSelectionRects.test.ts:160` it: 'dedupeSelectionRects collapses that survivor pair to the text-hugging rect', () => {
- `../lexical/packages/lexical-utils/src/__tests__/unit/dedupeSelectionRects.test.ts:167` it: 'dedupeSelectionRects is order-independent where createRectsFromDOMRange is not', () => {
- `../lexical/packages/lexical-utils/src/__tests__/unit/dedupeSelectionRects.test.ts:178` it: 'keeps the smaller (text) rect by design — keeping the wider one re-introduces the #7106 extra-area paint', () => {

## `../lexical/packages/lexical-utils/src/__tests__/unit/markSelection.test.tsx`

category: portable
family: selection-dom-mapping / nested-root
target: indexed; target current Plite package proof and browser proof when DOM-dependent

- `../lexical/packages/lexical-utils/src/__tests__/unit/markSelection.test.tsx:47` describe: 'markSelection', () => {
- `../lexical/packages/lexical-utils/src/__tests__/unit/markSelection.test.tsx:49` it: 'does not throw for text-type selection points', async () => {
- `../lexical/packages/lexical-utils/src/__tests__/unit/markSelection.test.tsx:70` it: 'does not throw for element-type selection points', async () => {
- `../lexical/packages/lexical-utils/src/__tests__/unit/markSelection.test.tsx:89` it: 'calls onReposition for a range selection', async () => {
- `../lexical/packages/lexical-utils/src/__tests__/unit/markSelection.test.tsx:109` it: 'returns a cleanup function that can be called safely', async () => {

## `../lexical/packages/lexical-yjs/src/__tests__/browser/SyncCursorsHighlightSheet.test.ts`

category: portable-mixed
family: portable editor behavior
target: indexed; target current Plite package proof and browser proof when DOM-dependent

- `../lexical/packages/lexical-yjs/src/__tests__/browser/SyncCursorsHighlightSheet.test.ts:27` describe: 'getCursorHighlightSheet', () => {
- `../lexical/packages/lexical-yjs/src/__tests__/browser/SyncCursorsHighlightSheet.test.ts:47` test: 'adopts the sheet into the document for a light-DOM editor', () => {
- `../lexical/packages/lexical-yjs/src/__tests__/browser/SyncCursorsHighlightSheet.test.ts:56` test: 're-homes the cached sheet when the editor root moves into a shadow root', () => {
- `../lexical/packages/lexical-yjs/src/__tests__/browser/SyncCursorsHighlightSheet.test.ts:80` test: 'does not duplicate the sheet on repeated calls in the same scope', () => {

## `../lexical/packages/lexical-yjs/src/__tests__/unit/CreateYjsBinding.test.ts`

category: portable
family: portable editor behavior
target: indexed; target current Plite package proof and browser proof when DOM-dependent

- `../lexical/packages/lexical-yjs/src/__tests__/unit/CreateYjsBinding.test.ts:26` describe: 'createYjsBinding', () => {
- `../lexical/packages/lexical-yjs/src/__tests__/unit/CreateYjsBinding.test.ts:27` test: 'uses default rootName "root"', () => {
- `../lexical/packages/lexical-yjs/src/__tests__/unit/CreateYjsBinding.test.ts:39` test: 'uses custom rootName', () => {
- `../lexical/packages/lexical-yjs/src/__tests__/unit/CreateYjsBinding.test.ts:58` test: 'different rootNames create independent shared types', () => {
- `../lexical/packages/lexical-yjs/src/__tests__/unit/CreateYjsBinding.test.ts:91` describe: 'createBinding (legacy wrapper)', () => {
- `../lexical/packages/lexical-yjs/src/__tests__/unit/CreateYjsBinding.test.ts:92` test: 'delegates to createYjsBinding with default rootName', () => {
- `../lexical/packages/lexical-yjs/src/__tests__/unit/CreateYjsBinding.test.ts:110` test: 'throws invariant when doc is null', () => {

## `../lexical/packages/lexical-yjs/src/__tests__/unit/SlotSyncV1.test.ts`

category: portable
family: selection-dom-mapping / nested-root
target: indexed; target current Plite package proof and browser proof when DOM-dependent

- `../lexical/packages/lexical-yjs/src/__tests__/unit/SlotSyncV1.test.ts:66` describe: 'named-slots collab-v1: lexical <-> yjs', () => {
- `../lexical/packages/lexical-yjs/src/__tests__/unit/SlotSyncV1.test.ts:160` test: 'a host with a "title" slot serializes the slot into a `__slots` Y.Map', () => {
- `../lexical/packages/lexical-yjs/src/__tests__/unit/SlotSyncV1.test.ts:197` test: 'a host with no slots sets no `__slots` attribute', () => {
- `../lexical/packages/lexical-yjs/src/__tests__/unit/SlotSyncV1.test.ts:253` test: 'round-trip: a serialized slot restores into a fresh editor', () => {
- `../lexical/packages/lexical-yjs/src/__tests__/unit/SlotSyncV1.test.ts:307` test: 'observer: a remote slot delete removes the slot from the host', async () => {
- `../lexical/packages/lexical-yjs/src/__tests__/unit/SlotSyncV1.test.ts:332` test: 'observer: a remote slot add reconciles into the host', async () => {
- `../lexical/packages/lexical-yjs/src/__tests__/unit/SlotSyncV1.test.ts:360` test: 'observer: editing text inside a slot updates the slot in place', async () => {
- `../lexical/packages/lexical-yjs/src/__tests__/unit/SlotSyncV1.test.ts:397` test: 'observer: a remote slot replace under the same name swaps the slot', async () => {
- `../lexical/packages/lexical-yjs/src/__tests__/unit/SlotSyncV1.test.ts:513` test: 'local: a slot added to an existing host serializes into the slots Y.Map', () => {
- `../lexical/packages/lexical-yjs/src/__tests__/unit/SlotSyncV1.test.ts:536` test: 'local: editing text inside a slot updates the slot shared type in place', () => {
- `../lexical/packages/lexical-yjs/src/__tests__/unit/SlotSyncV1.test.ts:564` test: 'local: removing a slot deletes it from the slots Y.Map', () => {
- `../lexical/packages/lexical-yjs/src/__tests__/unit/SlotSyncV1.test.ts:582` test: 'local: removing a slot clears its collab node from the map', () => {
- `../lexical/packages/lexical-yjs/src/__tests__/unit/SlotSyncV1.test.ts:612` test: 'local: replacing a slot under the same name clears the old collab node', () => {
- `../lexical/packages/lexical-yjs/src/__tests__/unit/SlotSyncV1.test.ts:650` test: 'local: removing the host clears its slot collab node from the map', () => {
- `../lexical/packages/lexical-yjs/src/__tests__/unit/SlotSyncV1.test.ts:678` test: 'observer: a remote slot delete clears its collab node from the map', async () => {
- `../lexical/packages/lexical-yjs/src/__tests__/unit/SlotSyncV1.test.ts:705` test: 'local: an unrelated host edit leaves an untouched slot identical', () => {
- `../lexical/packages/lexical-yjs/src/__tests__/unit/SlotSyncV1.test.ts:733` test: 'local: an unrelated host edit leaves an untouched decorator slot identical', () => {
- `../lexical/packages/lexical-yjs/src/__tests__/unit/SlotSyncV1.test.ts:782` test: 'observer: hostile remote slot entries are skipped without corrupting valid slots', async () => {
- `../lexical/packages/lexical-yjs/src/__tests__/unit/SlotSyncV1.test.ts:837` test: 'local: a slot set on the root syncs to yjs and restores on a peer', () => {
- `../lexical/packages/lexical-yjs/src/__tests__/unit/SlotSyncV1.test.ts:883` test: 'observer: a remote host deletion clears the slot value from the collab node map', async () => {
- `../lexical/packages/lexical-yjs/src/__tests__/unit/SlotSyncV1.test.ts:916` test: 'moving a slot value between hosts converges on a peer', () => {
- `../lexical/packages/lexical-yjs/src/__tests__/unit/SlotSyncV1.test.ts:986` describe: 'named-slots collab-v1: decorator host <-> yjs', () => {
- `../lexical/packages/lexical-yjs/src/__tests__/unit/SlotSyncV1.test.ts:1133` test: 'a decorator host with a "title" slot seeds the slots Y.Map on `_xmlElem`', () => {
- `../lexical/packages/lexical-yjs/src/__tests__/unit/SlotSyncV1.test.ts:1161` test: 'a decorator host with no slots sets no `__slots` attribute', () => {
- `../lexical/packages/lexical-yjs/src/__tests__/unit/SlotSyncV1.test.ts:1209` test: 'round-trip: a serialized decorator-host slot restores into a fresh editor', () => {
- `../lexical/packages/lexical-yjs/src/__tests__/unit/SlotSyncV1.test.ts:1224` test: 'observer: a remote slot delete removes the slot from the decorator host', async () => {
- `../lexical/packages/lexical-yjs/src/__tests__/unit/SlotSyncV1.test.ts:1254` test: 'observer: editing text inside a decorator-host slot updates it in place', async () => {
- `../lexical/packages/lexical-yjs/src/__tests__/unit/SlotSyncV1.test.ts:1279` test: 'observer: a remote slot replace under the same name swaps the decorator-host slot', async () => {
- `../lexical/packages/lexical-yjs/src/__tests__/unit/SlotSyncV1.test.ts:1339` test: 'local: a slot added to an existing decorator host serializes into the slots Y.Map', () => {
- `../lexical/packages/lexical-yjs/src/__tests__/unit/SlotSyncV1.test.ts:1358` test: 'local: editing text inside a decorator-host slot updates the shared type in place', () => {
- `../lexical/packages/lexical-yjs/src/__tests__/unit/SlotSyncV1.test.ts:1384` test: 'local: removing the decorator host clears its slot collab node from the map', () => {
- `../lexical/packages/lexical-yjs/src/__tests__/unit/SlotSyncV1.test.ts:1441` describe: 'named-slots collab-v1: two-client relay', () => {
- `../lexical/packages/lexical-yjs/src/__tests__/unit/SlotSyncV1.test.ts:1597` test: 'a first slot set on a synced element host reaches the peer', async () => {
- `../lexical/packages/lexical-yjs/src/__tests__/unit/SlotSyncV1.test.ts:1658` test: 'a first slot set on a synced decorator host reaches the peer', async () => {
- `../lexical/packages/lexical-yjs/src/__tests__/unit/SlotSyncV1.test.ts:1708` test: 'undo of a first slot set converges on both clients', async () => {
- `../lexical/packages/lexical-yjs/src/__tests__/unit/SlotSyncV1.test.ts:1773` test: 'a declared host syncs its slots map eagerly', () => {
- `../lexical/packages/lexical-yjs/src/__tests__/unit/SlotSyncV1.test.ts:1839` test: 'concurrent first slot sets on a declared host both survive and converge in canonical order', async () => {
- `../lexical/packages/lexical-yjs/src/__tests__/unit/SlotSyncV1.test.ts:1887` test: 'concurrent declared and undeclared adds converge in canonical order', async () => {
- `../lexical/packages/lexical-yjs/src/__tests__/unit/SlotSyncV1.test.ts:1941` test: 'concurrent move of one slot value to different hosts converges without corruption', async () => {
- `../lexical/packages/lexical-yjs/src/__tests__/unit/SlotSyncV1.test.ts:2013` test: 'concurrent edits inside one slot value merge and converge', async () => {

## `../lexical/packages/lexical-yjs/src/__tests__/unit/SlotSyncV2.test.ts`

category: portable
family: selection-dom-mapping / nested-root
target: indexed; target current Plite package proof and browser proof when DOM-dependent

- `../lexical/packages/lexical-yjs/src/__tests__/unit/SlotSyncV2.test.ts:138` describe: 'named-slots collab-v2: lexical <-> yjs', () => {
- `../lexical/packages/lexical-yjs/src/__tests__/unit/SlotSyncV2.test.ts:208` test: 'a host with a "title" slot serializes the slot into a `__slots` Y.Map', () => {
- `../lexical/packages/lexical-yjs/src/__tests__/unit/SlotSyncV2.test.ts:252` test: 'a host with no slots sets no `__slots` attribute', () => {
- `../lexical/packages/lexical-yjs/src/__tests__/unit/SlotSyncV2.test.ts:271` test: 'round-trip: a serialized slot restores into a fresh editor', () => {
- `../lexical/packages/lexical-yjs/src/__tests__/unit/SlotSyncV2.test.ts:318` test: 'round-trip: a non-inline decorator slot restores into a fresh editor', () => {
- `../lexical/packages/lexical-yjs/src/__tests__/unit/SlotSyncV2.test.ts:374` test: 'observer: editing text inside a slot updates the slot node in place', () => {
- `../lexical/packages/lexical-yjs/src/__tests__/unit/SlotSyncV2.test.ts:442` test: 'observer: a remote slot add reconciles into the host', () => {
- `../lexical/packages/lexical-yjs/src/__tests__/unit/SlotSyncV2.test.ts:510` test: 'observer: a remote slot delete removes the slot from the host', () => {
- `../lexical/packages/lexical-yjs/src/__tests__/unit/SlotSyncV2.test.ts:640` test: 'local: a slot added to an existing host serializes into the slots Y.Map', () => {
- `../lexical/packages/lexical-yjs/src/__tests__/unit/SlotSyncV2.test.ts:667` test: 'local: editing text inside a slot updates the slot shared type in place', () => {
- `../lexical/packages/lexical-yjs/src/__tests__/unit/SlotSyncV2.test.ts:699` test: 'local: removing a slot deletes it from the slots Y.Map', () => {
- `../lexical/packages/lexical-yjs/src/__tests__/unit/SlotSyncV2.test.ts:718` test: 'local: removing a slot clears the departing shared type from the mapping', () => {
- `../lexical/packages/lexical-yjs/src/__tests__/unit/SlotSyncV2.test.ts:739` test: 'local: replacing a slot under the same name clears the old shared type from the mapping', () => {
- `../lexical/packages/lexical-yjs/src/__tests__/unit/SlotSyncV2.test.ts:767` test: 'local: an unrelated host edit leaves an untouched slot identical', () => {
- `../lexical/packages/lexical-yjs/src/__tests__/unit/SlotSyncV2.test.ts:799` test: 'local: an unrelated host edit leaves an untouched decorator slot identical', () => {
- `../lexical/packages/lexical-yjs/src/__tests__/unit/SlotSyncV2.test.ts:853` test: 'local: an unrelated host edit leaves an untouched plain decorator slot identical', () => {
- `../lexical/packages/lexical-yjs/src/__tests__/unit/SlotSyncV2.test.ts:896` test: 'setSlot rejects a bare text node as a slot value', () => {
- `../lexical/packages/lexical-yjs/src/__tests__/unit/SlotSyncV2.test.ts:919` test: 'decorator host: a "title" slot serializes into a `__slots` Y.Map', () => {
- `../lexical/packages/lexical-yjs/src/__tests__/unit/SlotSyncV2.test.ts:957` test: 'decorator host: a host with no slots stays unmapped with no `__slots` attribute', () => {
- `../lexical/packages/lexical-yjs/src/__tests__/unit/SlotSyncV2.test.ts:974` test: 'decorator host round-trip: a serialized slot restores into a fresh editor', () => {
- `../lexical/packages/lexical-yjs/src/__tests__/unit/SlotSyncV2.test.ts:1016` test: 'decorator host observer: editing text inside a slot updates it in place', () => {
- `../lexical/packages/lexical-yjs/src/__tests__/unit/SlotSyncV2.test.ts:1079` test: 'decorator host observer: a remote slot delete removes the slot', () => {
- `../lexical/packages/lexical-yjs/src/__tests__/unit/SlotSyncV2.test.ts:1138` test: 'decorator host local: a slot added to an existing host serializes into the slots Y.Map', () => {
- `../lexical/packages/lexical-yjs/src/__tests__/unit/SlotSyncV2.test.ts:1180` test: 'decorator host local: editing text inside a slot updates the shared type in place', () => {
- `../lexical/packages/lexical-yjs/src/__tests__/unit/SlotSyncV2.test.ts:1236` test: 'decorator slot value own-attribute change propagates to yjs', () => {
- `../lexical/packages/lexical-yjs/src/__tests__/unit/SlotSyncV2.test.ts:1285` test: 'V2: removing a slot also cleans up its nested mapping entries', () => {
- `../lexical/packages/lexical-yjs/src/__tests__/unit/SlotSyncV2.test.ts:1333` test: 'local: a first slot set on an already-synced host is written to yjs and reaches a peer', () => {
- `../lexical/packages/lexical-yjs/src/__tests__/unit/SlotSyncV2.test.ts:1395` test: 'local: removing the last slot keeps the empty slots attribute and a later add syncs', () => {
- `../lexical/packages/lexical-yjs/src/__tests__/unit/SlotSyncV2.test.ts:1434` test: 'snapshot: slot membership reflects the snapshot, not the live doc', () => {
- `../lexical/packages/lexical-yjs/src/__tests__/unit/SlotSyncV2.test.ts:1506` test: 'a declared host serializes an eager empty slots map', () => {
- `../lexical/packages/lexical-yjs/src/__tests__/unit/SlotSyncV2.test.ts:1530` test: 'restore applies canonical order regardless of Y.Map insertion order', () => {
- `../lexical/packages/lexical-yjs/src/__tests__/unit/SlotSyncV2.test.ts:1597` test: 'moving a slot value between hosts converges on a peer', () => {

## `../lexical/packages/lexical-yjs/src/__tests__/unit/SyncCursorsOutOfRange.test.ts`

category: portable-mixed
family: portable editor behavior
target: indexed; target current Plite package proof and browser proof when DOM-dependent

- `../lexical/packages/lexical-yjs/src/__tests__/unit/SyncCursorsOutOfRange.test.ts:58` test: editor update
- `../lexical/packages/lexical-yjs/src/__tests__/unit/SyncCursorsOutOfRange.test.ts:262` describe: 'SyncCursors out-of-range relative position (PR #8652)', () => {
- `../lexical/packages/lexical-yjs/src/__tests__/unit/SyncCursorsOutOfRange.test.ts:284` test: 'resolves a caret past the last child to the element end, not the start', () => {
- `../lexical/packages/lexical-yjs/src/__tests__/unit/SyncCursorsOutOfRange.test.ts:308` test: 'keeps the local caret on the empty final line when a collaborator edits', async () => {

## `../lexical/packages/lexical/src/__tests__/browser/Issue7301InlineGridDeletion.test.ts`

category: portable
family: portable editor behavior
target: indexed; target current Plite package proof and browser proof when DOM-dependent

- `../lexical/packages/lexical/src/__tests__/browser/Issue7301InlineGridDeletion.test.ts:75` describe: 'Deletion across adjacent unmergeable text in inline-grid (#7301)', () => {
- `../lexical/packages/lexical/src/__tests__/browser/Issue7301InlineGridDeletion.test.ts:76` test: 'forward delete crosses span boundary inside inline-grid container', async () => {
- `../lexical/packages/lexical/src/__tests__/browser/Issue7301InlineGridDeletion.test.ts:118` test: 'backward delete crosses span boundary inside inline-grid container', async () => {
- `../lexical/packages/lexical/src/__tests__/browser/Issue7301InlineGridDeletion.test.ts:148` test: 'arrow key movement crosses span boundary via modify()', async () => {
- `../lexical/packages/lexical/src/__tests__/browser/Issue7301InlineGridDeletion.test.ts:195` test: 'arrow key command pipeline overrides native handling at boundary', async () => {

## `../lexical/packages/lexical/src/__tests__/browser/Issue8745DeleteLine.test.ts`

category: portable
family: portable editor behavior
target: indexed; target current Plite package proof and browser proof when DOM-dependent

- `../lexical/packages/lexical/src/__tests__/browser/Issue8745DeleteLine.test.ts:60` describe: 'select-all + deleteLine with trailing shadow root (#8745)', () => {
- `../lexical/packages/lexical/src/__tests__/browser/Issue8745DeleteLine.test.ts:61` test: 'leaves at least one child', () => {

## `../lexical/packages/lexical/src/__tests__/browser/Issue8766DeleteCharacter.test.ts`

category: portable
family: portable editor behavior
target: indexed; target current Plite package proof and browser proof when DOM-dependent

- `../lexical/packages/lexical/src/__tests__/browser/Issue8766DeleteCharacter.test.ts:180` describe: 'deleteCharacter never creates a non-collapsed DOM selection (#8766)', () => {
- `../lexical/packages/lexical/src/__tests__/browser/Issue8766DeleteCharacter.test.ts:243` test: 'backspace removes one character with only collapsed DOM selections', () => {
- `../lexical/packages/lexical/src/__tests__/browser/Issue8766DeleteCharacter.test.ts:250` test: 'forward delete removes one character with only collapsed DOM selections', () => {
- `../lexical/packages/lexical/src/__tests__/browser/Issue8766DeleteCharacter.test.ts:254` test: 'backspace deletes a combining mark one code unit at a time', () => {
- `../lexical/packages/lexical/src/__tests__/browser/Issue8766DeleteCharacter.test.ts:265` test: 'backspace on RTL (Hebrew) text deletes logically, one letter at a time', () => {
- `../lexical/packages/lexical/src/__tests__/browser/Issue8766DeleteCharacter.test.ts:276` test: 'backspace on RTL (Arabic) text deletes a combining mark then the base', () => {
- `../lexical/packages/lexical/src/__tests__/browser/Issue8766DeleteCharacter.test.ts:287` test: 'backspace at the end of mixed bidi text deletes the logically-last character', () => {
- `../lexical/packages/lexical/src/__tests__/browser/Issue8766DeleteCharacter.test.ts:297` test: 'forward delete at the start of mixed bidi text deletes the logically-first character', () => {
- `../lexical/packages/lexical/src/__tests__/browser/Issue8766DeleteCharacter.test.ts:304` test: 'backspace removes a whole token node with only collapsed DOM selections', () => {
- `../lexical/packages/lexical/src/__tests__/browser/Issue8766DeleteCharacter.test.ts:313` test: 'backspace on a segmented node removes the last segment with only collapsed DOM selections', () => {
- `../lexical/packages/lexical/src/__tests__/browser/Issue8766DeleteCharacter.test.ts:322` test: 'backspace after a linebreak deletes it with only collapsed DOM selections', () => {
- `../lexical/packages/lexical/src/__tests__/browser/Issue8766DeleteCharacter.test.ts:339` test: 'backspace across a format-run boundary deletes from the previous run', () => {
- `../lexical/packages/lexical/src/__tests__/browser/Issue8766DeleteCharacter.test.ts:356` describe: 'deletes the same whole grapheme the engine would select natively', () => {
- `../lexical/packages/lexical/src/__tests__/browser/Issue8766DeleteCharacter.test.ts:382` test: description, () => {
- `../lexical/packages/lexical/src/__tests__/browser/Issue8766DeleteCharacter.test.ts:401` describe: 'deleteLine and deleteWord around inline decorators', () => {
- `../lexical/packages/lexical/src/__tests__/browser/Issue8766DeleteCharacter.test.ts:419` test: 'forward deleteLine at a caret before an inline decorator deletes the rest of the line', () => {
- `../lexical/packages/lexical/src/__tests__/browser/Issue8766DeleteCharacter.test.ts:435` test: 'forward deleteWord at a caret before an inline decorator deletes it', () => {

## `../lexical/packages/lexical/src/__tests__/browser/LexicalComposition.test.ts`

category: portable
family: beforeinput-input / browser-engine
target: indexed; target current Plite package proof and browser proof when DOM-dependent

- `../lexical/packages/lexical/src/__tests__/browser/LexicalComposition.test.ts:29` test: navigator.userAgent);
- `../lexical/packages/lexical/src/__tests__/browser/LexicalComposition.test.ts:83` describe: 'compose() helper — browser composition tests', () => {
- `../lexical/packages/lexical/src/__tests__/browser/LexicalComposition.test.ts:84` test: 'Korean jamo composition produces correct text', async () => {
- `../lexical/packages/lexical/src/__tests__/browser/LexicalComposition.test.ts:100` test: 'Korean two-syllable composition', async () => {
- `../lexical/packages/lexical/src/__tests__/browser/LexicalComposition.test.ts:112` test: 'composition into existing text', async () => {
- `../lexical/packages/lexical/src/__tests__/browser/LexicalComposition.test.ts:132` test: 'cancelled composition reverts text', async () => {
- `../lexical/packages/lexical/src/__tests__/browser/LexicalComposition.test.ts:155` test: 'composition on bold-formatted text', async () => {
- `../lexical/packages/lexical/src/__tests__/browser/LexicalComposition.test.ts:176` test: 'composition replaces selected text', async () => {
- `../lexical/packages/lexical/src/__tests__/browser/LexicalComposition.test.ts:202` test: 'three consecutive compositions', async () => {
- `../lexical/packages/lexical/src/__tests__/browser/LexicalComposition.test.ts:215` test: 'composition at middle of text', async () => {
- `../lexical/packages/lexical/src/__tests__/browser/LexicalComposition.test.ts:243` test: 'composition then undo reverts to previous state', async () => {
- `../lexical/packages/lexical/src/__tests__/browser/LexicalComposition.test.ts:265` test: 'Japanese romaji-to-hiragana composition', async () => {
- `../lexical/packages/lexical/src/__tests__/browser/LexicalComposition.test.ts:288` test: 'composition after arrow navigation', async () => {
- `../lexical/packages/lexical/src/__tests__/browser/LexicalComposition.test.ts:317` describe: 'Composition edge cases', () => {
- `../lexical/packages/lexical/src/__tests__/browser/LexicalComposition.test.ts:318` test: 'composition in empty paragraph (element anchor ZWSP path)', async () => {
- `../lexical/packages/lexical/src/__tests__/browser/LexicalComposition.test.ts:334` test: 'composition on token node redirects to sibling', async () => {
- `../lexical/packages/lexical/src/__tests__/browser/LexicalComposition.test.ts:353` test: 'backspace-all composition ends with empty data', async () => {
- `../lexical/packages/lexical/src/__tests__/browser/LexicalComposition.test.ts:377` test: 'composition with newline commit creates new paragraph', async () => {
- `../lexical/packages/lexical/src/__tests__/browser/LexicalComposition.test.ts:396` test: 'latin text before and after composition', async () => {
- `../lexical/packages/lexical/src/__tests__/browser/LexicalComposition.test.ts:421` test: 'composition with explicit selection range', async () => {
- `../lexical/packages/lexical/src/__tests__/browser/LexicalComposition.test.ts:442` describe: 'Composition state tracking', () => {
- `../lexical/packages/lexical/src/__tests__/browser/LexicalComposition.test.ts:443` test: 'editor.isComposing() is true during composition, false after', async () => {
- `../lexical/packages/lexical/src/__tests__/browser/LexicalComposition.test.ts:467` test: 'composing text is visible in model before commit', async () => {
- `../lexical/packages/lexical/src/__tests__/browser/LexicalComposition.test.ts:556` test: 'COMPOSITION_START_TAG and COMPOSITION_END_TAG appear in updates', async () => {
- `../lexical/packages/lexical/src/__tests__/browser/LexicalComposition.test.ts:579` describe: 'Firefox deferred compositionend', () => {
- `../lexical/packages/lexical/src/__tests__/browser/LexicalComposition.test.ts:580` test: !IS_FIREFOX)(

## `../lexical/packages/lexical/src/__tests__/browser/LexicalFirefoxDecoratorInput.test.ts`

category: portable
family: beforeinput-input / browser-engine
target: indexed; target current Plite package proof and browser proof when DOM-dependent

- `../lexical/packages/lexical/src/__tests__/browser/LexicalFirefoxDecoratorInput.test.ts:61` describe: 'Synthetic Firefox-like decorator input events', () => {
- `../lexical/packages/lexical/src/__tests__/browser/LexicalFirefoxDecoratorInput.test.ts:62` test: 'ignores input and beforeinput retargeted from focused decorator controls', () => {

## `../lexical/packages/lexical/src/__tests__/browser/LexicalFirefoxDecoratorRetarget.test.ts`

category: portable
family: beforeinput-input / browser-engine
target: indexed; target current Plite package proof and browser proof when DOM-dependent

- `../lexical/packages/lexical/src/__tests__/browser/LexicalFirefoxDecoratorRetarget.test.ts:106` describe: 'Decorator-owned input/beforeinput is not turned into editor commands', () => {
- `../lexical/packages/lexical/src/__tests__/browser/LexicalFirefoxDecoratorRetarget.test.ts:110` test: 'events dispatched from the focused control are ignored', () => {
- `../lexical/packages/lexical/src/__tests__/browser/LexicalFirefoxDecoratorRetarget.test.ts:122` test: 'events retargeted to the editor root are ignored', () => {

## `../lexical/packages/lexical/src/__tests__/browser/ShadowRootSelection.test.ts`

category: portable
family: selection-dom-mapping / nested-root
target: indexed; target current Plite package proof and browser proof when DOM-dependent

- `../lexical/packages/lexical/src/__tests__/browser/ShadowRootSelection.test.ts:63` test: userAgent) && !/Firefox/.test(userAgent);
- `../lexical/packages/lexical/src/__tests__/browser/ShadowRootSelection.test.ts:122` describe: 'DOM shadow root selection (browser)', () => {
- `../lexical/packages/lexical/src/__tests__/browser/ShadowRootSelection.test.ts:130` test: 'getDOMShadowRoots walks out of nested shadow trees', () => {
- `../lexical/packages/lexical/src/__tests__/browser/ShadowRootSelection.test.ts:161` test: 'closed shadow roots are opaque from outside', () => {
- `../lexical/packages/lexical/src/__tests__/browser/ShadowRootSelection.test.ts:176` test: !SUPPORTS_COMPOSED_RANGES)(
- `../lexical/packages/lexical/src/__tests__/browser/ShadowRootSelection.test.ts:200` test: !SUPPORTS_COMPOSED_RANGES)(
- `../lexical/packages/lexical/src/__tests__/browser/ShadowRootSelection.test.ts:218` test: 'falls back to the Selection itself in the light DOM', () => {
- `../lexical/packages/lexical/src/__tests__/browser/ShadowRootSelection.test.ts:243` test: 'getActiveElement / getActiveElementDeep see through the shadow host', () => {
- `../lexical/packages/lexical/src/__tests__/browser/ShadowRootSelection.test.ts:254` test: !SUPPORTS_COMPOSED_RANGES)(
- `../lexical/packages/lexical/src/__tests__/browser/ShadowRootSelection.test.ts:278` test: !SUPPORTS_COMPOSED_RANGES)(
- `../lexical/packages/lexical/src/__tests__/browser/ShadowRootSelection.test.ts:304` test: !SUPPORTS_COMPOSED_RANGES)(
- `../lexical/packages/lexical/src/__tests__/browser/ShadowRootSelection.test.ts:350` test: !SUPPORTS_COMPOSED_RANGES \|\| !IS_CHROMIUM_LIKE)(
- `../lexical/packages/lexical/src/__tests__/browser/ShadowRootSelection.test.ts:394` test: !SUPPORTS_COMPOSED_RANGES)(
- `../lexical/packages/lexical/src/__tests__/browser/ShadowRootSelection.test.ts:459` test: 'resolves focus and selection for an editor inside an iframe', () => {
- `../lexical/packages/lexical/src/__tests__/browser/ShadowRootSelection.test.ts:513` test: !SUPPORTS_COMPOSED_RANGES)(
- `../lexical/packages/lexical/src/__tests__/browser/ShadowRootSelection.test.ts:566` test: !SUPPORTS_COMPOSED_RANGES)(
- `../lexical/packages/lexical/src/__tests__/browser/ShadowRootSelection.test.ts:603` test: !SUPPORTS_COMPOSED_RANGES)(
- `../lexical/packages/lexical/src/__tests__/browser/ShadowRootSelection.test.ts:641` describe: 'getComposedEventTarget', () => {
- `../lexical/packages/lexical/src/__tests__/browser/ShadowRootSelection.test.ts:642` test: 'returns the composed-path target inside a shadow root', () => {
- `../lexical/packages/lexical/src/__tests__/browser/ShadowRootSelection.test.ts:670` test: 'falls back to event.target when composedPath is unavailable', () => {
- `../lexical/packages/lexical/src/__tests__/browser/ShadowRootSelection.test.ts:685` test: 'returns event.target when composedPath returns an empty array', () => {
- `../lexical/packages/lexical/src/__tests__/browser/ShadowRootSelection.test.ts:702` describe: 'window-attached pointerdown listener (shadow root regression)', () => {
- `../lexical/packages/lexical/src/__tests__/browser/ShadowRootSelection.test.ts:703` test: !SUPPORTS_COMPOSED_RANGES)(
- `../lexical/packages/lexical/src/__tests__/browser/ShadowRootSelection.test.ts:734` describe: 'shadow-aware querySelector helpers', () => {
- `../lexical/packages/lexical/src/__tests__/browser/ShadowRootSelection.test.ts:735` test: 'descends open shadow roots when collecting editors', () => {
- `../lexical/packages/lexical/src/__tests__/browser/ShadowRootSelection.test.ts:766` test: 'descends open shadow roots from elementFromPoint', () => {
- `../lexical/packages/lexical/src/__tests__/browser/ShadowRootSelection.test.ts:797` describe: 'scroll listener attached to a shadow root', () => {
- `../lexical/packages/lexical/src/__tests__/browser/ShadowRootSelection.test.ts:804` test: 'catches scrolls at every enclosing shadow root for a nested node', async () => {
- `../lexical/packages/lexical/src/__tests__/browser/ShadowRootSelection.test.ts:880` test: 'keys the walk off the editor root when the target is portaled to light DOM', async () => {
- `../lexical/packages/lexical/src/__tests__/browser/ShadowRootSelection.test.ts:921` test: 'findAllLexicalElementsDeep yields elements inside open shadow roots', () => {
- `../lexical/packages/lexical/src/__tests__/browser/ShadowRootSelection.test.ts:937` test: 'findAllLexicalElementsDeep descends through nested shadow roots', () => {
- `../lexical/packages/lexical/src/__tests__/browser/ShadowRootSelection.test.ts:953` describe: 'getActiveElementDeep through nested shadow roots', () => {
- `../lexical/packages/lexical/src/__tests__/browser/ShadowRootSelection.test.ts:954` test: 'descends to the focused element while the shallow read stops at the host', () => {
- `../lexical/packages/lexical/src/__tests__/browser/ShadowRootSelection.test.ts:978` describe: 'selectionchange attribution under nesting', () => {
- `../lexical/packages/lexical/src/__tests__/browser/ShadowRootSelection.test.ts:979` test: 'attributes to the inner shadow-mounted editor over its light-DOM parent', async () => {
- `../lexical/packages/lexical/src/__tests__/browser/ShadowRootSelection.test.ts:1072` describe: 'caretFromPoint shadow fallback', () => {
- `../lexical/packages/lexical/src/__tests__/browser/ShadowRootSelection.test.ts:1073` test: 'resolves a text node and offset inside the shadow tree', () => {
- `../lexical/packages/lexical/src/__tests__/browser/ShadowRootSelection.test.ts:1093` test: 'returns null for coordinates outside the editor', () => {
- `../lexical/packages/lexical/src/__tests__/browser/ShadowRootSelection.test.ts:1100` test: 'vertical-first comparison picks the correct line on a wrapped span', () => {
- `../lexical/packages/lexical/src/__tests__/browser/ShadowRootSelection.test.ts:1146` test: 'falls through to caretRangeFromPoint when element has no text nodes', () => {

## `../lexical/packages/lexical/src/__tests__/unit/CodeBlock.test.ts`

category: portable
family: serialization-parsing / marks-inline
target: indexed 2 test/describe lines; target packages/plite/test; packages/plite-history/test; apps/www/tests/plite-browser/donor/examples/richtext.test.ts

- `../lexical/packages/lexical/src/__tests__/unit/CodeBlock.test.ts:19` describe: 'CodeBlock tests', () => {
- `../lexical/packages/lexical/src/__tests__/unit/CodeBlock.test.ts:118` test: `Code block html paste: ${testCase.name}`, async () => {

## `../lexical/packages/lexical/src/__tests__/unit/FastPathCrossParent.test.ts`

category: portable
family: portable editor behavior
target: indexed; target current Plite package proof and browser proof when DOM-dependent

- `../lexical/packages/lexical/src/__tests__/unit/FastPathCrossParent.test.ts:184` describe: 'fast path differential fuzz — cross-parent moves', () => {
- `../lexical/packages/lexical/src/__tests__/unit/FastPathCrossParent.test.ts:189` test: 'fast path matches the general walk across cross-parent moves', () => {

## `../lexical/packages/lexical/src/__tests__/unit/FastPathCrossParentTextCache.test.ts`

category: portable
family: portable editor behavior
target: indexed; target current Plite package proof and browser proof when DOM-dependent

- `../lexical/packages/lexical/src/__tests__/unit/FastPathCrossParentTextCache.test.ts:68` describe: 'children fast path: cross-parent move and sibling text cache', () => {
- `../lexical/packages/lexical/src/__tests__/unit/FastPathCrossParentTextCache.test.ts:69` test: 'getTextContent matches the live tree after moving + merging a trailing link', () => {
- `../lexical/packages/lexical/src/__tests__/unit/FastPathCrossParentTextCache.test.ts:160` test: 'flipping a non-last suffix element block<->inline keeps the cache in sync', () => {

## `../lexical/packages/lexical/src/__tests__/unit/HTMLCopyAndPaste.test.ts`

category: portable
family: clipboard-paste / browser-engine
target: indexed 3 test/describe lines; target packages/plite/test/clipboard-contract.ts; packages/plite-dom/test/clipboard-boundary.test.ts; apps/www/tests/plite-browser/donor/examples/paste-html.test.ts; apps/www/tests/plite-browser/donor/stress/generated-editing.test.ts

- `../lexical/packages/lexical/src/__tests__/unit/HTMLCopyAndPaste.test.ts:20` describe: 'HTMLCopyAndPaste tests', () => {
- `../lexical/packages/lexical/src/__tests__/unit/HTMLCopyAndPaste.test.ts:121` test: `HTML copy paste: ${testCase.name}`, async () => {
- `../lexical/packages/lexical/src/__tests__/unit/HTMLCopyAndPaste.test.ts:146` test: 'iOS fix: Word predictions should be handled as plain text to maintain selection formatting', async () => {

## `../lexical/packages/lexical/src/__tests__/unit/HandleTextDrop.test.ts`

category: portable
family: clipboard / drag transport
target: indexed; target current Plite package proof and browser proof when DOM-dependent

- `../lexical/packages/lexical/src/__tests__/unit/HandleTextDrop.test.ts:99` describe: '$handleTextDrop', () => {
- `../lexical/packages/lexical/src/__tests__/unit/HandleTextDrop.test.ts:105` test: 'moves a selected word later within the same TextNode', async () => {
- `../lexical/packages/lexical/src/__tests__/unit/HandleTextDrop.test.ts:138` test: 'moves a selected word earlier within the same TextNode', async () => {
- `../lexical/packages/lexical/src/__tests__/unit/HandleTextDrop.test.ts:169` test: 'no-op when the drop point is inside the source range', async () => {
- `../lexical/packages/lexical/src/__tests__/unit/HandleTextDrop.test.ts:202` test: 'moves a selection across TextNodes in the same block', async () => {
- `../lexical/packages/lexical/src/__tests__/unit/HandleTextDrop.test.ts:238` test: 'returns false for an external drag (no marker), letting the browser handle it', async () => {
- `../lexical/packages/lexical/src/__tests__/unit/HandleTextDrop.test.ts:262` test: 'returns false when caretFromPoint cannot resolve a location', async () => {
- `../lexical/packages/lexical/src/__tests__/unit/HandleTextDrop.test.ts:282` test: 'handles a backward (right-to-left) source selection', async () => {
- `../lexical/packages/lexical/src/__tests__/unit/HandleTextDrop.test.ts:317` test: 'preserves DecoratorNodes in the source when moved to a new location', async () => {
- `../lexical/packages/lexical/src/__tests__/unit/HandleTextDrop.test.ts:415` test: 'no-op when drop is inside a multi-node source range', async () => {
- `../lexical/packages/lexical/src/__tests__/unit/HandleTextDrop.test.ts:454` describe: '$handleRichTextDrop across editors', () => {
- `../lexical/packages/lexical/src/__tests__/unit/HandleTextDrop.test.ts:485` test: 'inserts in the destination and dispatches deleteByDrag at the source root', async () => {
- `../lexical/packages/lexical/src/__tests__/unit/HandleTextDrop.test.ts:569` test: 'cancelled cross-editor drag leaves both editors untouched', async () => {

## `../lexical/packages/lexical/src/__tests__/unit/IosKeyboardSuggestions.test.ts`

category: portable
family: beforeinput-input / browser-engine
target: indexed; target current Plite package proof and browser proof when DOM-dependent

- `../lexical/packages/lexical/src/__tests__/unit/IosKeyboardSuggestions.test.ts:131` describe: 'iOS keyboard suggestion-bar fix — KEY_BACKSPACE_COMMAND pass-through', () => {
- `../lexical/packages/lexical/src/__tests__/unit/IosKeyboardSuggestions.test.ts:136` test: 'KEY_BACKSPACE_COMMAND returns false and does not call event.preventDefault() on iOS', () => {
- `../lexical/packages/lexical/src/__tests__/unit/IosKeyboardSuggestions.test.ts:152` test: 'deleteContentBackward beforeinput with collapsed targetRange deletes one character', () => {
- `../lexical/packages/lexical/src/__tests__/unit/IosKeyboardSuggestions.test.ts:181` test: 'KEY_BACKSPACE_COMMAND does not preventDefault regardless of the language locale', () => {
- `../lexical/packages/lexical/src/__tests__/unit/IosKeyboardSuggestions.test.ts:209` test: 'cursor at start of text does not delete (nothing to delete)', () => {
- `../lexical/packages/lexical/src/__tests__/unit/IosKeyboardSuggestions.test.ts:227` test: 'returns false when there is no selection', () => {
- `../lexical/packages/lexical/src/__tests__/unit/IosKeyboardSuggestions.test.ts:239` test: 'repeated beforeinput deleteContentBackward events delete characters one by one', () => {

## `../lexical/packages/lexical/src/__tests__/unit/Issue7729Repro.test.ts`

category: portable
family: portable editor behavior
target: indexed; target current Plite package proof and browser proof when DOM-dependent

- `../lexical/packages/lexical/src/__tests__/unit/Issue7729Repro.test.ts:41` describe: 'Issue #7729: paragraph indent round-trip via data-lexical-indent', () => {
- `../lexical/packages/lexical/src/__tests__/unit/Issue7729Repro.test.ts:42` test: 'exportDOM emits data-lexical-indent and importDOM round-trips', () => {
- `../lexical/packages/lexical/src/__tests__/unit/Issue7729Repro.test.ts:63` test: 'data-lexical-indent wins over a calc(...) padding-inline-start', () => {
- `../lexical/packages/lexical/src/__tests__/unit/Issue7729Repro.test.ts:83` test: 'data-lexical-indent wins over a non-40-multiple padding-inline-start', () => {
- `../lexical/packages/lexical/src/__tests__/unit/Issue7729Repro.test.ts:103` test: 'falls back to padding heuristic when data-lexical-indent is absent', () => {

## `../lexical/packages/lexical/src/__tests__/unit/Issue7876Repro.test.ts`

category: portable
family: portable editor behavior
target: indexed; target current Plite package proof and browser proof when DOM-dependent

- `../lexical/packages/lexical/src/__tests__/unit/Issue7876Repro.test.ts:57` describe: 'Issue #7876: setEditorState triggers transforms on parsed state', () => {
- `../lexical/packages/lexical/src/__tests__/unit/Issue7876Repro.test.ts:58` test: 'text-node transform fires for a JSON state passed to setEditorState', () => {
- `../lexical/packages/lexical/src/__tests__/unit/Issue7876Repro.test.ts:76` test: 'setEditorState consumes the `_parsed` flag so re-applying the resulting state does not re-trigger transforms', () => {
- `../lexical/packages/lexical/src/__tests__/unit/Issue7876Repro.test.ts:97` test: 'a non-idempotent transform stabilises in two passes on a parsed state', () => {
- `../lexical/packages/lexical/src/__tests__/unit/Issue7876Repro.test.ts:116` test: 'setEditorState completes within bound on a 1000-paragraph parsed state', () => {

## `../lexical/packages/lexical/src/__tests__/unit/Issue8563Repro.test.ts`

category: portable
family: portable editor behavior
target: indexed; target current Plite package proof and browser proof when DOM-dependent

- `../lexical/packages/lexical/src/__tests__/unit/Issue8563Repro.test.ts:26` describe: 'Issue #8563: full reconcile with same-size child key swap', () => {
- `../lexical/packages/lexical/src/__tests__/unit/Issue8563Repro.test.ts:27` test: 'undo (setEditorState) does not crash when a child is replaced by a different-key child of equal count', () => {

## `../lexical/packages/lexical/src/__tests__/unit/Issue8722Repro.test.ts`

category: portable
family: portable editor behavior
target: indexed; target current Plite package proof and browser proof when DOM-dependent

- `../lexical/packages/lexical/src/__tests__/unit/Issue8722Repro.test.ts:33` describe: 'DELETE_LINE_COMMAND on empty ListItem with preceding decorator (#8722)', () => {
- `../lexical/packages/lexical/src/__tests__/unit/Issue8722Repro.test.ts:34` test: 'deleteCharacter backward from empty ListItem should not remove the preceding decorator', () => {
- `../lexical/packages/lexical/src/__tests__/unit/Issue8722Repro.test.ts:62` test: [
- `../lexical/packages/lexical/src/__tests__/unit/Issue8722Repro.test.ts:118` test: 'deleteLine backward from empty ListItem preceded by empty paragraph merges them', () => {
- `../lexical/packages/lexical/src/__tests__/unit/Issue8722Repro.test.ts:151` test: 'deleteLine backward from empty ListItem preceded by non-empty paragraph should work normally', () => {

## `../lexical/packages/lexical/src/__tests__/unit/Issue8724Repro.test.ts`

category: portable
family: portable editor behavior
target: indexed; target current Plite package proof and browser proof when DOM-dependent

- `../lexical/packages/lexical/src/__tests__/unit/Issue8724Repro.test.ts:71` describe: 'Paste normalization of non-inline nodes (#8713, #8724)', () => {
- `../lexical/packages/lexical/src/__tests__/unit/Issue8724Repro.test.ts:77` test: 'block node at a block cursor inside an inline-only element splits up to the shadow root', () => {
- `../lexical/packages/lexical/src/__tests__/unit/Issue8724Repro.test.ts:115` test: 'block node at a block cursor inside an inline-only element splits up to the root', () => {
- `../lexical/packages/lexical/src/__tests__/unit/Issue8724Repro.test.ts:147` test: 'still inserts a block node directly at a block cursor on a shadow root (#8708)', () => {
- `../lexical/packages/lexical/src/__tests__/unit/Issue8724Repro.test.ts:179` describe: 'Paste normalization does not regress lists (#8724)', () => {
- `../lexical/packages/lexical/src/__tests__/unit/Issue8724Repro.test.ts:180` test: 'block node pasted in a list item text splits the list (unchanged CASE 3)', () => {
- `../lexical/packages/lexical/src/__tests__/unit/Issue8724Repro.test.ts:217` test: 'block node at an element point on a list item holding a nested list does not crash', () => {
- `../lexical/packages/lexical/src/__tests__/unit/Issue8724Repro.test.ts:263` describe: 'Paste flattens non-inline nodes inside an inline-only element (#8724)', () => {
- `../lexical/packages/lexical/src/__tests__/unit/Issue8724Repro.test.ts:270` test: 'drops a block-only paste with no inline form', () => {
- `../lexical/packages/lexical/src/__tests__/unit/Issue8724Repro.test.ts:309` test: 'keeps the inline content of a block paste', () => {

## `../lexical/packages/lexical/src/__tests__/unit/Issue8745Repro.test.ts`

category: portable
family: portable editor behavior
target: indexed; target current Plite package proof and browser proof when DOM-dependent

- `../lexical/packages/lexical/src/__tests__/unit/Issue8745Repro.test.ts:37` describe: 'Select-all + delete with trailing shadow root (#8745)', () => {
- `../lexical/packages/lexical/src/__tests__/unit/Issue8745Repro.test.ts:38` test: 'leaves one empty paragraph when document ends with a shadow root', () => {
- `../lexical/packages/lexical/src/__tests__/unit/Issue8745Repro.test.ts:68` test: 'leaves one empty paragraph with nested shadow roots', () => {
- `../lexical/packages/lexical/src/__tests__/unit/Issue8745Repro.test.ts:100` test: 'leaves one empty paragraph with multi-child shadow root (columns)', () => {
- `../lexical/packages/lexical/src/__tests__/unit/Issue8745Repro.test.ts:136` test: 'preserves content after shadow root when shadow root is in the middle', () => {
- `../lexical/packages/lexical/src/__tests__/unit/Issue8745Repro.test.ts:169` test: 'deleteCharacter with select-all cleans up trailing shadow root', () => {
- `../lexical/packages/lexical/src/__tests__/unit/Issue8745Repro.test.ts:200` test: 'heading first child + backward deleteCharacter: reproduces issue author scenario', () => {
- `../lexical/packages/lexical/src/__tests__/unit/Issue8745Repro.test.ts:233` test: 'paragraph first child + backward deleteCharacter: simple case', () => {
- `../lexical/packages/lexical/src/__tests__/unit/Issue8745Repro.test.ts:264` test: 'HR + collapsible only: select-all delete leaves at least one child', () => {
- `../lexical/packages/lexical/src/__tests__/unit/Issue8745Repro.test.ts:303` test: 'select-all + forward deleteCharacter leaves at least one child', () => {
- `../lexical/packages/lexical/src/__tests__/unit/Issue8745Repro.test.ts:333` test: 'select-all + removeText leaves at least one child', () => {
- `../lexical/packages/lexical/src/__tests__/unit/Issue8745Repro.test.ts:363` test: 'NodeSelection.deleteNodes leaves at least one root child', () => {
- `../lexical/packages/lexical/src/__tests__/unit/Issue8745Repro.test.ts:396` test: 'partial deletion within shadow root preserves structure', () => {
- `../lexical/packages/lexical/src/__tests__/unit/Issue8745Repro.test.ts:452` test: 'shadow root only (no paragraph): select-all + removeText leaves at least one child', () => {
- `../lexical/packages/lexical/src/__tests__/unit/Issue8745Repro.test.ts:479` test: 'shadow root only (no paragraph): select-all + backward deleteCharacter leaves at least one child', () => {

## `../lexical/packages/lexical/src/__tests__/unit/LexicalAndroidChromeComposition.test.ts`

category: portable
family: beforeinput-input / browser-engine
target: indexed; target current Plite package proof and browser proof when DOM-dependent

- `../lexical/packages/lexical/src/__tests__/unit/LexicalAndroidChromeComposition.test.ts:62` describe: 'Android Chrome composition — format mismatch ZWSP skip', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalAndroidChromeComposition.test.ts:63` test: 'compositionStart with format mismatch skips CONTROLLED_TEXT_INSERTION', async () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalAndroidChromeComposition.test.ts:89` test: 'compositionStart with element anchor still dispatches CONTROLLED_TEXT_INSERTION', async () => {

## `../lexical/packages/lexical/src/__tests__/unit/LexicalDOMCapturedSelection.test.ts`

category: portable
family: selection-dom-mapping / nested-root
target: indexed; target current Plite package proof and browser proof when DOM-dependent

- `../lexical/packages/lexical/src/__tests__/unit/LexicalDOMCapturedSelection.test.ts:43` describe: 'setDOMUnmanaged options (Issue #8584)', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalDOMCapturedSelection.test.ts:44` test: 'default options: marks unmanaged, leaves captureSelection off', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalDOMCapturedSelection.test.ts:54` test: 'captureSelection: true marks both unmanaged and capturing', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalDOMCapturedSelection.test.ts:64` test: 'captureSelection: false equivalent to default', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalDOMCapturedSelection.test.ts:74` test: 'captureSelection: false clears an existing flag', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalDOMCapturedSelection.test.ts:84` test: 'descendant cannot opt out when ancestor is captured (walk)', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalDOMCapturedSelection.test.ts:96` test: 'unmarked DOM is neither unmanaged nor capturing', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalDOMCapturedSelection.test.ts:106` describe: 'isDOMCapturingSelection (Issue #8584)', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalDOMCapturedSelection.test.ts:107` test: 'captureSelection-marked DOM returns true', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalDOMCapturedSelection.test.ts:116` test: 'descendant of captureSelection-marked DOM returns true', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalDOMCapturedSelection.test.ts:127` test: 'unmanaged-only DOM (no captureSelection) is not captured', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalDOMCapturedSelection.test.ts:136` test: 'DecoratorNode subtree still returns true (BC preserved)', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalDOMCapturedSelection.test.ts:156` test: 'plain DOM outside the editor returns false', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalDOMCapturedSelection.test.ts:164` test: 'editor root element returns false', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalDOMCapturedSelection.test.ts:172` test: 'walk aborts at a Lexical-node DOM — ancestor capture above editor does not leak in', () => {

## `../lexical/packages/lexical/src/__tests__/unit/LexicalDOMSlot.test.tsx`

category: portable
family: selection-dom-mapping / nested-root
target: indexed; target current Plite package proof and browser proof when DOM-dependent

- `../lexical/packages/lexical/src/__tests__/unit/LexicalDOMSlot.test.tsx:31` describe: 'ElementDOMSlot class', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalDOMSlot.test.tsx:63` test: 'constructor defaults before/after to null', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalDOMSlot.test.tsx:71` test: 'constructor accepts before and after', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalDOMSlot.test.tsx:82` test: 'withBefore returns a new slot, preserves after and element', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalDOMSlot.test.tsx:97` test: 'withAfter returns a new slot, preserves before and element', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalDOMSlot.test.tsx:109` test: 'withElement preserves before / after on the new element', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalDOMSlot.test.tsx:121` test: 'withElement returns same instance when element is unchanged', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalDOMSlot.test.tsx:128` test: 'insertChild appends when before is null', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalDOMSlot.test.tsx:137` test: 'insertChild inserts before the slot.before node', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalDOMSlot.test.tsx:148` test: 'getFirstChild returns null for empty element', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalDOMSlot.test.tsx:154` test: 'getFirstChild skips past slot.after sibling', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalDOMSlot.test.tsx:164` test: 'getFirstChild returns null when only slot.before is present', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalDOMSlot.test.tsx:172` test: 'getFirstChildOffset is 0 with no after', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalDOMSlot.test.tsx:178` test: 'getFirstChildOffset counts DOM siblings up to and including after', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalDOMSlot.test.tsx:202` test: 'getFirstChild skips a head block cursor (no slot.after)', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalDOMSlot.test.tsx:217` test: 'getFirstChild skips a head block cursor after slot.after', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalDOMSlot.test.tsx:232` test: 'getFirstChild ignores a non-head block cursor', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalDOMSlot.test.tsx:246` test: 'getFirstChildOffset counts a head block cursor (no slot.after)', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalDOMSlot.test.tsx:260` test: 'getFirstChildOffset counts slot.after and a head block cursor', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalDOMSlot.test.tsx:275` test: 'getFirstChildOffset stops at slot.before when there are no children', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalDOMSlot.test.tsx:286` test: 'getFirstChildOffset is 0 for an empty element with only slot.before', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalDOMSlot.test.tsx:295` describe: 'ElementDOMSlot integration: leading decoration (slot.after)', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalDOMSlot.test.tsx:344` test: 'decoration sits in DOM before lexical children', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalDOMSlot.test.tsx:361` test: 'appending children keeps the leading decoration first', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalDOMSlot.test.tsx:384` test: 'clearing children removes lexical content but keeps decoration', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalDOMSlot.test.tsx:406` test: 'resolveChildIndex maps DOM offset to lexical index using firstChildOffset', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalDOMSlot.test.tsx:457` test: 'resolveChildIndex skips a block cursor interleaved between children', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalDOMSlot.test.tsx:502` describe: 'ElementDOMSlot integration: trailing decoration (slot.before)', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalDOMSlot.test.tsx:551` test: 'decoration sits in DOM after lexical children', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalDOMSlot.test.tsx:567` test: 'appending children keeps the trailing decoration last', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalDOMSlot.test.tsx:595` test: 'moving an existing child to the end preserves the trailing decoration', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalDOMSlot.test.tsx:627` test: 'clearing children removes lexical content but keeps decoration', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalDOMSlot.test.tsx:658` describe: 'ElementDOMSlot block cursor handling', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalDOMSlot.test.tsx:714` test: 'renders the block cursor inside the slot content element, not the keyed wrapper', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalDOMSlot.test.tsx:738` test: 'inserting a child at offset 0 while the block cursor is showing displays the child (#8561)', () => {

## `../lexical/packages/lexical/src/__tests__/unit/LexicalEditor.test.tsx`

category: portable
family: portable editor behavior
target: indexed 88 test/describe lines; target packages/plite/test; add focused browser proof only when behavior depends on DOM/runtime transport

- `../lexical/packages/lexical/src/__tests__/unit/LexicalEditor.test.tsx:183` describe: 'LexicalEditor tests', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalEditor.test.tsx:263` describe: 'registerNodeTransform', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalEditor.test.tsx:264` it: 'Calls the RootNode transform last on every update', async () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalEditor.test.tsx:376` describe: 'read()', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalEditor.test.tsx:377` it: 'Can read the editor state', async () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalEditor.test.tsx:429` it: 'runs transforms the editor state', async () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalEditor.test.tsx:465` it: 'can be nested in an update or read', async () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalEditor.test.tsx:501` it: 'Should create an editor with an initial editor state', async () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalEditor.test.tsx:546` it: 'Should handle nested updates in the correct sequence', async () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalEditor.test.tsx:691` it: 'nested update after selection update triggers exactly 1 update', async () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalEditor.test.tsx:718` it: 'update does not call onUpdate callback when no dirty nodes', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalEditor.test.tsx:733` it: 'editor.focus() callback is called', async () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalEditor.test.tsx:748` it: 'Synchronously runs three transforms, two of them depend on the other', async () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalEditor.test.tsx:795` it: 'Synchronously runs three transforms, two of them depend on the other (2)', async () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalEditor.test.tsx:861` it: 'Synchronously runs three transforms, two of them depend on previously merged text content', async () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalEditor.test.tsx:932` it: 'text transform runs when node is removed', async () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalEditor.test.tsx:963` it: 'transforms only run on nodes that were explicitly marked as dirty', async () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalEditor.test.tsx:1012` it: 'transforms do not discard unintentional dirtyElements', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalEditor.test.tsx:1092` describe: 'transforms on siblings', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalEditor.test.tsx:1130` it: 'on remove', async () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalEditor.test.tsx:1138` it: 'on replace', async () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalEditor.test.tsx:1147` it: 'on insertBefore', async () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalEditor.test.tsx:1156` it: 'on insertAfter', async () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalEditor.test.tsx:1165` it: 'on splitText', async () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalEditor.test.tsx:1178` it: 'on append', async () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalEditor.test.tsx:1191` it: 'Detects infinite recursivity on transforms', async () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalEditor.test.tsx:1236` it: 'Detects infinite recursivity on update listeners (dev: default onWarn throws)', async () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalEditor.test.tsx:1292` it: 'routes the recursion guard through a custom onWarn for embedder telemetry', async () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalEditor.test.tsx:1351` it: 'does not trip the recursion guard on bounded re-enqueueing across separate actions', async () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalEditor.test.tsx:1382` it: 'does not trip the recursion guard on a fast input burst driven by commands', async () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalEditor.test.tsx:1423` it: 'still detects a runaway cascade that dispatches commands from a mutation listener', async () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalEditor.test.tsx:1492` it: 'applies (and warns in DEV) when a command dispatched from a read-only context mutates the editor', async () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalEditor.test.tsx:1540` it: 'Should be able to update an editor state without a root element', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalEditor.test.tsx:1575` it: 'Should be able to recover from an update error', async () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalEditor.test.tsx:1614` it: 'Should be able to handle a change in root element', async () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalEditor.test.tsx:1681` it: `Retains pendingEditor while rootNode is not set (${
- `../lexical/packages/lexical/src/__tests__/unit/LexicalEditor.test.tsx:1708` it: 'setRootElement preserves queued updates and tags across reset (#7360)', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalEditor.test.tsx:1744` describe: 'With node decorators', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalEditor.test.tsx:1779` it: 'Should correctly render React component into Lexical node #1', async () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalEditor.test.tsx:1823` it: 'Should correctly render React component into Lexical node #2', async () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalEditor.test.tsx:1922` describe: 'parseEditorState()', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalEditor.test.tsx:1931` it: 'exportJSON API - parses parsed JSON', async () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalEditor.test.tsx:1956` describe: 'range selection', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalEditor.test.tsx:1986` it: 'Parses the nodes of a stringified editor state', async () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalEditor.test.tsx:2038` it: 'Parses the text content of the editor state', async () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalEditor.test.tsx:2048` describe: 'node selection', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalEditor.test.tsx:2080` it: 'Parses the nodes of a stringified editor state', async () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalEditor.test.tsx:2132` it: 'Parses the text content of the editor state', async () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalEditor.test.tsx:2143` describe: '$parseSerializedNode()', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalEditor.test.tsx:2144` it: 'parses serialized nodes', async () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalEditor.test.tsx:2168` describe: 'Node children', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalEditor.test.tsx:2185` it: 'moves node to different tree branches', async () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalEditor.test.tsx:2249` it: 'moves node to different tree branches (inverse)', async () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalEditor.test.tsx:2293` it: 'moves node to different tree branches (node appended twice in two different branches)', async () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalEditor.test.tsx:2347` it: 'can subscribe and unsubscribe from commands and the callback is fired', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalEditor.test.tsx:2375` it: 'removes the command from the command map when no listener are attached', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalEditor.test.tsx:2416` it: 'can register transforms before updates', async () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalEditor.test.tsx:2442` it: 'textcontent listener', async () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalEditor.test.tsx:2503` it: 'mutation listener', async () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalEditor.test.tsx:2603` it: 'rejects creating an editor with invalid LexicalNode parent class', async () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalEditor.test.tsx:2616` it: 'rejects creating an editor with invalid LexicalNode parent class (no getType)', async () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalEditor.test.tsx:2623` it: 'rejects creating an editor with invalid LexicalNode parent class (undefined)', async () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalEditor.test.tsx:2629` it: 'mutation listener on newly initialized editor', async () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalEditor.test.tsx:2637` it: 'mutation listener with setEditorState', async () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalEditor.test.tsx:2703` it: 'mutation listener set for original node should work with the replaced node', async () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalEditor.test.tsx:2803` it: 'mutation listener should work with the replaced node', async () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalEditor.test.tsx:2860` it: 'multiple update tags', async () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalEditor.test.tsx:2882` it: 'does not leak a no-op update tag into the next update', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalEditor.test.tsx:2915` it: 'setEditorState keeps its tag when committed from inside an update', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalEditor.test.tsx:2963` it: 'defers onUpdate callbacks when setEditorState commits inside an update', async () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalEditor.test.tsx:3011` it: 'mutation listeners does not trigger when other node types are mutated', async () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalEditor.test.tsx:3031` it: 'mutation listeners with normalization', async () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalEditor.test.tsx:3083` it: 'mutation "update" listener', async () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalEditor.test.tsx:3205` it: 'editable listener', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalEditor.test.tsx:3222` it: 'does not add new listeners while triggering existing', async () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalEditor.test.tsx:3309` it: 'calls command listeners in deque order', async () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalEditor.test.tsx:3358` it: 'maps priorities correctly', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalEditor.test.tsx:3436` it: 'has an invariant payload type for commands', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalEditor.test.tsx:3515` it: 'allows using the same listener for multiple node types', async () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalEditor.test.tsx:3544` it: 'calls mutation listener with initial state', async () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalEditor.test.tsx:3612` it: 'can use discrete for synchronous updates', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalEditor.test.tsx:3639` it: 'can use discrete after a non-discrete update to flush the entire queue', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalEditor.test.tsx:3666` it: 'can use discrete after a non-discrete setEditorState to flush the entire queue', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalEditor.test.tsx:3696` it: 'can use discrete in a nested update to flush the entire queue', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalEditor.test.tsx:3723` it: 'can read in a nested update', async () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalEditor.test.tsx:3742` it: 'does not include linebreak into inline elements', async () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalEditor.test.tsx:3759` it: 'reconciles state without root element', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalEditor.test.tsx:3770` describe: 'node replacement', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalEditor.test.tsx:3771` it: 'should work correctly', async () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalEditor.test.tsx:3808` it: 'should fail if node keys are re-used', async () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalEditor.test.tsx:3846` it: 'node transform to the nodes specified by "replace" should not be applied to the nodes specified by "with" when "withKlass" is not specified', async () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalEditor.test.tsx:3899` it: 'node transform to the nodes specified by "replace" should be applied also to the nodes specified by "with" when "withKlass" is specified', async () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalEditor.test.tsx:3948` it: 'recovers from reconciler failure and trigger proper prev editor state', async () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalEditor.test.tsx:3986` it: 'should call importDOM methods only once', async () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalEditor.test.tsx:4000` describe: 'setRootElement', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalEditor.test.tsx:4001` it: 'root element count is always positive', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalEditor.test.tsx:4017` it: 'should handle root element moving between documents', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalEditor.test.tsx:4041` describe: 'html config', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalEditor.test.tsx:4042` it: 'should override export output function', async () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalEditor.test.tsx:4089` it: 'should override import conversion function', async () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalEditor.test.tsx:4129` describe: 'selection', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalEditor.test.tsx:4130` it: 'updates the DOM selection', async () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalEditor.test.tsx:4172` it: 'does not update the Lexical->DOM selection with skip-dom-selection', async () => {

## `../lexical/packages/lexical/src/__tests__/unit/LexicalEditorListener.test.ts`

category: portable
family: serialization-parsing / marks-inline
target: indexed 9 test/describe lines; target packages/plite/test; packages/plite-history/test; apps/www/tests/plite-browser/donor/examples/richtext.test.ts

- `../lexical/packages/lexical/src/__tests__/unit/LexicalEditorListener.test.ts:11` describe: 'LexicalEditor listeners', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalEditorListener.test.ts:12` describe: 'registerRootListener', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalEditorListener.test.ts:13` test: 'can return a function that is called when unregistered', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalEditorListener.test.ts:31` test: 'updates the function on each call', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalEditorListener.test.ts:47` test: 'works when the root element changes too', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalEditorListener.test.ts:80` describe: 'registerEditableListener', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalEditorListener.test.ts:81` test: 'can return a function that is called when unregistered', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalEditorListener.test.ts:102` test: 'updates the function on each call', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalEditorListener.test.ts:125` test: 'works when editable state changes', () => {

## `../lexical/packages/lexical/src/__tests__/unit/LexicalEditorState.test.ts`

category: portable
family: portable editor behavior
target: indexed 5 test/describe lines; target packages/plite/test; add focused browser proof only when behavior depends on DOM/runtime transport

- `../lexical/packages/lexical/src/__tests__/unit/LexicalEditorState.test.ts:25` describe: 'LexicalEditorState tests', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalEditorState.test.ts:27` test: 'constructor', async () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalEditorState.test.ts:36` test: "read('pending' \| 'latest' \| 'force-commit')", () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalEditorState.test.ts:64` test: 'read()', async () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalEditorState.test.ts:145` test: 'toJSON()', async () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalEditorState.test.ts:161` test: 'ensure garbage collection works as expected', async () => {

## `../lexical/packages/lexical/src/__tests__/unit/LexicalElementHelpers.test.ts`

category: portable
family: portable editor behavior
target: indexed 7 test/describe lines; target packages/plite/test; add focused browser proof only when behavior depends on DOM/runtime transport

- `../lexical/packages/lexical/src/__tests__/unit/LexicalElementHelpers.test.ts:12` describe: 'LexicalElementHelpers tests', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalElementHelpers.test.ts:13` describe: 'addClassNamesToElement() and removeClassNamesFromElement()', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalElementHelpers.test.ts:14` test: 'basic', async () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalElementHelpers.test.ts:25` test: 'empty', async () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalElementHelpers.test.ts:41` test: 'multiple', async () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalElementHelpers.test.ts:52` test: 'space separated', async () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalElementHelpers.test.ts:64` test: 'multiple spaces', async () => {

## `../lexical/packages/lexical/src/__tests__/unit/LexicalEmptyEditorTyping.test.ts`

category: portable
family: portable editor behavior
target: indexed; target current Plite package proof and browser proof when DOM-dependent

- `../lexical/packages/lexical/src/__tests__/unit/LexicalEmptyEditorTyping.test.ts:73` describe: 'Typing into a freshly-mounted empty editor reconciles text', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalEmptyEditorTyping.test.ts:92` test: 'beforeinput insertText on a fresh empty editor lands in editor state', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalEmptyEditorTyping.test.ts:113` test: 'typing eleven words into a fresh empty editor reconciles all of them', () => {

## `../lexical/packages/lexical/src/__tests__/unit/LexicalExtensionCore.test.ts`

category: portable
family: portable editor behavior
target: indexed 9 test/describe lines; target packages/plite/test; add focused browser proof only when behavior depends on DOM/runtime transport

- `../lexical/packages/lexical/src/__tests__/unit/LexicalExtensionCore.test.ts:18` describe: 'defineExtension', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalExtensionCore.test.ts:19` it: 'does not change identity', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalExtensionCore.test.ts:32` it: 'infers the expected type (base case)', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalExtensionCore.test.ts:37` it: 'infers the expected type (config inference)', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalExtensionCore.test.ts:42` it: 'infers the expected type (output inference)', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalExtensionCore.test.ts:54` it: 'can define an extension without config', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalExtensionCore.test.ts:59` it: 'infers the correct init type', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalExtensionCore.test.ts:71` describe: 'declarePeerDependency', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalExtensionCore.test.ts:72` it: 'validates the type argument', () => {

## `../lexical/packages/lexical/src/__tests__/unit/LexicalFirefoxCompositionEndTag.test.ts`

category: portable
family: beforeinput-input / browser-engine
target: indexed; target current Plite package proof and browser proof when DOM-dependent

- `../lexical/packages/lexical/src/__tests__/unit/LexicalFirefoxCompositionEndTag.test.ts:41` describe: 'Firefox composition-end tag forwarding', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalFirefoxCompositionEndTag.test.ts:42` test: 'onInput emits COMPOSITION_END_TAG after a deferred compositionend', async () => {

## `../lexical/packages/lexical/src/__tests__/unit/LexicalGenMap.test.ts`

category: portable
family: portable editor behavior
target: indexed; target current Plite package proof and browser proof when DOM-dependent

- `../lexical/packages/lexical/src/__tests__/unit/LexicalGenMap.test.ts:23` describe: 'GenMap', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalGenMap.test.ts:24` test: 'clone shares state until first write', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalGenMap.test.ts:41` test: 'write to a clone isolates that clone from the original', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalGenMap.test.ts:53` test: 'write to the original after clone isolates the original', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalGenMap.test.ts:65` test: 'delete then resurrect preserves size and value', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalGenMap.test.ts:76` test: 'size tracks set/delete correctly across clone boundaries', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalGenMap.test.ts:93` test: 'iteration yields entries in nursery-overrides-old order', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalGenMap.test.ts:109` test: 'iteration skips tombstoned keys', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalGenMap.test.ts:121` test: 'compact folds nursery into old and resets nursery', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalGenMap.test.ts:138` test: 'clear resets all state', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalGenMap.test.ts:152` describe: 'cloneMap', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalGenMap.test.ts:153` test: 'GenMap source returns a clone (O(1) path)', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalGenMap.test.ts:162` test: 'plain Map below threshold returns a fresh plain Map', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalGenMap.test.ts:172` test: 'plain Map at or above threshold returns a GenMap snapshot', () => {

## `../lexical/packages/lexical/src/__tests__/unit/LexicalIosKoreanIME.test.ts`

category: portable
family: beforeinput-input / browser-engine
target: indexed; target current Plite package proof and browser proof when DOM-dependent

- `../lexical/packages/lexical/src/__tests__/unit/LexicalIosKoreanIME.test.ts:130` describe: 'iOS 10-key Korean IME — deleteContentBackward with targetRange', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalIosKoreanIME.test.ts:131` test: 'applyDOMRange resolves a range over in-progress Korean jamo', async () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalIosKoreanIME.test.ts:152` test: 'applyDOMRange + removeText leaves only the assembled syllables', async () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalIosKoreanIME.test.ts:172` test: 'deleteContentBackward with non-collapsed targetRange deletes the targetRange text', async () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalIosKoreanIME.test.ts:188` test: 'applyDOMRange with collapsed targetRange leaves selection collapsed — iOS fast path is skipped', async () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalIosKoreanIME.test.ts:208` test: 'applyDOMRange handles a targetRange that straddles two adjacent text nodes', async () => {

## `../lexical/packages/lexical/src/__tests__/unit/LexicalListPlugin.test.tsx`

category: portable
family: serialization-parsing / marks-inline
target: indexed 4 test/describe lines; target packages/plite/test; packages/plite-history/test; apps/www/tests/plite-browser/donor/examples/richtext.test.ts

- `../lexical/packages/lexical/src/__tests__/unit/LexicalListPlugin.test.tsx:40` describe: '@lexical/list tests', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalListPlugin.test.tsx:83` test: 'Toggle an empty list on/off', async () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalListPlugin.test.tsx:138` test: 'Can create a list and indent/outdent it', async () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalListPlugin.test.tsx:221` test: '$setBlocksType does not cause invalid ListItemNode children - regression #7036', async () => {

## `../lexical/packages/lexical/src/__tests__/unit/LexicalNode.test.ts`

category: portable
family: portable editor behavior
target: indexed 65 test/describe lines; target packages/plite/test; add focused browser proof only when behavior depends on DOM/runtime transport

- `../lexical/packages/lexical/src/__tests__/unit/LexicalNode.test.ts:107` describe: 'LexicalNode tests', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalNode.test.ts:141` test: 'LexicalNode.constructor', async () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalNode.test.ts:159` test: 'LexicalNode.constructor: type change detected', async () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalNode.test.ts:172` test: 'LexicalNode.clone()', async () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalNode.test.ts:181` test: 'LexicalNode.afterCloneFrom()', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalNode.test.ts:242` test: 'LexicalNode.getType()', async () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalNode.test.ts:251` test: 'LexicalNode.isAttached()', async () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalNode.test.ts:268` test: 'LexicalNode.isSelected()', async () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalNode.test.ts:293` test: 'LexicalNode.isSelected(): selected text node', async () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalNode.test.ts:311` test: 'LexicalNode.isSelected(): selected block node range', async () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalNode.test.ts:359` test: 'LexicalNode.isSelected(): with custom range selection', async () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalNode.test.ts:390` describe: 'LexicalNode.isSelected(): with inline decorator node', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalNode.test.ts:506` test: `${isSelected ? 'is' : "isn't"} selected ${label}`, () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalNode.test.ts:550` test: 'LexicalNode.getKey()', async () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalNode.test.ts:554` test: 'LexicalNode.getParent()', async () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalNode.test.ts:570` test: 'LexicalNode.getParentOrThrow()', async () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalNode.test.ts:586` test: 'LexicalNode.getTopLevelElement()', async () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalNode.test.ts:625` test: 'LexicalNode.getTopLevelElementOrThrow()', async () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalNode.test.ts:646` test: 'LexicalNode.getParents()', async () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalNode.test.ts:666` test: 'LexicalNode.getPreviousSibling()', async () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalNode.test.ts:690` test: 'LexicalNode.getPreviousSiblings()', async () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalNode.test.ts:729` test: 'LexicalNode.getNextSibling()', async () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalNode.test.ts:750` test: 'LexicalNode.getNextSiblings()', async () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalNode.test.ts:778` test: 'LexicalNode.getCommonAncestor()', async () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalNode.test.ts:831` test: 'LexicalNode.isBefore()', async () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalNode.test.ts:859` test: 'LexicalNode.isParentOf()', async () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalNode.test.ts:874` test: 'LexicalNode.getNodesBetween()', async () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalNode.test.ts:922` test: 'LexicalNode.isToken()', async () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalNode.test.ts:942` test: 'LexicalNode.isSegmented()', async () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalNode.test.ts:962` test: 'LexicalNode.isDirectionless()', async () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalNode.test.ts:985` test: 'LexicalNode.getLatest()', async () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalNode.test.ts:994` test: 'LexicalNode.getLatest(): garbage collected node', async () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalNode.test.ts:1016` test: 'LexicalNode.getTextContent()', async () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalNode.test.ts:1030` test: 'LexicalNode.getTextContentSize()', async () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalNode.test.ts:1039` test: 'LexicalNode.createDOM()', async () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalNode.test.ts:1056` test: 'LexicalNode.updateDOM()', async () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalNode.test.ts:1066` test: 'LexicalNode.remove()', async () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalNode.test.ts:1092` test: 'LexicalNode.replace()', async () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalNode.test.ts:1102` test: 'LexicalNode.replace(): from another parent', async () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalNode.test.ts:1131` test: 'LexicalNode.replace(): text', async () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalNode.test.ts:1148` test: 'LexicalNode.replace(): token', async () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalNode.test.ts:1165` test: 'LexicalNode.replace(): segmented', async () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalNode.test.ts:1182` test: 'LexicalNode.replace(): directionless', async () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalNode.test.ts:1200` test: 'LexicalNode.replace() within canBeEmpty: false', async () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalNode.test.ts:1226` test: 'LexicalNode.insertAfter()', async () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalNode.test.ts:1237` test: 'LexicalNode.insertAfter(): text', async () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalNode.test.ts:1254` test: 'LexicalNode.insertAfter(): token', async () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalNode.test.ts:1271` test: 'LexicalNode.insertAfter(): segmented', async () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalNode.test.ts:1288` test: 'LexicalNode.insertAfter(): directionless', async () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalNode.test.ts:1306` test: 'LexicalNode.insertAfter() move blocks around', async () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalNode.test.ts:1343` test: 'LexicalNode.insertAfter() move blocks around #2', async () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalNode.test.ts:1386` test: 'LexicalNode.insertBefore()', async () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalNode.test.ts:1397` test: 'LexicalNode.insertBefore(): from another parent', async () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalNode.test.ts:1418` test: 'LexicalNode.insertBefore(): text', async () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalNode.test.ts:1435` test: 'LexicalNode.insertBefore(): token', async () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalNode.test.ts:1452` test: 'LexicalNode.insertBefore(): segmented', async () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalNode.test.ts:1469` test: 'LexicalNode.insertBefore(): directionless', async () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalNode.test.ts:1486` test: 'LexicalNode.selectNext()', async () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalNode.test.ts:1502` test: 'LexicalNode.selectNext(): no next sibling', async () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalNode.test.ts:1512` test: 'LexicalNode.selectNext(): non-text node', async () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalNode.test.ts:1524` describe: 'LexicalNode.$config()', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalNode.test.ts:1525` test: 'importJSON() with no boilerplate', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalNode.test.ts:1555` test: 'clone() with no boilerplate', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalNode.test.ts:1631` test: 'direct clone() of an auto-synthesized node preserves properties', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalNode.test.ts:1673` test: 'afterCloneFrom runs exactly once for auto-synthesized clone', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalNode.test.ts:1709` test: 'reentrant direct clone during another clone preserves properties', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalNode.test.ts:1777` describe: 'Element-anchored selection on old parent (#6031)', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalNode.test.ts:1805` describe: 'cross-parent move', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalNode.test.ts:1830` test: methods)(
- `../lexical/packages/lexical/src/__tests__/unit/LexicalNode.test.ts:1858` test: methods)(
- `../lexical/packages/lexical/src/__tests__/unit/LexicalNode.test.ts:1886` test: methods)(
- `../lexical/packages/lexical/src/__tests__/unit/LexicalNode.test.ts:1914` test: methods)(
- `../lexical/packages/lexical/src/__tests__/unit/LexicalNode.test.ts:1955` test: methodsWithRestoreFlag)(
- `../lexical/packages/lexical/src/__tests__/unit/LexicalNode.test.ts:1982` describe: 'within-parent move', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalNode.test.ts:1991` test: methodsForWithinParent)(
- `../lexical/packages/lexical/src/__tests__/unit/LexicalNode.test.ts:2034` describe: 'replace(other, includeChildren) selection mapping', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalNode.test.ts:2043` test: 'element-anchored point maps to prevSize + originalOffset (etrepum example)', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalNode.test.ts:2075` test: 'non-collapsed element-anchored anchor and focus both shift by prevSize', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalNode.test.ts:2113` test: 'text-anchored selection inside transferred children is unaffected', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalNode.test.ts:2145` test: 'replace without includeChildren falls back to the legacy moveSelectionPointToEnd', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalNode.test.ts:2182` test: '$setBlocksType-style pattern (prevSize=0 fresh receiver) preserves original offset', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalNode.test.ts:2216` describe: 'LexicalNode.$config() without registration', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalNode.test.ts:2217` test: 'static getType() before registration', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalNode.test.ts:2242` test: 'subclass static getType() is not shadowed by a superclass synthesized getType', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalNode.test.ts:2250` it: e.g. CodeHighlightNode/HashtagNode
- `../lexical/packages/lexical/src/__tests__/unit/LexicalNode.test.ts:2280` test: 'subclass static getType() resolves correctly when read before the superclass', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalNode.test.ts:2299` test: 'synthesized getType() inherited as an own static on a subclass does not recurse (#8867 follow-up)', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalNode.test.ts:2345` test: 'abstract base class declares shared $config under a Symbol key', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalNode.test.ts:2391` test: 'a structurally-identical subclass stays narrowable', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalNode.test.ts:2427` test: 'traversal methods return base node types unless explicitly cast', () => {

## `../lexical/packages/lexical/src/__tests__/unit/LexicalNodeState.test.ts`

category: portable
family: portable editor behavior
target: indexed 21 test/describe lines; target packages/plite/test; add focused browser proof only when behavior depends on DOM/runtime transport

- `../lexical/packages/lexical/src/__tests__/unit/LexicalNodeState.test.ts:182` describe: 'LexicalNode state', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalNodeState.test.ts:194` test: `state.$set() and state.$get() need to be inside an update`, async () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalNodeState.test.ts:213` test: '__state is not an enumerable property', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalNodeState.test.ts:223` test: `getState and setState`, async () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalNodeState.test.ts:246` test: `import and export state`, async () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalNodeState.test.ts:266` test: 'importJSON ignores prototype-polluting state keys', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalNodeState.test.ts:291` test: 'states cannot be registered with the same key string', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalNodeState.test.ts:312` test: 'nodeGetter() and nodeSetter()', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalNodeState.test.ts:330` test: 'flat config serialization round-trip', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalNodeState.test.ts:359` test: 'default value should not be exported', async () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalNodeState.test.ts:390` test: 'getState returns immutable values, setState require an Object literal', async () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalNodeState.test.ts:426` test: 'setting state shouldn’t affect previous reconciled versions of the node', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalNodeState.test.ts:480` describe: 'nodeStatesAreEquivalent', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalNodeState.test.ts:481` test: 'undefined states are equivalent', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalNodeState.test.ts:484` test: 'merges text nodes with different number of default state values', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalNodeState.test.ts:526` test: 'TextNode merging only with equivalent state', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalNodeState.test.ts:589` test: 'different versions of the same state are not equivalent', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalNodeState.test.ts:685` describe: 'resetOnCopyNode', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalNodeState.test.ts:686` test: 'state with resetOnCopyNode: true is reset when using $copyNode', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalNodeState.test.ts:706` test: 'state with resetOnCopyNode: false is preserved when using $copyNode', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalNodeState.test.ts:726` test: 'state without resetOnCopyNode option is preserved when using $copyNode', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalNodeState.test.ts:745` test: 'multiple states with different resetOnCopyNode configurations', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalNodeState.test.ts:803` describe: '$config interleaved abstract/concrete classes', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalNodeState.test.ts:804` test: 'serializes, transforms, and types every interleaved level’s state', () => {

## `../lexical/packages/lexical/src/__tests__/unit/LexicalNormalization.test.tsx`

category: portable
family: portable editor behavior
target: indexed 7 test/describe lines; target packages/plite/test; add focused browser proof only when behavior depends on DOM/runtime transport

- `../lexical/packages/lexical/src/__tests__/unit/LexicalNormalization.test.tsx:23` describe: 'LexicalNormalization tests', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalNormalization.test.tsx:25` describe: '$normalizeSelection', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalNormalization.test.tsx:32` test: `paragraph to text nodes${reversedStr}`, async () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalNormalization.test.tsx:60` test: `paragraph to text node + element${reversedStr}`, async () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalNormalization.test.tsx:88` test: `paragraph to text node + decorator${reversedStr}`, async () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalNormalization.test.tsx:116` test: `text + text node${reversedStr}`, async () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalNormalization.test.tsx:144` test: `paragraph to test element to text + text${reversedStr}`, async () => {

## `../lexical/packages/lexical/src/__tests__/unit/LexicalReconciler.test.ts`

category: portable
family: portable editor behavior
target: indexed 6 test/describe lines; target packages/plite/test; add focused browser proof only when behavior depends on DOM/runtime transport

- `../lexical/packages/lexical/src/__tests__/unit/LexicalReconciler.test.ts:42` describe: 'LexicalReconciler', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalReconciler.test.ts:44` test: 'Should set direction of root node children to auto if root node has no direction', async () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalReconciler.test.ts:66` test: 'Should not set direction of root node children if root node has direction', async () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalReconciler.test.ts:89` test: 'Should allow overriding direction of root node children when root node has no direction', async () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalReconciler.test.ts:123` test: 'Should allow overriding direction of root node children when root node has direction', async () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalReconciler.test.ts:148` test: 'Should update root children when root node direction changes', async () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalReconciler.test.ts:199` describe: 'Cross-parent moves reuse DOM (regression #8420)', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalReconciler.test.ts:204` test: 'Decorator wrapped in another element reuses its DOM', async () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalReconciler.test.ts:245` test: 'Element subtree move preserves descendant DOM identities', async () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalReconciler.test.ts:279` test: 'Multi-level nested subtree move preserves all descendant DOMs', async () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalReconciler.test.ts:319` test: 'Wrapping decorator emits a single "updated" listener event and re-decorates', async () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalReconciler.test.ts:365` test: 'Cross-parent swap with updateDOM=true does not throw', async () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalReconciler.test.ts:409` test: 'Same-parent reorder is unaffected by the reuse branch', async () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalReconciler.test.ts:446` describe: 'setElementIndent', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalReconciler.test.ts:447` test: 'emits a CSS variable reference rather than a pre-resolved value', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalReconciler.test.ts:480` test: 'clears padding when indent returns to 0', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalReconciler.test.ts:518` describe: 'children fast path: contiguous-suffix incremental update', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalReconciler.test.ts:556` test: 'typing at the end of the last paragraph keeps prefix DLB', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalReconciler.test.ts:589` test: 'multiple contiguous dirty children at the end', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalReconciler.test.ts:624` test: 'non-contiguous dirty children take the existing fast path', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalReconciler.test.ts:659` test: 'format toggle on the last paragraph propagates to __textFormat', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalReconciler.test.ts:698` test: 'empty trailing paragraph contributes zero length', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalReconciler.test.ts:730` test: 'linebreak-bounded text nodes update suffix without extra DLB', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalReconciler.test.ts:771` test: 'TextNode-direct-child suffix with length change: prefix preserved', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalReconciler.test.ts:819` test: 'append paragraph at end of multi-paragraph root (size+1, K=2)', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalReconciler.test.ts:854` test: 'remove last paragraph of multi-paragraph root (size-1, K=1)', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalReconciler.test.ts:881` test: 'sustained typing on the same paragraph stays correct (cache freshness)', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalReconciler.test.ts:928` test: 'sustained appends stay correct across cycles (cache freshness, size+1)', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalReconciler.test.ts:966` test: 'sustained removes stay correct across cycles (cache freshness, size-1)', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalReconciler.test.ts:1008` test: 'AUDIT-1: root __textFormat is not propagated from descendants', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalReconciler.test.ts:1059` test: 'AUDIT-1 control: prefix with text keeps parent __textFormat stable', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalReconciler.test.ts:1102` test: 'AUDIT-1 (non-root) control: prefix with text keeps paragraph __textFormat stable', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalReconciler.test.ts:1156` test: 'AUDIT-1 (non-root): paragraph with linebreak-only prefix leaks stale __textFormat', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalReconciler.test.ts:1222` test: 'general same-size walk caches first-text key on the parent DOM', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalReconciler.test.ts:1309` test: 'suffix walk keeps the leftmost first-text descriptor across element-child iterations', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalReconciler.test.ts:1374` test: 'AUDIT-2: Layer 2 walk writes wrong __lexicalFirstTextKey when middle child is dirty', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalReconciler.test.ts:1462` test: 'AUDIT-3: $reconcileNodeChildren writes wrong cache after middle-insert', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalReconciler.test.ts:1529` test: 'AUDIT-4: $bubbleChildFirstText misses cache on elements with wrapping DOM', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalReconciler.test.ts:1645` test: 'AUDIT-5: size-delta suffix routes DOM ops to slot.element on wrapping parents', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalReconciler.test.ts:1745` test: 'AUDIT-5b: size-delta suffix routes $reconcileNode replaceChild through slot.element on wrapping parents', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalReconciler.test.ts:1868` test: 'AUDIT-6: same-size suffix reads current-state cache after $updateDOM=true', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalReconciler.test.ts:1972` test: 'AUDIT-7: K=3 contiguous suffix with sizeDelta=+1 — output sentinel after helper bail', () => {

## `../lexical/packages/lexical/src/__tests__/unit/LexicalReconcilerStaleDecorator.test.ts`

category: portable
family: selection-dom-mapping / nested-root
target: indexed; target current Plite package proof and browser proof when DOM-dependent

- `../lexical/packages/lexical/src/__tests__/unit/LexicalReconcilerStaleDecorator.test.ts:23` describe: 'LexicalReconciler — last-child decorator removal', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalReconcilerStaleDecorator.test.ts:24` test: 'does not throw when an inline DecoratorNode is removed as the last child of an element', () => {

## `../lexical/packages/lexical/src/__tests__/unit/LexicalRefCountedRegistry.test.ts`

category: portable
family: portable editor behavior
target: indexed; target current Plite package proof and browser proof when DOM-dependent

- `../lexical/packages/lexical/src/__tests__/unit/LexicalRefCountedRegistry.test.ts:12` describe: 'createRefCountedRegistry', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalRefCountedRegistry.test.ts:13` test: 'activates on the first registration and passes options through', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalRefCountedRegistry.test.ts:22` test: 'reference counts: activates once, disposes only after the last release', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalRefCountedRegistry.test.ts:38` test: 'distinct keys activate and dispose independently', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalRefCountedRegistry.test.ts:53` test: 'the disposer is idempotent', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalRefCountedRegistry.test.ts:63` test: 're-registering a released key creates a fresh activation', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalRefCountedRegistry.test.ts:74` test: 'a stale disposer does not affect a fresh entry for the same key', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalRefCountedRegistry.test.ts:91` test: 'dispose() tears down every live registration', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalRefCountedRegistry.test.ts:107` test: 'a disposer held after registry.dispose() is a no-op', () => {

## `../lexical/packages/lexical/src/__tests__/unit/LexicalRootSelectionPhantomParagraph.test.ts`

category: portable
family: selection-dom-mapping / nested-root
target: indexed; target current Plite package proof and browser proof when DOM-dependent

- `../lexical/packages/lexical/src/__tests__/unit/LexicalRootSelectionPhantomParagraph.test.ts:32` describe: 'Typing at root + last-offset selection (no phantom paragraph)', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalRootSelectionPhantomParagraph.test.ts:33` test: 'reuses an empty trailing paragraph instead of appending a new one', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalRootSelectionPhantomParagraph.test.ts:56` test: 'empty root still creates a new paragraph for the typed text', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalRootSelectionPhantomParagraph.test.ts:77` test: 'reuses an empty trailing paragraph inside a shadow root', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalRootSelectionPhantomParagraph.test.ts:107` test: 'falls back to a new paragraph when the trailing child is a DecoratorNode', () => {

## `../lexical/packages/lexical/src/__tests__/unit/LexicalSelection.test.ts`

category: portable
family: selection-dom-mapping / void-atom
target: indexed 80 test/describe lines; target packages/plite/test; packages/plite-react/test/editable-behavior.test.tsx; apps/www/tests/plite-browser/donor/stress/generated-editing.test.ts

- `../lexical/packages/lexical/src/__tests__/unit/LexicalSelection.test.ts:85` describe: 'LexicalSelection tests', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSelection.test.ts:102` describe: 'Inserting text either side of inline elements', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSelection.test.ts:161` describe: 'Inserting text before inline elements', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSelection.test.ts:162` describe: 'Start-of-paragraph inline elements', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSelection.test.ts:182` test: 'Can insert text before a start-of-paragraph inline element, using insertText', async () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSelection.test.ts:188` test: 'Can insert text before a start-of-paragraph inline element, using insertNodes', async () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSelection.test.ts:195` describe: 'Mid-paragraph inline elements', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSelection.test.ts:214` test: 'Can insert text before a mid-paragraph inline element, using insertText', async () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSelection.test.ts:220` test: 'Can insert text before a mid-paragraph inline element, using insertNodes', async () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSelection.test.ts:227` describe: 'End-of-paragraph inline elements', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSelection.test.ts:246` test: 'Can insert text before an end-of-paragraph inline element, using insertText', async () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSelection.test.ts:252` test: 'Can insert text before an end-of-paragraph inline element, using insertNodes', async () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSelection.test.ts:260` describe: 'Inserting text after inline elements', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSelection.test.ts:261` describe: 'Start-of-paragraph inline elements', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSelection.test.ts:280` test: 'Can insert text after a start-of-paragraph inline element, using insertText', async () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSelection.test.ts:286` test: 'Can insert text after a start-of-paragraph inline element, using insertNodes', async () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSelection.test.ts:293` describe: 'Mid-paragraph inline elements', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSelection.test.ts:312` test: 'Can insert text after a mid-paragraph inline element, using insertText', async () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSelection.test.ts:318` test: 'Can insert text after a mid-paragraph inline element, using insertNodes', async () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSelection.test.ts:325` describe: 'End-of-paragraph inline elements', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSelection.test.ts:345` test: 'Can insert text after an end-of-paragraph inline element, using insertText', async () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSelection.test.ts:351` test: 'Can insert text after an end-of-paragraph inline element, using insertNodes', async () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSelection.test.ts:360` describe: 'insertText()', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSelection.test.ts:361` test: 'inserts into existing paragraph node when selection is on parent of paragraph', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSelection.test.ts:382` describe: 'removeText', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSelection.test.ts:383` describe: 'with a leading TextNode and a trailing token TextNode', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSelection.test.ts:401` test: 'remove all text', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSelection.test.ts:425` test: 'remove initial TextNode', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSelection.test.ts:442` test: 'remove trailing token TextNode', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSelection.test.ts:464` test: 'remove initial TextNode and partial token TextNode', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSelection.test.ts:490` test: 'remove partial initial TextNode and partial token TextNode', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSelection.test.ts:519` describe: 'with a leading token TextNode and a trailing TextNode', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSelection.test.ts:537` test: 'remove all text', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSelection.test.ts:561` test: 'remove trailing TextNode', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSelection.test.ts:583` test: 'remove leading token TextNode', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSelection.test.ts:603` test: 'remove partial leading token TextNode and trailing TextNode', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSelection.test.ts:629` test: 'remove partial token TextNode and partial trailing TextNode', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSelection.test.ts:658` describe: 'with a leading TextNode and a trailing segmented TextNode', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSelection.test.ts:677` test: 'remove all text', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSelection.test.ts:701` test: 'remove initial TextNode', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSelection.test.ts:718` test: 'remove trailing segmented TextNode', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSelection.test.ts:740` test: 'remove initial TextNode and partial segmented TextNode', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSelection.test.ts:768` test: 'remove partial initial TextNode and partial segmented TextNode', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSelection.test.ts:811` describe: 'Segmented node composition (#5065)', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSelection.test.ts:812` test: 'insertText during composition preserves node key', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSelection.test.ts:833` test: 'insertText without composition replaces segmented node', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSelection.test.ts:853` test: 'insertText during composition preserves format and style', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSelection.test.ts:878` describe: 'Non-collapsed selection + composition preserves node identity', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSelection.test.ts:879` test: 'spliceText into existing node instead of creating new one', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSelection.test.ts:899` test: 'without composition creates a new node', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSelection.test.ts:921` describe: 'Regression tests for #6701', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSelection.test.ts:922` test: 'insertNodes fails an invariant when there is no Block ancestor', async () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSelection.test.ts:955` describe: 'Regression tests for #8707', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSelection.test.ts:963` test: 'inserts a block decorator after the block cursor at the end of a shadow root', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSelection.test.ts:1001` test: 'inserts a block decorator before the block cursor at the start of a shadow root', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSelection.test.ts:1037` test: 'inserts a block decorator into an empty shadow root', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSelection.test.ts:1066` test: 'inserts a block element at the block cursor inside a shadow root', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSelection.test.ts:1100` test: 'insertParagraph at an element point on a shadow root seeds into that shadow root', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSelection.test.ts:1135` test: 'inserts a block decorator at a root element point without wrapping it in a paragraph', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSelection.test.ts:1168` describe: 'getNodes() and extract()', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSelection.test.ts:1209` describe: 'getNodes()', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSelection.test.ts:1210` describe: '$selectAll()', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSelection.test.ts:1211` test: 'with test document', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSelection.test.ts:1238` test: 'with leading inline decorator', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSelection.test.ts:1270` test: 'with trailing inline decorator', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSelection.test.ts:1303` test: 'with leading empty inline element', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSelection.test.ts:1339` test: 'with trailing empty inline element', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSelection.test.ts:1376` test: 'after removing empty paragraph', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSelection.test.ts:1410` test: 'Manual select all without normalization', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSelection.test.ts:1435` test: 'Manual select all from first text to last empty paragraph', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSelection.test.ts:1460` test: 'Manual select with focus collapsed between inline decorators', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSelection.test.ts:1495` test: 'Manual select with focus collapsed after inline decorator', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSelection.test.ts:1531` test: 'Manual select with focus between inline decorators', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSelection.test.ts:1573` test: 'select only the paragraph (not normalized)', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSelection.test.ts:1598` test: 'select around the paragraph (not normalized)', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSelection.test.ts:1627` test: 'selection collapsed inside an empty element', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSelection.test.ts:1639` test: 'select an empty ListItemNode (collapsed)', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSelection.test.ts:1657` describe: 'extract()', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSelection.test.ts:1658` test: 'Manual select all without normalization', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSelection.test.ts:1685` test: 'Manual select all from first text to last empty paragraph', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSelection.test.ts:1712` test: 'select partial TextNode extracts paragraph text', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSelection.test.ts:1725` test: 'select partial TextNode extracts link text', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSelection.test.ts:1736` test: 'select multiple partial TextNode extracts text', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSelection.test.ts:1752` test: 'select last offset TextNode as first node removes node', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSelection.test.ts:1777` test: 'select 0 offset TextNode as last node removes node', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSelection.test.ts:1800` describe: 'Regression #7081', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSelection.test.ts:1801` test: 'Firefox selection & paste before linebreak', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSelection.test.ts:1837` describe: 'Regression #7173', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSelection.test.ts:1838` test: 'Can insertNodes of multiple blocks with a target of an initial empty block and the entire next block', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSelection.test.ts:1862` describe: 'Regression #3181', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSelection.test.ts:1863` test: 'Point.isBefore edge case with mixed TextNode & ElementNode and matching descendants', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSelection.test.ts:1899` describe: 'Regression #8067', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSelection.test.ts:1900` test: 'Formatting issue when replacing text with format', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSelection.test.ts:1925` describe: 'insertText with backward selection inherits first node format', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSelection.test.ts:1926` test: 'backward selection across bold+plain inherits bold', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSelection.test.ts:1951` describe: 'insertText needsRedirect paths', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSelection.test.ts:1952` test: 'token node at middle offset replaces entire node', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSelection.test.ts:1971` test: 'offset 0 on token reuses insertable previous sibling', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSelection.test.ts:1990` test: 'offset at end of token reuses insertable next sibling', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSelection.test.ts:2010` describe: 'insertText formatDiffers on empty text node', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSelection.test.ts:2011` test: 'applies format in-place on empty anchor then splices text', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSelection.test.ts:2031` describe: 'RangeSelection.isBackward() caching (#5825)', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSelection.test.ts:2032` test: 'caches the result and invalidates on Point mutations', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSelection.test.ts:2067` describe: 'Regression #8098', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSelection.test.ts:2068` test: 'Do not apply format and style when moving to different node', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSelection.test.ts:2116` describe: '$wrapInlineNodes regression', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSelection.test.ts:2117` test: 'Wraps all inline nodes, preserving first linebreak if contain a block element', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSelection.test.ts:2140` test: 'Collapses a lone linebreak run into an empty paragraph at the end of a non-empty paragraph', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSelection.test.ts:2169` test: 'Preserves a linebreak followed by inline content when merging into a non-empty paragraph', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSelection.test.ts:2200` test: 'Collapses a lone trailing linebreak after a block into an empty paragraph', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSelection.test.ts:2228` describe: 'Regression #7551 - Selection boundary normalization for single-child inline elements', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSelection.test.ts:2229` test: 'collapsed selection at end of single-child inline element stays inside', async () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSelection.test.ts:2279` test: 'collapsed selection at end of multi-child inline element normalizes to next sibling', async () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSelection.test.ts:2332` describe: '$formatText toggle direction (#6935)', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSelection.test.ts:2333` test: 'uses selection.format (AND) instead of first node for toggle direction', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSelection.test.ts:2360` test: 'toggling off works when all nodes share the format', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSelection.test.ts:2391` test: 'explicit alignWithFormat bypasses selection.format reference', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSelection.test.ts:2417` describe: '$setTextFormat (#5518)', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSelection.test.ts:2418` test: 'sets bold to true on mixed formatting', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSelection.test.ts:2443` test: 'sets bold to false on all-bold text', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSelection.test.ts:2472` test: 'sets multiple formats at once', () => {

## `../lexical/packages/lexical/src/__tests__/unit/LexicalSelectionChangeRefCount.test.ts`

category: portable
family: selection-dom-mapping / nested-root
target: indexed; target current Plite package proof and browser proof when DOM-dependent

- `../lexical/packages/lexical/src/__tests__/unit/LexicalSelectionChangeRefCount.test.ts:17` describe: 'selectionchange listener reference counting', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSelectionChangeRefCount.test.ts:43` test: 'adds the listener once for multiple editors and removes it after the last detaches', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSelectionChangeRefCount.test.ts:63` test: 're-adds the listener when an editor mounts again after the document went idle', () => {

## `../lexical/packages/lexical/src/__tests__/unit/LexicalSelectionResolveLeafPosition.test.ts`

category: portable
family: selection-dom-mapping / nested-root
target: indexed; target current Plite package proof and browser proof when DOM-dependent

- `../lexical/packages/lexical/src/__tests__/unit/LexicalSelectionResolveLeafPosition.test.ts:31` describe: 'Selection resolution for leaf nodes (resolveLeafPosition)', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSelectionResolveLeafPosition.test.ts:50` test: 'DOM caret directly on a bare <br> at offset 0 resolves to "after" the LineBreakNode', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSelectionResolveLeafPosition.test.ts:115` describe: 'wrap pattern via DOMRenderExtension override', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSelectionResolveLeafPosition.test.ts:170` test: 'DOM caret inside the wrap <span> at offset 0 (before the inner <br>) resolves to "before" the LineBreakNode', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSelectionResolveLeafPosition.test.ts:207` test: 'DOM caret inside the wrap <span> at offset 1 (after the inner <br>) resolves to "after" the LineBreakNode', () => {

## `../lexical/packages/lexical/src/__tests__/unit/LexicalSerialization.test.ts`

category: portable
family: portable editor behavior
target: indexed 2 test/describe lines; target packages/plite/test; add focused browser proof only when behavior depends on DOM/runtime transport

- `../lexical/packages/lexical/src/__tests__/unit/LexicalSerialization.test.ts:104` describe: 'LexicalSerialization tests', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSerialization.test.ts:106` test: 'serializes and deserializes from JSON', async () => {

## `../lexical/packages/lexical/src/__tests__/unit/LexicalSlot.test.ts`

category: portable
family: selection-dom-mapping / nested-root
target: indexed; target current Plite package proof and browser proof when DOM-dependent

- `../lexical/packages/lexical/src/__tests__/unit/LexicalSlot.test.ts:182` describe: 'named-slots: core foundation', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSlot.test.ts:183` test: 'a slotted node is reachable, parentless, and attached', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSlot.test.ts:224` test: 'getTopLevelElement stops at the slot boundary', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSlot.test.ts:264` test: 'slot map survives a host mutation (clone)', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSlot.test.ts:304` test: 'setSlot detaches a node that already has a parent', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSlot.test.ts:326` test: '$setSlot moves a node already slotted elsewhere (move semantics)', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSlot.test.ts:356` test: 'setSlot rejects hosting itself or an ancestor (cycle guard)', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSlot.test.ts:379` test: 'setSlot rejects an ancestor reachable through a slot up-link', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSlot.test.ts:395` test: 'moving a slotted node into a child list throws (reverse guard)', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSlot.test.ts:417` test: 'remove() on a slotted node throws (use $removeSlot)', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSlot.test.ts:433` test: 'setSlot rejects reserved names (__proto__, constructor, prototype)', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSlot.test.ts:450` test: 'setSlot enforces non-inline element or decorator values', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSlot.test.ts:492` test: 'overwriting a slot name orphans the previous occupant (no leak)', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSlot.test.ts:525` test: 'slots round-trip through serialize -> parse, alongside a normal child', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSlot.test.ts:569` test: 'a nested host (slot value contains another host with its own slot) round-trips', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSlot.test.ts:618` test: 'restoring a prior editor state reverts a slot move (undo-style)', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSlot.test.ts:666` test: 'export throws when a slot key resolves to no node', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSlot.test.ts:696` test: 'getTextContent reads slots-first, ahead of children', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSlot.test.ts:722` test: 'detaching a host garbage-collects its slot node', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSlot.test.ts:755` test: 'a slot value moved to another host survives the old host being removed in the same commit', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSlot.test.ts:809` test: 'detaching a decorator host garbage-collects its slot node', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSlot.test.ts:850` test: 'getTextContentSize counts slots-first, like getTextContent', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSlot.test.ts:877` test: 'getAllTextNodes includes slot text, slots-first', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSlot.test.ts:905` test: 'a host with slots but no children is not empty', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSlot.test.ts:929` test: 'a slot subtree renders into a keyed container inside the host DOM, slots-first', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSlot.test.ts:964` test: 'a decorator host renders its slot into an editable hidden placeholder', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSlot.test.ts:1004` test: 'editing a decorator-host slot re-reconciles it in place', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSlot.test.ts:1039` test: '$getSlotContainer resolves a host slot container by key, null when empty', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSlot.test.ts:1088` test: 'an element host renders its slot as a hidden slots-first placeholder', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSlot.test.ts:1112` test: 'mountSlotContainer reveals and re-parents; unmount parks it back hidden', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSlot.test.ts:1145` test: 'mounting in place (target is the host DOM) only reveals the placeholder', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSlot.test.ts:1166` test: '$getSlotTargetElement attaches and reveals synchronously in the commit', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSlot.test.ts:1250` test: 'a slot reconcile does not yank a mounted container back into the host', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSlot.test.ts:1287` test: 'reconciler text cache folds slot text in slots-first (RootNode.__cachedText)', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSlot.test.ts:1313` test: 'a host with only a slot renders the slot and caches its text', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSlot.test.ts:1346` test: 'a slots-only empty host gets no terminating line break', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSlot.test.ts:1376` test: 'descendant navigation stays children-only (slots stay out of selection)', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSlot.test.ts:1407` test: 'editing slot content re-reconciles the slot in place (DOM + cache)', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSlot.test.ts:1455` test: 'replacing a slot (same name, new node) swaps the rendered subtree', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSlot.test.ts:1490` test: 'a late-added slot renders in canonical position, not insertion order', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSlot.test.ts:1551` test: 'suffix fast path keeps slot text when a slot and a suffix child are edited together', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSlot.test.ts:1608` test: 'suffix fast path keeps slot text when only a suffix child is edited', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSlot.test.ts:1649` test: 'removing a slot drops its container and its text from the cache', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSlot.test.ts:1690` test: 'removing the host last child keeps its slot containers in the DOM', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSlot.test.ts:1729` test: 'a document-wide RangeSelection carries slot text', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSlot.test.ts:1757` test: 'replace(includeChildren) carries slots onto the replacement', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSlot.test.ts:1780` test: 'replace carries slots onto a decorator host without includeChildren', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSlot.test.ts:1806` test: 'removing an element host clears its slot subtree from the DOM map', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSlot.test.ts:1835` test: 'removing a decorator host clears its slot subtree from the DOM map', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSlot.test.ts:1861` test: 'setSlot rejects a non-host at the type level', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSlot.test.ts:1872` test: 'NodeSelection.insertNodes leaves a slotted node intact', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSlot.test.ts:1910` test: 'NodeSelection.deleteNodes leaves a slotted node intact', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSlot.test.ts:1948` test: 'removeText inside a slot stays scoped and does not walk past the slot boundary', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSlot.test.ts:1992` test: 'backspace at the start of a host child does not merge the slot-bearing host away', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSlot.test.ts:2037` test: 'a slot added after initial render renders slots-first in the DOM', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSlot.test.ts:2065` test: 'getParentCaret stops at a slot value in every mode', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSlot.test.ts:2094` test: 'child DOM index skips prepended slots in a coexistence host', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSlot.test.ts:2140` test: 'a childless slot host reports no managed first child', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSlot.test.ts:2177` describe: 'named-slots: slot name with selector metacharacters', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSlot.test.ts:2178` test: 'reconciling a slot with such a name does not rebuild the host DOM', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSlot.test.ts:2261` describe: 'named-slots: selection resolution onto a slotted decorator', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSlot.test.ts:2290` test: 'a slotted block decorator resolves like a normal block decorator (no throw, null RangeSelection)', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSlot.test.ts:2327` describe: 'named-slots: cross-host slot move DOM reuse', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSlot.test.ts:2328` test: '$removeSlot(A) + $setSlot(B, sameNode) in one update reuses the DOM', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSlot.test.ts:2379` test: 'host updateDOM=true preserves slot subtree DOM', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSlot.test.ts:2433` describe: 'named-slots: editable islands', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSlot.test.ts:2445` test: 'a decorator-host island follows setEditable, re-rendering on toggle', async () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSlot.test.ts:2469` describe: 'named-slots: slot-name type hints', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSlot.test.ts:2470` test: 'a host class declared slots are preserved as a literal union', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSlot.test.ts:2492` describe: '$getSlotNameWithinHost', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSlot.test.ts:2493` test: 'returns the slot name for a node sitting in a named slot', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSlot.test.ts:2517` test: 'disambiguates between multiple slots on the same host', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSlot.test.ts:2550` test: 'returns null for a regular child (not a slot value)', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSlot.test.ts:2571` test: 'returns null for the host itself', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSlot.test.ts:2591` test: 'returns the immediate slot name when slots are nested', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSlot.test.ts:2620` describe: '$selectAll boundary cases', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSlot.test.ts:2626` test: '$selectAll does not throw when anchor is the slot value root', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSlot.test.ts:2667` test: '$selectAll does not throw when anchor is the root element', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSlot.test.ts:2681` test: 'setEditorState latches _slotsUsed when the state contains slots', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSlot.test.ts:2709` test: '_slotsUsed stays true after the last slot is removed', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSlot.test.ts:2735` describe: 'named-slots: audit hardening (insertNodes, cycles, idempotent setSlot)', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSlot.test.ts:2736` test: 'insertNodes with the caret on an empty slot value inserts into the slot', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSlot.test.ts:2765` test: 'closing a cycle through the children channel throws instead of hanging', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSlot.test.ts:2793` test: 're-setting the same node into the same slot is a no-op', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSlot.test.ts:2814` describe: 'named-slots: canonical slot order', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSlot.test.ts:2815` test: 'declared slots set in reverse call order come back in declared order', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSlot.test.ts:2840` test: 'mixed declared and undeclared names sort declared-first, then code-unit', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSlot.test.ts:2866` test: 'an undeclared host orders slot names in code-unit order', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSlot.test.ts:2890` test: 'a subclass redeclaration overrides the inherited order', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSlot.test.ts:2913` test: 'a late-added declared slot renders in its declared position in the DOM', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSlot.test.ts:2954` test: 'exportJSON emits slots keys in canonical order', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSlot.test.ts:2974` test: 'a duplicate name in a declaration throws when the rank is first computed', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSlot.test.ts:2994` test: 'a reserved name in a declaration throws when the rank is first computed', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSlot.test.ts:3011` describe: 'named-slots: copy-on-write slot map', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSlot.test.ts:3012` test: 'a host version cloned without slot changes shares the slot map', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSlot.test.ts:3049` test: 'a slot mutation clones the map once per version and leaves prior versions intact', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSlot.test.ts:3105` describe: 'named-slots: block slot values (virtual shadow root)', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSlot.test.ts:3116` test: 'typing and inline insertNodes land inside the value', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSlot.test.ts:3140` test: 'Enter inside the value is a no-op (single-block scope)', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSlot.test.ts:3165` test: 'multi-block paste flattens to inline content like an <input>', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSlot.test.ts:3199` test: 'paste into an EMPTY block value inserts without seeding a paragraph', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSlot.test.ts:3228` test: 'the boundary still scopes selection and select-all', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSlot.test.ts:3258` test: '$getNearestRootOrShadowRoot stops at the slot value', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSlot.test.ts:3286` test: 'backspace at the start of the value stays inside the boundary', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSlot.test.ts:3317` describe: 'named-slots: hydrate-time normalize (#8712)', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSlot.test.ts:3327` test: 'a slot value with a raw TextNode child gets a paragraph wrap on setEditorState', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSlot.test.ts:3404` describe: 'named-slots: typing-path paragraph wrap (#8712)', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSlot.test.ts:3413` test: 'element-mode caret before a decorator wraps the inserted text in a paragraph', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSlot.test.ts:3454` describe: 'named-slots: insertNodes redirect termination (#8712)', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSlot.test.ts:3462` test: 'seeds a paragraph when the slot value starts with a decorator', () => {

## `../lexical/packages/lexical/src/__tests__/unit/LexicalSlotSelection.test.ts`

category: portable
family: selection-dom-mapping / nested-root
target: indexed; target current Plite package proof and browser proof when DOM-dependent

- `../lexical/packages/lexical/src/__tests__/unit/LexicalSlotSelection.test.ts:54` describe: 'named-slots: selection containment (slot isolation)', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSlotSelection.test.ts:121` test: 'anchor in a slot, focus dragged into the body, clamps focus into the slot', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSlotSelection.test.ts:157` test: 'anchor in the body, focus dragged into a slot, pushes focus past the host', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSlotSelection.test.ts:190` test: 'a selection entirely within the body is left untouched', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSlotSelection.test.ts:222` test: 'a programmatic selection with anchor in a slot, focus in the body, clamps focus into the slot', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSlotSelection.test.ts:244` test: 'a programmatic selection with anchor in the body, focus in a slot, pushes focus past the host', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSlotSelection.test.ts:266` test: 'a programmatic selection entirely within the body is left untouched', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSlotSelection.test.ts:284` test: 'an in-place point mutation that straddles a slot is clamped at commit', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSlotSelection.test.ts:316` test: '$selectAll from inside a slot scopes to the slot, not the whole document', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSlotSelection.test.ts:337` test: '$selectAll from outside any slot still scopes to the whole document', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSlotSelection.test.ts:358` test: 'a programmatic selection across two slots clamps focus into the anchor slot', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSlotSelection.test.ts:388` describe: 'named-slots: Point.set rejects decorator key targets', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSlotSelection.test.ts:433` test: 'Point.set rejects decorator key with text type', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSlotSelection.test.ts:444` test: 'Point.set rejects decorator key with element type', () => {

## `../lexical/packages/lexical/src/__tests__/unit/LexicalUpdateTags.test.ts`

category: portable
family: portable editor behavior
target: indexed 7 test/describe lines; target packages/plite/test; add focused browser proof only when behavior depends on DOM/runtime transport

- `../lexical/packages/lexical/src/__tests__/unit/LexicalUpdateTags.test.ts:32` describe: 'LexicalUpdateTags tests', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalUpdateTags.test.ts:34` test: 'Built-in update tags work correctly', async () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalUpdateTags.test.ts:55` test: '$addUpdateTag and $hasUpdateTag work correctly', async () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalUpdateTags.test.ts:65` test: 'Multiple update tags can be added', async () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalUpdateTags.test.ts:78` test: 'Update tags via editor.update() options work', async () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalUpdateTags.test.ts:91` test: 'Update tags are cleared after update', async () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalUpdateTags.test.ts:106` test: 'Update tags affect editor behavior', async () => {

## `../lexical/packages/lexical/src/__tests__/unit/LexicalUtils.test.ts`

category: portable
family: portable editor behavior
target: indexed 35 test/describe lines; target packages/plite/test; add focused browser proof only when behavior depends on DOM/runtime transport

- `../lexical/packages/lexical/src/__tests__/unit/LexicalUtils.test.ts:64` describe: 'LexicalUtils tests', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalUtils.test.ts:66` test: 'scheduleMicroTask(): native', async () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalUtils.test.ts:82` test: 'scheduleMicroTask(): promise', async () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalUtils.test.ts:102` test: 'emptyFunction()', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalUtils.test.ts:108` test: 'resetRandomKey()', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalUtils.test.ts:120` test: 'generateRandomKey()', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalUtils.test.ts:130` test: 'isArray()', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalUtils.test.ts:135` test: 'isSelectionWithinEditor()', async () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalUtils.test.ts:174` test: 'getTextDirection()', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalUtils.test.ts:207` test: 'isExactShortcutMatch() matches by event.key for single-letter', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalUtils.test.ts:229` test: 'isExactShortcutMatch() matches to event.key for ASCII remapped layout (English (US) Dvorak)', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalUtils.test.ts:257` test: 'isExactShortcutMatch() fallback to event.code for single-letter in event.key via non-English layout', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalUtils.test.ts:279` test: 'isExactShortcutMatch() matches special keys', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalUtils.test.ts:308` test: 'isExactShortcutMatch() matches optional keys', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalUtils.test.ts:343` test: 'isMoveToEnd() / isMoveToStart() accept Shift modifier', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalUtils.test.ts:383` test: 'isTokenOrSegmented()', async () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalUtils.test.ts:398` test: '$getNodeByKey', async () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalUtils.test.ts:421` test: '$nodesOfType', async () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalUtils.test.ts:450` describe: '$onUpdate', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalUtils.test.ts:451` test: 'deferred even when there are no dirty nodes', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalUtils.test.ts:481` test: 'added fn runs after update, original onUpdate, and prior calls to $onUpdate', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalUtils.test.ts:510` test: 'adding fn throws outside update', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalUtils.test.ts:517` test: 'getCachedTypeToNodeMap', async () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalUtils.test.ts:572` test: 'scrollIntoViewIfNeeded respects scroll-padding on document element', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalUtils.test.ts:611` test: 'scrollIntoViewIfNeeded ignores a selection rect that lies entirely above the editor', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalUtils.test.ts:637` describe: '$applyNodeReplacement', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalUtils.test.ts:676` test: 'validates replace node configuration', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalUtils.test.ts:702` test: 'validates replace node type withKlass', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalUtils.test.ts:728` test: 'validates replace node type change', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalUtils.test.ts:760` test: 'validates replace node key change', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalUtils.test.ts:787` test: 'validates replace node configuration withKlass', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalUtils.test.ts:813` test: 'validates nested replace node configuration', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalUtils.test.ts:843` test: 'validates nested replace node configuration withKlass', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalUtils.test.ts:876` test: 'nested replace node configuration works', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalUtils.test.ts:913` describe: '$copyNode', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalUtils.test.ts:938` test: 'does not mark the original as dirty', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalUtils.test.ts:966` test: 'returns a shallow copy', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalUtils.test.ts:1007` describe: 'getRegisteredSubtypeMap', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalUtils.test.ts:1013` test: 'maps each type to itself and its registered subclass types', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalUtils.test.ts:1031` test: 'expands a $config subclass under its base type', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalUtils.test.ts:1043` test: 'omits an unregistered base type even when a subclass is registered', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalUtils.test.ts:1055` describe: '$updateTextNodeFromDOMContent', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalUtils.test.ts:1085` test: 'removes delayed composition text node if it stays empty', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalUtils.test.ts:1113` test: 'does not remove delayed composition text node if IME repopulates it', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalUtils.test.ts:1145` describe: 'getParentElement', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalUtils.test.ts:1146` test: 'crosses ShadowRoot to host when parentElement is null', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalUtils.test.ts:1157` test: 'returns the light-DOM parentElement when present', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalUtils.test.ts:1167` test: 'crosses one ShadowRoot per call for nested shadow trees', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalUtils.test.ts:1184` test: 'returns null for a detached node with no parent', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalUtils.test.ts:1189` test: 'returns parent element for a text node inside a shadow tree', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalUtils.test.ts:1204` describe: 'getStaticNodeConfig()', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalUtils.test.ts:1205` test: 'derives the type and config from $config()', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalUtils.test.ts:1223` test: 'caches the result for a node class', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalUtils.test.ts:1242` test: 'resolves symbol-keyed config for abstract node classes', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalUtils.test.ts:1253` describe: 'iterStaticNodeConfigChain', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalUtils.test.ts:1254` test: 'handles a loose transform', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalUtils.test.ts:1296` test: 'handles a class transform', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalUtils.test.ts:1309` describe: '$getDocument', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalUtils.test.ts:1311` test: 'returns ownerDocument when rootElement is mounted', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalUtils.test.ts:1316` test: 'returns globalThis.document when rootElement is null', () => {
- `../lexical/packages/lexical/src/__tests__/unit/LexicalUtils.test.ts:1322` test: 'returns globalThis.document when called with no active editor', () => {

## `../lexical/packages/lexical/src/__tests__/unit/mergeRegister.test.ts`

category: portable
family: portable editor behavior
target: indexed 3 test/describe lines; target packages/plite/test; add focused browser proof only when behavior depends on DOM/runtime transport

- `../lexical/packages/lexical/src/__tests__/unit/mergeRegister.test.ts:11` describe: 'mergeRegister', () => {
- `../lexical/packages/lexical/src/__tests__/unit/mergeRegister.test.ts:12` it: 'calls all of the clean-up functions', () => {
- `../lexical/packages/lexical/src/__tests__/unit/mergeRegister.test.ts:17` it: 'calls the clean-up functions in reverse order', () => {

## `../lexical/packages/lexical/src/__tests__/unit/registerEventListener.test.ts`

category: portable
family: portable editor behavior
target: indexed; target current Plite package proof and browser proof when DOM-dependent

- `../lexical/packages/lexical/src/__tests__/unit/registerEventListener.test.ts:11` describe: 'registerEventListener', () => {
- `../lexical/packages/lexical/src/__tests__/unit/registerEventListener.test.ts:12` it: 'adds the listener and dispatches events to it', () => {
- `../lexical/packages/lexical/src/__tests__/unit/registerEventListener.test.ts:20` it: 'returns a dispose function that removes the listener', () => {
- `../lexical/packages/lexical/src/__tests__/unit/registerEventListener.test.ts:29` it: 'forwards the capture option to addEventListener and removeEventListener', () => {

## `../lexical/packages/lexical/src/__tests__/unit/registerEventListeners.test.ts`

category: portable
family: portable editor behavior
target: indexed; target current Plite package proof and browser proof when DOM-dependent

- `../lexical/packages/lexical/src/__tests__/unit/registerEventListeners.test.ts:11` describe: 'registerEventListeners', () => {
- `../lexical/packages/lexical/src/__tests__/unit/registerEventListeners.test.ts:12` it: 'registers every listener in the map', () => {
- `../lexical/packages/lexical/src/__tests__/unit/registerEventListeners.test.ts:23` it: 'returns a dispose function that removes every listener', () => {
- `../lexical/packages/lexical/src/__tests__/unit/registerEventListeners.test.ts:38` it: 'forwards the shared options to add and removeEventListener', () => {

## `../lexical/packages/lexical/src/__tests__/unit/setDOMStyle.test.ts`

category: portable
family: portable editor behavior
target: indexed; target current Plite package proof and browser proof when DOM-dependent

- `../lexical/packages/lexical/src/__tests__/unit/setDOMStyle.test.ts:16` describe: 'setDOMStyle', () => {
- `../lexical/packages/lexical/src/__tests__/unit/setDOMStyle.test.ts:17` it: 'parses CSS text into a style object', () => {
- `../lexical/packages/lexical/src/__tests__/unit/setDOMStyle.test.ts:29` it: 'parses values with comments, semicolons and colons inside quotes and parentheses', () => {
- `../lexical/packages/lexical/src/__tests__/unit/setDOMStyle.test.ts:42` it: 'returns a fresh style object for each parse', () => {
- `../lexical/packages/lexical/src/__tests__/unit/setDOMStyle.test.ts:49` it: 'applies CSS text without cssText', () => {
- `../lexical/packages/lexical/src/__tests__/unit/setDOMStyle.test.ts:62` it: 'replaces previous inline styles when CSS text changes', () => {
- `../lexical/packages/lexical/src/__tests__/unit/setDOMStyle.test.ts:81` it: 'applies direct style objects', () => {
- `../lexical/packages/lexical/src/__tests__/unit/setDOMStyle.test.ts:95` it: 'drops comments and respects quotes and parentheses', () => {

## `../lexical/packages/lexical/src/caret/__tests__/unit/LexicalCaret.test.ts`

category: portable
family: selection-dom-mapping / void-atom
target: indexed 50 test/describe lines; target packages/plite/test; packages/plite-react/test/editable-behavior.test.tsx; apps/www/tests/plite-browser/donor/stress/generated-editing.test.ts

- `../lexical/packages/lexical/src/caret/__tests__/unit/LexicalCaret.test.ts:90` describe: 'LexicalCaret', () => {
- `../lexical/packages/lexical/src/caret/__tests__/unit/LexicalCaret.test.ts:92` describe: '$getChildCaret', () => {
- `../lexical/packages/lexical/src/caret/__tests__/unit/LexicalCaret.test.ts:94` test: `direction ${direction}`, async () => {
- `../lexical/packages/lexical/src/caret/__tests__/unit/LexicalCaret.test.ts:200` describe: '$getSiblingCaret', () => {
- `../lexical/packages/lexical/src/caret/__tests__/unit/LexicalCaret.test.ts:202` test: `direction ${direction}`, async () => {
- `../lexical/packages/lexical/src/caret/__tests__/unit/LexicalCaret.test.ts:441` describe: '$caretRangeFromSelection', () => {
- `../lexical/packages/lexical/src/caret/__tests__/unit/LexicalCaret.test.ts:442` test: 'collapsed text point selection', async () => {
- `../lexical/packages/lexical/src/caret/__tests__/unit/LexicalCaret.test.ts:501` test: `full text node selection (${direction})`, async () => {
- `../lexical/packages/lexical/src/caret/__tests__/unit/LexicalCaret.test.ts:551` test: 'single text node non-empty selection', async () => {
- `../lexical/packages/lexical/src/caret/__tests__/unit/LexicalCaret.test.ts:600` test: `multiple text node non-empty selection (${direction})`, async () => {
- `../lexical/packages/lexical/src/caret/__tests__/unit/LexicalCaret.test.ts:696` describe: '$removeTextFromCaretRange', () => {
- `../lexical/packages/lexical/src/caret/__tests__/unit/LexicalCaret.test.ts:698` describe: 'ported Headings e2e tests', () => {
- `../lexical/packages/lexical/src/caret/__tests__/unit/LexicalCaret.test.ts:699` test: 'Pressing return in the middle of a heading creates a new heading below', () => {
- `../lexical/packages/lexical/src/caret/__tests__/unit/LexicalCaret.test.ts:729` describe: 'ported File e2e tests', () => {
- `../lexical/packages/lexical/src/caret/__tests__/unit/LexicalCaret.test.ts:730` test: '$selectAll() with nesting and a trailing decorator', () => {
- `../lexical/packages/lexical/src/caret/__tests__/unit/LexicalCaret.test.ts:760` describe: 'ported Table e2e tests', () => {
- `../lexical/packages/lexical/src/caret/__tests__/unit/LexicalCaret.test.ts:761` test: 'Can delete all with range selection anchored in table', () => {
- `../lexical/packages/lexical/src/caret/__tests__/unit/LexicalCaret.test.ts:797` describe: 'ported LexicalSelection tests', () => {
- `../lexical/packages/lexical/src/caret/__tests__/unit/LexicalCaret.test.ts:798` test: 'remove partial initial TextNode and partial segmented TextNode', () => {
- `../lexical/packages/lexical/src/caret/__tests__/unit/LexicalCaret.test.ts:860` describe: 'single block', () => {
- `../lexical/packages/lexical/src/caret/__tests__/unit/LexicalCaret.test.ts:872` test: 'remove second TextNode when wrapped in a LinkNode that will become empty', () => {
- `../lexical/packages/lexical/src/caret/__tests__/unit/LexicalCaret.test.ts:921` test: 'remove first TextNode with second in token mode', () => {
- `../lexical/packages/lexical/src/caret/__tests__/unit/LexicalCaret.test.ts:963` test: 'collapsed text point selection', async () => {
- `../lexical/packages/lexical/src/caret/__tests__/unit/LexicalCaret.test.ts:1023` describe: 'full text node internal selection', () => {
- `../lexical/packages/lexical/src/caret/__tests__/unit/LexicalCaret.test.ts:1026` test: `${text} node (${direction})`, async () => {
- `../lexical/packages/lexical/src/caret/__tests__/unit/LexicalCaret.test.ts:1101` describe: 'full text node biased selection', () => {
- `../lexical/packages/lexical/src/caret/__tests__/unit/LexicalCaret.test.ts:1111` test: `${text} node (${direction} ${anchorBias} ${focusBias})`, async () => {
- `../lexical/packages/lexical/src/caret/__tests__/unit/LexicalCaret.test.ts:1256` describe: 'single text node non-empty partial selection', () => {
- `../lexical/packages/lexical/src/caret/__tests__/unit/LexicalCaret.test.ts:1261` test: `${direction} ${anchorEdgeOffset}:${-focusEdgeOffset}`, async () => {
- `../lexical/packages/lexical/src/caret/__tests__/unit/LexicalCaret.test.ts:1322` describe: 'multiple text node selection', () => {
- `../lexical/packages/lexical/src/caret/__tests__/unit/LexicalCaret.test.ts:1336` test: `${direction} ${texts[nodeIndexStart]} ${startFn.name} ${texts[nodeIndexEnd]} ${endFn.name}`, async () => {
- `../lexical/packages/lexical/src/caret/__tests__/unit/LexicalCaret.test.ts:1484` describe: 'multiple blocks', () => {
- `../lexical/packages/lexical/src/caret/__tests__/unit/LexicalCaret.test.ts:1498` describe: 'multiple text node selection', () => {
- `../lexical/packages/lexical/src/caret/__tests__/unit/LexicalCaret.test.ts:1512` test: `${direction} ${texts[nodeIndexStart]} ${startFn.name} ${texts[nodeIndexEnd]} ${endFn.name}`, async () => {
- `../lexical/packages/lexical/src/caret/__tests__/unit/LexicalCaret.test.ts:1655` test: 'remove range between list and nested list', () => {
- `../lexical/packages/lexical/src/caret/__tests__/unit/LexicalCaret.test.ts:1697` describe: 'Ordering', () => {
- `../lexical/packages/lexical/src/caret/__tests__/unit/LexicalCaret.test.ts:1735` describe: '$comparePointCaretNext', () => {
- `../lexical/packages/lexical/src/caret/__tests__/unit/LexicalCaret.test.ts:1736` test: 'trivial caret checks', () => {
- `../lexical/packages/lexical/src/caret/__tests__/unit/LexicalCaret.test.ts:1767` test: 'TextPointCaret checks single origin', () => {
- `../lexical/packages/lexical/src/caret/__tests__/unit/LexicalCaret.test.ts:1825` test: 'TextPointCaret multiple origin', () => {
- `../lexical/packages/lexical/src/caret/__tests__/unit/LexicalCaret.test.ts:1851` describe: '$getCommonAncestor', () => {
- `../lexical/packages/lexical/src/caret/__tests__/unit/LexicalCaret.test.ts:1852` test: 'trivial node checks', () => {
- `../lexical/packages/lexical/src/caret/__tests__/unit/LexicalCaret.test.ts:1899` test: title, () => {
- `../lexical/packages/lexical/src/caret/__tests__/unit/LexicalCaret.test.ts:1957` describe: 'LexicalSelectionHelpers', () => {
- `../lexical/packages/lexical/src/caret/__tests__/unit/LexicalCaret.test.ts:1959` describe: 'with a fully-selected text node preceded by an inline element', () => {
- `../lexical/packages/lexical/src/caret/__tests__/unit/LexicalCaret.test.ts:1960` test: 'a single text node', async () => {
- `../lexical/packages/lexical/src/caret/__tests__/unit/LexicalCaret.test.ts:1995` describe: 'canBeEmpty()=false parent cleanup', () => {
- `../lexical/packages/lexical/src/caret/__tests__/unit/LexicalCaret.test.ts:1996` test: 'MarkNode is removed when all children are deleted via element-type range', () => {
- `../lexical/packages/lexical/src/caret/__tests__/unit/LexicalCaret.test.ts:2025` test: 'LinkNode is removed when all children are deleted via element-type range', () => {
- `../lexical/packages/lexical/src/caret/__tests__/unit/LexicalCaret.test.ts:2053` test: 'canBeEmpty()=false parent survives when only some children are removed', () => {
- `../lexical/packages/lexical/src/caret/__tests__/unit/LexicalCaret.test.ts:2080` test: 'multiple canBeEmpty()=false parents in same range are cleaned up', () => {
- `../lexical/packages/lexical/src/caret/__tests__/unit/LexicalCaret.test.ts:2112` describe: '$splitAtPointCaretNext', () => {
- `../lexical/packages/lexical/src/caret/__tests__/unit/LexicalCaret.test.ts:2114` test: 'Does not split a TextNode at the beginning', () => {
- `../lexical/packages/lexical/src/caret/__tests__/unit/LexicalCaret.test.ts:2130` test: 'Splits a TextNode in the middle', () => {
- `../lexical/packages/lexical/src/caret/__tests__/unit/LexicalCaret.test.ts:2149` test: 'Splits a ParagraphNode', () => {

## `../lexical/packages/lexical/src/caret/__tests__/unit/docs-traversals.test.ts`

category: portable
family: portable editor behavior
target: indexed 14 test/describe lines; target packages/plite/test; add focused browser proof only when behavior depends on DOM/runtime transport

- `../lexical/packages/lexical/src/caret/__tests__/unit/docs-traversals.test.ts:32` describe: 'traversals.md', () => {
- `../lexical/packages/lexical/src/caret/__tests__/unit/docs-traversals.test.ts:34` describe: 'Traversal Strategies', () => {
- `../lexical/packages/lexical/src/caret/__tests__/unit/docs-traversals.test.ts:73` describe: 'Adjacent Caret Traversals', () => {
- `../lexical/packages/lexical/src/caret/__tests__/unit/docs-traversals.test.ts:74` test: '$iterSiblings', () => {
- `../lexical/packages/lexical/src/caret/__tests__/unit/docs-traversals.test.ts:109` test: 'root has no siblings', () => {
- `../lexical/packages/lexical/src/caret/__tests__/unit/docs-traversals.test.ts:119` test: 'root has paragraph children', () => {
- `../lexical/packages/lexical/src/caret/__tests__/unit/docs-traversals.test.ts:144` test: 'iteration does not include the origin', () => {
- `../lexical/packages/lexical/src/caret/__tests__/unit/docs-traversals.test.ts:161` describe: 'Depth First Caret Traversals', () => {
- `../lexical/packages/lexical/src/caret/__tests__/unit/docs-traversals.test.ts:162` describe: '$iterCaretsDepthFirst', () => {
- `../lexical/packages/lexical/src/caret/__tests__/unit/docs-traversals.test.ts:163` test: 'via generator', () => {
- `../lexical/packages/lexical/src/caret/__tests__/unit/docs-traversals.test.ts:214` test: 'via CaretRange', () => {
- `../lexical/packages/lexical/src/caret/__tests__/unit/docs-traversals.test.ts:249` describe: '$iterNodesDepthFirst', () => {
- `../lexical/packages/lexical/src/caret/__tests__/unit/docs-traversals.test.ts:269` test: 'includes only wholly included nodes', () => {
- `../lexical/packages/lexical/src/caret/__tests__/unit/docs-traversals.test.ts:297` test: 'full traversal', () => {

## `../lexical/packages/lexical/src/nodes/__tests__/unit/LexicalElementNode.test.tsx`

category: portable
family: portable editor behavior
target: indexed 36 test/describe lines; target packages/plite/test; add focused browser proof only when behavior depends on DOM/runtime transport

- `../lexical/packages/lexical/src/nodes/__tests__/unit/LexicalElementNode.test.tsx:44` describe: 'LexicalElementNode tests', () => {
- `../lexical/packages/lexical/src/nodes/__tests__/unit/LexicalElementNode.test.tsx:109` describe: 'exportJSON()', () => {
- `../lexical/packages/lexical/src/nodes/__tests__/unit/LexicalElementNode.test.tsx:110` test: 'should return and object conforming to the expected schema', async () => {
- `../lexical/packages/lexical/src/nodes/__tests__/unit/LexicalElementNode.test.tsx:129` test: 'serializes only the first TextNode style and format', async () => {
- `../lexical/packages/lexical/src/nodes/__tests__/unit/LexicalElementNode.test.tsx:172` test: 'serializes the same way without a root element', async () => {
- `../lexical/packages/lexical/src/nodes/__tests__/unit/LexicalElementNode.test.tsx:190` describe: 'getChildren()', () => {
- `../lexical/packages/lexical/src/nodes/__tests__/unit/LexicalElementNode.test.tsx:191` test: 'no children', async () => {
- `../lexical/packages/lexical/src/nodes/__tests__/unit/LexicalElementNode.test.tsx:200` test: 'some children', async () => {
- `../lexical/packages/lexical/src/nodes/__tests__/unit/LexicalElementNode.test.tsx:211` describe: 'getAllTextNodes()', () => {
- `../lexical/packages/lexical/src/nodes/__tests__/unit/LexicalElementNode.test.tsx:212` test: 'basic', async () => {
- `../lexical/packages/lexical/src/nodes/__tests__/unit/LexicalElementNode.test.tsx:222` test: 'nested', async () => {
- `../lexical/packages/lexical/src/nodes/__tests__/unit/LexicalElementNode.test.tsx:253` describe: 'getFirstChild()', () => {
- `../lexical/packages/lexical/src/nodes/__tests__/unit/LexicalElementNode.test.tsx:254` test: 'basic', async () => {
- `../lexical/packages/lexical/src/nodes/__tests__/unit/LexicalElementNode.test.tsx:264` test: 'empty', async () => {
- `../lexical/packages/lexical/src/nodes/__tests__/unit/LexicalElementNode.test.tsx:272` describe: 'getLastChild()', () => {
- `../lexical/packages/lexical/src/nodes/__tests__/unit/LexicalElementNode.test.tsx:273` test: 'basic', async () => {
- `../lexical/packages/lexical/src/nodes/__tests__/unit/LexicalElementNode.test.tsx:283` test: 'empty', async () => {
- `../lexical/packages/lexical/src/nodes/__tests__/unit/LexicalElementNode.test.tsx:291` describe: 'getTextContent()', () => {
- `../lexical/packages/lexical/src/nodes/__tests__/unit/LexicalElementNode.test.tsx:292` test: 'basic', async () => {
- `../lexical/packages/lexical/src/nodes/__tests__/unit/LexicalElementNode.test.tsx:298` test: 'empty', async () => {
- `../lexical/packages/lexical/src/nodes/__tests__/unit/LexicalElementNode.test.tsx:305` test: 'nested', async () => {
- `../lexical/packages/lexical/src/nodes/__tests__/unit/LexicalElementNode.test.tsx:334` describe: 'getTextContentSize()', () => {
- `../lexical/packages/lexical/src/nodes/__tests__/unit/LexicalElementNode.test.tsx:335` test: 'basic', async () => {
- `../lexical/packages/lexical/src/nodes/__tests__/unit/LexicalElementNode.test.tsx:343` test: 'child node getTextContentSize() can be overridden and is then reflected when calling the same method on parent node', async () => {
- `../lexical/packages/lexical/src/nodes/__tests__/unit/LexicalElementNode.test.tsx:355` describe: 'splice', () => {
- `../lexical/packages/lexical/src/nodes/__tests__/unit/LexicalElementNode.test.tsx:464` it: `Plain text: ${testCase.name}`, async () => {
- `../lexical/packages/lexical/src/nodes/__tests__/unit/LexicalElementNode.test.tsx:607` it: `Nested elements: ${testCase.name}`, async () => {
- `../lexical/packages/lexical/src/nodes/__tests__/unit/LexicalElementNode.test.tsx:670` it: 'Running transforms for inserted nodes, their previous siblings and new siblings', async () => {
- `../lexical/packages/lexical/src/nodes/__tests__/unit/LexicalElementNode.test.tsx:720` describe: 'getDOMSlot tests', () => {
- `../lexical/packages/lexical/src/nodes/__tests__/unit/LexicalElementNode.test.tsx:771` test: 'can create wrapper', () => {
- `../lexical/packages/lexical/src/nodes/__tests__/unit/LexicalElementNode.test.tsx:805` test: 'DOM selection uses getDOMSlot element for element selections', () => {
- `../lexical/packages/lexical/src/nodes/__tests__/unit/LexicalElementNode.test.tsx:828` describe: 'indexPath', () => {
- `../lexical/packages/lexical/src/nodes/__tests__/unit/LexicalElementNode.test.tsx:829` test: 'no path', () => {
- `../lexical/packages/lexical/src/nodes/__tests__/unit/LexicalElementNode.test.tsx:833` test: 'only child', () => {
- `../lexical/packages/lexical/src/nodes/__tests__/unit/LexicalElementNode.test.tsx:839` test: 'nested child', () => {
- `../lexical/packages/lexical/src/nodes/__tests__/unit/LexicalElementNode.test.tsx:847` test: 'nested child with siblings', () => {

## `../lexical/packages/lexical/src/nodes/__tests__/unit/LexicalGC.test.tsx`

category: portable
family: portable editor behavior
target: indexed 5 test/describe lines; target packages/plite/test; add focused browser proof only when behavior depends on DOM/runtime transport

- `../lexical/packages/lexical/src/nodes/__tests__/unit/LexicalGC.test.tsx:25` describe: 'LexicalGC tests', () => {
- `../lexical/packages/lexical/src/nodes/__tests__/unit/LexicalGC.test.tsx:27` test: 'RootNode.clear() with a child and subchild', async () => {
- `../lexical/packages/lexical/src/nodes/__tests__/unit/LexicalGC.test.tsx:41` test: 'RootNode.clear() with a child and three subchildren', async () => {
- `../lexical/packages/lexical/src/nodes/__tests__/unit/LexicalGC.test.tsx:59` test: `RootNode.clear() with a child and three subchildren, subchild ${i} removed first`, async () => {
- `../lexical/packages/lexical/src/nodes/__tests__/unit/LexicalGC.test.tsx:95` test: `RootNode.clear() with a complex tree, nodes ${removeKeys.toString()} removed first`, async () => {

## `../lexical/packages/lexical/src/nodes/__tests__/unit/LexicalLineBreakNode.test.ts`

category: portable
family: portable editor behavior
target: indexed 6 test/describe lines; target packages/plite/test; add focused browser proof only when behavior depends on DOM/runtime transport

- `../lexical/packages/lexical/src/nodes/__tests__/unit/LexicalLineBreakNode.test.ts:14` describe: 'LexicalLineBreakNode tests', () => {
- `../lexical/packages/lexical/src/nodes/__tests__/unit/LexicalLineBreakNode.test.ts:16` test: 'LineBreakNode.constructor', async () => {
- `../lexical/packages/lexical/src/nodes/__tests__/unit/LexicalLineBreakNode.test.ts:27` test: 'LineBreakNode.exportJSON() should return and object conforming to the expected schema', async () => {
- `../lexical/packages/lexical/src/nodes/__tests__/unit/LexicalLineBreakNode.test.ts:44` test: 'LineBreakNode.createDOM()', async () => {
- `../lexical/packages/lexical/src/nodes/__tests__/unit/LexicalLineBreakNode.test.ts:55` test: 'LineBreakNode.updateDOM()', async () => {
- `../lexical/packages/lexical/src/nodes/__tests__/unit/LexicalLineBreakNode.test.ts:65` test: 'LineBreakNode.$isLineBreakNode()', async () => {

## `../lexical/packages/lexical/src/nodes/__tests__/unit/LexicalParagraphNode.test.ts`

category: portable
family: portable editor behavior
target: indexed 9 test/describe lines; target packages/plite/test; add focused browser proof only when behavior depends on DOM/runtime transport

- `../lexical/packages/lexical/src/nodes/__tests__/unit/LexicalParagraphNode.test.ts:31` describe: 'LexicalParagraphNode tests', () => {
- `../lexical/packages/lexical/src/nodes/__tests__/unit/LexicalParagraphNode.test.ts:33` test: 'ParagraphNode.constructor', async () => {
- `../lexical/packages/lexical/src/nodes/__tests__/unit/LexicalParagraphNode.test.ts:45` test: 'ParagraphNode.exportJSON() should return and object conforming to the expected schema', async () => {
- `../lexical/packages/lexical/src/nodes/__tests__/unit/LexicalParagraphNode.test.ts:68` test: 'ParagraphNode.createDOM()', async () => {
- `../lexical/packages/lexical/src/nodes/__tests__/unit/LexicalParagraphNode.test.ts:86` test: 'ParagraphNode.updateDOM()', async () => {
- `../lexical/packages/lexical/src/nodes/__tests__/unit/LexicalParagraphNode.test.ts:107` test: 'ParagraphNode.insertNewAfter()', async () => {
- `../lexical/packages/lexical/src/nodes/__tests__/unit/LexicalParagraphNode.test.ts:132` test: '$createParagraphNode()', async () => {
- `../lexical/packages/lexical/src/nodes/__tests__/unit/LexicalParagraphNode.test.ts:145` test: '$isParagraphNode()', async () => {
- `../lexical/packages/lexical/src/nodes/__tests__/unit/LexicalParagraphNode.test.ts:155` test: 'ParagraphNode.importDOM handles both CSS text-align and legacy align attribute', async () => {

## `../lexical/packages/lexical/src/nodes/__tests__/unit/LexicalRootNode.test.ts`

category: portable
family: portable editor behavior
target: indexed 16 test/describe lines; target packages/plite/test; add focused browser proof only when behavior depends on DOM/runtime transport

- `../lexical/packages/lexical/src/nodes/__tests__/unit/LexicalRootNode.test.ts:32` describe: 'LexicalRootNode tests', () => {
- `../lexical/packages/lexical/src/nodes/__tests__/unit/LexicalRootNode.test.ts:63` test: 'RootNode.constructor', async () => {
- `../lexical/packages/lexical/src/nodes/__tests__/unit/LexicalRootNode.test.ts:73` test: 'RootNode.exportJSON() should return and object conforming to the expected schema', async () => {
- `../lexical/packages/lexical/src/nodes/__tests__/unit/LexicalRootNode.test.ts:94` test: 'RootNode.clone()', async () => {
- `../lexical/packages/lexical/src/nodes/__tests__/unit/LexicalRootNode.test.ts:101` test: 'RootNode.createDOM()', async () => {
- `../lexical/packages/lexical/src/nodes/__tests__/unit/LexicalRootNode.test.ts:106` test: 'RootNode.updateDOM()', async () => {
- `../lexical/packages/lexical/src/nodes/__tests__/unit/LexicalRootNode.test.ts:111` test: 'RootNode.isAttached()', async () => {
- `../lexical/packages/lexical/src/nodes/__tests__/unit/LexicalRootNode.test.ts:115` test: 'RootNode.isRootNode()', () => {
- `../lexical/packages/lexical/src/nodes/__tests__/unit/LexicalRootNode.test.ts:119` test: 'Cached getTextContent with decorators', async () => {
- `../lexical/packages/lexical/src/nodes/__tests__/unit/LexicalRootNode.test.ts:136` test: 'RootNode.clear() to handle selection update', async () => {
- `../lexical/packages/lexical/src/nodes/__tests__/unit/LexicalRootNode.test.ts:166` test: 'RootNode is selected when its selected child is removed', async () => {
- `../lexical/packages/lexical/src/nodes/__tests__/unit/LexicalRootNode.test.ts:196` test: 'RootNode is not selected when all children are removed with no selection', async () => {
- `../lexical/packages/lexical/src/nodes/__tests__/unit/LexicalRootNode.test.ts:218` test: 'RootNode __cachedText incremental update #8096', () => {
- `../lexical/packages/lexical/src/nodes/__tests__/unit/LexicalRootNode.test.ts:241` test: 'RootNode __cachedText', async () => {
- `../lexical/packages/lexical/src/nodes/__tests__/unit/LexicalRootNode.test.ts:309` test: 'RootNode __cachedText (empty paragraph)', async () => {
- `../lexical/packages/lexical/src/nodes/__tests__/unit/LexicalRootNode.test.ts:319` test: 'RootNode __cachedText (inlines)', async () => {

## `../lexical/packages/lexical/src/nodes/__tests__/unit/LexicalTabNode.test.tsx`

category: portable
family: clipboard-paste / browser-engine
target: indexed 15 test/describe lines; target packages/plite/test/clipboard-contract.ts; packages/plite-dom/test/clipboard-boundary.test.ts; apps/www/tests/plite-browser/donor/examples/paste-html.test.ts; apps/www/tests/plite-browser/donor/stress/generated-editing.test.ts

- `../lexical/packages/lexical/src/nodes/__tests__/unit/LexicalTabNode.test.tsx:40` describe: 'LexicalTabNode tests', () => {
- `../lexical/packages/lexical/src/nodes/__tests__/unit/LexicalTabNode.test.tsx:52` test: 'can paste plain text with tabs and newlines in plain text', async () => {
- `../lexical/packages/lexical/src/nodes/__tests__/unit/LexicalTabNode.test.tsx:66` test: 'can paste plain text with tabs and newlines in rich text', async () => {
- `../lexical/packages/lexical/src/nodes/__tests__/unit/LexicalTabNode.test.tsx:81` test: 'can paste HTML with tabs and new lines #4429', async () => {
- `../lexical/packages/lexical/src/nodes/__tests__/unit/LexicalTabNode.test.tsx:100` test: 'can paste HTML with tabs and new lines (2)', async () => {
- `../lexical/packages/lexical/src/nodes/__tests__/unit/LexicalTabNode.test.tsx:118` test: 'element indents when selection at the start of the block', async () => {
- `../lexical/packages/lexical/src/nodes/__tests__/unit/LexicalTabNode.test.tsx:136` test: 'elements indent when selection spans across multiple blocks', async () => {
- `../lexical/packages/lexical/src/nodes/__tests__/unit/LexicalTabNode.test.tsx:171` test: 'element tabs when selection is not at the start (1)', async () => {
- `../lexical/packages/lexical/src/nodes/__tests__/unit/LexicalTabNode.test.tsx:187` test: 'element tabs when selection is not at the start (2)', async () => {
- `../lexical/packages/lexical/src/nodes/__tests__/unit/LexicalTabNode.test.tsx:206` test: 'element tabs when selection is not at the start (3)', async () => {
- `../lexical/packages/lexical/src/nodes/__tests__/unit/LexicalTabNode.test.tsx:225` test: 'elements tabs when selection is not at the start and overlaps another tab', async () => {
- `../lexical/packages/lexical/src/nodes/__tests__/unit/LexicalTabNode.test.tsx:248` test: 'can type between two (leaf nodes) canInsertBeforeAfter false', async () => {
- `../lexical/packages/lexical/src/nodes/__tests__/unit/LexicalTabNode.test.tsx:262` test: 'can be serialized and deserialized', async () => {
- `../lexical/packages/lexical/src/nodes/__tests__/unit/LexicalTabNode.test.tsx:287` describe: 'TabNode at selection boundaries with normal TextNode sibling (#7602)', () => {
- `../lexical/packages/lexical/src/nodes/__tests__/unit/LexicalTabNode.test.tsx:294` test: `TabNode ${JSON.stringify(input)} to ${JSON.stringify(
- `../lexical/packages/lexical/src/nodes/__tests__/unit/LexicalTabNode.test.tsx:327` test: 'setTextContent normalizes back to \\t without throwing (#8596)', () => {

## `../lexical/packages/lexical/src/nodes/__tests__/unit/LexicalTextNode.test.tsx`

category: portable
family: portable editor behavior
target: indexed 30 test/describe lines; target packages/plite/test; add focused browser proof only when behavior depends on DOM/runtime transport

- `../lexical/packages/lexical/src/nodes/__tests__/unit/LexicalTextNode.test.tsx:74` describe: 'LexicalTextNode tests', () => {
- `../lexical/packages/lexical/src/nodes/__tests__/unit/LexicalTextNode.test.tsx:133` describe: 'exportJSON()', () => {
- `../lexical/packages/lexical/src/nodes/__tests__/unit/LexicalTextNode.test.tsx:134` test: 'should return and object conforming to the expected schema', async () => {
- `../lexical/packages/lexical/src/nodes/__tests__/unit/LexicalTextNode.test.tsx:156` describe: 'root.getTextContent()', () => {
- `../lexical/packages/lexical/src/nodes/__tests__/unit/LexicalTextNode.test.tsx:157` test: 'writable nodes', async () => {
- `../lexical/packages/lexical/src/nodes/__tests__/unit/LexicalTextNode.test.tsx:187` test: 'prepend node', async () => {
- `../lexical/packages/lexical/src/nodes/__tests__/unit/LexicalTextNode.test.tsx:210` describe: 'setTextContent()', () => {
- `../lexical/packages/lexical/src/nodes/__tests__/unit/LexicalTextNode.test.tsx:211` test: 'writable nodes', async () => {
- `../lexical/packages/lexical/src/nodes/__tests__/unit/LexicalTextNode.test.tsx:221` describe: [
- `../lexical/packages/lexical/src/nodes/__tests__/unit/LexicalTextNode.test.tsx:237` test: `getFormatFlags(${formatFlag})`, async () => {
- `../lexical/packages/lexical/src/nodes/__tests__/unit/LexicalTextNode.test.tsx:259` test: `predicate for ${formatFlag}`, async () => {
- `../lexical/packages/lexical/src/nodes/__tests__/unit/LexicalTextNode.test.tsx:277` test: `toggling for ${formatFlag}`, async () => {
- `../lexical/packages/lexical/src/nodes/__tests__/unit/LexicalTextNode.test.tsx:307` test: 'setting subscript clears superscript', async () => {
- `../lexical/packages/lexical/src/nodes/__tests__/unit/LexicalTextNode.test.tsx:320` test: 'setting superscript clears subscript', async () => {
- `../lexical/packages/lexical/src/nodes/__tests__/unit/LexicalTextNode.test.tsx:333` test: 'clearing subscript does not set superscript', async () => {
- `../lexical/packages/lexical/src/nodes/__tests__/unit/LexicalTextNode.test.tsx:346` test: 'clearing superscript does not set subscript', async () => {
- `../lexical/packages/lexical/src/nodes/__tests__/unit/LexicalTextNode.test.tsx:359` test: 'capitalization formats are mutually exclusive', async () => {
- `../lexical/packages/lexical/src/nodes/__tests__/unit/LexicalTextNode.test.tsx:385` test: 'selectPrevious()', async () => {
- `../lexical/packages/lexical/src/nodes/__tests__/unit/LexicalTextNode.test.tsx:407` test: 'selectNext()', async () => {
- `../lexical/packages/lexical/src/nodes/__tests__/unit/LexicalTextNode.test.tsx:432` describe: 'select()', () => {
- `../lexical/packages/lexical/src/nodes/__tests__/unit/LexicalTextNode.test.tsx:433` test: [
- `../lexical/packages/lexical/src/nodes/__tests__/unit/LexicalTextNode.test.tsx:477` describe: 'splitText()', () => {
- `../lexical/packages/lexical/src/nodes/__tests__/unit/LexicalTextNode.test.tsx:478` test: 'convert segmented node into plain text', async () => {
- `../lexical/packages/lexical/src/nodes/__tests__/unit/LexicalTextNode.test.tsx:494` test: [
- `../lexical/packages/lexical/src/nodes/__tests__/unit/LexicalTextNode.test.tsx:522` test: 'splitText moves composition key to last node', async () => {
- `../lexical/packages/lexical/src/nodes/__tests__/unit/LexicalTextNode.test.tsx:534` test: [
- `../lexical/packages/lexical/src/nodes/__tests__/unit/LexicalTextNode.test.tsx:650` test: 'with detached parent', async () => {
- `../lexical/packages/lexical/src/nodes/__tests__/unit/LexicalTextNode.test.tsx:662` test: 'copies state to all nodes', async () => {
- `../lexical/packages/lexical/src/nodes/__tests__/unit/LexicalTextNode.test.tsx:683` test: 'copies state to all nodes (segmented)', async () => {
- `../lexical/packages/lexical/src/nodes/__tests__/unit/LexicalTextNode.test.tsx:699` describe: 'createDOM()', () => {
- `../lexical/packages/lexical/src/nodes/__tests__/unit/LexicalTextNode.test.tsx:700` test: [
- `../lexical/packages/lexical/src/nodes/__tests__/unit/LexicalTextNode.test.tsx:811` test: 'applies styles with direct DOM property updates', async () => {
- `../lexical/packages/lexical/src/nodes/__tests__/unit/LexicalTextNode.test.tsx:829` describe: 'has parent node', () => {
- `../lexical/packages/lexical/src/nodes/__tests__/unit/LexicalTextNode.test.tsx:830` test: [
- `../lexical/packages/lexical/src/nodes/__tests__/unit/LexicalTextNode.test.tsx:850` describe: 'updateDOM()', () => {
- `../lexical/packages/lexical/src/nodes/__tests__/unit/LexicalTextNode.test.tsx:851` test: [
- `../lexical/packages/lexical/src/nodes/__tests__/unit/LexicalTextNode.test.tsx:950` test: 'updates and removes styles with direct DOM property updates', async () => {
- `../lexical/packages/lexical/src/nodes/__tests__/unit/LexicalTextNode.test.tsx:970` describe: 'exportDOM()', () => {
- `../lexical/packages/lexical/src/nodes/__tests__/unit/LexicalTextNode.test.tsx:971` test: [
- `../lexical/packages/lexical/src/nodes/__tests__/unit/LexicalTextNode.test.tsx:1021` test: 'mergeWithSibling', async () => {
