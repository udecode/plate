/// <reference types="@testing-library/jest-dom" />

import React from 'react';

import type { Element } from '@platejs/slate';

import { act, render } from '@testing-library/react';

import { TestPlate as Plate } from '../../__tests__/TestPlate';
import { createPlateEditor } from '../../editor';
import { DebugPlugin } from '../../../lib/plugins/debug/DebugPlugin';
import { useElement } from './useElement';
import {
  ElementProvider,
  useElementStore,
  withElementContext,
} from './useElementStore';
import { usePath } from './usePath';

describe('ElementProvider', () => {
  const PlateWrapper = ({ children }: { children: React.ReactNode }) => {
    const editor = createPlateEditor({
      plugins: [
        DebugPlugin.configure({
          options: {
            logger: { warn: () => {} } as any,
            throwErrors: false,
          },
        }),
      ],
    });

    return <Plate editor={editor}>{children}</Plate>;
  };

  interface NameElement extends Element {
    name: string;
    type: 'name';
  }

  interface AgeElement extends Element {
    age: number;
    type: 'age';
  }

  const makeNameElement = (name: string): NameElement => ({
    children: [],
    name,
    type: 'name',
  });

  const makeAgeElement = (age: number): AgeElement => ({
    age,
    children: [],
    type: 'age',
  });

  const NameElementProvider = ({
    children,
    name,
  }: {
    children: React.ReactNode;
    name: string;
  }) => {
    const element = React.useMemo(() => makeNameElement(name), [name]);
    const entry = React.useMemo(() => [element, [0]] as any, [element]);

    return (
      <ElementProvider element={element} entry={entry} path={[0]} scope="name">
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
    const entry = React.useMemo(() => [element, [1]] as any, [element]);

    return (
      <ElementProvider element={element} entry={entry} path={[1]} scope="age">
        {children}
      </ElementProvider>
    );
  };

  const UpdatingAgeElementProvider = ({
    buttonLabel,
    children,
    increment,
    initialAge,
  }: {
    buttonLabel: string;
    children: React.ReactNode;
    increment: number;
    initialAge: number;
  }) => {
    const [age, setAge] = React.useState(initialAge);

    return (
      <AgeElementProvider age={age}>
        <button onClick={() => setAge(age + increment)} type="button">
          {buttonLabel}
        </button>
        {children}
      </AgeElementProvider>
    );
  };

  type ConsumerProps = {
    label?: string;
  };

  const NameElementConsumer = ({ label = '' }: ConsumerProps) => {
    const element = useElement<NameElement>('name');

    return <div>{label + element.name}</div>;
  };

  const AgeElementConsumer = ({ label = '' }: ConsumerProps) => {
    const element = useElement<AgeElement>('age');

    return <div>{label + element.age}</div>;
  };

  const TypeConsumer = ({
    label = '',
    type,
  }: ConsumerProps & { type?: 'age' | 'name' }) => {
    const element = useElement(type);

    return <div>{label + element.type}</div>;
  };

  const JsonConsumer = ({
    label = '',
    type,
  }: ConsumerProps & { type?: 'age' | 'name' }) => {
    const element = useElement(type);

    return <div>{label + JSON.stringify(element)}</div>;
  };

  const PathConsumer = ({
    label = '',
    type,
  }: ConsumerProps & { type?: string }) => {
    const path = usePath(type);

    return <div>{label + JSON.stringify(path)}</div>;
  };

  const AgeStoreConsumer = ({ label = '' }: ConsumerProps) => {
    const store = useElementStore('age');
    const age = store.useValue(
      'element',
      (element: TAgeElement | null) => element?.age ?? null,
      []
    );

    return <div>{label + age}</div>;
  };

  const RenderContextConsumer = () => {
    const ageElement = React.useMemo(() => makeAgeElement(42), []);
    const ageEntry = React.useMemo(
      () => [ageElement, [2]] as any,
      [ageElement]
    );

    return withElementContext(
      {
        element: ageElement,
        entry: ageEntry,
        path: ageEntry[1],
        scope: 'age',
      },
      () => {
        const matchingName = useElement<TNameElement>('name');
        const fallback = useElement();

        return (
          <div>
            Name: {matchingName.name}; Fallback: {fallback.type}
          </div>
        );
      }
    );
  };

  it('returns the first ancestor matching the element type', () => {
    const { getByText } = render(
      <PlateWrapper>
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
      </PlateWrapper>
    );

    (expect(getByText('Name: Jane')) as any).toBeInTheDocument();
    (expect(getByText('Age: 30')) as any).toBeInTheDocument();
    (expect(getByText('Type: age')) as any).toBeInTheDocument();
  });

  it('returns the first ancestor of any type if given type does not match', () => {
    const { getByText } = render(
      <PlateWrapper>
        <NameElementProvider name="John">
          <NameElementProvider name="Jane">
            <TypeConsumer label="Type: " type="age" />
          </NameElementProvider>
        </NameElementProvider>
      </PlateWrapper>
    );

    (expect(getByText('Type: name')) as any).toBeInTheDocument();
  });

  it('does not let render-time element context shadow a matching provider scope', () => {
    const { getByText } = render(
      <PlateWrapper>
        <NameElementProvider name="John">
          <RenderContextConsumer />
        </NameElementProvider>
      </PlateWrapper>
    );

    (expect(getByText('Name: John; Fallback: age')) as any).toBeInTheDocument();
  });

  it('returns the nearest matching scoped path and otherwise falls back to the nearest provider path', () => {
    const { getByText } = render(
      <PlateWrapper>
        <NameElementProvider name="John">
          <AgeElementProvider age={20}>
            <NameElementProvider name="Jane">
              <PathConsumer label="Name path: " type="name" />
              <PathConsumer label="Age path: " type="age" />
              <PathConsumer label="Fallback path: " type="missing" />
            </NameElementProvider>
          </AgeElementProvider>
        </NameElementProvider>
      </PlateWrapper>
    );

    (expect(getByText('Name path: [0]')) as any).toBeInTheDocument();
    (expect(getByText('Age path: [1]')) as any).toBeInTheDocument();
    (expect(getByText('Fallback path: [0]')) as any).toBeInTheDocument();
  });

  it('propagates updated elements to consumers', () => {
    const { getByText } = render(
      <PlateWrapper>
        <UpdatingAgeElementProvider
          buttonLabel="updateAge1"
          increment={10}
          initialAge={20}
        >
          <AgeElementConsumer label="Age 1: " />
          <UpdatingAgeElementProvider
            buttonLabel="updateAge2"
            increment={10}
            initialAge={140}
          >
            <AgeElementConsumer label="Age 2: " />
          </UpdatingAgeElementProvider>
        </UpdatingAgeElementProvider>
      </PlateWrapper>
    );

    (expect(getByText('Age 1: 20')) as any).toBeInTheDocument();
    (expect(getByText('Age 2: 140')) as any).toBeInTheDocument();

    void act(() => getByText('updateAge1').click());

    (expect(getByText('Age 1: 30')) as any).toBeInTheDocument();
    (expect(getByText('Age 2: 140')) as any).toBeInTheDocument();

    void act(() => getByText('updateAge2').click());

    (expect(getByText('Age 1: 30')) as any).toBeInTheDocument();
    (expect(getByText('Age 2: 150')) as any).toBeInTheDocument();

    void act(() => getByText('updateAge1').click());

    (expect(getByText('Age 1: 40')) as any).toBeInTheDocument();
    (expect(getByText('Age 2: 150')) as any).toBeInTheDocument();
  });

  it('lazily bridges useElementStore consumers and propagates updates', () => {
    const { getByText } = render(
      <PlateWrapper>
        <UpdatingAgeElementProvider
          buttonLabel="updateAgeStore"
          increment={10}
          initialAge={20}
        >
          <AgeStoreConsumer label="Age store: " />
        </UpdatingAgeElementProvider>
      </PlateWrapper>
    );

    (expect(getByText('Age store: 20')) as any).toBeInTheDocument();

    void act(() => getByText('updateAgeStore').click());

    (expect(getByText('Age store: 30')) as any).toBeInTheDocument();
  });

  it('returns empty object if no ancestor exists', () => {
    const { getByText } = render(
      <PlateWrapper>
        <JsonConsumer />
      </PlateWrapper>
    );
    (expect(getByText('{}')) as any).toBeInTheDocument();
  });
});
