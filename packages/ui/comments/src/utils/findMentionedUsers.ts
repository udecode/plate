import { emailRegexExpression } from './constants';

export const findMentionedUsers = (commentText: string): string[] => {
  const mentionedUserIdentifiers: string[] = [];
  const mentionRegExp = new RegExp(`@(${emailRegexExpression})\\b`, 'g');
  let match: RegExpExecArray | null;
  // eslint-disable-next-line no-cond-assign
  while ((match = mentionRegExp.exec(commentText))) {
    const [, mentionedUser] = match;
    mentionedUserIdentifiers.push(mentionedUser);
  }
  return mentionedUserIdentifiers;
};
