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

const GitInfo = require('@ppwcode/node-gitinfo/GitInfo')
const SoaSerial = require('./SoaSerial')
const Contract = require('@toryt/contracts-iii')
const Q = require('q')
const moment = require('moment')

class DnsMeta {
  get invariants () {
    return typeof this.sha === 'string' &&
      GitInfo.shaRegExp.test(this.sha) &&
      (this.branch === undefined || (typeof this.branch === 'string' && !!this.branch)) &&
      (typeof this.repo === 'string' && !!this.repo) &&
      SoaSerial.isASerial(this.serial)
  }

  /**
   * Create a new GitInfo instance with the given properties.
   *
   * @param {string} sha - sha of the current commit of the checked-out repository
   * @param {string?} branch - name of the current checked-out branch; might be {@code undefined}
   * @param {string} repo - url of the git repository where the code is maintained
   * @param {string} serial - string in the format YYYYMMDDnn, expected of an SOA serial
   */
  constructor (sha, branch, repo, serial) {
    this._sha = sha
    this._branch = branch || undefined
    this._repo = repo
    this._serial = serial
  }

  /**
   * Sha of the current commit of the checked-out repository.
   *
   * @return {String}
   */
  get sha () {
    return this._sha
  }

  /**
   * Name of the current checked-out branch. Might be {@code undefined}.
   *
   * @return {String?}
   */
  get branch () {
    return this._branch
  }

  /**
   * Url of the remote with name {@code origin} of the current checked-out branch.
   *
   * @return {String?}
   */
  get repo () {
    return this._repo
  }

  /**
   * 10-digit SOA serial, in the format YYYYMMDDnn
   *
   * @return {string}
   */
  get serial () {
    return this._serial
  }

  toJSON () {
    return {
      sha: this.sha,
      branch: this.branch,
      repo: this.repo,
      serial: this.serial
    }
  }
}

DnsMeta.constructorContract = new Contract({
  pre: [
    (sha, branch, repo, serial) => typeof sha === 'string',
    (sha, branch, repo, serial) => GitInfo.shaRegExp.test(sha),
    (sha, branch, repo, serial) => !branch || typeof branch === 'string',
    (sha, branch, repo, serial) => typeof repo === 'string',
    (sha, branch, repo, serial) => SoaSerial.isASerial(serial)
  ],
  post: [
    (sha, branch, repo, serial, result) => result.sha === sha,
    (sha, branch, repo, serial, result) => !!branch || result.branch === undefined,
    (sha, branch, repo, serial, result) => !branch || result.branch === branch,
    (sha, branch, repo, serial, result) => result.repo === repo,
    (sha, branch, repo, serial, result) => result.serial === serial
  ],
  exception: [() => false]
})

DnsMeta.workingCopyNotSaveMsg = 'WORKING COPY NOT SAVE'

/**
 * Promise for an {@link DnsMeta} instance, that contains the [next SOA serial]{@linkplain SoaSerial.nextSoaSerial()},
 * to be used at {@code at} for {@code domain}, and information about the highest git repository found above
 * {@code path}.
 */
DnsMeta.nextDnsMeta = new Contract({
  pre: [
    (domain, at, path) => typeof domain === 'string',
    (domain, at, path) => at instanceof Date || moment.isMoment(at),
    (domain, at, path) => typeof path === 'string',
    (domain, at, path) => !!path
  ],
  post: [
    (domain, at, path, result) => Q.isPromiseAlike(result)
  ],
  exception: [() => false]
}).implementation(function (domain, at, path) {
  return Q.object({
    soaSerial: SoaSerial.nextSoaSerial(domain, at), // TODO serial already >> 99
    gitInfo: GitInfo.createForHighestGitDir(path)
  })
    .then(result => {
      if (!result.gitInfo.isSave) {
        throw new Error(DnsMeta.workingCopyNotSaveMsg)
      }
      return new DnsMeta(result.gitInfo.sha, result.gitInfo.branch, result.gitInfo.originUrl, result.soaSerial.serial)
    })
    .then(
      new Contract({
        pre: [
          dnsMeta => dnsMeta instanceof DnsMeta,
          dnsMeta =>
            SoaSerial.parse(dnsMeta.serial).serialStart === moment(at).utc().format(SoaSerial.isoDateWithoutDashesPattern)
        ],
        post: [(dnsMeta, result) => result === dnsMeta],
        exception: [() => false]
      }).implementation(gitInfo => gitInfo),
      new Contract({
        pre: [(err) => err instanceof Error],
        post: [() => false],
        exception: [(err1, err2) => err1 === err2]
      }).implementation(err => { throw err })
    )
})

module.exports = DnsMeta
