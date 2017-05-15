/**
 * For a subdomain definition to be found by DNS, we need to add the nameservers that serve it
 * as NS records to the parent domain, with a given TTL.
 */

resource "aws_route53_record" "NS_DELEGATION" {
  zone_id = "${var.parent-domain-zone_id}"
  name    = "${aws_route53_zone.ZONE.name}"
  type    = "NS"

  records = [
    "${aws_route53_zone.ZONE.name_servers.0}",
    "${aws_route53_zone.ZONE.name_servers.1}",
    "${aws_route53_zone.ZONE.name_servers.2}",
    "${aws_route53_zone.ZONE.name_servers.3}",
  ]

  /* There seems to be no other way to communicate this list.
     See example at
     https://www.terraform.io/docs/providers/aws/r/route53_zone.html#name_servers */
  ttl = "${var.ttl}"
}
