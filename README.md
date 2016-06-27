This repository contains a number of general [Terraform] modules.

The [Terraform] documentation describes [how to use modules].
You import the modules from Github, as described [in the documentation][Terraform module sources].
Use the format for public Github repositories, using the "double-slash" to refer to the correct
subdirectory.

    module "consul" {
        source = "github.com/peopleware/terraform-ppwcode-modules//MODULE_NAME"
    }

 



[Terraform]: https://peopleware.atlassian.net/wiki/x/CwAvBg
[how to use modules]: https://www.terraform.io/docs/modules/usage.html
[Terraform module sources]: https://www.terraform.io/docs/modules/sources.html
