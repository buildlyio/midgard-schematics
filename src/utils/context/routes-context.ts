import { classify } from '@angular-devkit/core/src/utils/strings';

export class AddRouteContext {
    routingModulePath: string; // path of the routing module
    moduleName: string; // name of the module to add
    parentComponent: string // parent route
    childrenArrayIndex: number // index of the children array to be inserted to
}

export function createAddRouteContext(options: any): AddRouteContext {

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
