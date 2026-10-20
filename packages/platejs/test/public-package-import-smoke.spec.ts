import { describe, expect, test } from 'bun:test';
import { readFileSync } from 'node:fs';

const publicPackageNames = ['plitejs', '@platejs/test'];

const publicPackageDirectories: Record<string, string> = {
  '@platejs/test': 'test',
  plitejs: 'plitejs',
};

const readPackageJson = (packageName: string) =>
  JSON.parse(
    readFileSync(
      new URL(
        `../../${publicPackageDirectories[packageName]}/package.json`,
        import.meta.url
      ),
      'utf-8'
    )
  ) as { exports?: Record<string, unknown> };

const getRuntimeSpecifierFromExportPath = (
  packageName: string,
  exportPath: string
) => {
  if (exportPath === '.') return packageName;

  return `${packageName}/${exportPath.replace(/^\.\//, '')}`;
};

const exactPublicPackageRuntimeExportExpectations = {
  '@platejs/test': [
    'createDataTransfer',
    'createEditorFromFixture',
    'createHyperscript',
    'elements',
    'hjsx',
    'jsx',
    'jsxt',
    'projectTestSelectionRange',
    'voidChildren',
  ],
  plitejs: [
    'DocumentChange',
    'PluginPublicationError',
    'EditorSchemaValidationError',
    'ElementApi',
    'LocationApi',
    'NodeApi',
    'PathApi',
    'PointApi',
    'RangeApi',
    'SelectionApi',
    'SpanApi',
    'TextApi',
    'ContentSlice',
    'authoredVeto',
    'compileEditorSchemaContract',
    'createEditor',
    'createEditorView',
    'decodeEditorEffect',
    'defineCommand',
    'defineEditorSchema',
    'defineEffect',
    'definePlugin',
    'definePluginPoint',
    'definePluginSlot',
    'defineStateField',
    'defineUpdateAnnotation',
    'diffEditorSchemaContracts',
    'documentReplacement',
    'editorCommands',
    'editorReads',
    'encodeEditorEffect',
    'getEditorRuntimeOwner',
    'isEditor',
    'invertEffect',
    'locateAt',
    'mapEffect',
    'property',
    'readEditorSchemaContract',
    'readEditorSelection',
    'restoreEditorSchemaContract',
    'schema',
    'screenReaderAnnouncementEffect',
    'setEditorReadOnly',
    'setDebugValueScrubber',
    'target',
    'txLocate',
    'txOnly',
    'transfer',
    'transferVeto',
    'txSelection',
    'valueCodecs',
  ],
  'plitejs/annotations': ['createAnnotationStore'],
  'plitejs/authored': [
    'AuthoredPlaceError',
    'authored',
    'authoredRecords',
    'createAuthoredPlugin',
    'projectAuthoredDocument',
    'projectAuthoredRange',
    'proposeAuthoredComparison',
  ],
  'plitejs/react/virtualized': ['VirtualizedEditable'],
  'plitejs/yjs': ['YjsUpdatePolicy', 'yjs'],
  'plitejs/yjs/react': [
    'useYjsAdmissionStatus',
    'useYjsRemoteCursor',
    'useYjsRemoteCursorGeometry',
    'useYjsRemoteCursorIds',
  ],
  'platejs/compiler': ['compileEditor'],
  'platejs/html': [
    'HtmlPlugin',
    'decodeHtmlDataTransfer',
    'parseHtml',
    'serializeHtml',
  ],
  'platejs/html/server': ['parseHtml'],
  'platejs/migrations': [
    'defineDocumentMigrations',
    'extractLegacyCommentRanges',
    'migrateDocument',
    'migrateListIdentity',
    'migrateV54',
  ],
  'platejs/yjs': ['YjsUpdatePolicy', 'yjs'],
  'platejs/yjs/react': [
    'YjsPlugin',
    'useYjsAdmissionStatus',
    'useYjsRemoteCursor',
    'useYjsRemoteCursorGeometry',
    'useYjsRemoteCursorIds',
  ],
  '@platejs/test/browser': [
    'inspectZeroWidthPlaceholder',
    'takeDOMSelectionSnapshot',
    'takeEditorSelectionSnapshot',
  ],
  '@platejs/test/proof': [
    'BROWSER_FIRST_PARTY_FEATURE_CONTRACT_REGISTRY',
    'BROWSER_FIRST_PARTY_INTENT_FAMILY_CONTRACTS',
    'BROWSER_FIRST_PARTY_PARITY_FAMILIES',
    'RAW_MOBILE_SCENARIOS',
    'assertBrowserFirstPartyParityContracts',
    'assertRawMobileProof',
    'classifyBrowserMobileTransportProof',
    'createBrowserFeatureContractRegistry',
    'defineBrowserFeatureContract',
    'evaluateImeInput',
    'evaluatePlaceholderInput',
    'extractAgentBrowserDebugSnapshot',
    'extractAppiumDebugSnapshot',
    'getBrowserMobileTransportProofMatrix',
    'isCollapsed',
    'parseAgentBrowserBatch',
    'parseDebugSnapshot',
    'serializePoint',
    'serializeRange',
    'validateRawMobileProof',
  ],
  '@platejs/test/playwright': [
    'BROWSER_HANDLE_KEY',
    'DEFAULT_RUNTIME_ERROR_PATTERNS',
    'assertNoIllegalKernelTransitions',
    'assertBrowserCaretVisibleInScrollableParent',
    'assertBrowserKernelTraceEntry',
    'assertBrowserSelectionContract',
    'attachPageScreenshot',
    'attachBrowserJsonArtifact',
    'attachBrowserSelectionScreenshot',
    'browserStep',
    'classifyScenarioTransportClaim',
    'createScenarioReductionCandidates',
    'createScenarioReplay',
    'createBrowserClipboardPasteGauntlet',
    'createBrowserCompositionGauntlet',
    'createBrowserDestructiveEditingGauntlet',
    'createBrowserDropDataGauntlet',
    'createBrowserEditorHarness',
    'createBrowserFeatureContractRegistry',
    'createBrowserInlineCutTypingGauntlet',
    'createBrowserInternalControlGauntlet',
    'createBrowserMarkClickTypingGauntlet',
    'createBrowserMarkTypingGauntlet',
    'createBrowserMixedEditingConformanceGauntlet',
    'createBrowserNavigationTypingGauntlet',
    'createBrowserSemanticEditingConformanceGauntlet',
    'createBrowserShellActivationGauntlet',
    'createBrowserTextInsertionGauntlet',
    'createBrowserToolbarMarkClickTypingGauntlet',
    'createBrowserWarmLoopSteps',
    'createBrowserWarmToolbarArrowGauntlet',
    'decodeScenarioReplay',
    'defineBrowserFeatureContract',
    'findBrowserKernelTraceEntry',
    'getIllegalKernelTransitions',
    'getBrowserEditable',
    'getReactRenderProfilerSnapshot',
    'installReactRenderProfiler',
    'locateBrowserBlock',
    'locateBrowserText',
    'matchesBrowserKernelTrace',
    'measureTrustedTyping',
    'normalizeScenarioMetadata',
    'openExample',
    'openExampleWithOptions',
    'recordBrowserRuntimeErrors',
    'resetBrowserNativeEventTrace',
    'resetReactRenderProfiler',
    'serializeScenarioStepForReplay',
    'startBrowserNativeEventTrace',
    'stopBrowserNativeEventTrace',
    'summarizeScenarioReductionCandidate',
    'summarizeScenarioStep',
    'takeDOMSelectionSnapshot',
    'takeDisplayedSelectionSnapshotForRoot',
    'takeSelectionSnapshot',
    'takeBrowserNativeEventTrace',
    'takeBrowserRenderStateSnapshot',
    'withExclusiveClipboardAccess',
  ],
  '@platejs/test/react': ['EditorTest', 'createTestEditor'],
  'plitejs/dom': [
    'CAN_USE_DOM',
    'DOMCoverage',
    'DOMEditor',
    'Hotkeys',
    'Key',
    'DOMResolutionError',
    'TRIPLE_CLICK',
    'applyStringDiff',
    'closestShadowAware',
    'containsShadowAware',
    'createCompiledHotkeyMatcher',
    'dom',
    'domCommands',
    'getActiveElement',
    'getDOMClipboardFormatKey',
    'getDefaultView',
    'getEditorDOMRoot',
    'getElements',
    'getNodeDataAttributeKeys',
    'getSelection',
    'hasShadowRoot',
    'dataTransferFormats',
    'isAfter',
    'isBefore',
    'isDOMElement',
    'isDOMNode',
    'isDOMSelection',
    'isDOMText',
    'isEditor',
    'isElement',
    'isGeckoDOMHost',
    'isHotkey',
    'isLeaf',
    'isNode',
    'isPlainTextOnlyPaste',
    'isString',
    'isText',
    'isTrackedMutation',
    'isVoid',
    'keyToDataAttribute',
    'mergeStringDiffs',
    'normalizeDOMPoint',
    'normalizePoint',
    'normalizeRange',
    'normalizeStringDiff',
    'targetRange',
    'usesAppleDOMHotkeys',
    'verifyDiffState',
    'writeDOMFragmentData',
    'writeDOMRangeData',
    'writeDataTransferFragment',
  ],
  'plitejs/history': ['History', 'history'],
  'plitejs/diff': ['compare', 'resolveComparison'],
  'plitejs/hyperscript': [
    'createEditor',
    'createEditorFixture',
    'createHyperscript',
    'createText',
    'jsx',
  ],
  'plitejs/pagination': [
    'createEstimatedPageLayoutEngine',
    'createPretextPageLayoutEngine',
    'measurePages',
    'pageSettingsCodec',
  ],
  'plitejs/pagination/react': [
    'createEstimatedPageLayoutEngine',
    'createPretextPageLayoutEngine',
    'measurePages',
    'PagedEditable',
    'pageSettingsCodec',
    'usePageLayout',
    'usePageLayoutFragments',
  ],
  'plitejs/react': [
    'Editable',
    'EditorReadOnlyProvider',
    'EditorRoot',
    'EditorElement',
    'EditorLeaf',
    'EditorPlaceholder',
    'ReactUpdatePolicy',
    'EditorText',
    'createEditor',
    'installBrowserHandle',
    'react',
    'setDOMTextSyncRendererCapability',
    'setRetainedTextFlowRendererCapability',
    'useClaimEditableDOMCommit',
    'useEditor',
    'useEditorComposing',
    'useEditorContext',
    'useEditorEditableElement',
    'useEditorFocused',
    'useEditorReadOnly',
    'useEditorRootElement',
    'useEditorRuntimeState',
    'useEditorScrollElement',
    'useEditorScrollElementRef',
    'useEditorSelection',
    'useEditorSelector',
    'useEditorState',
    'useEditorViewState',
    'useElement',
    'useElementPath',
    'useElementSelected',
    'useNodeSelector',
    'useOptionalEditorContext',
    'useOptionalEditorReadOnly',
    'useOptionalElement',
    'useSetStateField',
    'useAnnotation',
    'useAnnotationStore',
    'useAnnotations',
    'useChildRoot',
    'useCommand',
    'useContentRoot',
    'useDropIndicator',
    'useEditorHistory',
    'useRootChrome',
    'useRootEditor',
    'useRootState',
    'useRuntimeState',
    'useSelectionGeometry',
    'useStateFieldValue',
    'useTextSelector',
  ],
  'plitejs/testing': [
    'BROWSER_HANDLE_KEY',
    'after',
    'before',
    'createDataTransfer',
    'createEditor',
    'createEditorFromFixture',
    'createHyperscript',
    'deleteBackward',
    'deleteForward',
    'elements',
    'end',
    'getChildren',
    'getEditorLiveSelection',
    'getSelection',
    'getSnapshot',
    'hjsx',
    'insertBreak',
    'insertText',
    'isBlock',
    'isEditor',
    'jsx',
    'jsxt',
    'move',
    'positions',
    'projectTestSelectionRange',
    'replace',
    'setEditorFocused',
    'string',
    'unhangRange',
    'voidChildren',
  ],
};

// Literal specifiers let the Turbo generator hash every module these imports load.
const publicPackageLoaders: Record<string, () => Promise<object>> = {
  '@platejs/test': () => import('@platejs/test'),
  plitejs: () => import('plitejs'),
  'plitejs/annotations': () => import('plitejs/annotations'),
  'plitejs/authored': () => import('plitejs/authored'),
  'plitejs/react/virtualized': () => import('plitejs/react/virtualized'),
  'plitejs/yjs': () => import('plitejs/yjs'),
  'plitejs/yjs/react': () => import('plitejs/yjs/react'),
  'platejs/compiler': () => import('platejs/compiler'),
  'platejs/html': () => import('platejs/html'),
  'platejs/html/server': () => import('platejs/html/server'),
  'platejs/migrations': () => import('platejs/migrations'),
  'platejs/yjs': () => import('platejs/yjs'),
  'platejs/yjs/react': () => import('platejs/yjs/react'),
  '@platejs/test/browser': () => import('@platejs/test/browser'),
  '@platejs/test/proof': () => import('@platejs/test/proof'),
  '@platejs/test/playwright': () => import('@platejs/test/playwright'),
  '@platejs/test/react': () => import('@platejs/test/react'),
  'plitejs/dom': () => import('plitejs/dom'),
  'plitejs/history': () => import('plitejs/history'),
  'plitejs/diff': () => import('plitejs/diff'),
  'plitejs/hyperscript': () => import('plitejs/hyperscript'),
  'plitejs/pagination': () => import('plitejs/pagination'),
  'plitejs/pagination/react': () => import('plitejs/pagination/react'),
  'plitejs/react': () => import('plitejs/react'),
  'plitejs/testing': () => import('plitejs/testing'),
};

describe('public package imports', () => {
  test('covers every public package export specifier with exact runtime smoke', () => {
    const publicExportSpecifiers = publicPackageNames
      .flatMap((packageName) =>
        Object.keys(readPackageJson(packageName).exports ?? {}).map(
          (exportPath) =>
            getRuntimeSpecifierFromExportPath(packageName, exportPath)
        )
      )
      .concat([
        'platejs/compiler',
        'platejs/html',
        'platejs/html/server',
        'platejs/migrations',
        'platejs/yjs',
        'platejs/yjs/react',
      ])
      .filter(
        (specifier) =>
          !specifier.endsWith('/internal') &&
          !specifier.endsWith('/package.json')
      )
      .sort();

    expect(
      Object.keys(exactPublicPackageRuntimeExportExpectations).sort()
    ).toEqual(publicExportSpecifiers);
    expect(Object.keys(publicPackageLoaders).sort()).toEqual(
      publicExportSpecifiers
    );
  });

  for (const [specifier, names] of Object.entries(
    exactPublicPackageRuntimeExportExpectations
  )) {
    test(`keeps ${specifier} runtime exports exact`, async () => {
      const module = await publicPackageLoaders[specifier]();
      const exportedNames = Object.keys(module).sort();

      const expectedNames =
        specifier === 'plitejs/react' || specifier.endsWith('/yjs/react')
          ? [
              ...new Set([
                ...exactPublicPackageRuntimeExportExpectations[
                  specifier === 'plitejs/react'
                    ? 'plitejs'
                    : specifier.replace(/\/react$/, '')
                ],
                ...names,
              ]),
            ]
          : names;

      expect(exportedNames).toEqual(
        [...expectedNames].sort((a, b) => (a < b ? -1 : a > b ? 1 : 0))
      );
    });
  }
});
