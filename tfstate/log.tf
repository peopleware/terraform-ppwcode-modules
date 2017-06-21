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

resource "aws_s3_bucket" "terraform_state_logging" {
  bucket = "tfstate-log.${var.origanisation_name}"
  region = "${var.region}"
  acl    = "log-delivery-write"

  versioning {
    enabled = false
  }

  tags = "${var.tags}"

  lifecycle {
    prevent_destroy = true
  }

  /* We considered setting up object lifecycle management to automatically move
     older logs to STANDARD_IA (infrequent access) or GLACIER storage class
     (e.g., after one year). This does not make sense, however, because the separate
     log files are very small. See
     [https://docs.aws.amazon.com/AmazonS3/latest/dev/lifecycle-transition-general-considerations.html],
     Storage overhead charges.

     We choose to never delete (expire) logs. The benefits of a full audit log
     outweigh the storage cost.
   */

  // TODO small file hypothesis needs to be validate
}

resource "aws_s3_bucket_policy" "prohibit-delete" {
  bucket = "${aws_s3_bucket.terraform_state_logging.id}"

  policy = <<POLICY
{
  "Version": "2012-10-17",
  "Id": "ProhibitDelete",
  "Statement": [
    {
      "Sid": "ProhibitDelete",
      "Effect": "Deny",
      "Principal": "*",
      "Action": "s3:DeleteObject",
      "Resource": "${aws_s3_bucket.terraform_state_logging.arn}/*"
    }
  ]
}
POLICY
}
