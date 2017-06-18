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

Each git branch in which commands are executed represents a separate Terraform
environment. The Terraform configuration must use \${terraform.env} to
maintain a completely separate infrastructure for each environment / branch.
The name of the Terraform environment is the name of the git branch, with '/'
replaced by '-', and then URL-encoded. The exception is the 'master' branch,
which maps to the Terraform 'default' environment. Each command will make sure
that your configuration is in the environment that correlates with the
checked-out branch.

When the checked-out branch matches one of the strings 'prod', 'staging',
'stage', or 'test (case-insensitive), this command will refuse to do anything
if the git working copy is not clean, i.e., there are no dangling
modifications, and everything is pushed.
 
Some Terraform modules in this repository will store references to the state
of the git repository (branch name, sha, url, …) in the infrastructure.
The above measure helps in making the operations repeatable from that state
of the repository. Some Terraform modules in this repository will tag the
repository with infrastructure-defined version information or labels when
appropriate. These tags are not pushed by these commands. You should push
after running these commands.

Before committing a '*.tf' file, you should call

    > terraform fmt

We cannot automate this yet, since there is a bug in this terraform command
until at least version 0.9.6, where the formatted output for comments keeps
changing, with deeper and deeper indents.

To test a Terraform configuration, execute

    > tf test
    
This will put your configuration in the environment that correlates with the
checked-out branch, validate and try to plan the Terraform configuration. This
is as close to a "unit test" as we can get with Terraform. This command changes
nothing, apart from the environment you are working in. The plan is not saved.
     
To apply a Terraform configuration, execute

    > tf make-it-so
    
This will put your configuration in the environment that correlates with the
checked-out branch, validate and try to plan the Terraform configuration, and
if all goes well, apply the configuration. It is only now that errors from the
remote environment will become apparent.
You should therefor work in a development branch first, and experiment there
until 'tf make-it-so' works consistently without errors. Then, you should
create a branch / environment 'test/…' from the HEAD of the 'production'
branch, and 'make-it-so'. This will emulate the current production environment.
Then merge the development branch into the new test branch, commit, and
'make-it-so'. This will test the evolution of the current state of the
production environment to the new state. If all goes well, you can now create a
branch 'staging/…' from the HEAD of the 'test/…' branch. This can be used for
pre-production staging of the new target state, and for final QA and
acceptance, of applicable. Finally, you can merge this branch into the
production branch and 'make-it-so' to change the production environment to the
new desired state.

Terraform configurations in staging or production environments should only be
applied ('tf make-it-so') by CI-tools, and not by humans.

If anything goes wrong in any of these environments while applying the
configuration, you are on your own, and these scripts will not help. These
scripts are merely intended to make the above process more fluent. To do not
excuse the user from deeply understanding how Terraform and the underlying
infrastructure provider works.

You can execute

    > tf destroy
    
while a branch you no longer need is checked-out to destroy the infrastructure
environment it represents. You should do this with development branches after
you are done with them, and with staging environments you no longer use.
You should be able to restore them simply by checking out the last commit of
that branch later, and executing 'tf make-it-so'. This command will put your
configuration in the environment that correlates with the checked-out branch,
and destroy it.
`;

program.on("--help", function() {
  console.log(help);
});

program
  .command("test")
  .description("Test the configuration in cwd with in the environment of the branch")
  .action(() => {
    terraform
      .plan(process.cwd())
      .done(
        () => console.log("terraform planned successfully"),
        (err) => console.error(err.message)
      );
  });

program.parse(process.argv);
