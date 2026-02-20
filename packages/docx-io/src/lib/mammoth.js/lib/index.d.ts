export type DocxInput = Buffer | { buffer?: Buffer; path?: string };

export type ConvertOptions = {
    enableOmml?: boolean;
    enableMathType?: boolean;
    xsltPath?: string;
    rubyScriptPath?: string;
    rubyExe?: string;
    wrapHtmlDocument?: boolean;
};

export function convertDocxToHtmlMathml(
    input: DocxInput,
    opts?: ConvertOptions
): Promise<string>;
