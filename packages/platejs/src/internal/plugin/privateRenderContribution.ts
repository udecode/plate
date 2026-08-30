const privateRenderContributions = new WeakSet<object>();

export const allowPrivateRenderContribution = <T extends object>(value: T) => {
  privateRenderContributions.add(value);

  return value;
};

export const isPrivateRenderContribution = (value: object) =>
  privateRenderContributions.has(value);
