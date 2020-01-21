#    Copyright 2020 PeopleWare n.v.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

# https://docs.aws.amazon.com/IAM/latest/UserGuide/list_identityandaccessmanagement.html
# https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_policies_examples_iam_mfa-selfmanage.html

# TODO there is no support (yet?) for SMS MFA

locals {
  current_user_mfa = "arn:aws:iam::${data.aws_caller_identity.current.account_id}:mfa/$${aws:username}"
}

data "aws_iam_policy_document" "iam-self_manage_MFA" {
  statement {
    effect = "Allow"
    actions = [
      "iam:ListUsers",
      "iam:ListVirtualMFADevices",
    ]
    resources = ["*"]
  }
  # allow users to list only their own MFA
  statement {
    effect = "Allow"
    actions = [
      "iam:ListMFADevices"
    ]
    resources = [
      "arn:aws:iam::*:mfa/*",
      local.current_human_user
    ]
  }
  # allow users to manage their own MFA
  statement {
    effect = "Allow"
    actions = [
      "iam:CreateVirtualMFADevice",
      "iam:EnableMFADevice",
      "iam:ResyncMFADevice",
      "iam:DeleteVirtualMFADevice",
    ]
    resources = [
      local.current_user_mfa,
      local.current_human_user
    ]
  }
  # allow users to deactivate their own MFA when logged in with one
  statement {
    effect = "Allow"
    actions = [
      "iam:DeactivateMFADevice"
    ]
    resources = [
      local.current_user_mfa,
      local.current_human_user
    ]
    condition {
      test     = "Bool"
      variable = "aws:MultiFactorAuthPresent"
      values   = ["true"]
    }
  }
}

resource "aws_iam_policy" "iam-self_manage_MFA" {
  name = "SelfManageMFA"
  path = "/ppwcode/iam/"

  description = "Human users can manage their MFA settings themselves."

  policy = data.aws_iam_policy_document.iam-self_manage_MFA.json
}
