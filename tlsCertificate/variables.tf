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

variable "terraform-configuration" {
  type = string

  description = <<DESCRIPTION
Identifier of the terraform configuration that defines these resources. Used in tags to cross-reference the resource
to its definition. Usually the name of a git repository, with a directory path.
DESCRIPTION
}

variable "environment" {
  type = string

  description = <<DESCRIPTION
Id of the environment for which this certificate is used (e.g., "production", or "devaccept").
Used in tags of created resources.
DESCRIPTION
}

variable "zone_id" {
  type = string

  description = <<DESCRIPTION
Id of the hosted zone in which CAA and TXT records can be made for all the domain names of the certificate.
All the domain names must reside in 1 hosted zone.
DESCRIPTION
}

variable "region" {
  type = string

  description = <<DESCRIPTION
Region where to define the certificate.
For Cloudfront, this must be defined in the US East (N. Virginia) region `us-east-1`.
See https://docs.aws.amazon.com/acm/latest/userguide/acm-services.html
Route53 resources in this module use the regular AWS provider.
DESCRIPTION
}

variable "profile" {
  type = string

  description = <<DESCRIPTION
Profile to use when defining the certificate in `region`.
Route53 resources in this module use the regular AWS provider.
DESCRIPTION
}

variable "main_fqdn" {
  type = string

  description = <<DESCRIPTION
Main domain name for which the certificate is issued. Mandatory.
Must be defined in the hosted zone referred to by `zone_id`.
Should not end with a '.', but is protected against it.
DESCRIPTION
}

variable "alternate_fqdns" {
  type = list(string)

  description = <<DESCRIPTION
List of alternate domain names for which the certificate is issued. Mandatory, but can be empty.
All listed FQDNs must be defined in the hosted zone referred to by `zone_id`.
The FQDNs should not end with a '.'.
DESCRIPTION
}
