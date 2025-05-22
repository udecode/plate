import { PlateEditor } from '@/registry/components/editor/plate-editor-basic';

export default function Page() {
  return (
    <div className="h-screen w-full" data-registry="plate">
      <PlateEditor />
    </div>
  );
}
