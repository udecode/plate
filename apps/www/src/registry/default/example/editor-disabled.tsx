'use client';

import { Plate } from '@udecode/plate-common';

import { Editor } from '@/registry/default/plate-ui/editor';

export default function EditorDisabled() {
  return (
    <div className="mt-[72px] p-10">
      <Plate>
        <Editor disabled placeholder="Type your message here." />
      </Plate>
    </div>
  );
}
