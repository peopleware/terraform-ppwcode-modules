/**
 *    Copyright 2017 PeopleWare n.v.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const DnsMeta = require("../DnsMeta");
const util = require("./_util");

//noinspection SpellCheckingInspection
const aSha = "b557eb5aabebf72f84ae9750be2ad1b7b6b43a4b";
const branchNames = [null, undefined, "", 0, false, "staging/3453/4/3"];
const anOriginUrl = "git@GitHub:peopleware/terraform-ppwcode-modules.git";
const aSerial = "2017061134";

describe("DnsMeta", function() {
  describe("constructor", function() {
    const sha = aSha;
    const repo = anOriginUrl;
    const serial = aSerial;

    branchNames.forEach(function(branchName) {
      it("should return a MetaDns with the expected properties for "
        + "sha === \"" + sha + "\", "
        + "branch === \"" + branchName + "\", "
        + "repo === \"" + repo + "\", "
        + "serial: " + serial + "\"",
        function() {
          util.validateConditions(DnsMeta.constructorContract.pre, [sha, branchName, repo, serial]);
          const result = new DnsMeta(sha, branchName, repo, serial);
          util.validateConditions(DnsMeta.constructorContract.post, [sha, branchName, repo, serial, result]);
          util.validateInvariants(result);
          console.log("%j", result);
        }
      );
    });
  });
});
