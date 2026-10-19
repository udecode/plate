import { createEditor } from 'platejs';
import { renderStaticHtml } from 'platejs/static';

const editor = createEditor();
const style = { padding: 0 };

void renderStaticHtml(editor, { props: { style } });

void renderStaticHtml(editor, {
  // @ts-expect-error The rendered editor is the first argument.
  props: { editor, style },
});

const documentProps = { document: editor.read.value(), style };

void renderStaticHtml(editor, {
  // @ts-expect-error Another document goes in the document option.
  props: documentProps,
});
