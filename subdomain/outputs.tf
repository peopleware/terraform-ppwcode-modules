output "zone_id" {
  value = "${aws_route53_zone.ZONE.zone_id}"
}

output "domain" {
  value = "${aws_route53_zone.ZONE.name}"
}
