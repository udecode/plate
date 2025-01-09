import type { Editor, LegacyEditorMethods } from '../interfaces';

const LEGACY_TRANSFORMS = new Set([
  'addMark',
  'apply',
  'blur',
  'collapse',
  'delete',
  'deleteBackward',
  'deleteForward',
  'deleteFragment',
  'deselect',
  'deselectDOM',
  'focus',
  'insertBreak',
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
  'normalizeNode',
  'redo',
  'removeMark',
  'removeNodes',
  'select',
  'setFragmentData',
  'setNodes',
  'setPoint',
  'setSelection',
  'setSplittingOnce',
  'splitNodes',
  'undo',
  'unsetNodes',
  'unwrapNodes',
  'withMerging',
  'withNewBatch',
  'withoutMerging',
  'withoutNormalizing',
  'withoutSaving',
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
  'findDocumentOrShadowRoot',
  'findEventRange',
  'findKey',
  'findPath',
  'first',
  'fragment',
  'getDirtyPaths',
  'getFragment',
  'getMarks',
  'getWindow',
  'hasBlocks',
  'hasDOMNode',
  'hasEditableTarget',
  'hasInlines',
  'hasPath',
  'hasRange',
  'hasSelectableTarget',
  'hasTarget',
  'hasTexts',
  'highestBlock',
  'isBlock',
  'isComposing',
  'isEdge',
  'isElementReadOnly',
  'isEmpty',
  'isEnd',
  'isFocused',
  'isInline',
  'isMerging',
  'isNormalizing',
  'isReadOnly',
  'isSaving',
  'isSelectable',
  'isSplittingOnce',
  'isStart',
  'isTargetInsideNonReadonlyVoid',
  'isVoid',
  'last',
  'leaf',
  'levels',
  'markableVoid',
  // 'marks',
  'next',
  'node',
  'nodes',
  'normalize',
  'onChange',
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
  'toDOMNode',
  'toDOMPoint',
  'toDOMRange',
  'toSlateNode',
  'toSlatePoint',
  'toSlateRange',
  'unhangRange',
  'void',
]);

export const assignLegacyTransforms = (editor: Editor, transforms: any) => {
  if (!transforms) return;

  const e = editor as Editor & LegacyEditorMethods;

  const legacyTransforms = Object.entries(transforms).reduce(
    (acc, [key, value]) => {
      if (LEGACY_TRANSFORMS.has(key)) {
        acc[key] = value;
      }

      return acc;
    },
    {} as Record<string, any>
  );

  Object.assign(e, legacyTransforms);
};

export const assignLegacyApi = (editor: Editor, api: any) => {
  if (!api) return;

  const e = editor as Editor & LegacyEditorMethods;

  const legacyApi = Object.entries(api).reduce(
    (acc, [key, value]) => {
      if (LEGACY_API.has(key)) {
        acc[key] = value;
      }

      return acc;
    },
    {} as Record<string, any>
  );

  Object.assign(e, legacyApi);

  if (api.marks) {
    e.getMarks = api.marks;
  }
};

/**
 * Assigns editor's legacy methods to editor.api and editor.tf.
 *
 * NOTE: can't use yet because of recursion issues
 */
export const syncLegacyMethods = (editor: Editor) => {
  const e = editor as Editor & LegacyEditorMethods;

  // Assign to editor.api
  LEGACY_API.forEach((key) => {
    if (e[key]) {
      if (key === 'getMarks') {
        // Special case for marks
        (e.api as any).marks = e.getMarks;
      } else {
        (e.api as any)[key] = e[key];
      }
    }
  });

  // Assign to editor.tf
  LEGACY_TRANSFORMS.forEach((key) => {
    if (e[key]) {
      (e.tf as any)[key] = e[key];
    }
  });
};
