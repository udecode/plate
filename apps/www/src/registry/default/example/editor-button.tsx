'use client';

import { Plate } from '@udecode/plate-common';

import { Button } from '@/registry/default/plate-ui/button';
import { Editor } from '@/registry/default/plate-ui/editor';

export default function EditorButton() {
  return (
    <div className="mt-[72px] grid w-full gap-2 p-10">
      <Plate>
        <Editor placeholder="Type your message here." />
        <Button>Send message</Button>
      </Plate>
    </div>
  );
}
