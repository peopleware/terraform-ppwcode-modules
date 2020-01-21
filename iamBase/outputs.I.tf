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

output "I-billing-view" {
  value = aws_iam_policy.billing-view.arn
}

output "I-iam-read" {
  value = aws_iam_policy.iam-read.arn
}

output "I-iam-self_manage_credentials" {
  value = aws_iam_policy.iam-self_manage_credentials.arn
}

output "I-iam-self_manage_MFA" {
  value = aws_iam_policy.iam-self_manage_MFA.arn
}

output "I-tfstate-readwrite_nodelete_nor_change" {
  value = aws_iam_policy.tfstate-readwrite_nodelete_nor_change.arn
}

output "I-manage_devsecops" {
  value = aws_iam_policy.manage_devsecops.arn
}

output "I-group-humans" {
  value = {
    path = aws_iam_group.humans.path
    name = aws_iam_group.humans.name
    arn  = aws_iam_group.humans.arn
  }
}

output "I-group-devsecops" {
  value = {
    path = aws_iam_group.devsecops.path
    name = aws_iam_group.devsecops.name
    arn  = aws_iam_group.devsecops.arn
  }
}

output "I-group-administrators" {
  value = {
    path = aws_iam_group.administrators.path
    name = aws_iam_group.administrators.name
    arn  = aws_iam_group.administrators.arn
  }
}
