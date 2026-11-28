import { BaseCodeBlockPlugin, BaseCodeHighlightPlugin } from 'platejs';
import { type EditorElementProps, EditorElement } from 'platejs/static';
import * as React from 'react';

import {
  codeSyntaxClassName,
  getCodeBlockLanguageLabel,
} from '@/registry/components/editor/code-block-languages';
import { createCodeBlockLowlight } from '@/registry/components/editor/code-block-lowlight';

export function CodeBlockElementStatic({
  showLanguageLabel = true,
  ...props
}: EditorElementProps<typeof BaseCodeBlockPlugin> & {
  showLanguageLabel?: boolean;
}) {
  const languageLabel = getCodeBlockLanguageLabel(props.element.language);

  return (
    <EditorElement
      className={`py-1 ${codeSyntaxClassName}`}
      {...props}
      attributes={{ ...props.attributes, dir: 'ltr' }}
    >
      <div className="relative rounded-md bg-muted/50">
        {showLanguageLabel && languageLabel && (
          <div
            className="absolute end-1 top-1 z-10 flex h-6 items-center px-2 text-xs text-muted-foreground select-none"
            contentEditable={false}
          >
            {languageLabel}
          </div>
        )}

        <pre className="overflow-x-auto p-8 pe-4 font-mono text-sm leading-[normal] [tab-size:2] print:break-inside-avoid">
          <code>{props.children}</code>
        </pre>
      </div>
    </EditorElement>
  );
}

const lowlight = createCodeBlockLowlight();

export const BaseCodeBlockKit = [
  BaseCodeBlockPlugin.configure({
    component: CodeBlockElementStatic,
  }),
  BaseCodeHighlightPlugin.configure({
    initialState: { lowlight },
  }),
];
