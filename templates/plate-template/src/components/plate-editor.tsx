'use client';

import { createPlugins, Plate } from '@udecode/plate-common';

import { Editor } from '@/components/plate-ui/editor';

const plugins = createPlugins([], {
  components: {},
});

const initialValue = [
  {
    id: 1,
    type: 'p',
    children: [{ text: '' }],
  },
];

export function PlateEditor() {
  return (
    <Plate plugins={plugins} initialValue={initialValue}>
      <Editor placeholder="Type your message here." />
    </Plate>
  );
}
