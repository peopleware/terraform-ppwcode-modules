resource "aws_cloudfront_origin_access_identity" "IDENTITY" {}

resource "aws_cloudfront_distribution" "DISTRIBUTION" {
  aliases             = [aws_s3_bucket.BUCKET.bucket]
  enabled             = true
  default_root_object = "index.html"
  price_class         = "PriceClass_100"

  viewer_certificate {
    cloudfront_default_certificate = false
    acm_certificate_arn            = aws_acm_certificate_validation.CERTIFICATE_VALIDATION.certificate_arn
    minimum_protocol_version       = "TLSv1"
    ssl_support_method             = "sni-only"
  }

  origin {
    domain_name = aws_s3_bucket.BUCKET.bucket_regional_domain_name
    origin_id   = aws_s3_bucket.BUCKET.id

    s3_origin_config {
      origin_access_identity = aws_cloudfront_origin_access_identity.IDENTITY.cloudfront_access_identity_path
    }
  }

  default_cache_behavior {
    target_origin_id       = aws_s3_bucket.BUCKET.id
    viewer_protocol_policy = "allow-all"

    allowed_methods = ["GET", "HEAD"]
    cached_methods  = ["GET", "HEAD"]

    min_ttl     = 0
    max_ttl     = 31536000
    default_ttl = 86400

    compress = true

    forwarded_values {
      query_string = false

      cookies {
        forward = "none"
      }
    }
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }
}
