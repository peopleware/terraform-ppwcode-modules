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
const execProcess = require("child_process").exec;
const exec = Q.denodeify(execProcess);
const eol = require("os").EOL;
const GitInfo = require("@ppwcode/node-gitinfo");

function removeFinalEol(text) {
  return text.endsWith(eol) ? text.substring(0, text.length - 1) : text;
}

/**
 * Return a function that takes a {@code cwd}, and executes {@code command} in that {@code cwd}.
 * The returned function returns a Promise that resolves if the command succeeds to {@code cwd}.
 * The promise is rejected if the command fails, with an Error.
 *
 * This function prints the stdout and stderr the {@code command} returns on the console.
 *
 * It is not possible to test this, without actually doing outside calls. That is possible, but very labour intensive.
 *
 * @param {string} command - the command to execute
 * @param {string?} consoleMessage - message to show in the console before we begin
 * @return {Function} A function that executes {@code command} in {@code cwd}, which it takes as parameter.
 */
function runWithOutput(command, consoleMessage) {
  return function(cwd) {
    if (consoleMessage) {
      console.log(consoleMessage);
    }
    //noinspection JSUnresolvedFunction
    let deferred = Q.defer();
    const childProcess = execProcess(command, {cwd: cwd});

    const errCommandStr = "`" + command + "`";
    let promiseHandled = false;

    childProcess.on("error", (internalError) => {
      if (promiseHandled) {
        console.error("Received error event from " + errCommandStr + ", but Promise was already settled (error: "
                     + internalError.message + ")");
        return;
      }
      const err = new Error(errCommandStr + " failed because of an internal error: " + internalError.message);
      err.command = command;
      err.cwd = cwd;
      err.internalError = internalError;
      promiseHandled = true;
      //noinspection JSIgnoredPromiseFromCall
      deferred.reject(err);
    });

    childProcess.on("exit", (exitCode, signal) => {
      if (promiseHandled) {
        console.error("Received exit event from " + errCommandStr + ", but Promise was already settled "
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
        err.command = command;
        err.cwd = cwd;
        err.exitCode = exitCode;
        err.signal = signal;
        err.stderr = childProcess.stderr;
        promiseHandled = true;
        //noinspection JSIgnoredPromiseFromCall
        deferred.reject(err);
      }
    });

    childProcess.stdout.on("data", data => {
      console.log(removeFinalEol(data)); // console adds an eol
    });

    childProcess.stderr.on("data", data => {
      console.error(removeFinalEol(data)); // console adds an eol
    });

    //noinspection JSUnresolvedVariable
    return deferred.promise;
  };
}

const currentEnvironmentPattern = /^(\*\s*)?(.*)$/;
module.exports.multipleCurrentEnvironmentsMessage = "MULTIPLE_CURRENT_ENVIRONMENTS";
module.exports.noCurrentEnvironmentMessage = "NO_CURRENT_ENVIRONMENT";

/**
 * Return a Promise for all environments Terraform knows in {@code terraformConfigurationPath}.
 * The Promise is rejected if no current environment is found, or multiple current
 * environments are found.
 *
 * It is not possible to test this, without actually changing branches and initialising Terraform,
 * apart from writing extensive mocks. The latter might make little sense. This is not done at this time.
 *
 * @param {string} terraformConfigurationPath - path to the Terraform configuration directory to set the environment of
 * @result {Promise<string>} Promise that resolves to all the known environment names, as an array.
 *                           The array has a property {@code current} of type {@code string}, that is the name of the
 *                           current environment.
 */
function getEnvironments(terraformConfigurationPath) {
  console.log("Getting the known Terraform environments …");
  // TODO the handling of the response should be tested in a separate function
  const command = "terraform env list";
  return exec(command, {cwd: terraformConfigurationPath})
    .then(function(args) {
      const stdout = args[0];
      let environments = stdout.split(eol).filter(l => !!l).map(l => l.trim());
      const currentEnvironmentIndex = environments
        .reduce(
          (acc, e, index) => {
            if (e.startsWith("* ")) {
              if (acc !== undefined) {
                throw new Error(module.exports.multipleCurrentEnvironmentsMessage);
              }
              return index;
            }
            return acc;
          },
          undefined
        );
      if (currentEnvironmentIndex === undefined) {
        throw new Error(module.exports.noCurrentEnvironmentMessage);
      }
      environments = environments.map(l => currentEnvironmentPattern.exec(l)[2]);
      environments.current = environments[currentEnvironmentIndex];
      return environments;
    });
}

module.exports.environmentSwitchFailedMessage = "ENVIRONMENT_SWITCH_FAILED";

/**
 * Validate that we are in environment {@code expectedEnvironment}, and report on the console.
 *
 * Returns a Promise that resolves to the {@code terraformConfigurationPath} if the test succeeds.
 * The Promise is rejected if the test fails, with an {@code Error} with message
 * {@link module#exports#environmentSwitchFailedMessage}.
 *
 * It is not possible to test this, without actually changing branches and initialising Terraform,
 * apart from writing extensive mocks. The latter might make little sense. This is not done at this time.
 *
 * @param {string} terraformConfigurationPath - path to the Terraform configuration directory to set the environment of
 * @param {string} expectedEnvironment - the environment to validate
 * @return {Promise<string?>} Resolves to {@code terraformConfigurationPath} if the test succeeds.
 */
function check(expectedEnvironment, terraformConfigurationPath) {
  console.log("Double checking that you are in the environment of the currently checked-out branch …");
  return getEnvironments(terraformConfigurationPath)
    .then(environments => {
      if (environments.current !== expectedEnvironment) {
        const err = Error(module.exports.environmentSwitchFailedMessage);
        err.expectedEnvironment = expectedEnvironment;
        err.actualEnvironment = environments.current;
        throw err;
      }
      console.log("You are now in environment %s", expectedEnvironment);
      return terraformConfigurationPath;
    });
}

module.exports.noEnvironmentFromBranch = "NO_ENVIRONMENT_FROM_BRANCH";

/**
 * Make it so that the Terraform environment in {@code terraformConfigurationPath} is in the environment
 * that is associated with the currently check out branch of the highest git directory above
 * {@code terraformConfigurationPath}. Nothing happens if we are already in the desired environment.
 * If we are not, and the desired environment exists, we switch to the desired environment. If the desired
 * environment does not yet exist, it is created.
 *
 * This function reports on the console.
 *
 * Returns a Promise that resolves to the {@code terraformConfigurationPath} name when done.
 * The Promise is rejected with an {@code Error}
 * with message {@link module#exports#environmentSwitchFailedMessage} if switching fails. The Promise is rejected
 * with an {@code Error} with message {@link module#exports#noEnvironmentFromBranch} if no branch is checked out
 * in the git repository (e.g., detached HEAD), or the branch is called &quot;default&quot;. Branches that are
 * named &quot;default&quot; are not supported.
 * The Promise is rejected if no current environment is found, with message
 * {@link module#exports#noCurrentEnvironmentMessage}, or when multiple current environments are found,
 * with message {@link module#exports#multipleCurrentEnvironmentsMessage}.
 *
 * It is not possible to test this, without actually changing branches and initialising Terraform,
 * apart from writing extensive mocks. The latter might make little sense. This is not done at this time.
 *
 * @param {string} terraformConfigurationPath - path to the Terraform configuration directory to set the environment of
 * @result {Promise<string>} Promise that resolves to the {@code terraformConfigurationPath}.
 */
function setEnvironmentFromBranch(terraformConfigurationPath) {
  console.log("Making sure you are in the environment of the currently checked-out branch …");
  //noinspection JSUnresolvedFunction
  return Q.all([
      getEnvironments(terraformConfigurationPath),
      GitInfo.createForHighestGitDir(terraformConfigurationPath)
    ])
    .spread((environments, gitInfo) => {
      if (!gitInfo.environment) {
        const err = new Error(module.exports.noEnvironmentFromBranch);
        err.branch = gitInfo.branch;
        throw err;
      }
      if (environments.indexOf(gitInfo.environment) < 0) {
        console.warn(
          "There is not yet an environment for branch \"%s\". Creating environment \"%s\" …",
          gitInfo.branch,
          gitInfo.environment
        );
        return runWithOutput("terraform env new " + gitInfo.environment)(terraformConfigurationPath + " …")
          .then(check.bind(undefined, gitInfo.environment));
      }
      else if (environments.current !== gitInfo.environment) {
        console.warn(
          "You are currently not in the environment of branch \"%s\", but in environment \"%s\". "
          + "Switching to environment \"%s\" …",
          gitInfo.branch,
          environments.current,
          gitInfo.environment
        );
        return runWithOutput("terraform env select " + gitInfo.environment)(terraformConfigurationPath)
          .then(check.bind(undefined, gitInfo.environment));
      }
      else {
        console.log(
          "You are in the correct environment \"%s\" for branch \"%s\".",
          environments.current,
          gitInfo.branch
        );
        return terraformConfigurationPath;
      }
    }
  );
}

/**
 * Execute {@code terraform init}, and switch Terraform to the environment derived from the
 * [name of the current git branch]{@linkplain #formatBranchAsEnvironmentName}.
 *
 * This function reports on the console.
 *
 * Returns a Promise that resolves to the environment name when done. The Promise is rejected with an {@code Error}
 * with message {@link module#exports#environmentSwitchFailedMessage} if switching fails. The Promise is rejected
 * with an {@code Error} with message {@link module#exports#noEnvironmentFromBranch} if no branch is checked out
 * in the git repository (e.g., detached HEAD), or the branch is called &quot;default&quot;. Branches that are
 * named &quot;default&quot; are not supported.
 * The Promise is rejected if no current environment is found, with message
 * {@link module#exports#noCurrentEnvironmentMessage}, or when multiple current environments are found,
 * with message {@link module#exports#multipleCurrentEnvironmentsMessage}.
 *
 * It is not possible to test this, without actually changing branches and initialising Terraform,
 * apart from writing extensive mocks. The latter might make little sense. This is not done at this time.
 *
 * @param {string} terraformConfigurationPath - path to the Terraform configuration directory to set the environment of
 * @result {Promise<string>} Promise that resolves to the {@code terraformConfigurationPath}.
 */
module.exports.init = function(terraformConfigurationPath) {
  console.log("Init Terraform configuration in \"%s\" …", terraformConfigurationPath);
  return runWithOutput("terraform init")(terraformConfigurationPath)
    .then(setEnvironmentFromBranch)
    .then(() => console.log("terraform configuration initialised successfully"));
};

/**
 * Update Terraform modules, and switch Terraform to the environment derived from the
 * [name of the current git branch]{@linkplain #formatBranchAsEnvironmentName}. Then validate, and plan the
 * configuration.
 *
 * This function reports on the console.
 *
 * Returns a Promise that resolves to the environment name when done. The Promise is rejected with an {@code Error}
 * with message {@link module#exports#environmentSwitchFailedMessage} if switching fails. The Promise is rejected
 * with an {@code Error} with message {@link module#exports#noEnvironmentFromBranch} if no branch is checked out
 * in the git repository (e.g., detached HEAD), or the branch is called &quot;default&quot;. Branches that are
 * named &quot;default&quot; are not supported.
 * The Promise is rejected if no current environment is found, with message
 * {@link module#exports#noCurrentEnvironmentMessage}, or when multiple current environments are found,
 * with message {@link module#exports#multipleCurrentEnvironmentsMessage}.
 *
 * It is not possible to test this, without actually changing branches and initialising Terraform,
 * apart from writing extensive mocks. The latter might make little sense. This is not done at this time.
 *
 * @param {string} terraformConfigurationPath - path to the Terraform configuration directory to test
 * @result {Promise<string>} Promise that resolves to the {@code terraformConfigurationPath}.
 */
module.exports.test = function(terraformConfigurationPath) {
  console.log("Test Terraform configuration in \"%s\" …", terraformConfigurationPath);
  return runWithOutput(
    "terraform get --update",
    "Update Terraform modules in \"" + terraformConfigurationPath + "\" …"
  )(terraformConfigurationPath)
    .then(setEnvironmentFromBranch)
    .then(runWithOutput(
      "terraform validate",
      "Validate Terraform configuration in \"" + terraformConfigurationPath + "\" …"
    ))
    .then(runWithOutput(
      "terraform plan",
      "Plan Terraform configuration in \"" + terraformConfigurationPath + "\" …"
    ))
    .then(() => console.log("terraform configuration tested successfully"));
};

/**
 * Update Terraform modules, and switch Terraform to the environment derived from the
 * [name of the current git branch]{@linkplain #formatBranchAsEnvironmentName}. Then validate, and plan the
 * configuration. If all goes well, apply the configuration.
 *
 * This function reports on the console.
 *
 * Returns a Promise that resolves to the environment name when done. The Promise is rejected with an {@code Error}
 * with message {@link module#exports#environmentSwitchFailedMessage} if switching fails. The Promise is rejected
 * with an {@code Error} with message {@link module#exports#noEnvironmentFromBranch} if no branch is checked out
 * in the git repository (e.g., detached HEAD), or the branch is called &quot;default&quot;. Branches that are
 * named &quot;default&quot; are not supported.
 * The Promise is rejected if no current environment is found, with message
 * {@link module#exports#noCurrentEnvironmentMessage}, or when multiple current environments are found,
 * with message {@link module#exports#multipleCurrentEnvironmentsMessage}.
 *
 * It is not possible to test this, without actually changing branches and initialising Terraform,
 * apart from writing extensive mocks. The latter might make little sense. This is not done at this time.
 *
 * @param {string} terraformConfigurationPath - path to the Terraform configuration directory to apply
 * @result {Promise<string>} Promise that resolves to the {@code terraformConfigurationPath}.
 */
module.exports.makeItSo = function(terraformConfigurationPath) {
  console.log("Apply Terraform configuration in \"%s\" …", terraformConfigurationPath);
  return module.exports.test(terraformConfigurationPath)
    .then(runWithOutput(
      "terraform apply",
      "Apply Terraform configuration in \"" + terraformConfigurationPath + "\" …"
    ))
    .then(() => console.log("terraform configuration applied successfully"));
};

/**
 * Update Terraform modules, and switch Terraform to the environment derived from the
 * [name of the current git branch]{@linkplain #formatBranchAsEnvironmentName}. Then destroy the environment.
 *
 * This function reports on the console.
 *
 * Returns a Promise that resolves to the environment name when done. The Promise is rejected with an {@code Error}
 * with message {@link module#exports#environmentSwitchFailedMessage} if switching fails. The Promise is rejected
 * with an {@code Error} with message {@link module#exports#noEnvironmentFromBranch} if no branch is checked out
 * in the git repository (e.g., detached HEAD), or the branch is called &quot;default&quot;. Branches that are
 * named &quot;default&quot; are not supported.
 * The Promise is rejected if no current environment is found, with message
 * {@link module#exports#noCurrentEnvironmentMessage}, or when multiple current environments are found,
 * with message {@link module#exports#multipleCurrentEnvironmentsMessage}.
 *
 * It is not possible to test this, without actually changing branches and initialising Terraform,
 * apart from writing extensive mocks. The latter might make little sense. This is not done at this time.
 *
 * @param {string} terraformConfigurationPath - path to the Terraform configuration directory to destroy
 * @result {Promise<string>} Promise that resolves to the {@code terraformConfigurationPath}.
 */
module.exports.destroy = function(terraformConfigurationPath) {
  console.log("Destroy Terraform configuration in \"%s\" …", terraformConfigurationPath);
  console.log("Updating Terraform modules …");
  return runWithOutput(
    "terraform get --update",
    "Update Terraform modules in \"" + terraformConfigurationPath + "\" …"
  )(terraformConfigurationPath)
    .then(setEnvironmentFromBranch)
    .then(runWithOutput(
      "terraform destroy",
      "Destroy Terraform configuration in \"" + terraformConfigurationPath + "\" …"
    ))
    .then(() => console.log("terraform configuration destroyed successfully"));
};
