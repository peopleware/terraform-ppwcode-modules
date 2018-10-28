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

const moment = require('moment')
const pad = require('pad')
const Q = require('q')
const dns = require('dns')
const Contract = require('@toryt/contracts-iii')

class SoaSerial {
  get invariants () {
    return moment.isMoment(this.at) &&
           this.at.utcOffset() === 0 &&
           this.at.utc().hours() === 0 &&
           this.at.utc().minutes() === 0 &&
           this.at.utc().seconds() === 0 &&
           this.at.utc().milliseconds() === 0 &&
           typeof this.year === 'string' &&
           SoaSerial.yearRegExp.test(this.year) &&
           this.year === this.at.format(SoaSerial.yearPattern) &&
           typeof this.month === 'string' &&
           SoaSerial.monthRegExp.test(this.month) &&
           Number.parseInt(this.month) >= 1 &&
           Number.parseInt(this.month) <= SoaSerial.maxMonth &&
           this.month === this.at.format(SoaSerial.monthPattern) &&
           typeof this.day === 'string' &&
           SoaSerial.dayRegExp.test(this.day) &&
           Number.parseInt(this.day) >= 1 &&
           Number.parseInt(this.day) <=
              moment(this.year + this.month, SoaSerial.yearPattern + SoaSerial.monthPattern).daysInMonth() &&
           this.day === this.at.format(SoaSerial.dayPattern) &&
           typeof this.serialStart === 'string' &&
           this.serialStart === this.year + this.month + this.day &&
           typeof this.sequenceNumber === 'number' &&
           this.sequenceNumber >= 0 &&
           this.sequenceNumber <= SoaSerial.maxSequenceNumber &&
           typeof this.serial === 'string' &&
           this.serial === this.serialStart + pad(2, this.sequenceNumber, '0') &&
           JSON.parse(JSON.stringify(this)).at === JSON.parse(JSON.stringify(this.at)) &&
           JSON.parse(JSON.stringify(this)).year === this.year &&
           JSON.parse(JSON.stringify(this)).month === this.month &&
           JSON.parse(JSON.stringify(this)).day === this.day &&
           JSON.parse(JSON.stringify(this)).sequenceNumber === this.sequenceNumber &&
           JSON.parse(JSON.stringify(this)).serial === this.serial
  }

  /**
   * Create a new {@code SoaSerial}, given the date of {@code at} and the {@sequenceNumber}.
   *
   * @param {Date|moment.Moment} at - the date at which this instance should be used
   * @param {Number} sequenceNumber - the sequence number of the SOA serial within the day represented by {@code at}
   */
  constructor (at, sequenceNumber) {
    this._at = moment.utc(at).startOf('day')
    this.sequenceNumber = sequenceNumber
  }

  /**
   * @return {moment.Moment}
   */
  get at () {
    return moment.utc(this._at).startOf('day')
  }

  /**
   * @return {string} 4-digit year of {@link #at}
   */
  get year () {
    return this._at.format(SoaSerial.yearPattern)
  }

  /**
   * @return {string} 2-digit month of {@link #at}
   */
  get month () {
    return this._at.format(SoaSerial.monthPattern)
  }

  /**
   * @return {string} 2-digit day of {@link #at}
   */
  get day () {
    return this._at.format(SoaSerial.dayPattern)
  }

  /**
   * The first 8 digits of the SOA serial
   *
   * @return {string} {@link #year} + {@link #month} + {@link #day}
   */
  get serialStart () {
    return this._at.format(SoaSerial.isoDateWithoutDashesPattern)
  }

  /**
   * 10-digit SOA serial, to be used at {@code at}, with sequence number {@code sequenceNumber}.
   *
   * @return {string} {@link #serialStart} + {@link #sequenceNumber}
   */
  get serial () {
    return this.serialStart + pad(2, this.sequenceNumber, '0')
  }

  // noinspection JSUnusedGlobalSymbols
  toJSON () {
    return {
      at: this.at,
      year: this.year,
      month: this.month,
      day: this.day,
      sequenceNumber: this.sequenceNumber,
      serial: this.serial
    }
  }
}

SoaSerial.constructorContract = new Contract({
  pre: [
    (at, sequenceNumber) => at instanceof Date || moment.isMoment(at),
    (at, sequenceNumber) => typeof sequenceNumber === 'number',
    (at, sequenceNumber) => sequenceNumber >= 0,
    (at, sequenceNumber) => sequenceNumber <= SoaSerial.maxSequenceNumber
  ],
  post: [
    (at, sequenceNumber, result) =>
      result.at.format(SoaSerial.isoDateWithoutDashesPattern) ===
        moment(at).utc().format(SoaSerial.isoDateWithoutDashesPattern),
    (at, sequenceNumber, result) => result.sequenceNumber === sequenceNumber
  ],
  exception: [() => false]
})

SoaSerial.yearPattern = 'YYYY'
SoaSerial.yearRegExp = /^\d{4}$/
SoaSerial.monthPattern = 'MM'
SoaSerial.monthRegExp = /^\d{2}$/
SoaSerial.dayPattern = 'DD'
SoaSerial.dayRegExp = /^\d{2}$/
SoaSerial.isoDateWithoutDashesPattern = SoaSerial.yearPattern + SoaSerial.monthPattern + SoaSerial.dayPattern
SoaSerial.serialRegExp = /^(\d{8})(\d{2})$/
SoaSerial.detailedSerialRegExp = /^(\d{4})(\d{2})(\d{2})(\d{2})$/
// noinspection MagicNumberJS
SoaSerial.maxSequenceNumber = 99
// noinspection MagicNumberJS
SoaSerial.maxMonth = 12

SoaSerial.isASerial = new Contract({
  post: [
    (candidate, result) => typeof result === 'boolean',
    (candidate, result) => !result || typeof candidate === 'string',
    (candidate, result) => !result || SoaSerial.detailedSerialRegExp.test(candidate),
    (candidate, result) => !result || Number.parseInt(SoaSerial.detailedSerialRegExp.exec(candidate)[2]) >= 1,
    (candidate, result) =>
      !result || Number.parseInt(SoaSerial.detailedSerialRegExp.exec(candidate)[2]) <= SoaSerial.maxMonth,
    (candidate, result) => !result || Number.parseInt(SoaSerial.detailedSerialRegExp.exec(candidate)[3]) >= 1,
    (candidate, result) =>
      !result ||
        Number.parseInt(SoaSerial.detailedSerialRegExp.exec(candidate)[3]) <=
          moment(
            SoaSerial.detailedSerialRegExp.exec(candidate)[1] + SoaSerial.detailedSerialRegExp.exec(candidate)[2],
            SoaSerial.yearPattern + SoaSerial.monthPattern
          ).daysInMonth(),
    (candidate, result) => !result || Number.parseInt(SoaSerial.detailedSerialRegExp.exec(candidate)[4]) >= 0,
    (candidate, result) =>
      !result || Number.parseInt(SoaSerial.detailedSerialRegExp.exec(candidate)[4]) <= SoaSerial.maxSequenceNumber
  ],
  exception: [() => false]
}).implementation(function (candidate) {
  if (typeof candidate !== 'string' || !SoaSerial.detailedSerialRegExp.test(candidate)) {
    return false
  }
  const parts = SoaSerial.detailedSerialRegExp.exec(candidate)
  const month = Number.parseInt(parts[2])
  const day = Number.parseInt(parts[3])
  const sequenceNumber = Number.parseInt(parts[4])
  return month >= 1 &&
    month <= SoaSerial.maxMonth &&
    day >= 1 &&
    day <= moment(parts[1] + parts[2], SoaSerial.yearPattern + SoaSerial.monthPattern).daysInMonth() &&
    sequenceNumber >= 0 &&
    sequenceNumber <= SoaSerial.maxSequenceNumber
})

/**
 * Construct an {@link SoaSerial} instance from the serial string as expected in a DNS SOA record.
 *
 * @param {string} serial - string in the format YYYYMMDDnn, expected of an SOA serial
 * @return {object} object with the parts of the serial ({@code year}, {@code month}, {@code day},
 *                  {@code sequenceNumber}) as properties of type {@code string}
 */
SoaSerial.parse = new Contract({
  pre: [
    (serial) => SoaSerial.isASerial(serial)
  ],
  post: [
    (serial, result) => result instanceof SoaSerial,
    (serial, result) => result.serial === serial
  ],
  exception: [() => false]
}).implementation(function parse (serial) {
  const parts = SoaSerial.serialRegExp.exec(serial)
  return new SoaSerial(moment.utc(parts[1], SoaSerial.isoDateWithoutDashesPattern), Number.parseInt(parts[2]))
})

/**
 * Return a Promise for the serial in the SOA record of {@code domain}, retrieved via DNS.
 * The promise is rejected if the record does not exists, or the network is not available.
 * The result is not necessary in the format YYYYMMDDnn. This is recommendation, not an obligation.
 *
 * @param {string} domain - FQDN of the domain to get the SOA record of
 * @return {Promise<string>} Promise for the serial string in the SOA record of {@code domain}, retrieved via DNS
 */
SoaSerial.currentSoaSerialString = new Contract({
  pre: [
    (domain) => typeof domain === 'string'
  ],
  post: [
    (domain, result) => Q.isPromiseAlike(result)
    /* Contracts does not offer support for Promises yet */
  ],
  exception: [() => false]
}).implementation(function currentSoaSerialString (domain) {
  return Q.denodeify(dns.resolveSoa)(domain)
    .then((soa) => '' + soa.serial)
    .then(
      new Contract({
        pre: [
          serial => typeof serial === 'string',
          serial => /^\d+$/.test(serial)
        ],
        post: [(serial, result) => result === serial],
        exception: [() => false]
      }).implementation(serial => serial),
      new Contract({
        pre: [
          () => true
          /* domain does not exist, or there is no SOA record, or there is no internet connection, or
                 no DNS server can be contacted, … */
        ],
        post: [() => false],
        exception: [
          (err1, err2) => err1 === err2
        ]
      }).implementation(err => { throw err })
    )
})

/**
 * Return a Promise for the SoaSerial, based on the serial in the SOA record of {@code domain}, retrieved via DNS.
 * The promise is rejected if the record does not exists, or the network is not available, or the serial is not in
 * the format YYYYMMDDnn.
 *
 * @param {string} domain - FQDN of the domain to get the SOA record of
 * @return {Promise<SoaSerial>} Promise for the SoaSerial, based on the serial string in the SOA record of
 *         {@code domain}, retrieved via DNS
 */
SoaSerial.currentSoaSerial = new Contract({
  pre: [
    (domain) => typeof domain === 'string'
  ],
  post: [
    (domain, result) => Q.isPromiseAlike(result)
    /* Contracts does not offer support for Promises yet */
  ],
  exception: [() => false]
}).implementation(function currentSoaSerial (domain) {
  return SoaSerial.currentSoaSerialString(domain)
    .then(serialString => {
      if (!SoaSerial.serialRegExp.test(serialString)) {
        throw new Error('The serial of the domain is not in the form YYYYMMDDnn')
      }
      return SoaSerial.parse(serialString)
    })
    .then(
      new Contract({
        pre: [
          soaSerial => soaSerial instanceof SoaSerial
        ],
        post: [(soaSerial, result) => result === soaSerial],
        exception: [() => false]
      }).implementation(soaSerial => soaSerial),
      new Contract({
        pre: [
          () => true
          /* domain does not exist, or there is no SOA record, or there is no internet connection, or
           no DNS server can be contacted, or the SOA serial it is not in the form YYYYMMDDnn … */
        ],
        post: [() => false],
        exception: [
          (err1, err2) => err1 === err2
        ]
      }).implementation(err => { throw err })
    )
})

/**
 * Get the current SOA serial via DNS (which might not exists), and create the next one, for use
 * at {@code at}. If no SOA record exists, the network is not available, or the serial is not in
 * the format YYYYMMDDnn, an SoaSerial is created with sequence number 0.
 * The promise is rejected if the current sequence number is already at 99, and {@code at} is at the same
 * day in the UTC time zone as reflected by the current SOA serial, or if {@code at} is before the
 * day of the current SOA serial in the UTC timezone.
 *
 * In principle, {@code at} must be today, or in the future.
 *
 * @param {string} domain - FQDN of the domain to get the current SOA record of
 * @param {Date|moment.Moment} at - the time at which the resulting instance would be used
 * @return {Promise<SoaSerial>} Promise for an SoaSerial instance, that can be used at {@code at},
 *                              give the current state of the {@code domain} SOA in DNS
 */
SoaSerial.nextSoaSerial = new Contract({
  pre: [
    (domain, at) => typeof domain === 'string',
    (domain, at) => at instanceof Date || moment.isMoment(at)
  ],
  post: [
    (domain, at, result) => Q.isPromiseAlike(result)
    /* Contracts does not offer support for Promises yet */
  ],
  exception: [() => false]
}).implementation(function (domain, at) {
  return SoaSerial.currentSoaSerialString(domain)
    .then(
      (serial) => SoaSerial.serialRegExp.test(serial) ? SoaSerial.parse(serial).next(at) : new SoaSerial(at, 0),
      (ignore) => new SoaSerial(at, 0)
    )
    .then(
      new Contract({
        pre: [
          soaSerial => soaSerial instanceof SoaSerial
        ],
        post: [(soaSerial, result) => result === soaSerial],
        exception: [() => false]
      }).implementation(soaSerial => soaSerial),
      new Contract({
        pre: [
          () => true
          /* current sequence number is already at 99, and {@code at} is at the same
             day in the UTC time zone as reflected by the current SOA serial, or {@code at} is before the
             day reflected by the current SOA serial. */
        ],
        post: [() => false],
        exception: [
          (err1, err2) => err1 === err2
        ]
      }).implementation(err => { throw err })
    )
})

/**
 * Return a new instance of {@link SoaSerial}, that can be used as the next SOA serial after {@code this}, at
 * {@code useAt}.
 * - If the UTC day-date part of {@link #at} is before the UTC day-date part of {@code useAt},
 *   the result has {@link at} === {@code useAt}, and its {@link #sequenceNumber} is 0.
 * - If {@link #at} has the same UTC date as {@code useAt}, the result has the same {@link at} as {@code this}
 *   (and thus the same {@link year()}, {@link month()}, and {@link #day()}, but its {@link #sequenceNumber} is the
 *   successor of this' {@link #sequenceNumber}.
 *
 * Fails if the day of {@code useAt} is before the day of {@link at} in the UTC timezone, or the sequence numbers are
 * depleted.
 * In principle, {@code useAt} must be today, or in the future.
 *
 * @param {Date|Moment} useAt - the time at which the resulting instance would be used
 * @return {SoaSerial} Next SOA serial, to be used at {@code useAt}, given {@code this} as the current SOA serial
 */
SoaSerial.prototype.next = new Contract({
  pre: [
    useAt => useAt instanceof Date || moment.isMoment(useAt)
  ],
  post: [
    (useAt, result) => result instanceof SoaSerial,
    (useAt, result) => result.serialStart === moment(useAt).utc().format(SoaSerial.isoDateWithoutDashesPattern),
    function (useAt, result) {
      return (result.serialStart === this.serialStart) || result.sequenceNumber === 0
    },
    function (useAt, result) {
      return (result.serialStart !== this.serialStart) || result.sequenceNumber === this.sequenceNumber + 1
    }
  ],
  exception: [
    function (useAt, err) {
      return err instanceof Error &&
        (this.at.isAfter(useAt, 'day') || SoaSerial.maxSequenceNumber <= this.sequenceNumber)
    }
  ]
}).implementation(function next (useAt) {
  if (SoaSerial.maxSequenceNumber <= this.sequenceNumber) {
    throw new Error('Cannot create a next serial on useAt, ' +
                    'because this serial already has the maximum sequence number for that day')
  }
  if (this._at.isAfter(useAt, 'day')) {
    throw new Error('Cannot create a next serial for useAt earlier than the day in the current serial')
  }

  return new SoaSerial(useAt, this._at.isSame(useAt, 'day') ? this.sequenceNumber + 1 : 0)
})

module.exports = SoaSerial
