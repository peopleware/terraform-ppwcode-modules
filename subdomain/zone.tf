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

resource "aws_route53_zone" "ZONE" {
  name    = "${var.short-name}.${var.parent-domain-name}"
  comment = "${var.description}"

  tags {}
}
