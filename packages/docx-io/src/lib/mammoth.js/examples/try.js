const path = require("path");
const fs = require("fs");
const { convertDocxToHtmlMathml } = require("../");

(async () => {
    const html = await convertDocxToHtmlMathml(
        { path: path.join(__dirname, "../test.docx") },
        { enableOmml: true, enableMathType: false }
    );

    fs.writeFileSync("result.html", html, "utf8");
    console.log("🎉 DONE:", path.resolve("result.html"));
})();
