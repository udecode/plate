import React, { useCallback, useEffect, useRef, useState } from 'react';

const WIDGET_SCRIPT_URL = 'https://platform.twitter.com/widgets.js';

const hasScriptInserted = () =>
  document.querySelector(`script[src="${WIDGET_SCRIPT_URL}"]`);

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
      // @ts-expect-error Twitter is attached to the window.
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
      setIsLoading(true);

      if (!hasScriptInserted()) {
        const script = document.createElement('script');
        script.src = WIDGET_SCRIPT_URL;
        script.async = true;
        document.body?.appendChild(script);
        script.onload = createTweet;
        script.onerror = onError || console.error;
      } else {
        createTweet();
      }

      if (previousTweetIDRef) {
        previousTweetIDRef.current = tweetId;
      }
    }
  }, [createTweet, onError, onLoad, tweetId]);

  return (
    <>
      {isLoading ? loadingComponent : null}
      <div key={tweetId} ref={containerRef} />
    </>
  );
};
