import React from 'react';

import { render } from '@testing-library/react';

import { withProviders } from './withProviders';

describe('withProviders', () => {
  it('wraps components with providers and forwards provider props', () => {
    const FirstContext = React.createContext('');
    const SecondContext = React.createContext('');

    const FirstProvider = ({
      children,
      value,
    }: {
      children: React.ReactNode;
      value: string;
    }) => (
      <FirstContext.Provider value={value}>{children}</FirstContext.Provider>
    );

    const SecondProvider = ({
      children,
      value,
    }: {
      children: React.ReactNode;
      value: string;
    }) => (
      <SecondContext.Provider value={value}>{children}</SecondContext.Provider>
    );

    const View = () => {
      const first = React.useContext(FirstContext);
      const second = React.useContext(SecondContext);

      return <div>{`${first}-${second}`}</div>;
    };

    const Wrapped = withProviders(
      [FirstProvider, { value: 'outer' }],
      [SecondProvider, { value: 'inner' }]
    )(View);

    const { getByText } = render(<Wrapped />);

    expect(document.body.contains(getByText('outer-inner'))).toBe(true);
  });
});
