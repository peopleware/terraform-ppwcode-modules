**There is an issue with this module. It is deprecated. Use `dnsSdInstance` instead.**

The module creates the necessary records for 1
service instance, but when it is used more then once for different service instances
of the same service type, instance registrations overwrite each other in a non-deterministic
way, resulting in only 1 random instance being registered finally.

The module is intended to create 1 `TXT` and 1 `SRV` resource record, describing the service instance,
and 1 `PTR` resource record that lists the service instance as an instance of the service type.

The module creates a `TXT` and and `SRV` resource record _set_, with resp. 1 `TXT` and 1
`SRV` resource record, describing the service instance, correctly.
The module however creates a `PTR` resource record **_set_** for the service type too, with
1 `PTR` resource record that lists the service instance as a an instance of the service type.
A second instance of the module, for the same service type but a different service instance, correctly
creates separate `TXT` and `SRV` resource record sets, and thus separate `TXT` and `SRV` resource
records, for the second instance. The `TXT` and `SRV` resource record sets are required to be
singletons, so there is no functional difference between the resource record _set_ and the resource
record. The `PTR` resource record set however is intended to have many elements, and not be a singleton,
expressing the 1-n relation between the service type and it's service instances. In practice,
each module instance for the same service type overwrites the other's singleton `PTR` resource record
_set_, instead of adding a separate `PTR` resource record.

The reason is the misnomer / wrong implementation in Terraform: the AWS Route 53 resources are not
`aws_route53_`**record**s, but `aws_route53_`**record set**s. Terraform should gather all definitions
(over different configurations!) of resource records for the same full name and record type,
combine them in a single resource record set, and `UPSERT` the resource record set as a whole. It
should further combine all necessary AWS Route 53 resource changes in one _change set_, and call
the AWS Route 53 API with the one change set as a whole. This is atomic, according to the AWS
Route 53 documentation.

The workaround is to use `dnsSdInstance`, and maintain the service type `PTR` resource record
set separately. `dnsSdInstance` only creates the singleton `TXT` and `SRV` resource record set, to be
referred to by one `PTR` resource record outside the module.

This module can still be used when the user is sure there will be exactly 1 service instance of the
service type. In general however, it is better to handle all service definitions in the same way.
Therefor, this module is deprecated.
