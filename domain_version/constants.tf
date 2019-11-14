locals {
  # NOTE: Because of recurring issues with a zone.name having a trailing dot, yes or no, just make sure it is removed if
  # it occurs
  # https://github.com/terraform-providers/terraform-provider-aws/issues/241
  clean_domain_name = "${replace(var.domain_name, "/\\.$/", "")}"
}
