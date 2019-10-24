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

const SoaSerial = require('../SoaSerial')
const util = require('./_util')
const moment = require('moment')
const ConditionError = require('@toryt/contracts-iv/lib/IV/ConditionError')

const someMoments = [
  moment('20180108T142423.345Z'),
  moment('20170611T161923.345+02:00'),
  moment('20170611T161923.345-06:00'),
  moment('20170611T011923.345+02:00'),
  moment('20170611T221923.345-06:00')
]

const someDates = someMoments.map(m => m.toDate())

// noinspection MagicNumberJS
const someSequenceNumbers = [0, 50, 99]

const someSerials = [
  '2017061134',
  '2017061100',
  '2017061199',
  '2017061034',
  '2017061234',
  '2016022934'
]

const notSomeSerials = [
  0,
  false,
  null,
  '',
  '427423825',
  'fs5252mj2',
  {},
  [],
  new Date(),
  function () {},
  '2017131134',
  '2017063234'
]

const someDomains = [
  'apple.com',
  'microsoft.com',
  'google.com',
  'ppwcode.org',
  'this.domain.does.not.exist'
]

describe('SoaSerial', function () {
  describe('constructor', function () {
    someMoments
      .map(m => m.clone())
      .concat(someDates)
      .forEach(at =>
        someSequenceNumbers.forEach(function (sequenceNumber) {
          it(
            'should return a serial with the  expected properties for at === "' +
              moment(at).toISOString() +
              '" ' +
              'and sequenceNumber === ' +
              sequenceNumber,
            function () {
              util.validateConditions(SoaSerial.constructorContract.pre, [
                at,
                sequenceNumber
              ])
              const result = new SoaSerial(at, sequenceNumber)
              util.validateConditions(SoaSerial.constructorContract.post, [
                at,
                sequenceNumber,
                result
              ])
              util.validateInvariants(result)
            }
          )
        })
      )
  })
  describe('isASerial', function () {
    before(function () {
      SoaSerial.isASerial.contract.verifyPostconditions = true
    })

    after(function () {
      SoaSerial.isASerial.contract.verifyPostconditions = false
    })

    someSerials.concat(notSomeSerials).forEach(function (candidate) {
      it(
        'should return the correct boolean for "' + candidate + '"',
        function () {
          const result = SoaSerial.isASerial(candidate)
          console.log('isASerial(%s): %s', candidate, result)
        }
      )
    })
  })
  describe('parse', function () {
    before(function () {
      SoaSerial.parse.contract.verifyPostconditions = true
    })

    after(function () {
      SoaSerial.parse.contract.verifyPostconditions = false
    })

    someSerials.forEach(function (serial) {
      it(
        'should return a serial with the expected properties for "' +
          serial +
          '"',
        function () {
          const result = SoaSerial.parse(serial)
          util.validateInvariants(result)
        }
      )
    })
  })
  describe('#next()', function () {
    before(function () {
      SoaSerial.prototype.next.contract.verifyPostconditions = true
    })

    after(function () {
      SoaSerial.prototype.next.contract.verifyPostconditions = false
    })

    someSerials
      .map(
        serial =>
          function () {
            return SoaSerial.parse(serial)
          }
      )
      .forEach(generateSubject =>
        someMoments
          .map(m => m.clone())
          .concat(someDates)
          .forEach(useAt => {
            const subject = generateSubject()
            it(
              'should return a serial with the expected properties for "' +
                JSON.stringify(subject) +
                '" with useAt === "' +
                moment(useAt).toISOString() +
                '"',
              function () {
                try {
                  const result = subject.next(useAt)
                  util.validateInvariants(result)
                } catch (err) {
                  if (err instanceof ConditionError) {
                    throw err
                  }
                  util.validateInvariants(subject)
                }
              }
            )
          })
      )
  })
  describe('currentSoaSerialString', function () {
    before(function () {
      SoaSerial.currentSoaSerialString.contract.verifyPostconditions = true
    })

    after(function () {
      SoaSerial.currentSoaSerialString.contract.verifyPostconditions = false
    })

    someDomains.forEach(function (domain) {
      it('should return a promise for "' + domain + '"', function () {
        return SoaSerial.currentSoaSerialString(domain)
          .then(serial => {
            console.log(`success: ${serial}`)
            return true
          })
          .catch(err => {
            if (err instanceof ConditionError) {
              throw err
            }
            console.log(`failure: ${err}`)
            return true
          })
      })
    })
  })
  describe('currentSoaSerial', function () {
    before(function () {
      SoaSerial.currentSoaSerial.contract.verifyPostconditions = true
    })

    after(function () {
      SoaSerial.currentSoaSerial.contract.verifyPostconditions = false
    })

    someDomains.forEach(function (domain) {
      it('should return a promise for "' + domain + '"', function () {
        const result = SoaSerial.currentSoaSerial(domain)
        return result
          .then(soaSerial => {
            console.log(`success: ${JSON.stringify(soaSerial)}`)
            return SoaSerial.currentSoaSerialString(domain).then(serial => {
              if (soaSerial.serial !== serial) {
                throw new Error(
                  'resolution does not represent the expected serial'
                )
              }
              return true
            })
          })
          .catch(err => {
            if (err instanceof ConditionError) {
              throw err
            }
            console.log(`failure: ${err}`)
            return true
          })
      })
    })
  })
  describe('nextSoaSerial', function () {
    before(function () {
      SoaSerial.nextSoaSerial.contract.verifyPostconditions = true
    })

    after(function () {
      SoaSerial.nextSoaSerial.contract.verifyPostconditions = false
    })

    const moments = [someMoments[0], moment()]
    moments.forEach(function (m) {
      someDomains.forEach(function (domain) {
        it(
          'should return a promise for "' +
            domain +
            '" and useAt = ' +
            m.format(),
          function () {
            const at = moment() // today, because we do not want to change the tests each time one of the domains changes
            /* Note: we do not cover everything here, because we have no control over the changing of serials of
                   apple.com, the only one of our examples that does follow the guideline to use YYYYMMDDnn */
            const result = SoaSerial.nextSoaSerial(domain, m)
            return result.then(
              soaSerial => {
                return SoaSerial.currentSoaSerial(domain).then(
                  currentSoaSerial => {
                    if (soaSerial.serial !== currentSoaSerial.next(at).serial) {
                      throw new Error(
                        'resolution does not represent the expected serial'
                      )
                    }
                    console.log(
                      '%s: current YYYYMMDDnn serial is %s --> %s',
                      domain,
                      currentSoaSerial.serial,
                      soaSerial.serial
                    )
                    return true
                  },
                  ignore => {
                    /* domain does not exist, or there is no SOA record, or there is no internet connection, or
                         no DNS server can be contacted, or the SOA serial it is not in the form YYYYMMDDnn … */
                    if (
                      soaSerial.serialStart !==
                        moment(m)
                          .utc()
                          .format(SoaSerial.isoDateWithoutDashesPattern) ||
                      soaSerial.sequenceNumber !== 0
                    ) {
                      throw new Error(
                        'resolution does not represent the expected serial'
                      )
                    }
                    console.log(
                      '%s: no current YYYYMMDDnn serial --> %s',
                      domain,
                      soaSerial.serial
                    )
                    return true
                  }
                )
              },
              err => {
                return SoaSerial.currentSoaSerial(domain).then(
                  currentSoaSerial => {
                    if (
                      (currentSoaSerial.sequenceNumber <
                        SoaSerial.maxSequenceNumber ||
                        currentSoaSerial.serialStart !==
                          moment(m)
                            .utc()
                            .format(SoaSerial.isoDateWithoutDashesPattern)) &&
                      currentSoaSerial.serialStart <=
                        moment(m)
                          .utc()
                          .format(SoaSerial.isoDateWithoutDashesPattern)
                    ) {
                      console.log(err)
                      throw new Error('resolution rejected for no good reason')
                    }
                    console.log(
                      '%s: rejected - current YYYYMMDDnn serial is %s',
                      domain,
                      currentSoaSerial.serial
                    )
                    return true
                  }
                )
              }
            )
          }
        )
      })
    })
  })
})
