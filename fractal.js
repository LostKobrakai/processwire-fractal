'use strict';
const path = require('path');
const fractal = module.exports = require('@frctl/fractal').create();
const twigAdapter = require('frctl-twig');
const mandelbrot = require('@frctl/mandelbrot');
const defaultHandlePath = __dirname + '/site/fractal-handles.php';

/**
 * Global Settings
 */
fractal.set('project.title', 'Living Component Library');

/**
 * Webserver Settings
 */
const myCustomisedTheme = mandelbrot({
		skin: 'black',
		format: 'yaml',
		nav: ["docs", "components", "assets"]
});
myCustomisedTheme.addLoadPath(__dirname + '/fractal/theme-overrides');
fractal.web.theme(myCustomisedTheme); 
fractal.web.set('static.path', __dirname + '/site/templates');
fractal.web.set('builder.dest', __dirname + '/docs');

/**
 * Components Settings
 */
fractal.components.set('path', __dirname + '/site/templates/views');
fractal.components.set('default.preview', '@preview');
fractal.components.engine(twigAdapter);
fractal.components.set('ext', '.twig');

/**
 * Documentation Settings
 */
fractal.docs.set('path', __dirname + '/fractal/docs');

/**
 * Assets Settings
 */
fractal.assets.set('path', __dirname);

/**
 * Add build-handles command to fractal cli
 */
function buildPhpArray(args, done){
	const app = fractal;
	const fs = require('fs');
	const filename = args && args.options.file 
		? args.options.file 
		: defaultHandlePath;
	const location = path.dirname(filename);

	let file = "<?php\n\nreturn array(\n";
	app.components.flatten().toArray().concat(app.components.flattenDeep().toArray()).forEach(function(component){
		let relativePath = path.relative(location, component.viewPath)
		file += `\t"@${component.handle}"\n\t\t=> __DIR__ . "/${relativePath}",\n`;
	});
	file += `);\n`;

	fs.writeFile(filename, file, function(err) {
		if(err) return this.log(err);
		done();
	});
};

fractal.cli.command(
	'build-handles', 
	buildPhpArray, 
	{
		description: 'Lists components in the project',
		options: [ ['-f, --file <path>', 'The path to save the config file to.'] ]
	}
);

/**
 * Bind build-handles command to some events
 */
function automatedExport() {
	buildPhpArray(null, function(){});
}

// Export on component update while running the server with --sync
fractal.components.on('updated', function(source, eventData){
	automatedExport();
});

// Export on static build (might not be necessary)
fractal.web.builder().on('end', function(){
	automatedExport();
});
