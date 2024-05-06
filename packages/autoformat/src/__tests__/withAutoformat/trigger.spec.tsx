/** @jsx jsx */

import {
  MARK_BOLD,
  MARK_ITALIC,
  MARK_UNDERLINE,
} from '@udecode/plate-basic-marks';
import { createPlateEditor, getPlugin } from '@udecode/plate-common';
import { jsx } from '@udecode/plate-test-utils';

import type { AutoformatPlugin } from '../../../common/types';

import {
  KEY_AUTOFORMAT,
  createAutoformatPlugin,
} from '../../createAutoformatPlugin';
import { onKeyDownAutoformat } from '../../onKeyDownAutoformat';

jsx;

const input = (
  <editor>
    <hp>
      _***hello***
      <cursor />
    </hp>
  </editor>
) as any;

const output = (
  <editor>
    <hp>
      <htext bold italic underline>
        hello
      </htext>
    </hp>
  </editor>
) as any;

describe('when trigger is defined', () => {
  it('should autoformat', () => {
    const editor = createPlateEditor({
      editor: input,
      plugins: [
        createAutoformatPlugin({
          options: {
            rules: [
              {
                ignoreTrim: true,
                match: { end: '***', start: '_***' },
                mode: 'mark',
                trigger: '_',
                type: [MARK_UNDERLINE, MARK_BOLD, MARK_ITALIC],
              },
            ],
          },
        }),
      ],
    });

    editor.insertText('_');

    expect(input.children).toEqual(output.children);
  });
});

describe('when undo is enabled', () => {
  it('should undo text format upon delete', () => {
    const undoInput = (
      <editor>
        <hp>
          1/
          <cursor />
        </hp>
      </editor>
    ) as any;

    const undoOutput = (
      <editor>
        <hp>
          1/4
          <cursor />
        </hp>
      </editor>
    ) as any;

    const editor = createPlateEditor({
      editor: undoInput,
      plugins: [
        createAutoformatPlugin({
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
    });

    editor.insertText('4'); // <-- this should triger the conversion

    const event = new KeyboardEvent('keydown', {
      key: 'backspace',
    }) as any;

    onKeyDownAutoformat(
      editor,
      getPlugin<AutoformatPlugin>(editor, KEY_AUTOFORMAT)
    )(event as any);

    expect(undoInput.children).toEqual(undoOutput.children);
  });
});

describe('when undo is disabled', () => {
  it('should delete the autoformat text character itself', () => {
    const undoInput = (
      <editor>
        <hp>
          1/
          <cursor />
        </hp>
      </editor>
    ) as any;

    const undoOutput = (
      <editor>
        <hp>
          ¼<cursor />
        </hp>
      </editor>
    ) as any;

    const editor = createPlateEditor({
      editor: undoInput,
      plugins: [
        createAutoformatPlugin({
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
    });

    editor.insertText('4'); // <-- this should triger the conversion

    const event = new KeyboardEvent('keydown', {
      key: 'backspace',
    }) as any;

    onKeyDownAutoformat(
      editor,
      getPlugin<AutoformatPlugin>(editor, KEY_AUTOFORMAT)
    )(event as any);

    expect(undoInput.children).toEqual(undoOutput.children);
  });
});
