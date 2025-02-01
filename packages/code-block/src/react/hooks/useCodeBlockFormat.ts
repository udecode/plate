import { useEditorRef } from '@udecode/plate/react';

import type { TCodeBlockElement } from '../../lib';

import { Formatter } from '../../lib/formatter/formatter';

export const formatCodeBlock = (editor: Editor, {
  element,
}: {
  element: TCodeBlockElement;
}) => {
  const editor = useEditorRef();

  const { lang: language } = element;
  const code = editor.api.string(element);

  const formatter = new Formatter();
  const isSupported = formatter.isLangSupported(language);

  const format = () => {
    const validSyntax = formatter.validSyntax(code, language);

    if (validSyntax) {
      const formattedCode = formatter.format(code, language);
      editor.tf.insertText(formattedCode, { at: element });
    }
  };

  const validSyntax = formatter.validSyntax(code, language);

  return { format, isSupported, validSyntax };
};
