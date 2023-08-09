'use client';

import { EditorCodeGenerator } from '@/components/editor-code-generator';
import { H1 } from '@/components/typography';

export function Generator() {
  return (
    <main className="container relative space-y-8 py-6">
      <H1>Generate Editor Code</H1>
      <EditorCodeGenerator initialPluginIds={initialPluginIds} />
    </main>
  );
}
