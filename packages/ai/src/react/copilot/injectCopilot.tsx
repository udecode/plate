import React, { useMemo } from 'react';

import { getAncestorNode } from '@udecode/plate-common';
import {
  type NodeWrapperComponentProps,
  findNodePath,
  useEditorPlugin,
} from '@udecode/plate-common/react';

import { type CopilotPluginConfig, CopilotPlugin } from './CopilotPlugin';

export const InjectCopilot = (
  injectProps: NodeWrapperComponentProps<CopilotPluginConfig>
) => {
  const { element } = injectProps;
  const { editor, getOptions } = useEditorPlugin(CopilotPlugin);

  const isCompleted = editor.useOption(
    CopilotPlugin,
    'isCompleted',
    element.id as string
  );

  const nodeType = useMemo(() => {
    const path = findNodePath(editor, element);

    if (!path) return;

    const node = getAncestorNode(editor, path);

    return node?.[0].type;
  }, [editor, element]);

  const { hoverCard: HoverCard, query, suggestionText } = getOptions();

  if (query?.allow?.includes(nodeType as string)) {
    return function Component({ children }: { children: React.ReactNode }) {
      return (
        <React.Fragment>
          {children}
          {isCompleted && suggestionText && (
            <HoverCard suggestionText={suggestionText} />
          )}
        </React.Fragment>
      );
    };
  }
};
