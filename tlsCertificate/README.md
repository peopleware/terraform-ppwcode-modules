# tlsCertificate

Create a managed TLS certificate with Amazon Certificate Manager (ACM), for use with AWS infrastructure, such as
Cloudfront, Lambda, etc.

A certificate is created for the FQDNs given as value for the variable `main_fqdn` and `alternate_fqdns`. All these
domain names must be defined in the same Route53 DNS hosted zone, whose id must be given in `zone_id`.

## Details

- **CAA**: First, DNS `CAA` records are created for all of the given FQDNS in the hosted zone referred to by `zone_id`.

  This signals to certificate authorities which authorities are allowed to create certificates for these FQDNs.
  We only allow AWS to do so.

- **certificate request**: Then, a certificate request is created with ACM, in the AWS region given by the value of
  `region`, with the AWS profile given by the value of `profile`.

  The TLS certificates for Cloudfront distributions _must_ be maintained in the US East (N. Virginia) region
  `us-east-1`. See
  [Services Integrated with AWS Certificate Manager; Amazon CloudFront; Note](https://docs.aws.amazon.com/acm/latest/userguide/acm-services.html).

  Other resources in this module are created with the AWS provider you defined in the configuration that uses this
  module, i.e., in the region and with the profile defined there.

- **proof**: ACM requires us to proof that we own the given FQDNs. We do this by adding secrets in DNS in the hosted
  zone referred to by `zone_id` for each of the FQDNs.

  _**NOTE:** There is a possible issue with this step, which this module tries to work around. See below._

- **wait:** Finally, this module waits for the certificate to be issued, and returns it's `id` and `arn`.

## Tags

The value of the variables `terraform-configuration`, `environment`, and the `terraform.workspace` are used to tag the
resources that can be tagged.

## Auto-renewal

With this setup, ACM will auto-renew the certificate. This is achieved by keeping the proof-DNS-records alive for the
lifetime of the certificate.

## Changes

Almost any change will create a new certificate, and delete the existing one. The existing certificate is only deleted
after the new one is created, which makes it possible to switch the certificate that is used by a resource with zero
down time.

## Terraform version

This module requires Terraform 0.12.

## Issues

### Creation of the proofs for an undetermined number of FQDNS

There is an issue with the creation of the proofs for an undetermined number of FQDNS.
See [terraform-provider-aws#6557](https://github.com/terraform-providers/terraform-provider-aws/issues/6557).

A workaround for `count` is to use the length of `local.all_domains`, which should be the same. That works for the
count, and then the name, type, and records values are "computed".

This works if a delta has the same number of domain names, or goes to less domain names, when a new certificate request
is made. It does not work if a change is made to more domain names. Then we get `index <N> out of range for list aws_acm_certificate.main.domain_validation_options`. The reason is that Terraform wants to determine the size of the
list during it's plan phase, before the certificate request is actually created, and uses the list it knows at that
time. This is simply wrong.

A solution is to apply in 2 phases, first creating the certificate request, and in a second run, the proofs.

The bug reports refer to this as using the `--target` attribute, the intention being of first creating the CAA and
certificate request separately, with `--target`, and then the rest.

This does however negate the lifecycle `create_before_destroy = true` setting of the certificate request. Inbetween the
2 runs, there is no issued certificate.
`
### Random order of some results being returned by AWS

There is an issue for this module, regarding to the random order of some results being returned by AWS after an API
change.

This module needs to be changed slightly.

See [terraform-provider-aws#8531](https://github.com/hashicorp/terraform-provider-aws/issues/8531#issuecomment-663562156).

This might also resolve the previous issue.
