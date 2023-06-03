export const useCodeSyntaxLeaf = ({ leaf }: { leaf: any }) => {
  return {
    tokenProps: {
      className: `prism-token token ${leaf.tokenType}`,
    },
  };
};
