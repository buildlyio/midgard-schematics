import { ModuleOptions } from "@schematics/angular/utility/find-module";
import { AddRouteContext, createAddRouteContext } from '../context/routes-context';
import { Tree, SchematicsException, Rule } from "@angular-devkit/schematics";
import { removeStringFromContent } from '../remove-util';

function deleteRouteFromChildrenRoutesArray (context: AddRouteContext, host: Tree, options: any) {

    let text = host.read(context.routingModulePath);
    if (!text) throw new SchematicsException(`Routing module does not exist.`);
    let sourceText = text.toString('utf-8');

    let toDelete;

    if(context.parentComponent === 'MidgardComponent') {
        toDelete = `,
      {path: '${options.name}', loadChildren: '@clients/${options.name}/src/lib/${options.name}.module#${context.moduleName}'}`;
    } else {
        toDelete = `,
          {path: '${options.name}', loadChildren: '@clients/${options.name}/src/lib/${options.name}.module#${context.moduleName}', outlet: '${options.name}'}`;
    }
      const newContent = removeStringFromContent(sourceText, toDelete);
      host.overwrite(context.routingModulePath, newContent);
}


export function deleteRouteRule (options: ModuleOptions): Rule {
    return (host: Tree) => {
        let context = createAddRouteContext(options);
        deleteRouteFromChildrenRoutesArray(context, host, options);
        return host;
    };
}
