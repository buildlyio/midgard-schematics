To use this package, you need to install gulp-cli globally. The Gulp commands are meant to be invoked from within a Walhall application which has midgard-schematics as a dev-dependency.

Usage:
gulp <taskname> --gulpfile node_modules/midgard-schematics/lib/gulpfile.js [--cwd optional_custom_execution_path]

for example:
gulp schematics --gulpfile node_modules/midgard-schematics/lib/gulpfile.js