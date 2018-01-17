/**
 *    Copyright 2017 PeopleWare n.v.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

output "I-logging_bucket" {
  value = "${aws_s3_bucket.terraform_state_logging.bucket}"
}

output "I-logging_bucket_id" {
  value = "${aws_s3_bucket.terraform_state_logging.id}"
}

output "I-logging_bucket_arn" {
  value = "${aws_s3_bucket.terraform_state_logging.arn}"
}

output "I-state_bucket" {
  value = "${aws_s3_bucket.terraform_state.bucket}"
}

output "I-state_bucket_id" {
  value = "${aws_s3_bucket.terraform_state.id}"
}

output "I-state_bucket_arn" {
  value = "${aws_s3_bucket.terraform_state.arn}"
}

output "I-lock_table_id" {
  value = "${aws_dynamodb_table.terraform_statelock.id}"
}

output "I-lock_table_arn" {
  value = "${aws_dynamodb_table.terraform_statelock.arn}"
}
