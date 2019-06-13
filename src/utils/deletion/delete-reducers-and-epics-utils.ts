import { ModuleOptions } from "@schematics/angular/utility/find-module";
import { Tree, SchematicsException, Rule } from "@angular-devkit/schematics";
// import { Change, InsertChange, NoopChange } from '@schematics/angular/utility/change';
import { AddReducersAndEpicsContext, createAddReducersAndEpicsContext } from '../context/reducers-and-epics-context';
// import { classify } from '@angular-devkit/core/src/utils/strings';

function deleteReducerImport (context: AddReducersAndEpicsContext, host: Tree) {

  const text = host.read(context.storePath);
  if (!text) throw new SchematicsException(`Store Class does not exist.`);
  const sourceText = text.toString('utf-8');
  console.log(sourceText);
  // array that is contains the lines in the code
  const sourceCodeLinesArr = sourceText.split('\n');

  console.log(sourceCodeLinesArr);

  // the position of the import to delete
  const reducerImportPosition = sourceCodeLinesArr.indexOf(`import { ${context.reducerName} } from ${context.reducerRelativeFileName}';`);

  console.log('POSITION',reducerImportPosition);
  console.log(`import { ${context.reducerName} } from '${context.reducerRelativeFileName};'`);

  if (reducerImportPosition !== -1) {
    // remove the line from the code and join the array again to a string
    const newContent = sourceCodeLinesArr.splice(reducerImportPosition,1).join('\n');
    host.overwrite(context.storePath, newContent);
  }
}


// function deleteReducerFromStore (context: AddReducersAndEpicsContext, host: Tree) {
//
//     let text = host.read(context.storePath);
//     if (!text) throw new SchematicsException(`Store Class does not exist.`);
//     let sourceText = text.toString('utf-8');
//
//     // create the typescript source file of the store class
//     let storeClassFile = ts.createSourceFile(context.storePath, sourceText, ts.ScriptTarget.Latest, true);
//
//     // get the nodes of the source file
//     let nodes: ts.Node[] = getSourceNodes(storeClassFile);
//     console.log(context.reducerName)
//
//     let currentReducerNode = nodes.find(n => n.getText() === context.reducerName && n.kind === ts.SyntaxKind.Identifier);
//
//     if (!currentReducerNode) {
//       throw new SchematicsException(`currentReducerNode is not defined`);
//     }
//
//     let reducerToDelete = `
//     ${context.reducerName}`;
//
//
//     // let constructorNode = nodes.find(n => n.kind == ts.SyntaxKind.Constructor);
//
//     return new MidgardRemoveChange(context.storePath, currentReducerNode.getEnd() - reducerToDelete.length, reducerToDelete);
//
//     // const changesArr = [
//     //     new MidgardRemoveChange(context.storePath, reducersListNode.getEnd() - reducerToDelete.length, reducerToDelete),
//     //     new MidgardRemoveChange(context.storePath, epicsListNode.getEnd() - epicToDelete.length, epicToDelete),
//     //     // deleteConstructorArgument(context, constructorNode),
//     //     // merge two arrays
//     //     // insertImport(storeClassFile, context.storePath, context.reducerName, context.reducerRelativeFileName),
//     //     // insertImport(storeClassFile, context.storePath, classify(context.epicName), context.epicRelativeFileName)
//     // ];
//
//     // return changesArr;
// }

// function deleteEpicFromStore (context: AddReducersAndEpicsContext, host: Tree) {
//
//   let text = host.read(context.storePath);
//   if (!text) throw new SchematicsException(`Store Class does not exist.`);
//   let sourceText = text.toString('utf-8');
//
//   // create the typescript source file of the store class
//   let storeClassFile = ts.createSourceFile(context.storePath, sourceText, ts.ScriptTarget.Latest, true);
//
//   // get the nodes of the source file
//   let nodes: ts.Node[] = getSourceNodes(storeClassFile);
//
//   // find the epics node
//   const epicsNode = nodes.find(n => n.kind === ts.SyntaxKind.Identifier && n.getText() === 'epics');
//
//   if (!epicsNode || !epicsNode.parent) {
//     throw new SchematicsException(`expected reducers variable in ${context.storePath}`);
//   }
//
//   // define epics sibling nodes
//   let epicsNodeSiblings = epicsNode.parent.getChildren();
//   let epicsNodeIndex = epicsNodeSiblings.indexOf(epicsNode);
//   epicsNodeSiblings = epicsNodeSiblings.slice(epicsNodeIndex);
//
//   // get epics array literal experssion
//   let epicsArrayLiteralExpressionNode = epicsNodeSiblings.find(n => n.kind === ts.SyntaxKind.ArrayLiteralExpression);
//
//   if (!epicsArrayLiteralExpressionNode) {
//     throw new SchematicsException(`epicsArrayLiteralExpressionNode is not defined`);
//   }
//
//   // get epics array list node
//   let epicsListNode = epicsArrayLiteralExpressionNode.getChildren().find(n => n.kind === ts.SyntaxKind.SyntaxList);
//
//   if (!epicsListNode) {
//     throw new SchematicsException(`epicsListNode is not defined`);
//   }
//
//   let epicToDelete = `
//     ${context.epicName}`;
//
//
//   return new MidgardRemoveChange(context.storePath, epicsListNode.getEnd() - epicToDelete.length, epicToDelete);
// }

// function deleteEpicsfromStoreModuleProviders (context: AddReducersAndEpicsContext, host: Tree): Change[] {
//
//     let text = host.read(context.storeModulePath);
//     if (!text) throw new SchematicsException(`Store module does not exist.`);
//     let sourceText = text.toString('utf-8');
//     // create the typescript source file of the store module
//     let storeModuleFile = ts.createSourceFile(context.storeModulePath, sourceText, ts.ScriptTarget.Latest, true);
//     return addProviderToModule(storeModuleFile, context.storeModulePath, classify(context.epicName), context.epicRelativeFileName)
// }

// function deleteConstructorArgument(context: AddReducersAndEpicsContext, constructorNode: ts.Node): Change {
//
//     let siblings = constructorNode.getChildren();
//
//     let parameterListNode = siblings.find(n => n.kind === ts.SyntaxKind.SyntaxList);
//
//     if (!parameterListNode) {
//         throw new SchematicsException(`expected constructor in ${context.storePath} to have a parameter list`);
//     }
//
//     let parameterNodes = parameterListNode.getChildren();
//
//     //This function retrieves all child nodes of the constructor and searches for a SyntaxList (=the parameter list) node having
//     // a TypeReference child which in turn has a Identifier child.
//     let paramNode = parameterNodes.find(p => {
//         let typeNode = findSuccessor(p, [ts.SyntaxKind.TypeReference, ts.SyntaxKind.Identifier]);
//         if (!typeNode) return false;
//         return typeNode.getText() === classify(context.epicName);
//     });
//
//     // There is already a respective constructor argument --> nothing to do for us here ...
//     if (paramNode) return new NoopChange();
//
//     // Is the new argument the first one?
//     if (!paramNode && parameterNodes.length == 0) {
//         let toDelete = `private ${context.epicName}: ${classify(context.epicName)}`;
//         return new InsertChange(context.storePath, parameterListNode.pos, toDelete);
//     }
//     else if (!paramNode && parameterNodes.length > 0) {
//         let toDelete = `,
//     private ${context.epicName}: ${classify(context.epicName)}`;
//         let lastParameter = parameterNodes[parameterNodes.length-1];
//         return new InsertChange(context.storePath, lastParameter.end, toDelete);
//     }
//
//     return new NoopChange();
// }

// function findSuccessor(node: ts.Node, searchPath: ts.SyntaxKind[] ) {
//     let children = node.getChildren();
//     let next: ts.Node | undefined = undefined;
//
//     for(let syntaxKind of searchPath) {
//         next = children.find(n => n.kind == syntaxKind);
//         if (!next) return null;
//         children = next.getChildren();
//     }
//     return next;
// }


export function deleteReducersAndEpicsRule (options: ModuleOptions): Rule {
    return (host: Tree) => {
        const context = createAddReducersAndEpicsContext(options);
        deleteReducerImport(context, host);
        return host;
    };
}
