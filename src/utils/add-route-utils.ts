import { ModuleOptions } from "@schematics/angular/utility/find-module";
import { AddRouteContext } from "./add-route-context";
import { Tree, SchematicsException, Rule } from "@angular-devkit/schematics";
import { classify } from "@angular-devkit/core/src/utils/strings";
import * as ts from 'typescript';
import { Change, InsertChange } from "@schematics/angular/utility/change";
import { getSourceNodes } from "@schematics/angular/utility/ast-utils";

function createAddRouteContext(options: any): AddRouteContext {

    let routingModulePath = options.routingModuleOptionsPath;
    let parentComponent = options.routingModuleOptionsParentComponent;
    let childrenArrayIndex = Number(options.routingModuleOptionsChildrenArrayIndex);
    let moduleName = classify(`${options.name}Module`);

    return {
        routingModulePath,
        parentComponent,
        moduleName,
        childrenArrayIndex
    }
}

function addRouteToChildrenRoutesArray (context: AddRouteContext, host: Tree, options: any): Change {

    let text = host.read(context.routingModulePath);
    if (!text) throw new SchematicsException(`Routing module does not exist.`);
    let sourceText = text.toString('utf-8');

    // create the typescript source file
    let sourceFile = ts.createSourceFile(context.routingModulePath, sourceText, ts.ScriptTarget.Latest, true);

    // get the nodes of the source file
    let nodes: ts.Node[] = getSourceNodes(sourceFile);


    console.log(nodes.find(n => n.getText() === options.name))
    console.log(nodes.filter(n => n.getText() === options.name))
    // validate if the route exists
    if (nodes.find(n => n.getText() === options.name)){
        throw new SchematicsException(`module already exists`);
    }

    // find the children routes node
    let listNode = findListNode(nodes, context.childrenArrayIndex);

    if(context.parentComponent === 'MidgardComponent') {
        let toAdd = `,
      {path: '${options.name}', loadChildren: '@libs/${options.name}/src/lib/${options.name}.module#${context.moduleName}'}`;

        return new InsertChange(context.routingModulePath, listNode.getEnd(), toAdd);
    } else {
        let parentComponentListNode = findListNode(nodes, context.childrenArrayIndex);

        let toAdd = `,
          {path: '${options.name}', loadChildren: '@libs/${options.name}/src/lib/${options.name}.module#${context.moduleName}', outlet: '${options.name}'}`;

        return new InsertChange(context.routingModulePath, parentComponentListNode.getEnd(), toAdd);
    }

}

function findListNode(nodes: ts.Node[], occurence: number) {
    let childrenComponentNodeArr = nodes.filter(n => ts.SyntaxKind.Identifier && n.getText() === 'children');

    if (!childrenComponentNodeArr[occurence] || !childrenComponentNodeArr[occurence].parent) {
        throw new SchematicsException(`node not found`);
    }

    let NodeSiblings = childrenComponentNodeArr[occurence].parent.getChildren();
    let NodeIndex = NodeSiblings.indexOf(childrenComponentNodeArr[occurence]);
    NodeSiblings = NodeSiblings.slice(NodeIndex);

    let ArrayLiteralExpressionNode = NodeSiblings.find(n => n.kind === ts.SyntaxKind.ArrayLiteralExpression);

    if (!ArrayLiteralExpressionNode) {
        throw new SchematicsException(`arrayLiteralExpressionNode is not defined`);
    }

    let listNode = ArrayLiteralExpressionNode.getChildren().find(n => n.kind === ts.SyntaxKind.SyntaxList);

    if (!listNode) {
        throw new SchematicsException(`listNode is not defined`);
    }

    return listNode;
}

export function addRouteRule (options: ModuleOptions): Rule {
    return (host: Tree) => {
        let context = createAddRouteContext(options);
        let change = addRouteToChildrenRoutesArray(context, host, options);

        const declarationRecorder = host.beginUpdate(context.routingModulePath);
        if (change instanceof InsertChange) {
            declarationRecorder.insertLeft(change.pos, change.toAdd);
        }
        host.commitUpdate(declarationRecorder);

        return host;
    };
}

// export function constructDestinationPath(options: any): string {
//
//     return '/' + (options.sourceDir? options.sourceDir + '/' : '') + (options.path || '')
//         + (options.flat ? '' : '/' + dasherize(options.name));
// }
