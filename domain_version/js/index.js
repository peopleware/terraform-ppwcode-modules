#!/usr/local/bin/node

/**
 *    Copyright 2017 PeopleWare n.v.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const program = require("commander");
const SoaSerial = require("./SoaSerial");
const GitInfo = require("../../js/GitInfo");
const DnsMeta = require("./DnsMeta");
const tagGitRepo = require("../../js/tagGitRepo");
const dnsTxt = require("../../js/dnsTxt");
const packageVersion = require("pkginfo")(module, "version");

//noinspection JSCheckFunctionSignatures
program
  .version(packageVersion);

program
  .command("current-soa-serial [domain]")
  .alias("css")
  .description("Get the SOA record via DNS for `domain`, and extract the serial. "
               + "It is a precondition that the record exists, and network is available.")
  .action(function(domain) {
    if (!domain || domain === "") {
      console.error("domain is mandatory");
      process.exitCode = 1;
      return;
    }
    SoaSerial.currentSoaSerialString(domain)
      .done((serial) => {
        console.log("%j", SoaSerial.parse(serial));
      });
  });

program
  .command("next-soa-serial [domain]")
  .alias("nss")
  .description("The next SOA serial to use for `domain`, now."
               + "If no current serial is found, the result has sequence number 0.")
  .action(function(domain) {
    if (!domain || domain === "") {
      console.error("domain is mandatory");
      process.exitCode = 1;
      return;
    }
    SoaSerial.nextSoaSerial(domain, new Date())
             .done((soaSerial) => console.log(soaSerial.serial));
  });

program
  .command("git-highest-working-copy-dir [path]")
  .alias("ghwc")
  .description("Show the path of the top directory of the highest git working copy [path] is in. This is the top most "
               + "ancestor directory that contains a .git folder. cwd is the default for [path].")
  .action(function(path) {
    GitInfo.highestGitDirPath(path || process.cwd())
      .done((gitPath) => console.log(gitPath));
  });

program
  .command("git-info [path]")
  .alias("gi")
  .description("Information about the highest git working copy and repository above [path], as JSON. "
               + "cwd is the default for [path].")
  .action(function(path) {
    GitInfo
      .createForHighestGitDir(path || process.cwd())
      .done(
        (gitInfo) => console.log("%j", gitInfo),
        (err) => {
          if (err.message === GitInfo.noGitDirectoryMsg) {
            console.error("No git directory found above " + path);
            process.exitCode = 1;
            return false;
          }
          throw err;
        }
      );
  });

program
  .command("current-meta [domain]")
  .alias("cm")
  .description("Get the TXT record via DNS for &quot;meta.{@code domain}&quot;, and report all key value pairs, "
               + "as JSON. It is a precondition that the record exists, and network is available.")
  .action(function(domain) {
    if (!domain || domain === "") {
      console.error("domain is mandatory");
      process.exitCode = 1;
      return;
    }
    dnsTxt("meta." + domain) // TODO better error handling
      .done((meta) => console.log("%j", meta));
  });

const serialTagPrefix = "serial/";

//noinspection JSCheckFunctionSignatures
program
  .command("next-meta [domain] [path]")
  .alias("nm")
  .description("The next meta-information object, now, for the highest git working copy and repository above [path], "
               + "as JSON. cwd is the default for [path]. Fails if the current state of the working copy is not save. "
               + "The repository is tagged with \"serial/<serial>\" if option -t is given.")
  .action(function(domain, path) {
    if (!domain || domain === "") {
      console.error("domain is mandatory");
      process.exitCode = 1;
      return;
    }
    const gitBasePath = path || process.cwd();
    DnsMeta
      .nextDnsMeta(domain, new Date(), gitBasePath) // rejected if not save
      .done(
        (meta) => console.log("%j", meta),
        (err) => {
          // TODO serial already >> 99, no internet, …
          if (err.message === GitInfo.noGitDirectoryMsg) {
            console.error("No git directory found above " + path);
            process.exitCode = 1;
            return false;
          }
          if (err.message === DnsMeta.workingCopyNotSaveMsg) {
            console.error("The working copy is not save (uncommitted changes, not pushed, …)");
            process.exitCode = 1;
            return false;
          }
          throw err;
        }
      );
  });

program
  .command("tag [tagName] [path]")
  .alias("t")
  .description("Tag the highest git working copy and repository above [path] with [tagName]. "
               + "cwd is the default for [path]. The tag is not pushed!")
  .action(function(tagName, path) {
    const gitBasePath = path || process.cwd();
    GitInfo
      .highestGitDirPath(gitBasePath)
      .then(gitPath => tagGitRepo(gitPath, tagName))
      .done(
        () => {
          console.log("%j", {tag: tagName});
        },
        err => {
          if (err.message === tagGitRepo.couldNotCreateTagMsg) {
            console.error("Could not create the tag on the git repository. Does it already exist?");
            process.exitCode = 1;
            return false;
          }
          throw err;
        }
      );
  });

program.parse(process.argv);
