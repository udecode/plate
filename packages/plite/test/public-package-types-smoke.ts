type PublicPackageModules = [
  typeof import('@platejs/plite'),
  typeof import('@platejs/plite/internal'),
  typeof import('@platejs/yjs'),
  typeof import('@platejs/yjs/plate'),
  typeof import('@platejs/yjs/react'),
  typeof import('@platejs/plite-react'),
  typeof import('@platejs/plite-dom'),
  typeof import('@platejs/plite-dom/internal'),
  typeof import('@platejs/plite-history'),
  typeof import('@platejs/plite-hyperscript'),
  typeof import('@platejs/plite-layout'),
  typeof import('@platejs/plite-layout/react'),
  typeof import('@platejs/browser/browser'),
  typeof import('@platejs/browser/core'),
  typeof import('@platejs/browser/playwright'),
];

type PublicPackageNamedExports = [
  typeof import('@platejs/plite').createEditor,
  typeof import('@platejs/plite').createEditorView,
  typeof import('@platejs/plite').ContentSlice,
  typeof import('@platejs/plite').defineEditorSchema,
  typeof import('@platejs/plite').defineExtension,
  typeof import('@platejs/plite').ElementApi,
  typeof import('@platejs/plite').LocationApi,
  typeof import('@platejs/plite').NodeApi,
  typeof import('@platejs/plite').PathApi,
  typeof import('@platejs/plite').PointApi,
  typeof import('@platejs/plite').property,
  typeof import('@platejs/plite').RangeApi,
  typeof import('@platejs/plite').schema,
  typeof import('@platejs/plite').SelectionApi,
  typeof import('@platejs/plite').SpanApi,
  typeof import('@platejs/plite').target,
  typeof import('@platejs/plite').TextApi,
  import('@platejs/plite').EditorCommit,
  typeof import('@platejs/plite').isEditor,
  typeof import('@platejs/yjs').yjs,
  typeof import('@platejs/yjs').createYjsAwarenessSelection,
  typeof import('@platejs/yjs/plate').BaseYjsPlugin,
  typeof import('@platejs/yjs/plate').YjsPlugin,
  typeof import('@platejs/yjs/react').useYjsRemoteCursors,
  typeof import('@platejs/plite/internal').isObject,
  typeof import('@platejs/browser/browser').takeDOMSelectionSnapshot,
  typeof import('@platejs/browser/core').assertPliteRawMobileProof,
  typeof import('@platejs/browser/core').createPliteBrowserFeatureContractRegistry,
  typeof import('@platejs/browser/core').definePliteBrowserFeatureContract,
  typeof import('@platejs/browser/core').classifyBrowserMobileTransportProof,
  typeof import('@platejs/browser/core').validatePliteRawMobileProof,
  typeof import('@platejs/browser/playwright').assertPliteBrowserSelectionContract,
  typeof import('@platejs/plite-dom').DOMCoverage,
  typeof import('@platejs/plite-dom').Hotkeys,
  typeof import('@platejs/plite-dom').getElements,
  typeof import('@platejs/plite-dom').getNodeDataAttributeKeys,
  typeof import('@platejs/plite-dom').isDOMNode,
  typeof import('@platejs/plite-dom').isEditor,
  typeof import('@platejs/plite-dom').isElement,
  typeof import('@platejs/plite-dom').isLeaf,
  typeof import('@platejs/plite-dom').isNode,
  typeof import('@platejs/plite-dom').isString,
  typeof import('@platejs/plite-dom').isText,
  typeof import('@platejs/plite-dom').isVoid,
  typeof import('@platejs/plite-dom').keyToDataAttribute,
  typeof import('@platejs/plite-dom/internal').DOMEditor,
  typeof import('@platejs/plite-history').History,
  typeof import('@platejs/plite-history').history,
  typeof import('@platejs/plite-hyperscript').createHyperscript,
  typeof import('@platejs/plite-hyperscript').jsx,
  typeof import('@platejs/plite-layout').createPliteLayout,
  typeof import('@platejs/plite-layout').createPlitePageLayout,
  typeof import('@platejs/plite-layout/react').PagedEditable,
  typeof import('@platejs/plite-layout/react').usePliteLayout,
  typeof import('@platejs/plite-react').Editable,
  typeof import('@platejs/plite-react').Plite,
  typeof import('@platejs/plite-react').usePliteEditor,
];

type PublicPackageNamedTypeExports = [
  import('@platejs/plite').Anchor<import('@platejs/plite').Range>,
  import('@platejs/plite').ContentSlice,
  import('@platejs/plite').Descendant,
  import('@platejs/plite').Editor,
  import('@platejs/plite').EditorCommit,
  import('@platejs/plite').EditorCommitListener,
  import('@platejs/plite').EditorRead,
  import('@platejs/plite').EditorReadMethods,
  import('@platejs/plite').EditorStateSchemaApi,
  import('@platejs/plite').EditorUpdateTransaction,
  import('@platejs/plite').EditorUpdate,
  import('@platejs/plite').EditorUpdateMethods,
  import('@platejs/plite').Element,
  import('@platejs/plite').Node,
  import('@platejs/plite').DocumentChange,
  import('@platejs/plite').Path,
  import('@platejs/plite').Point,
  import('@platejs/plite').PropertyValidation<number>,
  import('@platejs/plite').Range,
  import('@platejs/plite').Text,
  import('@platejs/plite').Value,
  import('@platejs/yjs').YjsExtensionOptions,
  import('@platejs/yjs').YjsProviderLike,
  import('@platejs/yjs').YjsState,
  import('@platejs/yjs').YjsTx,
  import('@platejs/yjs/plate').YjsDefinition,
  import('@platejs/yjs/plate').YjsPluginState,
  import('@platejs/yjs/react').YjsRemoteCursorDecorationData,
  import('@platejs/yjs/react').YjsRemoteCursorOverlayPosition,
  import('@platejs/plite-dom').DOMCoverageBoundary,
  import('@platejs/plite-dom').DOMEditorOptions,
  import('@platejs/plite-dom').DOMRange,
  import('@platejs/plite-dom').DOMSelection,
  import('@platejs/plite-dom').DOMStaticRange,
  import('@platejs/plite-dom').HotkeySpec,
  import('@platejs/plite-dom').StringDiff,
  import('@platejs/plite-dom').TextDiff,
  import('@platejs/plite-layout').PliteLayoutOptions,
  import('@platejs/plite-layout').PliteNodeLayoutProvider,
  import('@platejs/plite-layout').PlitePageLayout,
  import('@platejs/plite-layout').PlitePageLayoutOptions,
  import('@platejs/plite-layout').PlitePageSettings,
  import('@platejs/plite-react').EditableDOMBeforeInputHandler,
  import('@platejs/plite-react').DOMStrategyVirtualizedLayout,
  import('@platejs/plite-react').EditableDOMStrategyMetrics,
  import('@platejs/plite-react').EditableKeyDownHandler,
  import('@platejs/plite-react').EditableProps,
  import('@platejs/plite-react').RenderElementProps,
  import('@platejs/plite-react').VirtualizedPageLayoutItem,
  import('@platejs/plite-react').VirtualizedTopLevelLayoutItem,
  import('@platejs/plite-react').PliteAnnotationStore,
  import('@platejs/plite-react').PliteCommitContext,
  import('@platejs/plite-react').PliteDecorationSourceOptions,
  import('@platejs/plite-react').PliteProps,
  import('@platejs/plite-react').PliteSelectionChangeContext,
  import('@platejs/plite-react').PliteValueChangeContext,
  import('@platejs/plite-react').PliteWidgetStore,
  import('@platejs/plite-react').PliteCommandDispatcher<
    import('@platejs/plite').EditorCommand<any, any>
  >,
  import('@platejs/plite-react').UsePliteCommandOptions,
  import('@platejs/plite-react').UsePliteEditorOptions,
  import('@platejs/plite-react').UsePliteRootEditorOptions,
];

type IsAny<T> = 0 extends 1 & T ? true : false;
type FirstArgument<T> = T extends (
  value: infer TInput,
  ...args: infer _Rest
) => unknown
  ? TInput
  : never;
type IsNever<T> = [T] extends [never] ? true : false;
type IsUnknownPredicateInput<T> =
  IsAny<T> extends true
    ? false
    : IsNever<T> extends true
      ? false
      : unknown extends T
        ? true
        : false;
type ExpectTrue<T extends true> = T;
type ExpectAssignable<TExpected, _TActual extends TExpected> = true;
type RawMobileProofInput = FirstArgument<
  typeof import('@platejs/browser/core').validatePliteRawMobileProof
>;
type _PublicRawMobileProofInput = [
  ExpectTrue<IsUnknownPredicateInput<RawMobileProofInput['bundle']>>,
  ExpectAssignable<string, RawMobileProofInput['expectedCommit']>,
];
declare const editor: import('@platejs/plite').Editor;
type _PublicEditorLifecycleMethods = [
  ExpectAssignable<string, ReturnType<typeof editor.read.text.string>>,
  ExpectAssignable<
    import('@platejs/plite').Range | null,
    ReturnType<typeof editor.read.selection>
  >,
  ExpectAssignable<boolean, ReturnType<typeof editor.read.schema.isBlock>>,
  ExpectAssignable<void, ReturnType<typeof editor.update.blocks.set>>,
  ExpectAssignable<void, ReturnType<typeof editor.update.blocks.toggle>>,
  ExpectAssignable<void, ReturnType<typeof editor.update.nodes.lift>>,
  ExpectAssignable<void, ReturnType<typeof editor.update.blocks.insertAfter>>,
  ExpectAssignable<void, ReturnType<typeof editor.update.text.insert>>,
  ExpectAssignable<void, ReturnType<typeof editor.update.nodes.insert>>,
  ExpectAssignable<void, ReturnType<typeof editor.update.nodes.replace>>,
  ExpectAssignable<
    void,
    ReturnType<typeof editor.update.nodes.replaceChildren>
  >,
  ExpectAssignable<void, ReturnType<typeof editor.update.marks.toggle>>,
  ExpectAssignable<void, ReturnType<typeof editor.update.selection.setNodes>>,
];
type PublicUnknownPredicateInputs = [
  ExpectTrue<
    IsUnknownPredicateInput<
      FirstArgument<
        NonNullable<
          import('@platejs/plite').PropertyValidation<number>['validate']
        >
      >
    >
  >,
  ExpectTrue<
    IsUnknownPredicateInput<
      FirstArgument<typeof import('@platejs/plite').isEditor>
    >
  >,
  ExpectTrue<
    IsUnknownPredicateInput<
      FirstArgument<typeof import('@platejs/plite').ElementApi.isAncestor>
    >
  >,
  ExpectTrue<
    IsUnknownPredicateInput<
      FirstArgument<typeof import('@platejs/plite').ElementApi.isElement>
    >
  >,
  ExpectTrue<
    IsUnknownPredicateInput<
      FirstArgument<typeof import('@platejs/plite').ElementApi.isElementList>
    >
  >,
  ExpectTrue<
    IsUnknownPredicateInput<
      FirstArgument<typeof import('@platejs/plite').ElementApi.isElementProps>
    >
  >,
  ExpectTrue<
    IsUnknownPredicateInput<
      FirstArgument<typeof import('@platejs/plite').ElementApi.isElementType>
    >
  >,
  ExpectTrue<
    IsUnknownPredicateInput<
      FirstArgument<typeof import('@platejs/plite').LocationApi.isLocation>
    >
  >,
  ExpectTrue<
    IsUnknownPredicateInput<
      FirstArgument<typeof import('@platejs/plite').NodeApi.isNode>
    >
  >,
  ExpectTrue<
    IsUnknownPredicateInput<
      FirstArgument<typeof import('@platejs/plite').NodeApi.isNodeList>
    >
  >,
  ExpectTrue<
    IsUnknownPredicateInput<
      FirstArgument<typeof import('@platejs/plite').PathApi.isPath>
    >
  >,
  ExpectTrue<
    IsUnknownPredicateInput<
      FirstArgument<typeof import('@platejs/plite').PointApi.isPoint>
    >
  >,
  ExpectTrue<
    IsUnknownPredicateInput<
      FirstArgument<typeof import('@platejs/plite').RangeApi.isRange>
    >
  >,
  ExpectTrue<
    IsUnknownPredicateInput<
      FirstArgument<typeof import('@platejs/plite').SpanApi.isSpan>
    >
  >,
  ExpectTrue<
    IsUnknownPredicateInput<
      FirstArgument<typeof import('@platejs/plite').TextApi.isText>
    >
  >,
  ExpectTrue<
    IsUnknownPredicateInput<
      FirstArgument<typeof import('@platejs/plite').TextApi.isTextList>
    >
  >,
  ExpectTrue<
    IsUnknownPredicateInput<
      FirstArgument<typeof import('@platejs/plite').TextApi.isTextProps>
    >
  >,
  ExpectTrue<
    IsUnknownPredicateInput<
      FirstArgument<typeof import('@platejs/plite-dom').getDefaultView>
    >
  >,
  ExpectTrue<
    IsUnknownPredicateInput<
      FirstArgument<typeof import('@platejs/plite-dom').isDOMElement>
    >
  >,
  ExpectTrue<
    IsUnknownPredicateInput<
      FirstArgument<typeof import('@platejs/plite-dom').isDOMNode>
    >
  >,
  ExpectTrue<
    IsUnknownPredicateInput<
      FirstArgument<typeof import('@platejs/plite-dom').isDOMSelection>
    >
  >,
  ExpectTrue<
    IsUnknownPredicateInput<
      FirstArgument<typeof import('@platejs/plite-dom').isDOMText>
    >
  >,
  ExpectTrue<
    IsUnknownPredicateInput<
      FirstArgument<typeof import('@platejs/plite-history').History.isHistory>
    >
  >,
];

// @ts-expect-error plite-browser is intentionally subpath-only.
type _PliteBrowserRootModule = typeof import('@platejs/browser');

declare const documentChange: import('@platejs/plite').DocumentChange;
declare const createEditorView: typeof import('@platejs/plite').createEditorView;
declare const commit: import('@platejs/plite').EditorCommit;
declare const facet: import('@platejs/plite').EditorFacet<number>;
declare const runtime: import('@platejs/plite').Editor;
declare const slice: import('@platejs/plite').ContentSlice;
declare const publicParent: import('@platejs/plite').Element;
declare const transaction: import('@platejs/plite').EditorUpdateTransaction;

editor.update.selection.setNodes([[0]]);
transaction.selection.setNodes([[0], [2]]);
editor.update.selection.setNodes([]);
transaction.selection.setNodes([]);

const publicAnchor = editor.anchor([], { deletion: 'nearest' });
editor.anchor([], { deletion: 'nearest', root: 'header' });
// @ts-expect-error the primary anchor root is selected by omitting root
editor.anchor([], { deletion: 'nearest', root: 'main' });
type _PublicAnchorRootIncludesImplicitPrimary = ExpectTrue<
  undefined extends typeof publicAnchor.root ? true : false
>;

documentChange.mapPosition(0);
documentChange.mapPosition(0, { root: 'header' });
// @ts-expect-error the primary document is selected by omitting root
documentChange.mapPosition(0, { root: 'main' });

editor.read((state) => state.root('header'));
// @ts-expect-error the primary document is read with state.children()
editor.read((state) => state.root('main'));
editor.read((state) =>
  state.slice.fitContent(slice, { parent: publicParent, root: 'header' })
);
editor.read((state) =>
  // @ts-expect-error the primary fit context is selected by omitting root
  state.slice.fitContent(slice, { parent: publicParent, root: 'main' })
);
editor.read((state) => state.schema.createDefaultRootChild('header'));
// @ts-expect-error the primary schema root is selected by omitting root
editor.read((state) => state.schema.createDefaultRootChild('main'));

transaction.roots.create('header', []);
transaction.roots.replace('header', []);
transaction.roots.delete('header');
// @ts-expect-error the primary document is not a named transaction root
transaction.roots.create('main', []);
// @ts-expect-error the primary document is not a named transaction root
transaction.roots.replace('main', []);
// @ts-expect-error the primary document is not a named transaction root
transaction.roots.delete('main');

createEditorView(runtime, { root: 'header' });
// @ts-expect-error the primary view is selected by omitting root
createEditorView(runtime, { root: 'main' });

commit.changed.has('document', 'header');
commit.changed.paths('header');
commit.changed.nodeKeys('node', 'header');
commit.changed.topLevelRanges('header');
// @ts-expect-error the primary commit root is selected by omitting root
commit.changed.has('document', 'main');
// @ts-expect-error the primary commit root is selected by omitting root
commit.changed.paths('main');
// @ts-expect-error the primary commit root is selected by omitting root
commit.changed.nodeKeys('node', 'main');
// @ts-expect-error the primary commit root is selected by omitting root
commit.changed.topLevelRanges('main');

facet.compute(() => 1, {
  dependencies: [{ kind: 'document', root: 'header' }],
});
facet.compute(() => 1, {
  dependencies: [
    {
      kind: 'document',
      // @ts-expect-error the primary document dependency is selected by omitting root
      root: 'main',
    },
  ],
});

const acceptsPublicPackageModules = <_T extends PublicPackageModules>() => true;
const acceptsPublicPackageNamedExports = <
  _T extends PublicPackageNamedExports,
>() => true;
const acceptsPublicPackageNamedTypeExports = <
  _T extends PublicPackageNamedTypeExports,
>() => true;
const acceptsPublicUnknownPredicateInputs = <
  _T extends PublicUnknownPredicateInputs,
>() => true;

acceptsPublicPackageModules<PublicPackageModules>();
acceptsPublicPackageNamedExports<PublicPackageNamedExports>();
acceptsPublicPackageNamedTypeExports<PublicPackageNamedTypeExports>();
acceptsPublicUnknownPredicateInputs<PublicUnknownPredicateInputs>();
