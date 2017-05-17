/**
 * Defines TXT records in the farmad.be domain that show which version is currently deployed.
 * The content of the TXT record is a JSON formatted object that contains the version properties.
 */

resource "aws_route53_record" "TXT-json" {
  zone_id = "${var.zone_id}"
  name    = "${var.name}"
  type    = "TXT"
  ttl     = "${var.ttl}"
  records = "${list(jsonencode(var.payload))}"
}


// MUDO the above does not work; see https://github.com/hashicorp/terraform/issues/10048
// TODO switch to https://tools.ietf.org/html/rfc1464

/*
NOTE might provide a workable path, courtesy of https://github.com/bugbuilder at https://gitter.im/bugbuilder, 2017-05-17 11:30
variable "payload" {
  type = "map"
  default = {
    foo = "bar"
    baz = "qux"
  }
}

data "template_file" "keys" {
  count = "${length(keys(var.payload))}"

  template = "\"$${key}\"=\"$${value}\""

  vars {
    key = "${element(keys(var.payload), count.index)}"
    value = "${element(values(var.payload), count.index)}"
  }
}

data "template_file" "merge" {
  template = "${join(",", data.template_file.keys.*.rendered)}"
}


output "value" {
value ="${list(data.template_file.merge.rendered)}"
}
*/
