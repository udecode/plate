import type { Decoration } from '../deserializer';
import type { DeserializeMdOptions } from '../deserializer/deserializeMd';
import type { TMentionElement } from '../internal/types';
import type { MentionNode } from '../plugins/remarkMention';
import type { SerializeMdOptions } from '../serializer/serializeMd';
import type { TRules } from './types';

export const MENTION_RULE: TRules['mention'] = {
  deserialize: (
    node: MentionNode,
    deco: Decoration,
    options: DeserializeMdOptions
  ): TMentionElement => ({
    children: [{ text: '' }],
    type: 'mention',
    value: node.username,
  }),
  serialize: (node: TMentionElement, options: SerializeMdOptions) => ({
    type: 'text',
    value: `@${node.value.replaceAll(' ', '_')}`,
  }),
};
