import type { Editor } from '@/registry/components/editor/plugins.generated';

type Assert<T extends true> = T;
type AssertNever<T extends never> = T;
type EditorApiKeys = keyof Editor['api'];
type ExpectedEditorApiKeys =
  | 'ai'
  | 'aiChat'
  | 'audio'
  | 'comment'
  | 'csv'
  | 'debug'
  | 'details'
  | 'dom'
  | 'elementState'
  | 'file'
  | 'html'
  | 'image'
  | 'link'
  | 'list'
  | 'markdown'
  | 'mediaEmbed'
  | 'placeholder'
  | 'react'
  | 'suggestion'
  | 'table'
  | 'video';

type _EveryInstalledApiIsDiscoverable = AssertNever<
  Exclude<ExpectedEditorApiKeys, EditorApiKeys>
>;
type _NoPhantomApiKeys = AssertNever<
  Exclude<EditorApiKeys, ExpectedEditorApiKeys>
>;
type _KeysStayEnumerable = Assert<string extends EditorApiKeys ? false : true>;
type _SerializedLinkTypeIsNotAnApiKey = AssertNever<
  Extract<'a', EditorApiKeys>
>;
type _TableApiKeepsItsMethods = Assert<
  'getColumnCount' extends keyof Editor['api']['table'] ? true : false
>;
type _LinkApiKeepsItsMethods = Assert<
  'validateUrl' extends keyof Editor['api']['link'] ? true : false
>;
type _CsvApiKeepsItsMethods = Assert<
  'deserialize' extends keyof Editor['api']['csv'] ? true : false
>;
type _MediaApiKeepsItsMethods = Assert<
  'normalizeUrl' extends keyof Editor['api']['image'] ? true : false
>;
type _DomApiKeepsClipboardMethods = Assert<
  'insertData' extends keyof Editor['api']['dom']['clipboard'] ? true : false
>;
type _SuggestionApiKeepsItsMethods = Assert<
  'untracked' extends keyof Editor['api']['suggestion'] ? true : false
>;
