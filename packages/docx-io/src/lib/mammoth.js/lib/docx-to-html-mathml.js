"use strict";

const fs = require("fs");
const path = require("path");
const os = require("os");
const { spawn } = require("child_process");

const mammoth = require("./mammoth-core");
const AdmZip = require("adm-zip");
const Html = require("./html");
const { createOmmlConverter } = require("./omml_to_mathml.cjs");

function ensureBuffer(x) {
    if (Buffer.isBuffer(x)) return x;
    if (x instanceof ArrayBuffer) return Buffer.from(x);
    if (x && x.buffer instanceof ArrayBuffer) return Buffer.from(x.buffer);
    return Buffer.from(x);
}

function escapeRegExp(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function normalizeMathml(mathml) {
    let fixed = (mathml || "").trim();
    fixed = fixed.replace(/^\s*<\?xml[^>]*\?>\s*/i, "");
    fixed = fixed.replace(/<mml:math[^>]*>/gi, '<math xmlns="http://www.w3.org/1998/Math/MathML">');
    fixed = fixed.replace(/<\/mml:math>/gi, "</math>");
    fixed = fixed.replace(/mml:/g, "");
    if (fixed.includes("<math") && !fixed.includes('xmlns="http://www.w3.org/1998/Math/MathML"')) {
        fixed = fixed.replace("<math", '<math xmlns="http://www.w3.org/1998/Math/MathML"');
    }
    return fixed.trim();
}

function pickRubyExe(userRubyExe) {
    if (userRubyExe) return userRubyExe;
    const candidates = [
        "ruby",
        "C:\\Ruby33-x64\\bin\\ruby.exe",
        "C:\\Ruby32-x64\\bin\\ruby.exe",
        "C:\\Ruby31-x64\\bin\\ruby.exe",
        "C:\\Ruby30-x64\\bin\\ruby.exe",
        "C:\\msys64\\usr\\bin\\ruby.exe",
    ];
    for (const c of candidates) {
        if (c === "ruby") return c;
        try { if (fs.existsSync(c)) return c; } catch { }
    }
    return "ruby";
}

function runRubyMathtypeToMathmlBatchFile(binFilePaths, rubyScriptPath, rubyExe) {
    if (!binFilePaths || binFilePaths.length === 0) return Promise.resolve({});
    if (!fs.existsSync(rubyScriptPath)) {
        return Promise.reject(new Error(`Missing Ruby script: ${rubyScriptPath}`));
    }

    const exe = pickRubyExe(rubyExe);

    return new Promise((resolve, reject) => {
        const child = spawn(exe, [rubyScriptPath, ...binFilePaths], {
            windowsHide: true,
            stdio: ["ignore", "pipe", "pipe"],
        });

        let stdout = "";
        let stderr = "";
        child.stdout.on("data", (d) => (stdout += d.toString("utf8")));
        child.stderr.on("data", (d) => (stderr += d.toString("utf8")));

        child.on("error", (err) => reject(new Error(`Cannot spawn ruby (${exe}): ${err.message}`)));

        child.on("close", (code) => {
            if (code !== 0) return reject(new Error(`Ruby exit ${code}\nSTDERR:\n${stderr}`));
            const out = stdout.trim();
            if (!out) return reject(new Error(`Ruby returned empty output.\nSTDERR:\n${stderr}`));
            try { resolve(JSON.parse(out)); }
            catch { reject(new Error(`Ruby output is not JSON.\nSTDOUT(head):\n${out.slice(0, 300)}\nSTDERR:\n${stderr}`)); }
        });
    });
}

/**
 * @param {{buffer?: Buffer, path?: string} | Buffer} input
 * @param {{
 *   enableOmml?: boolean,
 *   enableMathType?: boolean,
 *   xsltPath?: string,
 *   rubyScriptPath?: string,
 *   rubyExe?: string,
 *   wrapHtmlDocument?: boolean
 * }} opts
 */
async function convertDocxToHtmlMathml(input, opts = {}) {
    const enableOmml = true;
    const enableMathType = true;

    const xsltPath = opts.xsltPath || path.join(__dirname, "..", "OMML2MML.XSL");
    const rubyScriptPath = opts.rubyScriptPath || path.join(__dirname, "..", "mathtype_to_mathml_plus.rb");

    const { ommlToMathml } = createOmmlConverter({ xsltPath });

    let tmpDir = null;
    try {
        let originalBuffer;
        if (Buffer.isBuffer(input)) originalBuffer = input;
        else if (input && input.buffer) originalBuffer = ensureBuffer(input.buffer);
        else if (input && input.path) originalBuffer = fs.readFileSync(input.path);
        else throw new Error("Input must be Buffer or {buffer} or {path}");

        const zip = new AdmZip(originalBuffer);
        const patchedBuffer = zip.toBuffer();

        tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "mammoth-math-"));

        const mtPlaceholderToFile = new Map();
        const mtAllBinFiles = [];
        const ommlPlaceholderToXml = new Map();
        let seqMT = 0;
        let seqOMML = 0;

        const result = await mammoth.convertToHtml(
            { buffer: patchedBuffer },
            {
                convertMath: async (math) => {
                    if (enableMathType && math.kind === "mathtype") {
                        const binBuffer = ensureBuffer(await math.read());
                        const binName = path.basename(math.binPath || `oleObject-${Date.now()}-${seqMT}.bin`);
                        const binFilePath = path.join(tmpDir, `${seqMT}-${binName}`);
                        fs.writeFileSync(binFilePath, binBuffer);

                        const id = `mt${seqMT++}`;
                        mtPlaceholderToFile.set(id, binFilePath);
                        mtAllBinFiles.push(binFilePath);
                        return [Html.raw(`<span data-mt="${id}"></span>`)];
                    }

                    if (enableOmml && math.kind === "omml") {
                        const id = `omml${seqOMML++}`;
                        ommlPlaceholderToXml.set(id, (math.omml || "").trim());
                        return [Html.raw(`<span data-omml="${id}"></span>`)];
                    }

                    return [Html.text(math.altText || "[math]")];
                },
            }
        );

        let htmlBody = result.value;

        // MathType
        if (enableMathType && mtAllBinFiles.length) {
            const mapPathToMathml = await runRubyMathtypeToMathmlBatchFile(
                mtAllBinFiles,
                rubyScriptPath,
                opts.rubyExe
            );

            for (const [id, filePath] of mtPlaceholderToFile.entries()) {
                const rawMathml = mapPathToMathml[filePath];
                const fixed = rawMathml ? normalizeMathml(rawMathml) : `<span class="math-error">MathType error</span>`;
                const re = new RegExp(`<span\\s+data-mt="${escapeRegExp(id)}"\\s*><\\/span>`, "g");
                htmlBody = htmlBody.replace(re, fixed);
            }
        }

        // OMML
        if (enableOmml && ommlPlaceholderToXml.size) {
            for (const [id, ommlXml] of ommlPlaceholderToXml.entries()) {
                let fixed = `<span class="math-error">OMML error</span>`;
                try {
                    fixed = normalizeMathml(await ommlToMathml(ommlXml)) || `<span class="math-error">OMML empty</span>`;
                } catch { }
                const re = new RegExp(`<span\\s+data-omml="${escapeRegExp(id)}"\\s*><\\/span>`, "g");
                htmlBody = htmlBody.replace(re, fixed);
            }
        }

        if (opts.wrapHtmlDocument) {
            return `<!doctype html><html><head><meta charset="utf-8"/></head><body>${htmlBody}</body></html>`;
        }
        return htmlBody;
    } finally {
        if (tmpDir) {
            try { fs.rmSync(tmpDir, { recursive: true, force: true }); } catch { }
        }
    }
}

module.exports = { convertDocxToHtmlMathml };
