variable "zone_id" {
  type = "string"
}

resource "aws_route53_record" "DOMAIN_NAME" {
  zone_id = var.zone_id
  name    = aws_s3_bucket.BUCKET.bucket
  type    = "CNAME"
  ttl     = "60"
  records = ["relay.s3auth.com"]
}
