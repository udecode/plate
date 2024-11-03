'use client';

import { useState } from 'react';

import { cn } from '@udecode/cn';
import { CopilotPlugin } from '@udecode/plate-ai/react';
import { useEditorPlugin } from '@udecode/plate-common/react';
import {
  ArrowUpRight,
  Check,
  ChevronsUpDown,
  Eye,
  EyeOff,
  Settings,
} from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/plate-ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/plate-ui/command';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/plate-ui/dialog';
import { Input } from '@/components/plate-ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/plate-ui/popover';

import { models, useOpenAI } from './openai-context';

export function SettingsDialog() {
  const { apiKey, model, setApiKey, setModel } = useOpenAI();
  const [tempKey, setTempKey] = useState(apiKey);
  const [showKey, setShowKey] = useState(false);
  const [open, setOpen] = useState(false);
  const [openModel, setOpenModel] = useState(false);

  const { getOptions, setOption } = useEditorPlugin(CopilotPlugin);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setApiKey(tempKey);
    setOpen(false);

    const completeOptions = getOptions().completeOptions ?? {};

    setOption('completeOptions', {
      ...completeOptions,
      body: {
        ...completeOptions.body,
        apiKey: tempKey,
        model: model.value,
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="icon"
          variant="default"
          className={cn(
            'group fixed bottom-4 right-4 z-50 size-10 overflow-hidden',
            'rounded-full shadow-md hover:shadow-lg',
            'transition-all duration-300 ease-in-out hover:w-[106px]'
          )}
        >
          <div className="flex size-full items-center justify-start gap-2">
            <Settings className="ml-1.5 size-4" />
            <span
              className={cn(
                'whitespace-nowrap opacity-0 transition-all duration-300 ease-in-out',
                'group-hover:translate-x-0 group-hover:opacity-100',
                '-translate-x-2'
              )}
            >
              Settings
            </span>
          </div>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader className="space-y-4">
          <DialogTitle>AI Settings</DialogTitle>
          <DialogDescription>
            Enter your{' '}
            <Link
              className="inline-flex items-center font-medium text-primary hover:underline"
              href="https://platform.openai.com/api-keys"
              rel="noreferrer"
              target="_blank"
            >
              OpenAI API key
              <ArrowUpRight className="size-[14px]" />
            </Link>{' '}
            to use AI features.
          </DialogDescription>
        </DialogHeader>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="relative">
            <Input
              className="pr-10"
              value={tempKey}
              onChange={(e) => setTempKey(e.target.value)}
              placeholder="sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
              data-1p-ignore
              type={showKey ? 'text' : 'password'}
            />
            <Button
              size="icon"
              variant="ghost"
              className="absolute right-0 top-0 h-full"
              onClick={() => setShowKey(!showKey)}
              type="button"
            >
              {showKey ? (
                <EyeOff className="size-4" />
              ) : (
                <Eye className="size-4" />
              )}
              <span className="sr-only">
                {showKey ? 'Hide' : 'Show'} API key
              </span>
            </Button>
          </div>

          <Popover open={openModel} onOpenChange={setOpenModel}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-between"
                aria-expanded={openModel}
                role="combobox"
              >
                <code>{model.label}</code>
                <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0">
              <Command>
                <CommandInput placeholder="Search model..." />
                <CommandEmpty>No model found.</CommandEmpty>

                <CommandList>
                  <CommandGroup>
                    {models.map((m) => (
                      <CommandItem
                        key={m.value}
                        value={m.value}
                        onSelect={() => {
                          setModel(m);
                          setOpenModel(false);
                        }}
                      >
                        <Check
                          className={cn(
                            'mr-2 size-4',
                            model.value === m.value
                              ? 'opacity-100'
                              : 'opacity-0'
                          )}
                        />
                        <code>{m.label}</code>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>

          <Button className="w-full" type="submit">
            Save
          </Button>
        </form>
        <p className="mt-4 text-sm text-muted-foreground">
          Not stored anywhere. Used only for current session requests.
        </p>
      </DialogContent>
    </Dialog>
  );
}
