'use client';

import React from 'react';

import { slateNodesToInsertDelta } from '@slate-yjs/core';
import { YjsPlugin } from '@udecode/plate-yjs/react';
import {
  Plate,
  useEditorRef,
  usePlateEditor,
  usePluginOption,
} from '@udecode/plate/react';
import * as Y from 'yjs';

import { editorPlugins } from '@/registry/default/components/editor/plugins/editor-plugins';
import { editorComponents } from '@/registry/default/components/editor/use-create-editor';
import { useMounted } from '@/registry/default/hooks/use-mounted';
import { Button } from '@/registry/default/plate-ui/button';
import { Editor, EditorContainer } from '@/registry/default/plate-ui/editor';
import { withPlaceholders } from '@/registry/default/plate-ui/placeholder';
import { RemoteCursorOverlay } from '@/registry/default/plate-ui/remote-cursor-overlay';

const INITIAL_VALUE = [
  {
    children: [{ text: 'This is the initial content loaded into the Y.Doc.' }],
    type: 'p',
  },
];

export default function CollaborativeEditingDemo(): React.ReactNode {
  const roomName = 'editor-room-1';
  // Generate a random user name to differentiate users in different tabs
  const [username] = React.useState(
    () => `user-${Math.floor(Math.random() * 1000)}`
  );
  // Generate a random color for this user's cursor
  const [cursorColor] = React.useState(() => getRandomColor());
  const mounted = useMounted();

  const editor = usePlateEditor({
    components: withPlaceholders(editorComponents),
    // DO NOT set 'value' here, it comes from the Y.Doc
    plugins: [
      ...editorPlugins,
      YjsPlugin.configure(({ editor }) => ({
        options: {
          cursorOptions: {
            data: { color: cursorColor, name: username },
          },
          // Configure collaboration providers
          providers: [
            {
              options: {
                name: roomName,
                url: 'ws://localhost:8888',
              },
              type: 'hocuspocus',
            },
            {
              options: {
                roomName: roomName,
                signaling: ['ws://localhost:4444'],
              },
              type: 'webrtc',
            },
          ],
          onSyncChange({ isSynced, type }) {
            // In P2P environments (WebRTC), there's no central source of truth
            // We manually handle sync state here since y-webrtc doesn't emit sync events
            // This approach uses a coordination strategy where we check if content exists
            // before initializing to avoid overwriting with potentially stale content
            if (isSynced && type === 'webrtc') {
              // Delay slightly to allow potential initial content application from peers
              // This is a heuristic and might need further refinement
              // You may want to use a single source of truth (e.g. Hocuspocus) for initial content
              setTimeout(() => {
                const ydoc = editor.getOption(YjsPlugin, 'ydoc')!;
                const meta = ydoc.getMap('meta');
                const content = ydoc.get('content', Y.XmlText);

                if (!meta.get('loaded')) {
                  ydoc.transact(() => {
                    const delta = slateNodesToInsertDelta(INITIAL_VALUE);
                    content.applyDelta(delta);
                    meta.set('loaded', true);
                  }, 'load');
                }
              }, 500);
            }
          },
        },
        render: {
          afterEditable: RemoteCursorOverlay,
        },
      })),
    ],
  });

  React.useEffect(() => {
    if (!mounted) return;

    editor.getApi(YjsPlugin).yjs.init();

    return () => {
      editor.getApi(YjsPlugin).yjs.destroy();
    };
  }, [editor, mounted]);

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-md bg-muted p-4 text-sm text-muted-foreground">
        <p>
          <a
            className="underline underline-offset-4 transition-colors hover:text-primary"
            href={typeof window === 'undefined' ? '#' : window.location.href} // Fallback href
            rel="noopener noreferrer"
            target="_blank"
          >
            Open this page in another tab
          </a>{' '}
          or browser window to see real-time collaboration in action. Each
          instance will have a different cursor color for easy identification.
        </p>
        <div className="mt-2">
          This demo showcases multiple providers working together:
          <ul className="mt-1 list-inside list-disc">
            <li>
              <strong>WebRTC:</strong> Enabled for peer-to-peer editing.
            </li>
            <li>
              <strong>Hocuspocus:</strong> Intentionally configured with an
              invalid URL to simulate a failed connection. It will remain
              disconnected in this demo.
            </li>
          </ul>
        </div>
      </div>

      <div className="flex-1 overflow-hidden rounded-md border">
        <Plate editor={editor}>
          <CollaborativeEditor cursorColor={cursorColor} username={username} />
        </Plate>
      </div>
    </div>
  );
}

interface CollaborativeEditorProps {
  cursorColor: string;
  username: string;
}

function CollaborativeEditor({
  cursorColor,
  username,
}: CollaborativeEditorProps): React.ReactNode {
  const editor = useEditorRef();
  const providers = usePluginOption(YjsPlugin, '_providers');
  const isConnected = usePluginOption(YjsPlugin, '_isConnected');

  const toggleConnection = () => {
    if (editor.getOptions(YjsPlugin)._isConnected) {
      return editor.getApi(YjsPlugin).yjs.disconnect();
    }

    editor.getApi(YjsPlugin).yjs.connect();
  };

  return (
    <>
      <div className="bg-muted px-4 py-2 font-medium">
        Connected as <span style={{ color: cursorColor }}>{username}</span>
        <div className="mt-1 flex items-center gap-2 text-xs">
          {providers.map((provider) => (
            <span
              key={provider.type}
              className={`rounded px-2 py-0.5 ${
                provider.isConnected
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}
            >
              {provider.type.charAt(0).toUpperCase() + provider.type.slice(1)}:{' '}
              {provider.isConnected ? 'Connected' : 'Disconnected'}
            </span>
          ))}
          <Button
            size="xs"
            variant="outline"
            className="ml-auto h-6"
            onClick={toggleConnection}
          >
            {isConnected ? 'Disconnect' : 'Connect'}
          </Button>
        </div>
      </div>

      <EditorContainer variant="demo">
        <Editor />
      </EditorContainer>
    </>
  );
}

const getRandomColor = () => {};
