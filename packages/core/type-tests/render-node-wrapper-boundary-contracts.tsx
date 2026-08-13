import { defineBasePlugin, type RenderStaticNodeWrapper } from '@platejs/core';
import { property } from '@platejs/plite';
import {
  definePlatePlugin,
  type RenderNodeWrapper,
  useElementSelector,
} from '@platejs/core/react';

const BaseWrapperBoundaryPlugin = defineBasePlugin('baseWrapperBoundary', {
  schema: {
    element: {
      properties: { staticTone: property.string() },
    },
  },
});

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

const selectedTone = useElementSelector(
  WrapperBoundaryPlugin,
  ([element]) => element.wrapperTone
);

const UnrelatedWrapperPlugin = definePlatePlugin('unrelatedWrapper', {});

UnrelatedWrapperPlugin.configure({
  render: {
    // @ts-expect-error Exact wrappers cannot attach to unrelated plugins.
    belowNodes: exactWrapper,
  },
});

void exactWrapper;
void exactStaticWrapper;
void selectedTone;
