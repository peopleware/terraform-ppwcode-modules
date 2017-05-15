/**
 * Define a subdomain of a parent domain.
 *
 * Name servers for the subdomain are added to the parent domain.
 * A new hosted zone is created for the subdomain.
 *
 * The outputs of the module are
 * - zone_id: the zone_id of the hosted zone for the subdomain
 * - domain: the FQDN of the subdomain
 *
 * Note: If a domain name is necessary at the apex, use an A record or ALIAS to an A
 *       record, not a CNAME!
 */

variable "short-name" {
  type = "string"
}

variable "parent-domain-name" {
  type = "string"
}

variable "parent-domain-zone_id" {
  type = "string"
}

variable "description" {
  type = "string"
}

variable "ttl" {
  type = "string"
  default = "60"
}

resource "aws_route53_zone" "ZONE" {
  name = "${var.short-name}.${var.parent-domain-name}"
  comment = "${var.description}"

  tags {
  }
}

resource "aws_route53_record" "NS_DELEGATION" {
  zone_id = "${var.parent-domain-zone_id}"
  name = "${aws_route53_zone.ZONE.name}"
  type = "NS"
  records = [
    "${aws_route53_zone.ZONE.name_servers.0}",
    "${aws_route53_zone.ZONE.name_servers.1}",
    "${aws_route53_zone.ZONE.name_servers.2}",
    "${aws_route53_zone.ZONE.name_servers.3}"
  ]
  /* There seems to be no other way to communicate this list.
     See example at
     https://www.terraform.io/docs/providers/aws/r/route53_zone.html#name_servers */
  ttl = "${var.ttl}"

}
