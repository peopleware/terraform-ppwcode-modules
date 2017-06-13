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

const Remote = require("../GitInfo").Remote;
const util = require("./_util");

const remoteName = "origin";
const remoteUrl = "git@GitHub:peopleware/terraform-ppwcode-modules.git";

describe("GitInfo.Remote", function() {
  describe("constructor", function() {
    const name = remoteName;
    const url = remoteUrl;
    it("should return a GitInfo.Remote with the expected properties for "
      + "name === \"" + name + "\""
      + "url === \"" + url + "\"",
      function() {
        util.validateConditions(Remote.constructorContract.pre, [name, url]);
        const result = new Remote(name, url);
        util.validateConditions(Remote.constructorContract.post, [name, url, result]);
        util.validateInvariants(result);
      });
  });
});
