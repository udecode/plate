import { useEditorRef } from '@udecode/plate/react';

import type { TCodeBlockElement } from '../../lib';

import { Formatter } from '../../lib/formatter/formatter';

export const formatCodeBlock = (editor: Editor, {
  element,
}: {
  element: TCodeBlockElement;
}) => {
      const formatter = new Formatter();
      
  const { lang: language } = element;
    const isSupported = isLangSupported(language);
    if (!isSupported) return
    const validSyntax = isValidSyntax(code, language);

    if (validSyntax) {
      const code = editor.api.string(element);
      const formattedCode = formatCode(code, language);
      editor.tf.insertText(formattedCode, { at: element });
    }
  };
};
