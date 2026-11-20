'use client';

import { EditorRoot, useCreateEditor } from 'platejs/react';
import * as React from 'react';

import { DirectionProvider } from '@/components/ui/direction';
import {
  NativeSelect,
  NativeSelectOption,
} from '@/components/ui/native-select';
import {
  Editor,
  EditorContainer,
  EditorFrame,
} from '@/registry/components/editor/editor';
import { EditorKit } from '@/registry/components/editor/plugins';
import { rtlValues } from '@/registry/examples/values/rtl-value';

type Language = keyof typeof rtlValues;

const languages: Array<{ label: string; value: Language }> = [
  { label: 'English', value: 'en' },
  { label: 'Arabic (العربية)', value: 'ar' },
  { label: 'Hebrew (עברית)', value: 'he' },
];

export default function RtlDemo() {
  const [language, setLanguage] = React.useState<Language>('ar');
  const dir = language === 'en' ? 'ltr' : 'rtl';
  const editor = useCreateEditor(
    {
      plugins: EditorKit,
      initialValue: rtlValues[language],
    },
    [language]
  );

  return (
    <div className="flex flex-col">
      <div className="flex h-12 items-center border-b px-3">
        <NativeSelect
          aria-label="Language"
          className="w-44"
          size="sm"
          value={language}
          onChange={(event) => setLanguage(event.target.value as Language)}
        >
          {languages.map((option) => (
            <NativeSelectOption key={option.value} value={option.value}>
              {option.label}
            </NativeSelectOption>
          ))}
        </NativeSelect>
      </div>
      <DirectionProvider dir={dir}>
        <div dir={dir}>
          <EditorRoot editor={editor}>
            <EditorFrame className="h-[650px]">
              <EditorContainer>
                <Editor />
              </EditorContainer>
            </EditorFrame>
          </EditorRoot>
        </div>
      </DirectionProvider>
    </div>
  );
}
