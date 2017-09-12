According to DNS-SD, detailed information about a service must be provided
in 1 TXT record, as `key=value` pairs. Different `key=value` pairs must be
in separate DNS strings within the same TXT record. 

In Route53 via Terraform
========================

Terraform expects a list of records. Each record is a Terraform string, and
becomes a TXT record.
All the DNS strings for 1 DNS Record must be crammed into 1 Terraform string.

Starting from a Terraform map `var.details`, this can be done like this:

    resource "aws_route53_record" "txt_record" {
      zone_id = "…"
      name    = "…"
      type    = "TXT"
      ttl     = "…"
    
      records = ["${join("\"\"", formatlist("%s=%s", keys(var.details), values(var.details)))}"]
    }

`formatlist` combines the list of `keys` of the map with the list of `values` of the map into
`key=value` pairs using the pattern `$s=%s`. The result is a list of strings, each of which
is a `key=value` pair.

Submitting this like this to `records` results in a separate TXT record per `key=value` pair,
which is not what we want.

To transform this list of strings into 1 Terraform string, we need to `join` the list.
To make AWS Route53 understand that the parts are separate DNS strings,
each part needs to be enclosed in quotes `"…"`.
In several steps, by Terraform and AWS, quotes `"` are added in front and at the back of this
joined string. What is missing are the quotes _between_ the `key=value` pairs. We can add these
by using them as a weird join pattern. However, for Terraform to leave them alone when it passes
them to AWS, we need to quote them. The separator pattern thus becomes `\"\"`.

In Route53 via the Web UI
=========================

In the Route53 Web UI, we can add several strings on several lines. Each separate line becomes
a separate TXT record. It is thus important to have all our `key=value` pairs on the same line
in the TEXTAREA.

To have the AWS Route53 Web UI create separate DNS strings for each `key=value` pair, we need to
enclose each `key=value` pair in double quotes: `"key=value"`, concatenate them (without spaces
or other separators) and keep all of them on one line:

    "apiVersion=v6""at=2017-09-12T16:54:00Z""implVersion=v6""path=/latest""submitted=2017-09-12T23:00:02Z""txtvers=1"


In Dyn.com via the Web UI
=========================

None of the above works in the Dyn.com Web UI.
It seems like it is impossible to create a multi-string TXT record in Dyn.com.

A support question was posted. 
