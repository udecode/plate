import React, { useCallback, useEffect, useRef, useState } from 'react';

const WIDGET_SCRIPT_URL = 'https://platform.twitter.com/widgets.js';

declare global {
  interface Window {
    twttr: any;
  }
}

type TwitterEmbedOptions = {
  cards?: 'hidden';
  theme?: 'dark' | 'light';
};

export type TweetProps = Readonly<{
  loadingComponent?: JSX.Element | string;
  onError?: (error: string) => void;
  onLoad?: () => void;
  tweetId: string;
  twitterOptions?: TwitterEmbedOptions;
}>;

export const Tweet = ({
  tweetId,
  onError,
  onLoad,
  loadingComponent,
  twitterOptions = {},
}: TweetProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const containerRef = useRef(null);
  const previousTweetIDRef = useRef('');
  const { cards, theme } = twitterOptions;

  const createTweet = useCallback(async () => {
    try {
      await window.twttr.widgets.createTweet(tweetId, containerRef.current, {
        cards,
        theme,
      });

      setIsLoading(false);

      if (onLoad) {
        onLoad();
      }
    } catch (error) {
      if (onError) {
        onError(String(error));
      }
    }
  }, [onError, onLoad, tweetId, cards, theme]);

  useEffect(() => {
    if (tweetId !== previousTweetIDRef.current) {
      let isComponentMounted = true;
      const script = require('scriptjs');
      script(WIDGET_SCRIPT_URL, 'twitter-embed', () => {
        if (!window.twttr) {
          return console.error('Failure to load window.twttr.');
        }

        if (isComponentMounted) createTweet();
      });

      if (previousTweetIDRef) {
        previousTweetIDRef.current = tweetId;
      }

      return () => {
        isComponentMounted = false;
      };
    }
  }, [createTweet, onError, onLoad, tweetId]);

  return (
    <>
      {isLoading ? loadingComponent : null}
      <div key={tweetId} ref={containerRef} />
    </>
  );
};
