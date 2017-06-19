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
const GitInfo = require("@ppwcode/node-gitinfo");
const path = require("path");
const formatBranchAsEnvironmentName = require("@ppwcode/node-gitinfo/formatBranchAsEnvironmentName");

function removeFinalEol(text) {
  return text.endsWith(eol) ? text.substring(0, text.length - 1) : text;
}

function runWithOutput(command) {
  return function(cwd) {
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
        deferred.resolve(cwd);
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
  };
}


const currentEnvironmentPattern = /^(\*\s*)?(.*)$/;

function getEnvironments() {
  return exec("terraform env list", {cwd: path.dirname(path.dirname(__filename))})
    .then(function(args) {
      const stdout = args[0];
      //const stderr = args[1];
      let environments = stdout.split(eol).filter(l => !!l).map(l => l.trim());
      const currentEnvironmentIndex = environments
        .reduce(
          (acc, e, index) => {
            if (e.startsWith("* ")) {
              if (acc !== undefined) {
                throw new Error("Multiple candidates for current environment");
              }
              return index;
            }
            return acc;
          },
          undefined
        );
      if (currentEnvironmentIndex === undefined) {
        throw new Error("No current environment found");
      }
      environments = environments.map(l => currentEnvironmentPattern.exec(l)[2]);
      environments.current = environments[currentEnvironmentIndex];
      return environments;
    });
}

// MUDO throw error
function setEnvironmentFromBranch(path) {
  return Q.all([
                 getEnvironments(),
                 GitInfo
                   .createForHighestGitDir(path)
                   .then(gitInfo => gitInfo.branch)
               ]).spread((environments, branch) => {
    let formattedBranch = formatBranchAsEnvironmentName(branch);
    if (formattedBranch === "master") {
      formattedBranch = "default";
    }

    function check() {
      return getEnvironments()
        .then(environments => {
          if (environments.current !== formattedBranch) {
            console.error("Switch to environment %s failed", formattedBranch);
            process.exitCode = 1;
            return;
          }
          console.log("You are now in environment %s", environments.current);
          return formattedBranch;
        });
    }

    if (environments.indexOf(formattedBranch) < 0) {
      console.warn(
        "There is not yet an environment for branch \"%s\". Creating environment \"%s\" …",
        branch,
        formattedBranch
      );
      return exec("terraform env new " + formattedBranch).then(check);
    }
    else if (environments.current !== formattedBranch) {
      console.warn(
        "You are currently not in the environment of branch \"%s\", but in environment \"%s\". "
        + "Switching to environment \"%s\" …",
        branch,
        environments.current,
        formattedBranch
      );
      return exec("terraform env select " + formattedBranch).then(check);
    }
    else {
      console.log("You are in the correct environment \"%s\" for branch \"%s\".", environments.current, branch);
      return formattedBranch;
    }
  });
}

module.exports.init = function(path) {
  return runWithOutput("terraform init")(path)
    .then(setEnvironmentFromBranch);
};

module.exports.test = function(path) {
  return runWithOutput("terraform get --update")(path)
    .then(setEnvironmentFromBranch)
    .then(runWithOutput("terraform validate"))
    .then(runWithOutput("terraform plan"));
};

module.exports.makeItSo = function(path) {
  return module.exports.test(path)
    .then(runWithOutput("terraform apply"));
};

module.exports.destroy = function(path) {
  return runWithOutput("terraform get --update")(path)
    .then(setEnvironmentFromBranch)
    .then(runWithOutput("terraform destroy"));
};
