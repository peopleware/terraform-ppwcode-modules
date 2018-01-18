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

output "II-zone_id" {
  value = "${var.domain-zone_id}"
}

locals {
  II_instanceInfo = {
    type         = "${trimspace(var.type)}"
    subtype      = "${trimspace(var.subtype)}"
    generic_type = "${var.subtype == "" ? format("_%s._%s", trimspace(var.type), trimspace(var.protocol)) : format("_%s._sub._%s._%s", trimspace(var.subtype), trimspace(var.type), trimspace(var.protocol))}"
    instance     = "${aws_route53_record.srv.name}"
    host         = "${var.host}"
    port         = "${var.port}"
    priority     = "${var.priority}"
    weight       = "${var.weight}"
  }
}

output "II-instance" {
  value = "${merge(local.fullDetails, local.II_instanceInfo)}"
}
