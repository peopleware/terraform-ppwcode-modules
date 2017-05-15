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
 * For a subdomain definition to be found by DNS, we need to add the nameservers that serve it
 * as NS records to the parent domain, with a given TTL.
 */

resource "aws_route53_record" "ns_delegation" {
  zone_id = "${var.parent-domain-zone_id}"
  name    = "${aws_route53_zone.zone.name}"
  type    = "NS"

  records = [
    "${aws_route53_zone.zone.name_servers.0}",
    "${aws_route53_zone.zone.name_servers.1}",
    "${aws_route53_zone.zone.name_servers.2}",
    "${aws_route53_zone.zone.name_servers.3}",
  ]

  /* There seems to be no other way to communicate this list.
     See example at
     https://www.terraform.io/docs/providers/aws/r/route53_zone.html#name_servers */
  ttl = "${var.ttl}"
}
