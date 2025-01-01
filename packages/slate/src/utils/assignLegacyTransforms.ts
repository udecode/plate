import type { TEditor } from '../interfaces';

const LEGACY_TRANSFORMS = new Set([
  'addMark',
  'apply',
  'collapse',
  'delete',
  // 'deleteBackward',
  // 'deleteForward',
  'deleteFragment',
  'deselect',
  'focus',
  'insertBreak',
  // 'normalizeNode',
  'insertData',
  'insertFragment',
  'insertFragmentData',
  'insertNode',
  'insertNodes',
  'insertSoftBreak',
  'insertText',
  'insertTextData',
  'liftNodes',
  'mergeNodes',
  'move',
  'moveNodes',
  'normalize',
  'redo',
  'removeMark',
  'removeNodes',
  'select',
  'setFragmentData',
  'setNodes',
  'setPoint',
  'setSelection',
  'splitNodes',
  'undo',
  'unsetNodes',
  'unwrapNodes',
  'withoutNormalizing',
  'wrapNodes',
  'writeHistory',
]);

const LEGACY_API = new Set([
  'above',
  'after',
  'before',
  'edges',
  'elementReadOnly',
  'end',
  'first',
  'fragment',
  'getDirtyPaths',
  'getFragment',
  'getMarks',
  'hasBlocks',
  'hasInlines',
  'hasPath',
  'hasTexts',
  'isBlock',
  'isEdge',
  'isElementReadOnly',
  'isEmpty',
  'isEnd',
  'isInline',
  'isNormalizing',
  'isSelectable',
  'isStart',
  'isVoid',
  'last',
  'leaf',
  'levels',
  // 'markableVoid',
  'marks',
  'next',
  'node',
  'nodes',
  'normalize',
  'operations',
  'parent',
  'path',
  'pathRef',
  'pathRefs',
  'point',
  'pointRef',
  'pointRefs',
  'positions',
  'previous',
  'range',
  'rangeRef',
  'rangeRefs',
  'selection',
  'setNormalizing',
  'shouldMergeNodesRemovePrevNode',
  'shouldNormalize',
  'start',
  'string',
  'unhangRange',
  'void',
]);

export const assignLegacyTransforms = (editor: TEditor, transforms: any) => {
  const legacyTransforms = Object.entries(transforms).reduce(
    (acc, [key, value]) => {
      if (LEGACY_TRANSFORMS.has(key)) {
        acc[key] = value;
      }

      return acc;
    },
    {} as Record<string, any>
  );

  Object.assign(editor, legacyTransforms);
};

export const assignLegacyApi = (editor: TEditor, api: any) => {
  const { marks, ...apiToMerge } = api;

  const legacyApi = Object.entries(apiToMerge).reduce(
    (acc, [key, value]) => {
      if (LEGACY_API.has(key)) {
        acc[key] = value;
      }

      return acc;
    },
    {} as Record<string, any>
  );

  Object.assign(editor, legacyApi);

  if (marks) {
    editor.getMarks = marks;
  }
};
