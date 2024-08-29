import React from 'react';

import { useEditorRef } from '@udecode/plate-common/react';

import { CodeBlockPlugin, type TCodeBlockElement } from '../../lib';

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

  const { syntax } = editor.getOptions(CodeBlockPlugin);

  return {
    className: domLoaded && codeClassName,
    syntax,
  };
};
