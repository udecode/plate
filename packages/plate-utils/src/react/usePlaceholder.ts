import { useEditorRef } from '@udecode/plate-core/react';
import {
  type QueryNodeOptions,
  isCollapsed,
  isElementEmpty,
  queryNode,
} from '@udecode/slate';
import { useComposing, useFocused, useSelected } from 'slate-react';

import type { PlateElementProps } from './PlateElement';

export interface PlaceholderProps extends PlateElementProps {
  placeholder: string;
  hideOnBlur?: boolean;
  query?: QueryNodeOptions;
}

export const usePlaceholderState = ({
  element,
  hideOnBlur = true,
  path,
  query,
}: PlaceholderProps) => {
  const focused = useFocused();
  const selected = useSelected();
  const composing = useComposing();
  const editor = useEditorRef();

  const isEmptyBlock = isElementEmpty(editor, element) && !composing;

  const enabled =
    isEmptyBlock &&
    (!query || queryNode([element, path!], query)) &&
    (!hideOnBlur ||
      (isCollapsed(editor.selection) && hideOnBlur && focused && selected));

  return {
    enabled,
  };
};
