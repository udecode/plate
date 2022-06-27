import { markBallonToolbarFile } from './code-MarkBallonToolbar';
import { balloonToolbarValueFile } from './code-balloonToolbarValue';
import { indexFile } from './code-index';

export const balloonToolbarFiles = {
  ...markBallonToolbarFile,
  ...balloonToolbarValueFile,
  ...indexFile,
};
