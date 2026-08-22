import type { Metadata } from 'next';

import { PlateEditor } from '@/registry/blocks/editor-basic/components/editor/plate-editor';

export const metadata: Metadata = {
  title: 'Basic Editor',
};

export default function Page() {
  return (
    <div className="h-screen w-full">
      <PlateEditor />
    </div>
  );
}
