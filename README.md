# Midgard-schematics

Midgard-schematics is an npm package that uses [@angular-devkit/schematics](https://www.npmjs.com/package/@angular-devkit/schematics) and [gulp.js](https://gulpjs.com/) to clone the repositories of all the frontend clients in a Walhall application and auto-generate the necessary code to build a single UI. 

## Usage

The Walhall application will run the schematics gulp commands when it initializes (`npm run init`), utilizing `midgard-schematics` as a dev-dependency. 

To use this package for local development, you need to install [gulp-cli](https://github.com/gulpjs/gulp-cli) globally.

The gulp command looks like this:

`gulp <taskname> --gulpfile node_modules/midgard-schematics/lib/gulpfile.js [--cwd optional_custom_execution_path]`

Example:

`gulp schematics --gulpfile node_modules/midgard-schematics/lib/gulpfile.js`

The gulp task will clone the application's frontend clients to the `projects` folder in your application root, install each client as an npm package, and make the following configuration modifications: 

1.  `tsconfig.json`: Add the client's paths to the `paths` object.
2.  `angular.json`: Add the Angular configurations of the imported client.
3.  `src/tsconfig.app.json`: Include the client's TypeScript files in the application's TypeScript compilation.
4.  `projects/midgard-angular/src/lib/midgard-routing.module.ts`: Add the client's routes to the Midgard-Angular routing component.
5.  `projects/midgard-angular/src/lib/modules/store/store.ts`: Add the reducers and the epics to the Midgard-Angular Redux store.
6.  `[DOM]`: Add exit point component to the DOM depending on the exitPointComponent defined in the Walhall application's configuration.

## Available schematics rules

The aforementioned configuration modifications are carried out according to different schematics rules that can be found under `src/utils`:

1.  `updateTsConfigRule(options)`: Updates `tsconfig.json`.
2.  `addLibraryToWorkspaceFileRule(options)`: Updates `angular.json`.
3.  `updateAppTsConfigRule(options)`: Updates `src/tsconfig.app.json`.
4.  `addRouteRule(options)`: Responsible for adding routes to `midgard-routing.module.ts`.
5.  `addAddReducersAndEpicsRule(options)`: Responsible for adding epics and reducers to the Redux store.
6.  `addExitPointRule(options)`: Responsible for adding an exitPoint element to the DOM.

<!-- Need more details -->
<!-- Midgard-schematics has separate compodoc - this is going to be a bigger task -->

