import React, { FunctionComponent } from 'react';

/**
 * Wrap a component into multiple providers.
 * If there are any props that you want a provider to receive,
 * you can simply pass an array.
 */
export const withProviders =
  (...providers: any[]) =>
  <T,>(WrappedComponent: FunctionComponent<T>) =>
  (props: T) =>
    providers.reduceRight(
      (acc, prov) => {
        let Provider = prov;
        if (Array.isArray(prov)) {
          [Provider] = prov;
          return <Provider {...prov[1]}>{acc}</Provider>;
        }

        return <Provider>{acc}</Provider>;
      },
      <WrappedComponent {...(props as any)} />
    );
