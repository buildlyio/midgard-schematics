import { Rule, Tree } from "@angular-devkit/schematics";
import { ModuleOptions } from "@schematics/angular/utility/find-module";
import { getWorkspace, getWorkspacePath } from "@schematics/angular/utility/config";

interface UpdateJsonFn<T> {
    (obj: T): T | void;
}

type TsConfigPartialType = {
    include: string[]
};

// this function is a utility to update a json file, it is copied from @angular/dev-kit/packages/libray/index.ts
function updateJsonFile<T>(host: Tree, path: string, callback: UpdateJsonFn<T>): Tree {
    const source = host.read(path);
    if (source) {
        const sourceText = source.toString('utf-8');
        const json = JSON.parse(sourceText);
        callback(json);
        host.overwrite(path, JSON.stringify(json, null, 2));
    }

    return host;
}

/**
 * @description rule to update the application ts config file and add the imported module to the include array
 * @param {ModuleOptions} options
 * @returns {Rule}
 */
export function updateTsConfigRule (options: ModuleOptions): Rule {

    return (host: Tree) => {
        if (!host.exists('src/tsconfig.app.json')) { return host; }

        return updateJsonFile(host, 'src/tsconfig.app.json', (tsconfig: TsConfigPartialType) => {
            if (!tsconfig.include) {
                tsconfig.include = [];
            }
            tsconfig.include.push(`../projects/midgard-angular/src/lib/${options.name}.module.ts`);
        });
    };
}

/**
 * @description rule to update the application angular.json file and add the imported module to the projects array in the angular workspace
 * @param {ModuleOptions} options
 * @returns {Rule}
 */
export function addLibraryToWorkspaceFileRule(options: any): Rule {
    return (host: Tree) => {

        const workspace = getWorkspace(host);
        const projectRoot = `projects/${options.name}`;
        // tslint:disable-next-line:no-any
        const project: any = {
            root: `${projectRoot}`,
            projectType: 'library',
            architect: {
                build: {
                    builder: '@angular-devkit/build-ng-packagr:build',
                    options: {
                        project: `${projectRoot}/ng-package.json`,
                    },
                    configurations: {
                        production: {
                            project: `${projectRoot}/ng-package.prod.json`,
                        },
                    },
                },
                test: {
                    builder: '@angular-devkit/build-angular:karma',
                    options: {
                        main: `${projectRoot}/src/test.ts`,
                        tsConfig: `${projectRoot}/tsconfig.spec.json`,
                        karmaConfig: `${projectRoot}/karma.conf.js`,
                    },
                },
                lint: {
                    builder: '@angular-devkit/build-angular:tslint',
                    options: {
                        tsConfig: [
                            `${projectRoot}/tsconfig.lint.json`,
                            `${projectRoot}/tsconfig.spec.json`,
                        ],
                        exclude: [
                            '**/node_modules/**',
                        ],
                    },
                },
            },
        };

        workspace.projects[options.name] = project;
        host.overwrite(getWorkspacePath(host), JSON.stringify(workspace, null, 2));
    };
}
