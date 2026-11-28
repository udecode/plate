'use client';

import { CodeHighlightPlugin } from 'platejs/react';

import {
  CodeBlockContainer,
  type CodeBlockElementProps,
  createCodeBlockPlugin,
} from '@/registry/components/editor/code-block-container';
import { createCodeBlockLowlight } from '@/registry/components/editor/code-block-lowlight';

export function CodeBlockElement({
  addon,
  showLanguageLabel = true,
  ...props
}: CodeBlockElementProps) {
  return (
    <CodeBlockContainer
      addon={addon}
      elementProps={props}
      showLanguageLabel={showLanguageLabel}
    >
      <pre className="overflow-x-auto p-8 pe-4 font-mono text-sm leading-[normal] [tab-size:2] print:break-inside-avoid">
        <code>{props.children}</code>
      </pre>
    </CodeBlockContainer>
  );
}

const lowlight = createCodeBlockLowlight();

export const CodeBlockKit = [
  createCodeBlockPlugin(CodeBlockElement),
  CodeHighlightPlugin.configure({
    initialState: { lowlight },
  }),
];
