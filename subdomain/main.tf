/**
 *    Copyright 2016-2020 PeopleWare n.v.
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
 * Define a subdomain of a parent domain.
 *
 * Name servers for the subdomain are added to the parent domain.
 * A new hosted zone is created for the subdomain.
 *
 * The outputs of the module are
 * - zone_id: the zone_id of the hosted zone for the subdomain
 * - domain: the FQDN of the subdomain
 *
 * Note: If a domain name is necessary at the apex, use an A record or ALIAS to an A
 *       record, not a CNAME!
 */

resource "aws_route53_zone" "zone" {
  name    = "${var.short-name}.${var.parent-domain-name}"
  comment = var.description
  tags    = var.tags
}
