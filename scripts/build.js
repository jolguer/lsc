// Minifica src/ y deja el sitio listo en dist/
const fs = require('fs'), path = require('path');
const { minify } = require('terser');
const csso = require('csso');
const SRC = 'src', OUT = 'dist';
(async () => {
  fs.rmSync(OUT, { recursive: true, force: true });
  fs.mkdirSync(path.join(OUT, 'assets'), { recursive: true });
  fs.copyFileSync(path.join(SRC, 'index.html'), path.join(OUT, 'index.html'));
  fs.writeFileSync(path.join(OUT, 'assets/styles.css'),
    csso.minify(fs.readFileSync(path.join(SRC, 'assets/styles.css'), 'utf8')).css);
  for (const f of ['app.js', 'lexicon.js']) {
    const r = await minify(fs.readFileSync(path.join(SRC, 'assets', f), 'utf8'), { compress: true, mangle: true });
    if (r.error) throw r.error;
    fs.writeFileSync(path.join(OUT, 'assets', f), r.code);
  }
  fs.copyFileSync('NOTICE.md', path.join(OUT, 'NOTICE.md'));
  for (const f of fs.readdirSync(path.join(OUT, 'assets')))
    console.log('dist/assets/' + f, fs.statSync(path.join(OUT, 'assets', f)).size, 'bytes');
})().catch(e => { console.error(e); process.exit(1); });
