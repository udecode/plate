import React from 'react';

import { setNodes } from '@udecode/plate-common';
import {
  findPath,
  useEditorRef,
  useElement,
} from '@udecode/plate-common/react';
import { useReadOnly } from 'slate-react';

import { type TCodeBlockElement, BaseCodeBlockPlugin } from '../../lib';

export const useCodeBlockComboboxState = () => {
  const editor = useEditorRef();
  const readOnly = useReadOnly();
  const element = useElement<TCodeBlockElement>();
  const [value, setValue] = React.useState(element.lang ?? 'text');

  const { syntaxPopularFirst } = editor.getOptions(BaseCodeBlockPlugin);

  React.useEffect(() => {
    setValue(element.lang ?? 'text');
  }, [element.lang]);

  return {
    element,
    readOnly,
    setValue,
    syntaxPopularFirst,
    value,
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
        const path = findPath(editor, element);
        path &&
          setNodes<TCodeBlockElement>(editor, { lang: _value }, { at: path });
        setValue(_value);
      },
    },
  };
};
