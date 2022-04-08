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

output "name" {
  value = aws_s3_bucket.BUCKET.bucket
}
