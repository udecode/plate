/// <reference types="@testing-library/jest-dom" />

import React from 'react';

import { property, schema, type Element } from '@platejs/plite';

import { act, render } from '@testing-library/react';

import { TestPlate as Plate } from '../../__tests__/TestPlate';
import { createPlateEditor } from '../../editor';
import { createBasePlugin } from '../../../lib';
import { DebugPlugin } from '../../../lib/plugins/debug/DebugPlugin';
import { useElement, useOptionalElement } from './useElement';
import {
  ElementProvider,
  useElementStore,
  runElementContext,
} from './useElementStore';
import { useOptionalPath } from './usePath';

describe('ElementProvider', () => {
  const PlateWrapper = ({ children }: { children: React.ReactNode }) => {
    const editor = createPlateEditor({
      plugins: [
        DebugPlugin.configure({
          initialState: {
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

  const NamePlugin = createBasePlugin({
    key: 'name',
    schema: {
      element: {
        content: schema.content.text(),
        properties: { name: property.string() },
      },
    },
  });
  const AgePlugin = createBasePlugin({
    key: 'age',
    schema: {
      element: {
        content: schema.content.text(),
        properties: { age: property.number() },
      },
    },
  });
  const MissingPlugin = createBasePlugin({
    key: 'missing',
    schema: { element: { content: schema.content.text() } },
  });

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

  const UpdatingNameElementProvider = ({
    buttonLabel,
    children,
    initialName,
  }: {
    buttonLabel: string;
    children: React.ReactNode;
    initialName: string;
  }) => {
    const [name, setName] = React.useState(initialName);

    return (
      <NameElementProvider name={name}>
        <button onClick={() => setName(`${name}!`)} type="button">
          {buttonLabel}
        </button>
        {children}
      </NameElementProvider>
    );
  };

  type ConsumerProps = {
    label?: string;
  };

  const NameElementConsumer = ({ label = '' }: ConsumerProps) => {
    const element = useElement(NamePlugin);

    return <div>{label + element.name}</div>;
  };

  const AgeElementConsumer = ({ label = '' }: ConsumerProps) => {
    const element = useElement(AgePlugin);

    return <div>{label + element.age}</div>;
  };

  const TypeConsumer = ({ label = '' }: ConsumerProps) => {
    const element = useElement();

    return <div>{label + element.type}</div>;
  };

  const OptionalTypeConsumer = ({ label = '' }: ConsumerProps) => {
    const element = useOptionalElement(MissingPlugin);

    return <div>{label + (element?.type ?? 'none')}</div>;
  };

  const PathConsumer = ({
    label = '',
    plugin,
  }: ConsumerProps & {
    plugin: typeof AgePlugin | typeof MissingPlugin | typeof NamePlugin;
  }) => {
    const path = useOptionalPath(plugin);

    return <div>{label + JSON.stringify(path)}</div>;
  };

  const OptionalJsonConsumer = () => {
    const element = useOptionalElement();

    return <div>{JSON.stringify(element)}</div>;
  };

  const AgeStoreConsumer = ({ label = '' }: ConsumerProps) => {
    const store = useElementStore('age');
    const age = store.useValue(
      'element',
      (element) => (element as AgeElement | null)?.age ?? null,
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

    return runElementContext(
      {
        element: ageElement,
        entry: ageEntry,
        path: ageEntry[1],
        scope: 'age',
      },
      () => {
        const matchingName = useElement(NamePlugin);
        const fallback = useElement<AgeElement>();

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

  it('does not fall back when an explicit descriptor is absent', () => {
    const { getByText } = render(
      <PlateWrapper>
        <NameElementProvider name="John">
          <NameElementProvider name="Jane">
            <OptionalTypeConsumer label="Type: " />
          </NameElementProvider>
        </NameElementProvider>
      </PlateWrapper>
    );

    (expect(getByText('Type: none')) as any).toBeInTheDocument();
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

  it('returns the nearest matching scoped path without descriptor fallback', () => {
    const { getByText } = render(
      <PlateWrapper>
        <NameElementProvider name="John">
          <AgeElementProvider age={20}>
            <NameElementProvider name="Jane">
              <PathConsumer label="Name path: " plugin={NamePlugin} />
              <PathConsumer label="Age path: " plugin={AgePlugin} />
              <PathConsumer label="Missing path: " plugin={MissingPlugin} />
            </NameElementProvider>
          </AgeElementProvider>
        </NameElementProvider>
      </PlateWrapper>
    );

    (expect(getByText('Name path: [0]')) as any).toBeInTheDocument();
    (expect(getByText('Age path: [1]')) as any).toBeInTheDocument();
    (expect(getByText('Missing path: null')) as any).toBeInTheDocument();
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

  it('does not propagate outer updates through a nested element provider', () => {
    let innerConsumerRenders = 0;
    let innerProviderRenders = 0;

    const InnerConsumer = () => {
      innerConsumerRenders++;

      const element = useElement();

      return <div>Inner type: {element.type}</div>;
    };
    const InnerProvider = React.memo(function InnerProvider({
      children,
    }: {
      children: React.ReactNode;
    }) {
      innerProviderRenders++;

      return <AgeElementProvider age={20}>{children}</AgeElementProvider>;
    });
    const { getByText } = render(
      <PlateWrapper>
        <UpdatingNameElementProvider
          buttonLabel="updateOuterName"
          initialName="John"
        >
          <InnerProvider>
            <NameElementConsumer label="Outer name: " />
            <InnerConsumer />
          </InnerProvider>
        </UpdatingNameElementProvider>
      </PlateWrapper>
    );
    const initialInnerConsumerRenders = innerConsumerRenders;
    const initialInnerProviderRenders = innerProviderRenders;

    (expect(getByText('Outer name: John')) as any).toBeInTheDocument();
    (expect(getByText('Inner type: age')) as any).toBeInTheDocument();

    void act(() => getByText('updateOuterName').click());

    (expect(getByText('Outer name: John!')) as any).toBeInTheDocument();
    (expect(getByText('Inner type: age')) as any).toBeInTheDocument();
    expect({ innerConsumerRenders, innerProviderRenders }).toEqual({
      innerConsumerRenders: initialInnerConsumerRenders,
      innerProviderRenders: initialInnerProviderRenders,
    });
  });

  it('updates an exact scoped consumer through a different scoped provider', () => {
    let ageConsumerRenders = 0;
    let innerProviderRenders = 0;
    let nameConsumerRenders = 0;

    const ExactNameConsumer = React.memo(function ExactNameConsumer() {
      nameConsumerRenders++;

      const element = useElement(NamePlugin);

      return <div>Exact name: {element.name}</div>;
    });
    const InnerAgeConsumer = React.memo(function InnerAgeConsumer() {
      ageConsumerRenders++;

      const element = useElement();

      return <div>Inner age: {(element as AgeElement).age}</div>;
    });
    const InnerProvider = React.memo(function InnerProvider() {
      innerProviderRenders++;

      return (
        <AgeElementProvider age={20}>
          <ExactNameConsumer />
          <InnerAgeConsumer />
        </AgeElementProvider>
      );
    });
    const { getByText } = render(
      <PlateWrapper>
        <UpdatingNameElementProvider
          buttonLabel="updateScopedName"
          initialName="John"
        >
          <InnerProvider />
        </UpdatingNameElementProvider>
      </PlateWrapper>
    );
    const initialAgeConsumerRenders = ageConsumerRenders;
    const initialInnerProviderRenders = innerProviderRenders;
    const initialNameConsumerRenders = nameConsumerRenders;

    void act(() => getByText('updateScopedName').click());

    (expect(getByText('Exact name: John!')) as any).toBeInTheDocument();
    (expect(getByText('Inner age: 20')) as any).toBeInTheDocument();
    expect({
      ageConsumerRenders,
      innerProviderRenders,
      nameConsumerRenders,
    }).toEqual({
      ageConsumerRenders: initialAgeConsumerRenders,
      innerProviderRenders: initialInnerProviderRenders,
      nameConsumerRenders: initialNameConsumerRenders + 1,
    });
  });

  it('shadows outer updates at a nested provider with the same scope', () => {
    let innerConsumerRenders = 0;
    let innerProviderRenders = 0;

    const InnerConsumer = React.memo(function InnerConsumer() {
      innerConsumerRenders++;

      const element = useElement(NamePlugin);

      return <div>Shadowed name: {element.name}</div>;
    });
    const InnerProvider = React.memo(function InnerProvider() {
      innerProviderRenders++;

      return (
        <NameElementProvider name="Jane">
          <InnerConsumer />
        </NameElementProvider>
      );
    });
    const { getByText } = render(
      <PlateWrapper>
        <UpdatingNameElementProvider
          buttonLabel="updateShadowedName"
          initialName="John"
        >
          <InnerProvider />
        </UpdatingNameElementProvider>
      </PlateWrapper>
    );
    const initialInnerConsumerRenders = innerConsumerRenders;
    const initialInnerProviderRenders = innerProviderRenders;

    void act(() => getByText('updateShadowedName').click());

    (expect(getByText('Shadowed name: Jane')) as any).toBeInTheDocument();
    expect({ innerConsumerRenders, innerProviderRenders }).toEqual({
      innerConsumerRenders: initialInnerConsumerRenders,
      innerProviderRenders: initialInnerProviderRenders,
    });
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

  it('returns null from the optional hook if no ancestor exists', () => {
    const { getByText } = render(
      <PlateWrapper>
        <OptionalJsonConsumer />
      </PlateWrapper>
    );
    (expect(getByText('null')) as any).toBeInTheDocument();
  });
});
