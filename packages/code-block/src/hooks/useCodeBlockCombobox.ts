import React from 'react';
import {
  findNodePath,
  getPluginOptions,
  setNodes,
  useEditorRef,
  useElement,
} from '@udecode/plate-common';
import { useReadOnly } from 'slate-react';

import {
  CodeBlockPlugin,
  ELEMENT_CODE_BLOCK,
  TCodeBlockElement,
} from '../index';

export const useCodeBlockComboboxState = () => {
  const editor = useEditorRef();
  const readOnly = useReadOnly();
  const element = useElement<TCodeBlockElement>();
  const [value, setValue] = React.useState(element.lang ?? 'text');

  const { syntaxPopularFirst } = getPluginOptions<CodeBlockPlugin>(
    editor,
    ELEMENT_CODE_BLOCK
  );

  React.useEffect(() => {
    setValue(element.lang ?? 'text');
  }, [element.lang]);

  return {
    readOnly,
    syntaxPopularFirst,
    element,
    value,
    setValue,
  };
};

export const useCodeBlockCombobox = ({
  element,
  setValue,
}: ReturnType<typeof useCodeBlockComboboxState>) => {
  const editor = useEditorRef();

  return {
    commandItemProps: {
      onSelect: (_value: string) => {
        const path = findNodePath(editor, element);
        path &&
          setNodes<TCodeBlockElement>(editor, { lang: _value }, { at: path });
        setValue(_value);
      },
    },
  };
};
