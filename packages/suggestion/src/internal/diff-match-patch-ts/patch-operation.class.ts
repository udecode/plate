/**
 * PatchOperation has been derived from patch_obj in diff-match-patch by Neil Fraser
 * and the TypeScript of diffMatchPatch.ts in ng-diff-match-patch by Elliot Forbes.
 * See LICENSE.md for licensing details.
 *
 * Changes have been made to correct tslint errors and use the Diff and DiffOp types
 * by Richard Russell.
 *
 * ----------------------------------------------------------------------------------------
 * Diff Match and Patch
 *
 * Copyright 2006 Google Inc.
 * http://code.google.com/p/google-diff-match-patch/
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { DiffOp } from './diff-op.enum';
import { Diff } from './diff.type';

/**
 * Class representing one patch operation.
 * @constructor
 */
export class PatchOperation {

  public diffs: Diff[] = [];
  public start1: number = null as any;
  public start2: number = null as any;
  public length1: number = 0;
  public length2: number = 0;

  /**
   * Emmulate GNU diff's format.
   * Header: @@ -382,8 +481,9 @@
   * Indicies are printed as 1-based, not 0-based.
   */
  public toString(): string {
    let coords1;
    let coords2;
    if (this.length1 === 0) {
      coords1 = this.start1 + ',0';
    } else if (this.length1 === 1) {
      coords1 = this.start1 + 1;
    } else {
      coords1 = (this.start1 + 1) + ',' + this.length1;
    }
    if (this.length2 === 0) {
      coords2 = this.start2 + ',0';
    } else if (this.length2 === 1) {
      coords2 = this.start2 + 1;
    } else {
      coords2 = (this.start2 + 1) + ',' + this.length2;
    }
    const text = ['@@ -' + coords1 + ' +' + coords2 + ' @@\n'];
    let op;
    // Escape the body of the patch with %xx notation.
    for (let x = 0; x < this.diffs.length; x++) {
      switch (this.diffs[x][0]) {
        case DiffOp.Insert:
          op = '+';
          break;
        case DiffOp.Delete:
          op = '-';
          break;
        case DiffOp.Equal:
          op = ' ';
          break;
      }
      text[x + 1] = op + encodeURI(this.diffs[x][1]) + '\n';
    }
    return text.join('').replace(/%20/g, ' ');
  }
}