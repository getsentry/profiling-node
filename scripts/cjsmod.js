const fs = require('fs');
let contents = fs.readFileSync('./src/cpu_profiler.ts', 'utf8');

contents = contents.replace(
  /\/\/\s+__START__REPLACE__DIRNAME__((.|\r|\n)*)__END__REPLACE__DIRNAME__/gm,
  'const _dirname = __dirname;'
);

contents = contents.replace(
  /\/\/\s+__START__REPLACE__REQUIRE__((.|\r|\n)*)__END__REPLACE__REQUIRE__/gm,
  'const _require = require;'
);

fs.writeFileSync('./src/cpu_profiler.ts', contents, 'utf8');
