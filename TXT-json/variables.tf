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
  description = "Id of the AWS zone in which we define the TXT record"
  type        = "string"
}

variable "name" {
  description = <<EOF
FQDN of the TXT record.
EOF

  type = "string"
}

variable "payload" {
  type = "map"

  description = <<EOF
Terraform map of information. This information, converted into JSON, is the
payload of the TXT record.
EOF
}

variable "ttl" {
  description = <<EOF
Time-to-live in s of the TXT record.
Default is 60s.
EOF

  default = "60"
}
