import castArray from 'lodash/castArray';

import { AutoformatRule, MatchRange } from '../types';

export const getMatchRange = ({
  match,
  trigger,
}: {
  match: string | MatchRange;
  trigger: AutoformatRule['trigger'];
}) => {
  let start: string;
  let end: string;

  if (typeof match === 'object') {
    start = match.start;
    end = match.end;
  } else {
    start = match;
    end = start.split('').reverse().join('');
  }

  const triggers: string[] = trigger ? castArray(trigger) : [end.slice(-1)];

  end = trigger ? end : end.slice(0, -1);

  return {
    start,
    end,
    triggers,
  };
};
