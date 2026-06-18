import { describe, expect, test } from 'bun:test';
import { readFileSync } from 'node:fs';

const publicPackageNames = [
  '@platejs/slate',
  '@platejs/yjs',
  '@platejs/browser',
  '@platejs/slate-dom',
  '@platejs/slate-history',
  '@platejs/slate-hyperscript',
  '@platejs/slate-layout',
  '@platejs/slate-react',
];

const publicPackageDirectories: Record<string, string> = {
  '@platejs/browser': 'browser',
  '@platejs/slate': 'slate',
  '@platejs/slate-dom': 'slate-dom',
  '@platejs/slate-history': 'slate-history',
  '@platejs/slate-hyperscript': 'slate-hyperscript',
  '@platejs/slate-layout': 'slate-layout',
  '@platejs/slate-react': 'slate-react',
  '@platejs/yjs': 'yjs',
};

const readPackageJson = (packageName: string) =>
  JSON.parse(
    readFileSync(
      new URL(
        `../../${publicPackageDirectories[packageName]}/package.json`,
        import.meta.url
      ),
      'utf8'
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
  '@platejs/slate': [
    'ElementApi',
    'LocationApi',
    'NodeApi',
    'OperationApi',
    'PathApi',
    'PathRefApi',
    'PointApi',
    'PointRefApi',
    'RangeApi',
    'RangeRefApi',
    'SpanApi',
    'TextApi',
    'createEditor',
    'createEditorRuntime',
    'createEditorView',
    'defineEditorExtension',
    'defineStateField',
    'elementProperty',
    'isEditor',
    'setDebugValueScrubber',
  ],
  '@platejs/yjs': [
    'createYjsAwarenessSelection',
    'createYjsExtension',
    'readYjsAwarenessSelection',
    'slatePointToYjsRelativePosition',
    'slateRangeToYjsRelativeRange',
    'yjsAwarenessSelectionsEqual',
    'yjsRelativePositionToSlatePoint',
    'yjsRelativeRangeToSlateRange',
    'yjsRelativeRangesEqual',
  ],
  '@platejs/yjs/core': [
    'createYjsAwarenessSelection',
    'createYjsExtension',
    'readYjsAwarenessSelection',
    'slatePointToYjsRelativePosition',
    'slateRangeToYjsRelativeRange',
    'yjsAwarenessSelectionsEqual',
    'yjsRelativePositionToSlatePoint',
    'yjsRelativeRangeToSlateRange',
    'yjsRelativeRangesEqual',
  ],
  '@platejs/yjs/react': [
    'getYjsAwarenessRevision',
    'getYjsProviderRevision',
    'getYjsProviderStatus',
    'getYjsProviderSynced',
    'useYjsAwarenessRevision',
    'useYjsProviderRevision',
    'useYjsProviderStatus',
    'useYjsProviderSynced',
    'useYjsRemoteCursor',
    'useYjsRemoteCursorDecorationSource',
    'useYjsRemoteCursorOverlayPositions',
    'useYjsRemoteCursors',
  ],
  '@platejs/browser/browser': [
    'inspectZeroWidthPlaceholder',
    'takeDOMSelectionSnapshot',
    'takeEditorSelectionSnapshot',
  ],
  '@platejs/browser/core': [
    'SLATE_BROWSER_FIRST_PARTY_FEATURE_CONTRACT_REGISTRY',
    'SLATE_BROWSER_FIRST_PARTY_OPERATION_FAMILY_CONTRACTS',
    'SLATE_BROWSER_FIRST_PARTY_PARITY_FAMILIES',
    'SLATE_BROWSER_RELEASE_DISCIPLINE_GUARDS',
    'assertSlateBrowserFirstPartyParityContracts',
    'assertSlateBrowserReleaseProof',
    'createBrowserMobileReleaseProofArtifact',
    'createPersistentBrowserSoakProofArtifact',
    'createReleaseDisciplineProofArtifact',
    'createSlateBrowserFeatureContractRegistry',
    'defineSlateBrowserFeatureContract',
    'evaluateImeInput',
    'evaluatePlaceholderInput',
    'extractAgentBrowserDebugSnapshot',
    'extractAppiumDebugSnapshot',
    'isCollapsed',
    'parseAgentBrowserBatch',
    'parseDebugSnapshot',
    'serializePoint',
    'serializeRange',
    'validateSlateBrowserReleaseProof',
  ],
  '@platejs/browser/playwright': [
    'assertNoIllegalKernelTransitions',
    'assertSlateBrowserCaretVisibleInScrollableParent',
    'assertSlateBrowserKernelTraceEntry',
    'assertSlateBrowserSelectionContract',
    'attachPageScreenshot',
    'attachSlateBrowserJsonArtifact',
    'attachSlateBrowserSelectionScreenshot',
    'classifyScenarioTransportClaim',
    'createScenarioReductionCandidates',
    'createScenarioReplay',
    'createSlateBrowserClipboardPasteGauntlet',
    'createSlateBrowserCompositionGauntlet',
    'createSlateBrowserDestructiveEditingGauntlet',
    'createSlateBrowserDropDataGauntlet',
    'createSlateBrowserEditorHarness',
    'createSlateBrowserFeatureContractRegistry',
    'createSlateBrowserInlineCutTypingGauntlet',
    'createSlateBrowserInternalControlGauntlet',
    'createSlateBrowserMarkClickTypingGauntlet',
    'createSlateBrowserMarkTypingGauntlet',
    'createSlateBrowserMixedEditingConformanceGauntlet',
    'createSlateBrowserNavigationTypingGauntlet',
    'createSlateBrowserSemanticEditingConformanceGauntlet',
    'createSlateBrowserShellActivationGauntlet',
    'createSlateBrowserTextInsertionGauntlet',
    'createSlateBrowserToolbarMarkClickTypingGauntlet',
    'createSlateBrowserWarmLoopSteps',
    'createSlateBrowserWarmToolbarArrowGauntlet',
    'defineSlateBrowserFeatureContract',
    'findSlateBrowserKernelTraceEntry',
    'getIllegalKernelTransitions',
    'getSlateReactRenderProfilerSnapshot',
    'installSlateReactRenderProfiler',
    'matchesSlateBrowserKernelTrace',
    'normalizeScenarioMetadata',
    'openExample',
    'openExampleWithOptions',
    'recordSlateBrowserRuntimeErrors',
    'resetSlateBrowserNativeEventTrace',
    'resetSlateReactRenderProfiler',
    'serializeScenarioStepForReplay',
    'startSlateBrowserNativeEventTrace',
    'stopSlateBrowserNativeEventTrace',
    'summarizeScenarioReductionCandidate',
    'summarizeScenarioStep',
    'takeDOMSelectionSnapshot',
    'takeDisplayedSelectionSnapshotForRoot',
    'takeSelectionSnapshot',
    'takeSlateBrowserNativeEventTrace',
    'takeSlateBrowserRenderStateSnapshot',
    'withExclusiveClipboardAccess',
  ],
  '@platejs/browser/transports': [
    'AGENT_BROWSER_IOS_DEVICE_DEFAULT',
    'AGENT_BROWSER_IOS_SESSION_DEFAULT',
    'ANDROID_SDK_ROOT_DEFAULT',
    'APPIUM_ANDROID_EMULATOR_DEFAULT',
    'APPIUM_IOS_DEVICE_DEFAULT',
    'buildAgentBrowserIosBatch',
    'classifyBrowserMobileTransportProof',
    'createAgentBrowserIosDescriptor',
    'createAppiumAndroidDescriptor',
    'createAppiumIosDescriptor',
    'createAppiumIosSessionPayload',
    'createAppiumSessionPayload',
    'createBrowserMobileUrl',
    'getBrowserMobileTransportProofMatrix',
    'resolveBrowserMobileSurface',
  ],
  '@platejs/slate-dom': [
    'CAN_USE_DOM',
    'DOMCoverage',
    'HAS_BEFORE_INPUT_SUPPORT',
    'Hotkeys',
    'IS_ANDROID',
    'IS_CHROME',
    'IS_FIREFOX',
    'IS_IOS',
    'IS_UC_MOBILE',
    'IS_WEBKIT',
    'IS_WECHATBROWSER',
    'Key',
    'SlateDOMResolutionError',
    'TRIPLE_CLICK',
    'applyStringDiff',
    'closestShadowAware',
    'containsShadowAware',
    'dom',
    'getActiveElement',
    'getDefaultView',
    'getSelection',
    'hasShadowRoot',
    'isAfter',
    'isBefore',
    'isDOMElement',
    'isDOMNode',
    'isDOMSelection',
    'isDOMText',
    'isElementDecorationsEqual',
    'isHotkey',
    'isPlainTextOnlyPaste',
    'isTextDecorationsEqual',
    'isTrackedMutation',
    'mergeStringDiffs',
    'normalizeDOMPoint',
    'normalizePoint',
    'normalizeRange',
    'normalizeStringDiff',
    'splitDecorationsByChild',
    'targetRange',
    'verifyDiffState',
  ],
  '@platejs/slate-history': ['History', 'history'],
  '@platejs/slate-hyperscript': [
    'createEditor',
    'createHyperscript',
    'createText',
    'jsx',
  ],
  '@platejs/slate-layout': [
    'createEstimatedPageLayoutEngine',
    'createSlateLayout',
    'createSlatePage',
    'createSlatePageBreakSnapshot',
    'createSlatePageLayout',
    'getSlatePageLayoutDecorations',
    'getSlatePageLayoutFragments',
    'getSlatePageLayoutGeometry',
    'getSlatePageLayoutPathKey',
    'getSlatePageLayoutProjection',
    'getSlatePagePresetSize',
    'normalizeSlatePageSettings',
    'paginateSlatePageLayoutBlocks',
    'pretextPageLayoutEngine',
  ],
  '@platejs/slate-layout/react': [
    'PagedEditable',
    'useSlateLayout',
    'useSlateLayoutFragments',
    'useSlateLayoutFragmentsAtPath',
    'useSlateLayoutSnapshot',
    'useSlatePageLayout',
    'useSlatePageLayoutSnapshot',
  ],
  '@platejs/slate-react': [
    'Editable',
    'EditableElement',
    'Slate',
    'SlateElement',
    'SlateLeaf',
    'SlatePlaceholder',
    'SlateRuntime',
    'SlateText',
    'createReactEditor',
    'defaultScrollSelectionIntoView',
    'react',
    'useDOMStrategyVirtualOffset',
    'useDecorationSelector',
    'useEditor',
    'useEditorComposing',
    'useEditorFocused',
    'useEditorReadOnly',
    'useEditorSelection',
    'useEditorSelector',
    'useEditorState',
    'useElement',
    'useElementPath',
    'useElementSelected',
    'useNodeSelector',
    'useSetStateField',
    'useSlateActiveEditor',
    'useSlateActiveRoot',
    'useSlateAnnotation',
    'useSlateAnnotationStore',
    'useSlateAnnotations',
    'useSlateChildRoot',
    'useSlateCommandCallback',
    'useSlateContentRoot',
    'useSlateDecorationSource',
    'useSlateEditor',
    'useSlateHistory',
    'useSlateNodeRef',
    'useSlateProjectionEntries',
    'useSlateRangeDecorationSource',
    'useSlateRootChrome',
    'useSlateRootEditor',
    'useSlateRootEffect',
    'useSlateRootState',
    'useSlateRuntime',
    'useSlateRuntimeState',
    'useSlateWidget',
    'useSlateWidgetStore',
    'useSlateWidgets',
    'useStateFieldValue',
    'useTextSelector',
  ],
};

const internalBridgeRuntimeExportExpectations = {
  '@platejs/slate/internal': [
    'Editor',
    'MAIN_ROOT_KEY',
    'applyOperation',
    'applyStatePatches',
    'defineCommand',
    'executeCommand',
    'formatDebugValue',
    'getCachedFullRootReplaceTopLevelRuntimeIds',
    'getEditorCurrentMarks',
    'getEditorExtensionRegistry',
    'getEditorLiveNode',
    'getEditorLiveSelection',
    'getEditorLiveText',
    'getEditorOperationRoot',
    'getEditorRuntime',
    'getEditorSelectionRoot',
    'getEditorTransformRegistry',
    'getOperationCount',
    'getOperationRoot',
    'getRangeRoot',
    'getSnapshotVersion',
    'hasEditorTransformMiddleware',
    'inheritEditorExtensionRegistry',
    'isObject',
    'markInternalOwnedReplayOperation',
    'projectRangeInSnapshot',
    'registerCommand',
    'setEditorChildren',
    'setEditorMarks',
    'setEditorRuntime',
    'setEditorSelection',
    'setEditorTargetRuntime',
    'setEditorTransformRegistry',
    'shouldSaveStatePatch',
    'withOperationRootChildren',
  ],
  '@platejs/slate-dom/internal': [
    'DOMCoverage',
    'DOMEditor',
    'EDITOR_TO_ELEMENT',
    'EDITOR_TO_FORCE_RENDER',
    'EDITOR_TO_KEY_TO_ELEMENT',
    'EDITOR_TO_PENDING_ACTION',
    'EDITOR_TO_PENDING_DIFFS',
    'EDITOR_TO_PENDING_INSERTION_MARKS',
    'EDITOR_TO_PENDING_SELECTION',
    'EDITOR_TO_PLACEHOLDER_ELEMENT',
    'EDITOR_TO_ROOT_VIEW_EDITORS',
    'EDITOR_TO_SCHEDULE_FLUSH',
    'EDITOR_TO_USER_MARKS',
    'EDITOR_TO_USER_SELECTION',
    'EDITOR_TO_WINDOW',
    'ELEMENT_TO_NODE',
    'IS_COMPOSING',
    'IS_FOCUSED',
    'IS_NODE_MAP_DIRTY',
    'IS_READ_ONLY',
    'MARK_PLACEHOLDER_SYMBOL',
    'NODE_TO_ELEMENT',
    'NODE_TO_INDEX',
    'NODE_TO_KEY',
    'NODE_TO_PARENT',
    'NODE_TO_RUNTIME_ID',
    'PLACEHOLDER_SYMBOL',
    'createDOMEditorCapability',
    'getDOMClipboardFormatKey',
    'getSlateStringCoordinatePlacement',
    'getSlateStringLength',
    'getSlateStringLineEdgeTextOffset',
    'installDOM',
    'setDOMClipboardFormatKey',
  ],
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
      .filter(
        (specifier) =>
          !specifier.endsWith('/internal') &&
          !specifier.endsWith('/package.json')
      )
      .sort();

    expect(
      Object.keys(exactPublicPackageRuntimeExportExpectations).sort()
    ).toEqual(publicExportSpecifiers);
  });

  for (const [specifier, names] of Object.entries(
    exactPublicPackageRuntimeExportExpectations
  )) {
    test(`keeps ${specifier} runtime exports exact`, async () => {
      const module = await import(specifier);
      const exportedNames = Object.keys(module).sort();

      expect(exportedNames).toEqual(names);
    });
  }

  for (const [specifier, names] of Object.entries(
    internalBridgeRuntimeExportExpectations
  )) {
    test(`keeps ${specifier} runtime exports exact`, async () => {
      const module = await import(specifier);
      const exportedNames = Object.keys(module).sort();

      expect(exportedNames).toEqual(names);
    });
  }

  test('keeps slate-browser root unavailable', async () => {
    let importedRoot = false;

    try {
      await import('@platejs/browser');
      importedRoot = true;
    } catch {}

    expect(importedRoot).toBe(false);
  });
});
