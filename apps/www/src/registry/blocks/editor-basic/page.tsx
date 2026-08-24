/* oxlint-disable react-doctor/nextjs-missing-metadata -- Registry source is client-loaded in docs, not routed by the App Router. */
import { PlateEditor } from '@/registry/blocks/editor-basic/components/editor/plate-editor';

export default function Page() {
  return (
    <div className="h-screen w-full">
      <PlateEditor />
    </div>
  );
}
