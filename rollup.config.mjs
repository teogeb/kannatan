import esbuild, { minify } from 'rollup-plugin-esbuild'

const bundle = config => ({
  ...config,
  input: 'src/index.ts'
})

export default [
  bundle({
    plugins: [esbuild({
      optimizeDeps: {
        include: ['lodash-es']
      }
    }), minify()],
    external: ['fs/promises'],
    output: [
      {
        file: `dist/index.mjs`,
        format: 'es',
        sourcemap: false
      }
    ]
  })
]