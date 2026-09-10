import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const output = resolve(
  'docs/plans/artifacts/2026-09-09-editor-performance-research-iteration-2'
);
const traces = JSON.parse(
  readFileSync(`${output}/public-contract-traces.json`, 'utf8')
);
const cases = JSON.parse(
  readFileSync(`${output}/canonical-playwright-case-index.json`, 'utf8')
).cases;
const recipes = JSON.parse(
  readFileSync(`${output}/canonical-journey-index.json`, 'utf8')
);

// Each line is an independent user action; input variants remain explicit dimensions.
const definitions = {
  lifecycle: {
    lanes: [
      'plite.extensions',
      'plite.multiview',
      'plite.facets',
      'plate.react-composition',
    ],
    pattern:
      /mount|unmount|remount|StrictMode|lifecycle|editor switch|replace.*editor|initial|read.?only|focus|blur|metadata|reconfiguration|schema.only|root chrome/i,
    actions: `open-document|Open a document and reach the first editable caret
remount-document|Return to a previously opened document
first-focus|Focus an unfocused editor
focus-refocus-type|Leave the editor, return, and type
switch-editors|Switch between independent editors
switch-shared-views|Switch between views of one shared document
open-nested-root|Enter an element-owned content root
toggle-readonly|Change between editable and read-only state
replace-document|Load a different document into the mounted editor
reconfigure-feature|Enable, disable, or replace a feature during a session
close-editor|Close the editor and release view resources
restore-session|Restore persisted content and selection`,
  },
  text: {
    lanes: [
      'plite.editing-primitives',
      'plite.input-runtime',
      'plite.text-rendering',
    ],
    pattern:
      /typ|insert|input|character|text|backspace|delete|Enter|newline|break|join|split|replace/i,
    actions: `first-type|Type the first character after opening
type-burst|Type a continuous burst
replace-selection|Type over a selected range
replace-large-selection|Replace a large selected range
backspace|Delete the previous character
delete-forward|Delete the next character
delete-word-backward|Delete the previous word
delete-word-forward|Delete the next word
delete-line-start|Delete from the caret to line start
delete-line-end|Delete from the caret to line end
split|Press Enter to split a block
soft-break|Insert a soft line break
join|Delete across adjacent block boundaries
delete-document|Select all and delete
transpose-characters|Transpose adjacent characters where supported
insert-tab|Insert indentation or a literal tab according to the current block
clear-formatting|Remove formatting from selected text`,
  },
  composition: {
    lanes: ['plite.composition', 'plite.input-runtime'],
    pattern:
      /IME|composition|android|CJK|replacement|autocorrect|dictation|spell|dead.?key|emoji|grapheme|surrogate|unicode/i,
    actions: `compose-start-update|Start composition and update preedit text
compose-commit|Commit an IME candidate
compose-cancel|Cancel composition without committing
compose-replace-range|Compose over an existing selection
compose-cross-update|Continue composition during a remote or decoration update
dead-key-accent|Enter text through a dead key or combining sequence
emoji-grapheme-edit|Insert and delete emoji, modifiers, and joined graphemes
autocorrect-replacement|Accept a native autocorrect replacement
spellcheck-replacement|Apply a browser spelling correction
dictation-insert|Insert dictated text through the OS input service
android-delete-surrounding|Use Android surrounding-text deletion
input-method-switch|Switch keyboard or language during the session`,
  },
  navigation: {
    lanes: [
      'plite.native-selection',
      'plite.selection',
      'plite.dom-coordinates',
    ],
    pattern:
      /Arrow|caret|cursor|selection|select|word|line.?start|line.?end|document.?start|document.?end|Home|End|PageUp|PageDown|bidi|RTL/i,
    actions: `move-left|Move the caret left
move-right|Move the caret right
word-left|Move one word backward
word-right|Move one word forward
line-start|Move to visual line start
line-end|Move to visual line end
document-start|Move to document start
document-end|Move to document end
previous-block-end|Move to the previous block end
next-block-start|Move to the next block start
move-up|Move to the previous visual line
move-down|Move to the next visual line
page-up|Move one viewport upward
page-down|Move one viewport downward
extend-selection|Extend a text selection with the keyboard
select-all|Select all editor content
click-caret|Place the caret with a pointer
double-click-word|Select a word with a double click
triple-click-block|Select a line or block with a triple click
pointer-range-select|Drag to select a text range
touch-handle-select|Adjust native selection handles on touch hardware
node-select|Select a block or atomic node
cross-root-select|Select across supported content-root boundaries
bidi-visual-navigation|Navigate mixed-direction visual text`,
  },
  clipboard: {
    lanes: [
      'plite.clipboard',
      'plate.html',
      'plate.docx',
      'plate.markdown',
      'plate.csv',
    ],
    pattern:
      /paste|copy|cut|clipboard|HTML|docx|markdown|CSV|serialization|serialize/i,
    actions: `copy-selection|Copy a selected range
cut|Cut a selected range
copy-cross-block|Copy across block or root boundaries
paste-text|Paste plain text
paste-multiline|Paste multiline plain text
paste-large-text|Paste a large plain-text payload
paste-html|Paste rich HTML
paste-office|Paste Word or office HTML
paste-exact-fragment|Paste an editor fragment with schema metadata
paste-incompatible-fragment|Paste a fragment from a different schema
paste-table-grid|Paste tabular cells into a selected grid
paste-image-file|Paste an image or file
paste-url|Paste a URL over a selection or into an empty block
paste-malformed-input|Paste malformed, unsupported, or oversized content`,
  },
  formatting: {
    lanes: [
      'plate.basic-nodes',
      'plate.basic-styles',
      'plate.indent',
      'plate.link',
      'plate.input-rules',
    ],
    pattern:
      /bold|italic|underline|strike|mark|style|format|heading|blockquote|font|color|align|indent|link|input.?rule|autoformat|hovering.toolbar/i,
    actions: `bold-type|Toggle bold at the caret and type
format-range|Apply or remove a mark over a range
text-color|Change text or highlight color
font-properties|Change font family or size
block-type|Convert paragraphs, headings, quotes, or callouts
block-alignment|Change alignment or direction
block-indent|Indent or outdent blocks
link-create|Create a link from selected text
link-edit|Edit a link target or label
link-remove|Remove a link while keeping its text
input-rule-transform|Trigger a typed text, mark, or block input rule
input-rule-undo|Undo an automatic formatting rule`,
  },
  history: {
    lanes: ['plite.history', 'plate.substrate-adoption'],
    pattern: /undo|redo|history|batch|recover/i,
    actions: `undo|Undo the most recent editing batch
redo|Redo an undone batch
undo-deep|Undo through a long editing history
history-branch|Edit after undo and discard the redo branch
undo-remote-interleaving|Undo a local edit after remote changes
undo-structural-selection|Undo a structural edit and restore its caret or node selection`,
  },
  lists: {
    lanes: ['plate.list', 'plate.indent'],
    pattern: /list|check.?box|check.?list|bullet|ordered|unordered/i,
    actions: `list-toggle|Convert blocks into or out of a list
list-split-exit|Split a list item or exit an empty item
list-nest|Nest or unnest a list item
list-merge|Merge neighboring list items or lists
list-reorder|Move list items
checklist-toggle|Check or uncheck an item
list-numbering|Change numbering or restart a sequence`,
  },
  tables: {
    lanes: ['plate.table'],
    pattern: /table|cell|row|column|grid|merge|span/i,
    actions: `table-insert|Insert a table
table-cell-type|Type or replace text inside a cell
table-cell-navigation|Move between cells with keyboard commands
table-cell-select|Select a cell, rectangle, row, or column
table-row-insert|Insert rows
table-column-insert|Insert columns
table-row-delete|Delete rows
table-column-delete|Delete columns
table-merge-cells|Merge selected cells
table-split-cell|Split a merged cell
table-row-reorder|Reorder rows
table-column-reorder|Reorder columns
table-column-resize|Resize a column with a pointer
table-row-resize|Resize a row with a pointer
table-cell-format|Change cell fill, border, or alignment
table-exit|Exit a table at its boundary
table-delete|Delete a table`,
  },
  code: {
    lanes: ['plate.code-block', 'plite.text-rendering'],
    pattern: /code|highlight|language|token|CodeMirror|physical.line/i,
    actions: `code-insert|Insert or convert to a code block
code-type|Type in multiline code
code-indent|Indent or outdent selected physical lines
code-newline|Insert a code newline with indentation
code-language|Change syntax language
code-find-replace|Find or replace inside a nested code editor
code-copy|Copy the code block
code-exit|Leave code at a block boundary`,
  },
  embeds: {
    lanes: [
      'plate.media',
      'plate.math',
      'plate.excalidraw',
      'plate.code-drawing',
      'plate.resizable',
    ],
    pattern:
      /image|media|upload|file|embed|caption|resize|math|equation|drawing|diagram|excalidraw|void/i,
    actions: `media-insert|Insert media by URL
media-upload|Upload a local file or image
media-upload-cancel|Cancel an upload or recover from failure
media-caption|Edit a media caption
media-resize|Resize an image or embedded element
media-preview|Open and navigate a media preview
media-remove|Remove media or an atomic embed
math-edit|Insert or edit an equation
drawing-edit|Open, edit, and close a drawing
diagram-render|Edit source and render a diagram
embed-focus-transfer|Move focus into and out of a nested external editor`,
  },
  inline_ui: {
    lanes: [
      'plate.mention',
      'plate.slash-command',
      'plate.emoji',
      'plate.combobox',
      'plate.date',
      'plate.tag',
    ],
    pattern:
      /mention|slash|emoji|combobox|command.menu|date|tag|multi.?select|suggestion.*menu/i,
    actions: `mention-query|Type a mention trigger and filter results
mention-accept|Choose or cancel a mention
slash-query|Open and filter slash commands
slash-execute|Execute or cancel a slash command
emoji-picker|Search for and insert an emoji
date-insert-edit|Insert or change a date
tag-select|Add, remove, or edit tags
popup-keyboard|Navigate a popup with the keyboard`,
  },
  review: {
    lanes: [
      'plate.comments',
      'plate.suggestion',
      'plate.diff',
      'plite.annotations',
      'plite.view-sources',
    ],
    pattern:
      /comment|thread|annotation|suggestion|review|diff|decoration|overlay|widget/i,
    actions: `comment-create|Create a comment on a selection
comment-open-navigate|Open a thread and navigate to its anchor
comment-reply-edit|Reply to or edit a comment
comment-resolve-delete|Resolve, reopen, or delete a thread
suggestion-type|Edit while tracking changes
suggestion-accept|Accept a suggested change
suggestion-reject|Reject a suggested change
suggestion-bulk-review|Accept or reject multiple changes
diff-inspect|Compare versions and navigate differences
annotation-refresh|Update external annotations while editing
decoration-refresh|Apply synchronous or asynchronous decorations
widget-interact|Interact with an inline or block widget`,
  },
  find: {
    lanes: ['plate.find', 'plate.toc', 'plate.footnote'],
    pattern:
      /find|search|match|replace|table.of.contents|toc|heading navigation|footnote/i,
    actions: `find-query|Type or replace a search query
find-next-previous|Navigate search matches
find-edit-active|Edit content while search is active
find-replace-one|Replace one match where the feature supports it
find-replace-all|Replace all matches where the feature supports it
find-clear|Clear or close the search
toc-navigate|Navigate through the table of contents
footnote-insert|Insert a footnote reference and content
footnote-navigate|Move between reference and footnote body`,
  },
  collaboration: {
    lanes: [
      'plite.collaboration-document',
      'plite.collaboration-presence',
      'plate.yjs',
    ],
    pattern: /collab|remote|awareness|Yjs|provider|reconnect|synced|shared/i,
    actions: `collab-local-edit|Edit a document connected to a provider
collab-remote-text|Receive a remote text edit
collab-remote-structure|Receive a remote structural or content-root edit
collab-concurrent-edit|Edit concurrently with another participant
collab-presence-move|Receive cursor or selection awareness updates
collab-peer-join-leave|Add or remove a participant
collab-disconnect-edit|Continue local editing while disconnected
collab-reconnect|Reconnect and reconcile pending changes
collab-schema-mismatch|Encounter a room or document schema mismatch`,
  },
  ai: {
    lanes: ['plate.ai'],
    pattern: /AI|copilot|stream|assistant|chat|preview|completion/i,
    actions: `ai-open-submit|Open the assistant and submit a prompt
ai-stream|Render a streaming response into its preview
ai-cancel|Stop a stream
ai-accept|Accept the generated change
ai-reject|Discard the generated change
ai-regenerate|Regenerate a response
copilot-accept|Accept a whole or partial inline completion
ai-edit-during-stream|Edit, move, or delete the target during streaming`,
  },
  viewport: {
    lanes: [
      'plite.virtualization',
      'plite.staged-rendering',
      'plite.pagination',
      'plate.layout',
      'plate.details',
      'plite.drag',
    ],
    pattern:
      /scroll|viewport|virtual|staged|pagination|page|layout|resize|drag|drop|zoom|print|details|collapse|expand|hidden|DOM.strategy|DOM.coverage|huge.document.*controls/i,
    actions: `scroll|Scroll the document
scroll-jump|Drag the scrollbar or jump to a distant location
resize|Resize the editor viewport
zoom-font-change|Change zoom, font metrics, or line wrapping
drag-block|Drag a block within an editor
drag-cross-editor|Drag content between editors
drop-external|Drop external text, HTML, or files
drag-autoscroll|Select or drag while auto-scrolling
collapse-expand|Collapse or expand details or other content
column-layout|Insert or resize a multi-column layout
paginate-reflow|Reflow pages after content or page-geometry changes
page-navigate|Navigate between pages or spreads
virtual-selection-promote|Select or navigate into unmounted content
print-document|Print the complete document`,
  },
  persistence_accessibility: {
    lanes: [
      'plate.markdown',
      'plate.html',
      'plate.docx',
      'plate.static',
      'plite.document',
      'plite.accessibility',
      'plate.tabbable',
    ],
    pattern:
      /serial|export|import|snapshot|JSON|markdown|HTML|docx|print|screen.reader|announce|accessib|tabbable|Tab|focus/i,
    actions: `serialize|Save the canonical document representation
import-json|Load serialized editor content
import-markdown|Import Markdown or MDX
export-markdown|Export Markdown or MDX
import-docx|Import a DOCX document
export-docx|Export a DOCX document
render-static|Render read-only static HTML
screen-reader-read|Read and navigate editor content using assistive technology
screen-reader-announce|Receive a contextual editor announcement
tab-through-controls|Navigate editor controls using Tab and Shift+Tab`,
  },
};
definitions.lifecycle.actions +=
  '\nedit-document-metadata|Edit persistent document metadata outside content';
definitions.formatting.actions +=
  '\nformatting-toolbar-open|Open, use, and dismiss a contextual formatting toolbar';

const commonIds = [
  'first-type',
  'type-burst',
  'replace-selection',
  'backspace',
  'delete-forward',
  'split',
  'join',
  'move-left',
  'extend-selection',
  'bold-type',
  'undo',
  'redo',
  'paste-text',
  'paste-multiline',
  'paste-html',
  'cut',
  'scroll',
  'resize',
  'serialize',
  'move-right',
  'word-left',
  'word-right',
  'line-start',
  'line-end',
  'document-start',
  'document-end',
  'previous-block-end',
  'next-block-start',
  'click-caret',
  'double-click-word',
  'copy-selection',
  'focus-refocus-type',
  'paste-large-text',
  'replace-large-selection',
];
const families = Object.entries(definitions).map(([id, definition]) => {
  const source = traces.modules.filter((module) =>
    definition.lanes.includes(module.lane)
  );
  const candidateJourneys = cases.filter((item) =>
    definition.pattern.test(`${item.file} ${item.title}`)
  );
  return {
    id,
    lanes: definition.lanes,
    sourceFiles: source.map((module) => ({
      file: module.file,
      sha256: module.sha256,
      actionSites: module.actionSites,
      lifecycleSites: module.lifecycleSites,
    })),
    candidateJourneys,
    operations: definition.actions.split('\n').map((line) => {
      const [operation, action] = line.split('|');
      return {
        id: operation,
        action,
        comparativePacket: commonIds.includes(operation)
          ? 'cross-editor-common-full-dom-chunk-on.json'
          : null,
        completeOperationTiming: commonIds.includes(operation)
          ? 'completed-packet; native-event-to-two-frame proxy and verified-state upper bound; failed/unsupported cells retained'
          : 'not-yet-measured-as-a-complete-operation',
        journeyProof:
          'Family associations are discovery links. Each scenario keeps its original assertions; a family match is not proof of every operation or input variant.',
        rawDeviceRequired:
          /compose|dictation|autocorrect|spellcheck|android|touch-handle|screen-reader/.test(
            operation
          ),
        virtualizationContract:
          id === 'viewport' ||
          /selection|document-start|document-end|paste|copy|cut|print|screen-reader|compose/.test(
            operation
          )
            ? 'Separate full-DOM and virtualized cohorts; native or complete-document behavior must remain explicit.'
            : null,
      };
    }),
  };
});
const operations = families.flatMap((family) => family.operations);
if (
  new Set(operations.map((operation) => operation.id)).size !==
  operations.length
)
  throw new Error('Duplicate operation ID');
const missingCommon = commonIds.filter(
  (id) => !operations.some((operation) => operation.id === id)
);
if (missingCommon.length)
  throw new Error(`Missing common operations: ${missingCommon.join(', ')}`);
const uniqueCandidates = new Set(
  families.flatMap((family) =>
    family.candidateJourneys.map(
      (item) => `${item.file}:${item.line}:${item.title}`
    )
  )
);
const unmappedCases = cases.filter(
  (item) => !uniqueCandidates.has(`${item.file}:${item.line}:${item.title}`)
);
const result = {
  capturedAt: new Date().toISOString(),
  scope:
    'Finite operation taxonomy from current runtime input routing, public feature owners, copied UI action sites, all 752 canonical Chromium cases, and Wordgard/ProseKit editing families. The denominator includes unsupported or unmeasured operations; it is not a Cartesian claim over every language, browser, schema, plugin and document.',
  familyCount: families.length,
  operationCount: operations.length,
  commonComparativeOperationCount: commonIds.length,
  browserScreening: {
    plite: 'journey-event-timing-summary.json',
    plate: 'www-journey-event-timing-summary.json',
    plateFailureReplays: 'www-correctness-dispositions.json',
    policy:
      'Completed diagnostic journey receipts retain all outcomes and censored Event Timing observations. They do not close the 178 matched complete-operation timing gaps.',
  },
  completeOperationGaps: operations
    .filter((operation) => !operation.comparativePacket)
    .map((operation) => operation.id),
  inputDimensions: {
    documentSize: [
      '100 short paragraphs',
      '1,000 paragraphs',
      '10,000 paragraphs',
      'one 10,000-line leaf',
      'large tables',
      'many roots and views',
    ],
    shape: [
      'nesting',
      'inline marks',
      'atomic nodes',
      'content roots',
      'many annotations',
      'long history',
    ],
    text: [
      'ASCII',
      'CJK',
      'combining accents',
      'emoji and surrogate pairs',
      'mixed RTL/LTR',
      'CRLF and newline normalization',
    ],
    phase: [
      'cold open',
      'first interaction',
      'settled repeated interaction',
      'teardown and retained memory',
    ],
    environment: [
      'Chromium',
      'Firefox',
      'WebKit',
      'narrow viewport',
      'physical Android',
      'physical iOS',
      'assistive technology',
    ],
    concurrency: [
      'one editor',
      'many editors',
      'many views of one editor',
      'remote update',
      'composition plus asynchronous decoration',
      'streaming AI plus local editing',
    ],
  },
  candidateCaseCount: cases.length,
  associatedCaseCount: uniqueCandidates.size,
  unassociatedCases: unmappedCases,
  routeCount: new Set(recipes.map((item) => item.route)).size,
  families,
};
writeFileSync(
  `${output}/human-operation-catalog.json`,
  `${JSON.stringify(result, null, 2)}\n`
);
const rows = families.flatMap((family) =>
  family.operations.map(
    (operation) =>
      `| \`${operation.id}\` | ${family.id} | ${operation.action} | ${operation.comparativePacket ? 'Completed common packet; per-cell validity retained' : 'Complete-operation timing gap'} | ${operation.rawDeviceRequired ? 'Physical/native capability needed' : 'Owned browser or package runner'} |`
  )
);
writeFileSync(
  `${output}/human-operation-catalog.md`,
  `# Human operation coverage\n\n${result.scope}\n\n${operations.length} operations in ${families.length} families; ${commonIds.length} operations in the matched nine-editor packet. The remaining ${result.completeOperationGaps.length} remain visible measurement obligations. Family-linked browser cases provide correctness and Event Timing screening, not matched complete-operation comparisons.\n\n[Machine-readable source, cases, variants and gaps](human-operation-catalog.json), [Plite journey screening](journey-event-timing-summary.md), [Plate journey screening](www-journey-event-timing-summary.md), [Plate failure replays](www-correctness-dispositions.md).\n\n| Operation | Family | User action | Timing evidence | Proof surface |\n|---|---|---|---|---|\n${rows.join('\n')}\n`
);
console.log(
  JSON.stringify({
    families: families.length,
    operations: operations.length,
    common: commonIds.length,
    completeOperationGaps: result.completeOperationGaps.length,
    canonicalCases: cases.length,
    associated: uniqueCandidates.size,
    unassociated: unmappedCases.length,
  })
);
