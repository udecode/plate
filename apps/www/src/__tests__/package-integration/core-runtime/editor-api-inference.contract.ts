import type { MyEditor } from '@/registry/components/editor/editor-kit';

type Assert<T extends true> = T;
type AssertNever<T extends never> = T;
type EditorApiKeys = keyof MyEditor['api'];
type ExpectedEditorApiKeys =
  | 'ai'
  | 'aiChat'
  | 'audio'
  | 'blockMenu'
  | 'blockSelection'
  | 'clipboard'
  | 'comment'
  | 'csv'
  | 'cursorOverlay'
  | 'debug'
  | 'dom'
  | 'file'
  | 'footnote'
  | 'html'
  | 'img'
  | 'isElementStateEmpty'
  | 'link'
  | 'list'
  | 'markdown'
  | 'mediaEmbed'
  | 'placeholder'
  | 'react'
  | 'suggestion'
  | 'table'
  | 'toggle'
  | 'video';

type _EveryInstalledApiIsDiscoverable = Assert<
  ExpectedEditorApiKeys extends EditorApiKeys ? true : false
>;
type _NoPhantomApiKeys = AssertNever<
  Exclude<EditorApiKeys, ExpectedEditorApiKeys>
>;
type _KeysStayEnumerable = Assert<string extends EditorApiKeys ? false : true>;
type _SerializedLinkTypeIsNotAnApiKey = AssertNever<
  Extract<'a', EditorApiKeys>
>;
type _TableApiKeepsItsMethods = Assert<
  'getColumnCount' extends keyof MyEditor['api']['table'] ? true : false
>;
type _LinkApiKeepsItsMethods = Assert<
  'validateUrl' extends keyof MyEditor['api']['link'] ? true : false
>;
type _CsvApiKeepsItsMethods = Assert<
  'deserialize' extends keyof MyEditor['api']['csv'] ? true : false
>;
type _MediaApiKeepsItsMethods = Assert<
  'normalizeUrl' extends keyof MyEditor['api']['img'] ? true : false
>;
type _SuggestionApiKeepsItsMethods = Assert<
  'untracked' extends keyof MyEditor['api']['suggestion'] ? true : false
>;
