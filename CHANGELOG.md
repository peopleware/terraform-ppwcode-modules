# Versions

### 11

### 11.1

#### 11.1.0

- Update tfstate to use `aws_s3_bucket_versioning`
- Update tfstate to use `aws_s3_bucket_acl`

### 11.0

#### 11.0.0

- Set s3site bucket acl to private

### 10

### 10.2

#### 10.2.0

- Point s3site dns to Cloudfront

### 10.1

#### 10.1.1

- Fix s3site acm validation route53 config

#### 10.1.0

- Add s3site `required_providers`

### 10.0

#### 10.0.0

- Rework s3site to use Cloudfront instead of website configuration

## 9

### 9.4

#### 9.4.0

- Fix s3site versioning: suspend instead of enable

### 9.3

#### 9.3.0

- Update s3site to use `aws_s3_bucket_acl`
- Update s3site to use `aws_s3_bucket_policy`

### 9.2

#### 9.2.0

- Update s3site to use `aws_s3_bucket_website_configuration`


### 9.1

#### 9.1.0

- Update s3site to use `aws_s3_bucket_versioning`

### 9.0

#### 9.0.0

- upgrade `tlsCertificate` to Terraform 1.1
