Controls the SOA record of a domain, which should contain a serial,
and adds a meta TXT record with meta information about the zone as payload in the format
specified by [RFC 1464] and [RFC 6763 section 6].

The serial of the SOA record is calculated automatically based on the existing SOA serial
and the current UTC time, following [RFC 1912 section 2.2]:

> The recommended syntax is YYYYMMDDnn (YYYY=year, MM=month, DD=day, nn=revision number).

The meta information is

- information about the highest git repository this module is used in:
  - `repo`: the URL of the `origin` remote,
  - `sha`: the current SHA,
  - `branch`: the name of the current branch,
- `serial`: the serial used in the SOA record,

and all the key / value keys found in the map input variable `additional_meta`.

All the meta information is offered in the output map `I-meta_payload`.

The highest git repository this module is used in, is tagged with `serial/DOMAIN_NAME/<META.serial>`.
The `DOMAIN_NAME` is included in the tag to make it possible to use this module in a configuration
more than once, for different domains. Otherwise, all uses would try to apply the same tag to the repo,
and all but the first attempts would fail. _This program does not push the tag._

Planning or applying this module will fail if the highest git repository this module is used in,
is not clean, if the `branch` contains the string `"prod"`, `"staging"` or `"test"`. The comparison
is done case-insensitive. In other branches, `meta` will contain an alphabetically sorted, comma-separated
list of the names of all the files that are new, modified or deleted.

# Testing

Testing is done using [Mocha] and [Toryt Contracts].

The tests can be run by executing

    > npm test

[rfc 1464]: https://tools.ietf.org/html/rfc1464
[rfc 6763 section 6]: https://tools.ietf.org/html/rfc6763#section-6
[rfc 1912 section 2.2]: https://tools.ietf.org/html/rfc1912
[mocha]: https://mochajs.org
[toryt contracts]: https://www.npmjs.com/package/@toryt/contracts-iv
