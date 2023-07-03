import React, { useEffect } from 'react';
import {
  findNodePath,
  getPluginOptions,
  setNodes,
  useElement,
  usePlateEditorRef,
} from '@udecode/plate-common';
import { useReadOnly } from 'slate-react';

import {
  CodeBlockPlugin,
  ELEMENT_CODE_BLOCK,
  TCodeBlockElement,
} from '../index';

export const useCodeBlockComboboxState = () => {
  const editor = usePlateEditorRef();
  const readOnly = useReadOnly();
  const element = useElement<TCodeBlockElement>();
  const [value, setValue] = React.useState(element.lang ?? 'text');

  const { syntaxPopularFirst } = getPluginOptions<CodeBlockPlugin>(
    editor,
    ELEMENT_CODE_BLOCK
  );

  useEffect(() => {
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
  const editor = usePlateEditorRef();

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
