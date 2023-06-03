import { useEffect, useState } from 'react';
import {
  CodeBlockPlugin,
  ELEMENT_CODE_BLOCK,
  TCodeBlockElement,
} from '@udecode/plate-code-block';
import { getPluginOptions, usePlateEditorRef } from '@udecode/plate-common';

export const useCodeBlockElementState = ({
  element,
}: {
  element: TCodeBlockElement;
}) => {
  const editor = usePlateEditorRef();
  const [domLoaded, setDomLoaded] = useState(false);
  const { lang } = element;

  const codeClassName = lang ? `${lang} language-${lang}` : '';

  useEffect(() => {
    setDomLoaded(true);
  }, []);

  const { syntax } = getPluginOptions<CodeBlockPlugin>(
    editor,
    ELEMENT_CODE_BLOCK
  );

  return {
    className: domLoaded && codeClassName,
    syntax,
  };
};
