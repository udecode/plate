import fs from "fs";
import path from "path";
import os from "os";
import { spawn } from "child_process";

import AdmZip from "adm-zip";
import * as mammoth from "./index.js";        // hoặc "./" tuỳ repo export
import * as Html from "./lib/html/index.js";

async function run() {
  try {
    const inputPath = "./test.docx";

    const originalBuffer = fs.readFileSync(inputPath);
    const zip = new AdmZip(originalBuffer);

    let xml = zip.readAsText("word/document.xml");
    zip.updateFile("word/document.xml", Buffer.from(xml, "utf8"));
    const patchedBuffer = zip.toBuffer();

    const sharedContext = { mathIndex: 0, mathMap: {} };

    const result = await mammoth.convertToHtml(
      { buffer: patchedBuffer, sharedContext },
      {
        convertMath: async (math) => {
          console.log("🔥 convertMath called:", math.kind, math.binPath);
          return [Html.raw("<math><mi>x</mi></math>")];
        }
      }
    );

    fs.writeFileSync("result.html", result.value, "utf8");
    console.log("🎉 DONE");
  } catch (err) {
    console.error("❌ Error:", err);
  }
}

run();
