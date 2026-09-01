type PublicPackageModules = [
  typeof import('plitejs'),
  typeof import('../src/internal'),
  typeof import('plitejs/react'),
  typeof import('plitejs/dom'),
  typeof import('../src/dom/internal'),
  typeof import('plitejs/history'),
  typeof import('plitejs/hyperscript'),
  typeof import('plitejs/pagination'),
  typeof import('plitejs/pagination/react'),
];

type PublicPackageNamedExports = [
  typeof import('plitejs').createEditor,
  typeof import('plitejs').createEditorView,
  typeof import('plitejs').ContentSlice,
  typeof import('plitejs').defineEditorSchema,
  typeof import('plitejs').defineExtension,
  typeof import('plitejs').ElementApi,
  typeof import('plitejs').LocationApi,
  typeof import('plitejs').NodeApi,
  typeof import('plitejs').PathApi,
  typeof import('plitejs').PointApi,
  typeof import('plitejs').property,
  typeof import('plitejs').RangeApi,
  typeof import('plitejs').schema,
  typeof import('plitejs').SelectionApi,
  typeof import('plitejs').SpanApi,
  typeof import('plitejs').target,
  typeof import('plitejs').TextApi,
  import('plitejs').EditorCommit,
  typeof import('plitejs').isEditor,
  typeof import('../src/internal').isObject,
  typeof import('plitejs/dom').DOMCoverage,
  typeof import('plitejs/dom').Hotkeys,
  typeof import('plitejs/dom').getElements,
  typeof import('plitejs/dom').getNodeDataAttributeKeys,
  typeof import('plitejs/dom').isDOMNode,
  typeof import('plitejs/dom').isEditor,
  typeof import('plitejs/dom').isElement,
  typeof import('plitejs/dom').isLeaf,
  typeof import('plitejs/dom').isNode,
  typeof import('plitejs/dom').isString,
  typeof import('plitejs/dom').isText,
  typeof import('plitejs/dom').isVoid,
  typeof import('plitejs/dom').keyToDataAttribute,
  typeof import('../src/dom/internal').DOMEditor,
  typeof import('plitejs/history').History,
  typeof import('plitejs/history').history,
  typeof import('plitejs/hyperscript').createHyperscript,
  typeof import('plitejs/hyperscript').jsx,
  typeof import('plitejs/pagination').createPliteLayout,
  typeof import('plitejs/pagination').createPlitePageLayout,
  typeof import('plitejs/pagination/react').PagedEditable,
  typeof import('plitejs/pagination/react').usePliteLayout,
  typeof import('plitejs/react').Editable,
  typeof import('plitejs/react').Plite,
  typeof import('plitejs/react').useEditor,
];

type PublicPackageNamedTypeExports = [
  import('plitejs').Anchor<import('plitejs').Range>,
  import('plitejs').ContentSlice,
  import('plitejs').Descendant,
  import('plitejs').Editor,
  import('plitejs').EditorCommit,
  import('plitejs').EditorCommitListener,
  import('plitejs').EditorRead,
  import('plitejs').EditorReadMethods,
  import('plitejs').EditorStateSchemaApi,
  import('plitejs').EditorUpdateTransaction,
  import('plitejs').EditorUpdate,
  import('plitejs').EditorUpdateMethods,
  import('plitejs').Element,
  import('plitejs').Node,
  import('plitejs').DocumentChange,
  import('plitejs').Path,
  import('plitejs').Point,
  import('plitejs').PropertyValidation<number>,
  import('plitejs').Range,
  import('plitejs').Text,
  import('plitejs').Value,
  import('plitejs/dom').DOMCoverageBoundary,
  import('plitejs/dom').DOMEditorOptions,
  import('plitejs/dom').DOMRange,
  import('plitejs/dom').DOMSelection,
  import('plitejs/dom').DOMStaticRange,
  import('plitejs/dom').HotkeySpec,
  import('plitejs/dom').StringDiff,
  import('plitejs/dom').TextDiff,
  import('plitejs/pagination').PliteLayoutOptions,
  import('plitejs/pagination').PliteNodeLayoutProvider,
  import('plitejs/pagination').PlitePageLayout,
  import('plitejs/pagination').PlitePageLayoutOptions,
  import('plitejs/pagination').PlitePageSettings,
  import('plitejs/react').EditableDOMBeforeInputHandler,
  import('plitejs/react').DOMStrategyVirtualizedLayout,
  import('plitejs/react').EditableDOMStrategyMetrics,
  import('plitejs/react').EditableKeyDownHandler,
  import('plitejs/react').EditableProps,
  import('plitejs/react').RenderElementProps,
  import('plitejs/react').VirtualizedPageLayoutItem,
  import('plitejs/react').VirtualizedTopLevelLayoutItem,
  import('plitejs/react').PliteAnnotationStore,
  import('plitejs/react').PliteCommitContext,
  import('plitejs/react').PliteDecorationSourceOptions,
  import('plitejs/react').PliteProps,
  import('plitejs/react').PliteSelectionChangeContext,
  import('plitejs/react').PliteValueChangeContext,
  import('plitejs/react').PliteWidgetStore,
  import('plitejs/react').PliteCommandDispatcher<
    import('plitejs').EditorCommand<any, any>
  >,
  import('plitejs/react').UsePliteCommandOptions,
  import('plitejs/react').UseEditorOptions,
  import('plitejs/react').UsePliteRootEditorOptions,
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
declare const editor: import('plitejs').Editor;
type _PublicEditorLifecycleMethods = [
  ExpectAssignable<string, ReturnType<typeof editor.read.text.string>>,
  ExpectAssignable<
    import('plitejs').Range | null,
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
        NonNullable<import('plitejs').PropertyValidation<number>['validate']>
      >
    >
  >,
  ExpectTrue<
    IsUnknownPredicateInput<FirstArgument<typeof import('plitejs').isEditor>>
  >,
  ExpectTrue<
    IsUnknownPredicateInput<
      FirstArgument<typeof import('plitejs').ElementApi.isAncestor>
    >
  >,
  ExpectTrue<
    IsUnknownPredicateInput<
      FirstArgument<typeof import('plitejs').ElementApi.isElement>
    >
  >,
  ExpectTrue<
    IsUnknownPredicateInput<
      FirstArgument<typeof import('plitejs').ElementApi.isElementList>
    >
  >,
  ExpectTrue<
    IsUnknownPredicateInput<
      FirstArgument<typeof import('plitejs').ElementApi.isElementProps>
    >
  >,
  ExpectTrue<
    IsUnknownPredicateInput<
      FirstArgument<typeof import('plitejs').ElementApi.isElementType>
    >
  >,
  ExpectTrue<
    IsUnknownPredicateInput<
      FirstArgument<typeof import('plitejs').LocationApi.isLocation>
    >
  >,
  ExpectTrue<
    IsUnknownPredicateInput<
      FirstArgument<typeof import('plitejs').NodeApi.isNode>
    >
  >,
  ExpectTrue<
    IsUnknownPredicateInput<
      FirstArgument<typeof import('plitejs').NodeApi.isNodeList>
    >
  >,
  ExpectTrue<
    IsUnknownPredicateInput<
      FirstArgument<typeof import('plitejs').PathApi.isPath>
    >
  >,
  ExpectTrue<
    IsUnknownPredicateInput<
      FirstArgument<typeof import('plitejs').PointApi.isPoint>
    >
  >,
  ExpectTrue<
    IsUnknownPredicateInput<
      FirstArgument<typeof import('plitejs').RangeApi.isRange>
    >
  >,
  ExpectTrue<
    IsUnknownPredicateInput<
      FirstArgument<typeof import('plitejs').SpanApi.isSpan>
    >
  >,
  ExpectTrue<
    IsUnknownPredicateInput<
      FirstArgument<typeof import('plitejs').TextApi.isText>
    >
  >,
  ExpectTrue<
    IsUnknownPredicateInput<
      FirstArgument<typeof import('plitejs').TextApi.isTextList>
    >
  >,
  ExpectTrue<
    IsUnknownPredicateInput<
      FirstArgument<typeof import('plitejs').TextApi.isTextProps>
    >
  >,
  ExpectTrue<
    IsUnknownPredicateInput<
      FirstArgument<typeof import('plitejs/dom').getDefaultView>
    >
  >,
  ExpectTrue<
    IsUnknownPredicateInput<
      FirstArgument<typeof import('plitejs/dom').isDOMElement>
    >
  >,
  ExpectTrue<
    IsUnknownPredicateInput<
      FirstArgument<typeof import('plitejs/dom').isDOMNode>
    >
  >,
  ExpectTrue<
    IsUnknownPredicateInput<
      FirstArgument<typeof import('plitejs/dom').isDOMSelection>
    >
  >,
  ExpectTrue<
    IsUnknownPredicateInput<
      FirstArgument<typeof import('plitejs/dom').isDOMText>
    >
  >,
  ExpectTrue<
    IsUnknownPredicateInput<
      FirstArgument<typeof import('plitejs/history').History.isHistory>
    >
  >,
];

declare const documentChange: import('plitejs').DocumentChange;
declare const createEditorView: typeof import('plitejs').createEditorView;
declare const commit: import('plitejs').EditorCommit;
declare const facet: import('plitejs').EditorFacet<number>;
declare const runtime: import('plitejs').Editor;
declare const slice: import('plitejs').ContentSlice;
declare const publicParent: import('plitejs').Element;
declare const transaction: import('plitejs').EditorUpdateTransaction;

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
