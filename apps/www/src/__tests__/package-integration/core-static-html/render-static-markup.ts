import type { Editor } from 'platejs';
import { renderStaticHtml } from 'platejs/static';

export const renderStaticMarkup = async (editor: Editor) => {
  const { data } = await renderStaticHtml(editor);

  return data
    .replaceAll(/ class="[^"]*"/g, '')
    .replaceAll(
      / data-editor(?:-(?:end|leaf|node|path|root|start|string|void))?="[^"]*"/g,
      ''
    );
};
