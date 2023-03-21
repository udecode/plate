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

export type CodeBlockSelectElementRootProps<
  V extends Value
> = HTMLPropsAs<'select'>;

export const useCodeBlockSelectElementRootProps = ({
  ...props
}: CodeBlockSelectElementRootProps<Value>): HTMLPropsAs<'select'> => {
  const element = useElement<TCodeBlockElement>();
  const { lang } = element;

  const editor = usePlateEditorRef();
  const [value, setValue] = React.useState(lang);

  return {
    value,
    contentEditable: false,
    style: { float: 'right' },
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
  CodeBlockSelectElementRootProps<Value>
>((props) => {
  const htmlProps = useCodeBlockSelectElementRootProps(props);

  return createElementAs('select', htmlProps);
});
