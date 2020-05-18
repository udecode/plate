import { DeserializeHtml } from 'common/types';
import { MARK_BOLD } from './types';

export const deserializeBold = ({
  typeBold = MARK_BOLD,
} = {}): DeserializeHtml => {
  const leaf = { [typeBold]: true };

  return {
    leaf: {
      SPAN: (el) =>
        ['600', '700', 'bold'].includes(el.style.fontWeight) && leaf,
      STRONG: () => leaf,
    },
  };
};
