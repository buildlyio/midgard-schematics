import { camelize, dasherize } from '@angular-devkit/core/src/utils/strings';
import { ModuleOptions } from '@schematics/angular/utility/find-module';

export class AddReducersAndEpicsContext {
    storePath: string; // path of the store class
    storeModulePath: string; // path of the store module
    reducerName: string; // name of the reducer to add
    reducerRelativeFileName: string; // reducer relative file name
    epicName: string; // name of the epic to add
    epicRelativeFileName: string; // epic relative file name
}

export function createAddReducersAndEpicsContext(options: ModuleOptions): AddReducersAndEpicsContext {

  let storePath = 'src/midgard/modules/store/store.ts';
  let storeModulePath = 'src/midgard/modules/store/store.module.ts';
  let reducerName = camelize(`${options.name}Reducer`)
  let epicName = camelize(`${options.name}Epics`);
  let reducerRelativeFileName = `@clients/${options.name}/src/lib/state/${dasherize(options.name)}.reducer`;
  let epicRelativeFileName = `@clients/${options.name}/src/lib/state/${dasherize(options.name)}.epics`;

  return {
    storePath,
    storeModulePath,
    reducerName,
    reducerRelativeFileName,
    epicName,
    epicRelativeFileName
  }
}
