type PublicPackageModules = [
  typeof import('@platejs/slate'),
  typeof import('@platejs/slate/internal'),
  typeof import('@platejs/yjs'),
  typeof import('@platejs/yjs/core'),
  typeof import('@platejs/yjs/react'),
  typeof import('@platejs/slate-react'),
  typeof import('@platejs/slate-dom'),
  typeof import('@platejs/slate-dom/internal'),
  typeof import('@platejs/slate-history'),
  typeof import('@platejs/slate-hyperscript'),
  typeof import('@platejs/slate-layout'),
  typeof import('@platejs/slate-layout/react'),
  typeof import('@platejs/browser/browser'),
  typeof import('@platejs/browser/core'),
  typeof import('@platejs/browser/playwright'),
  typeof import('@platejs/browser/transports'),
];

type PublicPackageNamedExports = [
  typeof import('@platejs/slate').createEditor,
  typeof import('@platejs/slate').createEditorRuntime,
  import('@platejs/slate').Editor,
  import('@platejs/slate').EditorCommit,
  typeof import('@platejs/slate').isEditor,
  typeof import('@platejs/yjs').createYjsExtension,
  typeof import('@platejs/yjs/core').createYjsAwarenessSelection,
  typeof import('@platejs/yjs/react').useYjsRemoteCursors,
  typeof import('@platejs/slate/internal').isObject,
  typeof import('@platejs/browser/browser').takeDOMSelectionSnapshot,
  typeof import('@platejs/browser/core').assertSlateBrowserReleaseProof,
  typeof import('@platejs/browser/core').createSlateBrowserFeatureContractRegistry,
  typeof import('@platejs/browser/core').defineSlateBrowserFeatureContract,
  typeof import('@platejs/browser/core').validateSlateBrowserReleaseProof,
  typeof import('@platejs/browser/playwright').assertSlateBrowserSelectionContract,
  typeof import('@platejs/browser/transports').resolveBrowserMobileSurface,
  typeof import('@platejs/slate-dom').DOMCoverage,
  typeof import('@platejs/slate-dom').Hotkeys,
  typeof import('@platejs/slate-dom').isDOMNode,
  typeof import('@platejs/slate-dom/internal').DOMEditor,
  typeof import('@platejs/slate-dom/internal').installDOM,
  typeof import('@platejs/slate-history').History,
  typeof import('@platejs/slate-history').history,
  typeof import('@platejs/slate-hyperscript').createHyperscript,
  typeof import('@platejs/slate-hyperscript').jsx,
  typeof import('@platejs/slate-layout').createSlateLayout,
  typeof import('@platejs/slate-layout').createSlatePageLayout,
  typeof import('@platejs/slate-layout/react').PagedEditable,
  typeof import('@platejs/slate-layout/react').useSlateLayout,
  typeof import('@platejs/slate-react').Editable,
  typeof import('@platejs/slate-react').Slate,
  typeof import('@platejs/slate-react').useSlateEditor,
];

type PublicPackageNamedTypeExports = [
  import('@platejs/slate').Descendant,
  import('@platejs/slate').Editor,
  import('@platejs/slate').EditorCommit,
  import('@platejs/slate').Element,
  import('@platejs/slate').Node,
  import('@platejs/slate').Operation,
  import('@platejs/slate').Path,
  import('@platejs/slate').Point,
  import('@platejs/slate').Range,
  import('@platejs/slate').Text,
  import('@platejs/slate').Value,
  import('@platejs/yjs').YjsExtensionOptions,
  import('@platejs/yjs').YjsProviderLike,
  import('@platejs/yjs').YjsState,
  import('@platejs/yjs').YjsTx,
  import('@platejs/yjs/react').YjsRemoteCursorDecorationData,
  import('@platejs/yjs/react').YjsRemoteCursorOverlayPosition,
  import('@platejs/slate-dom').DOMCoverageBoundary,
  import('@platejs/slate-dom').DOMEditorOptions,
  import('@platejs/slate-dom').DOMRange,
  import('@platejs/slate-dom').DOMSelection,
  import('@platejs/slate-dom').DOMStaticRange,
  import('@platejs/slate-dom').HotkeySpec,
  import('@platejs/slate-dom').StringDiff,
  import('@platejs/slate-dom').TextDiff,
  import('@platejs/slate-layout').SlateLayoutOptions,
  import('@platejs/slate-layout').SlateNodeLayoutProvider,
  import('@platejs/slate-layout').SlatePageLayout,
  import('@platejs/slate-layout').SlatePageLayoutOptions,
  import('@platejs/slate-layout').SlatePageSettings,
  import('@platejs/slate-react').EditableDOMBeforeInputHandler,
  import('@platejs/slate-react').EditableDOMStrategyLayout,
  import('@platejs/slate-react').EditableDOMStrategyMetrics,
  import('@platejs/slate-react').EditableKeyDownHandler,
  import('@platejs/slate-react').EditableProps,
  import('@platejs/slate-react').RenderElementProps,
  import('@platejs/slate-react').SlateAnnotationStore,
  import('@platejs/slate-react').SlateChange,
  import('@platejs/slate-react').SlateDecorationSourceOptions,
  import('@platejs/slate-react').SlateProps,
  import('@platejs/slate-react').SlateWidgetStore,
  import('@platejs/slate-react').UseSlateCommandCallbackOptions,
  import('@platejs/slate-react').UseSlateEditorOptions,
  import('@platejs/slate-react').UseSlateRootEditorOptions,
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
type PublicUnknownPredicateInputs = [
  ExpectTrue<
    IsUnknownPredicateInput<
      FirstArgument<typeof import('@platejs/slate').Editor.isEditor>
    >
  >,
  ExpectTrue<
    IsUnknownPredicateInput<
      FirstArgument<typeof import('@platejs/slate').ElementApi.isAncestor>
    >
  >,
  ExpectTrue<
    IsUnknownPredicateInput<
      FirstArgument<typeof import('@platejs/slate').ElementApi.isElement>
    >
  >,
  ExpectTrue<
    IsUnknownPredicateInput<
      FirstArgument<typeof import('@platejs/slate').ElementApi.isElementList>
    >
  >,
  ExpectTrue<
    IsUnknownPredicateInput<
      FirstArgument<typeof import('@platejs/slate').ElementApi.isElementProps>
    >
  >,
  ExpectTrue<
    IsUnknownPredicateInput<
      FirstArgument<typeof import('@platejs/slate').ElementApi.isElementType>
    >
  >,
  ExpectTrue<
    IsUnknownPredicateInput<
      FirstArgument<typeof import('@platejs/slate').LocationApi.isLocation>
    >
  >,
  ExpectTrue<
    IsUnknownPredicateInput<
      FirstArgument<typeof import('@platejs/slate').NodeApi.isNode>
    >
  >,
  ExpectTrue<
    IsUnknownPredicateInput<
      FirstArgument<typeof import('@platejs/slate').NodeApi.isNodeList>
    >
  >,
  ExpectTrue<
    IsUnknownPredicateInput<
      FirstArgument<typeof import('@platejs/slate').OperationApi.isOperation>
    >
  >,
  ExpectTrue<
    IsUnknownPredicateInput<
      FirstArgument<
        typeof import('@platejs/slate').OperationApi.isOperationList
      >
    >
  >,
  ExpectTrue<
    IsUnknownPredicateInput<
      FirstArgument<typeof import('@platejs/slate').PathApi.isPath>
    >
  >,
  ExpectTrue<
    IsUnknownPredicateInput<
      FirstArgument<typeof import('@platejs/slate').PointApi.isPoint>
    >
  >,
  ExpectTrue<
    IsUnknownPredicateInput<
      FirstArgument<typeof import('@platejs/slate').RangeApi.isRange>
    >
  >,
  ExpectTrue<
    IsUnknownPredicateInput<
      FirstArgument<typeof import('@platejs/slate').SpanApi.isSpan>
    >
  >,
  ExpectTrue<
    IsUnknownPredicateInput<
      FirstArgument<typeof import('@platejs/slate').TextApi.isText>
    >
  >,
  ExpectTrue<
    IsUnknownPredicateInput<
      FirstArgument<typeof import('@platejs/slate').TextApi.isTextList>
    >
  >,
  ExpectTrue<
    IsUnknownPredicateInput<
      FirstArgument<typeof import('@platejs/slate').TextApi.isTextProps>
    >
  >,
  ExpectTrue<
    IsUnknownPredicateInput<
      FirstArgument<typeof import('@platejs/slate-dom').getDefaultView>
    >
  >,
  ExpectTrue<
    IsUnknownPredicateInput<
      FirstArgument<typeof import('@platejs/slate-dom').isDOMElement>
    >
  >,
  ExpectTrue<
    IsUnknownPredicateInput<
      FirstArgument<typeof import('@platejs/slate-dom').isDOMNode>
    >
  >,
  ExpectTrue<
    IsUnknownPredicateInput<
      FirstArgument<typeof import('@platejs/slate-dom').isDOMSelection>
    >
  >,
  ExpectTrue<
    IsUnknownPredicateInput<
      FirstArgument<typeof import('@platejs/slate-dom').isDOMText>
    >
  >,
  ExpectTrue<
    IsUnknownPredicateInput<
      FirstArgument<typeof import('@platejs/slate-history').History.isHistory>
    >
  >,
];

// @ts-expect-error slate-browser is intentionally subpath-only.
type _SlateBrowserRootModule = typeof import('@platejs/browser');

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
