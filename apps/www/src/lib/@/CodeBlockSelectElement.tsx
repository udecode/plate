import React from 'react';
import { TCodeBlockElement } from '@udecode/plate-code-block';
import {
  createComponentAs,
  createElementAs,
  findNodePath,
  HTMLPropsAs,
  setNodes,
  useElement,
  usePlateEditorRef,
  Value,
} from '@udecode/plate-common';

export type CodeBlockSelectElementProps<V extends Value> =
  HTMLPropsAs<'select'>;

export const useCodeBlockSelectElementProps = ({
  ...props
}: CodeBlockSelectElementProps<Value>): HTMLPropsAs<'select'> => {
  const element = useElement<TCodeBlockElement>();
  const { lang } = element;

  const editor = usePlateEditorRef();
  const [value, setValue] = React.useState(lang);

  return {
    value,
    contentEditable: false,
    onClick: (e) => {
      e.stopPropagation();
    },
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => {
      const val = e.target.value;
      const path = findNodePath(editor, element);
      path && setNodes<TCodeBlockElement>(editor, { lang: val }, { at: path });
      setValue(e.target.value);
    },

    ...props,
  };
};

export const CodeBlockSelectElementRoot = createComponentAs<
  CodeBlockSelectElementProps<Value>
>((props) => {
  const htmlProps = useCodeBlockSelectElementProps(props);

  return createElementAs('select', htmlProps);
});

export const CodeBlockSelectElement = {
  Root: CodeBlockSelectElementRoot,
};
