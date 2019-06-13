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
function deleteImport (context: AddReducersAndEpicsContext, host: Tree, type: 'epic' | 'reducer') {

  const text = host.read(context.storePath);
  if (!text) throw new SchematicsException(`Store Class does not exist.`);
  const sourceText = text.toString('utf-8');

  let name;
  let relativeFileName;

  if (type === 'epic') {
    name = classify(context.epicName)
    relativeFileName = context.epicRelativeFileName;
  } else {
    name = context.reducerName;
    relativeFileName = context.reducerRelativeFileName;
  }

  const importToRemove = `import { ${name} } from '${relativeFileName}';`;

  const newContent = removeStringFromContent(sourceText, importToRemove);

  host.overwrite(context.storePath, newContent);
}


function deleteReducerFromStore (context: AddReducersAndEpicsContext, host: Tree) {
  const text = host.read(context.storePath);
  if (!text) throw new SchematicsException(`Store Class does not exist.`);
  const sourceText = text.toString('utf-8');

  const newContent = removeStringFromContent(sourceText, context.reducerName);

  host.overwrite(context.storePath, newContent);
}

function deleteEpicFromStoreConstructor (context: AddReducersAndEpicsContext, host: Tree) {
  const text = host.read(context.storePath);
  if (!text) throw new SchematicsException(`Store Class does not exist.`);
  const sourceText = text.toString('utf-8');

  const newContent = removeStringFromContent(sourceText, `private ${context.epicName}: ${classify(context.epicName)}`);

  host.overwrite(context.storePath, newContent);
}

function deleteEpicFromStore (context: AddReducersAndEpicsContext, host: Tree) {
  const text = host.read(context.storePath);
  if (!text) throw new SchematicsException(`Store Class does not exist.`);
  const sourceText = text.toString('utf-8');

  const newContent = removeStringFromContent(sourceText, context.epicName);

  host.overwrite(context.storePath, newContent);
}

// function deleteEpicsfromStoreModuleProviders (context: AddReducersAndEpicsContext, host: Tree): Change[] {
//
//     let text = host.read(context.storeModulePath);
//     if (!text) throw new SchematicsException(`Store module does not exist.`);
//     let sourceText = text.toString('utf-8');
//     // create the typescript source file of the store module
//     let storeModuleFile = ts.createSourceFile(context.storeModulePath, sourceText, ts.ScriptTarget.Latest, true);
//     return addProviderToModule(storeModuleFile, context.storeModulePath, classify(context.epicName), context.epicRelativeFileName)
// }

export function deleteReducersAndEpicsRule (options: ModuleOptions): Rule {
    return (host: Tree) => {
        const context = createAddReducersAndEpicsContext(options);
        deleteImport(context, host, 'reducer');
        deleteImport(context, host, 'epic');
        deleteReducerFromStore(context, host);
        deleteEpicFromStoreConstructor(context,host);
        // deleteEpicFromStore(context,host);
      return host;
    };
}
