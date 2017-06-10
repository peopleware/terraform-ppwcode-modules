Controls the SOA record of a domain, which should contain a serial,
and adds a meta TXT record with meta information about the zone as payload in the format
specified by [RFC 1464] and [RFC 6763 section 6].

The serial of the SOA record is calculated automatically based on the existing SOA serial
and the current UTC time, following [RFC 1912 section 2.2]:

> The recommended syntax is YYYYMMDDnn (YYYY=year, MM=month, DD=day, nn=revision number).

The meta information is 
* information about the highest git repository this module is used in:
  * `repo`: the URL of the `origin` remote,
  * `sha`: the current SHA,
* `serial`: the serial used in the SOA record,

and all the key / value keys found in the map input variable `additional_meta`.

All the meta information is offered in the output map `I-meta_payload`.

[RFC 1464]: https://tools.ietf.org/html/rfc1464
[RFC 6763 section 6]: https://tools.ietf.org/html/rfc6763#section-6
[RFC 1912 section 2.2]: https://tools.ietf.org/html/rfc1912
