import React from 'react';

import { useEditorRef, useElement, useReadOnly } from '@udecode/plate/react';

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
        editor.tf.setNodes<TCodeBlockElement>(
          { lang: _value },
          { at: element }
        );
        setValue(_value);
      },
    },
  };
};
