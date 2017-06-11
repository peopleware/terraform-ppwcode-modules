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

const moment = require("moment");
const pad = require("pad");
const Contract = require("@toryt/contracts-ii");

class SoaSerial {

  get invariants() {
    return moment.isMoment(this.at)
           && this.at.utcOffset() === 0
           && this.at.utc().hours() === 0
           && this.at.utc().minutes() === 0
           && this.at.utc().seconds() === 0
           && this.at.utc().milliseconds() === 0
           && typeof this.year === "string"
           && SoaSerial.yearRegExp.test(this.year)
           && typeof this.month === "string"
           && SoaSerial.monthRegExp.test(this.month)
           && 1 <= Number.parseInt(this.month)
           && Number.parseInt(this.month) <= SoaSerial.maxMonth
           && typeof this.day === "string"
           && SoaSerial.dayRegExp.test(this.day)
           && 1 <= Number.parseInt(this.day)
           && Number.parseInt(this.day)
              <= moment(this.year + this.month, SoaSerial.yearPattern + SoaSerial.monthPattern).daysInMonth()
           && typeof this.serialStart === "string"
           && this.serialStart === this.year + this.month + this.day
           && typeof this.sequenceNumber === "number"
           && 0 <= this.sequenceNumber
           && this.sequenceNumber <= SoaSerial.maxSequenceNumber
           && typeof this.serial === "string"
           && this.serial === this.serialStart + pad(2, this.sequenceNumber, "0")
           && JSON.parse(JSON.stringify(this)).at === JSON.parse(JSON.stringify(this.at))
           && JSON.parse(JSON.stringify(this)).year === this.year
           && JSON.parse(JSON.stringify(this)).month === this.month
           && JSON.parse(JSON.stringify(this)).day === this.day
           && JSON.parse(JSON.stringify(this)).sequenceNumber === this.sequenceNumber
           && JSON.parse(JSON.stringify(this)).serial === this.serial;
  }

  /**
   * Create a new {@code SoaSerial}, given the date of {@code at} and the {@sequenceNumber}.
   *
   * @param {Date|moment.Moment} at - the date at which this instance should be used
   * @param {Number} sequenceNumber - the sequence number of the SOA serial within the day represented by {@code at}
   */
  constructor(at, sequenceNumber) {
    this._at = moment.utc(at).startOf("day");
    this.sequenceNumber = sequenceNumber;
  }

  get at() {
    return moment.utc(this._at).startOf("day");
  }

  /**
   * @return {string} 4-digit year of {@link #at}
   */
  get year() {
    return this._at.format(SoaSerial.yearPattern);
  }

  /**
   * @return {string} 2-digit month of {@link #at}
   */
  get month() {
    return this._at.format(SoaSerial.monthPattern);
  }

  /**
   * @return {string} 2-digit day of {@link #at}
   */
  get day() {
    return this._at.format(SoaSerial.dayPattern);
  }

  /**
   * The first 8 digits of the SOA serial
   *
   * @return {string} {@link #year} + {@link #month} + {@link #day}
   */
  get serialStart() {
    return this._at.format(SoaSerial.isoDateWithoutDashesPattern);
  }

  /**
   * 10-digit SOA serial, to be used at {@code at}, with sequence number {@code sequenceNumber}.
   *
   * @return {string} {@link #serialStart} + {@link #sequenceNumber}
   */
  get serial() {
    return this.serialStart + pad(2, this.sequenceNumber, "0");
  }

  //noinspection JSUnusedGlobalSymbols
  toJSON() {
    return {
      at:             this.at,
      year:           this.year,
      month:          this.month,
      day:            this.day,
      sequenceNumber: this.sequenceNumber,
      serial:         this.serial
    }
  }

}

SoaSerial.constructorContract = new Contract({
  pre: [
    (at, sequenceNumber) => at instanceof Date || moment.isMoment(at),
    (at, sequenceNumber) => typeof sequenceNumber === "number",
    (at, sequenceNumber) => 0 <= sequenceNumber,
    (at, sequenceNumber) => sequenceNumber <= SoaSerial.maxSequenceNumber
  ],
  post: [
    (at, sequenceNumber, result) =>
      result.at.format(SoaSerial.isoDateWithoutDashesPattern)
        === moment(at).utc().format(SoaSerial.isoDateWithoutDashesPattern),
    (at, sequenceNumber, result) => result.sequenceNumber === sequenceNumber
  ],
  exception: [() => false]
});

SoaSerial.yearPattern = "YYYY";
SoaSerial.yearRegExp = /^\d{4}$/;
SoaSerial.monthPattern = "MM";
SoaSerial.monthRegExp = /^\d{2}$/;
SoaSerial.dayPattern = "DD";
SoaSerial.dayRegExp = /^\d{2}$/;
SoaSerial.isoDateWithoutDashesPattern = SoaSerial.yearPattern + SoaSerial.monthPattern + SoaSerial.dayPattern;
SoaSerial.serialRegExp = /^(\d{8})(\d{2})$/;
SoaSerial.detailedSerialRegExp = /^(\d{4})(\d{2})(\d{2})(\d{2})$/;
//noinspection MagicNumberJS
SoaSerial.maxSequenceNumber = 99;
//noinspection MagicNumberJS
SoaSerial.maxMonth = 12;

/**
 * Construct an {@link SoaSerial} instance from the serial string as expected in a DNS SOA record.
 *
 * @param {string} serial - string in the format YYYYMMDDnn, expected of an SOA serial
 * @return {object} object with the parts of the serial ({@code year}, {@code month}, {@code day},
 *                  {@code sequenceNumber}) as properties of type {@code string}
 */
SoaSerial.parse = new Contract({
    pre: [
      (serial) => typeof serial === "string",
      (serial) => SoaSerial.detailedSerialRegExp.test(serial),
      (serial) => 1 <= Number.parseInt(SoaSerial.detailedSerialRegExp.exec(serial)[2]),
      (serial) => Number.parseInt(SoaSerial.detailedSerialRegExp.exec(serial)[2]) <= SoaSerial.maxMonth,
      (serial) => 1 <= Number.parseInt(SoaSerial.detailedSerialRegExp.exec(serial)[3]),
      (serial) =>
        Number.parseInt(SoaSerial.detailedSerialRegExp.exec(serial)[3])
          <= moment(
               SoaSerial.detailedSerialRegExp.exec(serial)[1] + SoaSerial.detailedSerialRegExp.exec(serial)[2],
               SoaSerial.yearPattern + SoaSerial.monthPattern
             ).daysInMonth(),
      (serial) => 0 <= Number.parseInt(SoaSerial.detailedSerialRegExp.exec(serial)[4]),
      (serial) => Number.parseInt(SoaSerial.detailedSerialRegExp.exec(serial)[4]) <= SoaSerial.maxSequenceNumber
    ],
    post: [
      (serial, result) => result instanceof SoaSerial,
      (serial, result) => result.serial === serial
    ],
    exception: [() => false]
  }).implementation(function parse(serial) {
    const parts = SoaSerial.serialRegExp.exec(serial);
    return new SoaSerial(moment.utc(parts[1], SoaSerial.isoDateWithoutDashesPattern), Number.parseInt(parts[2]));
  });

/**
 * Return a new instance of {@link SoaSerial}, that can be used as the next SOA serial after {@code this}, at
 * {@code useAt}.
 * - If the UTC day-date part of {@link #at} is before the UTC day-date part of {@code useAt},
 *   the result has {@link at} === {@code useAt}, and its {@link #sequenceNumber} is 0.
 * - If {@link #at} has the same UTC date as {@code useAt}, the result has the same {@link at} as {@code this}
 *   (and thus the same {@link year()}, {@link month()}, and {@link #day()}, but its {@link #sequenceNumber} is the
 *   successor of this' {@link #sequenceNumber}.
 * - If there is a {@code currentSerial}, and its date part represents the UTC date of {@code at},
 *   that date part followed by a 2-digit sequence number that is the successor of the sequence number in
 *   {@code currentSerial}
 *
 * @param {Date|Moment} useAt - the time at which the resulting instance would be used
 * @return {SoaSerial} Next SOA serial, to be used at {@code useAt}, given {@code this} as the current SOA serial
 */
SoaSerial.prototype.next = new Contract({
  pre: [
    useAt => useAt instanceof Date || moment.isMoment(useAt)
  ],
  post: [],
    (useAt, err) =>
      err instanceof Error
      && (this.at.isAfter(useAt, "day")
          || SoaSerial.maxSequenceNumber <= this.sequenceNumber)
  exception: [
  ]
}).implementation(function(useAt) {
  if (SoaSerial.maxSequenceNumber <= this.sequenceNumber) {
    throw new Error("Cannot create a next serial on useAt, "
                    + "because this serial already has the maximum sequence number for that day");
  }
  if (this._at.isAfter(useAt, "day")) {
    throw new Error("Cannot create a next serial for useAt earlier than the day in the current serial");
  }

  return new SoaSerial(useAt, this._at.isSame(useAt, "day") ? this.sequenceNumber + 1 : 0);
});

module.exports = SoaSerial;
