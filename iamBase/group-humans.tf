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

# A human user has access to the console, and can maintain his or her own credentials.

resource "aws_iam_group" "humans" {
  name = "humans"
  path = "/ppwcode/"
}

resource "aws_iam_group_policy_attachment" "humans-billing_view" {
  group      = aws_iam_group.humans.name
  policy_arn = aws_iam_policy.billing-view.arn
}

resource "aws_iam_group_policy_attachment" "humans-iam_read" {
  group      = aws_iam_group.humans.name
  policy_arn = aws_iam_policy.iam-read.arn
}

resource "aws_iam_group_policy_attachment" "humans-iam_self_manage_credentials" {
  group      = aws_iam_group.humans.name
  policy_arn = aws_iam_policy.iam-self_manage_credentials.arn
}

resource "aws_iam_group_policy_attachment" "humans-iam_self_manage_MFA" {
  group      = aws_iam_group.humans.name
  policy_arn = aws_iam_policy.iam-self_manage_MFA.arn
}
