import { ModuleOptions } from "@schematics/angular/utility/find-module";
import { AddRouteContext } from "./add-route-context";
import { Tree, SchematicsException, Rule } from "@angular-devkit/schematics";
import { classify } from "@angular-devkit/core/src/utils/strings";
import * as ts from 'typescript';
import { Change, InsertChange } from "@schematics/angular/utility/change";
import { getSourceNodes } from "@schematics/angular/utility/ast-utils";

function createAddRouteContext(options: ModuleOptions): AddRouteContext {

    let routingModuleFileName = 'projects/midgard-angular/src/lib/midgard.routing-module.ts';
    let moduleName = classify(`${options.name}Module`);

    return {
        routingModuleFileName,
        moduleName
    }
}

function addRouteToChildrenRoutesArray (context: AddRouteContext, host: Tree, options: ModuleOptions): Change {

    let text = host.read(context.routingModuleFileName);
    if (!text) throw new SchematicsException(`Routing module does not exist.`);
    let sourceText = text.toString('utf-8');

    // create the typescript source file
    let sourceFile = ts.createSourceFile(context.routingModuleFileName, sourceText, ts.ScriptTarget.Latest, true);

    // get the nodes of the source file
    let nodes: ts.Node[] = getSourceNodes(sourceFile);
    // find the children routes node
    const childrenRoutesNode = nodes.find(n => n.kind === ts.SyntaxKind.Identifier && n.getText() === 'children');

    if (!childrenRoutesNode || !childrenRoutesNode.parent) {
        throw new SchematicsException(`expected routes variable in ${context.routingModuleFileName}`);
    }

    let childrenRoutesNodeSiblings = childrenRoutesNode.parent.getChildren();
    let childrenRoutesNodeIndex = childrenRoutesNodeSiblings.indexOf(childrenRoutesNode);
    childrenRoutesNodeSiblings = childrenRoutesNodeSiblings.slice(childrenRoutesNodeIndex);

    let arrayLiteralExpressionNode = childrenRoutesNodeSiblings.find(n => n.kind === ts.SyntaxKind.ArrayLiteralExpression);

    if (!arrayLiteralExpressionNode) {
        throw new SchematicsException(`arrayLiteralExpressionNode is not defined`);
    }

    let listNode = arrayLiteralExpressionNode.getChildren().find(n => n.kind === ts.SyntaxKind.SyntaxList);

    if (!listNode) {
        throw new SchematicsException(`listNode is not defined`);
    }
    let toAdd = `,{path: '${options.name}', loadChildren: '@libs/midgard-angular/src/lib/${options.name}.module#${context.moduleName}'}`;
    return new InsertChange(context.routingModuleFileName, listNode.getEnd()+1, toAdd);
}

export function addRouteRule (options: ModuleOptions): Rule {
    return (host: Tree) => {
        let context = createAddRouteContext(options);
        let change = addRouteToChildrenRoutesArray(context, host, options);

        const declarationRecorder = host.beginUpdate(context.routingModuleFileName);
        if (change instanceof InsertChange) {
            declarationRecorder.insertLeft(change.pos, change.toAdd);
        }
        host.commitUpdate(declarationRecorder);

        return host;
    };
}

// function findFileByName(file: string, path: string, host: Tree): string {
//
//     let dir: any | null = host.getDir(path);
//
//     while(dir) {
//         let routingModuleFileName = dir.path + '/' + file;
//         if (host.exists(routingModuleFileName)) {
//             return routingModuleFileName;
//         }
//         dir = dir.parent;
//     }
//     throw new SchematicsException(`File ${file} not found in ${path} or one of its anchestors`);
// }

// export function constructDestinationPath(options: any): string {
//
//     return '/' + (options.sourceDir? options.sourceDir + '/' : '') + (options.path || '')
//         + (options.flat ? '' : '/' + dasherize(options.name));
// }
