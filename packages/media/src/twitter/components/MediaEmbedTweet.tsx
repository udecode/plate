import React from 'react';
import { EmbedUrlData } from '../../media/index';
import { Tweet, TweetProps } from '../index';

export const useMediaEmbedTweet = ({
  id,
  ...props
}: EmbedUrlData): TweetProps => {
  return {
    tweetId: id!,
    ...props,
  };
};

export function MediaEmbedTweet(props: EmbedUrlData) {
  const htmlProps = useMediaEmbedTweet(props);

  return <Tweet {...htmlProps} />;
}
