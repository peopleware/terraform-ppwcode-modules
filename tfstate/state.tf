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

resource "aws_s3_bucket" "terraform_state" {
  bucket = "${var.version != "" ? format("tfstate.%s", var.organisation_name) : format("%s.tfstate.%s", var.version, var.organisation_name)}"
  region = "${var.region}"
  acl    = "private"

  versioning {
    enabled = true
  }

  logging {
    target_bucket = "${aws_s3_bucket.terraform_state_logging.id}"
  }

  tags = "${var.tags}"

  lifecycle {
    prevent_destroy = true
  }
}

resource "aws_s3_bucket_policy" "enforce_encrypted_state_files" {
  bucket = "${aws_s3_bucket.terraform_state.id}"

  policy = <<POLICY
{
  "Version": "2012-10-17",
  "Id": "EnforceEncryptedStateFilesAndProhibitDelete",
  "Statement": [
    {
      "Sid": "DenyIncorrectEncryptionHeader",
      "Effect": "Deny",
      "Principal": "*",
      "Action": "s3:PutObject",
      "Resource": "${aws_s3_bucket.terraform_state.arn}/*",
      "Condition": {
        "StringNotEquals": {
          "s3:x-amz-server-side-encryption": "AES256"
        }
      }
    },
    {
      "Sid": "DenyUnEncryptedObjectUploads",
      "Effect": "Deny",
      "Principal": "*",
      "Action": "s3:PutObject",
      "Resource": "${aws_s3_bucket.terraform_state.arn}/*",
      "Condition": {
        "Null": {
          "s3:x-amz-server-side-encryption": "true"
        }
      }
    },
    {
      "Sid": "ProhibitDelete",
      "Effect": "Deny",
      "Principal": "*",
      "Action": "s3:DeleteObject",
      "Resource": "${aws_s3_bucket.terraform_state.arn}/*"
    }
  ]
}
POLICY
}
