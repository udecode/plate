import { Suspense } from 'react';

import { MultiEditorBrowserProbe } from '@/__tests__/package-integration/multi-editor-browser-probe';

export default function MultiEditorPage() {
  return (
    <Suspense fallback={<p>Loading editor proof…</p>}>
      <MultiEditorBrowserProbe />
    </Suspense>
  );
}
