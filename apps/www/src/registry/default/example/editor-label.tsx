'use client';

import { Plate } from '@udecode/plate-common';

import { Label } from '@/components/ui/label';
import { Editor } from '@/registry/default/plate-ui/editor';

export default function EditorLabel() {
  return (
    <div className="mt-[72px] grid gap-1.5 p-10">
      <Plate id="message">
        <Label htmlFor="message">Your message</Label>
        <Editor placeholder="Type your message here." id="message" />
      </Plate>
    </div>
  );
}
