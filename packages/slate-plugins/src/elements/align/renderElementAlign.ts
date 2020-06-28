import { getRenderElements } from '../../element/utils';
import { AlignElement } from './components';
import { ALIGN_CENTER, ALIGN_LEFT, ALIGN_RIGHT } from './types';

export const renderElementAlign = () =>
  getRenderElements([
    { type: ALIGN_LEFT, component: AlignElement },
    { type: ALIGN_CENTER, component: AlignElement },
    { type: ALIGN_RIGHT, component: AlignElement },
  ]);
