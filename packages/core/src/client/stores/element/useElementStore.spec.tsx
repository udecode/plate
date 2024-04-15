import React from 'react';
import { act, render } from '@testing-library/react';
import { TElement } from '@udecode/slate';

import { useElement } from './element/useElement';
import { ElementProvider } from './useElementStore';

describe('ElementProvider', () => {
  interface TNameElement extends TElement {
    type: 'name';
    name: string;
  }

  interface TAgeElement extends TElement {
    type: 'age';
    age: number;
  }

  const makeNameElement = (name: string): TNameElement => ({
    type: 'name',
    name,
    children: [],
  });

  const makeAgeElement = (age: number): TAgeElement => ({
    type: 'age',
    age,
    children: [],
  });

  const NameElementProvider = ({
    name,
    children,
  }: {
    name: string;
    children: React.ReactNode;
  }) => {
    const element = React.useMemo(() => makeNameElement(name), [name]);

    return (
      <ElementProvider element={element} scope="name">
        {children}
      </ElementProvider>
    );
  };

  const AgeElementProvider = ({
    age,
    children,
  }: {
    age: number;
    children: React.ReactNode;
  }) => {
    const element = React.useMemo(() => makeAgeElement(age), [age]);

    return (
      <ElementProvider element={element} scope="age">
        {children}
      </ElementProvider>
    );
  };

  const UpdatingAgeElementProvider = ({
    initialAge,
    increment,
    buttonLabel,
    children,
  }: {
    initialAge: number;
    increment: number;
    buttonLabel: string;
    children: React.ReactNode;
  }) => {
    const [age, setAge] = React.useState(initialAge);

    return (
      <AgeElementProvider age={age}>
        <button type="button" onClick={() => setAge(age + increment)}>
          {buttonLabel}
        </button>
        {children}
      </AgeElementProvider>
    );
  };

  interface ConsumerProps {
    label?: string;
  }

  const NameElementConsumer = ({ label = '' }: ConsumerProps) => {
    const element = useElement<TNameElement>('name');
    return <div>{label + element.name}</div>;
  };

  const AgeElementConsumer = ({ label = '' }: ConsumerProps) => {
    const element = useElement<TAgeElement>('age');
    return <div>{label + element.age}</div>;
  };

  const TypeConsumer = ({
    type,
    label = '',
  }: ConsumerProps & { type?: 'name' | 'age' }) => {
    const element = useElement(type);
    return <div>{label + element.type}</div>;
  };

  const JsonConsumer = ({
    type,
    label = '',
  }: ConsumerProps & { type?: 'name' | 'age' }) => {
    const element = useElement(type);
    return <div>{label + JSON.stringify(element)}</div>;
  };

  it('returns the first ancestor matching the element type', () => {
    const { getByText } = render(
      <NameElementProvider name="John">
        <AgeElementProvider age={20}>
          <NameElementProvider name="Jane">
            <AgeElementProvider age={30}>
              <NameElementConsumer label="Name: " />
              <AgeElementConsumer label="Age: " />
              <TypeConsumer label="Type: " />
            </AgeElementProvider>
          </NameElementProvider>
        </AgeElementProvider>
      </NameElementProvider>
    );

    expect(getByText('Name: Jane')).toBeInTheDocument();
    expect(getByText('Age: 30')).toBeInTheDocument();
    expect(getByText('Type: age')).toBeInTheDocument();
  });

  it('returns the first ancestor of any type if given type does not match', () => {
    const { getByText } = render(
      <NameElementProvider name="John">
        <NameElementProvider name="Jane">
          <TypeConsumer type="age" label="Type: " />
        </NameElementProvider>
      </NameElementProvider>
    );

    expect(getByText('Type: name')).toBeInTheDocument();
  });

  it('propagates updated elements to consumers', () => {
    const { getByText } = render(
      <UpdatingAgeElementProvider
        initialAge={20}
        increment={10}
        buttonLabel="updateAge1"
      >
        <AgeElementConsumer label="Age 1: " />
        <UpdatingAgeElementProvider
          initialAge={140}
          increment={10}
          buttonLabel="updateAge2"
        >
          <AgeElementConsumer label="Age 2: " />
        </UpdatingAgeElementProvider>
      </UpdatingAgeElementProvider>
    );

    expect(getByText('Age 1: 20')).toBeInTheDocument();
    expect(getByText('Age 2: 140')).toBeInTheDocument();

    act(() => getByText('updateAge1').click());

    expect(getByText('Age 1: 30')).toBeInTheDocument();
    expect(getByText('Age 2: 140')).toBeInTheDocument();

    act(() => getByText('updateAge2').click());

    expect(getByText('Age 1: 30')).toBeInTheDocument();
    expect(getByText('Age 2: 150')).toBeInTheDocument();

    act(() => getByText('updateAge1').click());

    expect(getByText('Age 1: 40')).toBeInTheDocument();
    expect(getByText('Age 2: 150')).toBeInTheDocument();
  });

  it('returns empty object if no ancestor exists', () => {
    const { getByText } = render(<JsonConsumer />);
    expect(getByText('{}')).toBeInTheDocument();
  });
});
