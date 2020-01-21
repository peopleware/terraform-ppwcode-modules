#    Copyright 2020 PeopleWare n.v.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

resource "aws_iam_group" "administrators" {
  name = "administrators"
  path = "/ppwcode/"
}

resource "aws_iam_group_policy_attachment" "administrators_AdministratorAccess" {
  group      = aws_iam_group.administrators.name
  policy_arn = "arn:aws:iam::aws:policy/AdministratorAccess"
}
