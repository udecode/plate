import { useEditorRef, useElement } from '@udecode/plate-common/react';

import type { TEquationElement } from '../../../lib/equation/types';

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
        editor
          .getApi({ key: 'blockSelection' })
          .blockSelection?.addSelectedRow?.(element.id);
      },
    },
  };
};
