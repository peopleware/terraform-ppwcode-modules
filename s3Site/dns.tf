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
