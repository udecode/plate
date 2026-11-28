import type { DocumentChange } from '../core/change/document-change';
import type { NodeList } from '../core/change/document-index';
import type { JsonRecord } from '../core/change/json';
import type { JsonEditorValue, JsonNode } from '../core/change/tokens';
import { getEditorSchema } from '../core/editor-runtime';
import { constructCanonicalDocumentChange } from '../core/representation';
import type { Descendant, Element } from '../interfaces';
import type { AnyEditor, EditorDocumentValue } from '../interfaces/editor';
import { ElementApi } from '../interfaces/element';

export const historyReplaySchemaOf = (editor: AnyEditor) => {
  const schema = getEditorSchema(editor);

  return {
    allows: (
      key: string,
      path: readonly number[],
      root: string,
      value: JsonEditorValue
    ) =>
      schema.isTextPropertyAllowedAt(
        key,
        [...path],
        root,
        value as EditorDocumentValue
      ),
    canContain: (parent: JsonNode, child: JsonNode) =>
      ElementApi.isElement(parent) &&
      schema.canContain(parent, child as Descendant),
    canonicalize: (
      properties: JsonRecord,
      path: readonly number[],
      root: string,
      key: string,
      value: JsonEditorValue
    ) =>
      schema.canonicalizeTextPropertiesAt(
        properties,
        [...path],
        root,
        key,
        value as EditorDocumentValue
      ),
    isSetValued: schema.isSetValuedProperty,
    lines: {
      isInline: (node: JsonNode) =>
        ElementApi.isElement(node) && schema.isInline(node),
      isVoid: (node: JsonNode) =>
        ElementApi.isElement(node) && schema.isVoid(node),
      splitProps: (
        node: JsonNode,
        ancestors: readonly JsonNode[],
        root: string
      ) =>
        ElementApi.isElement(node)
          ? {
              ...schema.elementPropertiesForSplitUnder(
                node,
                ancestors as readonly Element[],
                root
              ),
              type: node.type,
            }
          : {},
    },
    pieceProps: (
      node: JsonNode,
      path: readonly number[],
      root: string,
      nodes: NodeList
    ) =>
      ElementApi.isElement(node)
        ? {
            ...schema.elementPropertiesForSplitAt(
              node,
              [...path],
              root,
              nodes as NodeList<Descendant>
            ),
            type: node.type,
          }
        : {},
    repairCanonical: (
      before: JsonEditorValue,
      change: DocumentChange,
      after: JsonEditorValue
    ) =>
      constructCanonicalDocumentChange(editor, after, change, {
        before,
        displacement: 'none',
      }),
  };
};

export type HistoryReplaySchema = ReturnType<typeof historyReplaySchemaOf>;
