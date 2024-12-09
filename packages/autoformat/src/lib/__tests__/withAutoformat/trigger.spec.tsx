/** @jsx jsxt */

import {
  BoldPlugin,
  ItalicPlugin,
  UnderlinePlugin,
} from '@udecode/plate-basic-marks/react';
import {
  createPlateEditor,
  getEditorPlugin,
} from '@udecode/plate-common/react';
import { jsxt } from '@udecode/plate-test-utils';

import { onKeyDownAutoformat } from '../../../react/onKeyDownAutoformat';
import { BaseAutoformatPlugin } from '../../BaseAutoformatPlugin';

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
        BaseAutoformatPlugin.configure({
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

    editor.insertText('_');

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
        BaseAutoformatPlugin.configure({
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

    editor.insertText('4'); // <-- this should triger the conversion

    const event = new KeyboardEvent('keydown', {
      key: 'backspace',
    }) as any;

    onKeyDownAutoformat({
      ...getEditorPlugin(editor, BaseAutoformatPlugin),
      event: event as any,
    });

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
        BaseAutoformatPlugin.configure({
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

    editor.insertText('4'); // <-- this should triger the conversion

    const event = new KeyboardEvent('keydown', {
      key: 'backspace',
    }) as any;

    onKeyDownAutoformat({
      ...getEditorPlugin(editor, BaseAutoformatPlugin),
      editor,
      event: event as any,
    });

    expect(undoInput.children).toEqual(undoOutput.children);
  });
});
