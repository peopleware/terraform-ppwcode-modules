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

/**
 * Holder for consolidated information about the git repository at {@code #path}.
 */
class GitInfo {

  get invariants() {
    return typeof this.path === "string"
      && !!this.path
      /* We will not add an invariant that this path exists. 1) That can only be determined
         asynchronously, and we don't want that for invariants(). 2) The disk can be changed after
         creation of this object. */
      && typeof this.sha === "string"
      && GitInfo.shaRegExp.test(this.sha)
      && this.branch === undefined || (typeof this.branch === "string" && !!this.branch)
      && this.originUrl === undefined || (typeof this.originUrl === "string" && !!this.originUrl)
      && this.changes instanceof Set
      && Array.from(this.changes).every(path => typeof path === "string" && !!path);
  }

  /**
   * Create a new GitInfo instance with the given properties.
   *
   * @param {String} path - path to the git repository represented by the new instance;
   *                        should be a path to a directory that contains a {@code .git/} folder
   * @param {String} sha - sha of the current commit of the checked-out repository
   * @param {String?} branch - name of the current checked-out branch; might be {@code undefined}
   * @param {String?} originUrl - url of the remote with name {@code origin} of the current checked-out branch;
   *                              might be {@code undefined}
   * @param {Set<String>} changes - set of paths of files that are not committed in the working copy
   *                                referred to by {@code path}; files are deleted, new, or modified
   */
  constructor(path, sha, branch, originUrl, changes) {
    this._path = path;
    this._sha = sha;
    this._branch = branch || undefined;
    this._originUrl = originUrl || undefined;
    this._changes = new Set(changes);
  }

  /**
   * Path to the git repository represented by this.
   */
  get path() {
    return this._path;
  }

  /**
   * Sha of the current commit of the checked-out repository.
   */
  get sha() {
    return this._sha;
  }

  /**
   * Name of the current checked-out branch. Might be {@code undefined}.
   */
  get branch() {
    return this._branch;
  }

  /**
   * Url of the remote with name {@code origin} of the current checked-out branch.
   * Might be {@code undefined}.
   */
  get originUrl() {
    return this._originUrl;
  }

  /**
   * Set of paths of files that are not committed in the working copy referred to by {@code path}.
   * Files are deleted, new, or modified.
   *
   * @return {Set<String>}
   */
  get changes() {
    return new Set(this._changes);
  }
}

GitInfo.constructorContract = new Contract({
  pre: [
    (path, sha, branch, originUrl, changes) => typeof path === "string",
    (path, sha, branch, originUrl, changes) => !!path,
    (path, sha, branch, originUrl, changes) => typeof sha === "string",
    (path, sha, branch, originUrl, changes) => GitInfo.shaRegExp.test(sha),
    (path, sha, branch, originUrl, changes) => !branch || typeof branch === "string",
    (path, sha, branch, originUrl, changes) => !originUrl || typeof originUrl === "string",
    (path, sha, branch, originUrl, changes) => changes instanceof Set,
    (path, sha, branch, originUrl, changes) => Array.from(changes).every(path => typeof path === "string" && !!path)
  ],
  post: [
    (path, sha, branch, originUrl, changes, result) => result.path === path,
    (path, sha, branch, originUrl, changes, result) => result.sha === sha,
    (path, sha, branch, originUrl, changes, result) => !!branch || result.branch === undefined,
    (path, sha, branch, originUrl, changes, result) => !branch || result.branch === branch,
    (path, sha, branch, originUrl, changes, result) => !!originUrl || result.originUrl === undefined,
    (path, sha, branch, originUrl, changes, result) => !originUrl || result.originUrl === originUrl,
    (path, sha, branch, originUrl, changes, result) => Array.from(changes).every(path => result.changes.has(path)),
    (path, sha, branch, originUrl, changes, result) => Array.from(result.changes).every(path => changes.has(path))
  ],
  exception: [() => false]
});

GitInfo.shaRegExp = /^[a-f0-9]{40}$/;

module.exports = GitInfo;
