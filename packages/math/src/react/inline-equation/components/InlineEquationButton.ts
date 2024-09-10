import { useMemo } from 'react';

import {
  findNodePath,
  useEditorRef,
  useElement,
} from '@udecode/plate-common/react';

import type { TInlineEquationElement } from '../../../lib/inline-equation/types';

import { setSelectionInlineEquation } from '../utils/setSelectionInlineEquation';

export const useInlineEquationButtonState = () => {
  const editor = useEditorRef();
  const element = useElement<TInlineEquationElement>();

  const inlineEquationPath = useMemo(
    () => findNodePath(editor, element),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [element]
  );

  return { editor, element, inlineEquationPath };
};

export const useInlineEquationButton = ({
  editor,
  inlineEquationPath,
}: ReturnType<typeof useInlineEquationButtonState>) => {
  return {
    props: {
      onClick: () => {
        inlineEquationPath &&
          setSelectionInlineEquation(editor, inlineEquationPath, 'right');
      },
    },
  };
};
