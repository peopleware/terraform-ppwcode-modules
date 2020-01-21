# A human user has access to the console, and can maintain his or her own credentials.

resource "aws_iam_group" "humans" {
  name = "humans"
  path = "/ppwcode/"
}

resource "aws_iam_group_policy_attachment" "humans-billing_view" {
  group      = aws_iam_group.humans.name
  policy_arn = aws_iam_policy.billing-view.arn
}

resource "aws_iam_group_policy_attachment" "humans-iam_read" {
  group      = aws_iam_group.humans.name
  policy_arn = aws_iam_policy.iam-read.arn
}

resource "aws_iam_group_policy_attachment" "humans-iam_self_manage_credentials" {
  group      = aws_iam_group.humans.name
  policy_arn = aws_iam_policy.iam-self_manage_credentials.arn
}

resource "aws_iam_group_policy_attachment" "humans-iam_self_manage_MFA" {
  group      = aws_iam_group.humans.name
  policy_arn = aws_iam_policy.iam-self_manage_MFA.arn
}
