# Standard DNS-SD Generic Service Types

Definition of DNS-SD generic service types of standard services as constants.

DNS-SD generic service types are the first part of a DNS-SD service type, leaving out
the domain. An actual DNS-SD service type is composed as `<GENERIC TYPE>.<DNS DOMAIN>`.
A DNS-SD generic service type typically has the form

    _<SUBTYPE>._sub._<TYPE>._<PROTOCOL>

`<PROTOCOL>` is generally `tcp`, or `udp` in limited specialized cases.

For APIs, `<TYPE>` is `api`. For UI, it is `http`.

The generic service type for standard services is standardized here.

The generic types are string outputs of this module.
