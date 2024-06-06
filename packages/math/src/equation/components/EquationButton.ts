import {
  addSelectedRow,
  useEditorRef,
  useElement,
} from '@udecode/plate-common';

import type { TEquationElement } from '../types';

export const useEquationButtonState = () => {
  const editor = useEditorRef();
  const element = useElement<TEquationElement>();

  return { editor, element };
};

export const useEquationButton = ({
  editor,
  element,
}: ReturnType<typeof useEquationButtonState>) => {
  return {
    props: {
      onClick: () => {
        addSelectedRow(editor, element.id as string);
      },
    },
  };
};
