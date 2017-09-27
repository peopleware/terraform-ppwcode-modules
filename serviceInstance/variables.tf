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
There is an issue with this module. It is deprecated. Use `dnsSdInstance` instead.

AWS zone id of the zone that controls the domain in which the service operates.
EOF
}

variable "domain-name" {
  type = "string"

  description = <<EOF
There is an issue with this module. It is deprecated. Use `dnsSdInstance` instead.

FQDN of the domain in which the service operates. This must be the domain controlled
by the zone for which $${var.domain-zone_id} is given, or a subdomain of that domain.
EOF
}

variable "protocol" {
  type = "string"

  description = <<EOF
There is an issue with this module. It is deprecated. Use `dnsSdInstance` instead.

Protocol of the service. 'tcp' (default) or 'udp'.
EOF

  default = "tcp"
}

variable "type" {
  type = "string"

  description = <<EOF
There is an issue with this module. It is deprecated. Use `dnsSdInstance` instead.

Service type identification. The starting dash is added automatically. Can be extended
with an optional subtype. For APIs, use type "api", and specify the actual API with
a subtype. For UIs, use type "http". A subtype is optional.
EOF
}

variable "subtype" {
  type = "string"

  description = <<EOF
There is an issue with this module. It is deprecated. Use `dnsSdInstance` instead.

Service subtype identification. The starting dash is added automatically. Optional.
EOF

  default = ""
}

variable "instance" {
  type = "string"

  /* http://docs.aws.amazon.com/Route53/latest/DeveloperGuide/DomainNameFormat.html
     Formatting Domain Names for Hosted Zones and Resource Record Sets
     "escape codes in the format \three-digit octal code" \
     Upper case is not supported by Route53! Not even with escape codes. */

  description = <<EOF
There is an issue with this module. It is deprecated. Use `dnsSdInstance` instead.

Name of the service instance. This should be human readable, and can contain any character
in principle. Currently, the user must replace all non-readable ASCII characters by an 3-digit
octal (double) escape sequence. E.g., instead of a space, use '\\040'. Upper case is not
supported.
EOF
}

variable "host" {
  type = "string"

  description = <<EOF
There is an issue with this module. It is deprecated. Use `dnsSdInstance` instead.

FQDN of where the service instance is hosted.
EOF
}

variable "port" {
  type = "string"

  description = <<EOF
There is an issue with this module. It is deprecated. Use `dnsSdInstance` instead.

Port at which the service instance is hosted at the $${var.host}. Default is 443 (https).
EOF

  default = 443
}

variable "priority" {
  type = "string"

  description = <<EOF
There is an issue with this module. It is deprecated. Use `dnsSdInstance` instead.

Priority of this service instance among it's peers. Default 0.
EOF

  default = 0
}

variable "weight" {
  type = "string"

  description = <<EOF
There is an issue with this module. It is deprecated. Use `dnsSdInstance` instead.

Weight of this service instance among it's peers with the same priority. Default 0.
EOF

  default = 0
}

variable "details" {
  type = "map"

  description = <<EOF
There is an issue with this module. It is deprecated. Use `dnsSdInstance` instead.

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
There is an issue with this module. It is deprecated. Use `dnsSdInstance` instead.

TTL in s of the PTR, SRV and TXT records.
EOF

  default = "30"
}
