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

locals {
  sd_subtype-oauth2_certificate_endpoint = "oauth2-certificate"
  sd_subtype-oauth2_token_endpoint       = "oauth2-token"
  sd_subtype-oauth2_authorization        = "oauth2-authorization"

  sd-oauth2_certificate_endpoint = {
    type         = "api"
    subtype      = local.sd_subtype-oauth2_certificate_endpoint
    generic_type = format("_%s._sub._api._tcp", local.sd_subtype-oauth2_certificate_endpoint)
  }

  sd-oauth2_token_endpoint = {
    type         = "api"
    subtype      = local.sd_subtype-oauth2_token_endpoint
    generic_type = format("_%s._sub._api._tcp", local.sd_subtype-oauth2_token_endpoint)
  }

  sd-oauth2_authorization = {
    type         = "http"
    subtype      = local.sd_subtype-oauth2_authorization
    generic_type = format("_%s._sub._http._tcp", local.sd_subtype-oauth2_authorization)
  }
}

output "I-oauth2" {
  value = {
    certificate_endpoint = local.sd-oauth2_certificate_endpoint
    token_endpoint       = local.sd-oauth2_token_endpoint
    authorization        = local.sd-oauth2_authorization
  }
}
