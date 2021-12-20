/**
 *    Copyright 2019 PeopleWare n.v.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

resource "aws_acm_certificate" "main" {
  provider = aws.tls_certificate

  domain_name               = local.main_fqdn
  subject_alternative_names = local.alternate_fqdns
  validation_method         = "DNS"

  tags = {
    environment             = var.environment
    terraform-configuration = var.terraform-configuration
    terraform-workspace     = terraform.workspace
  }

  depends_on = [aws_route53_record.caa]

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_acm_certificate_validation" "tls_certificate" {
  provider = aws.tls_certificate

  certificate_arn = aws_acm_certificate.main.arn

  validation_record_fqdns = [for record in aws_route53_record.proof : record.fqdn]
}
