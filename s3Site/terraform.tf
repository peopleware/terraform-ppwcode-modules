terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = ">= 3.8.0"
      configuration_aliases = [ aws.us-east-1 ]
    }
  }
}
