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

/* eslint-env mocha */

const DnsMeta = require('../DnsMeta')
const util = require('./_util')
const SoaSerial = require('../SoaSerial')
const GitInfo = require('@ppwcode/node-gitinfo/GitInfo')
const Q = require('q')

// noinspection SpellCheckingInspection
const aSha = 'b557eb5aabebf72f84ae9750be2ad1b7b6b43a4b'
const branchNames = [null, undefined, '', 0, false, 'staging/3453/4/3']
const anOriginUrl = 'git@GitHub:peopleware/terraform-ppwcode-modules.git'
const aSerial = '2017061134'
const someDomains = ['apple.com', 'google.com', 'does.not.exist']
// noinspection MagicNumberJS
const aMoment = new Date(2017, 5, 14, 9, 38, 23.345)
const somePaths = [__filename, '/lala/land/over/the/rainbow']

describe('DnsMeta', function () {
  describe('constructor', function () {
    const sha = aSha
    const repo = anOriginUrl
    const serial = aSerial

    branchNames.forEach(function (branchName) {
      it('should return a MetaDns with the expected properties for ' +
        'sha === "' + sha + '", ' +
        'branch === "' + branchName + '", ' +
        'repo === "' + repo + '", ' +
        'serial: ' + serial + '"',
      function () {
        util.validateConditions(DnsMeta.constructorContract.pre, [sha, branchName, repo, serial])
        const result = new DnsMeta(sha, branchName, repo, serial)
        util.validateConditions(DnsMeta.constructorContract.post, [sha, branchName, repo, serial, result])
        util.validateInvariants(result)
        console.log('%j', result)
      }
      )
    })
  })
  describe('nextDnsMeta', function () {
    const at = aMoment
    someDomains.forEach(function (domain) {
      somePaths.forEach(function (path) {
        it('should return a promise for "' + domain + '", at ' + at + ', for git above "' + path + '"', function () {
          /* Note: we do not cover everything here, because we have no control over the changing of serials of
           apple.com, the only one of our examples that does follow the guideline to use YYYYMMDDnn */
          return DnsMeta
            .nextDnsMeta(domain, at, path)
            .then(
              dnsMeta => {
                console.log('%j', dnsMeta)
                return Q.all([
                  SoaSerial
                    .nextSoaSerial(domain, at)
                    .then(soaSerial => {
                      if (soaSerial.serial !== dnsMeta.serial) {
                        throw new Error('resolution does not represent the expected serial')
                      }
                      return soaSerial
                    }),
                  GitInfo
                    .createForHighestGitDir(path)
                    .then(gitInfo => {
                      if (!gitInfo.isSave) {
                        throw new Error('resolution should have been rejected, because git is not save')
                      }
                      if (dnsMeta.sha !== gitInfo.sha) {
                        throw new Error('resolution does not represent the expected sha')
                      }
                      if (dnsMeta.branch !== gitInfo.branch) {
                        throw new Error('resolution does not represent the expected branch')
                      }
                      if (dnsMeta.repo !== gitInfo.originUrl) {
                        throw new Error('resolution does not represent the expected sha')
                      }
                      return gitInfo
                    })
                ])
              },
              err => {
                console.log('%s', err.message)
                return true
                /* TODO Because SoaSerial >> 99 does not report detailed exception yet, it makes no sense to try to
                        sort it out here now. The details are tested in the called routines already. */
              }
            )
        })
      })
    })
  })
})
