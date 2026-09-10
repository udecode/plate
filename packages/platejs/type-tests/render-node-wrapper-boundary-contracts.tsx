import {
  defineBasePlugin,
  type RenderStaticNodeWrapper,
  type RenderStaticNodeWrapperProps,
} from 'platejs';
import {
  definePlatePlugin,
  type RenderNodeWrapper,
  type RenderNodeWrapperProps,
  toPlatePlugin,
  useElementSelector,
  usePath,
} from 'platejs/react';

import { property, schema } from '../src/core';

const BaseWrapperBoundaryPlugin = defineBasePlugin('baseWrapperBoundary', {
  schema: {
    element: {
      content: schema.content.text(),
      properties: { staticTone: property.string() },
    },
  },
});

const BaseUnrelatedWrapperPlugin = defineBasePlugin('baseUnrelatedWrapper', {});

const BaseWrapperDependencyPlugin = defineBasePlugin('baseWrapperDependency', {
  update: () => ({
    run: () => true as const,
  }),
});

const BaseAdaptedWrapperPlugin = defineBasePlugin('adaptedWrapper', {
  dependencies: [BaseWrapperDependencyPlugin],
  schema: {
    element: {
      content: schema.content.text(),
      properties: { adaptedTone: property.string() },
    },
  },
});

const AdaptedWrapperPlugin = toPlatePlugin(BaseAdaptedWrapperPlugin, {
  component: () => null,
});

const WrapperBoundaryPlugin = definePlatePlugin('wrapperBoundary', {
  api: () => ({
    value: () => 'exact' as const,
  }),
  schema: {
    element: {
      content: schema.content.text(),
      properties: { wrapperTone: property.string() },
    },
  },
});

const broadWrapper: RenderNodeWrapper =
  ({ element }) =>
  () =>
    element.type;

const exactStaticWrapper: RenderStaticNodeWrapper<
  typeof BaseWrapperBoundaryPlugin
> = ({ element }) => {
  const exactTone: string | undefined = element.staticTone;

  void exactTone;
};

const exactStaticRootNode = ({
  editor,
  element,
}: RenderStaticNodeWrapperProps<typeof BaseWrapperBoundaryPlugin>) => {
  const exactName: 'baseWrapperBoundary' = editor.plugin(
    BaseWrapperBoundaryPlugin
  ).name;
  const exactTone: string | undefined = element.staticTone;

  void exactName;
  void exactTone;

  return null;
};

BaseWrapperBoundaryPlugin.configure({
  slots: {
    afterNodeChildren: exactStaticRootNode,
  },
});

BaseUnrelatedWrapperPlugin.configure({
  slots: {
    // @ts-expect-error Exact static root callbacks cannot attach to unrelated plugins.
    afterNodeChildren: exactStaticRootNode,
  },
});

WrapperBoundaryPlugin.configure({
  slots: {
    wrapNodeChildren: broadWrapper,
  },
});

const adaptedWrapper: RenderNodeWrapper<typeof AdaptedWrapperPlugin> = ({
  editor,
  element,
}) => {
  const adaptedTone: string | undefined = element.adaptedTone;
  const dependencyResult: true = editor.update.baseWrapperDependency.run();

  void adaptedTone;
  void dependencyResult;
};

AdaptedWrapperPlugin.configure({
  slots: {
    wrapNodeChildren: adaptedWrapper,
  },
});

const exactWrapper: RenderNodeWrapper<typeof WrapperBoundaryPlugin> = ({
  editor,
  element,
}) => {
  const exactValue: 'exact' = editor.api.wrapperBoundary.value();
  const exactTone: string | undefined = element.wrapperTone;

  // @ts-expect-error Exact wrapper contexts reject absent capability members.
  editor.api.wrapperBoundary.missing();
  // @ts-expect-error Exact wrapper contexts reject absent capability groups.
  editor.api.missingPlugin.run();

  void exactValue;
  void exactTone;
};

const exactRootNode = ({
  editor,
  element,
}: RenderNodeWrapperProps<typeof WrapperBoundaryPlugin>) => {
  const exactValue: 'exact' = editor.api.wrapperBoundary.value();
  const exactTone: string | undefined = element.wrapperTone;

  void exactValue;
  void exactTone;

  return null;
};

declare const wrapperProps: RenderNodeWrapperProps<
  typeof WrapperBoundaryPlugin
>;

// @ts-expect-error Live position is an explicit usePath subscription, not a wrapper prop.
void wrapperProps.path;
void wrapperProps.renderPath;

WrapperBoundaryPlugin.configure({
  slots: {
    afterNodeChildren: exactRootNode,
  },
});

const useSelectedToneContract = () => {
  const selectedTone = useElementSelector(
    WrapperBoundaryPlugin,
    (element) => element.wrapperTone
  );

  const selectedToneContract: string | undefined = selectedTone;
  // @ts-expect-error The descriptor selector preserves the string result.
  const invalidSelectedTone: number = selectedTone;
  void selectedToneContract;
  void invalidSelectedTone;
};

const UnrelatedWrapperPlugin = definePlatePlugin('unrelatedWrapper', {});

UnrelatedWrapperPlugin.configure({
  slots: {
    // @ts-expect-error Exact wrappers cannot attach to unrelated plugins.
    wrapNodeChildren: exactWrapper,
    // @ts-expect-error Exact root callbacks cannot attach to unrelated plugins.
    afterNodeChildren: exactRootNode,
  },
});

void exactWrapper;
void adaptedWrapper;
void exactRootNode;
void exactStaticWrapper;
void exactStaticRootNode;
void useSelectedToneContract;

const usePathProjectionContract = () => {
  const fullPath: readonly number[] = usePath();
  // @ts-expect-error Public paths remain readonly.
  const invalidMutablePath: number[] = fullPath;
  const index = usePath((path) => path.at(-1));
  const exactIndex: number | undefined = index;
  // @ts-expect-error Path projections preserve their numeric result.
  const invalidIndex: string = index;
  const derived = usePath((path) => ({ depth: path.length }), {
    equalityFn: (left, right) => left.depth === right.depth,
  });
  const exactDepth: number = derived.depth;
  void fullPath;
  void invalidMutablePath;
  void exactIndex;
  void invalidIndex;
  void exactDepth;
};
void usePathProjectionContract;
