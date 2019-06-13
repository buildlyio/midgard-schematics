import { ModuleOptions } from "@schematics/angular/utility/find-module";
import { Tree, SchematicsException, Rule } from '@angular-devkit/schematics';
// import { Change, InsertChange, NoopChange } from '@schematics/angular/utility/change';
import { AddReducersAndEpicsContext, createAddReducersAndEpicsContext } from '../context/reducers-and-epics-context';
import { removeStringFromContent } from '../remove-util';
import { classify } from '@angular-devkit/core/src/utils/strings';
// import { classify } from '@angular-devkit/core/src/utils/strings';

/**
 * deletes import of an epic a reducer
 * @param {AddReducersAndEpicsContext} context
 * @param {Tree} host
 * @param {"epic" | "reducer"} type - wether the import is for epic or reducer
 */
function deleteImport (filePath: string, context: AddReducersAndEpicsContext, host: Tree, type: 'epic' | 'reducer') {

  const text = host.read(filePath);
  if (!text) throw new SchematicsException(`Store Class does not exist.`);
  const sourceText = text.toString('utf-8');

  let name;
  let relativeFileName;

  if (type === 'epic') {
    name = classify(context.epicName);
    relativeFileName = context.epicRelativeFileName;
  } else {
    name = context.reducerName;
    relativeFileName = context.reducerRelativeFileName;
  }

  const importToRemove = `import { ${name} } from '${relativeFileName}';`;

  const newContent = removeStringFromContent(sourceText, importToRemove);

  host.overwrite(filePath, newContent);
}


function deleteReducerFromStore (context: AddReducersAndEpicsContext, host: Tree) {
  const text = host.read(context.storePath);
  if (!text) throw new SchematicsException(`Store Class does not exist.`);
  const sourceText = text.toString('utf-8');

  let reducerToDelete = `,
        ${context.reducerName}`;

  const newContent = removeStringFromContent(sourceText, reducerToDelete);

  host.overwrite(context.storePath, newContent);
}

function deleteEpicFromStoreConstructor (context: AddReducersAndEpicsContext, host: Tree) {
  const text = host.read(context.storePath);
  if (!text) throw new SchematicsException(`Store Class does not exist.`);
  const sourceText = text.toString('utf-8');

  const toDelete = `,
    private ${context.epicName}: ${classify(context.epicName)}`;

  const newContent = removeStringFromContent(sourceText, toDelete);

  host.overwrite(context.storePath, newContent);
}

function deleteEpicFromStore (context: AddReducersAndEpicsContext, host: Tree) {
  const text = host.read(context.storePath);
  if (!text) throw new SchematicsException(`Store Class does not exist.`);
  const sourceText = text.toString('utf-8');

  let epicToDelete = `,
        ${context.epicName}`;

  const newContent = removeStringFromContent(sourceText, epicToDelete);

  host.overwrite(context.storePath, newContent);
}

function deleteEpicfromStoreModuleProviders (context: AddReducersAndEpicsContext, host: Tree) {
  const text = host.read(context.storeModulePath);
  if (!text) throw new SchematicsException(`Store Class does not exist.`);
  const sourceText = text.toString('utf-8');


  let epicToDelete = `,
    ${classify(context.epicName)}`;

  const newContent = removeStringFromContent(sourceText, epicToDelete);

  host.overwrite(context.storeModulePath, newContent);
}


export function deleteReducersAndEpicsRule (options: ModuleOptions): Rule {
    return (host: Tree) => {
        const context = createAddReducersAndEpicsContext(options);
        deleteImport(context.storePath, context, host, 'reducer');
        deleteImport(context.storePath, context, host, 'epic');
        deleteReducerFromStore(context, host);
        deleteEpicFromStoreConstructor(context,host);
        deleteEpicFromStore(context,host);
        deleteEpicfromStoreModuleProviders(context, host);
        deleteImport(context.storeModulePath, context, host, 'epic');
      return host;
    };
}
