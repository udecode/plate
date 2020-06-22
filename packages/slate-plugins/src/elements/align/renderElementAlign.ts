import { getRenderElements } from '../../element/utils';
import { AlignElement } from './components/AlignElement';
import { CENTER, LEFT, RIGHT } from './types';

export const renderElementAlign = () =>
  getRenderElements([
    { type: LEFT, component: AlignElement },
    { type: CENTER, component: AlignElement },
    { type: RIGHT, component: AlignElement },
  ]);
