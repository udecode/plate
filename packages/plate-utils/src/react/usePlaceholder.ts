import {
  useComposing,
  useEditorRef,
  useFocused,
  useSelected,
} from '@udecode/plate-core/react';
import { type QueryNodeOptions, queryNode } from '@udecode/slate';

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

  const isEmptyBlock = editor.api.isEmpty(element) && !composing;

  const enabled =
    isEmptyBlock &&
    (!query || queryNode([element, path!], query)) &&
    (!hideOnBlur ||
      (editor.api.isCollapsed() && hideOnBlur && focused && selected));

  return {
    enabled,
  };
};
