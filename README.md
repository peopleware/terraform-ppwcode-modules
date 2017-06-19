This repository contains a number of general [Terraform] modules, and supporting [Node.js] scripts.



Terraform dependency
====================

The [Terraform] documentation describes [how to use modules].
You import the modules from Github, as described [in the documentation][Terraform module sources].
Use the format for public Github repositories, using the "double-slash" to refer to the correct
subdirectory.

    module "MODULE_INSTANCE_NAME" {
        source = "github.com/peopleware/terraform-ppwcode-modules//MODULE_NAME"
    }

_On the other hand, …_



Npm / yarn dependency
=====================

The module `domain_version/` directly, and thus the module `subdomain/` that depends on it,
uses a _[Node.js] JavaScript_ script (though a [Terraform external data source provider]) to get information
about the SOA serial and the state of the git repository of the [Terraform] configuration it is used in.
[Node.js] JavaScript code depends on other [npm] packages, that need to be installed for the script to be able to
work. This repository is therefor, apart from being a collection of [Terraform] modules, also a _[Node.js][Node.js]
[npm] package_, with dependencies described in `package.json`. _The dependencies need to be available in a
`node_modules/` folder next to the script, or in one of its ancestor folders, before [Terraform] can use the
modules in `> terraform plan` or `> terraform apply`._

This is done by running (preferred) `> yarn` or (legacy) `> npm install` in the project that uses these modules.

For this to work, this collection of [Terraform] modules / [npm] / [yarn] package must itself be loaded in the
[Terraform] configuration in which it is used via `> yarn` (preferred) or `> npm install` (legacy). These commands 
work recursively.

**This is done by making the configuration in which these modules are used an [npm] / [yarn] package itself**, with this 
collection of [Terraform] modules defined as a development dependency in its `package.json`:
 
    {
      …
      "dependencies": {
        …,
        "@ppwcode/terraform-ppwcode-modules": "^n.o.p",
        …
      }
      …
    }
 
After checkout of a configuration defined like this, first do (preferred)

    > yarn
    
or

    > npm install
 
Once `> yarn` (preferred) or `> npm install` (legacy) is executed, these modules will be available in
`node_modules/terraform-ppwcode-modules/`. To create an instance of a module `MODULE_NAME` then, the [Terraform]
configuration has to refer to it via a relative path, like this:
 

    module "MODULE_INSTANCE_NAME" {
        source = "./node_modules/terraform-ppwcode-modules/MODULE_NAME"
    }

_Note to the [Terraform] maintainers: go with the flow, and promote [npm] / [yarn] as the primary method to distribute
modules._



Steps for a repeatable deploy
=============================

Using this repository via a dependency defined in a `package.json` file in your configuration, and initialised via
`yarn` / `npm`, will also make available the commands that encapsulate steps you should always 
follow when working with [Terraform] configurations. These are subcommands of the CLI command `tf`.

Each configuration must be in a git working copy, that has a remote called
`origin`.
These steps will execute [Terraform] in the highest git directory found above
the current working directory.

Each git branch in which commands are executed represents a separate Terraform
environment. The [Terraform] configuration must use `${terraform.env}` to
maintain a completely separate infrastructure for each environment / branch.
The name of the [Terraform] environment is the name of the git branch, with `"/"`
replaced by `"-"`, and then URL-encoded. The exception is the `master` branch,
which maps to the [Terraform] `default` environment. Each command will make sure
that your configuration is in the environment that correlates with the
checked-out branch.

When the checked-out branch matches one of the strings `"prod"`, `"staging"`,
`"stage"`, or `"test"` (case-insensitive), this command will refuse to do anything
if the git working copy is not _clean_, i.e., there are no dangling
modifications, and everything is pushed.
 
Some [Terraform] modules in this repository will store references to the state
of the git repository (branch name, sha, url, …) in the infrastructure.
The above measure helps in making the operations repeatable from that state
of the repository. Some [Terraform] modules in this repository will tag the
git repository with infrastructure-defined version information or labels when
appropriate. These tags are not pushed by these commands. You should push
after running these commands.


`package.json`
--------------

The `package.json` file of your configuration should define some of the `scripts`
to call `td <subcommand>`. We can repurpose some of the standard `scripts` commands
offered by [npm] / [yarn] for building for use with [Terraform].

    {
      …
      "scripts": {
        "postinstall": "tf init",
        "branch-environment": "gitinfo b",
        "test": "tf test",
        "start": "tf make-it-so",
        "stop": "tf destroy"
      },
      …
      "dependencies": {
        …,
        "@ppwcode/node-gitinfo": "^k.l.m",
        "@ppwcode/terraform-ppwcode-modules": "^n.o.p",
        …
      }
      …
    }


Commit
------

Before committing a `*.tf` file, you should call

    > terraform fmt

_We cannot automate this yet, since there is a bug in this terraform command
until at least version 0.9.6, where the formatted output for comments keeps
changing, with deeper and deeper indents._


Develop and test your configuration
-----------------------------------

### Test

To test a Terraform configuration, execute (preferred)

    > yarn test
    
or
    
    > npm test
    
This will call `> ./.bin/tf test`, which will

* put your configuration in the environment that correlates with the checked-out branch, 
* validate and 
* try to plan the Terraform configuration.

This is as close to a "unit test" as we can get with Terraform. If this works, errors might still occur from the
cloud provider when applying.

This command changes nothing, apart from the environment you are working in. The plan is not saved.

### Make it so
     
To apply a Terraform configuration, execute (preferred)

    > yarn start
    
or
    
    > npm start
    
This will call `> ./.bin/tf make-it-so`, which will    

* put your configuration in the environment that correlates with the checked-out branch, 
* validate and 
* try to plan the Terraform configuration, and if all goes well, 
* apply the configuration.

It is only now that errors from the remote environment will become apparent.
You should therefor work in a development branch first, and experiment there
until `yarn start` / `npm start` / `tf make-it-so` works consistently without errors.

This is to be considered part of the development process.

You could test whether the new state meets to expected state with some automated tests.
However, when _make-it-so_ does not report any errors, you are actually testing [Terraform]
and the cloud provider's API: you defined the infrastructure in a declarative way, and you can assume that the
infrastructure is now in the state you described. If you do not trust [Terraform] or the cloud provider
to do their jobs, you should probably not be using these tools. A test only makes sense if you had a lot of
code in provisioners, and you actually want to test that code; or if you have a description of the expected state
independent from the [Terraform] configuration. The latter would test consistency between the two descriptions, and
might catch mistakes in one or the other because of that.

Next, you should create a branch / environment `test/…` from the HEAD of the `production`
branch, and `make-it-so`. This will emulate the current production environment.
Then merge the development branch into the new test branch, commit, and
_make-it-so_. This will test the _evolution_ of the current state of the
production environment to the new state.

You could test whether the new state meets to expected state with some automated tests, with the caveats above.

All this is to be considered part of the development process.


Stage
-----

If all goes well, you can now create a branch `staging/…` from the HEAD of the `test/…` branch.
This can be used for pre-production staging of the new target state, and for final QA and
acceptance, if applicable.
 
Alternatively, you can create the branch from the HEAD of `production` again, to also show that
the evolution works in staging.

You could test whether the new state meets to expected state with some automated tests, with the caveats above.


Production
----------

Finally, you can merge this branch into the production branch and _make-it-so_ to change the production
environment to the new desired state.

This is to be considered part of the development process.


Repeatable
----------

Terraform configurations in staging or production environments should only be
applied (`yarn start` / `npm start` / `tf make-it-so`) by CI-tools, and not by humans. This is because this
is the best guarantee that procedures will be followed to the letter every
time, so that each build / apply / state is perfectly reproducible in
production. The best guarantee that the state change will work in production
without any problems, is to first try it out in a staging environment following
the exact same procedure.


Cleaning up and saving costs
----------------------------

You can execute (preferred)

    > yarn stop
    
or
    
    > npm stop
    
while a branch you no longer need is checked-out to destroy the infrastructure
environment it represents. This will call  `> ./.bin/tf destroy`, which will    

* put your configuration in the environment that correlates with the checked-out branch, and 
* try to destroy the configuration.

You should do this with development branches after
you are done with them, and with staging environments you no longer use.
You should be able to restore them simply by checking out the last commit of
that branch later, and executing _make-it-so_.


Dealing with issues reported by the remote APIs
-----------------------------------------------

If anything goes wrong in any of these environments while applying the
configuration, you are on your own, and these scripts will not help. These
scripts are merely intended to make the above process more fluent. They do not
excuse the user from deeply understanding how Terraform and the underlying
infrastructure provider works.




// TODO
=======

`@ppwcode/node-gitinfo` should be updated asap, to use a more recent version of nodegit (because there
is no pre-build binary for the latest node of the older version).



[Terraform]: https://peopleware.atlassian.net/wiki/x/CwAvBg
[how to use modules]: https://www.terraform.io/docs/modules/usage.html
[Terraform module sources]: https://www.terraform.io/docs/modules/sources.html
[Node.js]: https://nodejs.org
[Terraform external data source provider]: https://www.terraform.io/docs/providers/external/data_source.html
[npm]: https://www.npmjs.com
[yarn]: https://yarnpkg.com
