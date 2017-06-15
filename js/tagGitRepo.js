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

const Contract = require("@toryt/contracts-ii");
const Git = require("nodegit");
const GitInfo = require("./GitInfo");
const Q = require("./q2");

/**
 * Tag the git repository at {@code path} with {@code tagName}, and return a Promise
 * that resolves when done. The tag is not pushed!
 * The resolution value is not specified.
 *
 * @param {string} tag - the tag to be used
 * @param {String} path - path to the git repository to tag;
 *                        should be a path to a directory that contains a {@code .git/} folder
 */
const tagGitRepo = new Contract({
  pre: [
    (path, tagName) => typeof path === "string",
    (path, tagName) => !!path,
    (path, tagName) => typeof tagName === "string",
    (path, tagName) => !!tagName
  ],
  post: [
    (path, tagName, result) => Q.isPromiseAlike(result)
  ],
  exception: [() => false]
}).implementation(function tagGit(path, tagName) {
  const message = "tag with " + tagName;
  //noinspection JSUnresolvedVariable
  return Git.Repository
    .open(path)
    .catch(ignore => {
      throw new Error(GitInfo.noGitDirectoryMsg);
    })
    .then(repository =>
      repository
        .getHeadCommit()
        .then(head => Git.Tag.create(
          repository,
          tagName,
          head,
          Git.Signature.default(repository),
          message,
          0
        ))
        .catch(ignore => {
          throw new Error(tagGitRepo.couldNotCreateTagMsg);
        })
    )
    .catch(new Contract({
      pre: [
        err => err instanceof Error,
        err => err.message === GitInfo.noGitDirectoryMsg || err.message === tagGitRepo.couldNotCreateTagMsg
      ],
      post: [() => false],
      exception: [(err1, err2) => err1 === err2]
    }).implementation(function(err) {
      throw err;
    }));
});

tagGitRepo.couldNotCreateTagMsg = "COULD NOT CREATE TAG";

module.exports = tagGitRepo;
