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

  policy = data.aws_iam_policy_document.BUCKET.json
}

resource "aws_s3_bucket_versioning" "BUCKET" {
  bucket = aws_s3_bucket.BUCKET.id

  versioning_configuration {
    status = "Enabled"
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

resource "aws_route53_record" "DOMAIN_NAME" {
  zone_id = var.zone_id
  name    = aws_s3_bucket.BUCKET.bucket
  type    = "A"

  alias {
    name                   = aws_s3_bucket.BUCKET.website_domain
    zone_id                = aws_s3_bucket.BUCKET.hosted_zone_id
    evaluate_target_health = true
  }
}

output "name" {
  value = aws_s3_bucket.BUCKET.bucket
}
