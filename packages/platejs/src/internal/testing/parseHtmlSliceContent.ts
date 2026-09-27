import type { Editor } from '../../core';

export const parseHtmlSliceContent = (
  editor: Editor,
  input: HTMLElement | string
) => {
  const source = typeof input === 'string' ? input : input.outerHTML;
  const result = editor.api.html.parseSlice(source);

  if (!result.ok) throw new Error(result.diagnostics[0].message);

  return result.slice.content;
};
