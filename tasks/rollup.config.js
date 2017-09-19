import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'

// https://rollupjs.org/#javascript-api
export default {
	input: 'src/aframe-space-navigator-controls.js',
	indent: '\t',
	sourcemap: false,
	plugins: [
		commonjs(),
		resolve()
	],
	watch: {
		include: 'src/**'
	},
	output: [
		{
			format: 'iife',
			banner: '// https://github.com/archilogic-com/aframe-space-navigator-controls',
			name: 'spaceNavigator', // and global object name in browser environment
			globals: {
				THREE: 'THREE',
				AFRAME: 'AFRAME'
			},
			file: 'dist/aframe-space-navigator-controls.js'
		}
	]
}