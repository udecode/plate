'use client';

import { Chat, useChat } from '@ai-sdk/react';
import {
  type ChatTransport,
  convertFileListToFileUIParts,
  convertToModelMessages,
  simulateReadableStream,
  type UIMessage,
  type UIMessageChunk,
  type UserContent,
} from 'ai';
import { ArrowUpIcon, FileTextIcon, PlusIcon, XIcon } from 'lucide-react';
import * as React from 'react';

import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
} from '@/components/ui/input-group';
import { PromptEditor } from '@/registry/components/editor/prompt-editor';

const mentionItems = [
  { label: 'Spec', ref: 'docs/spec.md' },
  { label: 'Changelog', ref: 'docs/changelog.md' },
];

const reply: UIMessageChunk[] = [
  { type: 'start' },
  { id: 'reply', type: 'text-start' },
  { delta: 'Message ', id: 'reply', type: 'text-delta' },
  { delta: 'received. ', id: 'reply', type: 'text-delta' },
  { delta: 'This ', id: 'reply', type: 'text-delta' },
  { delta: 'reply ', id: 'reply', type: 'text-delta' },
  { delta: 'streams ', id: 'reply', type: 'text-delta' },
  { delta: 'locally.', id: 'reply', type: 'text-delta' },
  { id: 'reply', type: 'text-end' },
  { type: 'finish' },
];

type ModelParts = Exclude<UserContent, string>;

const createLocalTransport = (
  onModelParts: (id: string, parts: ModelParts) => void
): ChatTransport<UIMessage> => ({
  reconnectToStream: () => Promise.resolve(null),
  sendMessages: async ({ messages }) => {
    const sent = messages.at(-1);
    const modelMessages = await convertToModelMessages(messages);
    const model = modelMessages.at(-1);

    if (sent && model?.role === 'user' && Array.isArray(model.content)) {
      onModelParts(sent.id, model.content);
    }

    return simulateReadableStream({ chunkDelayInMs: 250, chunks: reply });
  },
});

export default function PromptEditorDemo() {
  const [text, setText] = React.useState('');
  const [files, setFiles] = React.useState<Array<{ file: File; id: string }>>(
    []
  );
  const [modelParts, setModelParts] = React.useState<
    Record<string, ModelParts>
  >({});
  const [chat] = React.useState(
    () =>
      new Chat({
        transport: createLocalTransport((id, parts) =>
          setModelParts((current) => ({ ...current, [id]: parts }))
        ),
      })
  );
  const { messages, sendMessage, status } = useChat({ chat });
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [sending, setSending] = React.useState(false);
  const canSend = text.trim().length > 0 && !sending;

  const addFiles = (added: File[]) => {
    setFiles((current) => [
      ...current,
      ...added.map((file) => ({ file, id: crypto.randomUUID() })),
    ]);
  };

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col gap-4 px-4 py-6">
      <ol className="flex flex-col gap-3 text-sm" data-slot="chat-messages">
        {messages.map((message) => (
          <li
            key={message.id}
            className="flex flex-col gap-1.5 rounded-md border p-3"
            data-role={message.role}
            data-slot="chat-message"
          >
            {message.role === 'user' ? (
              modelParts[message.id]?.map((part, index) => {
                if (part.type === 'text') {
                  return (
                    <p
                      // oxlint-disable-next-line react-doctor/no-array-index-as-key -- A sent message's parts never change.
                      key={index}
                      className="whitespace-pre-wrap"
                      data-slot="model-part"
                      data-type="text"
                    >
                      {part.text}
                    </p>
                  );
                }
                if (part.type !== 'file') return null;

                return (
                  <div
                    // oxlint-disable-next-line react-doctor/no-array-index-as-key -- A sent message's parts never change.
                    key={index}
                    className="flex min-w-0 items-center gap-2 font-mono text-xs text-muted-foreground"
                    data-filename={part.filename}
                    data-media-type={part.mediaType}
                    data-slot="model-part"
                    data-type="file"
                  >
                    <FileTextIcon className="size-4 shrink-0" />
                    <span className="shrink-0">{part.filename}</span>
                    <span className="truncate" data-slot="model-part-data">
                      {typeof part.data === 'string' ? part.data : null}
                    </span>
                  </div>
                );
              })
            ) : (
              <p className="whitespace-pre-wrap">
                {message.parts.map((part) =>
                  part.type === 'text' ? part.text : null
                )}
              </p>
            )}
          </li>
        ))}
      </ol>
      <form
        data-status={status}
        onSubmit={(event) => {
          event.preventDefault();
          if (!canSend) return;

          const attached = new DataTransfer();

          for (const { file } of files) attached.items.add(file);
          setText('');
          setFiles([]);
          setSending(true);
          void convertFileListToFileUIParts(attached.files)
            .then((parts) => sendMessage({ files: parts, text }))
            .finally(() => setSending(false));
        }}
      >
        <input
          ref={inputRef}
          className="sr-only"
          multiple
          tabIndex={-1}
          type="file"
          onChange={(event) => {
            addFiles(Array.from(event.target.files ?? []));
            event.target.value = '';
          }}
        />
        <InputGroup>
          {files.length > 0 && (
            <InputGroupAddon align="block-start" className="flex-wrap">
              {files.map(({ file, id }) => (
                <span
                  key={id}
                  className="flex items-center gap-1.5 rounded-md border py-0.5 pr-0.5 pl-2 text-xs text-foreground"
                  data-filename={file.name}
                  data-slot="attachment"
                >
                  <FileTextIcon />
                  {file.name}
                  <InputGroupButton
                    aria-label={`Remove ${file.name}`}
                    size="icon-xs"
                    onClick={() =>
                      setFiles((current) =>
                        current.filter((item) => item.id !== id)
                      )
                    }
                  >
                    <XIcon />
                  </InputGroupButton>
                </span>
              ))}
            </InputGroupAddon>
          )}
          <PromptEditor
            value={text}
            onChange={setText}
            items={mentionItems}
            placeholder="Ask the agent to change your code..."
            onFiles={addFiles}
            className="p-3"
          />
          <InputGroupAddon align="block-end">
            <InputGroupButton
              aria-label="Attach files"
              className="rounded-full"
              size="icon-sm"
              variant="outline"
              onClick={() => inputRef.current?.click()}
            >
              <PlusIcon />
            </InputGroupButton>
            <InputGroupButton
              aria-label="Send"
              className="ml-auto rounded-full"
              disabled={!canSend}
              size="icon-sm"
              type="submit"
              variant="default"
            >
              <ArrowUpIcon />
            </InputGroupButton>
          </InputGroupAddon>
        </InputGroup>
      </form>
    </div>
  );
}
