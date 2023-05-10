import fs from 'fs';
let contents = fs.readFileSync('./src/cpu_profiler.ts', 'utf8');

// Convert to CJS
contents = contents.replace(
  /\/\/\s+__START__REPLACE__DIRNAME__((.|\r|\n)*)__END__REPLACE__DIRNAME__/gm,
  `// __START__REPLACE__DIRNAME__\nimport { dirname as aliasedDirname } from 'path';\nimport { fileURLToPath as aliasedFileUrlToPath } from 'url';\nconst _dirname = aliasedDirname(aliasedFileUrlToPath(import.meta.url));\n// __END__REPLACE__DIRNAME__`
);

contents = contents.replace(
  /\/\/\s+__START__REPLACE__REQUIRE__((.|\r|\n)*)__END__REPLACE__REQUIRE__/gm,
  `// __START__REPLACE__REQUIRE__\nimport { createRequire as aliasedCreateRequire } from 'module';\nconst require = aliasedCreateRequire(import.meta.url);\n// __END__REPLACE__REQUIRE__`
);

fs.writeFileSync('./src/cpu_profiler.ts', contents, 'utf8');
