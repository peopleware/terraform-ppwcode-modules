#    Copyright 2020 PeopleWare n.v.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

# See https://docs.aws.amazon.com/AmazonS3/latest/dev/using-with-s3-actions.html for all S3 actions.

locals {
  # resource: *
  # NOTE: arn:aws:s3:::* is not accepted as resource for these actions
  actions-s3-buckets-describe = [
    "s3:ListAllMyBuckets",
    "s3:HeadBucket",
  ]
  # resource: <bucket_arn>
  actions-s3-bucket-define = [
    "s3:CreateBucket",
    "s3:DeleteBucket",
    "s3:DeleteBucketPolicy",
    "s3:DeleteBucketWebsite",
    "s3:PutAccelerateConfiguration",
    "s3:PutAnalyticsConfiguration",
    "s3:PutBucketAcl",
    "s3:PutBucketCORS",
    "s3:PutBucketLogging",
    "s3:PutBucketNotification",
    "s3:PutBucketPolicy",
    "s3:PutBucketRequestPayment",
    "s3:PutBucketTagging",
    "s3:PutBucketVersioning",
    "s3:PutBucketWebsite",
    "s3:PutInventoryConfiguration",
    "s3:PutIpConfiguration",
    "s3:PutLifecycleConfiguration",
    "s3:PutMetricsConfiguration",
    "s3:PutReplicationConfiguration",
  ]
  # resource: <bucket_arn>
  actions-s3-bucket-describe = [
    "s3:ListBucket",
    "s3:ListBucketByTags",
    "s3:ListBucketVersions",
    "s3:ListBucketMultipartUploads",
    "s3:GetAccelerateConfiguration",
    "s3:GetAnalyticsConfiguration",
    "s3:GetBucketAcl",
    "s3:GetBucketCORS",
    "s3:GetBucketLocation",
    "s3:GetBucketLogging",
    "s3:GetBucketNotification",
    "s3:GetBucketPolicy",
    "s3:GetBucketRequestPayment",
    "s3:GetBucketTagging",
    "s3:GetBucketVersioning",
    "s3:GetBucketWebsite",
    "s3:GetInventoryConfiguration",
    "s3:GetIpConfiguration",
    "s3:GetLifecycleConfiguration",
    "s3:GetMetricsConfiguration",
    "s3:GetReplicationConfiguration",
  ]
  # resource: <bucket_arn>/*
  actions-s3-objects-readwrite_no_delete = [
    "s3:AbortMultipartUpload",
    "s3:ListMultipartUploadParts",
    "s3:GetObject",
    "s3:GetObjectAcl",
    "s3:GetObjectTagging",
    "s3:GetObjectTorrent",
    "s3:GetObjectVersion",
    "s3:GetObjectVersionAcl",
    "s3:GetObjectVersionForReplication",
    "s3:GetObjectVersionTagging",
    "s3:GetObjectVersionTorrent",
    "s3:PutObject",
    "s3:PutObjectTagging",
    "s3:PutObjectVersionTagging",
    "s3:ReplicateObject",
    "s3:ReplicateTags",
  ]
  # resource: <bucket_arn>/*
  actions-s3-bucket-objects-delete_changeconfig = [
    "s3:DeleteObject",
    "s3:DeleteObjectTagging",
    "s3:DeleteObjectVersion",
    "s3:DeleteObjectVersionTagging",
    "s3:PutObjectAcl",
    "s3:PutObjectVersionAcl",
    "s3:RestoreObject",
    "s3:ObjectOwnerOverrideToBucketOwner",
    "s3:ReplicateDelete",
  ]

  # NOTE: Requires full * resource. Is this obsolete, replaced by ListBucket? Yes.
  #       - "s3:ListObjects"

  # NOTE: documented, but not recognized by AWS:
  #       - "s3:DeleteReplicationConfiguration"
  #       - "s3:GetEncryptionConfiguration"
  #       - "s3:PutEncryptionConfiguration"
}
