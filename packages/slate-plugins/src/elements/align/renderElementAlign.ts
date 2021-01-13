import { getRenderElements } from '../../common/utils/getRenderElement';
import { setDefaults } from '../../common/utils/setDefaults';
import { DEFAULTS_ALIGN } from './defaults';
import { AlignRenderElementOptions } from './types';

export const renderElementAlign = (options?: AlignRenderElementOptions) => {
  const { align_left, align_center, align_right, align_justify } = setDefaults(
    options,
    DEFAULTS_ALIGN
  );

  return getRenderElements([
    { ...align_left },
    align_center,
    align_right,
    align_justify,
  ]);
};
