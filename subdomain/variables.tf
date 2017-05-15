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

variable "short-name" {
  // TODO rename to short_name
  type = "string"

  description = <<EOF
The short name of the subdomain. The FQDN of the subdomain is
"$${short-name}.$${parent-domain-name}".
EOF
}

variable "parent-domain-name" {
  // TODO rename to parent_domain-fqdn
  type = "string"

  description = <<EOF
FQDN of the parent domain.  The FQDN of the subdomain is
"$${short-name}.$${parent-domain-name}".
EOF
}

variable "parent-domain-zone_id" {
  // TODO rename to parent_domain-zone_id
  type = "string"

  description = <<EOF
AWS zone id of the zone that controls the parent domain.
NS records for the subdomain will be managed in this zone.
EOF
}

variable "description" {
  type = "string"

  description = <<EOF
Textual description of the hosted zone. AWS Route53 specific field.
EOF
}

variable "ttl" {
  type = "string"

  description = <<EOF
TTL in s of the NS and SOA records in the zone of the parent domain for this subdomain.
EOF

  default = "60"
}

variable "serial" {
  description = <<EOF
The serial version of this build used in the SOA record, in the form YYYYMMDDnn.
Be sure to increment nn on each deploy.
EOF

  default = "1"
}

variable "meta" {
  type = "map"

  description = <<EOF
Terraform map of meta-information about the domain. This information, extended with the serial
number, converted into JSON, is the payload of a TXT record meta.${output.I-fqdn}, and
of meta-ns-${output.I-fqdn} in the parent domain zone.
The default is an empty map.
EOF

  default = {}
}

variable "tags" {
  type = "map"

  description = <<EOF
Map of tags that will be attached to the AWS hosted zone for this subdomain.
The default is empty.
EOF

  default = {}
}
