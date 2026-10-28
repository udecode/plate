export const lawCheckEnabled = () => {
  const env = (
    globalThis as { process?: { env?: Record<string, string | undefined> } }
  ).process?.env;

  return env?.NODE_ENV === 'test' && env.PLITE_LAW_CHECK !== '0';
};
