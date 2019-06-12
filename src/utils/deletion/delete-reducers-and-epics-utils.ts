import { ModuleOptions } from "@schematics/angular/utility/find-module";
import { Tree, SchematicsException, Rule } from "@angular-devkit/schematics";
import * as ts from 'typescript';
import { Change, InsertChange, NoopChange } from '@schematics/angular/utility/change';
import { getSourceNodes } from '@schematics/angular/utility/ast-utils';
import { AddReducersAndEpicsContext, createAddReducersAndEpicsContext } from '../context/reducers-and-epics-context';
import { classify } from '@angular-devkit/core/src/utils/strings';

function deleteReducersAndEpicsFromStore (context: AddReducersAndEpicsContext, host: Tree) {

    let text = host.read(context.storePath);
    if (!text) throw new SchematicsException(`Store Class does not exist.`);
    let sourceText = text.toString('utf-8');

    // create the typescript source file of the store class
    let storeClassFile = ts.createSourceFile(context.storePath, sourceText, ts.ScriptTarget.Latest, true);

    // get the nodes of the source file
    let nodes: ts.Node[] = getSourceNodes(storeClassFile);
    // find the reducers node
    const reducersNode = nodes.find(n => n.kind === ts.SyntaxKind.Identifier && n.getText() === 'reducers');

    if (!reducersNode || !reducersNode.parent) {
        throw new SchematicsException(`expected reducers variable in ${context.storePath}`);
    }

    // find the epics node
    const epicsNode = nodes.find(n => n.kind === ts.SyntaxKind.Identifier && n.getText() === 'epics');

    if (!epicsNode || !epicsNode.parent) {
        throw new SchematicsException(`expected reducers variable in ${context.storePath}`);
    }

    // define reducers sibling nodes
    let reducersNodeSiblings = reducersNode.parent.getChildren();
    let reducersNodeIndex = reducersNodeSiblings.indexOf(reducersNode);
    reducersNodeSiblings = reducersNodeSiblings.slice(reducersNodeIndex);

    // define epics sibling nodes
    let epicsNodeSiblings = epicsNode.parent.getChildren();
    let epicsNodeIndex = epicsNodeSiblings.indexOf(epicsNode);
    epicsNodeSiblings = epicsNodeSiblings.slice(epicsNodeIndex);

    // get reducers array literal experssion
    let reducersObjectLiteralExpressionNode = reducersNodeSiblings.find(n => n.kind === ts.SyntaxKind.ObjectLiteralExpression);

    if (!reducersObjectLiteralExpressionNode) {
        throw new SchematicsException(`reducersArrayLiteralExpressionNode is not defined`);
    }

    // get epics array literal experssion
    let epicsArrayLiteralExpressionNode = epicsNodeSiblings.find(n => n.kind === ts.SyntaxKind.ArrayLiteralExpression);

    if (!epicsArrayLiteralExpressionNode) {
        throw new SchematicsException(`epicsArrayLiteralExpressionNode is not defined`);
    }

    // get reducers array list node
    let reducersListNode = reducersObjectLiteralExpressionNode.getChildren().find(n => n.kind === ts.SyntaxKind.SyntaxList);

    if (!reducersListNode) {
        throw new SchematicsException(`reducersListNode is not defined`);
    }

    // get epics array list node
    let epicsListNode = epicsArrayLiteralExpressionNode.getChildren().find(n => n.kind === ts.SyntaxKind.SyntaxList);

    if (!epicsListNode) {
        throw new SchematicsException(`epicsListNode is not defined`);
    }

    let reducerToDelete = `
    ${context.reducerName}`;

    let epicToDelete = `
    ${context.epicName}`;


    // let constructorNode = nodes.find(n => n.kind == ts.SyntaxKind.Constructor);

    const changesArr = [
        new MidgardRemoveChange(context.storePath, reducersListNode.getEnd() - reducerToDelete.length, reducerToDelete),
        new MidgardRemoveChange(context.storePath, epicsListNode.getEnd() - epicToDelete.length, epicToDelete),
        // deleteConstructorArgument(context, constructorNode),
        // merge two arrays
        // insertImport(storeClassFile, context.storePath, context.reducerName, context.reducerRelativeFileName),
        // insertImport(storeClassFile, context.storePath, classify(context.epicName), context.epicRelativeFileName)
    ];

    return changesArr;
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
        let context = createAddReducersAndEpicsContext(options);
        let storeChanges = deleteReducersAndEpicsFromStore(context, host);
        // let storeModuleChanges = deleteEpicsfromStoreModuleProviders(context, host);

        // const storeChangesRecorder = host.beginUpdate(context.storePath);
        for (let change of storeChanges) {
           change.apply(host);
        }

        // const storeModuleRecorder = host.beginUpdate(context.storeModulePath);
        // for (let change of storeModuleChanges) {
        //     if (change instanceof InsertChange) {
        //         storeModuleRecorder.insertLeft(change.pos, change.toAdd);
        //     }
        // }
        // host.commitUpdate(storeChangesRecorder);
        // host.commitUpdate(storeModuleRecorder);

        return host;
    };
}


/**
 * Will remove text from the source code.
 */
export class MidgardRemoveChange {

  order: number;
  description: string;

  constructor(public path: string, private pos: number, private toRemove: string) {
    if (pos < 0) {
      throw new Error('Negative positions are invalid');
    }
    this.description = `Removed ${toRemove} into position ${pos} of ${path}`;
    this.order = pos;
  }

  apply(host: Tree): Tree {
      const content = host.read(this.path).toString();
      const prefix = content.substring(0, this.pos);
      const suffix = content.substring(this.pos + this.toRemove.length);
      // TODO: throw error if toRemove doesn't match removed string.
      host.overwrite(this.path, `${prefix}${suffix}`);
      return host
  }
}
