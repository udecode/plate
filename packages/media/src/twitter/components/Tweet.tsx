import React from 'react';
import { Tweet as PlateTweet } from 'react-tweet';

export type TweetProps = Readonly<{
  loadingComponent?: JSX.Element | string;
  onError?: (error: string) => void;
  onLoad?: () => void;
  tweetId: string;
  twitterTheme?: 'light' | 'dark';
}>;

export function Tweet({
  tweetId,
  onError,
  loadingComponent,
  twitterTheme = 'light',
}: TweetProps) {
  const theme = twitterTheme || 'light';
  return (
    <div data-theme={theme}>
      <PlateTweet id={tweetId} onError={onError} fallback={loadingComponent} />;
    </div>
  );
}
