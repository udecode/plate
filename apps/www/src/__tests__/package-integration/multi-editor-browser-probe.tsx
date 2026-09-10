'use client';

import * as Tooltip from '@radix-ui/react-tooltip';
import { schema } from 'platejs';
import {
  BoldPlugin,
  FontSizePlugin,
  Plate,
  PlateContent,
  PlateController,
  createEditor,
  definePlatePlugin,
  useEditorRuntimeState,
  useOptionalEditor,
} from 'platejs/react';
import React from 'react';

import { SiteRegistryProvider } from '@/components/site-registry/provider';
import { Toolbar } from '@/components/site-registry/toolbar';
import { FontSizeToolbarButton } from '@/registry/components/editor/font-size-toolbar-button';
import {
  RedoToolbarButton,
  UndoToolbarButton,
} from '@/registry/components/editor/history-toolbar-button';
import { MarkToolbarButton } from '@/registry/components/editor/mark-toolbar-button';

const HolderPlugin = definePlatePlugin('multiEditorRoot', {
  schema: {
    element: {
      blockContent: true,
      void: 'block',
      contentRoots: {
        body: {
          ownership: 'exclusive',
          content: schema.content.type('paragraph', {
            default: { type: 'paragraph' },
            min: 1,
          }),
        },
      },
    },
  },
});

const makeModel = () =>
  createEditor({
    id: 'same',
    plugins: [BoldPlugin, FontSizePlugin, HolderPlugin],
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
  const [readOnly, setReadOnly] = React.useState(false);
  const [mounted, setMounted] = React.useState(true);
  const [base, setBase] = React.useState<'base' | 'radix'>('base');
  const value = useEditorRuntimeState(model, (state) => state.value());
  const otherValue = useEditorRuntimeState(other, (state) => state.value());
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
          <PlateController>
            <SharedTools />
            <Plate editor={model}>
              {mounted && (
                <PlateContent aria-label="A" root="note" readOnly={readOnly} />
              )}
              <PlateContent aria-label="A copy" root="note" />
            </Plate>
            <Plate editor={other} primary={false}>
              <PlateContent aria-label="B" root="note" />
            </Plate>
          </PlateController>
          <pre className="break-all whitespace-pre-wrap" data-testid="model-a">
            {JSON.stringify(value)}
          </pre>
          <pre className="break-all whitespace-pre-wrap" data-testid="model-b">
            {JSON.stringify(otherValue)}
          </pre>
        </main>
      </Tooltip.Provider>
    </SiteRegistryProvider>
  );
}
