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
  import('@platejs/plite').Editor,
  import('@platejs/plite').EditorCommit,
  typeof import('@platejs/plite').isEditor,
  typeof import('@platejs/yjs').createYjsExtension,
  typeof import('@platejs/yjs/core').createYjsAwarenessSelection,
  typeof import('@platejs/yjs/react').useYjsRemoteCursors,
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
  typeof import('@platejs/plite-dom').isDOMNode,
  typeof import('@platejs/plite-dom/internal').DOMEditor,
  typeof import('@platejs/plite-dom/internal').installDOM,
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
  import('@platejs/plite').Descendant,
  import('@platejs/plite').Editor,
  import('@platejs/plite').EditorCommit,
  import('@platejs/plite').Element,
  import('@platejs/plite').Node,
  import('@platejs/plite').Operation,
  import('@platejs/plite').Path,
  import('@platejs/plite').Point,
  import('@platejs/plite').Range,
  import('@platejs/plite').Text,
  import('@platejs/plite').Value,
  import('@platejs/yjs').YjsExtensionOptions,
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
type PublicUnknownPredicateInputs = [
  ExpectTrue<
    IsUnknownPredicateInput<
      FirstArgument<typeof import('@platejs/plite').Editor.isEditor>
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
      FirstArgument<typeof import('@platejs/plite').OperationApi.isOperation>
    >
  >,
  ExpectTrue<
    IsUnknownPredicateInput<
      FirstArgument<
        typeof import('@platejs/plite').OperationApi.isOperationList
      >
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
