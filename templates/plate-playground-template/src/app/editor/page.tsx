import { PlateEditor } from '@/components/editor/plate-editor';
import { SettingsProvider } from '@/components/editor/settings';

export default function Page() {
  return (
    <div className="h-screen w-full" data-registry="plate">
      <SettingsProvider>
        <PlateEditor />
      </SettingsProvider>
    </div>
  );
}
