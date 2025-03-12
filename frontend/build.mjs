import * as esbuild from 'esbuild'

await esbuild.build({
    entryPoints: ['./src/script.ts'],
    bundle: true,
    outfile: './dist/bundle.js',      // Output the bundled file to dist/bundle.js
    minify: true,                     // Optionally, minify the code for production
    sourcemap: true,                  // Optionally, generate a sourcemap for debugging
})