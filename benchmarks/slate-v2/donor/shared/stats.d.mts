export declare const round: (value: any) => number;
export declare const now: () => number;
export declare const summarize: (samples: any) => {
    samples: any;
    mean: number;
    median: number;
    p75: number;
    p95: number;
    p99: number;
    min: number;
    max: number;
};
export declare const writeBenchmarkArtifact: (path: any, summary: any) => Promise<void>;
