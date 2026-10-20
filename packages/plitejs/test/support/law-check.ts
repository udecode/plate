import { after, before } from 'node:test';

export const withoutLawCheck = () => {
  const lawCheck = process.env.PLITE_LAW_CHECK;

  before(() => {
    process.env.PLITE_LAW_CHECK = '0';
  });
  after(() => {
    if (lawCheck === undefined) delete process.env.PLITE_LAW_CHECK;
    else process.env.PLITE_LAW_CHECK = lawCheck;
  });
};
