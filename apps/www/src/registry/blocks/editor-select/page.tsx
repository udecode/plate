/* oxlint-disable react-doctor/nextjs-missing-metadata -- Registry source is client-loaded in docs, not routed by the App Router. */
import EditorSelectForm from '@/registry/examples/select-editor-demo';

export default function Page() {
  return (
    <div className="flex h-screen w-full justify-center">
      <EditorSelectForm />
    </div>
  );
}
