import { cn } from '@udecode/cn';
import { AIChatPlugin } from '@udecode/plate-ai/react';
import {
  useEditorPlugin,
  useHotkeys,
  usePluginOption,
} from '@udecode/plate/react';
import { Pause } from 'lucide-react';

import { useChat } from '@/registry/default/components/editor/use-chat';

import { Button } from './button';

export const AILoadingBar = () => {
  const chat = useChat();
  const mode = usePluginOption(AIChatPlugin, 'mode');

  const streaming = usePluginOption(AIChatPlugin, 'streaming');

  const { status } = chat;

  const { api } = useEditorPlugin(AIChatPlugin);

  const isLoading =
    (status === 'streaming' && streaming) || status === 'submitted';

  const visible = (isLoading && mode === 'insert') || streaming;

  useHotkeys('esc', () => {
    api.aiChat.stop();
  });

  if (!visible) return null;

  return (
    <div
      className={cn(
        'absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 items-center gap-3 rounded-md border border-border bg-muted px-3 py-1.5 text-sm text-muted-foreground shadow-md transition-all duration-300'
      )}
    >
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
      <span>{status === 'submitted' ? 'Thinking...' : 'Writing...'}</span>
      <Button
        size="sm"
        variant="ghost"
        className="flex items-center gap-1 text-xs"
        onClick={() => api.aiChat.stop()}
      >
        <Pause className="h-4 w-4" />
        Stop
        <kbd className="ml-1 rounded bg-border px-1 font-mono text-[10px] text-muted-foreground shadow-sm">
          Esc
        </kbd>
      </Button>
    </div>
  );
};
