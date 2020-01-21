# Iam Base

This module defines a set of common policies and user groups in your account, under the path `/ppwcode/`.

## Users

Several types of users should be discerned.

### Humans

**Human** users must defined in the path `/human/`, and added to group `/ppwcode/humans/`.
That way, these users get privileges to

- use the console,
- self-manage their credentials,
- read in IAM (`Get*`, `List*` and `Generate*`), and
- view billing.


    resource "aws_iam_user" "ursula" {
      name = "ursula"
      path = "/human/"
    }

    resource "aws_iam_group_membership" "humans" {
      name = "humans"
      group = module.iam-base.I-group-humans["name"]

      users = [
        …
        aws_iam_user.ursula.name,
        …
      ]
    }

Other kinds of users do not need these privileges.

### CI users

One kind of user of particular interest, added in separate projects / repositories, are **CI-users**, whose credentials
are used by the CI-tool for running automated tests that require AWS infrastructure, of for automated deploy to AWS
infrastructure. CI-users should be defined in the path `/ci/` according to the **ppwcode** vernacular, and get
_least privileges_.

A CI user should be defined in path `/ci/`.

## Devsecops

A subset of human users are **devsecops** users. We believe that devsecops users should be self-reliant in principle,
i.e. ultimately be allowed to see and do anything in an account. Yet, a sensible devsecops user will try to work with
_least privileges_ for any particular task to protect herself, against mistakes and other mishaps, and to be notified of
missing privileges early. This can be achieved by devsecops users by assuming a dedicated _role_ with the necessary
_least privileges_ for every separate task.

Furthermore, due to limitations, `devsecops` users get privileges to manage a number of services where further
limitations make no sense.

The group `/ppwcode/devsecops` gives members privileges

- to read _everything_ in the account, and
- to read and write (but not delete) objects in the S3 bucket configured as the Terraform `tfstate` backend for the
  account, and read, write and delete records in the DynamoDB table configured as the state lock mechanism for the
  Terraform backend
- to assume roles
- to manage human and ci users (i.e., users with path `/human/` or `/ci`), to be able to help colleagues
- to manage members and policies of the groups `/ppwcode/humans` and `/ppwcode/devsecops`
- to manage certificates in ACM
- to manage roles to assume, i.e.,
  - to manage policies with path `/devsecops/`
  - to manage roles with path `/devsecops/`
  - to assume roles with path `/devsecops/`

When defining `/devsecops/` roles, it is important to follow the following idiom.
Roles require an _assume role policy_, that expresses who can assume the rule from the standpoint of the role. We want
to express that devsecops roles can only be assumed by devsecops users. Sadly, the policy syntax does not allow limiting
principals that can assume the role to group membership. Therefor, we add a _tag_ `canAssumeRole = devsecops` to each
user that we want to allow to assume devsecops roles:

    data "aws_iam_policy_document" "<REPO NAME>-infrastructure_assume-role-policy" {
      statement {
        actions = ["sts:AssumeRole"]

        principals {
          type        = "AWS"
          identifiers = ["arn:aws:iam::${data.aws_caller_identity.current.account_id}:root"]
        }
        condition {
          test = "StringEquals"
          values = [
            "devsecops"
          ]
          variable = "aws:PrincipalTag/canAssumeRole"
        }
      }
    }

    resource "aws_iam_role" "<REPO NAME>-infrastructure>" {
      name               = "<REPO NAME>-infrastructure>"
      path               = "/devsecops/"
      assume_role_policy = data.aws_iam_policy_document.<REPO NAME>-infrastructure_assume-role-policy.json
      tags = {
        repo = "<REPO NAME>"
      }
    }

    resource "aws_iam_role_policy_attachment" "<REPO NAME>-infrastructure-role-policy" {
      policy_arn = aws_iam_policy.<ROLE POLICY>.arn
      role       = aws_iam_role.<REPO NAME>-infrastructure>.name
    }

Human devsecops users are then defined as follows:

    resource "aws_iam_user" "dave" {
      name = "dave"
      path = "/human/"
      tags = {
        canAssumeRole = "devsecops"
      }
    }

    resource "aws_iam_group_membership" "humans" {
      name = "humans"
      group = module.iam-base.I-group-humans["name"]

      users = [
        …
        aws_iam_user.dave.name,
        …
      ]
    }

    resource "aws_iam_group_membership" "devsecops" {
      name  = "devsecops"
      group = module.common_policies.I-group-devsecops["name"]

      users = [
        …
        aws_iam_user.dave.name,
        …
      ]
    }

Devsecops users should create a profile in `~/.aws/credentials` with name `<ACCOUNT ALIAS>-dev`. This profile is used
in all Terraform configurations aimed at devsecops users.

## Administrators

Administrators are human users that can see and do _everything_.

This configuration defines a group `/ppwcode/administrators`. Administrators should always be humans.

    resource "aws_iam_user" "alice" {
      name = "alice"
      path = "/human/"
    }

    resource "aws_iam_group_membership" "humans" {
      name = "humans"
      group = module.iam-base.I-group-humans["name"]

      users = [
        …
        aws_iam_user.alice.name,
        …
      ]
    }

    resource "aws_iam_group_membership" "administrators" {
      name = "administrators"
      group = module.iam-base.I-group-administrators["name"]

      users = [
        …
        aws_iam_user.alice.name,
        …
      ]
    }

The group has the canned policy `arn:aws:iam::aws:policy/AdministratorAccess`.

Administrator users should create a profile in `~/.aws/credentials` with name `<ACCOUNT ALIAS>-admin`. This profile is
used in all Terraform configurations aimed at administrator users.

If some devsecops users also require administrator privileges, it makes sense for these people to have to separate
users, with a different profile in `~/.aws/credentials`.

## Policies

Policies defined in this module have path `/ppwcode/*`.
