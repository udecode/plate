import type { Editor } from '@udecode/plate';

import type { OutdentCodeLineOptions } from './outdentCodeLine';

/** If there is a whitespace character at the start of the code line, delete it. */
export const deleteStartSpace = (
  editor: Editor,
  { codeLine }: OutdentCodeLineOptions
) => {
  const [, codeLinePath] = codeLine;
  const codeLineStart = editor.api.start(codeLinePath);
  const codeLineEnd = codeLineStart && editor.api.after(codeLineStart);
  const spaceRange =
    codeLineEnd && editor.api.range(codeLineStart, codeLineEnd);
  const spaceText = editor.api.string(spaceRange);

  if (/\s/.test(spaceText)) {
    editor.tf.delete({ at: spaceRange });

    return true;
  }

  return false;
};
