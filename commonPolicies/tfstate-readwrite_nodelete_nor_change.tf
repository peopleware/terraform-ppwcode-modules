# The Terraform state bucket is special. It is defined in another configuration, and can never be deleted.
# It is protected here specially.
#
# This cannot be defined in the project that defines the tfstate infrastructure, because that is a bootstrap
# configuration.

data "aws_iam_policy_document" "tfstate-readwrite_nodelete_nor_change" {
  # allow buckets describe
  statement {
    effect    = "Allow"
    actions   = local.actions-s3-buckets-describe
    resources = ["*"]
  }
  # allow tfstate buckets describe
  statement {
    effect  = "Allow"
    actions = local.actions-s3-bucket-describe
    resources = [
      var.tfstate-bucket-arn,
      var.tfstate-log_bucket-arn
    ]
  }
  # prohibit tfstate buckets create, delete and config change
  statement {
    effect  = "Deny"
    actions = local.actions-s3-bucket-define
    resources = [
      var.tfstate-bucket-arn,
      var.tfstate-log_bucket-arn
    ]
  }
  # allow tfstate buckets objects read / write, no delete or config change
  statement {
    effect  = "Allow"
    actions = local.actions-s3-objects-readwrite_no_delete
    resources = [
      "${var.tfstate-bucket-arn}/*",
      "${var.tfstate-log_bucket-arn}/*"
    ]
  }
  # prohibit tfstate buckets objects delete and config change
  statement {
    effect  = "Deny"
    actions = local.actions-s3-bucket-objects-delete_changeconfig
    resources = [
      "${var.tfstate-bucket-arn}/*",
      "${var.tfstate-log_bucket-arn}/*"
    ]
  }
  # allow tables describe
  statement {
    effect    = "Allow"
    actions   = local.actions-dynamodb-tables-describe
    resources = ["*"]
  }
  # allow tfstate table read / write and index read
  statement {
    effect  = "Allow"
    actions = local.actions-dynamodb-items-readwrite
    resources = [
      var.tfstate-table-arn,
      "${var.tfstate-table-arn}/index/*"
    ]
  }
  # allow tfstate table stream read
  statement {
    effect  = "Allow"
    actions = local.actions-dynamodb-stream-read
    resources = [
      "${var.tfstate-table-arn}/stream/*"
    ]
  }
  # prohibit tfstate table delete and config change
  statement {
    effect  = "Deny"
    actions = local.actions-dynamodb-table-define
    resources = [
      var.tfstate-table-arn
    ]
  }
}

resource "aws_iam_policy" "tfstate-readwrite_nodelete_nor_change" {
  name = "TfStateReadWrite"
  path = "/ppwcode/tfstate/"

  description = "Can read and write Terraform state, but cannot delete state, nor delete the bucket. Can read logs, but not delete them, or the log bucket."

  policy = data.aws_iam_policy_document.tfstate-readwrite_nodelete_nor_change.json
}

