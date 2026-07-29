import type {
  BaseEditor,
  Editor,
  EditorReadAroundHandler,
  EditorReadDescriptor,
  EditorReadInput,
  EditorReadRegistration,
  EditorReadResult,
} from '../interfaces/editor';

type ReadRegistrationRuntime<
  Input,
  Result,
  TEditor extends BaseEditor<any, any>,
> = Readonly<{
  read: EditorReadDescriptor<Input, Result>;
  run: EditorReadAroundHandler<Input, Result, TEditor>;
}>;

const READ_REGISTRATION_RUNTIMES = new WeakMap<
  object,
  ReadRegistrationRuntime<any, any, BaseEditor<any, any>>
>();

/** Define a pure editor read with descriptor-owned identity. */
export const defineRead = <
  Input = void,
  Result = unknown,
  TEditor extends BaseEditor<any, any> = Editor,
>(
  id: string
): EditorReadDescriptor<Input, Result, TEditor> => {
  if (id.length === 0) {
    throw new Error('Editor read ids must not be empty.');
  }

  return Object.freeze({ id }) as EditorReadDescriptor<Input, Result, TEditor>;
};

export const createReadRegistration = <
  TRead extends EditorReadDescriptor<any, any, any>,
  THandlerEditor extends BaseEditor<any, any>,
>(
  read: TRead,
  run: EditorReadAroundHandler<
    EditorReadInput<TRead>,
    EditorReadResult<TRead>,
    THandlerEditor
  >
): EditorReadRegistration<THandlerEditor> => {
  const registration = Object.freeze(
    {}
  ) as EditorReadRegistration<THandlerEditor>;

  READ_REGISTRATION_RUNTIMES.set(registration, {
    read,
    run,
  } as ReadRegistrationRuntime<any, any, BaseEditor<any, any>>);

  return registration;
};

export const getReadRegistrationRuntime = <
  TEditor extends BaseEditor<any, any>,
>(
  registration: EditorReadRegistration<TEditor>
): ReadRegistrationRuntime<any, any, TEditor> => {
  const runtime = READ_REGISTRATION_RUNTIMES.get(registration);

  if (!runtime) {
    throw new Error(
      'Editor read registrations must be created by the extension read factory.'
    );
  }

  return runtime as ReadRegistrationRuntime<any, any, TEditor>;
};
