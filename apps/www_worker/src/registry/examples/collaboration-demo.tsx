'use client';

import * as React from 'react';

import { YjsPlugin } from '@platejs/yjs/react';
import { RefreshCw } from 'lucide-react';
import { nanoid } from 'nanoid';
import {
  Plate,
  useEditorRef,
  usePlateEditor,
  usePluginOption,
} from 'platejs/react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { EditorKit } from '@/registry/components/editor/editor-kit';
import { useMounted } from '@/registry/hooks/use-mounted';
import { Editor, EditorContainer } from '@/registry/ui/editor';
import { RemoteCursorOverlay } from '@/registry/ui/remote-cursor-overlay';

const INITIAL_VALUE = [
  {
    children: [{ text: 'This is the initial content loaded into the Y.Doc.' }],
    type: 'p',
  },
];

export default function CollaborativeEditingDemo(): React.ReactNode {
  const mounted = useMounted();
  const { generateNewRoom, roomName, handleRoomChange } =
    useCollaborationRoom();
  const { cursorColor, username } = useCollaborationUser();

  const editor = usePlateEditor(
    {
      plugins: [
        ...EditorKit,
        YjsPlugin.configure({
          options: {
            cursors: {
              data: { color: cursorColor, name: username },
            },
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
                  maxConns: 9, // Limit to 10 total participants
                  roomName,
                  signaling: [
                    process.env.NODE_ENV === 'production'
                      ? // Use public signaling server just for demo purposes
                        'wss://signaling.yjs.dev'
                      : 'ws://localhost:4444',
                  ],
                },
                type: 'webrtc',
              },
            ],
          },
          render: {
            afterEditable: RemoteCursorOverlay,
          },
        }),
      ],
      skipInitialization: true,
    },
    [roomName]
  );

  React.useEffect(() => {
    if (!mounted) return;

    editor.getApi(YjsPlugin).yjs.init({
      id: roomName,
      autoSelect: 'end',
      value: INITIAL_VALUE,
    });

    return () => {
      editor.getApi(YjsPlugin).yjs.destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor, mounted]);

  return (
    <div className="flex flex-col">
      <div className="rounded-md bg-muted p-4 text-muted-foreground text-sm">
        <div className="flex items-center gap-2">
          <div className="flex-1">
            <label className="mb-1 block font-medium text-xs" htmlFor="room-id">
              Room ID (share this to collaborate)
            </label>
            <div className="flex items-center gap-2">
              <Input
                id="room-id"
                className="h-[28px] bg-background px-1.5 py-1"
                value={roomName}
                onChange={handleRoomChange}
                type="text"
              />
              <Button
                size="icon"
                variant="outline"
                onClick={generateNewRoom}
                title="Generate new room"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
        <p className="mt-2">
          You can{' '}
          <a
            className="underline underline-offset-4 transition-colors hover:text-primary"
            href={typeof window === 'undefined' ? '#' : window.location.href}
            rel="noopener noreferrer"
            target="_blank"
          >
            open this page in another tab
          </a>{' '}
          or share your Room ID with others to test real-time collaboration.
          Each instance will have a different cursor color for easy
          identification.
        </p>
        <div className="mt-2">
          <strong>About this demo:</strong>
          <ul className="mt-1 list-inside list-disc">
            <li>
              Share your Room ID with others to collaborate in the same document
            </li>
            <li>Limited to 10 concurrent participants per room</li>
            <li>
              Using WebRTC with public signaling servers - for demo purposes
              only
            </li>
          </ul>
        </div>
      </div>

      <div className="flex-1 overflow-hidden border-t">
        <Plate editor={editor}>
          <CollaborativeEditor cursorColor={cursorColor} username={username} />
        </Plate>
      </div>
    </div>
  );
}

function CollaborativeEditor({
  cursorColor,
  username,
}: {
  cursorColor: string;
  username: string;
}): React.ReactNode {
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
            size="sm"
            variant="outline"
            className="ml-auto"
            onClick={toggleConnection}
          >
            {isConnected ? 'Disconnect' : 'Connect'}
          </Button>
        </div>
      </div>

      <EditorContainer variant="demo">
        <Editor autoFocus />
      </EditorContainer>
    </>
  );
}

// Hook for managing room state
function useCollaborationRoom() {
  const [roomName, setRoomName] = React.useState(() => {
    if (typeof window === 'undefined') return '';

    const storedRoomId = localStorage.getItem('demo-room-id');
    if (storedRoomId) return storedRoomId;

    const newRoomId = nanoid();
    localStorage.setItem('demo-room-id', newRoomId);
    return newRoomId;
  });

  const handleRoomChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newRoomId = e.target.value;
      localStorage.setItem('demo-room-id', newRoomId);
      setRoomName(newRoomId);
    },
    []
  );

  const generateNewRoom = React.useCallback(() => {
    const newRoomId = nanoid();
    localStorage.setItem('demo-room-id', newRoomId);
    setRoomName(newRoomId);
  }, []);

  return {
    generateNewRoom,
    roomName,
    handleRoomChange,
  };
}

// Hook for managing user/cursor state
function useCollaborationUser() {
  const [username] = React.useState(
    () => `user-${Math.floor(Math.random() * 1000)}`
  );
  const [cursorColor] = React.useState(() => getRandomColor());

  return {
    cursorColor,
    username,
  };
}

const getRandomColor = (): string => {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};
