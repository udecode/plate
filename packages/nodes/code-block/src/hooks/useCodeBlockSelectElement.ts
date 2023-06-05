import React from 'react';
import {
  findNodePath,
  getPluginOptions,
  setNodes,
  useElement,
  usePlateEditorRef,
} from '@udecode/plate-common';
import { useReadOnly } from 'slate-react';
import { CodeBlockPlugin, ELEMENT_CODE_BLOCK, TCodeBlockElement } from '..';

export const useCodeBlockSelectElementState = () => {
  const editor = usePlateEditorRef();
  const readOnly = useReadOnly();

  const { syntaxPopularFirst } = getPluginOptions<CodeBlockPlugin>(
    editor,
    ELEMENT_CODE_BLOCK
  );

  return {
    readOnly,
    syntaxPopularFirst,
  };
};

export const useCodeBlockSelectElement = () => {
  const element = useElement<TCodeBlockElement>();
  const { lang } = element;

  const editor = usePlateEditorRef();
  const [value, setValue] = React.useState(lang);

  return {
    selectProps: {
      value,
      contentEditable: false,
      onClick: (e: React.MouseEvent<HTMLSelectElement>) => {
        e.stopPropagation();
      },
      onChange: (e: React.ChangeEvent<HTMLSelectElement>) => {
        const val = e.target.value;
        const path = findNodePath(editor, element);
        path &&
          setNodes<TCodeBlockElement>(editor, { lang: val }, { at: path });
        setValue(e.target.value);
      },
    },
  };
};
