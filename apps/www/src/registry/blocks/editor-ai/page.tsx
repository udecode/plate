import { Toaster } from 'sonner';

import { PlateEditor } from '@/registry/blocks/editor-ai/components/editor/plate-editor';
import { SettingsProvider } from '@/registry/components/editor/settings-dialog';

export default function Page() {
  return (
    <div className="h-screen w-full">
      <SettingsProvider>
        <PlateEditor />
      </SettingsProvider>

      <Toaster />
    </div>
  );
}
