/**
 * An S3 bucket configured as a public site, accessible via a simple FQDN.
 *
 * The bucket name, and DNS-name of the public site, will be
 *
 * <short-name>.<domain>
 *
 * The domain name will be registered in the hosted zone with name `zone_id`.
 * This should be the id of the hosted zone that manages `domain`.
 */

variable "short-name" {
  type = string
}

variable "domain" {
  type = string
}

variable "zone_id" {
  type = string
}

variable "index_document" {
  type    = string
  default = "index.html"
}

resource "aws_s3_bucket" "BUCKET" {
  bucket = "${var.short-name}.${var.domain}"

}

resource "aws_s3_bucket_versioning" "BUCKET" {
  bucket = aws_s3_bucket.BUCKET.id

  versioning_configuration {
    status = "Suspended"
  }
}

resource "aws_s3_bucket_website_configuration" "BUCKET" {
  bucket = aws_s3_bucket.BUCKET.bucket

  index_document {
    suffix = var.index_document
  }
}

resource "aws_s3_bucket_acl" "BUCKET" {
  bucket = aws_s3_bucket.BUCKET.id
  acl    = "public-read"
}

resource "aws_s3_bucket_policy" "BUCKET" {
  bucket = aws_s3_bucket.BUCKET.id
  policy = data.aws_iam_policy_document.BUCKET.json
}

data "aws_iam_policy_document" "BUCKET" {
  statement {
    actions = [
      "s3:GetObject",
    ]

    resources = [
      "arn:aws:s3:::${var.short-name}.${var.domain}/*",
    ]

    principals {
      identifiers = ["*"]
      type        = "AWS"
    }
  }
}

output "name" {
  value = aws_s3_bucket.BUCKET.bucket
}
