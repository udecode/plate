import React from 'react';
import { getEmojiPickerPreviewStyles } from './EmojiPickerPreview.styles';
import {
  EmojiPickerPreviewProps,
  EmojiPreviewProps,
  NoEmojiPreviewProps,
  PickAnEmojiPreviewProps,
} from './EmojiPickerPreview.types';

const EmojiPreview = ({ emoji, ...props }: EmojiPreviewProps) => {
  const styles = getEmojiPickerPreviewStyles({ ...props });

  return (
    <div css={styles.root.css}>
      <div css={styles.emoji?.css}>{emoji?.skins[0].native}</div>
      <div css={styles.content?.css}>
        <div css={styles.title?.css}>{emoji?.name}</div>
        <div css={styles.subtitle?.css}>{`:${emoji?.id}:`}</div>
      </div>
    </div>
  );
};

const NoEmoji = ({ i18n, ...props }: NoEmojiPreviewProps) => {
  const styles = getEmojiPickerPreviewStyles({ ...props });

  return (
    <div css={styles.root.css}>
      <div css={styles.emoji?.css}>😢</div>
      <div css={styles.content?.css}>
        <div css={styles.title?.css}>{i18n.searchNoResultsTitle}</div>
        <div css={styles.subtitle?.css}>{i18n.searchNoResultsSubtitle}</div>
      </div>
    </div>
  );
};

const PickAnEmoji = ({ i18n, ...props }: PickAnEmojiPreviewProps) => {
  const styles = getEmojiPickerPreviewStyles({ ...props });

  return (
    <div css={styles.root.css}>
      <div css={styles.emoji?.css}>☝️</div>
      <div css={styles.content?.css}>
        <div css={styles.text?.css}>{i18n.pick}</div>
      </div>
    </div>
  );
};

export const EmojiPickerPreview = ({
  emoji,
  hasFound = true,
  isSearching = false,
  i18n,
  ...props
}: EmojiPickerPreviewProps) => {
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
};
