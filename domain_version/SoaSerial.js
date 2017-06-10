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

class SoaSerial {

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

  /**
   * Construct an {@link SoaSerial} instance from the serial string as expected in a DNS SOA record.
   *
   * @param {string} serial - string in the format YYYYMMDDnn, expected of an SOA serial
   * @return {object} object with the parts of the serial ({@code year}, {@code month}, {@code day},
   *                  {@code sequenceNumber}) as properties of type {@code string}
   */
  static parse(serial) {
    const parts = SoaSerial.serialRegExp.exec(serial);
    return new SoaSerial(moment.utc(parts[1], SoaSerial.isoDateWithoutDashesPattern), Number.parseInt(parts[2]));
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
  next(useAt) {
    if (this._at.isAfter(useAt, "day")) {
      throw new Error("Cannot create a next serial for useAt earlier than the day in the current serial");
    }
    return new SoaSerial(useAt, this._at.isSame(useAt, "day") ? this.sequenceNumber + 1 : 0);
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

SoaSerial.yearPattern = "YYYY";
SoaSerial.monthPattern = "MM";
SoaSerial.dayPattern = "DD";
SoaSerial.isoDateWithoutDashesPattern = SoaSerial.yearPattern + SoaSerial.monthPattern + SoaSerial.dayPattern;
SoaSerial.serialRegExp = /(\d{8})(\d{2})/;

module.exports = SoaSerial;
