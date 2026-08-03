const source = (...evidence) => evidence;
const refs = (...references) => references;

export const issueDecisions = [
  {
    number: 1,
    claim: 'Repeated link-command activation created concurrent link dialogs.',
    conceptIds: ['WG-PRODUCT-003D1', 'WG-VIEW-014A2'],
    currentSourceTruth:
      'Fixed. The link command detects the named open panel, restores editor focus when needed, closes it, and returns before opening another dialog.',
    sourceEvidence: source('../wordgard/src/schema/link.ts:8-42'),
    proofRelation:
      'The closing commit changed only source. The current test tree has no link-dialog multiplicity regression.',
    proofEvidence: source('../wordgard/src/schema/link.ts:8-42'),
    classification: 'fixed',
    changesAudit: false,
    auditChange:
      'Confirms link UI is owned jointly by the link bundle and generic dialog lifecycle; it does not change the current winner.',
    owner: 'external-framework',
    closureStatus: 'deferred-with-owner',
    reason:
      'Current source contains the fix, but Wordgard still owns the missing exact browser regression.',
    nextAction:
      'Add a browser test that activates Mod-k twice and asserts one dialog panel.',
    linkedRefs: refs('wordgard@9c9b2cfa3666b1bd33021716080cfaf2f8ae9461'),
  },
  {
    number: 2,
    claim:
      'Direction stored on a list-item textblock does not reliably place list markers or align text in Firefox and Chrome.',
    conceptIds: ['WG-CMD-003B2', 'WG-PRODUCT-003A2', 'WG-VIEW-013D'],
    currentSourceTruth:
      'Open. Direction remains a textblock mark and state facet; no list-wrapper projection propagates the direction contract to list marker layout.',
    sourceEvidence: source('../wordgard/src/schema/block.ts:184-258'),
    proofRelation:
      'Bidi state tests cover cursor logic, not browser list marker placement or Firefox list alignment.',
    proofEvidence: source('../wordgard/test/test-selection.ts:102-158'),
    classification: 'open',
    changesAudit: true,
    auditChange:
      'Downgrades Wordgard direction behavior from complete to partial at the product/DOM boundary; the data model is stronger than its list rendering contract.',
    owner: 'external-framework',
    closureStatus: 'deferred-with-owner',
    reason:
      'The open browser-layout contract belongs to Wordgard; no Plate/Plite source change follows from it.',
    nextAction:
      'Define list direction projection and add Firefox/Chromium browser rows.',
    linkedRefs: refs(),
  },
  {
    number: 3,
    claim:
      'Firefox Android moves the DOM selection before beforeinput, causing select-all deletion/replacement to use the wrong range and destabilize later input.',
    conceptIds: [
      'WG-VIEW-007A',
      'WG-VIEW-009A',
      'WG-VIEW-010B1',
      'WG-PROOF-004C',
    ],
    currentSourceTruth:
      'Fixed in source. Selectionchange records are staged and interpreted during flush, with touch recency used only to label pointer selection.',
    sourceEvidence: source('../wordgard/src/editor/domobserver.ts:125-159'),
    proofRelation:
      'The observed 733-test Chrome run is both desktop-only and stale-dist; no Firefox Android or current-head raw-device regression proves this sequence.',
    proofEvidence: source('../wordgard/test/webtest-dom-changes.ts:51-149'),
    classification: 'fixed',
    changesAudit: true,
    auditChange:
      'Strengthens the raw-mobile proof gap: a source fix exists, but no applicable device proof supports an exact mobile-input claim.',
    owner: 'external-framework',
    closureStatus: 'deferred-with-owner',
    reason:
      'Source fix is present; raw Firefox Android coverage remains Wordgard-owned.',
    nextAction:
      'Run select-all delete and replacement on Firefox Android with trace/video evidence.',
    linkedRefs: refs('wordgard@b2cbe0efb0f1afe1f2f8ca6c9794e54ef32e6e5f'),
  },
  {
    number: 4,
    claim:
      'Chrome Android voice typing emits stacked DOM deletions and insertions that made the visible caret diverge from the model selection.',
    conceptIds: [
      'WG-VIEW-006A',
      'LOCAL-NATIVE-INPUT-RECONCILIATION',
      'WG-VIEW-010A',
      'WG-PROOF-004C',
    ],
    currentSourceTruth:
      'Fixed according to the maintainer. The current input owner maintains a DOM document plus lazy mappings and reconciles stacked native changes before mapping target ranges into state.',
    sourceEvidence: source(
      '../wordgard/src/editor/input.ts:83-301',
      '../wordgard/src/editor/input.ts:812-840'
    ),
    proofRelation:
      'Desktop DOM-change tests cover stacked mapping primitives, but no current Google Voice Typing device test exists.',
    proofEvidence: source('../wordgard/test/webtest-dom-changes.ts:51-149'),
    classification: 'fixed',
    changesAudit: true,
    auditChange:
      'Provides concrete donor evidence for canonical native-DOM reconciliation while keeping its mobile proof status partial.',
    owner: 'external-framework',
    closureStatus: 'deferred-with-owner',
    reason:
      'Maintainer-reported device success is not a retained regression artifact.',
    nextAction:
      'Retain a Chrome Android voice-typing trace that asserts DOM, document, and caret convergence.',
    linkedRefs: refs(
      'wordgard@b41e3acddbf4d3489df2ae1a810ed807b4c20d6f',
      'wordgard@08cf145362a0..062f2476fd50e08'
    ),
  },
  {
    number: 5,
    claim: 'Two runtime error messages retained CodeMirror branding.',
    conceptIds: ['WG-STATE-004B', 'WG-VIEW-016'],
    currentSourceTruth:
      'Fixed. Plugin crash and duplicate-package diagnostics use Wordgard terminology.',
    sourceEvidence: source(
      '../wordgard/src/editor/editor.ts:1090-1151',
      '../wordgard/src/state/state.ts:710-740'
    ),
    proofRelation:
      'A current source search is sufficient for this non-behavioral string cleanup.',
    proofEvidence: source(
      '../wordgard/src/editor/editor.ts:1090-1151',
      '../wordgard/src/state/state.ts:710-740'
    ),
    classification: 'fixed',
    changesAudit: false,
    auditChange:
      'Terminology cleanup only; no architecture or proof conclusion changes.',
    owner: 'docs-support-release',
    closureStatus: 'invalid-skip',
    reason: 'Not an editor behavior or reusable architecture invariant.',
    nextAction: 'None.',
    linkedRefs: refs('wordgard@152fcfa4a24af957e7a44e13cfa3eff8dacde632'),
  },
  {
    number: 6,
    claim:
      'Bundled declarations resolved Pos.Plot.node to the namespace-local position class instead of the document Plot class.',
    conceptIds: ['WG-META-001', 'WG-META-002', 'WG-META-002B', 'WG-DOC-006'],
    currentSourceTruth:
      'Fixed in source through out-of-namespace type aliases. A fresh declaration build cannot currently prove the published surface because issue #32 breaks type checking first.',
    sourceEvidence: source('../wordgard/src/doc/pos.ts:160-263'),
    proofRelation:
      'No retained compile-only regression exists, and the frozen head cannot emit clean declarations while schema/code.ts is broken.',
    proofEvidence: source(
      '../wordgard/src/doc/pos.ts:160-263',
      '../wordgard/src/schema/code.ts:1-56'
    ),
    classification: 'fixed',
    changesAudit: false,
    auditChange:
      'The namespace-emission hazard remains relevant to packaging, but #32 already owns the current build-proof downgrade.',
    owner: 'external-framework',
    closureStatus: 'deferred-with-owner',
    reason:
      'Source shape is corrected; packed declaration proof is blocked by the current build failure.',
    nextAction:
      'After #32, compile the original consumer against the packed declaration bundle.',
    linkedRefs: refs(
      'wordgard/timeline-orphan@499b6ca43d6b98e61b955cda8610b5767ce940d3',
      'wordgard@e741fd9254a59bcd3565ad7f4cfc34ce1a2378bc',
      'wordgard@1acb231df7067bf5f85e694aaf4646181441e9ab'
    ),
  },
  {
    number: 7,
    claim:
      'The Origin Tracking example mishandled deletions spanning multiple attribution ranges.',
    conceptIds: ['WG-APPLICATION-BLAME-001', 'WG-APPLICATION-BLAME-002'],
    currentSourceTruth:
      'Fixed in the website example. BlameMap.update walks preserved and replaced gaps and merges adjacent equal-color sections.',
    sourceEvidence: source(
      '../wordgard-website/site/examples/blame/blame.ts:14-41'
    ),
    proofRelation:
      'The reporter manually confirmed the website fix; there is no retained automated example regression.',
    proofEvidence: source(
      '../wordgard-website/site/examples/blame/blame.ts:14-41'
    ),
    classification: 'fixed',
    changesAudit: false,
    auditChange:
      'Confirms the attribution example concepts found by the website audit; it does not alter the core editor comparison.',
    owner: 'docs-support-release',
    closureStatus: 'deferred-with-owner',
    reason:
      'Website source is fixed but the example has no automated cross-range deletion proof.',
    nextAction:
      'Add an example runner row for deletion across adjacent attribution ranges.',
    linkedRefs: refs(
      'wordgard/website-timeline-orphan@9dac3028bc399190821b5ffee16b65396df7eae0'
    ),
  },
  {
    number: 8,
    claim:
      'iOS autocorrect deleted the misspelled word instead of inserting its replacement.',
    conceptIds: [
      'WG-VIEW-009A',
      'LOCAL-NATIVE-INPUT-RECONCILIATION',
      'WG-PROOF-004C',
    ],
    currentSourceTruth:
      'Closed after the reporter could no longer reproduce on 0.1.2. No dedicated fixing commit was identified; current native-input reconciliation is the plausible owner.',
    sourceEvidence: source(
      '../wordgard/src/editor/input.ts:182-301',
      '../wordgard/src/editor/input.ts:812-840'
    ),
    proofRelation:
      'Reporter confirmation is the only exact evidence. The test suite has composition rows but no iOS autocorrect device row.',
    proofEvidence: source('../wordgard/test/webtest-composition.ts:1-187'),
    classification: 'fixed',
    changesAudit: true,
    auditChange:
      'Prevents treating the closure as source-proven and adds another required case to the raw iOS proof dossier.',
    owner: 'external-framework',
    closureStatus: 'deferred-with-owner',
    reason:
      'The symptom disappeared, but no attributable source delta or durable iOS proof exists.',
    nextAction:
      'Add iOS autocorrect replacement with document/caret convergence assertions.',
    linkedRefs: refs(),
  },
  {
    number: 9,
    claim: 'Wordgard lacked a nested-editor footnote example.',
    conceptIds: [
      'WG-META-004',
      'WG-INTEGRATION-NESTED-001',
      'WG-INTEGRATION-NESTED-002',
    ],
    currentSourceTruth:
      'Fixed in the website. The example defines an inline Footnote plot, projects it through a tooltip-hosted inner editor, and synchronizes inner/outer transactions.',
    sourceEvidence: source(
      '../wordgard-website/site/examples/footnote/footnote.ts:1-243'
    ),
    proofRelation:
      'The example exists, but the website has no retained end-to-end nested-editor verification.',
    proofEvidence: source(
      '../wordgard-website/site/examples/footnote/footnote.ts:69-182'
    ),
    classification: 'fixed',
    changesAudit: false,
    auditChange:
      'Confirms the independently source-derived nested synchronization and shared focus/history concepts; the issue does not expand or revise the union.',
    owner: 'docs-support-release',
    closureStatus: 'deferred-with-owner',
    reason: 'Implementation exists without automated example proof.',
    nextAction:
      'Exercise outer/inner edit, undo, focus transfer, and teardown in the website example runner.',
    linkedRefs: refs(),
  },
  {
    number: 10,
    claim: 'Wordgard lacks a CodeMirror-backed code-block editing example.',
    conceptIds: [
      'WG-META-004',
      'WG-PRODUCT-003A2',
      'WG-INTEGRATION-NESTED-001',
    ],
    currentSourceTruth:
      'Open. The website bundles CodeMirror modules for its playground, but no site/examples/codemirror example integrates a nested code editor.',
    sourceEvidence: source('../wordgard-website/src/codemirror.js:1-7'),
    proofRelation:
      'Repository inventory proves the example is absent; there is no applicable runtime proof.',
    proofEvidence: source('../wordgard-website/src/codemirror.js:1-7'),
    classification: 'open',
    changesAudit: false,
    auditChange:
      'Product/example breadth gap only; Plate already wins this layer.',
    owner: 'docs-support-release',
    closureStatus: 'deferred-with-owner',
    reason:
      'Open donor example request; no local Plate/Plite patch is justified.',
    nextAction:
      'Wordgard may add a nested code-editor example with focus/history ownership proof.',
    linkedRefs: refs(),
  },
  {
    number: 11,
    claim: 'CodeBlockLanguage has no keyboard-accessible value-selection UI.',
    conceptIds: ['WG-PRODUCT-003A2', 'WG-VIEW-014B'],
    currentSourceTruth:
      'Open. The language mark type exists and fenced-code input tries to apply it, but no menu control selects a value; that input-rule source is also currently missing imports.',
    sourceEvidence: source(
      '../wordgard/src/types/schema.ts:52-55',
      '../wordgard/src/schema/code.ts:1-56'
    ),
    proofRelation:
      'Mark serialization tests exist; no UI or accessibility test covers choosing a language.',
    proofEvidence: source(
      '../wordgard/test/test-change.ts:415-416',
      '../wordgard/test/test-change.ts:484-484'
    ),
    classification: 'open',
    changesAudit: false,
    auditChange: 'Product-control gap; #32 separately changes the build audit.',
    owner: 'external-framework',
    closureStatus: 'deferred-with-owner',
    reason: 'Open Wordgard product feature with no local adoption consequence.',
    nextAction:
      'Define the value-picker owner and prove keyboard/screen-reader operation.',
    linkedRefs: refs(),
  },
  {
    number: 12,
    claim:
      'The collaboration algorithm lacks a packaged practical client/server transport and complete operational documentation.',
    conceptIds: [
      'WG-COLLAB-001',
      'WG-COLLAB-002A',
      'WG-COLLAB-002B',
      'WG-COLLAB-002C',
      'WG-META-004',
      'WG-STATE-001B',
    ],
    currentSourceTruth:
      'Open. The package owns versioned client queues, receive/send helpers, transforms, corrections, and shared effects; sendableUpdate reserves a send by mutating CollabState. The practical client/server remains ad hoc website example code.',
    sourceEvidence: source(
      '../wordgard/src/collab/collab.ts:23-275',
      '../wordgard-website/site/examples/collab/collab.ts:17-260'
    ),
    proofRelation:
      'Retained test source covers convergence, starvation transforms, corrections, effects, and random input. Its observed execution resolved stale dist, and transport reconnect, persistence, authentication, and server lifecycle remain unproved.',
    proofEvidence: source('../wordgard/test/test-collab.ts:114-340'),
    classification: 'open',
    changesAudit: true,
    auditChange:
      'Keeps algorithmic collaboration exact but downgrades any claim of a complete practical collaboration system to partial. The observational-snapshot purity finding is independently source-derived, not issue-created.',
    owner: 'external-framework',
    closureStatus: 'deferred-with-owner',
    reason:
      'The remaining productized transport/server work belongs to Wordgard.',
    nextAction:
      'Separate algorithm proof from a packaged client/server contract and operational example.',
    linkedRefs: refs(),
  },
  {
    number: 13,
    claim:
      'Wordgard has no completion provider/query/selection/accept/cancel lifecycle.',
    conceptIds: ['WG-INTEGRATION-COMPLETION-001', 'WG-VIEW-014C1'],
    currentSourceTruth:
      'Open. Generic tooltip primitives exist, but there is no completion state, query lifecycle, command, or feature bundle.',
    sourceEvidence: source('../wordgard/src/editor/tooltip.ts:398-526'),
    proofRelation: 'No implementation means no applicable test.',
    proofEvidence: source('../wordgard/src/editor/tooltip.ts:398-526'),
    classification: 'open',
    changesAudit: true,
    auditChange:
      'Adds an issue-derived requirement row, but rejects centralizing completion in editor Core: Plate feature owners and copied UI already own the applicable product behavior.',
    owner: 'external-framework',
    closureStatus: 'deferred-with-owner',
    reason:
      'Open donor requirement with no implemented Wordgard contract to transplant.',
    nextAction:
      'Keep completion feature-owned in Plate; Wordgard must first define and prove its own lifecycle before it can be a donor.',
    linkedRefs: refs(),
  },
  {
    number: 14,
    claim:
      'An inline top style made the sticky menu panel impossible to offset with host CSS.',
    conceptIds: ['WG-VIEW-013A', 'WG-VIEW-014A1'],
    currentSourceTruth:
      'Fixed. Panel groups carry top/bottom classes and the base theme owns default offsets, allowing host CSS to override them.',
    sourceEvidence: source(
      '../wordgard/src/editor/panel.ts:147-190',
      '../wordgard/src/editor/theme.ts:145-166'
    ),
    proofRelation:
      'Reporter confirmation exists; no panel CSS regression test is retained.',
    proofEvidence: source('../wordgard/src/editor/theme.ts:145-166'),
    classification: 'fixed',
    changesAudit: false,
    auditChange:
      'Reaffirms CSS—not imperative DOM style—as the correct panel-layout owner.',
    owner: 'external-framework',
    closureStatus: 'deferred-with-owner',
    reason: 'Source fix exists without exact browser style proof.',
    nextAction:
      'Add a host-theme override assertion for top and bottom panel classes.',
    linkedRefs: refs(
      'wordgard@b4ef7ab85e8f4aaad8279e5efff54046196de847',
      'wordgard@ec00fb3cc66da0e0a5e6d7378ec9b01579d0676e'
    ),
  },
  {
    number: 15,
    claim:
      'Keyboard select-all followed by cut could delete the document into an invalid shape.',
    conceptIds: ['WG-DOC-012', 'WG-STATE-010B', 'WG-VIEW-010C2'],
    currentSourceTruth:
      'Fixed. Cut changes use schema fitting and explicitly remap a valid nearby selection after deletion.',
    sourceEvidence: source('../wordgard/src/editor/input.ts:584-605'),
    proofRelation:
      'ChangeSet fitting has strong unit coverage, but no exact Ctrl/Cmd-A then cut browser regression is retained.',
    proofEvidence: source('../wordgard/test/test-change.ts:123-216'),
    classification: 'fixed',
    changesAudit: false,
    auditChange:
      'Confirms clipboard deletion must pass through schema-aware replacement fitting.',
    owner: 'external-framework',
    closureStatus: 'deferred-with-owner',
    reason: 'Source fix is present; exact browser interaction proof is absent.',
    nextAction:
      'Add keyboard and mouse select-all cut rows against a non-empty-root schema.',
    linkedRefs: refs('wordgard@c926b15827b28b72e436df2f96f8dad865cd189f'),
  },
  {
    number: 16,
    claim:
      'Range-wrapper attribute changes were ignored because equality compared the new element with itself.',
    conceptIds: ['WG-VIEW-005A1', 'WG-VIEW-005C1'],
    currentSourceTruth:
      'Fixed. WrapperRangeDecoration.eq compares the other element with this element.',
    sourceEvidence: source('../wordgard/src/editor/decoration.ts:491-508'),
    proofRelation:
      'Exact browser regression source updates wrapper class a to b. The observed 733-test run imported ignored dist built at 01eb2b5, seven commits behind frozen head, so it is not current-head execution proof.',
    proofEvidence: source('../wordgard/test/webtest-content.ts:375-384'),
    classification: 'fixed',
    changesAudit: true,
    auditChange:
      'Downgrades current-head decoration proof to partial: fixed source and exact regression source exist, but the only observed execution is stale-dist.',
    owner: 'external-framework',
    closureStatus: 'deferred-with-owner',
    reason:
      'The exact upstream test source exists, but no run executes it against frozen-head runtime artifacts.',
    nextAction:
      'Repair the current build, resolve test imports to rebuilt current-head output, and rerun the exact row with module-resolution proof.',
    linkedRefs: refs('wordgard@514d79eb207b419571f10953249c611d93a2e2fb'),
  },
  {
    number: 17,
    claim:
      'A changed zero-width point widget at document end was not invalidated and redrawn.',
    conceptIds: ['WG-VIEW-005A2', 'WG-VIEW-005C1'],
    currentSourceTruth:
      'Fixed. Widget invalidation preserves zero-width changed sections at the document boundary.',
    sourceEvidence: source('../wordgard/src/editor/decoration.ts:1016-1035'),
    proofRelation:
      'Exact browser regression source flips the end widget x to y. The observed 733-test run imported ignored dist built at 01eb2b5, seven commits behind frozen head, so it is not current-head execution proof.',
    proofEvidence: source('../wordgard/test/webtest-content.ts:341-355'),
    classification: 'fixed',
    changesAudit: true,
    auditChange:
      'Downgrades current-head widget proof to partial: fixed source and exact regression source exist, but the only observed execution is stale-dist.',
    owner: 'external-framework',
    closureStatus: 'deferred-with-owner',
    reason:
      'The exact upstream test source exists, but no run executes it against frozen-head runtime artifacts.',
    nextAction:
      'Repair the current build, resolve test imports to rebuilt current-head output, and rerun the exact row with module-resolution proof.',
    linkedRefs: refs('wordgard@b4de5b3771c0ef089e2ea84fd70af0d932b72ab9'),
  },
  {
    number: 18,
    claim:
      'Merging simultaneous point and range decoration changes dropped the lower change.',
    conceptIds: ['WG-VIEW-005C1'],
    currentSourceTruth:
      'Fixed. joinRanges indexes the source list correctly and invalidation tracks the last appended end per source.',
    sourceEvidence: source(
      '../wordgard/src/editor/decoration.ts:954-976',
      '../wordgard/src/editor/decoration.ts:1007-1035'
    ),
    proofRelation:
      'Exact browser regression source changes a point and range in one transaction. The observed 733-test run imported ignored dist built at 01eb2b5, seven commits behind frozen head, so it is not current-head execution proof.',
    proofEvidence: source('../wordgard/test/webtest-content.ts:386-395'),
    classification: 'fixed',
    changesAudit: true,
    auditChange:
      'Downgrades current-head invalidation proof to partial: fixed source and exact regression source exist, but the only observed execution is stale-dist.',
    owner: 'external-framework',
    closureStatus: 'deferred-with-owner',
    reason:
      'The exact upstream test source exists, but no run executes it against frozen-head runtime artifacts.',
    nextAction:
      'Repair the current build, resolve test imports to rebuilt current-head output, and rerun the exact row with module-resolution proof.',
    linkedRefs: refs('wordgard@cb9c37749d4fb749679ddbd552126329b5a8dd2a'),
  },
  {
    number: 19,
    claim:
      'coordsAtPos returned the far edge near a block-display widget placed inside an inline-content plot.',
    conceptIds: ['WG-VIEW-005A2', 'WG-VIEW-006B'],
    currentSourceTruth:
      'Closed as unsupported/by-design. side -1 places the widget before the cursor, and block-display widgets inside inline content are outside the supported rendering contract.',
    sourceEvidence: source(
      '../wordgard/src/editor/decoration.ts:280-292',
      '../wordgard/src/editor/coords.ts:5-60'
    ),
    proofRelation:
      'No source fix or regression test exists because the reproduction violates the supported widget/layout contract.',
    proofEvidence: source('../wordgard/src/editor/decoration.ts:280-292'),
    classification: 'stale',
    changesAudit: false,
    auditChange:
      'Clarifies a contract boundary; it does not create a supported invariant to compare or adopt.',
    owner: 'external-framework',
    closureStatus: 'invalid-skip',
    reason:
      'The reported geometry expectation depends on an unsupported block-widget/inline-content combination.',
    nextAction:
      'Document the unsupported combination if users can reach it through public APIs.',
    linkedRefs: refs(),
  },
  {
    number: 20,
    claim:
      'Vertical motion crashed when the document root itself was the textblock.',
    conceptIds: ['WG-STATE-014', 'WG-VIEW-006B'],
    currentSourceTruth:
      'Fixed. Vertical motion uses the document tile when a textblock position has no parent instead of reading before on the top node.',
    sourceEvidence: source('../wordgard/src/editor/selection.ts:39-62'),
    proofRelation:
      'Retained browser test source covers general vertical motion, but the observed execution is stale-dist and none use a document root with direct inline content.',
    proofEvidence: source('../wordgard/test/webtest-coords.ts:109-175'),
    classification: 'fixed',
    changesAudit: false,
    auditChange:
      'No architecture delta; this is a fixed boundary case with a missing exact regression.',
    owner: 'external-framework',
    closureStatus: 'deferred-with-owner',
    reason:
      'Current source contains the fix; exact top-level-textblock proof is absent.',
    nextAction:
      'Add the reported direct-inline document schema to moveVertically browser tests.',
    linkedRefs: refs('wordgard@ddf6fd8a609eb96c02d6f39fd7580649c16eeef4'),
  },
  {
    number: 21,
    claim:
      'Horizontal motion across a soft wrap drew the caret after collapsed trailing whitespace.',
    conceptIds: ['WG-CMD-003E2', 'WG-STATE-011B', 'WG-STATE-013'],
    currentSourceTruth:
      'Fixed by forward-biasing logical motion except at bidi boundaries; current logical movement returns a forward side.',
    sourceEvidence: source('../wordgard/src/state/textblock.ts:215-227'),
    proofRelation:
      'Retained unit-test source covers logical and bidi movement, but the observed execution is stale-dist and no browser soft-wrap caret regression is retained.',
    proofEvidence: source('../wordgard/test/test-selection.ts:102-219'),
    classification: 'fixed',
    changesAudit: false,
    auditChange:
      'Confirms the cursor-side policy but does not change the current architecture verdict.',
    owner: 'external-framework',
    closureStatus: 'deferred-with-owner',
    reason: 'Source policy is present; layout-sensitive proof is absent.',
    nextAction: 'Add a fixed-width Chrome/Firefox soft-wrap motion row.',
    linkedRefs: refs('wordgard@4aec64b60180217b0206ba0e0efcdfe2a03c4bd8'),
  },
  {
    number: 22,
    claim:
      'readOnly prevented only some mutation paths, while menus and commands could still edit.',
    conceptIds: [
      'WG-STATE-003A',
      'WG-CMD-002B',
      'WG-VIEW-010B1',
      'WG-VIEW-014B',
    ],
    currentSourceTruth:
      'Fixed across command, menu, input, history, schema, and table owners. Text selection remains allowed by design; focusability/editable is a separate facet.',
    sourceEvidence: source(
      '../wordgard/src/state/state.ts:823-835',
      '../wordgard/src/command/commands.ts:20-305',
      '../wordgard/src/editor/input.ts:591-603'
    ),
    proofRelation:
      'The current test tree contains no cross-surface readOnly contract test.',
    proofEvidence: source('../wordgard/src/state/state.ts:823-835'),
    classification: 'fixed',
    changesAudit: false,
    auditChange:
      'Confirms readOnly is authoring policy, not selection/focus policy; no winner changes.',
    owner: 'external-framework',
    closureStatus: 'deferred-with-owner',
    reason: 'Broad source fix exists without one exact cross-surface proof.',
    nextAction:
      'Exercise keyboard, menus, paste/drop, history, and table mutations under readOnly.',
    linkedRefs: refs(
      'wordgard@53b5cec556c73dd5',
      'wordgard@d2f3f740d2adf1f7c19aede12a3ad947ef6b6d3f'
    ),
  },
  {
    number: 23,
    claim:
      'iOS swipe input at line start can insert an extra leading space through stale autocapitalization context.',
    conceptIds: [
      'WG-VIEW-009A',
      'LOCAL-NATIVE-INPUT-RECONCILIATION',
      'WG-VIEW-010B1',
      'WG-PROOF-004C',
    ],
    currentSourceTruth:
      'Open. Wordgard now delegates Enter and Backspace to native input on iOS/Android, but the maintainer explicitly describes this as mitigation rather than a complete autocapitalization fix.',
    sourceEvidence: source(
      '../wordgard/src/editor/input.ts:710-713',
      '../wordgard/src/editor/input.ts:812-840'
    ),
    proofRelation:
      'Only the issue recording exercises the symptom; no raw iOS regression exists.',
    proofEvidence: source('../wordgard/test/webtest-composition.ts:180-187'),
    classification: 'open',
    changesAudit: true,
    auditChange:
      'Hard evidence that Wordgard mobile-input correctness and proof are partial, not exact.',
    owner: 'external-framework',
    closureStatus: 'needs-repro',
    reason:
      'The issue remains open and requires a real iOS keyboard/device lane.',
    nextAction:
      'Reproduce on current iOS, capture event/DOM/model trace, then retain a raw-device row.',
    linkedRefs: refs('wordgard@01eb2b5eae509509677345fd603acad001827dff'),
  },
  {
    number: 24,
    claim:
      'iOS swipe-input backspace deleted a word character-by-character instead of honoring native word deletion.',
    conceptIds: ['WG-VIEW-009A', 'WG-VIEW-010B1', 'WG-PROOF-004C'],
    currentSourceTruth:
      'Fixed by delegating mobile Backspace to beforeinput/native behavior rather than intercepting keydown.',
    sourceEvidence: source(
      '../wordgard/src/editor/input.ts:710-713',
      '../wordgard/src/editor/input.ts:812-840'
    ),
    proofRelation: 'No raw iOS swipe/backspace regression is retained.',
    proofEvidence: source('../wordgard/test/webtest-composition.ts:180-187'),
    classification: 'fixed',
    changesAudit: true,
    auditChange:
      'Adds a mandatory swipe-backspace case to the raw mobile proof dossier; source policy alone is insufficient proof.',
    owner: 'external-framework',
    closureStatus: 'deferred-with-owner',
    reason: 'Source fix exists without device proof.',
    nextAction:
      'Retain iOS swipe-word then Backspace behavior on a raw device.',
    linkedRefs: refs('wordgard@01eb2b5eae509509677345fd603acad001827dff'),
  },
  {
    number: 25,
    claim:
      'Cursor entry/exit through an inline plot with inline content produced an index error and blocked editing.',
    conceptIds: ['WG-STATE-011A', 'WG-STATE-011B', 'WG-VIEW-006A'],
    currentSourceTruth:
      'Fixed. TextblockMap.toIndex clips and advances atom/structural sections without the prior negative-offset error.',
    sourceEvidence: source('../wordgard/src/state/textblock.ts:100-120'),
    proofRelation:
      'Selection unit tests cover inline-content nodes, but no exact browser editing/cursor regression for the reported plot exists.',
    proofEvidence: source('../wordgard/test/test-selection.ts:88-94'),
    classification: 'fixed',
    changesAudit: true,
    auditChange:
      'Qualifies the textblock-projection proof: the mechanism is present, but nested inline-content browser behavior has only adjacent coverage.',
    owner: 'external-framework',
    closureStatus: 'deferred-with-owner',
    reason: 'Current source is fixed; exact browser proof is absent.',
    nextAction:
      'Add editable inline-plot cursor entry, edit, and exit browser coverage.',
    linkedRefs: refs('wordgard@1fce5f61a82a1ed5f949f14004027270adc0bffc'),
  },
  {
    number: 26,
    claim:
      'Pasting VS Code block HTML could crash parse.slice and corrupt the rendered editor.',
    conceptIds: ['WG-DOC-015C', 'WG-VIEW-010C2'],
    currentSourceTruth:
      'Fixed. Slice parsing avoids closing the top parse context and chooses a block parent when unmatched input contains multiple blocks.',
    sourceEvidence: source(
      '../wordgard/src/doc/parse.ts:281-293',
      '../wordgard/src/doc/parse.ts:522-552'
    ),
    proofRelation:
      'Exact parser regression source covers multiple unmatched block elements. The observed 733-test run imported ignored dist built at 01eb2b5, seven commits behind frozen head, so it is not current-head execution proof.',
    proofEvidence: source('../wordgard/test/webtest-serialize.ts:219-262'),
    classification: 'fixed',
    changesAudit: true,
    auditChange:
      'Downgrades current-head parser proof to partial: fixed source and exact regression source exist, but the only observed execution is stale-dist.',
    owner: 'external-framework',
    closureStatus: 'deferred-with-owner',
    reason:
      'The exact upstream test source exists, but no run executes it against frozen-head runtime artifacts.',
    nextAction:
      'Repair the current build, resolve test imports to rebuilt current-head output, and rerun the exact row with module-resolution proof.',
    linkedRefs: refs('wordgard@8fd8880d1a16bc6306b1e59f8649b1d9021e3d1e'),
  },
  {
    number: 27,
    claim:
      'Active key bindings are not discoverable to pointer, keyboard, or screen-reader users.',
    conceptIds: ['WG-CMD-004B', 'WG-VIEW-014B', 'LOCAL-A11Y'],
    currentSourceTruth:
      'Open. Key bindings compile into handlers and menu items expose descriptions, but menu metadata does not link active shortcuts and there is no binding-help surface.',
    sourceEvidence: source(
      '../wordgard/src/command/menu.ts:16-68',
      '../wordgard/src/editor/keymap.ts:1-180'
    ),
    proofRelation:
      'No discoverability/accessibility implementation or proof exists.',
    proofEvidence: source('../wordgard/src/command/menu.ts:39-42'),
    classification: 'open',
    changesAudit: true,
    auditChange:
      'Adds an issue-derived accessibility requirement for resolved active-shortcut metadata and discovery, while retaining insufficient evidence for a public API.',
    owner: 'external-framework',
    closureStatus: 'deferred-with-owner',
    reason:
      'A one-paragraph donor issue is insufficient evidence for a Plate/Plite public API.',
    nextAction:
      'Defer for research; gather concrete menu, keyboard, screen-reader, and help-surface requirements before API design.',
    linkedRefs: refs(),
  },
  {
    number: 28,
    claim:
      'An exception before the flush try/finally stranded the editor in flushing state and rejected every later dispatch.',
    conceptIds: ['WG-VIEW-002', 'WG-VIEW-016'],
    currentSourceTruth:
      'Fixed narrowly. takeDirty and viewState.flush now run inside try/finally, so the flushing flag is restored; the maintainer explicitly warns that a mid-update exception may still leave corrupted editor state.',
    sourceEvidence: source('../wordgard/src/editor/editor.ts:200-235'),
    proofRelation:
      'No regression injects a pre-update flush exception and proves recovery or state integrity.',
    proofEvidence: source('../wordgard/test/webtest-editor.ts:59-69'),
    classification: 'fixed',
    changesAudit: true,
    auditChange:
      'Downgrades any broad fault-recovery reading: Wordgard restores the scheduler flag, not transactional editor state.',
    owner: 'external-framework',
    closureStatus: 'deferred-with-owner',
    reason: 'Source guard exists; recovery integrity is explicitly unproved.',
    nextAction:
      'Inject failures in takeDirty, projection, plugin update, read, and write phases and assert the intended recovery contract.',
    linkedRefs: refs('wordgard@4a04555e4230f55d2866ff191343bbd223e0c6dc'),
  },
  {
    number: 29,
    claim:
      'Direct attribute writes on contentDOM crashed MutationObserver processing at the root tile.',
    conceptIds: ['WG-VIEW-008A', 'WG-VIEW-013D'],
    currentSourceTruth:
      'Fixed. Root-tile attribute mutations are ignored; the supported ownership path remains the contentAttributes facet, which may overwrite direct embedder writes.',
    sourceEvidence: source(
      '../wordgard/src/editor/domobserver.ts:198-222',
      '../wordgard/src/editor/editor.ts:321-327'
    ),
    proofRelation:
      'Tests cover facet-provided content attributes and child attribute repair, not a direct root contentDOM mutation.',
    proofEvidence: source('../wordgard/test/webtest-editor.ts:35-57'),
    classification: 'fixed',
    changesAudit: true,
    auditChange:
      'Clarifies ownership: root attributes are declarative facet state, while direct host mutations are tolerated but not authoritative.',
    owner: 'external-framework',
    closureStatus: 'deferred-with-owner',
    reason:
      'Source fix and adjacent tests exist; the exact root mutation is untested.',
    nextAction:
      'Add a root attribute mutation row and document facet ownership.',
    linkedRefs: refs(
      'wordgard/timeline-orphan@b518ddb13a9eba1b34fc99fa2223e6a288127f14',
      'wordgard@3f13e9f51d0ef2d08b000c5edf16cfed219dce1c'
    ),
  },
  {
    number: 30,
    claim:
      'Attributes.compare ignored attributes present only in the new element, preventing wrapper restyling.',
    conceptIds: ['WG-DOC-014A', 'WG-VIEW-005C1'],
    currentSourceTruth:
      'Fixed at the frozen head. The comparison now penalizes unmatched attributes after the old list is exhausted.',
    sourceEvidence: source('../wordgard/src/doc/shape.ts:266-299'),
    proofRelation:
      'No exact Attributes.compare or added-attribute wrapper regression was added with the fix.',
    proofEvidence: source('../wordgard/test/webtest-content.ts:397-413'),
    classification: 'fixed',
    changesAudit: false,
    auditChange:
      'The frozen source includes the fix; issue #31, not this closed row, changes the decoration-invalidation verdict.',
    owner: 'external-framework',
    closureStatus: 'deferred-with-owner',
    reason: 'Source fix exists without exact retained proof.',
    nextAction:
      'Add direct compare symmetry and wrapper-added-style browser assertions.',
    linkedRefs: refs('wordgard@c715d4ded8fc780f52c13206e589ea31e4148dd4'),
  },
  {
    number: 31,
    claim:
      'RangeSet.compareRange skips a range that starts before the compared window and extends into it.',
    conceptIds: ['WG-VIEW-003', 'WG-VIEW-005C1', 'LOCAL-LAYOUT-PROJECTION'],
    currentSourceTruth:
      'Open and reproduced by inspection at the frozen head. Both scans start at the first range whose start is inside the window, so an already-open range is omitted.',
    sourceEvidence: source(
      '../wordgard/src/editor/decoration.ts:849-880',
      '../wordgard/src/editor/decoration.ts:989-1035'
    ),
    proofRelation:
      'The exact issue is absent from retained Chrome test source, and the observed 733-test execution resolved stale dist; neither proves spanning-range invalidation at frozen head.',
    proofEvidence: source('../wordgard/test/webtest-content.ts:259-395'),
    classification: 'open',
    changesAudit: true,
    auditChange:
      'Material downgrade: Wordgard decoration invalidation is partial with a known correctness defect, and pagination-style wrapper reuse cannot cite it as exact.',
    owner: 'external-framework',
    closureStatus: 'deferred-with-owner',
    reason:
      'The donor bug has an exact reproduction and remains open; this audit must record rather than patch it.',
    nextAction:
      'Fix the open-range comparison and retain the issue reproduction as a browser regression.',
    linkedRefs: refs(),
  },
  {
    number: 32,
    claim:
      'The frozen main branch does not typecheck because schema/code.ts has unresolved names and schema/index.ts exports a missing symbol.',
    conceptIds: ['WG-META-001', 'WG-META-002', 'WG-PRODUCT-002'],
    currentSourceTruth:
      'Open and directly reproduced. enter and CodeBlockLanguage are not imported, codeBlockLanguage is not defined, and InputRule is unused.',
    sourceEvidence: source(
      '../wordgard/src/schema/code.ts:1-56',
      '../wordgard/src/schema/index.ts:10-13'
    ),
    proofRelation:
      'npx tsc --noEmit fails with five errors. npm run prepare prints the same failure but exits zero, so the build script is false-green.',
    proofEvidence: source(
      '../wordgard/src/schema/code.ts:1-56',
      '../wordgard/src/schema/index.ts:10-13',
      '../wordgard/bin/build.ts:1-120'
    ),
    classification: 'open',
    changesAudit: true,
    auditChange:
      'Material downgrade: current Wordgard build/declaration/package proof is failed, and prepare cannot be treated as a trustworthy gate.',
    owner: 'external-framework',
    closureStatus: 'deferred-with-owner',
    reason:
      'Exact current source failure belongs to Wordgard and blocks release-quality proof.',
    nextAction:
      'Repair schema exports/imports and make bin/build.ts propagate typecheck failure.',
    linkedRefs: refs('introduced-by wordgard@4082fc3'),
  },
  {
    number: 33,
    claim:
      'Applying a link to a footnote superscript can create overlapping outer-link and nested-footnote tooltips with unstable interaction.',
    conceptIds: [
      'WG-PRODUCT-003D2',
      'WG-VIEW-014C1',
      'WG-INTEGRATION-NESTED-001',
    ],
    currentSourceTruth:
      'Open. Link tooltip computation accepts any linked node before the cursor, while the footnote example separately projects a tooltip-hosted inner editor; neither owner excludes or coordinates the other.',
    sourceEvidence: source(
      '../wordgard/src/schema/link.ts:45-73',
      '../wordgard-website/site/examples/footnote/footnote.ts:52-160'
    ),
    proofRelation:
      'The issue contains manual visual evidence; no nested-tooltip interaction test exists.',
    proofEvidence: source(
      '../wordgard-website/site/examples/footnote/footnote.ts:52-160'
    ),
    classification: 'open',
    changesAudit: true,
    auditChange:
      'Adds a concrete nested-editor/tooltip ownership defect; the footnote example is not complete integration proof.',
    owner: 'docs-support-release',
    closureStatus: 'deferred-with-owner',
    reason:
      'Open website integration bug; no local Plate/Plite source change is authorized.',
    nextAction:
      'Choose mark projection and tooltip arbitration ownership, then add the reported interaction row.',
    linkedRefs: refs(),
  },
  {
    number: 34,
    claim:
      'Dialogs are non-modal panels, so the editor, selection, and other controls remain mutable while a dialog awaits resolution.',
    conceptIds: ['WG-VIEW-014A2'],
    currentSourceTruth:
      'Open. Dialog.show appends panel constructors to a field and renders a custom wg-dialog element; it does not use HTMLDialogElement, inert state, or selection/update locking.',
    sourceEvidence: source(
      '../wordgard/src/editor/dialog.ts:37-108',
      '../wordgard/src/editor/dialog.ts:110-180'
    ),
    proofRelation:
      'Manual issue evidence only; no modal focus/inertness test exists.',
    proofEvidence: source('../wordgard/src/editor/dialog.ts:110-180'),
    classification: 'open',
    changesAudit: true,
    auditChange:
      'Downgrades Wordgard dialogs from a complete dialog contract to a panel/promise primitive without modal interaction guarantees.',
    owner: 'external-framework',
    closureStatus: 'deferred-with-owner',
    reason: 'Open donor API/product decision.',
    nextAction:
      'Decide true modal versus explicitly non-modal semantics and prove focus, inertness, cancellation, and layout stability.',
    linkedRefs: refs(),
  },
  {
    number: 35,
    claim:
      'The link editor is a top panel dialog rather than an anchored editable tooltip.',
    conceptIds: ['WG-PRODUCT-003D1', 'WG-PRODUCT-003D2', 'WG-VIEW-014C1'],
    currentSourceTruth:
      'Open preference request. Link creation/editing uses Dialog.show; the existing link tooltip only renders the target as a read-only anchor.',
    sourceEvidence: source(
      '../wordgard/src/schema/link.ts:8-42',
      '../wordgard/src/schema/link.ts:45-98'
    ),
    proofRelation: 'No editable link-tooltip implementation or proof exists.',
    proofEvidence: source('../wordgard/src/schema/link.ts:45-98'),
    classification: 'open',
    changesAudit: false,
    auditChange:
      'Product taste request; it does not establish a superior reusable mechanism by itself.',
    owner: 'external-framework',
    closureStatus: 'deferred-with-owner',
    reason: 'Open donor product request, not a current invariant.',
    nextAction: 'None for Plate/Plite without a separate product/API decision.',
    linkedRefs: refs(),
  },
];
