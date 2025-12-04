// netlify/forms-migration.js
import { copyFileSync, mkdirSync } from "fs";

// Ce script recrée un index.html minimal pour permettre à Netlify de scanner les forms
mkdirSync("out", { recursive: true });
copyFileSync("src/app/netlify-forms/page.tsx", "out/netlify-forms.html");
console.log("✅ Netlify Forms migration: page copiée pour scan.");
