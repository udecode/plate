import type { DefinitionOf } from '@platejs/core';
import { definePlatePlugin, type RenderNodeWrapper } from '@platejs/core/react';

const WrapperBoundaryPlugin = definePlatePlugin('wrapperBoundary', {
  api: () => ({
    value: () => 'exact' as const,
  }),
});

const broadWrapper: RenderNodeWrapper =
  ({ element }) =>
  () =>
    element.type;

WrapperBoundaryPlugin.configure({
  render: {
    belowNodes: broadWrapper,
  },
});

const exactWrapper: RenderNodeWrapper<
  DefinitionOf<typeof WrapperBoundaryPlugin>
> = ({ editor }) => {
  const exactValue: 'exact' = editor.api.wrapperBoundary.value();

  // @ts-expect-error Exact wrapper contexts reject absent capability members.
  editor.api.wrapperBoundary.missing();
  // @ts-expect-error Exact wrapper contexts reject absent capability groups.
  editor.api.missingPlugin.run();

  void exactValue;

  return;
};

const UnrelatedWrapperPlugin = definePlatePlugin('unrelatedWrapper', {});

UnrelatedWrapperPlugin.configure({
  render: {
    // @ts-expect-error Exact wrappers cannot attach to unrelated plugins.
    belowNodes: exactWrapper,
  },
});

void exactWrapper;
