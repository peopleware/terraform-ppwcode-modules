A DNS TXT record with a JSON object of information.


*This doesn't work*

There does not seem to be a way to convert a map to a JSON object,
that does not add a double quote at the start and the end,
at the point were we can no longer remove them, on which AWS balks.

main.tf contains a note that might be a path to solution using a template
that is proven not to lead to a solution for JSON, but it might for 
https://tools.ietf.org/html/rfc1464

We should encapsulate if that is workable, and rename the module.
