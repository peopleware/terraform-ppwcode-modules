/**
 * S3 bucket configured for authenticated https access over s3auth.com.
 * After creation, login to s3auth.com, and create the site there with the
 * information in the output.
 */

variable "user_path" {
  type = "string"
}

resource aws_iam_user "IAM_USER" {
  name = "s3auth_${aws_s3_bucket.BUCKET.bucket}"
  path = "${var.user_path}"
  force_destroy = true
}

resource "aws_iam_user_policy" "IAM_USER_POLICY" {
  name = "s3auth_${aws_s3_bucket.BUCKET.bucket}"
  user = "${aws_iam_user.IAM_USER.name}"
  policy = <<EOF
{
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["s3:GetObject", "s3:GetBucketWebsite"],
      "Resource": [
        "arn:aws:s3:::${aws_s3_bucket.BUCKET.bucket}/*"
      ]
    }
  ]
}
EOF
}

resource "aws_iam_access_key" "ACCESS_KEY" {
  user = "${aws_iam_user.IAM_USER.name}"
}

output "SECRET" {
  value = "${aws_iam_access_key.ACCESS_KEY.secret}"
}
