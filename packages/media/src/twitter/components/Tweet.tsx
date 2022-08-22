import React, { useCallback, useEffect, useRef, useState } from 'react';

const WIDGET_SCRIPT_URL = 'https://platform.twitter.com/widgets.js';

declare global {
  interface Window {
    twttr: any;
  }
}

export type TweetProps = Readonly<{
  loadingComponent?: JSX.Element | string;
  onError?: (error: string) => void;
  onLoad?: () => void;
  tweetId: string;
}>;

export const Tweet = ({
  tweetId,
  onError,
  onLoad,
  loadingComponent,
}: TweetProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const containerRef = useRef(null);
  const previousTweetIDRef = useRef('');

  const createTweet = useCallback(async () => {
    try {
      await window.twttr.widgets.createTweet(tweetId, containerRef.current);

      setIsLoading(false);

      if (onLoad) {
        onLoad();
      }
    } catch (error) {
      if (onError) {
        onError(String(error));
      }
    }
  }, [onError, onLoad, tweetId]);

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
