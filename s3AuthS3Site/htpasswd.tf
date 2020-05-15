/**
 * We require a file in the main terraform project
 *
 *   resources/<BUCKET>/htpasswd
 *
 * that contains user names and passwords in Apache HTTP Server format
 * (http://httpd.apache.org/docs/2.2/misc/password_encryptions.html).
 * You can edit the file by hand, or using htpasswd tool
 * (http://httpd.apache.org/docs/2.2/programs/htpasswd.html):
 *
 *     > htpasswd -nbs user password
 */

resource "aws_s3_bucket_object" "HTPASSWD" {
  bucket           = aws_s3_bucket.BUCKET.bucket
  key              = ".htpasswd"
  source           = "${path.root}/resources/${aws_s3_bucket.BUCKET.bucket}/htpasswd"
  content_type     = "text/plain"
  cache_control    = "no-cache"
  content_language = "en-US"
  etag             = md5(file("${path.root}/resources/${aws_s3_bucket.BUCKET.bucket}/htpasswd"))
}
