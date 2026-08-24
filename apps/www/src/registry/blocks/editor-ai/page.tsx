import { Toaster } from 'sonner';

import { PlateEditor } from '@/registry/blocks/editor-ai/components/editor/plate-editor';

export default function Page() {
  return (
    <div className="h-screen w-full">
      <PlateEditor />

      <Toaster />
    </div>
  );
}
