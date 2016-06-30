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
  type = "string"
}

variable "domain" {
  type = "string"
}

variable "zone_id" {
  type = "string"
}

resource "aws_s3_bucket" "BUCKET" {
  bucket = "${var.short-name}.${var.domain}"
  acl = "public-read"

  website {
    index_document = "index.html"
  }

  versioning {
    enabled = false
  }

  policy = <<EOT
{
  "Id": "Policy1380877762691",
  "Statement": [
    {
      "Sid": "Stmt1380877761162",
      "Action": [
        "s3:GetObject"
      ],
      "Effect": "Allow",
      "Resource": "arn:aws:s3:::${var.short-name}.${var.domain}/*",
      "Principal": {
        "AWS": [
          "*"
        ]
      }
    }
  ]
}
EOT
}

output "name" {
  value = "${var.short-name}.${var.domain}"
}
