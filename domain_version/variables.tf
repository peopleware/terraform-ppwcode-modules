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

variable "zone_id" {
  description = "AWS zone id in which we define a version"
  type        = "string"
}

variable "domain_name" {
  description = <<EOF
Name of the DNS domain which is controlled by the hosted zone we are defining the version of.
Don't add a final '.'. We do.
EOF

  type = "string"
}

variable "ns-domain_name" {
  description = <<EOF
Domain name of the authoritative name server for the DNS domain we are defining the
version of.
EOF

  type = "string"
}

variable "serial" {
  description = <<EOF
The serial version of this build used in the SOA record, in the form YYYYMMDDnn.
Be sure to increment nn on each deploy.
EOF

  type = "string"
}

variable "meta" {
  type = "map"

  description = <<EOF
Terraform map of meta-information about the domain. This information, extended with the serial
number, converted into JSON, is the payload of a TXT record meta-${var.domain_name}.
The default is an empty map.
EOF

  default = {}
}

variable "ttl" {
  description = <<EOF
Time-to-live in s. Used for SOA and the meta-information TXT record.
Default is 60s.
EOF

  default = "60"
}
