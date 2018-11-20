import { Rule, Tree } from "@angular-devkit/schematics";
import * as cheerio from 'cheerio'

export function addExitPointRule (options: any): Rule {
    return (host: Tree) => {
        const navigationPath = options.parentExitPointComponentPath;
        const content: Buffer | null = host.read(navigationPath);
        let strContent: string = '';
        if(content) strContent = content.toString('utf8');
        const cheerioDom = cheerio.load(strContent);
        console.log(options.parentExitPointComponentElementId);
        const navBarElem = cheerioDom(`#${options.parentExitPointComponentElementId}`);
        const contentToInsert = `<${options.parentExitPointComponentSelector} label="${options.parentExitPointComponentLabel}"></${options.parentExitPointComponentSelector}>`;
        navBarElem.append(contentToInsert);
        // string content to append to the file
        const newFileContent = navBarElem.toString().replace(new RegExp('routerlink', 'g'), 'routerLink');
        host.overwrite(navigationPath, newFileContent);
        return host;
    };
}
