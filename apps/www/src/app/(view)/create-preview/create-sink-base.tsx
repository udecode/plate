'use client';

import { CommentsPlugin } from 'platejs/comments/react';

import { BasicMarksKit } from '@/__registry__/create-preview/base/editor-ai/components/editor/basic-marks';
import { CodeBlockKit } from '@/__registry__/create-preview/base/editor-ai/components/editor/code-block';
import { DiscussionKit } from '@/__registry__/create-preview/base/editor-ai/components/editor/discussion';
import { Editor } from '@/__registry__/create-preview/base/editor-ai/components/editor/editor';
import {
  FixedToolbar,
  FixedToolbarButtons,
} from '@/__registry__/create-preview/base/editor-ai/components/editor/fixed-toolbar';
import { FloatingToolbarButtons } from '@/__registry__/create-preview/base/editor-ai/components/editor/floating-toolbar';
import { EditorKit } from '@/__registry__/create-preview/base/editor-ai/components/editor/plugins';
import { SuggestionKit } from '@/__registry__/create-preview/base/editor-ai/components/editor/suggestion';
import { TableKit } from '@/__registry__/create-preview/base/editor-ai/components/editor/table';
import { Toolbar } from '@/__registry__/create-preview/base/editor-ai/components/editor/toolbar';
import { TooltipProvider } from '@/__registry__/create-preview/base/editor-ai/components/ui/tooltip';

import { CreateSink, type CreateSinkKit } from './create-sink';

const BASE_SINK_KIT: CreateSinkKit = {
  codePlugins: [...CodeBlockKit],
  docPlugins: [
    ...EditorKit.filter(
      (plugin) =>
        plugin.name !== 'fixedToolbar' && plugin.name !== 'floatingToolbar'
    ),
    ...DiscussionKit,
    CommentsPlugin,
  ],
  Editor,
  FixedToolbar,
  FixedToolbarButtons,
  FloatingToolbarButtons,
  suggestionPlugins: [...SuggestionKit],
  tablePlugins: [...BasicMarksKit, ...TableKit],
  Toolbar,
  TooltipProvider,
};

export default function CreateSinkBase() {
  return <CreateSink kit={BASE_SINK_KIT} />;
}
