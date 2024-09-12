import React from 'react';

import { render } from '@testing-library/react';

import { withHOC } from './withHOC';

/* eslint-disable react/display-name */
describe('withHOC', () => {
  type DummyRef = { myRef: string };
  type DummyProps = { myProp: string };

  const HOC = React.forwardRef<
    DummyRef,
    DummyProps & { children: React.ReactNode }
  >(({ children, ...props }, ref) => (
    <div>
      {JSON.stringify(props)}
      {JSON.stringify(ref)}
      {children}
    </div>
  ));

  const Component = React.forwardRef<DummyRef, DummyProps>((props, ref) => (
    <div>
      {JSON.stringify(props)}
      {JSON.stringify(ref)}
    </div>
  ));

  it('renders component with HOC', () => {
    const WithHOC = withHOC(HOC, Component);

    const { container } = render(<WithHOC myProp="component-prop" />);

    expect(container).toHaveTextContent('component-prop');
    expect(container).toMatchSnapshot();
  });

  it('renders component with HOC and HOC props', () => {
    const WithHOC = withHOC(HOC, Component, { myProp: 'hoc-prop' });

    const { container } = render(<WithHOC myProp="component-prop" />);

    expect(container).toHaveTextContent('hoc-prop');
    expect(container).toMatchSnapshot();
  });

  it('renders component with HOC and HOC ref', () => {
    const hocRef = { current: { myRef: 'hoc-ref' } };
    const WithHOC = withHOC(HOC, Component, undefined, hocRef);

    const { container } = render(<WithHOC myProp="component-prop" />);

    expect(container).toHaveTextContent('hoc-ref');
    expect(container).toMatchSnapshot();
  });

  it('renders component with HOC and component ref', () => {
    const componentRef = { current: { myRef: 'component-ref' } };
    const WithHOC = withHOC(HOC, Component);

    const { container } = render(
      <WithHOC ref={componentRef} myProp="component-prop" />
    );

    expect(container).toHaveTextContent('component-ref');
    expect(container).toMatchSnapshot();
  });
});
