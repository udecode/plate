import { getRenderElements } from '../../common/utils/getRenderElement';
import { AlignElement } from './components';
import {
  ALIGN_CENTER,
  ALIGN_LEFT,
  ALIGN_RIGHT,
  AlignRenderElementOptions,
} from './types';

export const renderElementAlign = ({
  typeAlignLeft = ALIGN_LEFT,
  typeAlignCenter = ALIGN_CENTER,
  typeAlignRight = ALIGN_RIGHT,
  component = AlignElement,
}: AlignRenderElementOptions = {}) => {
  const options = {
    component,
    typeAlignLeft,
    typeAlignCenter,
    typeAlignRight,
  };

  return getRenderElements([
    {
      type: typeAlignLeft,
      ...options,
    },
    {
      type: typeAlignCenter,
      ...options,
    },
    {
      type: typeAlignRight,
      ...options,
    },
  ]);
};
