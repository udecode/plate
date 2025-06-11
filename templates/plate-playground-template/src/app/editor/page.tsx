import { Toaster } from 'sonner';

import { PlateEditor } from '@/components/editor/plate-editor';

export default function Page() {
  return (
    <div className="h-screen w-full">
      <PlateEditor />

      <Toaster />
    </div>
  );
}
