/** @jsx jsx */

export const input = (
  <editor>
    <block>
      Initial text <cursor />
    </block>
  </editor>
);

export const run = (editor) => {
  editor.update(() => {
    editor.insertText('additional text');
  });
};

export const output = true;
