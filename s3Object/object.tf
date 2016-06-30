/**
 * An object in an S3 bucket, ready for publication over the internet.
 * Be aware that terraform is not really good at this. It only uploads the file, but does
 * no really track it, nor deletes it. And there is something fishy with the dependency
 * on the bucket to.
 * You can use clients to upload, like CyberDuck, or use the AWS Console.
 *
 * We require a directory in the main terraform project
 *
 *   resources/<BUCKET>/
 *
 * Inside this directory, files should be structured as you wish them in the S3 bucket.
 * `key` should be relative to resources/<BUCKET>/. `key` is used as S3 key.
 */

variable "bucket" {
  type = "string"
}

variable "key" {
  type = "string"
}

variable "content-type" {
  default = "text/html"
}

variable "cache-control" {
  default = "no-cache"
}

variable "content-language" {
  default = "en-US"
}

variable "RESOURCE_ROOT" {
  default = "resources"
}

resource "aws_s3_bucket_object" "OBJECT" {
  bucket = "${var.bucket}"
  key = "${var.key}"
  source = "${path.root}/${var.RESOURCE_ROOT}/${var.bucket}/${var.key}"
  content_type = "${var.content-type}"
  cache_control = "${var.cache-control}"
  content_language = "${var.content-language}"
  etag = "${md5(file("${path.root}/${var.RESOURCE_ROOT}/${var.bucket}/${var.key}"))}"
}
