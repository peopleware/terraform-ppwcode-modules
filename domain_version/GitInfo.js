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
 * Holder for consolidated information about a git remote
 */
class Remote {

  get invariants() {
    return typeof this.name === "string"
           && !!this.name
           && typeof this.url === "string"
           && !!this.url;
  }

  /**
   * Create a new Remote instance with the given properties.
   *
   * @param {String} name - name of the remote
   * @param {String} url - url of the remote
   */
  constructor(name, url) {
    this._name = name;
    this._url = url;
  }

  /**
   * Name of the remote.
   */
  get name() {
    return this._name;
  }

  /**
   * Url of the remote.
   */
  get url() {
    return this._url;
  }

}

Remote.constructorContract = new Contract({
  pre: [
    (name, url) => typeof name === "string",
    (name, url) => !!name,
    (name, url) => typeof url === "string",
    (name, url) => !!url
  ],
  post: [
    (name, url, result) => result.name === name,
    (name, url, result) => result.url === url
  ],
  exception: [() => false]
});

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
      && this.branch === undefined || (typeof this.branch === "string" && !!this.branch);
  }

  /**
   * Create a new GitInfo instance with the given properties.
   *
   * @param {String} path - path to the git repository represented by the new instance;
   *                        should be a path to a directory that contains a {@code .git/} folder
   * @param {String} sha - sha of the current commit of the checked-out repository
   * @param {String?} branch - name of the current checked-out branch; might be {@code undefined}
   */
  constructor(path, sha, branch) {
    this._path = path;
    this._sha = sha;
    this._branch = branch || undefined;
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
}

GitInfo.constructorContract = new Contract({
  pre: [
    (path, sha, branch) => typeof path === "string",
    (path, sha, branch) => !!path,
    (path, sha, branch) => typeof sha === "string",
    (path, sha, branch) => GitInfo.shaRegExp.test(sha),
    (path, sha, branch) => !branch || typeof branch === "string"
  ],
  post: [
    (path, sha, branch, result) => result.path === path,
    (path, sha, branch, result) => result.sha === sha,
    (path, sha, branch, result) => !!branch || result.branch === undefined,
    (path, sha, branch, result) => !branch || result.branch === branch
  ],
  exception: [() => false]
});

GitInfo.shaRegExp = /^[a-f0-9]{40}$/;

GitInfo.Remote = Remote;

module.exports = GitInfo;
