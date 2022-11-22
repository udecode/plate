import { EMOJI_ENDPOINT } from '../constants';

const fetchCache = {};

export const fetchEmojiData = async () => {
  if (fetchCache[EMOJI_ENDPOINT]) return fetchCache[EMOJI_ENDPOINT];

  const response = await fetch(EMOJI_ENDPOINT);
  const json = await response.json();
  fetchCache[EMOJI_ENDPOINT] = json;

  return json;
};
