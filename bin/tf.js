#!/usr/bin/env node

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

const program = require("commander");
const terraform = require("../js/terraform");
const packageVersion = require("pkginfo")(module, "version");

/**
 * Take an error, from {@code terraform}, and report on the console.
 * Then prepare to exit with a non-zero exit code.
 *
 * @param {string} cwd - path to the Terraform configuration directory we were asked to work in
 * @param err - the rejection of the command Promise
 * @return {boolean} false
 */
function handleTerraformError(cwd, err) {
  if (err.message === terraform.noCurrentEnvironmentMessage) {
    console.error(
      "Cannot switch to the expected environment in \"%s\", because there is no current environment",
      cwd
    );
  }
  else if (err.message === terraform.multipleCurrentEnvironmentsMessage) {
    console.error(
      "Multiple current environments found in \"%s\". This should not happen. Cannot proceed.",
      cwd
    );
  }
  else if (err.message === terraform.environmentSwitchFailedMessage) {
    console.error(
      "Did not succeed in setting the environment of \"%s\" to \"%s\". "
      + "You are in environment \"%s\". Cannot proceed.",
      cwd,
      err.expectedEnvironment,
      err.actualEnvironment
    );
  }
  else if (err.message === terraform.noEnvironmentFromBranch) {
    console.error(
      "There cannot be an environment for branch \"%s\" in \"%s\". Cannot proceed",
      err.branch,
      cwd
    );
  }
  else if (!err.internalError) {
    console.error("Command '%s' failed in \"%s\": %s", err.command, err.cwd, err.message);
  }
  else {
    console.error(
      "Internal error while executing command '%s' in \"%s\": %s",
      err.command,
      err.cwd,
      err.internalError.message
    );
    console.error(err.internalError.stack);
  }
  process.exitCode = 1;
  return false;
}

/**
 * Return a function that executes the given action.
 */
function terraformAction(action) {
  return function() {
    const cwd = process.cwd();
    terraform[action](cwd)
      .catch(handleTerraformError.bind(undefined, cwd))
      .done();
  };
}

//noinspection JSCheckFunctionSignatures
program
  .version(packageVersion);

const help =
`
Encapsulate steps you should always follow when working with our Terraform
configurations.

Each configuration must be in a git working copy, that has a remote called
'origin'.
These steps will execute Terraform in the highest git directory found above
the current working directory.

See the project's README for more information.
`;

program.on("--help", function() {
  console.log(help);
});

program
  .command("init")
  .alias("i")
  .description("initialise the configuration in cwd and switch to the environment of the branch")
  .action(terraformAction("init"));

program
  .command("test")
  .alias("t")
  .description("update the modules, validate and plan the configuration in cwd with in the environment of the branch")
  .action(terraformAction("test"));

program
  .command("makeItSo")
  .alias("m")
  .description("update the modules, validate, plan and apply the configuration in cwd with in "
               + "the environment of the branch")
  .action(terraformAction("makeItSo"));

program
  .command("destroy")
  .alias("d")
  .description("update the modules, and destroy the configuration in cwd with in the environment of the branch")
  .action(terraformAction("destroy"));

program.parse(process.argv);
