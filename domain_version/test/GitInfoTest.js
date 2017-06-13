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

const GitInfo = require("../GitInfo");
const util = require("./_util");
const path = require("path");
const fs = require("fs");
const Q = require("q");
const Git = require("nodegit");

const thisGitRepoRoot = path.dirname(path.dirname(__dirname));
const someBranchNames = [
  "master",
  "nested/branch/name",
  "dev",
  "development"
];
const preciousBranchNames = [
  "",
  null,
  undefined,
  "production",
  "test",
  "staging/4",
  "stage/4",
  "staging-pre-release"
];
//noinspection SpellCheckingInspection
const aSha = "b557eb5aabebf72f84ae9750be2ad1b7b6b43a4b";
const someOriginUrls = ["", null, undefined, "git@GitHub:peopleware/terraform-ppwcode-modules.git"];
const someChanges = [
  new Set(),
  new Set(["a/path/to/a/file"]),
  new Set(["a/path/to/a/file", "a/path/to/another/file", "a/path/to/yet/another/file"])
];
const somePaths = [
  "/",
  __dirname,
  __filename,
  process.cwd(),
  require.main.filename,
  path.dirname(require.main.filename),
  thisGitRepoRoot,
  path.dirname(thisGitRepoRoot),
  "this is not a path"
];

describe("GitInfo", function() {
  describe("constructor", function() {
    const path = thisGitRepoRoot;
    someBranchNames
      .map(name => {return {name: name, precious: false};})
      .concat(preciousBranchNames.map(name => {return {name: name, precious: true};}))
      .forEach(branch => {
        const sha = aSha;
        someOriginUrls.forEach(originUrl => {
          someChanges.forEach(changes => {
            it("should return a GitInfo with the expected properties for "
              + "path === \"" + path + "\", "
              + "sha === \"" + sha + "\", "
              + "branch === \"" + branch.name + "\", "
              + "originUrl === \"" + originUrl + "\", "
              + "changes: " + changes.size,
              function() {
                util.validateConditions(GitInfo.constructorContract.pre, [path, sha, branch.name, originUrl, changes]);
                const result = new GitInfo(path, sha, branch.name, originUrl, changes);
                console.log("branch %s precious? %s", result.branch, result.isPrecious);
                if (result.isPrecious !== branch.precious) {
                  throw new Error("Expected precious to be " + branch.precious + " for " + branch.name + ", but wasn't");
                }
                util.validateConditions(
                  GitInfo.constructorContract.post,
                  [path, sha, branch.name, originUrl, changes, result]
                );
                util.validateInvariants(result);
              });
          });
        });
      });
  });

  function shouldNotExist(dirName) {
    throw Error("\"" + dirName + "\" is a git directory, and should not be");
  }

  describe("highestGitDirPath", function() {
    somePaths.forEach(function(dirPath) {
      it("should return a promise for \"" + dirPath + "\"", function() {
        const result = GitInfo.highestGitDirPath(dirPath);
        return result.then(highestPath => {
          console.log("highest git dir path for \"%s\": \"%s\"", dirPath, highestPath);

          if (!highestPath) {
            return true;
          }

          const testPromises = [
            Q.nfcall(fs.access, path.format({dir: highestPath, name: ".git"}), "rw")
          ];
          let intermediate = dirPath;
          while (intermediate.startsWith(highestPath) && intermediate !== highestPath) {
            const p = path.format({dir: intermediate, name: ".git"});
            testPromises.push(
              Q.nfcall(fs.access, p, "rw")
                .then(
                  shouldNotExist.bind(undefined, p),
                  (err) => true
                )
            );
            intermediate = path.dirname(intermediate);
          }
          return Q.all(testPromises);
        });
      });
    });
  });

  describe("isNotClean", function() {
    it("should behave for all files in this repo", function() {
      //noinspection JSUnresolvedVariable
      return Q.all(
        Git
          .Repository
          .open(path.dirname(path.dirname(path.dirname(path.resolve(__filename)))))
          .then(repository => repository.getStatus())
          .then(statuses => statuses.map(status => {
            console.log(status.path());
            GitInfo.isNotClean(status)
          }))
      );
    });
  });
});
