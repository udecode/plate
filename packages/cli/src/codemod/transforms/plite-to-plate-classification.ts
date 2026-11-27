export const PLITE_TO_PLATE_MODULE_MAP: Readonly<Record<string, string>> = {
  plitejs: 'platejs',
  'plitejs/authored': 'platejs/authored',
  'plitejs/dom': 'platejs/dom',
  'plitejs/history': 'platejs/history',
  'plitejs/pagination': 'platejs/pagination',
  'plitejs/pagination/react': 'platejs/pagination/react',
  'plitejs/react': 'platejs/react',
  'plitejs/react/virtualized': 'platejs/react/virtualized',
  'plitejs/yjs': 'platejs/yjs',
  'plitejs/yjs/react': 'platejs/yjs/react',
};

export type SpecifierRenameRule = Readonly<{
  isTypeOnly?: boolean;
  targetModule: string;
  targetName: string;
}>;

/**
 * Direct 1:1 symbol renames across Plite -> Plate entrypoints.
 * Key format: `${sourceModule}#${importedName}`.
 */
export const PLITE_TO_PLATE_SYMBOL_RENAMES: Readonly<
  Record<string, SpecifierRenameRule>
> = {
  'plitejs/pagination/react#PagedEditable': {
    targetModule: 'platejs/pagination/react',
    targetName: 'PagedEditorContent',
  },
  'plitejs/pagination/react#PagedEditableProps': {
    isTypeOnly: true,
    targetModule: 'platejs/pagination/react',
    targetName: 'PagedEditorContentProps',
  },
  'plitejs/react#Editable': {
    targetModule: 'platejs/react',
    targetName: 'EditorContent',
  },
  'plitejs/react#EditableProps': {
    isTypeOnly: true,
    targetModule: 'platejs/react',
    targetName: 'EditorContentProps',
  },
  'plitejs/react#EditorSelectorOptions': {
    isTypeOnly: true,
    targetModule: 'platejs/react',
    targetName: 'UseEditorSelectorOptions',
  },
  'plitejs/react#EditorStateSelectorOptions': {
    isTypeOnly: true,
    targetModule: 'platejs/react',
    targetName: 'UseEditorStateOptions',
  },
  'plitejs/react#ReactPlugin': {
    isTypeOnly: true,
    targetModule: 'platejs/react',
    targetName: 'RuntimeReactPlugin',
  },
  'plitejs/react#useEditorContext': {
    targetModule: 'platejs/react',
    targetName: 'useEditor',
  },
  'plitejs/react#useOptionalEditorContext': {
    targetModule: 'platejs/react',
    targetName: 'useOptionalEditor',
  },
  'plitejs/react/virtualized#VirtualizedEditable': {
    targetModule: 'platejs/react/virtualized',
    targetName: 'VirtualizedEditorContent',
  },
  'plitejs/react/virtualized#VirtualizedEditableProps': {
    isTypeOnly: true,
    targetModule: 'platejs/react/virtualized',
    targetName: 'VirtualizedEditorContentProps',
  },
};

/**
 * Verified 1:1 `DOMEditor.<method>(editor, ...args)` -> `editor.api.dom.<method>(...args)` allowlist.
 * Excludes `androidPendingDiffs` and `androidScheduleFlush` (not on `editor.api.dom`).
 */
export const SAFE_DOM_EDITOR_METHODS = new Set([
  'assertDOMNode',
  'assertDOMPoint',
  'assertDOMRange',
  'assertDocumentOrShadowRoot',
  'assertEventRange',
  'assertNode',
  'assertPath',
  'assertPoint',
  'assertRange',
  'blur',
  'deselect',
  'editable',
  'findKey',
  'focus',
  'getWindow',
  'hasDOMNode',
  'hasEditableTarget',
  'hasRange',
  'hasSelectableTarget',
  'hasTarget',
  'isComposing',
  'isFocused',
  'isReadOnly',
  'isTargetInsideNonReadonlyVoid',
  'resolveDOMNode',
  'resolveDOMPoint',
  'resolveDOMRange',
  'resolveDocumentOrShadowRoot',
  'resolveEventRange',
  'resolveNode',
  'resolvePath',
  'resolvePoint',
  'resolveRange',
  'resolveRangeRect',
  'root',
  'scroll',
  'scrollIntoView',
]);

/**
 * Verified 1:1 `DOMEditor.clipboard.<method>(editor, ...args)` -> `editor.api.dom.clipboard.<method>(...args)` allowlist.
 */
export const SAFE_DOM_EDITOR_CLIPBOARD_METHODS = new Set([
  'insertData',
  'insertFragmentData',
  'insertTextData',
  'readSlice',
  'writeSelection',
  'writeSlice',
]);

/**
 * Symbols rewritten by AST passes (may be removed from imports once all call sites are rewritten).
 */
export const AST_REWRITTEN_SYMBOLS: Readonly<
  Record<string, Readonly<Record<string, string>>>
> = {
  'plitejs/authored': {
    authored: 'Rewritten to AuthoredPlugin + userId when options are static.',
    authoredRecords:
      'Dropped when the same editor installs AuthoredPlugin (which depends on authoredRecords).',
  },
  'plitejs/dom': {
    DOMEditor:
      'Safe 1:1 calls rewritten to editor.api.dom.<method>(...); unsupported or unbound uses diagnosed.',
    dom: 'Hoisted to clipboardFormatKey on plitejs/react constructors when options are static.',
  },
  'plitejs/history': {
    HistoryOptions: 'Rewritten to Partial<HistoryPluginState> from platejs.',
    history:
      'Bare history() dropped (Plate installs HistoryPlugin by default); static options rewritten to HistoryPlugin.configure(...).',
  },
};

/**
 * Plite exports that have no 1:1 Plate export and stay on `plitejs/*` with a manual diagnostic.
 * Key format: `${sourceModule}#${importedName}`.
 */
export const PLITE_ONLY_DIAGNOSTICS: Readonly<Record<string, string>> = {
  'plitejs/authored#AuthoredPlugin':
    'AuthoredPlugin in platejs/authored is a runtime plugin value; use typeof AuthoredPlugin for its type.',
  'plitejs/authored#AuthoredTestOptions':
    'AuthoredTestOptions is Plite-internal test API and is not re-exported by platejs/authored.',
  'plitejs/authored#createAuthoredPlugin':
    'Replace createAuthoredPlugin with AuthoredPlugin from platejs/authored.',
  'plitejs/dom#CAN_USE_DOM':
    'Check typeof window !== "undefined" directly instead of importing CAN_USE_DOM from plitejs/dom.',
  'plitejs/dom#DOMClipboardInsertDataHandler':
    'DOMClipboardInsertDataHandler is a Plite DOM clipboard type not re-exported by platejs/dom.',
  'plitejs/dom#DOMCoverage':
    'DOMCoverage is a Plite low-level DOM helper not re-exported by platejs/dom.',
  'plitejs/dom#DOMCoverageBoundary':
    'DOMCoverage types are Plite-only; use EditableDOMCoverageBoundaryProps from platejs/react.',
  'plitejs/dom#DOMCoverageBoundaryAnchor':
    'DOMCoverage types are Plite-only and not re-exported by platejs/dom.',
  'plitejs/dom#DOMCoverageBoundaryEdge':
    'DOMCoverage types are Plite-only and not re-exported by platejs/dom.',
  'plitejs/dom#DOMCoverageBoundaryState':
    'DOMCoverage types are Plite-only and not re-exported by platejs/dom.',
  'plitejs/dom#DOMCoverageCopyPolicy':
    'DOMCoverage types are Plite-only and not re-exported by platejs/dom.',
  'plitejs/dom#DOMCoverageMaterializeHandler':
    'DOMCoverage types are Plite-only and not re-exported by platejs/dom.',
  'plitejs/dom#DOMCoverageMaterializeRangeRole':
    'DOMCoverage types are Plite-only and not re-exported by platejs/dom.',
  'plitejs/dom#DOMCoverageMaterializeReason':
    'DOMCoverage types are Plite-only and not re-exported by platejs/dom.',
  'plitejs/dom#DOMCoverageMaterializeResult':
    'DOMCoverage types are Plite-only and not re-exported by platejs/dom.',
  'plitejs/dom#DOMCoveragePathRange':
    'DOMCoverage types are Plite-only and not re-exported by platejs/dom.',
  'plitejs/dom#DOMCoveragePointResult':
    'DOMCoverage types are Plite-only and not re-exported by platejs/dom.',
  'plitejs/dom#DOMCoverageReason':
    'DOMCoverage types are Plite-only and not re-exported by platejs/dom.',
  'plitejs/dom#DOMCoverageRuntimeRange':
    'DOMCoverage types are Plite-only and not re-exported by platejs/dom.',
  'plitejs/dom#DOMCoverageSelectionPolicy':
    'DOMCoverage types are Plite-only and not re-exported by platejs/dom.',
  'plitejs/dom#DOMCoverageSession':
    'DOMCoverage types are Plite-only and not re-exported by platejs/dom.',
  'plitejs/dom#DOMEditorClipboardCapability':
    'Use DOMClipboardApi from platejs/dom.',
  'plitejs/dom#DOMEditorOptions':
    'Pass clipboardFormatKey directly on platejs/react createEditor/useCreateEditor options.',
  'plitejs/dom#DOMFragmentDataHtml':
    'DOMFragmentDataHtml is a Plite DOM clipboard type not re-exported by platejs/dom.',
  'plitejs/dom#DOMFragmentDataPayload':
    'DOMFragmentDataPayload is a Plite DOM clipboard type not re-exported by platejs/dom.',
  'plitejs/dom#DOMPlugin':
    'Plate installs DOM support automatically in platejs/react; remove DOMPlugin references.',
  'plitejs/dom#DOMPluginTypes':
    'Plate installs DOM support automatically in platejs/react; remove DOMPluginTypes references.',
  'plitejs/dom#DOMSelectionPoints':
    'DOMSelectionPoints is a low-level Plite DOM helper not re-exported by platejs/dom.',
  'plitejs/dom#Hotkeys':
    'Use isHotkey from platejs/dom or plugin shortcuts instead of Hotkeys.',
  'plitejs/dom#Key':
    'Use keyboard event keys or isHotkey from platejs/dom instead of Key.',
  'plitejs/dom#StringDiff':
    'StringDiff is a Plite low-level DOM text-diff helper not re-exported by platejs/dom.',
  'plitejs/dom#TRIPLE_CLICK':
    'TRIPLE_CLICK is a Plite DOM constant not re-exported by platejs/dom.',
  'plitejs/dom#TextDiff':
    'TextDiff is a Plite low-level DOM text-diff helper not re-exported by platejs/dom.',
  'plitejs/dom#applyStringDiff':
    'applyStringDiff is a Plite DOM internal helper not re-exported by platejs/dom.',
  'plitejs/dom#cleanDOMClipboardContents':
    'cleanDOMClipboardContents is a Plite DOM helper not re-exported by platejs/dom.',
  'plitejs/dom#closestShadowAware':
    'closestShadowAware is a Plite DOM helper not re-exported by platejs/dom.',
  'plitejs/dom#containsShadowAware':
    'containsShadowAware is a Plite DOM helper not re-exported by platejs/dom.',
  'plitejs/dom#createCompiledHotkeyMatcher':
    'Use isHotkey from platejs/dom or plugin shortcuts instead of createCompiledHotkeyMatcher.',
  'plitejs/dom#getActiveElement':
    'getActiveElement is a Plite DOM helper not re-exported by platejs/dom.',
  'plitejs/dom#getDOMClipboardFormatKey':
    'getDOMClipboardFormatKey is a Plite DOM helper not re-exported by platejs/dom.',
  'plitejs/dom#getDefaultView':
    'getDefaultView is a Plite DOM helper not re-exported by platejs/dom.',
  'plitejs/dom#getEditorDOMRoot':
    'Use editor.api.dom.root() or useEditorRootElement instead of getEditorDOMRoot.',
  'plitejs/dom#getElements':
    'getElements is a Plite DOM marker helper not re-exported by platejs/dom.',
  'plitejs/dom#getNodeDataAttributeKeys':
    'getNodeDataAttributeKeys is a Plite DOM marker helper not re-exported by platejs/dom.',
  'plitejs/dom#getSelection':
    'getSelection is a Plite DOM helper not re-exported by platejs/dom.',
  'plitejs/dom#hasShadowRoot':
    'hasShadowRoot is a Plite DOM helper not re-exported by platejs/dom.',
  'plitejs/dom#isAfter':
    'isAfter is a Plite DOM helper not re-exported by platejs/dom.',
  'plitejs/dom#isBefore':
    'isBefore is a Plite DOM helper not re-exported by platejs/dom.',
  'plitejs/dom#isDOMElement':
    'isDOMElement is a Plite DOM helper not re-exported by platejs/dom.',
  'plitejs/dom#isDOMNode':
    'isDOMNode is a Plite DOM helper not re-exported by platejs/dom.',
  'plitejs/dom#isDOMSelection':
    'isDOMSelection is a Plite DOM helper not re-exported by platejs/dom.',
  'plitejs/dom#isDOMText':
    'isDOMText is a Plite DOM helper not re-exported by platejs/dom.',
  'plitejs/dom#isEditor':
    'Do not replace plitejs/dom isEditor with core isEditor from platejs: plitejs/dom isEditor checks a DOM node marker, not an editor instance.',
  'plitejs/dom#isElement':
    'isElement from plitejs/dom checks a DOM marker attribute (not ElementApi.isElement); keep plitejs/dom or check data-editor-node directly.',
  'plitejs/dom#isGeckoDOMHost':
    'isGeckoDOMHost is a Plite DOM helper not re-exported by platejs/dom.',
  'plitejs/dom#isLeaf':
    'isLeaf from plitejs/dom checks a DOM marker attribute; not re-exported by platejs/dom.',
  'plitejs/dom#isNode':
    'isNode from plitejs/dom checks a DOM marker attribute (not NodeApi.isNode); not re-exported by platejs/dom.',
  'plitejs/dom#isPlainTextOnlyPaste':
    'isPlainTextOnlyPaste is a Plite DOM helper not re-exported by platejs/dom.',
  'plitejs/dom#isString':
    'isString from plitejs/dom checks a DOM marker attribute; not re-exported by platejs/dom.',
  'plitejs/dom#isText':
    'isText from plitejs/dom checks a DOM marker attribute (not TextApi.isText); not re-exported by platejs/dom.',
  'plitejs/dom#isTrackedMutation':
    'isTrackedMutation is a Plite DOM helper not re-exported by platejs/dom.',
  'plitejs/dom#isVoid':
    'isVoid from plitejs/dom checks a DOM marker attribute; not re-exported by platejs/dom.',
  'plitejs/dom#keyToDataAttribute':
    'keyToDataAttribute is a Plite DOM marker helper not re-exported by platejs/dom.',
  'plitejs/dom#mergeStringDiffs':
    'mergeStringDiffs is a Plite DOM text-diff helper not re-exported by platejs/dom.',
  'plitejs/dom#normalizeDOMPoint':
    'normalizeDOMPoint is a Plite DOM helper not re-exported by platejs/dom.',
  'plitejs/dom#normalizePoint':
    'normalizePoint is a Plite DOM text-diff helper not re-exported by platejs/dom.',
  'plitejs/dom#normalizeRange':
    'normalizeRange is a Plite DOM text-diff helper not re-exported by platejs/dom.',
  'plitejs/dom#normalizeStringDiff':
    'normalizeStringDiff is a Plite DOM text-diff helper not re-exported by platejs/dom.',
  'plitejs/dom#readDOMSelectionRange':
    'readDOMSelectionRange is a Plite DOM helper not re-exported by platejs/dom.',
  'plitejs/dom#targetRange':
    'targetRange is a Plite DOM text-diff helper not re-exported by platejs/dom.',
  'plitejs/dom#verifyDiffState':
    'verifyDiffState is a Plite DOM text-diff helper not re-exported by platejs/dom.',
  'plitejs/dom#writeDOMFragmentData':
    'writeDOMFragmentData is a Plite DOM helper not re-exported by platejs/dom.',
  'plitejs/dom#writeDOMRangeData':
    'writeDOMRangeData is a Plite DOM helper not re-exported by platejs/dom.',
  'plitejs/dom#writeDOMSelection':
    'writeDOMSelection is a Plite DOM helper not re-exported by platejs/dom.',
  'plitejs/history#HistoryPlugin':
    'HistoryPlugin in platejs is a plugin value (not Plite HistoryPlugin type); use typeof HistoryPlugin from platejs.',
  'plitejs/history#HistoryPluginTypeProvider':
    'HistoryPluginTypeProvider is Plite-only; Plate installs HistoryPlugin by default.',
  'plitejs/history#HistoryPluginTypes':
    'HistoryPluginTypes is Plite-only; use HistoryApi or HistoryPluginState from platejs.',
  'plitejs/react#CommandDispatcher':
    'CommandDispatcher is Plite-only; call editor.update or editor.tf directly in Plate.',
  'plitejs/react#CommandFocusPolicy':
    'CommandFocusPolicy is Plite-only; manage focus explicitly with editor.api.dom.focus() in Plate.',
  'plitejs/react#DOMTextSyncRendererCapabilityContext':
    'Low-level Plite renderer capability API is not exported by platejs/react.',
  'plitejs/react#EditorNodeSelectorContext':
    'EditorNodeSelectorContext is Plite-only; use useElementSelector or useEditorSelector in platejs/react.',
  'plitejs/react#EditorPlaceholder':
    'EditorPlaceholder is Plite-only; pass placeholder prop to EditorContent or render custom placeholder JSX.',
  'plitejs/react#EditorReadOnlyProvider':
    'EditorReadOnlyProvider is Plite-only; pass readOnly to EditorRoot or EditorContent.',
  'plitejs/react#EditorReadOnlyProviderProps':
    'EditorReadOnlyProviderProps is Plite-only; pass readOnly to EditorRoot or EditorContent.',
  'plitejs/react#EditorRuntimeSelectorOptions':
    'EditorRuntimeSelectorOptions is Plite-only; use UseEditorSelectorOptions from platejs/react.',
  'plitejs/react#EditorTextSelectorContext':
    'EditorTextSelectorContext is Plite-only; use useEditorSelector in platejs/react.',
  'plitejs/react#UseCommandOptions':
    'UseCommandOptions is Plite-only; call editor.update or editor.tf directly in Plate.',
  'plitejs/react#setDOMTextSyncRendererCapability':
    'Low-level Plite renderer capability API is not exported by platejs/react.',
  'plitejs/react#setRetainedTextFlowRendererCapability':
    'Low-level Plite renderer capability API is not exported by platejs/react.',
  'plitejs/react#useClaimEditableDOMCommit':
    'useClaimEditableDOMCommit is Plite-only low-level DOM API.',
  'plitejs/react#useCommand':
    'useCommand is Plite-only (binds focus policy + command dispatch); migrate to editor.update / editor.tf.',
  'plitejs/react#useEditorEditableElement':
    'useEditorEditableElement returns an HTMLElement | null (reactive), whereas Plate useEditableRef returns a RefObject; migrate manually.',
  'plitejs/react#useNodeSelector':
    'useNodeSelector takes a Plite node selector context; migrate to useElementSelector or useEditorSelector in platejs/react.',
  'plitejs/react#useOptionalEditorReadOnly':
    'useOptionalEditorReadOnly returns boolean | undefined outside providers; Plate useEditorReadOnly returns boolean (true outside providers).',
  'plitejs/react#useOptionalElement':
    'useOptionalElement is Plite-only; use useElement inside element components.',
  'plitejs/react#useTextSelector':
    'useTextSelector is Plite-only; migrate to useEditorSelector in platejs/react.',
};

/**
 * Legacy pre-v2 Plite exports that were removed from `plitejs/react`.
 */
export const LEGACY_PLITE_SHELL_EXPORTS = new Set([
  'EditorElement',
  'EditorLeaf',
  'EditorText',
]);

/**
 * Removed `plitejs/react` annotation and unused `ViewSource*` exports that no longer exist in `plitejs/react` or `platejs/react`.
 */
export const REMOVED_PLITE_REACT_DIAGNOSTICS: Readonly<Record<string, string>> =
  {
    Annotation:
      'Annotation was removed with plitejs/annotations; build anchored overlays directly on editor.anchor, commit.changed.anchors(), and DecorationSource.',
    AnnotationAnchor:
      'AnnotationAnchor was removed with plitejs/annotations; use Anchor<Range> directly.',
    AnnotationChange:
      'AnnotationChange was removed with plitejs/annotations; use CommentAttachmentChange from platejs/comments for CommentsPlugin.api.subscribeAttachments, or define a feature-local change type.',
    AnnotationRefreshOptions:
      'AnnotationRefreshOptions was removed with plitejs/annotations; use DecorationRefresh on DecorationSource.',
    AnnotationSnapshot:
      'AnnotationSnapshot was removed with plitejs/annotations; manage feature-local snapshots with editor.anchor and commit.changed.anchors().',
    AnnotationStore:
      'AnnotationStore was removed with plitejs/annotations; build anchored overlays directly on editor.anchor, commit.changed.anchors(), and DecorationSource.',
    AnnotationStoreOptions:
      'AnnotationStoreOptions was removed with plitejs/annotations; build anchored overlays directly on editor.anchor, commit.changed.anchors(), and DecorationSource.',
    OwnedAnnotationStore:
      'OwnedAnnotationStore was removed with plitejs/annotations; build anchored overlays directly on editor.anchor, commit.changed.anchors(), and DecorationSource.',
    ResolvedAnnotation:
      'ResolvedAnnotation was removed with plitejs/annotations; resolve Anchor<Range> handles directly against the view.',
    UseAnnotationStoreOptions:
      'UseAnnotationStoreOptions was removed with useAnnotationStore; build anchored overlays directly on editor.anchor, commit.changed.anchors(), and DecorationSource.',
    ViewSourceError:
      'ViewSourceError was removed from plitejs/react and platejs/react because DecorationSource has no public error callback.',
    ViewSourceErrorSink:
      'ViewSourceErrorSink was removed from plitejs/react and platejs/react because DecorationSource has no public error callback.',
    ViewSourceOptions:
      'ViewSourceOptions was removed from plitejs/react and platejs/react as unused.',
    ViewSourcePhase:
      'ViewSourcePhase was removed from plitejs/react and platejs/react as unused.',
    ViewSourceStatus:
      'ViewSourceStatus was removed from plitejs/react and platejs/react as unused.',
    useAnnotation:
      'useAnnotation was removed from plitejs/react and platejs/react; build anchored overlays directly on editor.anchor, commit.changed.anchors(), and DecorationSource.',
    useAnnotations:
      'useAnnotations was removed from plitejs/react and platejs/react; build anchored overlays directly on editor.anchor, commit.changed.anchors(), and DecorationSource.',
    useAnnotationStore:
      'useAnnotationStore was removed from plitejs/react and platejs/react; build anchored overlays directly on editor.anchor, commit.changed.anchors(), and DecorationSource.',
  };

export const PLITE_TO_PLATE_CLASSIFICATION = Object.freeze({
  astRewrittenSymbols: AST_REWRITTEN_SYMBOLS,
  legacyShellExports: LEGACY_PLITE_SHELL_EXPORTS,
  moduleMap: PLITE_TO_PLATE_MODULE_MAP,
  pliteOnlyDiagnostics: PLITE_ONLY_DIAGNOSTICS,
  removedReactDiagnostics: REMOVED_PLITE_REACT_DIAGNOSTICS,
  safeDomClipboardMethods: SAFE_DOM_EDITOR_CLIPBOARD_METHODS,
  safeDomEditorMethods: SAFE_DOM_EDITOR_METHODS,
  symbolRenames: PLITE_TO_PLATE_SYMBOL_RENAMES,
});
