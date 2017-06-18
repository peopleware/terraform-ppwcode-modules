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

/**
 * Collection of functions that expose Terraform to JavaScript.
 * Terraform is called via child_process.exec. The functions return Promises for an object that represents
 * the effect of the operations, or are rejected with an Error that carries the stderr from Terraform.
 * During long-running executions, such as plan and apply, nominal output is written to stdout.
 */

const Q = require("@ppwcode/node-gitinfo/q2");
const bareExec = require("child_process").exec;
const exec = Q.denodeify(bareExec);
const eol = require("os").EOL;

function removeFinalEol(text) {
  return text.endsWith(eol) ? text.substring(0, text.length - 1) : text;
}

function runWithOutput(command, cwd, resolution) {
  let deferred = Q.defer();
  const childProcess = bareExec(
    command,
    {
      cwd: cwd
    },
    (err, stdout, stderr) => {

    }
  );

  const errCommandStr = "`" + command + "`";
  let promiseHandled = false;

  childProcess.on("error", (internalError) => {
    if (promiseHandled) {
      console.warn("Received error event from " + errCommandStr + ", but Promise was already settled (error: "
                   + internalError.message + ")");
      return;
    }
    const err = new Error(errCommandStr + " failed because of an internal error: " + internalError.message);
    err.internalError = internalError;
    promiseHandled = true;
    deferred.reject(err);
  });

  childProcess.on("exit", (exitCode, signal) => {
    if (promiseHandled) {
      console.warn("Received exit event from " + errCommandStr + ", but Promise was already settled "
                   + "(exit code: " + exitCode + ", signal: " + signal + ")");
      return;
    }
    if (exitCode === 0) {
      console.log(errCommandStr + " ended nominally");
      promiseHandled = true;
      deferred.resolve(resolution);
    }
    else {
      let err;
      if (exitCode !== null) {
        err = new Error(errCommandStr + " failed with exit code " + exitCode);
      }
      else {
        err = new Error(errCommandStr + " stopped before completion with signal " + signal);
      }
      err.exitCode = exitCode;
      err.signal = signal;
      err.stderr = childProcess.stderr;
      promiseHandled = true;
      deferred.reject(err);
    }
  });

  childProcess.stdout.on("data", data => {
    console.log(removeFinalEol(data)); // console adds an eol
  });

  childProcess.stderr.on("data", data => {
    console.error(removeFinalEol(data)); // console adds an eol
  });

  return deferred.promise;
}

module.exports.plan = function(path) {
  return runWithOutput("terraform plan", path, true)
    .catch(err =>  {
      console.error("terraform plan failed");
      throw err;
    })
    .then(() => {
      console.log("terraform plan done");
      return true;
    });
};
