# tlsCertificate

Create a managed TLS certificate with Amazon Certificate Manager (ACM), for use with AWS infrastructure, such as
Cloudfront, Lambda, etc.

A certificate is created for the FQDNs given as value for the variable `main_fqdn` and `alternate_fqdns`. All these
domain names must be defined in the same Route53 DNS hosted zone, whose id must be given in `zone_id`.

## Details

- **CAA**: First, DNS `CAA` records are created for all the given FQDNS in the hosted zone referred to by `zone_id`.

  This signals to certificate authorities if they are allowed to create certificates for these FQDNs.
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
downtime.

## Terraform version

This module requires Terraform 1.1.2.
