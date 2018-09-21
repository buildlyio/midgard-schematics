import { Rule, SchematicsException, Tree } from "@angular-devkit/schematics";
import { ModuleOptions } from "@schematics/angular/utility/find-module";
import { capitalize } from "@angular-devkit/core/src/utils/strings";
import { JSDOM } from 'jsdom'

export function addNavigationElementRule (options: ModuleOptions): Rule {
    return (host: Tree) => {
        const navigationPath = 'projects/midgard-angular/src/lib/components/nav-bar/nav-bar.component.html'; // we can get this from options as well for more flexibility
        const content: Buffer | null = host.read(navigationPath);
        let strContent: string = '';
        if(content) strContent = content.toString('utf8');
        const dom = new JSDOM(strContent);
        const navBarElem = dom.window.document.querySelector(".nav-bar");
        const contentToInsert = dom.window.document.createElement(`<div class="nav-bar__elem">
            <a [routerLink]="['/${options.name}']">
                <i class="fas fa-store"></i>
                ${capitalize(options.name)}
            </a>
        </div>`);
        if(!navBarElem || !navBarElem.parentNode) {
            throw new SchematicsException(`Navbar element is not defined`);
        }
        navBarElem.parentNode.insertBefore(contentToInsert, navBarElem.nextSibling);
        host.overwrite(navigationPath, dom.window.document.body.toString());
        return host;
    };
}
