#!/usr/bin/env node
export declare const validateConceptMatrix: ({
  ledger,
  manifest,
}: {
  ledger: any;
  manifest: any;
}) => {
  classifications: {
    [k: string]: {
      count: any;
      ids: any;
    };
  };
  concepts: any;
  integrity: {
    cannedProfiles: number;
    duplicateRows: number;
    groupedIds: number;
    missingPriorCandidates: number;
    missingRows: number;
    unknownIds: number;
    unresolvedCells: number;
  };
  localDebt: {
    [k: string]: {
      count: any;
      ids: any;
    };
  };
  origins: {
    [k: string]: {
      count: any;
      ids: any;
    };
  };
  preferredBases: {
    [k: string]: {
      count: any;
      ids: any;
    };
  };
  priorCandidates: {
    [k: string]: {
      count: any;
      ids: any;
    };
  };
  priorities: {
    [k: string]: {
      count: any;
      ids: any;
    };
  };
  proofAdaptations: {
    [k: string]: {
      count: any;
      ids: any;
    };
  };
  referenceAdaptations: {
    [k: string]: {
      count: any;
      ids: any;
    };
  };
  rows: number;
  verdicts: {
    [k: string]: {
      count: any;
      ids: any;
    };
  };
};
