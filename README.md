This repository contains a number of general [Terraform] modules.

The [Terraform] documentation describes [how to use modules].
You import the modules from Github, as described [in the documentation][Terraform module sources].
Use the format for public Github repositories, using the "double-slash" to refer to the correct
subdirectory.

    module "MODULE_INSTANCE_NAME" {
        source = "github.com/peopleware/terraform-ppwcode-modules//MODULE_NAME"
    }

On the other hand, …

The module `domain_version/` directly, and thus the module `subdomain/` that depends on it,
uses a _[Node.js] JavaScript_ script (though a [Terraform external data source provider]) to get information
about the SOA serial and the state of the git repository of the [Terraform] configuration it is used in.
[Node.js] JavaScript code depends on other [npm] packages, that need to be installed for the script to be able to
work. This repository is therefor, apart from being a collection of [Terraform] modules, also a [Node.js]
[npm] package, with dependencies described in `package.json`. The dependencies need to be available in a
`node_modules/` folder next to the script, or in one of its ancestor folders, before [Terraform] can use the
modules in `> terraform plan` or `> terraform apply`.

This is done by running `> npm install` in the project that uses these modules.

For this to work, this collection of [Terraform] modules / [npm] package must itself be loaded in the
[Terraform] configuration in which it is used via `> npm install`. These commands 
work recursively.

This is done by making the configuration in which these modules are used an [npm] package itself, with this 
collection of [Terraform] modules defined as a development dependency in its `package.json`. Once
`> npm install` is executed, these modules will be available in
`node_modules/terraform-ppwcode-modules/`. To create an instance of a module `MODULE_NAME` then, the [Terraform]
configuration has to refer to it via a relative path, like this:
 

    module "MODULE_INSTANCE_NAME" {
        source = "./node_modules/terraform-ppwcode-modules/MODULE_NAME"
    }

_Note to the [Terraform] maintainers: go with the flow, and promote [npm] as the primary method to distribute
modules._




Compatibility
=============

This library is intended to be compatible with Node 6, 8, and 10.



Development
===========

Node version
------------

Development is done in Node 10, via `nvm`.


Compatibility
-------------

The code does not use `async` / `await`, which was introduced in Node 8.

Also, we use `Q` as Promise library, instead of native Promises, since Node 6 does not yet support `util.promisify()`.
We use `Q.nfcall` instead.


Style
-----

[![JavaScript Style Guide](https://cdn.rawgit.com/standard/standard/master/badge.svg)](https://github.com/standard/standard)

This code uses [Standard] coding style.



TODO
====

Setup a CI
----------

Move to `ppwcode` team. Request access from Travis.
Create parallel builds for Node 6, 8 10, and back tag.


[Terraform]: https://peopleware.atlassian.net/wiki/x/CwAvBg
[how to use modules]: https://www.terraform.io/docs/modules/usage.html
[Terraform module sources]: https://www.terraform.io/docs/modules/sources.html
[Node.js]: https://nodejs.org
[Terraform external data source provider]: https://www.terraform.io/docs/providers/external/data_source.html
[npm]: https://www.npmjs.com
[Standard]: https://standardjs.com
