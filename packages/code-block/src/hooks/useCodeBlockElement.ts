import { useEffect, useState } from 'react';
import { getPluginOptions, useEditorRef } from '@udecode/plate-common';

import {
  CodeBlockPlugin,
  ELEMENT_CODE_BLOCK,
  TCodeBlockElement,
} from '../index';

export const useCodeBlockElementState = ({
  element,
}: {
  element: TCodeBlockElement;
}) => {
  const editor = useEditorRef();
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
