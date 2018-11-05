/**
 *    Copyright 2016-2017 PeopleWare n.v.
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

/**
 * Define a custom SOA record for the subdomain, if the appropriate variables are given.
 *
 * The hostmaster will be hostmaster@${var.domain_name}. You should make sure
 * that email address exists.
 * The authorative name server will be ${var.ns-domain_name}.
 * The TTL of the SOA record will be ${var.ttl}
 *
 * We need a serial number, that is to be in the format YYYYMMDDnn, where nn is a 0 based, 2 digit
 * incremental number per day. The default is 1. This serial number should be tagged in the
 * version control repository.
 */

resource "aws_route53_record" "soa" {
  zone_id = "${var.zone_id}"
  name    = "${var.domain_name}"
  type    = "SOA"

  # NOTE: Because of recurring issues with a zone.name having a trailing dot, yes or no, just make sure it is removed if
  # it occurs
  # https://github.com/terraform-providers/terraform-provider-aws/issues/241
  records = [
    "${var.ns-domain_name}. hostmaster.${replace(var.domain_name, "/\\.$/", "")}. ${data.external.calculated_meta.result.serial} 7200 900 1209600 86400",
  ]

  ttl = "${var.ttl}"
}
