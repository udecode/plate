import type { Metadata } from 'next';

import EditorSelectForm from '@/registry/examples/select-editor-demo';

export const metadata: Metadata = {
  title: 'Select Editor',
};

export default function Page() {
  return (
    <div className="flex h-screen w-full justify-center">
      <EditorSelectForm />
    </div>
  );
}
