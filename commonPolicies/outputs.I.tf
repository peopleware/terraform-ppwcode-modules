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

output "I-actions-s3" {
  value = {
    buckets-describe            = local.actions-s3-buckets-describe
    bucket-define               = local.actions-s3-bucket-define
    bucket-describe             = local.actions-s3-bucket-describe
    objects-readwrite_no_delete = local.actions-s3-objects-readwrite_no_delete
    objects-delete_changeconfig = local.actions-s3-bucket-objects-delete_changeconfig
  }
}
