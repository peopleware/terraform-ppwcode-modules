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

# https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_delegate-permissions_examples.html#creds-policies-credentials

data "aws_iam_policy_document" "iam-self_manage_credentials" {
  statement {
    effect = "Allow"
    actions = [
      # *LoginProfile* includes ChangePassword, according to the doc
      "iam:*LoginProfile",
      "iam:*ChangePassword",
      "iam:*AccessKey*",
      "iam:*SSHPublicKey*"
    ]
    resources = [local.current_human_user]
  }
  statement {
    effect = "Allow"
    actions = [
      "iam:ListAccount*",
      "iam:GetAccountSummary",
      "iam:GetAccountPasswordPolicy",
      "iam:ListUsers"
    ]
    resources = ["*"]
  }
}

resource "aws_iam_policy" "iam-self_manage_credentials" {
  name = "SelfManageCredentials"
  path = "/ppwcode/iam/"

  description = "Human users can manage their passwords, access and ssh keys themselves."


  policy = data.aws_iam_policy_document.iam-self_manage_credentials.json
}
