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
  .command("test")
  .description("validate and plan the configuration in cwd with in the environment of the branch")
  .action(() => {
    terraform
      .plan(process.cwd())
      .done(
        () => console.log("terraform planned successfully"),
        (err) => console.error(err.message)
      );
  });

program.parse(process.argv);
