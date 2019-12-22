import { useState } from 'react';
import { Range } from 'slate';

export const useMention = ({
  characters = [],
  maxSuggestions = 10,
}: {
  characters: string[];
  maxSuggestions: number;
}) => {
  const [target, setTarget] = useState<Range | null>();
  const [index, setIndex] = useState(0);
  const [search, setSearch] = useState('');
  const chars = characters
    .filter(c => c.toLowerCase().startsWith(search.toLowerCase()))
    .slice(0, maxSuggestions);

  return { target, setTarget, index, setIndex, search, setSearch, chars };
};
