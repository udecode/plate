import {
  defineBasePlugin,
  type RenderStaticNodeWrapper,
  type RenderStaticNodeWrapperProps,
} from '@platejs/core';
import { property } from '@platejs/plite';
import {
  definePlatePlugin,
  type RenderNodeWrapper,
  type RenderNodeWrapperProps,
  useElementSelector,
} from '@platejs/core/react';

const BaseWrapperBoundaryPlugin = defineBasePlugin('baseWrapperBoundary', {
  schema: {
    element: {
      properties: { staticTone: property.string() },
    },
  },
});

const BaseUnrelatedWrapperPlugin = defineBasePlugin('baseUnrelatedWrapper', {});

const WrapperBoundaryPlugin = definePlatePlugin('wrapperBoundary', {
  api: () => ({
    value: () => 'exact' as const,
  }),
  schema: {
    element: {
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

  return;
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
  render: {
    belowRootNodes: exactStaticRootNode,
  },
});

BaseUnrelatedWrapperPlugin.configure({
  render: {
    // @ts-expect-error Exact static root callbacks cannot attach to unrelated plugins.
    belowRootNodes: exactStaticRootNode,
  },
});

WrapperBoundaryPlugin.configure({
  render: {
    belowNodes: broadWrapper,
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

  return;
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

WrapperBoundaryPlugin.configure({
  render: {
    belowRootNodes: exactRootNode,
  },
});

const selectedTone = useElementSelector(
  WrapperBoundaryPlugin,
  ([element]) => element.wrapperTone
);

const UnrelatedWrapperPlugin = definePlatePlugin('unrelatedWrapper', {});

UnrelatedWrapperPlugin.configure({
  render: {
    // @ts-expect-error Exact wrappers cannot attach to unrelated plugins.
    belowNodes: exactWrapper,
    // @ts-expect-error Exact root callbacks cannot attach to unrelated plugins.
    belowRootNodes: exactRootNode,
  },
});

void exactWrapper;
void exactRootNode;
void exactStaticWrapper;
void exactStaticRootNode;
void selectedTone;
