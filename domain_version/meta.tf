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
 * A TXT record, called `meta.${var.domain_name}`, that has given ${var.meta} as payload,
 * extended with `serial=${var.serial}`. This follows following https://tools.ietf.org/html/rfc1464.
 */

resource "aws_route53_record" "meta" {
  zone_id = "${var.zone_id}"
  name = "meta.${var.domain_name}"
  type = "TXT"
  ttl = "${var.ttl}"
  records = "${concat(compact(var.meta), list("serial=${var.serial}"))}"
}
