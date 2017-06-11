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

const Q = require("q");
const dns = require("dns");
const moment = require("moment");
const git = require("nodegit");
const path = require("path");
const program = require("commander");
const SoaSerial = require("./SoaSerial");
const fs = require("fs");
const packageVersion = require("pkginfo")(module, "version");

const dnsTxtKeyValue = /([^=]+)=(.*)/;

/**
 * Get meta-information about {@code domain}, retrieved via DNS.
 * This is a {@code TXT} record, with key value pairs, with FQDN
 * <code>meta.<var>domain</var></code>.
 *
 * @param {string} domain - FQDN of the domain to get the meta information of
 * @return {Promise<object>} Promise for an object containing all key value pairs found in the meta DNS record
 */
function getMetaViaDns(domain) {
  const metaFqdn = "meta." + domain;
  return Q.denodeify(dns.resolveTxt)(metaFqdn)
          .then((allTxtRecords) => allTxtRecords.reduce(
            (acc, oneTxtRecord) => oneTxtRecord.reduce(
              (acc, str) => {
                const keyValue = dnsTxtKeyValue.exec(str);
                acc[keyValue[1]] = keyValue[2];
                return acc;
              },
              acc
            ),
            {}
          ));
}

/**
 * Return a promise for the git repository we are currently in.
 *
 * @param {string} repoPath - path to the root of the repository
 * @return {Promise<Repository>} - Promise for the git repository found at {@code repoPath}
 */
function getRepo(repoPath) {
  //noinspection JSUnresolvedVariable
  return git.Repository.open(path.resolve(repoPath));
}

/**
 * Return a promise for the HEAD commit of the repo we are currently in.
 *
 * @param {string} repoPath - path to the root of the repository
 * @return {Promise<Commit>} - Promise for the HEAD commit of the git repository found at {@code repoPath}
 */
function getRepoHead(repoPath) {
  //noinspection JSUnresolvedFunction
  return getRepo(repoPath)
            .then((repository) => repository.getHeadCommit());
}

function isNotClean(status) {
  return status.isNew() || status.isModified() || status.isTypeChange() || status.isRenamed();
}

/**
 * Return a promise for a determination whether or not the working copy is clean.
 *
 * @param {string} repoPath - path to the root of the repository
 * @return {Promise<boolean>} - Promise for a boolean that is true if no files in the working copy are new, modified,
 *                              type-changed or renamed, and false otherwise
 */
function isClean(repoPath) {
  //noinspection JSUnresolvedFunction
  return getRepo(repoPath)
    .then((repository) => repository.getStatus())
    .then((statuses) => !statuses.some(isNotClean));
}

function highestGitDir(dirPath) {
  const parts = dirPath.split(path.sep);
  const dirs = parts.map((part, index) => parts.slice(0, index + 1).join(path.sep));
  return Q.all(dirs.map((dir) =>
                          Q.nfcall(fs.access, path.format({dir: dir, name: ".git"}), "rw")
                           .then(() => dir)
                           .catch(() => undefined)))
          .then((gitDirs) => gitDirs.find((dir) => !!dir));
}

/**
 * Turns an object of promises into a promise for an object.  If any of
 * the promises gets rejected, the whole object is rejected immediately.
 * @param {object} promises - an object (or promise for an object) of properties with values (or
 *                            promises for values)
 * @return {object|Promise<object>} a promise for an array of the corresponding values
 */
function object(promises) {
  if (!promises) {
    return promises;
  }
  return Q.all(Object.keys(promises).map((key) => Q.when(promises[key], (value) => ({key, value}))))
    .then((kvPairs) => kvPairs.reduce(
      (acc, kvPair) => {
        acc[kvPair.key] = kvPair.value;
        return acc;
      },
      {}
    ));
}

// monkey patch object on q
Q.object = object;

function uncleanStatusAsText(status) {
  let words = [];
  if (status.isNew()) { words.push("NEW"); }
  if (status.isModified()) { words.push("MODIFIED"); }
  if (status.isTypechange()) { words.push("TYPE CHANGED"); }
  if (status.isRenamed()) { words.push("RENAMED"); }

  return words.join(" ");
}

function closestGitDir(dirPath) {
  return Q.nfcall(fs.access, path.format({dir: dirPath, name: ".git"}), "rw")
          .then(() => dirPath)
          .catch((err) => closestGitDir(path.dirname(dirPath)));
}

const remoteName = "origin";

//noinspection JSCheckFunctionSignatures
program
  .version(packageVersion);

program
  .command("current-soa-serial [domain]")
  .alias("css")
  .description("Get the SOA record via DNS for `domain`, and extract the serial. "
               + "It is a precondition that the record exists, and network is available.")
  .action(function(domain) {
    SoaSerial.currentSoaSerialString(domain)
      .done((serial) => {
        console.log("%s %j", serial, SoaSerial.parse(serial));
      });
  });

program
  .command("next-soa-serial [domain]")
  .alias("nss")
  .description("The next SOA serial to use for `domain`, now."
               + "If no current serial is found, the result has sequence number 0.")
  .action(function(domain) {
    SoaSerial.nextSoaSerial(domain, moment.utc())
             .done((soaSerial) => console.log(soaSerial.serial));
  });

program
  .command("working-copy-dir [path]")
  .alias("wc")
  .description("Show the path of the top directory of the git working copy [path] is in. This is the first "
               + "ancestor directory that contains a .git folder. cwd is the default for [path].")
  .action(function(p) {
    closestGitDir(p || process.cwd())
      .done((gitPath) => console.log(gitPath));
  });

program
  .command("highest-working-copy-dir [path]")
  .alias("hwc")
  .description("Show the path of the top directory of the highest git working copy [path] is in. This is the top most "
               + "ancestor directory that contains a .git folder. cwd is the default for [path].")
  .action(function(p) {
    highestGitDir(p || process.cwd())
      .done((gitPath) => console.log(gitPath));
  });

program
  .command("git-sha")
  .alias("sha")
  .description("The SHA of the HEAD commit of the repo we are currently in.")
  .action(function() {
    highestGitDir(process.cwd())
      .then(getRepoHead)
      .done((head) => console.log(head.sha()));
  });

program
  .command("git-url")
  .alias("url")
  .description("The URL of the remote with name '" + remoteName + "' of the repo we are currently in.")
  .action(function() {
    //noinspection JSUnresolvedFunction, JSCheckFunctionSignatures
    highestGitDir(process.cwd())
      .then(getRepo)
      .then((repository) => repository.getRemote(remoteName))
      .done((remote) => console.log(remote.url()));
  });

program
  .command("git-unclean")
  .alias("uc")
  .description("List unclean files")
  .action(function() {
    //noinspection JSUnresolvedFunction, JSCheckFunctionSignatures
    highestGitDir(process.cwd())
      .then(getRepo)
      .then((repository) => repository.getStatus())
      .done(
        (statuses) => {
          let uncleanStatuses = statuses.filter(isNotClean);
          if (0 < uncleanStatuses.length) {
            uncleanStatuses.forEach((status) => console.warn("%s %s", status.path(), uncleanStatusAsText(status)));
            console.warn();
            console.warn("unclean count: %d", statuses.length);
          }
          else {
            console.log("the working copy is crispy clean");
          }
        }
      );
  });

program
  .command("git-clean")
  .alias("c")
  .description("Exit 0 when the working copy is clean, exit 1 when it is not.")
  .action(function() {
    highestGitDir(process.cwd())
      .then(isClean)
      .done((clean) => {
        process.exitCode = clean ? 0 : 1;
        return clean;
      });
  });

program
  .command("tag-build [build]")
  .alias("tb")
  .description("Tag the current head with the build number, and push, if the current git repository is clean (c)")
  .action(function(build) {
    if (!build && build !== 0) {
      console.error("build number is mandatory");
      process.exitCode = 1;
      return;
    }
    const tagName = "build/" + build;
    const message = "tag build " + build;
    //noinspection JSUnresolvedVariable
    highestGitDir(process.cwd())
      .then(getRepo)
      .then((repository) =>
              repository.getHeadCommit()
                        .then((head) => git.Tag.create(
                          repository,
                          tagName,
                          head,
                          git.Signature.default(repository),
                          message,
                          0
                        ))
      )
      .done(() => console.log("tagged as %s", tagName));
  });

program
  .command("current-meta [domain]")
  .alias("cm")
  .description("Get the TXT record via DNS for `domain`, and report all key value pairs. "
               + "It is a precondition that the record exists, and network is available.")
  .action(function(domain) {
    getMetaViaDns(domain)
      .done((meta) => console.log(meta));
  });

program
  .command("next-meta [domain]")
  .alias("nm")
  .description("The next meta-information object, now, for the remote with name '" + remoteName
               + "' of the repo we are currently in, as JSON")
  .action(function(domain) {
    let repoRetrieved = highestGitDir(process.cwd()).then(getRepo);
    //noinspection JSUnresolvedFunction, JSCheckFunctionSignatures
    return Q.object({
      serial: SoaSerial.nextSoaSerial(domain, moment.utc())
                .then((soaSerial) => soaSerial.serial),
      sha:    repoRetrieved
                .then((repository) => repository.getHeadCommit())
                .then((/*Commit*/ head) => head.sha()),
      repo:   repoRetrieved
                .then((repository) => repository.getRemote(remoteName))
                .then((/*Remote*/ remote) => remote.url())
    })
    .done((meta) => console.log("%j", meta));
  });

program.parse(process.argv);
