import { Tree } from '@angular-devkit/schematics';

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

  apply(host: Tree): Promise<any> {
    const content = host.read(this.path).toString();
    const prefix = content.substring(0, this.pos);
    const suffix = content.substring(this.pos + this.toRemove.length);
    // TODO: throw error if toRemove doesn't match removed string.
    host.overwrite(this.path, `${prefix}${suffix}`);
    return new Promise((resolve) => {
      resolve(host);
    })
  }
}
