import { commentBalloonToolbarFile } from './code-CommentBalloonToolbar';
import { myCommentsProviderFile } from './code-MyCommentsProvider';
import { constantsFile } from './code-constants';

export const commentsFiles = {
  ...commentBalloonToolbarFile,
  ...myCommentsProviderFile,
  ...constantsFile,
};
