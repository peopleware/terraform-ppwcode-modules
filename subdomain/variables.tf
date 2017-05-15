variable "short-name" {
  type = "string"

  description = <<EOF
The short name of the subdomain. The FQDN of the subdomain is
"$${short-name}.$${parent-domain-name}".
EOF
}

variable "parent-domain-name" {
  type = "string"

  description = <<EOF
FQDN of the parent domain.  The FQDN of the subdomain is
"$${short-name}.$${parent-domain-name}".
EOF
}

variable "parent-domain-zone_id" {
  type = "string"

  description = <<EOF
AWS zone id of the zone that controls the parent domain.
NS records for the subdomain will be managed in this zone.
EOF
}

variable "description" {
  type = "string"

  description = <<EOF
Textual description of the hosted zone. AWS Route53 specific field.
EOF
}

variable "ttl" {
  type = "string"

  description = <<EOF
TTL in s of the NS records in the zone of the parent domain for this subdomain.
EOF

  default = "60"
}
