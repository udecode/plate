import { createSlateEditor } from '@udecode/plate';

import { deserializeMd } from './deserializeMd';

const editor = createSlateEditor();

describe('deserializeMd', () => {
  it('should deserialize md', () => {
    const result = deserializeMd(editor, 'Hello, world!\n\n 123');
    console.log('🚀 ~ it ~ result:', result);
  });
});
