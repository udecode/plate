import { AIChatPlugin } from '../../ai-chat';

export const getAIReviewCommentKey = () => {
  return `comment_${AIChatPlugin.key}`;
};
