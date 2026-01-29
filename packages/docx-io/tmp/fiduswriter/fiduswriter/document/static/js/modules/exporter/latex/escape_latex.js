export const escapeLatexText = text =>
    text
        // Remove line breaks
        .replace(/\r|\n/g, "")
        // Escape characters that are protected in some way.
        .replace(/\{/g, "\\{")
        .replace(/\}/g, "\\}")
        .replace(/\^/g, "\\textasciicircum{}")
        .replace(/\$/g, "\\$")
        .replace(/_/g, "\\_")
        .replace(/~/g, "\\textasciitilde{}")
        .replace(/#/g, "\\#")
        .replace(/%/g, "\\%")
        .replace(/&/g, "\\&")
        .replace(/\\\\/g, "\\textbackslash")

        // Remove control characters that somehow have ended up in the document
        .replace(/\u000B/g, "")
        .replace(/\u000C/g, "")
        .replace(/\u000E/g, "")
        .replace(/\u000F/g, "")
