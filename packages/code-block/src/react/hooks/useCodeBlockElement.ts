import React from 'react';

import { useEditorRef } from '@udecode/plate-common/react';
import { getPluginOptions } from '@udecode/plate-common';

import {
  type CodeBlockPluginOptions,
  ELEMENT_CODE_BLOCK,
  type TCodeBlockElement,
} from '../../lib';

export const useCodeBlockElementState = ({
  element,
}: {
  element: TCodeBlockElement;
}) => {
  const editor = useEditorRef();
  const [domLoaded, setDomLoaded] = React.useState(false);
  const { lang } = element;

  const codeClassName = lang ? `${lang} language-${lang}` : '';

  React.useEffect(() => {
    setDomLoaded(true);
  }, []);

  const { syntax } = getPluginOptions<CodeBlockPluginOptions>(
    editor,
    ELEMENT_CODE_BLOCK
  );

  return {
    className: domLoaded && codeClassName,
    syntax,
  };
};
