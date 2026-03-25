/** @jsx jsxt */

import { jsxt } from '@platejs/test-utils';

import { createAutoformatEditor } from './__tests__/withAutoformat/createAutoformatEditor';

jsxt;

describe('AutoformatPlugin', () => {
  it('falls back to plain insertion when a rule query vetoes autoformat', () => {
    const input = (
      <fragment>
        <hp>
          -<cursor />
        </hp>
      </fragment>
    ) as any;

    const output = (
      <fragment>
        <hp>--</hp>
      </fragment>
    ) as any;

    const editor = createAutoformatEditor({
      rules: [
        {
          format: '—',
          match: '--',
          mode: 'text',
          query: () => false,
        },
      ],
      value: input,
    });

    editor.tf.insertText('-');

    expect(input.children).toEqual(output.children);
  });

  it('inserts the trigger after a successful autoformat when insertTrigger is enabled', () => {
    const input = (
      <fragment>
        <hp>
          ##
          <cursor />
        </hp>
      </fragment>
    ) as any;

    const output = (
      <fragment>
        <hp>done!</hp>
      </fragment>
    ) as any;

    const editor = createAutoformatEditor({
      rules: [
        {
          format: (currentEditor) => {
            currentEditor.tf.insertText('done');
          },
          insertTrigger: true,
          match: '##',
          mode: 'block',
          trigger: '!',
        },
      ],
      value: input,
    });

    editor.tf.insertText('!');

    expect(input.children).toEqual(output.children);
  });

  it('restores the first array match when undo-on-delete is enabled', () => {
    const input = (
      <fragment>
        <hp>
          =<cursor />
        </hp>
      </fragment>
    ) as any;

    const output = (
      <fragment>
        <hp>
          -&gt;
          <cursor />
        </hp>
      </fragment>
    ) as any;

    const editor = createAutoformatEditor({
      enableUndoOnDelete: true,
      rules: [
        {
          format: '→',
          match: ['->', '=>'],
          mode: 'text',
        },
      ],
      value: input,
    });

    editor.tf.insertText('>');
    editor.tf.deleteBackward();

    expect(input.children).toEqual(output.children);
  });

  it('skips non-text rules while restoring the first array match', () => {
    const input = (
      <fragment>
        <hp>
          =<cursor />
        </hp>
      </fragment>
    ) as any;

    const editor = createAutoformatEditor({
      enableUndoOnDelete: true,
      rules: [
        {
          format: '>',
          match: '**',
          mode: 'mark',
        } as any,
        {
          format: '>',
          match: ['->', '=>'],
          mode: 'text',
        },
      ],
      value: input,
    });

    editor.tf.insertText('>');
    editor.tf.deleteBackward();

    expect(input.children).toEqual(
      (
        <fragment>
          <hp>
            -&gt;
            <cursor />
          </hp>
        </fragment>
      ).children
    );
  });

  it('restores the string match when undo-on-delete is enabled', () => {
    const input = (
      <fragment>
        <hp>
          <cursor />-
        </hp>
      </fragment>
    ) as any;

    const editor = createAutoformatEditor({
      enableUndoOnDelete: true,
      rules: [
        {
          format: '-',
          match: '--',
          mode: 'text',
        },
      ],
      value: input,
    });

    editor.selection = {
      anchor: { offset: 1, path: [0, 0] },
      focus: { offset: 1, path: [0, 0] },
    } as any;
    editor.tf.deleteBackward();

    expect(input.children).toEqual(
      (
        <fragment>
          <hp>--</hp>
        </fragment>
      ).children
    );
  });

  it('falls back to plain deletion when deleting a non-character unit', () => {
    const input = (
      <fragment>
        <hp>
          hello <cursor />
        </hp>
      </fragment>
    ) as any;

    const editor = createAutoformatEditor({
      enableUndoOnDelete: true,
      rules: [
        {
          format: '→',
          match: '->',
          mode: 'text',
        },
      ],
      value: input,
    });

    editor.tf.deleteBackward('word');

    expect(input.children).toEqual(
      (
        <fragment>
          <hp>
            <cursor />
          </hp>
        </fragment>
      ).children
    );
  });

  it('falls back to plain deletion when undo-on-delete is disabled', () => {
    const input = (
      <fragment>
        <hp>
          hello
          <cursor />
        </hp>
      </fragment>
    ) as any;

    const editor = createAutoformatEditor({
      rules: [
        {
          format: '→',
          match: '->',
          mode: 'text',
        },
      ],
      value: input,
    });

    editor.tf.deleteBackward();

    expect(input.children).toEqual(
      (
        <fragment>
          <hp>hell</hp>
        </fragment>
      ).children
    );
  });

  it('falls back to plain deletion when there is no character before the cursor', () => {
    const input = (
      <fragment>
        <hp>
          <cursor />
          hello
        </hp>
      </fragment>
    ) as any;

    const editor = createAutoformatEditor({
      enableUndoOnDelete: true,
      rules: [
        {
          format: '→',
          match: '->',
          mode: 'text',
        },
      ],
      value: input,
    });

    editor.tf.deleteBackward();

    expect(input.children).toEqual(
      (
        <fragment>
          <hp>hello</hp>
        </fragment>
      ).children
    );
  });

  it('falls back to plain deletion when the deleted character does not match any rule', () => {
    const input = (
      <fragment>
        <hp>
          hello
          <cursor />
        </hp>
      </fragment>
    ) as any;

    const editor = createAutoformatEditor({
      enableUndoOnDelete: true,
      rules: [
        {
          format: '→',
          match: '->',
          mode: 'text',
        },
      ],
      value: input,
    });

    editor.tf.deleteBackward();

    expect(input.children).toEqual(
      (
        <fragment>
          <hp>hell</hp>
        </fragment>
      ).children
    );
  });

  it('falls back to plain insertion when the selection is expanded', () => {
    const input = (
      <fragment>
        <hp>
          h<anchor />
          ello
          <focus />
        </hp>
      </fragment>
    ) as any;

    const editor = createAutoformatEditor({
      rules: [
        {
          format: '—',
          match: '--',
          mode: 'text',
        },
      ],
      value: input,
    });

    editor.tf.insertText('x');

    expect(input.children).toEqual(
      (
        <fragment>
          <hp>hx</hp>
        </fragment>
      ).children
    );
  });

  it('applies a text rule without re-inserting the trigger by default', () => {
    const input = (
      <fragment>
        <hp>
          -<cursor />
        </hp>
      </fragment>
    ) as any;

    const editor = createAutoformatEditor({
      rules: [
        {
          format: '→',
          match: '->',
          mode: 'text',
        },
      ],
      value: input,
    });

    editor.tf.insertText('>');

    expect(input.children).toEqual(
      (
        <fragment>
          <hp>→</hp>
        </fragment>
      ).children
    );
  });

  it('skips vetoed rules and continues to the next matching rule', () => {
    const input = (
      <fragment>
        <hp>
          ##
          <cursor />
        </hp>
      </fragment>
    ) as any;

    const editor = createAutoformatEditor({
      rules: [
        {
          format: 'ignored',
          match: '**',
          mode: 'mark',
          query: () => false,
          trigger: '*',
        } as any,
        {
          format: () => {},
          insertTrigger: true,
          match: '##',
          mode: 'block',
          trigger: '!',
        } as any,
      ],
      value: input,
    });

    editor.tf.insertText('!');

    expect(input.children).toEqual(
      (
        <fragment>
          <hp>done!</hp>
        </fragment>
      ).children
    );
  });
});
