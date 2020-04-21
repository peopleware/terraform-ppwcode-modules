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

# prove ownership
resource "aws_route53_record" "proof" {
  # NOTE There is an issue with this count.
  #      See https://github.com/terraform-providers/terraform-provider-aws/issues/6557
  #      -
  #      A workaround for `count` is to use the length of `local.tls_certificte-all_domains`, which should be the
  #      same. That works for the count, and then the name, type, and records values are "computed". This works if a
  #      change has the same number of domain names, and if a change goes to less domain names, when a new certificate
  #      request is made. It does not work if a change is made to more domain names. Then we get 'index <N> out of
  #      range for list aws_acm_certificate.tlsCertificate.domain_validation_options'.
  #      -
  #      A solution in most cases is to comment out these 2 resources, and apply, and then, in a second run, apply
  #      these 2 resources. Then `aws_acm_certificate.tlsCertificate.domain_validation_options` does exist in the
  #      _plan_ phase, and this can continue.
  #      The bug reports refer to this as using the `--target` attribute, the intention being of first creating the CAA
  #      and certificate request separately, with --target, and then the rest.
  count = length(local.all_domains)

  zone_id = var.zone_id
  name    = lookup(aws_acm_certificate.main.domain_validation_options[count.index], "resource_record_name")
  type    = lookup(aws_acm_certificate.main.domain_validation_options[count.index], "resource_record_type")
  ttl     = local.proof-ttl
  records = [
    lookup(aws_acm_certificate.main.domain_validation_options[count.index], "resource_record_value"),
  ]
}
