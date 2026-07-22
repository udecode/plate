type PublicPackageModules = [
  typeof import('@platejs/plite'),
  typeof import('@platejs/plite/internal'),
  typeof import('@platejs/yjs'),
  typeof import('@platejs/yjs/core'),
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
  typeof import('@platejs/browser/transports'),
];

type PublicPackageNamedExports = [
  typeof import('@platejs/plite').createEditor,
  typeof import('@platejs/plite').createEditorRuntime,
  typeof import('@platejs/plite').ContentSlice,
  typeof import('@platejs/plite').defineEditorSchema,
  typeof import('@platejs/plite').definePropertyPolicy,
  typeof import('@platejs/plite').property,
  typeof import('@platejs/plite').schema,
  typeof import('@platejs/plite').target,
  typeof import('@platejs/plite').above,
  typeof import('@platejs/plite').after,
  typeof import('@platejs/plite').before,
  import('@platejs/plite').EditorCommit,
  typeof import('@platejs/plite').edges,
  typeof import('@platejs/plite').end,
  typeof import('@platejs/plite').first,
  typeof import('@platejs/plite').fragment,
  typeof import('@platejs/plite').isBlock,
  typeof import('@platejs/plite').isEdge,
  typeof import('@platejs/plite').isEditor,
  typeof import('@platejs/plite').isEmpty,
  typeof import('@platejs/plite').isEnd,
  typeof import('@platejs/plite').isInline,
  typeof import('@platejs/plite').isSelectable,
  typeof import('@platejs/plite').isStart,
  typeof import('@platejs/plite').isVoid,
  typeof import('@platejs/plite').last,
  typeof import('@platejs/plite').next,
  typeof import('@platejs/plite').parent,
  typeof import('@platejs/plite').previous,
  typeof import('@platejs/plite').range,
  typeof import('@platejs/plite').start,
  typeof import('@platejs/plite').string,
  typeof import('@platejs/plite').unhangRange,
  typeof import('@platejs/yjs').createYjsExtension,
  typeof import('@platejs/yjs').BaseYjsPlugin,
  typeof import('@platejs/yjs/core').createYjsAwarenessSelection,
  typeof import('@platejs/yjs/react').useYjsRemoteCursors,
  typeof import('@platejs/yjs/react').YjsPlugin,
  typeof import('@platejs/plite/internal').isObject,
  typeof import('@platejs/browser/browser').takeDOMSelectionSnapshot,
  typeof import('@platejs/browser/core').assertPliteBrowserReleaseProof,
  typeof import('@platejs/browser/core').createPliteBrowserFeatureContractRegistry,
  typeof import('@platejs/browser/core').definePliteBrowserFeatureContract,
  typeof import('@platejs/browser/core').validatePliteBrowserReleaseProof,
  typeof import('@platejs/browser/playwright').assertPliteBrowserSelectionContract,
  typeof import('@platejs/browser/transports').resolveBrowserMobileSurface,
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
  import('@platejs/plite').PropertyPolicyInput<number>,
  import('@platejs/plite').Range,
  import('@platejs/plite').Text,
  import('@platejs/plite').Value,
  import('@platejs/yjs').YjsExtensionOptions,
  import('@platejs/yjs').YjsConfig,
  import('@platejs/yjs').YjsProviderLike,
  import('@platejs/yjs').YjsState,
  import('@platejs/yjs').YjsTx,
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
  import('@platejs/plite-react').EditableDOMStrategyLayout,
  import('@platejs/plite-react').EditableDOMStrategyMetrics,
  import('@platejs/plite-react').EditableKeyDownHandler,
  import('@platejs/plite-react').EditableProps,
  import('@platejs/plite-react').RenderElementProps,
  import('@platejs/plite-react').PliteAnnotationStore,
  import('@platejs/plite-react').PliteChange,
  import('@platejs/plite-react').PliteDecorationSourceOptions,
  import('@platejs/plite-react').PliteProps,
  import('@platejs/plite-react').PliteWidgetStore,
  import('@platejs/plite-react').UsePliteCommandCallbackOptions,
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
declare const editor: import('@platejs/plite').Editor;
type _PublicEditorLifecycleMethods = [
  ExpectAssignable<string, ReturnType<typeof editor.read.text.string>>,
  ExpectAssignable<
    import('@platejs/plite').Selection,
    ReturnType<typeof editor.read.selection.get>
  >,
  ExpectAssignable<boolean, ReturnType<typeof editor.read.schema.isBlock>>,
  ExpectAssignable<void, ReturnType<typeof editor.update.blocks.reset>>,
  ExpectAssignable<void, ReturnType<typeof editor.update.blocks.toggle>>,
  ExpectAssignable<void, ReturnType<typeof editor.update.blocks.lift>>,
  ExpectAssignable<void, ReturnType<typeof editor.update.blocks.insertAfter>>,
  ExpectAssignable<void, ReturnType<typeof editor.update.text.insert>>,
  ExpectAssignable<void, ReturnType<typeof editor.update.nodes.insert>>,
  ExpectAssignable<void, ReturnType<typeof editor.update.nodes.replace>>,
  ExpectAssignable<
    void,
    ReturnType<typeof editor.update.nodes.replaceChildren>
  >,
  ExpectAssignable<void, ReturnType<typeof editor.update.marks.toggle>>,
];
type PublicUnknownPredicateInputs = [
  ExpectTrue<
    IsUnknownPredicateInput<
      FirstArgument<
        import('@platejs/plite').PropertyPolicyInput<number>['validate']
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
declare const runtime: import('@platejs/plite').EditorRuntime;
declare const slice: import('@platejs/plite').ContentSlice;
declare const publicParent: import('@platejs/plite').Element;
declare const transaction: import('@platejs/plite').EditorUpdateTransaction;

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
// @ts-expect-error the primary fit context is selected by omitting root
editor.read((state) =>
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
commit.changed.runtimeIds('node', 'header');
commit.changed.topLevelRanges('header');
// @ts-expect-error the primary commit root is selected by omitting root
commit.changed.has('document', 'main');
// @ts-expect-error the primary commit root is selected by omitting root
commit.changed.paths('main');
// @ts-expect-error the primary commit root is selected by omitting root
commit.changed.runtimeIds('node', 'main');
// @ts-expect-error the primary commit root is selected by omitting root
commit.changed.topLevelRanges('main');

facet.compute(() => 1, {
  dependencies: [{ kind: 'document', root: 'header' }],
});
// @ts-expect-error the primary facet dependency is selected by omitting root
facet.compute(() => 1, {
  dependencies: [{ kind: 'document', root: 'main' }],
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
