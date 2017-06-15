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

const Git = require("nodegit");
const Q = require("../q2");
const path = require("path");
const tagGitRepo = require("../tagGitRepo");
const GitInfo = require("../GitInfo");

const someRepoPaths = [path.dirname(path.dirname(path.dirname(path.dirname(__filename)))), "/repo/does/not/exist"];
const aTagName = "automated_test/tagGitRepo/" + Date.now();

describe("tagGitRepo", function() {
  describe("tagGitRepo", function() {
    someRepoPaths.forEach(function(path) {
      const tagName = aTagName;
      it("creates the expected tag, or fails expected, for \"" + path + "\" and tag \"" + tagName, function() {
        return tagGitRepo(path, tagName)
          .then(
            () => Git.Repository
              .open(path)
              .then(repository =>
                Git.Tag
                  .list(repository)
                  .then(tags => {
                    if (tags.indexOf(tagName) < 0) {
                      throw new Error("tag was not created as expected");
                    }
                    return Git.Tag.delete(repository, tagName);
                  })
              ),
            (err) => {
              console.log(err);
              if (err instanceof Error
                && (err.message === GitInfo.noGitDirectoryMsg || err.message === tagGitRepo.couldNotCreateTagMsg)) {
                return true;
              }
              throw err;
            }
          );
      });
    });
  });
});


