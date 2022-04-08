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
