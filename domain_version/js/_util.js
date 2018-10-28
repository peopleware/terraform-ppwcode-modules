/**
 *    Copyright 2018 PeopleWare n.v.
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

function exceptionIsAnErrorCondition () { return arguments[arguments.length - 2] instanceof Error }

module.exports = {
  exceptionIsAnErrorCondition: exceptionIsAnErrorCondition,
  exceptionIsAnError: [exceptionIsAnErrorCondition],

  /**
   * Take a Promise-like object, and turn it into a native Promise.
   *
   * This is introduced since Contracts requires native Promises.
   */
  realPromise: function (promiseLike) {
    return new Promise((resolve, reject) => promiseLike.catch(exc => reject(exc)).then(result => resolve(result)))
  }
}
