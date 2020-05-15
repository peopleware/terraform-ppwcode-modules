# terraform-ppwcode-modules

This repository contains a number of general [Terraform] modules.

The [Terraform] documentation describes [how to use modules].
You import the modules from Github, as described [in the documentation][terraform module sources].
Use the format for public Github repositories, using the "double-slash" to refer to the correct
subdirectory.

    module "MODULE_INSTANCE_NAME" {
        source = "github.com/peopleware/terraform-ppwcode-modules//MODULE_NAME"
    }

# Compatibility --> 7.n.n

Version `7.n.n` removes support for `domain_version`, which required Nodejs / JavaScript. Since Nodejs / JavaScript
is now no longer used, this library is no longer published on npm since version `7.n.n`.

When switching from an earlier version to version `7.0.0` or higher _Terraform will remove the SOA record introduced by
when [`subdomain`](subdomain)_. The user should add a replacement by hand, and maintain it (if desired) where this
module was used.

[terraform]: https://peopleware.atlassian.net/wiki/x/CwAvBg
[how to use modules]: https://www.terraform.io/docs/modules/usage.html
[terraform module sources]: https://www.terraform.io/docs/modules/sources.html
