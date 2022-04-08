resource "aws_route53_record" "DOMAIN_NAME" {
  zone_id = var.zone_id
  name    = aws_s3_bucket.BUCKET.bucket
  type    = "CNAME"
  ttl     = "300"

  records = [aws_cloudfront_distribution.DISTRIBUTION.domain_name]
}
