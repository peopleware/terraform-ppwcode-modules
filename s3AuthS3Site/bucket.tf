/**
 * An S3 bucket configured as a private site, accessible via s3auth.com.
 *
 * The bucket name, and DNS-name of the public site, will be
 *
 * <short-name>.<domain>
 *
 * The domain name will be registered in the hosted zone with name `zone_id`.
 * This should be the id of the hosted zone that manages `domain`.
 */

resource "aws_s3_bucket" "BUCKET" {
  bucket = "${var.short-name}.${var.domain}"
  acl    = "private"

  versioning {
    enabled = false
  }
}

output "name" {
  value = aws_s3_bucket.BUCKET.bucket
}
