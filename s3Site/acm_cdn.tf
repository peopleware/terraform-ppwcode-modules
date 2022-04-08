resource "aws_acm_certificate" "CERTIFICATE" {
  provider          = aws.us-east-1
  domain_name       = aws_s3_bucket.BUCKET.bucket
  validation_method = "DNS"
}

resource "aws_route53_record" "CERTIFICATE_VALIDATION" {
  name    = aws_acm_certificate.CERTIFICATE.domain_validation_options[0].resource_record_name
  type    = aws_acm_certificate.CERTIFICATE.domain_validation_options[0].resource_record_type
  zone_id = var.zone_id
  records = [aws_acm_certificate.CERTIFICATE.domain_validation_options[0].resource_record_value]
  ttl     = 60
}

resource "aws_acm_certificate_validation" "CERTIFICATE_VALIDATION" {
  provider                = aws.us-east-1
  certificate_arn         = aws_acm_certificate.CERTIFICATE.arn
  validation_record_fqdns = [aws_route53_record.CERTIFICATE_VALIDATION.fqdn]
}
