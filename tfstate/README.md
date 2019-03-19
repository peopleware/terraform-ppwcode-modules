Root of an organisation's [Terraform] definition.

**This configuration does not follow the ppwcode conventions completely.**

This configuration is a bootstrap configuration. It defines the S3 bucket and DynamoDB table necessary
for [Terraform] operation. Because this configuration defines the S3 bucket that stores [Terraform] remote state,
and the DynamoDB table that guards against concurrent modification, it does not itself have remote state, nor is
this configuration guarded against concurrent modification. **In this case, the state file should be consistently
committed to the git repository.**

# Structure

This [Terraform] configuration uses the [ppwcode conventions][terraform] as much as possible.

The resource names of this module are calculated based on the input `organisation_name`. The actual names are
in the output.
The input `region` defines in which AWS region the infrastructure is created.
The created resources are tagged with the key / value pairs provided in the `tags` input variable.

- `state.tf` defines the S3 bucket that holds the [Terraform] remote state
- `log.tf` defines the S3 bucket that holds the access logs for the [Terraform] remote state bucket
- `lock.tf` defines the DynamoDB table that holds all locks for the [Terraform] configurations during `apply`

This module should only be used once for an organisation, and represents a production environment.  
Dependent configurations would not be able to use a separate root infrastructure to store their remote state,
since the reference to the remote state cannot be interpolated in [Terraform].

# Using the bucket as remote state

This module only defines the infrastructure needed by other, functionally meaningful, [Terraform] configurations.
Those should configure their `remote_state` to be stored in the S3 bucket managed by this module, and to
guard against concurrent modification using the DynamoDB table managed by this module.

A functionally meaningful configuration `<CONFIGURATION_NAME>` does that by including a _backend definition_:

    terraform {
      backend "s3" {
        bucket         = "tfstate.<ORGANISATION_NAME>"
        key            = "<CONFIGURATION_NAME>.tfstate"
        region         = "<REGION>"
        profile        = "<PROFILE>"
        encrypt        = true
        dynamodb_table = "tfstate-lock.<ORGANISATION_NAME>"
      }
    }

- `<ORGANISATION_NAME>` **must** be the `organisation_name` you used as input when you used this module.
- `<REGION>` **must** be the `region` you used as input when you used this module.
- `<CONFIGURATION_NAME>` _should_ match the name of the configuration, i.e., the name of the git repository it
  is defined in.
- `<PROFILE>` **must** be the name you used in [`~/.aws/credentials`][aws credentials] to identify your AWS account
  that has access to the remote state bucket and DynamoDB table defined by this module.

You can use the outputs of a configuration `<CONFIGURATION_NAME>` configured this way in another configuration
`foo-bar-baz` by including a _remote state data definition_ in `foo-bar-baz`:

    data "terraform_remote_state" "<CONFIGURATION_NAME>" {
      backend = "s3"
      config {
        bucket      = "tfstate.<ORGANISATION_NAME>"
        environment = "${terraform.env}"
        key         = "<CONFIGURATION_NAME>.tfstate"
        region      = "<REGION>"
      }
    }

You should consider whether the `environment` value is appropriate to your use case, and change it appropriately.

This works only if you also included an _aws provider definition_ that has access to the remote state bucket
and DynamoDB table defined by this module. Most often, it will be the same profile as above:

provider "aws" {
region = "<REGION>"
profile = "<PROFILE>"
}

See [Using S3 as a Terraform backend].

# Getting started

The infrastructure is defined using [Terraform].
See [Getting started with a Terraform configuration].

# Notes for further work

[IAM Policy for KMS-Encrypted Remote Terraform State in S3](https://keita.blog/2017/02/21/iam-policy-for-kms-encrypted-remote-terraform-state-in-s3/)
claims to show a policy to enable KMS-Encrypted Remote Terraform State. It does not explain anything however. Is there
a good reason to use this over

[terraform]: https://peopleware.atlassian.net/wiki/x/CwAvBg
[getting started with a terraform configuration]: https://peopleware.atlassian.net/wiki/x/p4zhC
[aws credentials]: https://peopleware.atlassian.net/wiki/x/RoAWBg
[using s3 as a terraform backend]: https://www.terraform.io/docs/backends/types/s3.html
