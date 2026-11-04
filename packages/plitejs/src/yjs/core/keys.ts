const RESERVED_YJS_KEY_PREFIX = 'yjs:';

export const YJS_HIDDEN_KEY = 'yjs:hidden';
export const YJS_NODE_ID_KEY = 'yjs:id';
export const YJS_VIRTUAL_CHILD_ID_KEY = 'yjs:virtual-child-id';
export const YJS_VIRTUAL_PLACEHOLDER_KEY = 'yjs:virtual-placeholder';
export const YJS_JOINED_AFTER_KEY = 'yjs:joined-after';
export const YJS_JOINED_BEFORE_KEY = 'yjs:joined-before';
export const YJS_JOINED_END_KEY = 'yjs:joined-end';
export const YJS_SET_VALUE_KEY_PREFIX = 'yjs:set:';
export const YJS_SET_EDIT_KEY_PREFIX = 'yjs:set-edit:';
export const YJS_MARK_KEY_PREFIX = 'yjs:mark:';
export const YJS_CUT_KEY = 'yjs:cut';
export const YJS_CUT_SOURCE_KEY = 'yjs:cut-source';
export const YJS_CUT_AT_KEY = 'yjs:cut-at';

export const isYjsMarkRecordKey = (key: string): boolean =>
  key.startsWith(YJS_MARK_KEY_PREFIX);

export const YJS_CHILD_VISIBILITY_KEYS: ReadonlySet<string> = new Set([
  YJS_HIDDEN_KEY,
  YJS_VIRTUAL_CHILD_ID_KEY,
  YJS_VIRTUAL_PLACEHOLDER_KEY,
  YJS_JOINED_AFTER_KEY,
  YJS_JOINED_BEFORE_KEY,
  YJS_JOINED_END_KEY,
]);

export const YJS_ELEMENT_NODE_NAME = 'element';

export const DEFAULT_YJS_ROOT_NAME = 'document';

export const isReservedYjsKey = (key: string): boolean =>
  key.startsWith(RESERVED_YJS_KEY_PREFIX);
