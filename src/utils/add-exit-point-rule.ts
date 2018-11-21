import { Rule, Tree } from "@angular-devkit/schematics";
import * as cheerio from 'cheerio'

export function addExitPointRule (options: any): Rule {
    return (host: Tree) => {
        const navigationPath = options.parentExitPointComponentPath;
        const content: Buffer | null = host.read(navigationPath);
        let strContent: string = '';
        if(content) strContent = content.toString('utf8');
        // parse HTML
        const cheerioDom = cheerio.load(strContent, {decodeEntities: false});
        const exitPointComponentHTML = cheerioDom(`#exitPointComponent`);
        const insertToElement = cheerioDom(`#${options.parentExitPointComponentElementId}`); // element to insert HTML to
        const contentToInsert = createContentToAdd(options);
        insertToElement.append(contentToInsert);
        // string content to append to the file
        const newFileContent = exitPointComponentHTML.toString();
        host.overwrite(navigationPath, newFileContent);
        return host;
    };
}

function createContentToAdd(options: any): string {
    const label = options.parentExitPointComponentLabel ? `label="${options.parentExitPointComponentLabel}"`: '';
    const icon = options.parentExitPointComponentIcon ? `icon="${options.parentExitPointComponentIcon}"`: '';
    const route = options.parentExitPointComponentRoute ? `route="${options.parentExitPointComponentRoute}"`: '';
    if (options.parentExitPointComponentSelector) {
        return `<${options.parentExitPointComponentSelector} ${label} ${route} ${icon}></${options.parentExitPointComponentSelector}>`
    }
    else return ''
}
