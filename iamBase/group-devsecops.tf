resource "aws_iam_group" "devsecops" {
  name = "devsecops"
  path = "/ppwcode/"
}

resource "aws_iam_group_policy_attachment" "devsecops-tfstate_readwrite" {
  group      = aws_iam_group.devsecops.name
  policy_arn = aws_iam_policy.tfstate-readwrite_nodelete_nor_change.arn
}

resource "aws_iam_group_policy_attachment" "devsecops-manage_devsecops" {
  group      = aws_iam_group.devsecops.name
  policy_arn = aws_iam_policy.manage_devsecops.arn
}
