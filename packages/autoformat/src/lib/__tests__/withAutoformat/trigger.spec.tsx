/** @jsx jsxt */

import { createPlateEditor } from 'platejs/react';
import {
  BoldPlugin,
  ItalicPlugin,
  UnderlinePlugin,
} from '@platejs/basic-nodes/react';
import { jsxt } from '@platejs/test-utils';

import { AutoformatPlugin } from '../../AutoformatPlugin';

jsxt;

const input = (
  <fragment>
    <hp>
      _***hello***
      <cursor />
    </hp>
  </fragment>
) as any;

const output = (
  <fragment>
    <hp>
      <htext bold italic underline>
        hello
      </htext>
    </hp>
  </fragment>
) as any;

describe('when trigger is defined', () => {
  it('should autoformat', () => {
    const editor = createPlateEditor({
      plugins: [
        AutoformatPlugin.configure({
          options: {
            rules: [
              {
                ignoreTrim: true,
                match: { end: '***', start: '_***' },
                mode: 'mark',
                trigger: '_',
                type: [UnderlinePlugin.key, BoldPlugin.key, ItalicPlugin.key],
              },
            ],
          },
        }),
      ],
      value: input,
    });

    editor.tf.insertText('_');

    expect(input.children).toEqual(output.children);
  });
});

describe('when undo is enabled', () => {
  it('should undo text format upon delete', () => {
    const undoInput = (
      <fragment>
        <hp>
          1/
          <cursor />
        </hp>
      </fragment>
    ) as any;

    const undoOutput = (
      <fragment>
        <hp>
          1/4
          <cursor />
        </hp>
      </fragment>
    ) as any;

    const editor = createPlateEditor({
      plugins: [
        AutoformatPlugin.configure({
          options: {
            enableUndoOnDelete: true,
            rules: [
              {
                format: '¼',
                match: '1/4',
                mode: 'text',
              },
            ],
          },
        }),
      ],
      value: undoInput,
    });

    editor.tf.insertText('4'); // <-- this should triger the conversion

    editor.tf.deleteBackward();

    expect(undoInput.children).toEqual(undoOutput.children);
  });
});

describe('when undo is disabled', () => {
  it('should delete the autoformat text character itself', () => {
    const undoInput = (
      <fragment>
        <hp>
          1/
          <cursor />
        </hp>
      </fragment>
    ) as any;

    const undoOutput = (
      <fragment>
        <hp>
          ¼<cursor />
        </hp>
      </fragment>
    ) as any;

    const editor = createPlateEditor({
      plugins: [
        AutoformatPlugin.configure({
          options: {
            rules: [
              {
                format: '¼',
                match: '1/4',
                mode: 'text',
              },
            ],
          },
        }),
      ],
      value: undoInput,
    });

    editor.tf.insertText('4'); // <-- this should triger the conversion

    editor.tf.deleteBackward();

    expect(undoInput.children).toEqual(undoOutput.children);
  });
});
