import React from 'react';
import {
  findNodePath,
  getBlockAbove,
  getSuggestionId,
  getSuggestionUserId,
  MARK_SUGGESTION,
  StyledLeafProps,
  TSuggestionText,
  useSuggestionSelectors,
  useSuggestionUserById,
  Value,
} from '@udecode/plate';
import { cva } from 'class-variance-authority';

const suggestionLeafVariants = cva(
  'text-[--suggestion-primary-color] border-b-2 border-[--suggestion-primary-color] transition-colors',
  {
    variants: {
      isActive: {
        false: 'bg-[--suggestion-accent-color]',
        true: '',
      },
      isDeletion: {
        false: '',
        true:
          'line-through decoration-[--suggestion-primary-color] decoration-2',
      },
    },
  }
);
export const PlateSuggestionLeaf = <V extends Value = Value>({
  attributes,
  children,
  text,
  editor,
  nodeProps,
}: StyledLeafProps<V, TSuggestionText>) => {
  const activeSuggestionId = useSuggestionSelectors().activeSuggestionId();
  const userId = getSuggestionUserId(text);
  const user = useSuggestionUserById(userId);
  const isActive = activeSuggestionId === getSuggestionId(text);
  const isDeletion = Boolean(text.suggestionDeletion);

  const hue = user?.hue ?? 0;

  const blockAbove = getBlockAbove(editor, {
    at: findNodePath(editor, text),
    match: (n) => n[MARK_SUGGESTION],
  });
  if (blockAbove) return <>{children}</>;

  const Element = isDeletion ? 'del' : 'span';

  return (
    <Element
      {...attributes}
      {...nodeProps}
      className={suggestionLeafVariants({
        isActive,
        isDeletion: text.suggestionDeletion,
      })}
      style={{
        ['--suggestion-primary-color' as any]: `hsl(${hue}, 60%, 25%)`, // TW 800
        ['--suggestion-accent-color' as any]: `hsl(${hue}, 89%, 93%)`, // TW 100
      }}
    >
      {children}
    </Element>
  );
};
