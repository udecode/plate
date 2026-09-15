'use client';

import { DefaultAuthoredPlugin } from 'platejs/authored';
import {
  EditorRoot,
  useCreateEditor,
  useEditor,
  useEditorViewState,
} from 'platejs/react';
import * as React from 'react';

import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { BasicBlocksKit } from '@/registry/components/editor/basic-blocks';
import { Editor, EditorContainer } from '@/registry/components/editor/editor';
import { SuggestionKit } from '@/registry/components/editor/suggestion';
import { createSuggestionDocument } from '@/registry/examples/values/suggestion-document';

export default function SuggestionViewDemo() {
  const [initialValue] = React.useState(createSuggestionDocument);
  const editor = useCreateEditor({
    plugins: [...BasicBlocksKit, ...SuggestionKit],
    initialValue,
    userId: 'alice',
  });

  return (
    <EditorRoot
      editor={editor}
      readOnly
      authored={{ intent: 'propose', projection: 'markup' }}
    >
      <SuggestionViewContent />
    </EditorRoot>
  );
}

function SuggestionViewContent() {
  const editor = useEditor();
  const projection = useEditorViewState(
    editor,
    () => editor.plugin(DefaultAuthoredPlugin).read.view().projection
  );

  return (
    <div className="flex w-full flex-col gap-4 p-4 sm:p-6">
      <ToggleGroup
        aria-label="Document projection"
        onValueChange={(value) => {
          const authored = editor.plugin(DefaultAuthoredPlugin);
          if (value === 'accepted') {
            authored.api.setView({ intent: 'edit', projection: value });
          } else if (value === 'proposed' || value === 'markup') {
            authored.api.setView({
              intent: 'propose',
              projection: value,
            });
          }
        }}
        size="sm"
        type="single"
        value={projection}
        variant="outline"
      >
        <ToggleGroupItem value="accepted">Accepted</ToggleGroupItem>
        <ToggleGroupItem value="proposed">Proposed</ToggleGroupItem>
        <ToggleGroupItem value="markup">Markup</ToggleGroupItem>
      </ToggleGroup>
      <p aria-live="polite" className="text-sm text-muted-foreground">
        {projection === 'accepted'
          ? 'Accepted content excludes pending edits.'
          : projection === 'proposed'
            ? 'Proposed content includes additions and omits proposed deletions.'
            : 'Markup shows additions and keeps proposed deletions visible.'}
      </p>
      <EditorContainer className="h-[200px] rounded-md border" variant="demo">
        <Editor
          aria-label="Suggestion projection document"
          className="h-auto px-8 pb-8 sm:px-12"
          readOnly
          variant="demo"
        />
      </EditorContainer>
      <p className="text-sm text-muted-foreground">
        This document is read-only. Switching projections does not decide
        changes.
      </p>
    </div>
  );
}
