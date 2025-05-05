'use client';

import { cn } from '@udecode/cn';
import { AIChatPlugin } from '@udecode/plate-ai/react';
import { useEditorPlugin, usePluginOption } from '@udecode/plate/react';
import { Pause } from 'lucide-react';

import { Button } from './button';

export const AILoadingBar = () => {
  const chat = usePluginOption(AIChatPlugin, 'chat');
  const mode = usePluginOption(AIChatPlugin, 'mode');

  const { status } = chat;

  const { api } = useEditorPlugin(AIChatPlugin);

  const isLoading = status === 'streaming' || status === 'submitted';

  const visible = isLoading && mode === 'insert';

  if (!visible) return null;

  return (
    <div
      className={cn(
        'border-border bg-muted text-muted-foreground absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 items-center gap-3 rounded-md border px-3 py-1.5 text-sm shadow-md transition-all duration-300'
      )}
    >
      <span className="border-muted-foreground h-4 w-4 animate-spin rounded-full border-2 border-t-transparent" />
      <span>{status === 'submitted' ? 'Thinking...' : 'Writing...'}</span>
      <Button
        size="sm"
        variant="ghost"
        className="flex items-center gap-1 text-xs"
        onClick={() => api.aiChat.stop()}
      >
        <Pause className="h-4 w-4" />
        Stop
        <kbd className="bg-border text-muted-foreground ml-1 rounded px-1 font-mono text-[10px] shadow-sm">
          Esc
        </kbd>
      </Button>
    </div>
  );
};
