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

variable "short-name" {
  // TODO rename to short_name
  type = string

  description = <<EOF
The short name of the subdomain. The FQDN of the subdomain is
"$${short-name}.$${parent-domain-name}".
EOF
}

variable "parent-domain-name" {
  // TODO rename to parent_domain-fqdn
  type = string

  description = <<EOF
FQDN of the parent domain.  The FQDN of the subdomain is
"$${short-name}.$${parent-domain-name}".
EOF
}

variable "parent-domain-zone_id" {
  // TODO rename to parent_domain-zone_id
  type = string

  description = <<EOF
AWS zone id of the zone that controls the parent domain.
NS records for the subdomain will be managed in this zone.
EOF
}

variable "description" {
  type = string

  description = <<EOF
Textual description of the hosted zone. AWS Route53 specific field.
EOF
}

variable "ttl" {
  type = string

  description = <<EOF
TTL in s of the NS and SOA records in the zone of the parent domain for this subdomain.
EOF

  default = "60"
}

variable "additional_meta" {
  type = map(string)

  description = <<EOF
Map with additional meta-information about the domain. This information will be added to the payload of the TXT
records meta.$${var.domain_name}, following https://tools.ietf.org/html/rfc1464, besides calculated meta-information.
The default is an empty map. Entries in this map overwrite calculated entries. Values must be strings.
EOF

  default = {}
}

variable "tags" {
  type = map(string)

  description = <<EOF
Map of tags that will be attached to the AWS hosted zone for this subdomain.
The default is empty.
EOF

  default = {}
}
