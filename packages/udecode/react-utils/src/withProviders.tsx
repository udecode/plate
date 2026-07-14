import React from 'react';

type ProviderEntry =
  | React.ElementType
  | readonly [React.ElementType, Record<string, unknown>];

const isProviderWithProps = (
  provider: ProviderEntry
): provider is readonly [React.ElementType, Record<string, unknown>] =>
  Array.isArray(provider);

/**
 * Wrap a component into multiple providers. If there are any props that you
 * want a provider to receive, you can simply pass an array.
 */
export const withProviders =
  (...providers: ProviderEntry[]) =>
  <T extends object>(WrappedComponent: React.ComponentType<T>) =>
  (props: T) =>
    providers.reduceRight<React.ReactNode>(
      (children, provider) => {
        if (isProviderWithProps(provider)) {
          const [Provider, providerProps] = provider;

          return React.createElement(Provider, providerProps, children);
        }

        return React.createElement(provider, undefined, children);
      },
      <WrappedComponent {...props} />
    );
