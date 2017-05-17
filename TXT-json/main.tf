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
