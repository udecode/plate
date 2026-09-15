import { createEditor as createPublicPlateEditor } from 'platejs/react';
import { YjsPlugin as PublicPlateYjsPlugin } from 'platejs/yjs/react';
import { createEditor as createPublicEditor } from 'plitejs';
import { yjs as createPublicYjsBinding } from 'plitejs/yjs';

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
  typeof import('plitejs/yjs'),
  typeof import('plitejs/yjs/react'),
  typeof import('platejs/yjs'),
  typeof import('platejs/yjs/react'),
];

type PublicPackageNamedExports = [
  typeof import('plitejs').createEditor,
  typeof import('plitejs').createEditorView,
  typeof import('plitejs').ContentSlice,
  typeof import('plitejs').defineEditorSchema,
  typeof import('plitejs').definePlugin,
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
  typeof import('plitejs/pagination').createLayout,
  typeof import('plitejs/pagination').createLayout,
  typeof import('plitejs/pagination/react').PagedEditable,
  typeof import('plitejs/pagination/react').useLayout,
  typeof import('plitejs/react').Editable,
  typeof import('plitejs/react').EditorRoot,
  typeof import('plitejs/react').useEditor,
  typeof import('plitejs/yjs').YjsUpdatePolicy,
  typeof import('plitejs/yjs').yjs,
  typeof import('plitejs/yjs/react').useYjsAdmissionStatus,
  typeof import('plitejs/yjs/react').useYjsRemoteCursor,
  typeof import('plitejs/yjs/react').useYjsRemoteCursorGeometry,
  typeof import('plitejs/yjs/react').useYjsRemoteCursorIds,
  typeof import('platejs/yjs/react').YjsPlugin,
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
  import('plitejs/dom').DOMCoverageSession,
  import('plitejs/dom').DOMEditorOptions,
  import('plitejs/dom').DOMRange,
  import('plitejs/dom').DOMSelection,
  import('plitejs/dom').DOMStaticRange,
  import('plitejs/dom').HotkeySpec,
  import('plitejs/dom').StringDiff,
  import('plitejs/dom').TextDiff,
  import('plitejs/pagination').LayoutOptions,
  import('plitejs/pagination').NodeLayoutProvider,
  import('plitejs/pagination').PageLayout,
  import('plitejs/pagination').LayoutOptions,
  import('plitejs/pagination').PageSettings,
  import('plitejs/react').EditableDOMBeforeInputHandler,
  import('plitejs/react').EditableKeyDownHandler,
  import('plitejs/react').EditableProps,
  import('plitejs/react/virtualized').VirtualizedEditableProps,
  import('plitejs/react').ExternalTextActions,
  import('plitejs/react').ExternalTextAdapter,
  import('plitejs/react').ExternalTextChange,
  import('plitejs/react').ExternalTextDecoration,
  import('plitejs/react').ExternalTextDispatchResult,
  import('plitejs/react').ExternalTextOptions,
  import('plitejs/react').ExternalTextSelection,
  import('plitejs/react').ExternalTextSelectionState,
  import('plitejs/react').ExternalTextState,
  import('plitejs/react').ExternalTextView,
  import('plitejs/react').RenderElementProps,
  import('plitejs/react').AnnotationStore,
  import('plitejs/react').CommitContext,
  import('plitejs/react').Decoration,
  import('plitejs/react').DecorationAttributes,
  import('plitejs/react').DecorationRefresh,
  import('plitejs/react').DecorationSource,
  import('plitejs/react').EditorRootProps,
  import('plitejs/react').SelectionChangeContext,
  import('plitejs/react').ValueChangeContext,
  import('plitejs/react').RangeGeometry,
  import('plitejs/react').CommandDispatcher<
    import('plitejs').EditorCommand<any, any>
  >,
  import('plitejs/react').UseCommandOptions,
  import('plitejs/react').UseEditorOptions,
  import('plitejs/react').UseRootEditorOptions,
  import('plitejs/yjs').YjsAdmissionStatus,
  import('plitejs/yjs').YjsAwarenessChange,
  import('plitejs/yjs').YjsAwarenessLike,
  import('plitejs/yjs').YjsAwarenessState,
  import('plitejs/yjs').YjsCursorDataSchema,
  import('plitejs/yjs').YjsInitialReadiness,
  import('plitejs/yjs').YjsPluginOptions,
  import('plitejs/yjs').YjsRemoteCursor,
  import('plitejs/yjs').YjsRemoteCursorData,
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
  ExpectAssignable<
    import('plitejs').Path | undefined,
    ReturnType<typeof editor.update.blocks.insertAfter>
  >,
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
declare const runtime: import('plitejs').Editor;
declare const slice: import('plitejs').ContentSlice;
declare const publicParent: import('plitejs').Element;
declare const transaction: import('plitejs').EditorUpdateTransaction;
declare const yjsAwareness: import('plitejs/yjs').YjsAwarenessLike;
declare const yjsDocument: import('yjs').Doc;

const publicYjsBinding = createPublicYjsBinding({
  awareness: yjsAwareness,
  cursorData: {
    validate: (
      value
    ): value is { readonly color: string; readonly name: string } =>
      typeof value === 'object' && value !== null,
  },
  doc: yjsDocument,
  initialReady: true,
});
const publicYjsEditor = createPublicEditor({
  plugins: [publicYjsBinding] as const,
});

publicYjsEditor.api.yjs.setCursorData({ color: '#7c3aed', name: 'Ada' });
// @ts-expect-error packed declarations preserve inferred cursor metadata
publicYjsEditor.api.yjs.setCursorData({ color: '#7c3aed', name: 42 });

const publicDocumentOnlyYjs = createPublicYjsBinding({
  doc: yjsDocument,
  initialReady: true,
});
const publicDocumentOnlyEditor = createPublicEditor({
  plugins: [publicDocumentOnlyYjs] as const,
});

publicDocumentOnlyEditor.api.yjs.admissionStatus();
// @ts-expect-error presence methods require awareness
publicDocumentOnlyEditor.api.yjs.setCursorData({ name: 'Ada' });

const publicPlateYjs = PublicPlateYjsPlugin.create({
  awareness: yjsAwareness,
  cursorData: {
    validate: (
      value
    ): value is { readonly color: string; readonly name: string } =>
      typeof value === 'object' && value !== null,
  },
  doc: yjsDocument,
  initialReady: true,
});
const publicPlateYjsEditor = createPublicPlateEditor({
  plugins: [publicPlateYjs] as const,
});

publicPlateYjsEditor
  .plugin(publicPlateYjs)
  .api.setCursorData({ color: '#7c3aed', name: 'Ada' });
// @ts-expect-error Plate copied composition preserves inferred cursor metadata
publicPlateYjsEditor.plugin(publicPlateYjs).api.setCursorData({ name: 'Ada' });

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
