/** @jsx jsx */

import { createPlateEditor, getPlugin } from '@udecode/plate-common';
import { jsx } from '@udecode/plate-test-utils';
import { MARK_BOLD } from '../../../../../nodes/basic-marks/src/createBoldPlugin';
import { MARK_ITALIC } from '../../../../../nodes/basic-marks/src/createItalicPlugin';
import { MARK_UNDERLINE } from '../../../../../nodes/basic-marks/src/createUnderlinePlugin';
import {
  createAutoformatPlugin,
  KEY_AUTOFORMAT,
} from '../../createAutoformatPlugin';
import { onKeyDownAutoformat } from '../../onKeyDownAutoformat';
import { AutoformatPlugin } from '../../types';

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
                mode: 'mark',
                type: [MARK_UNDERLINE, MARK_BOLD, MARK_ITALIC],
                match: { start: '_***', end: '***' },
                trigger: '_',
                ignoreTrim: true,
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
                mode: 'text',
                match: '1/4',
                format: '¼',
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
                mode: 'text',
                match: '1/4',
                format: '¼',
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
