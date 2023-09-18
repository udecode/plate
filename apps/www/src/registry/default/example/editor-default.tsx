'use client';

import { Plate } from '@udecode/plate-common';

import { Editor } from '@/registry/default/plate-ui/editor';

export default function EditorDefault() {
  return (
    <div className="mt-[72px] p-10">
      <Plate>
        <Editor placeholder="Type your message here." />
      </Plate>
    </div>
  );
}
