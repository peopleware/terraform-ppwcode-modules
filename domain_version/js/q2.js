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

const Q = require("q");

/**
 * Turns an object of promises into a promise for an object.  If any of
 * the promises gets rejected, the whole object is rejected immediately.
 * @param {object} promises - an object (or promise for an object) of properties with values (or
 *                            promises for values)
 * @return {object|Promise<object>} a promise for an array of the corresponding values
 */
function object(promises) {
  if (!promises) {
    return promises;
  }
  return Q.all(Object.keys(promises).map((key) => Q.when(promises[key], (value) => ({key, value}))))
          .then((kvPairs) => kvPairs.reduce(
            (acc, kvPair) => {
              acc[kvPair.key] = kvPair.value;
              return acc;
            },
            {}
          ));
}

// monkey patch object on q
Q.object = object;

module.exports = Q;
