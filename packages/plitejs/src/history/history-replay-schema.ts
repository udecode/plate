import type { DocumentChange } from '../core/change/document-change';
import type { NodeList } from '../core/change/document-index';
import type { JsonRecord } from '../core/change/json';
import type { ReadBack } from '../core/change/read-back';
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
    validateChildren: (
      children: readonly JsonNode[],
      root: string,
      ancestors: readonly JsonNode[]
    ) => {
      try {
        schema.validateChildrenAt(
          children as readonly Descendant[],
          root,
          ancestors as readonly Element[]
        );

        return true;
      } catch {
        return false;
      }
    },
  };
};

export type HistoryReplaySchema = ReturnType<typeof historyReplaySchemaOf>;

export const replayTransformOptions = (
  schema: HistoryReplaySchema,
  rules: Readonly<{
    anchor: boolean;
    carriesLift?: boolean;
    readBack: (ReadBack & { projected: boolean }) | null;
  }>
) => ({
  isSetValued: schema.isSetValued,
  keepRecordWrites: true,
  replay: {
    anchor: rules.anchor,
    canContain: schema.canContain,
    carriesLift: rules.carriesLift,
    pieceProps: (
      element: JsonNode,
      parent: readonly number[],
      root: string,
      nodes: NodeList
    ) => schema.pieceProps(element, [...parent, 0], root, nodes),
    readBack: rules.readBack,
    validateChildren: schema.validateChildren,
  },
});
