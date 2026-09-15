import { Toaster } from 'sonner';

import { RichTextEditor } from '@/registry/blocks/editor-ai/components/editor/rich-text-editor';

export default function Page() {
  return (
    <div className="h-screen w-full">
      <RichTextEditor />

      <Toaster />
    </div>
  );
}
