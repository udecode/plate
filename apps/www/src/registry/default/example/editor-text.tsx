'use client';

import { Plate } from '@udecode/plate-common';

import { Label } from '@/components/ui/label';
import { Editor } from '@/registry/default/plate-ui/editor';

export default function EditorText() {
  return (
    <div className="mt-[72px] grid gap-1.5 p-10">
      <Plate>
        <Label htmlFor="message-2">Your Message</Label>
        <Editor placeholder="Type your message here." id="message-2" />
        <p className="text-sm text-muted-foreground">
          Your message will be copied to the support team.
        </p>
      </Plate>
    </div>
  );
}
