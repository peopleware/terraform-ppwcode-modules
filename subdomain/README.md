# Notice

This module used to depend on [`domain_version`], which is now deprecated. [`domain_version`] automatically maintained
TXT record with meta information, and the subdomain's SOA record.

Since version `7.n.n`, the TXT meta record only contains the information supplied in the variable `additional_meta`,
and the SOA record is no longer maintained.

When switching from an earlier version to version `7.0.0` or higher _Terraform will remove the
SOA record_. The user should add a replacement by hand, and maintain it (if desired) where this
module was used.

Users should add repository information (which was added automatically to the TXT meta record before) by hand, if
desired.

In a later version, we might add support for the SOA record back in here, but then without
a dependency on [`domain_version`] and, indirectly, JavaScript.

[`domain_version`]: domain_version
