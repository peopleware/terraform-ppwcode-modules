/**
 *    Copyright 2017 - 2025 PeopleWare n.v.
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
  bucket = var.prefix == "" ? format("tfstate.%s", var.organisation_name) : format("%s.tfstate.%s", var.prefix, var.organisation_name)

  tags = var.tags

  lifecycle {
    prevent_destroy = true
  }
}

resource "aws_s3_bucket_logging" "terraform_state" {
  bucket        = aws_s3_bucket.terraform_state.id
  target_bucket = aws_s3_bucket.terraform_state_logging.id
  target_prefix = ""
}

resource "aws_s3_bucket_versioning" "terraform_state" {
  bucket = aws_s3_bucket.terraform_state.id

  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_acl" "terraform_state" {
  bucket = aws_s3_bucket.terraform_state.id
  acl    = "private"
}

resource "aws_s3_bucket_server_side_encryption_configuration" "terraform_state" {
  bucket = aws_s3_bucket.terraform_state.id
  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

data "aws_iam_policy_document" "deny_delete_state_files" {
  # prohibit tfstate buckets objects config change
  statement {
    effect = "Deny"

    principals {
      type        = "*"
      identifiers = ["*"]
    }

    actions   = module.actions.I-s3-bucket-objects-changeconfig
    resources = ["${aws_s3_bucket.terraform_state.arn}/*"]
  }

  # Prohibit delete of tfstate buckets objects that represent state files.
  # tfstate buckets objects that represent lock files may be deleted, but we cannot specify that here,
  # because we would need to allow that then for all principals. Also, we cannot deny deletion of any files except lock
  # files, because the ARN syntax has no way to express that.
  statement {
    effect = "Deny"

    principals {
      type        = "*"
      identifiers = ["*"]
    }

    actions   = module.actions.I-s3-bucket-objects-delete
    resources = ["${aws_s3_bucket.terraform_state.arn}/*.tfstate"]
  }
}

resource "aws_s3_bucket_policy" "deny_delete_state_files" {
  bucket = aws_s3_bucket.terraform_state.id

  policy = data.aws_iam_policy_document.deny_delete_state_files.json
}

