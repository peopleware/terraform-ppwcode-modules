/**
 * An Amazon Machine Image lookup tables for machine images available in each AWS zone.
  */
variable "ami_ubuntu14" {
  description = "Ubuntu server 14.04 LTS (SSD Volume Type) Amazon Machine Image provided by Amazon"
  default = {
    # EU - reland: eu-west-1
    eu-west-1 = "ami-f95ef58a"
    # EU - Frankfurt: eu-central-1
    eu-central-1 = "ami-87564feb"
    # USA - North Virginia: us-east-1
    us-east-1 = "ami-fce3c696"
    # USA - North California: us-west-1
    us-west-1 = "ami-06116566"
    # USA - Oregon: us-west-2
    us-west-2 = "ami-9abea4fb"
    # Asia - Mumbai - ap-south-1
    ap-south-1 = "ami-4a90fa25"
    # Asia - Tokyo - ap-northeast-1
    ap-northeast-1 = "ami-a21529cc"
    # Asia - Seooul - ap-northeast-2
    ap-northeast-2 = "ami-09dc1267"
    # Asia - Singapore - ap-southeast-1
    ap-southeast-1 = "ami-25c00c46"
    # Asia - Sydney - ap-southeast-2
    ap-southeast-2 = "ami-6c14310f"
    # South America - Soa Paulo - sa-east-1
    sa-east-1 = "ami-0fb83963"
  }
}

variable "ami_ubuntu16" {
  # As discovered via https://cloud-images.ubuntu.com/locator/ec2/
  description = "Ubuntu 16.04 LTS (SSD Volume Type) Amazon Machine Image provided by Ubuntu"
  default = {
    # EU - Ireland: eu-west-1
    eu-west-1 = "ami-a4d44ed7"
    # EU - Frankfurt: eu-central-1
    eu-central-1 = "ami-26e70c49"
    # USA - North Virginia: us-east-1
    us-east-1 = "aami-ddf13fb0"
    # USA - North California: us-west-1
    us-west-1 = "ami-b20542d2"
    # USA - Oregon: us-west-2
    us-west-2 = "ami-b9ff39d9"
    # Asia - Mumbai - ap-south-1
    ap-south-1 = "ami-7e94fe11"
    # Asia - Tokyo - ap-northeast-1
    ap-northeast-1 = "ami-fc37e59f"
    # Asia - Seooul - ap-northeast-2
    ap-northeast-2 = "ami-a387afc0"
    # Asia - Singapore - ap-southeast-1
    ap-southeast-1 = "ami-a35284c0"
    # Asia - Sydney - ap-southeast-2
    ap-southeast-2 = "ami-f4361997"
    # South America - Soa Paulo - sa-east-1
    sa-east-1 = "ami-78a93c14"
  }
}
