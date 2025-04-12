'use client';

import React from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

import { YjsPlugin } from '@udecode/plate-yjs/react';
import { createPlateEditor, Plate } from '@udecode/plate/react';
import * as Y from 'yjs';

import { editorPlugins } from '@/registry/default/components/editor/plugins/editor-plugins';
import { Editor, EditorContainer } from '@/registry/default/plate-ui/editor';
import { RemoteCursorOverlay } from '@/registry/default/plate-ui/remote-cursor-overlay';

export default function CollaborativeEditingDemo(): React.ReactNode {
  const roomName = 'editor-room-1';
  // Generate a random user name to differentiate users in different tabs
  const [userName] = React.useState(() => `user-${Math.floor(Math.random() * 1000)}`);
  // Generate a random color for this user's cursor
  const [cursorColor] = React.useState(() => getRandomColor());
  
  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-md bg-muted p-4 text-center text-sm text-muted-foreground">
        <p className="mb-2 font-medium">Collaborative Editing Demo</p>
        <p>
          Open this page in another tab or browser window to see real-time collaboration in action.
          Each instance will have a different cursor color for easy identification.
        </p>
        <p className="mt-2">
          This demo showcases multiple providers working together:
          <ul className="mt-1 text-left list-disc list-inside">
            <li>WebRTC for peer-to-peer editing (In the same browser it uses local storage so no signaling server is needed)</li>
            <li>Hocuspocus for server-based persistence</li>
          </ul>
        </p>
      </div>

      <CollaborativeEditor 
        cursorColor={cursorColor} 
        editorTitle="Collaborative Editor" 
        roomName={roomName}
        userName={userName} 
      />
    </div>
  );
}

interface CollaborativeEditorProps {
  cursorColor: string;
  editorTitle: string;
  roomName: string;
  userName: string;
}

function CollaborativeEditor({ 
  cursorColor,
  editorTitle,
  roomName,
  userName
}: CollaborativeEditorProps): React.ReactNode {
  const [editor, setEditor] = React.useState<any>(null);
  const [providerStatus, setProviderStatus] = React.useState({
    hocuspocus: false,
    webrtc: false,
  });

  React.useEffect(() => {
    // Create a shared Y.Doc to be used by all providers
    const ydoc = new Y.Doc();

    const newEditor = createPlateEditor({
      plugins: [
        ...editorPlugins,
        YjsPlugin.configure({
          options: {
            cursorOptions: {
              autoSend: true,
              data: { color: cursorColor, name: userName },
            },
            disableCursors: false,
            // Configure collaboration providers
            providerConfigs: [
              {
                options: {
                  name: roomName,
                  url: 'ws://localhost:8888',
                },
                providerType: 'hocuspocus',
              },
              {
                options: {
                  roomName: roomName,
                  signaling: ['ws://localhost:4444'],
                },
                providerType: 'webrtc',
              },
            ],
            // Show content as soon as any provider is synced (default)
            waitForAllProviders: false,
            // Pass our shared Y.Doc
            ydoc,
          },
          render: {
            afterEditable: RemoteCursorOverlay,
          },
        }),
      ],
    }) ;

    // Set up hooks to monitor provider status
    const monitorProviders = () => {
      const providers = newEditor.getOption(YjsPlugin, 'providers');
      if (!providers) return;
      
      // Update status for each provider type
      const status = {
        hocuspocus: providers.find((p: any) => p.type === 'hocuspocus')?.isConnected || false,
        webrtc: providers.find((p: any) => p.type === 'webrtc')?.isConnected || false,
      };
      
      setProviderStatus(status);
    };
    
    // Check status initially and every 2 seconds
    monitorProviders();
    const interval = setInterval(monitorProviders, 2000);

    setEditor(newEditor);

    return () => {
      clearInterval(interval);
      // Clean up all providers
      newEditor.getOption(YjsPlugin, 'ydoc')?.destroy();
    };
  }, [userName, roomName, editorTitle, cursorColor]);

  if (!editor) return null;

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="flex-1 overflow-hidden rounded-md border">
        <div className="bg-muted px-4 py-2 font-medium">
          {editorTitle} - Connected as <span style={{ color: cursorColor }}>{userName}</span>
          <div className="mt-1 text-xs flex gap-2">
            <span className={`px-2 py-0.5 rounded ${providerStatus.webrtc ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              WebRTC: {providerStatus.webrtc ? 'Connected' : 'Disconnected'}
            </span>
            <span className={`px-2 py-0.5 rounded ${providerStatus.hocuspocus ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              Hocuspocus: {providerStatus.hocuspocus ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        </div>
        <Plate editor={editor}>
          <EditorContainer>
            <Editor
              variant="demo"
              className="min-h-[600px] border-t"
            />
          </EditorContainer>
        </Plate>
      </div>
    </DndProvider>
  );
}

export const getRandomColor = () => {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};

