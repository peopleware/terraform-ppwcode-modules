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
