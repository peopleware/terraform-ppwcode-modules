/**
 *    Copyright 2017 PeopleWare n.v.
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

variable "domain-zone_id" {
  type = "string"

  description = <<EOF
AWS zone id of the zone that controls the domain in which the service instance operates.
EOF
}

variable "domain-name" {
  type = "string"

  description = <<EOF
FQDN of the domain in which the service instance operates. This must be the domain controlled
by the zone for which $${var.domain-zone_id} is given, or a subdomain of that domain.
EOF
}

variable "protocol" {
  type = "string"

  description = <<EOF
Protocol of the service type. 'tcp' (default) or 'udp'.
EOF

  default = "tcp"
}

variable "type" {
  type = "string"

  description = <<DESCRIPTION
Main service type identification. The starting dash is added automatically. For APIs, use type "api",
and specify the actual API with a subtype. For UIs, use type "http".
The user should create a `PTR` resource record for the `generic_type` in the output, with the dns domain in which the
type is defined as postfix. An actual DNS-SD service type is composed as `<generic_type>.<DNS DOMAIN>`.
A DNS-SD generic service type typically has the form `_<generic_type>._sub._<type>._<protocol>`. If there is no
subtype, the generic type is `_<type>._<protocol>`.
DESCRIPTION
}

variable "subtype" {
  type = "string"

  description = <<DESCRIPTION
Optional subtype of the service type. The starting dash is added always (by convention). Not used to create resources,
but to provide clear identification in output "generic_type". DNS-SD generic service types are the first part of a
DNS-SD service type, leaving out the domain. An actual DNS-SD service type is composed as `<generic_type>.<DNS DOMAIN>`.
A DNS-SD generic service type typically has the form `_<generic_type>._sub._<type>._<protocol>`. If there is no
subtype, the generic type is `_<type>._<protocol>`.
DESCRIPTION

  default = ""
}

variable "instance" {
  type = "string"

  /* http://docs.aws.amazon.com/Route53/latest/DeveloperGuide/DomainNameFormat.html
     Formatting Domain Names for Hosted Zones and Resource Record Sets
     "escape codes in the format \three-digit octal code" \
     Upper case is not supported by Route53! Not even with escape codes. */

  description = <<EOF
Name of the service instance. This should be human readable, and can contain any character
in principle. Currently, the user must replace all non-readable ASCII characters by an 3-digit
octal (double) escape sequence. E.g., instead of a space, use '\\040'. Upper case is not
supported.
EOF
}

variable "host" {
  type = "string"

  description = <<EOF
FQDN of where the service instance is hosted.
EOF
}

variable "port" {
  type = "string"

  description = <<EOF
Port at which the service instance is hosted at the $${var.host}. Default is 443 (https).
EOF

  default = 443
}

variable "priority" {
  type = "string"

  description = <<EOF
Priority of this service instance among it's peers. Default 0.
EOF

  default = 0
}

variable "weight" {
  type = "string"

  description = <<EOF
Weight of this service instance among it's peers with the same priority. Default 0.
EOF

  default = 0
}

variable "details" {
  type = "map"

  description = <<EOF
Details about the service instance. Should at least contain a value for the key 'textvers',
containing a number that represents the data version of this record. A key-value pair "at=NOW"
is automatically added, containing an UTC timestamp string in RFC 3339 format that
reflects the last time of application of this definition. You should avoid using keys 'at',
'type', 'subtype', 'name', 'instance', 'host', 'port', 'priority', 'weight'.
EOF

  default = {}
}

variable "ttl" {
  type = "string"

  description = <<EOF
TTL in s of the PTR, SRV and TXT records.
EOF

  default = "30"
}
