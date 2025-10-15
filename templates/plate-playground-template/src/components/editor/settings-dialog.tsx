'use client';

/* DEMO ONLY, DO NOT USE IN PRODUCTION */

import * as React from 'react';

import { CopilotPlugin } from '@platejs/ai/react';
import {
  Check,
  ChevronsUpDown,
  ExternalLinkIcon,
  Eye,
  EyeOff,
  Settings,
  Wand2Icon,
} from 'lucide-react';
import { useEditorRef } from 'platejs/react';

import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

import { aiChatPlugin } from './plugins/ai-kit';

interface Model {
  label: string;
  value: string;
}

export const models: Model[] = [
  // OpenAI Models
  { label: 'GPT-3.5 Turbo', value: 'openai/gpt-3.5-turbo' },
  { label: 'GPT-3.5 Turbo Instruct', value: 'openai/gpt-3.5-turbo-instruct' },
  { label: 'GPT-4 Turbo', value: 'openai/gpt-4-turbo' },
  { label: 'GPT-4.1', value: 'openai/gpt-4.1' },
  { label: 'GPT-4.1 Mini', value: 'openai/gpt-4.1-mini' },
  { label: 'GPT-4.1 Nano', value: 'openai/gpt-4.1-nano' },
  { label: 'GPT-4o', value: 'openai/gpt-4o' },
  { label: 'GPT-4o Mini', value: 'openai/gpt-4o-mini' },
  { label: 'GPT-5', value: 'openai/gpt-5' },
  { label: 'GPT-5 Codex', value: 'openai/gpt-5-codex' },
  { label: 'GPT-5 Mini', value: 'openai/gpt-5-mini' },
  { label: 'GPT-5 Nano', value: 'openai/gpt-5-nano' },
  { label: 'GPT-OSS 120B', value: 'openai/gpt-oss-120b' },
  { label: 'GPT-OSS 20B', value: 'openai/gpt-oss-20b' },
  { label: 'O1', value: 'openai/o1' },
  { label: 'O3', value: 'openai/o3' },
  { label: 'O3 Mini', value: 'openai/o3-mini' },
  { label: 'O4 Mini', value: 'openai/o4-mini' },

  // Google Models
  { label: 'Gemini 2.0 Flash', value: 'google/gemini-2.0-flash' },
  { label: 'Gemini 2.0 Flash Lite', value: 'google/gemini-2.0-flash-lite' },
  { label: 'Gemini 2.5 Flash', value: 'google/gemini-2.5-flash' },
  {
    label: 'Gemini 2.5 Flash Image Preview',
    value: 'google/gemini-2.5-flash-image-preview',
  },
  { label: 'Gemini 2.5 Flash Lite', value: 'google/gemini-2.5-flash-lite' },
  { label: 'Gemini 2.5 Pro', value: 'google/gemini-2.5-pro' },
  { label: 'Gemma 2 9B', value: 'google/gemma-2-9b' },

  // Alibaba Models
  { label: 'Qwen 3 14B', value: 'alibaba/qwen-3-14b' },
  { label: 'Qwen 3 235B', value: 'alibaba/qwen-3-235b' },
  { label: 'Qwen 3 30B', value: 'alibaba/qwen-3-30b' },
  { label: 'Qwen 3 32B', value: 'alibaba/qwen-3-32b' },
  { label: 'Qwen3 Coder', value: 'alibaba/qwen3-coder' },
  { label: 'Qwen3 Coder Plus', value: 'alibaba/qwen3-coder-plus' },
  { label: 'Qwen3 Max', value: 'alibaba/qwen3-max' },
  { label: 'Qwen3 Max Preview', value: 'alibaba/qwen3-max-preview' },
  {
    label: 'Qwen3 Next 80B A3B Instruct',
    value: 'alibaba/qwen3-next-80b-a3b-instruct',
  },
  {
    label: 'Qwen3 Next 80B A3B Thinking',
    value: 'alibaba/qwen3-next-80b-a3b-thinking',
  },
  { label: 'Qwen3 VL Instruct', value: 'alibaba/qwen3-vl-instruct' },
  { label: 'Qwen3 VL Thinking', value: 'alibaba/qwen3-vl-thinking' },

  // Amazon Models
  { label: 'Nova Lite', value: 'amazon/nova-lite' },
  { label: 'Nova Micro', value: 'amazon/nova-micro' },
  { label: 'Nova Pro', value: 'amazon/nova-pro' },

  // Anthropic Models
  { label: 'Claude 3 Haiku', value: 'anthropic/claude-3-haiku' },
  { label: 'Claude 3 Opus', value: 'anthropic/claude-3-opus' },
  { label: 'Claude 3.5 Haiku', value: 'anthropic/claude-3.5-haiku' },
  { label: 'Claude 3.5 Sonnet', value: 'anthropic/claude-3.5-sonnet' },
  { label: 'Claude 3.7 Sonnet', value: 'anthropic/claude-3.7-sonnet' },
  { label: 'Claude Opus 4', value: 'anthropic/claude-opus-4' },
  { label: 'Claude Opus 4.1', value: 'anthropic/claude-opus-4.1' },
  { label: 'Claude Sonnet 4', value: 'anthropic/claude-sonnet-4' },

  // Cohere Models
  { label: 'Command A', value: 'cohere/command-a' },
  { label: 'Command R', value: 'cohere/command-r' },
  { label: 'Command R Plus', value: 'cohere/command-r-plus' },

  // DeepSeek Models
  { label: 'DeepSeek R1', value: 'deepseek/deepseek-r1' },
  {
    label: 'DeepSeek R1 Distill Llama 70B',
    value: 'deepseek/deepseek-r1-distill-llama-70b',
  },
  { label: 'DeepSeek V3', value: 'deepseek/deepseek-v3' },
  { label: 'DeepSeek V3.1', value: 'deepseek/deepseek-v3.1' },
  { label: 'DeepSeek V3.1 Base', value: 'deepseek/deepseek-v3.1-base' },
  { label: 'DeepSeek V3.1 Terminus', value: 'deepseek/deepseek-v3.1-terminus' },
  { label: 'DeepSeek V3.2 Exp', value: 'deepseek/deepseek-v3.2-exp' },
  {
    label: 'DeepSeek V3.2 Exp Thinking',
    value: 'deepseek/deepseek-v3.2-exp-thinking',
  },

  // Inception Models
  { label: 'Mercury Coder Small', value: 'inception/mercury-coder-small' },

  // Meituan Models
  { label: 'LongCat Flash Chat', value: 'meituan/longcat-flash-chat' },
  { label: 'LongCat Flash Thinking', value: 'meituan/longcat-flash-thinking' },

  // Meta Models
  { label: 'Llama 3 70B', value: 'meta/llama-3-70b' },
  { label: 'Llama 3 8B', value: 'meta/llama-3-8b' },
  { label: 'Llama 3.1 70B', value: 'meta/llama-3.1-70b' },
  { label: 'Llama 3.1 8B', value: 'meta/llama-3.1-8b' },
  { label: 'Llama 3.2 11B', value: 'meta/llama-3.2-11b' },
  { label: 'Llama 3.2 1B', value: 'meta/llama-3.2-1b' },
  { label: 'Llama 3.2 3B', value: 'meta/llama-3.2-3b' },
  { label: 'Llama 3.2 90B', value: 'meta/llama-3.2-90b' },
  { label: 'Llama 3.3 70B', value: 'meta/llama-3.3-70b' },
  { label: 'Llama 4 Maverick', value: 'meta/llama-4-maverick' },
  { label: 'Llama 4 Scout', value: 'meta/llama-4-scout' },

  // Mistral Models
  { label: 'Codestral', value: 'mistral/codestral' },
  { label: 'Devstral Small', value: 'mistral/devstral-small' },
  { label: 'Magistral Medium', value: 'mistral/magistral-medium' },
  { label: 'Magistral Small', value: 'mistral/magistral-small' },
  { label: 'Ministral 3B', value: 'mistral/ministral-3b' },
  { label: 'Ministral 8B', value: 'mistral/ministral-8b' },
  { label: 'Mistral Large', value: 'mistral/mistral-large' },
  { label: 'Mistral Medium', value: 'mistral/mistral-medium' },
  { label: 'Mistral Small', value: 'mistral/mistral-small' },
  { label: 'Mixtral 8x22B Instruct', value: 'mistral/mixtral-8x22b-instruct' },
  { label: 'Pixtral 12B', value: 'mistral/pixtral-12b' },
  { label: 'Pixtral Large', value: 'mistral/pixtral-large' },

  // MoonshotAI Models
  { label: 'Kimi K2', value: 'moonshotai/kimi-k2' },
  { label: 'Kimi K2 0905', value: 'moonshotai/kimi-k2-0905' },
  { label: 'Kimi K2 Turbo', value: 'moonshotai/kimi-k2-turbo' },

  // Morph Models
  { label: 'Morph V3 Fast', value: 'morph/morph-v3-fast' },
  { label: 'Morph V3 Large', value: 'morph/morph-v3-large' },

  // Perplexity Models
  { label: 'Sonar', value: 'perplexity/sonar' },
  { label: 'Sonar Pro', value: 'perplexity/sonar-pro' },
  { label: 'Sonar Reasoning', value: 'perplexity/sonar-reasoning' },
  { label: 'Sonar Reasoning Pro', value: 'perplexity/sonar-reasoning-pro' },

  // Stealth Models
  { label: 'Sonoma Dusk Alpha', value: 'stealth/sonoma-dusk-alpha' },
  { label: 'Sonoma Sky Alpha', value: 'stealth/sonoma-sky-alpha' },

  // Vercel Models
  { label: 'v0 1.0 MD', value: 'vercel/v0-1.0-md' },
  { label: 'v0 1.5 MD', value: 'vercel/v0-1.5-md' },

  // xAI Models
  { label: 'Grok 2', value: 'xai/grok-2' },
  { label: 'Grok 2 Vision', value: 'xai/grok-2-vision' },
  { label: 'Grok 3', value: 'xai/grok-3' },
  { label: 'Grok 3 Fast', value: 'xai/grok-3-fast' },
  { label: 'Grok 3 Mini', value: 'xai/grok-3-mini' },
  { label: 'Grok 3 Mini Fast', value: 'xai/grok-3-mini-fast' },
  { label: 'Grok 4', value: 'xai/grok-4' },
  { label: 'Grok Code Fast 1', value: 'xai/grok-code-fast-1' },
  {
    label: 'Grok 4 Fast Non-Reasoning',
    value: 'xai/grok-4-fast-non-reasoning',
  },
  { label: 'Grok 4 Fast Reasoning', value: 'xai/grok-4-fast-reasoning' },

  // ZAI Models
  { label: 'GLM 4.5', value: 'zai/glm-4.5' },
  { label: 'GLM 4.5 Air', value: 'zai/glm-4.5-air' },
  { label: 'GLM 4.5V', value: 'zai/glm-4.5v' },
];

export function SettingsDialog() {
  const editor = useEditorRef();

  const [tempModel, setTempModel] = React.useState(models[7]);
  const [tempKeys, setTempKeys] = React.useState<Record<string, string>>({
    aiGatewayApiKey: '',
    uploadthing: '',
  });
  const [showKey, setShowKey] = React.useState<Record<string, boolean>>({});
  const [open, setOpen] = React.useState(false);
  const [openModel, setOpenModel] = React.useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Update AI chat options
    const chatOptions = editor.getOptions(aiChatPlugin).chatOptions ?? {};

    editor.setOption(aiChatPlugin, 'chatOptions', {
      ...chatOptions,
      body: {
        ...chatOptions.body,
        apiKey: tempKeys.aiGatewayApiKey,
        model: tempModel.value,
      },
    });

    setOpen(false);

    // Update AI complete options
    const completeOptions =
      editor.getOptions(CopilotPlugin).completeOptions ?? {};
    editor.setOption(CopilotPlugin, 'completeOptions', {
      ...completeOptions,
      body: {
        ...completeOptions.body,
        apiKey: tempKeys.aiGatewayApiKey,
        model: tempModel.value,
      },
    });
  };

  const toggleKeyVisibility = (key: string) => {
    setShowKey((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const renderApiKeyInput = (service: string, label: string) => (
    <div className="group relative">
      <div className="flex items-center justify-between">
        <label
          className="absolute top-1/2 block -translate-y-1/2 cursor-text px-1 text-sm text-muted-foreground/70 transition-all group-focus-within:pointer-events-none group-focus-within:top-0 group-focus-within:cursor-default group-focus-within:text-xs group-focus-within:font-medium group-focus-within:text-foreground has-[+input:not(:placeholder-shown)]:pointer-events-none has-[+input:not(:placeholder-shown)]:top-0 has-[+input:not(:placeholder-shown)]:cursor-default has-[+input:not(:placeholder-shown)]:text-xs has-[+input:not(:placeholder-shown)]:font-medium has-[+input:not(:placeholder-shown)]:text-foreground"
          htmlFor={label}
        >
          <span className="inline-flex bg-background px-2">{label}</span>
        </label>
        <Button
          asChild
          size="icon"
          variant="ghost"
          className="absolute top-0 right-[28px] h-full"
        >
          <a
            className="flex items-center"
            href={
              service === 'aiGatewayApiKey'
                ? 'https://vercel.com/docs/ai-gateway'
                : 'https://uploadthing.com/dashboard'
            }
            rel="noopener noreferrer"
            target="_blank"
          >
            <ExternalLinkIcon className="size-4" />
            <span className="sr-only">Get {label}</span>
          </a>
        </Button>
      </div>

      <Input
        id={label}
        className="pr-10"
        value={tempKeys[service]}
        onChange={(e) =>
          setTempKeys((prev) => ({ ...prev, [service]: e.target.value }))
        }
        placeholder=""
        data-1p-ignore
        type={showKey[service] ? 'text' : 'password'}
      />
      <Button
        size="icon"
        variant="ghost"
        className="absolute top-0 right-0 h-full"
        onClick={() => toggleKeyVisibility(service)}
        type="button"
      >
        {showKey[service] ? (
          <EyeOff className="size-4" />
        ) : (
          <Eye className="size-4" />
        )}
        <span className="sr-only">
          {showKey[service] ? 'Hide' : 'Show'} {label}
        </span>
      </Button>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="icon"
          variant="default"
          className={cn(
            'group fixed right-4 bottom-4 z-50 size-10 overflow-hidden',
            'rounded-full shadow-md hover:shadow-lg'
          )}
          // data-block-hide
        >
          <Settings className="size-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-xl">Settings</DialogTitle>
          <DialogDescription>
            Configure your API keys and preferences.
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-10" onSubmit={handleSubmit}>
          {/* AI Settings Group */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="size-8 rounded-full bg-purple-100 p-2 dark:bg-purple-900">
                <Wand2Icon className="size-4 text-purple-600 dark:text-purple-400" />
              </div>
              <h4 className="font-semibold">AI</h4>
            </div>

            <div className="space-y-4">
              {renderApiKeyInput('aiGatewayApiKey', 'AI Gateway API Key')}

              <div className="group relative">
                <label
                  className="absolute start-1 top-0 z-10 block -translate-y-1/2 bg-background px-2 text-xs font-medium text-foreground group-has-disabled:opacity-50"
                  htmlFor="select-model"
                >
                  Model
                </label>
                <Popover open={openModel} onOpenChange={setOpenModel}>
                  <PopoverTrigger id="select-model" asChild>
                    <Button
                      size="lg"
                      variant="outline"
                      className="w-full justify-between"
                      aria-expanded={openModel}
                      role="combobox"
                    >
                      <code>{tempModel.label}</code>
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
                                setTempModel(m);
                                setOpenModel(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  'mr-2 size-4',
                                  tempModel.value === m.value
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
              </div>
            </div>
          </div>

          {/* Upload Settings Group */}
          {/* <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="size-8 rounded-full bg-red-100 p-2 dark:bg-red-900">
                <Upload className="size-4 text-red-600 dark:text-red-400" />
              </div>
              <h4 className="font-semibold">Upload</h4>
            </div>

            <div className="space-y-4">
              {renderApiKeyInput('uploadthing', 'Uploadthing API key')}
            </div>
          </div> */}

          <Button size="lg" className="w-full" type="submit">
            Save changes
          </Button>
        </form>

        <p className="text-sm text-muted-foreground">
          Not stored anywhere. Used only for current session requests.
        </p>
      </DialogContent>
    </Dialog>
  );
}
