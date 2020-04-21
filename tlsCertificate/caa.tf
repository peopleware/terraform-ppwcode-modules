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

resource "aws_route53_record" "caa" {
  count   = length(local.all_domains)
  zone_id = var.zone_id
  name    = local.all_domains[count.index]
  type    = "CAA"
  ttl     = local.caa-ttl

  # See
  # - https://docs.aws.amazon.com/Route53/latest/DeveloperGuide/ResourceRecordTypes.html#CAAFormat
  # - https://docs.aws.amazon.com/acm/latest/userguide/setup-caa.html

  records = [
    "0 issue \"amazon.com\"",
    "0 issue \"amazontrust.com\"",
    "0 issue \"amazonaws.com\"",
    "0 issue \"awstrust.com\"",
    "0 issue \";\"",
    "0 issuewild \"amazon.com\"",
    "0 issuewild \"amazontrust.com\"",
    "0 issuewild \"amazonaws.com\"",
    "0 issuewild \"awstrust.com\"",
    "0 issuewild \";\"",
  ]
}
