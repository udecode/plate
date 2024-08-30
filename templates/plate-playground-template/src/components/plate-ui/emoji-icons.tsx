import {
  AppleIcon,
  ClockIcon,
  CompassIcon,
  DeleteIcon,
  FlagIcon,
  LeafIcon,
  LightbulbIcon,
  MusicIcon,
  SearchIcon,
  SmileIcon,
  StarIcon,
} from 'lucide-react';

import type React from 'react';
import type { EmojiCategoryList } from '@udecode/plate-emoji';

export const emojiCategoryIcons: Record<
  EmojiCategoryList,
  { outline: React.ReactElement; solid: React.ReactElement }
> = {
  activity: {
    outline: (
      <svg
        className="size-full"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="12" cy="12" r="10" />
        <path d="M2.1 13.4A10.1 10.1 0 0 0 13.4 2.1" />
        <path d="m5 4.9 14 14.2" />
        <path d="M21.9 10.6a10.1 10.1 0 0 0-11.3 11.3" />
      </svg>
    ),
    // Needed to add another solid variant - outline will be used for now
    solid: (
      <svg
        className="size-full"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="12" cy="12" r="10" />
        <path d="M2.1 13.4A10.1 10.1 0 0 0 13.4 2.1" />
        <path d="m5 4.9 14 14.2" />
        <path d="M21.9 10.6a10.1 10.1 0 0 0-11.3 11.3" />
      </svg>
    ),
  },

  custom: {
    outline: <StarIcon className="size-full" />,
    // Needed to add another solid variant - outline will be used for now
    solid: <StarIcon className="size-full" />,
  },

  flags: {
    outline: <FlagIcon className="size-full" />,
    // Needed to add another solid variant - outline will be used for now
    solid: <FlagIcon className="size-full" />,
  },

  foods: {
    outline: <AppleIcon className="size-full" />,
    // Needed to add another solid variant - outline will be used for now
    solid: <AppleIcon className="size-full" />,
  },

  frequent: {
    outline: <ClockIcon className="size-full" />,
    // Needed to add another solid variant - outline will be used for now
    solid: <ClockIcon className="size-full" />,
  },

  nature: {
    outline: <LeafIcon className="size-full" />,
    // Needed to add another solid variant - outline will be used for now
    solid: <LeafIcon className="size-full" />,
  },

  objects: {
    outline: <LightbulbIcon className="size-full" />,
    // Needed to add another solid variant - outline will be used for now
    solid: <LightbulbIcon className="size-full" />,
  },

  people: {
    outline: <SmileIcon className="size-full" />,
    // Needed to add another solid variant - outline will be used for now
    solid: <SmileIcon className="size-full" />,
  },

  places: {
    outline: <CompassIcon className="size-full" />,
    // Needed to add another solid variant - outline will be used for now
    solid: <CompassIcon className="size-full" />,
  },

  symbols: {
    outline: <MusicIcon className="size-full" />,
    // Needed to add another solid variant - outline will be used for now
    solid: <MusicIcon className="size-full" />,
  },
};

export const emojiSearchIcons = {
  delete: <DeleteIcon className="size-4" />,

  loupe: <SearchIcon className="size-4" />,
};
