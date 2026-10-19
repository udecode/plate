'use client';

import * as Tooltip from '@radix-ui/react-tooltip';
import { schema } from 'platejs';
import {
  BoldPlugin,
  FontSizePlugin,
  EditorRoot,
  EditorContent,
  EditorController,
  createEditor,
  definePlugin,
  useEditorRuntimeState,
  useOptionalEditor,
} from 'platejs/react';
import React from 'react';

import { SiteRegistryProvider } from '@/components/site-registry/provider';
import { Toolbar } from '@/components/site-registry/toolbar';
import { AlignKit } from '@/registry/components/editor/align';
import { BasicBlocksKit } from '@/registry/components/editor/basic-blocks';
import { BlockMenuKit } from '@/registry/components/editor/block-menu';
import { CodeBlockKit } from '@/registry/components/editor/code-block';
import { ColumnKit } from '@/registry/components/editor/column';
import { DetailsKit } from '@/registry/components/editor/details';
import { FontSizeToolbarButton } from '@/registry/components/editor/font-size-toolbar-button';
import {
  RedoToolbarButton,
  UndoToolbarButton,
} from '@/registry/components/editor/history-toolbar-button';
import { IndentKit } from '@/registry/components/editor/indent';
import { InsertToolbarButton } from '@/registry/components/editor/insert-toolbar-button';
import { ListKit } from '@/registry/components/editor/list';
import { MarkToolbarButton } from '@/registry/components/editor/mark-toolbar-button';
import { SlashKit } from '@/registry/components/editor/slash';
import { TurnIntoToolbarButton } from '@/registry/components/editor/turn-into-toolbar-button';

const HolderPlugin = definePlugin('multiEditorRoot', {
  schema: {
    element: {
      blockContent: true,
      void: 'block',
      contentRoots: {
        body: {
          ownership: 'exclusive',
          content: schema.content.types(
            [
              'blockquote',
              'codeBlock',
              'columnGroup',
              'details',
              'heading',
              'paragraph',
            ],
            {
              default: { type: 'paragraph' },
              min: 1,
            }
          ),
        },
      },
    },
  },
});

const CommandPlugins = [
  BoldPlugin,
  FontSizePlugin,
  ...BasicBlocksKit,
  ...AlignKit,
  ...IndentKit,
  ...ListKit,
  ...CodeBlockKit,
  ...DetailsKit,
  ...ColumnKit,
  ...SlashKit,
  ...BlockMenuKit,
] as const;

const makeModel = () =>
  createEditor({
    id: 'same',
    plugins: [...CommandPlugins, HolderPlugin],
    initialValue: {
      children: [
        { type: 'paragraph', children: [{ text: 'main' }] },
        {
          type: 'multiEditorRoot',
          childRoots: { body: 'note' },
          children: [{ text: '' }],
        },
      ],
      roots: { note: [{ type: 'paragraph', children: [{ text: 'note' }] }] },
    },
  });

const makeCommandModel = () =>
  createEditor({
    id: 'commands',
    plugins: CommandPlugins,
    initialValue: [{ type: 'paragraph', children: [{ text: 'command' }] }],
  });

function SharedTools() {
  const editor = useOptionalEditor();
  return (
    <>
      <output data-testid="selected-view">
        {editor?.api.dom.root()?.getAttribute('aria-label') ?? 'none'}
      </output>
      <Toolbar aria-label="Shared formatting">
        <MarkToolbarButton plugin={BoldPlugin}>Bold</MarkToolbarButton>
        {editor && (
          <>
            <span data-testid="insert-control">
              <InsertToolbarButton />
            </span>
            <span data-testid="turn-into-control">
              <TurnIntoToolbarButton />
            </span>
            <FontSizeToolbarButton />
            <UndoToolbarButton aria-label="Undo" />
            <RedoToolbarButton aria-label="Redo" />
          </>
        )}
      </Toolbar>
    </>
  );
}

export function MultiEditorBrowserProbe() {
  const [model, setModel] = React.useState(makeModel);
  const [other] = React.useState(makeModel);
  const [commands] = React.useState(makeCommandModel);
  const [readOnly, setReadOnly] = React.useState(false);
  const [mounted, setMounted] = React.useState(true);
  const [base, setBase] = React.useState<'base' | 'radix'>('base');
  const value = useEditorRuntimeState(model, (state) => state.value());
  const otherValue = useEditorRuntimeState(other, (state) => state.value());
  const commandValue = useEditorRuntimeState(commands, (state) =>
    state.value()
  );
  return (
    <SiteRegistryProvider base={base}>
      <Tooltip.Provider>
        <main
          style={{
            display: 'grid',
            gap: 16,
            marginInline: 'auto',
            maxWidth: 768,
            minWidth: 0,
            padding: 16,
          }}
        >
          <h1>Multi-editor view proof</h1>
          <nav style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
            <button type="button" onClick={() => setBase('base')}>
              Base UI
            </button>
            <button type="button" onClick={() => setBase('radix')}>
              Radix
            </button>
            <button
              type="button"
              onClick={() => setReadOnly((current) => !current)}
            >
              Toggle A read-only
            </button>
            <button
              type="button"
              onClick={() => setMounted((current) => !current)}
            >
              Toggle A mount
            </button>
            <button type="button" onClick={() => setModel(makeModel())}>
              Replace model A
            </button>
          </nav>
          <EditorController>
            <SharedTools />
            <EditorRoot editor={model}>
              <EditorContent aria-label="A main" />
              {mounted && (
                <EditorContent aria-label="A" root="note" readOnly={readOnly} />
              )}
              <EditorContent aria-label="A copy" root="note" />
            </EditorRoot>
            <EditorRoot editor={other} primary={false}>
              <EditorContent aria-label="B" root="note" />
            </EditorRoot>
            <EditorRoot editor={commands} primary={false}>
              <EditorContent aria-label="Commands" />
            </EditorRoot>
          </EditorController>
          <pre className="break-all whitespace-pre-wrap" data-testid="model-a">
            {JSON.stringify(value)}
          </pre>
          <pre className="break-all whitespace-pre-wrap" data-testid="model-b">
            {JSON.stringify(otherValue)}
          </pre>
          <pre
            className="break-all whitespace-pre-wrap"
            data-testid="model-commands"
          >
            {JSON.stringify(commandValue)}
          </pre>
        </main>
      </Tooltip.Provider>
    </SiteRegistryProvider>
  );
}
