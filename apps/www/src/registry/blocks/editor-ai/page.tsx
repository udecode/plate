import { Toaster } from 'sonner';

import { PlateEditor } from '@/registry/components/editor/plate-editor-ai';
import { SettingsProvider } from '@/registry/components/editor/settings';

export default function Page() {
  return (
    <div className="h-screen w-full" data-registry="plate">
      <SettingsProvider>
        <PlateEditor />
      </SettingsProvider>

      <Toaster />
    </div>
  );
}
