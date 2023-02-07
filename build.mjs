import esbuild from 'esbuild';
import pkg from './package.json' assert { type: 'json' };

esbuild.build({
  entryPoints: ['cli/index.mjs'],
  outfile: './bin.min.mjs',
  bundle: true,
  write: true,
  treeShaking: true,
  sourcemap: false,
  minify: true,
  format: 'esm',
  platform: 'node',
  target: ['node16'],
	external: [
    ...Object.keys(pkg.dependencies),
  ],
});
