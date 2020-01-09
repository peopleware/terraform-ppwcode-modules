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

# https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_delegate-permissions_examples.html#iampolicy-example-userlistall
# https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_delegate-permissions_examples.html#creds-policies-users

data "aws_iam_policy_document" "iam-read" {
  statement {
    effect = "Allow"

    actions = local.actions-iam-read

    resources = ["*"]
  }
}

resource "aws_iam_policy" "iam-read" {
  name = "IamRead"
  path = "/ppwcode/iam/"

  description = "Users can see all other users, groups and policies, and create credentials reports (so they can find out what they are missing)."

  policy = data.aws_iam_policy_document.iam-read.json
}
