import React from 'react';

import type { TCaptionElement } from 'platejs';

import { useElement } from 'platejs/react';

import { stringifyCaption } from '../../lib/stringifyCaption';

export const useCaptionString = () => {
  const { caption: nodeCaption } = useElement<TCaptionElement>();

  return React.useMemo(() => stringifyCaption(nodeCaption), [nodeCaption]);
};
