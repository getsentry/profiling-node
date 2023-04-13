const fs = require('fs');
let contents = fs.readFileSync('./src/cpu_profiler.ts', 'utf8');

// Convert to CJS
contents = contents.replace(
  /\/\/\s+__START__REPLACE__DIRNAME__((.|\r|\n)*)__END__REPLACE__DIRNAME__/gm,
  `// __START__REPLACE__DIRNAME__\nimport { dirname } from 'path';\nimport { fileURLToPath } from 'url';\nconst _dirname = dirname(fileURLToPath(import.meta.url));\n// __END__REPLACE__DIRNAME__`
);

contents = contents.replace(
  /\/\/\s+__START__REPLACE__REQUIRE__((.|\r|\n)*)__END__REPLACE__REQUIRE__/gm,
  `// __START__REPLACE__REQUIRE__\nimport { createRequire } from 'module';\nconst _require = createRequire(import.meta.url);\n// __END__REPLACE__REQUIRE__`
);

fs.writeFileSync('./src/cpu_profiler.ts', contents, 'utf8');
