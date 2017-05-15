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
 * Otherwise, fall back to the default.
 * The hostmaster will be hostmaster@${var.short-name}.${var.parent-domain-name}. You should make sure
 * that email address exists.
 * The first name server will be used as authorative name server.
 *
 * We need a serial number, that is to be in the format YYYYMMDDnn, where nn is a 0 based, 2 digit
 * incremental number per day. The default is 1. This serial number should be tagged in the
 * version control repository.
 */

resource "aws_route53_record" "soa" {
  zone_id = "${aws_route53_zone.zone.zone_id}"
  name    = "${var.short-name}.${var.parent-domain-name}"
  type    = "SOA"
  records = ["${aws_route53_zone.zone.name_servers.0}. hostmaster.${var.short-name}.${var.parent-domain-name}. ${var.serial} 7200 900 1209600 86400"]
  ttl     = "${var.ttl}"
}
