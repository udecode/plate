import type { Value } from '@platejs/plite';

import { createPlateEditor } from '../editor/withPlate';
import { createPlatePlugin } from '../plugin/createPlatePlugin';
import { pipeOnChange } from './pipeOnChange';

describe('pipeOnChange', () => {
  it('skips edit-only handlers when the editor is read-only', () => {
    const onChange = mock(() => true);
    const editor = createPlateEditor<Value>({
      plugins: [
        createPlatePlugin({
          editOnly: true,
          handlers: { onChange },
          key: 'test',
        }),
      ],
      readOnly: true,
      value: [{ children: [{ text: 'one' }], type: 'p' }],
    });

    onChange.mockClear();
    const value = [...editor.read.children()] as Value;

    expect(pipeOnChange(editor, value)).toBe(false);
    expect(onChange).not.toHaveBeenCalled();
  });

  it('continues until a handler returns true, then stops', () => {
    const first = mock(() => {});
    const second = mock(() => true);
    const third = mock(() => true);

    const editor = createPlateEditor<Value>({
      plugins: [
        createPlatePlugin({
          handlers: { onChange: first },
          key: 'first',
        }),
        createPlatePlugin({
          handlers: { onChange: second },
          key: 'second',
        }),
        createPlatePlugin({
          handlers: { onChange: third },
          key: 'third',
        }),
      ],
      value: [{ children: [{ text: 'one' }], type: 'p' }],
    });

    first.mockClear();
    second.mockClear();
    third.mockClear();
    const value = [...editor.read.children()] as Value;

    expect(pipeOnChange(editor, value)).toBe(true);
    expect(first).toHaveBeenCalledTimes(1);
    expect(second).toHaveBeenCalledTimes(1);
    expect(third).not.toHaveBeenCalled();
    expect(second.mock.calls[0]?.[0]).toMatchObject({
      value,
    });
  });
});
