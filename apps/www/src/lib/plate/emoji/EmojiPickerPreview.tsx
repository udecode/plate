import React from 'react';
import { UseEmojiPickerType } from '@udecode/plate-emoji';

export type EmojiPickerPreviewProps = Pick<
  UseEmojiPickerType,
  'emoji' | 'hasFound' | 'isSearching' | 'i18n'
>;

export type EmojiPreviewProps = Pick<UseEmojiPickerType, 'emoji'>;

export type NoEmojiPreviewProps = Pick<UseEmojiPickerType, 'i18n'>;
export type PickAnEmojiPreviewProps = NoEmojiPreviewProps;

function EmojiPreview({ emoji }: EmojiPreviewProps) {
  return (
    <div className="flex items-center border-t border-gray-100 p-2">
      <div className="flex items-center justify-center text-3xl">
        {emoji?.skins[0].native}
      </div>
      <div className="overflow-hidden pl-2">
        <div className="truncate text-sm text-gray-600">{emoji?.name}</div>
        <div className="truncate text-xs text-muted-foreground">{`:${emoji?.id}:`}</div>
      </div>
    </div>
  );
}

function NoEmoji({ i18n }: NoEmojiPreviewProps) {
  return (
    <div className="flex items-center border-t border-gray-100 p-2">
      <div className="flex items-center justify-center text-3xl">😢</div>
      <div className="overflow-hidden pl-2">
        <div className="truncate text-sm text-gray-600">
          {i18n.searchNoResultsTitle}
        </div>
        <div className="truncate text-xs text-muted-foreground">
          {i18n.searchNoResultsSubtitle}
        </div>
      </div>
    </div>
  );
}

function PickAnEmoji({ i18n }: PickAnEmojiPreviewProps) {
  return (
    <div className="flex items-center border-t border-gray-100 p-2">
      <div className="flex items-center justify-center text-3xl">☝️</div>
      <div className="overflow-hidden pl-2">
        <div className="truncate text-lg text-muted-foreground">
          {i18n.pick}
        </div>
      </div>
    </div>
  );
}

export function EmojiPickerPreview({
  emoji,
  hasFound = true,
  isSearching = false,
  i18n,
  ...props
}: EmojiPickerPreviewProps) {
  const showPickEmoji = !emoji && !(isSearching && !hasFound);
  const showNoEmoji = isSearching && !hasFound;
  const showPreview = emoji;

  return (
    <>
      {showPreview && <EmojiPreview emoji={emoji} {...props} />}
      {showPickEmoji && <PickAnEmoji i18n={i18n} {...props} />}
      {showNoEmoji && <NoEmoji i18n={i18n} {...props} />}
    </>
  );
}
