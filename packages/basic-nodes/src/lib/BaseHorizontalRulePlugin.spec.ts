import { createBaseEditor } from '@platejs/core';
import { SelectionApi } from '@platejs/plite';
import { KEYS } from '@platejs/utils';

import { BaseHorizontalRulePlugin } from './BaseHorizontalRulePlugin';

describe('BaseHorizontalRulePlugin', () => {
  it('decodes and encodes its void HTML element claim', () => {
    const point = { offset: 0, path: [0, 0] };
    const editor = createBaseEditor({
      plugins: [BaseHorizontalRulePlugin],
      selection: SelectionApi.node([0], { anchor: point, focus: point }),
      initialValue: [
        {
          children: [{ text: '' }],
          type: KEYS.hr,
        },
      ],
    });
    const data = new DataTransfer();

    expect(
      editor.api.html.deserialize({
        element: '<hr>',
      })
    ).toEqual([
      {
        children: [{ text: '' }],
        type: KEYS.hr,
      },
    ]);

    editor.api.clipboard.writeSelection(data);

    const body = new DOMParser().parseFromString(
      data.getData('text/html'),
      'text/html'
    ).body;

    expect(body.querySelector('hr')).not.toBeNull();
  });
});
