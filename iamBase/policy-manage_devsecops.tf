# Devsecops can define roles, and manage a subset of users. Be careful.
#
# Devsecops roles must follow have path `/devsecops/*`. Policies for the devsecops roles must have path `/devsecops/*`.

# https://docs.aws.amazon.com/IAM/latest/UserGuide/list_iam.html

data "aws_iam_policy_document" "manage_devsecops" {
  statement {
    # devsecops members can manage other human users and CI users
    effect = "Allow"
    actions = [
      "iam:CreateUser",
      "iam:UpdateUser",
      "iam:DeleteUser",
      "iam:TagUser",
      "iam:UntagUser",
      "iam:CreateLoginProfile",
      "iam:UpdateLoginProfile",
      "iam:DeleteLoginProfile",
    ]
    resources = [
      "arn:aws:iam::${data.aws_caller_identity.current.account_id}:user/ci/*",
      "arn:aws:iam::${data.aws_caller_identity.current.account_id}:user/human/*",
    ]
  }
  statement {
    # devsecops members can manage the humans and devsecops group
    effect = "Allow"
    actions = [
      "iam:AddUserToGroup",
      "iam:RemoveUserFromGroup",
      "iam:PutGroupPolicy",
      "iam:AttachGroupPolicy",
      "iam:DetachGroupPolicy",
      "iam:DeleteGroupPolicy",
    ]
    resources = [
      aws_iam_group.humans.arn,
      aws_iam_group.devsecops.arn
    ]
  }
  statement {
    effect = "Allow"
    actions = [
      "iam:Simulate*",
    ]
    resources = ["*"]
  }
  statement {
    # devsecops users can see (Get and List) anything. This does not avoid the need to add the read permissions to
    # each project specific role policy, because the role that is assumed must have the read permissions, not the
    # user.
    effect = "Allow"
    # TODO add Get* and List* (and other read only permissions) for all services we use
    actions = concat(
      module.actions.I-iam-read,
      module.actions.I-s3-buckets-describe, # not Get* / List*
      [
        "acm:Get*",
        "acm:List*",
        "apigateway:Get*",
        "apigateway:List*",
        "cloudformation:Describe*",
        "cloudformation:Get*",
        "cloudformation:List*",
        "cloudfront:Get*",
        "cloudfront:List*",
        "cloudwatch:Describe*",
        "cloudwatch:Get*",
        "cloudwatch:List*",
        "cloudtrail:Describe*",
        "cloudtrail:Get*",
        "cloudtrail:LookupEvents",
        "cloudtrail:List*",
        "cognito-identity:List*",
        "cognito-sync:Get*",
        "config:BatchGet*",
        "config:Describe*",
        "config:Get*",
        "config:List*",
        "dynamodb:Describe*",
        "dynamodb:*Get*",
        "dynamodb:List*",
        "dynamodb:Query",
        "dynamodb:Scan",
        "ec2:Describe*",
        "events:Describe*",
        "events:List*",
        "iot:Describe*",
        "iot:Get*",
        "iot:List*",
        "kinesis:Describe*",
        "kinesis:List*",
        "kms:ListAliases",
        "lambda:Get*",
        "lambda:List*",
        "logs:Describe*",
        "logs:FilterLogEvents",
        "logs:Get*",
        "logs:List*",
        "logs:StartQuery",
        "logs:StopQuery",
        "logs:TestMetricFilter",
        "route53:Get*",
        "route53:List*",
        "route53:TestDNSAnswer",
        // must be managed manually in the console - no Terraform support
        "route53domains:*",
        "s3:Get*",
        "s3:List*",
        "sns:List*",
        "sqs:List*",
        "sts:Decode*",
        // sts:Get* would also allow acquiring tokens
        "sts:GetAccessKeyInfo",
        "sts:GetCallerIdentity",
        // devsecops can also tag sessions; there is little wrong with that
        "sts:TagSession",
        "tag:Get*",
        "waf:Get*",
        "waf:List*",
      ]
    )
    resources = ["*"]
  }
  statement {
    # devsecops users can create certificates to their hearts extend.
    # This is because this is difficult to manage per-project with roles, because it _has_ to be done in "us-east-1".
    effect = "Allow"
    actions = [
      "acm:Get*",
      "acm:List*",
      "acm:RequestCertificate",
      "acm:RenewCertificate",
      "acm:UpdateCertificateOptions",
      "acm:DeleteCertificate",
      "acm:DescribeCertificate",
      "acm:AddTagsToCertificate",
      "acm:RemoveTagsFromCertificate",
    ]
    resources = ["*"]
  }
  statement {
    # devsecops users can manage devsecops policies
    effect = "Allow"
    actions = [
      "iam:CreatePolicy",
      "iam:DeletePolicy",
      "iam:CreatePolicyVersion",
      "iam:DeletePolicyVersion",
      "iam:SetDefaultPolicyVersion",
    ]
    resources = [
      "arn:aws:iam::${data.aws_caller_identity.current.account_id}:policy/devsecops/*",
    ]
  }
  statement {
    # devsecops users can manage devsecops roles, and assume them
    effect = "Allow"
    actions = [
      "iam:CreateRole",
      "iam:UpdateRole",
      "iam:UpdateRoleDescription",
      "iam:TagRole",
      "iam:UntagRole",
      "iam:UpdateAssumeRolePolicy",
      "iam:DeleteRole",
      "iam:PutRolePolicy",
      "iam:AttachRolePolicy",
      "iam:DetachRolePolicy",
      "iam:DeleteRolePolicy",

      # allow users to assume these roles
      "sts:AssumeRole",
    ]
    resources = [
      "arn:aws:iam::${data.aws_caller_identity.current.account_id}:role/devsecops/*",
    ]
  }
  statement {
    # devsecops users can assume automated-test roles
    effect = "Allow"
    actions = [
      # allow users to assume these roles
      "sts:AssumeRole",
    ]
    resources = [
      "arn:aws:iam::${data.aws_caller_identity.current.account_id}:role/automated-test/*",
    ]
  }
  statement {
    # devsecops users can invoke any Lambda in the account (so they can do test calls, remote, or in the console)
    effect = "Allow"
    actions = [
      "lambda:InvokeFunction"
    ]
    resources = [
      "arn:aws:lambda:*:${data.aws_caller_identity.current.account_id}:*"
    ]
  }
}

resource "aws_iam_policy" "manage_devsecops" {
  name = "IamManageDevsecops"
  path = "/ppwcode/" # NOT /devsecops/

  description = "Can read everything, manage humans and devsecops, manage certificates and define devsecops roles."

  policy = data.aws_iam_policy_document.manage_devsecops.json
}
