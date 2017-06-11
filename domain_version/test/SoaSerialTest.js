const SoaSerial = require("../SoaSerial");
const moment = require("moment");

function validateInvariants(subject) {
  if (!subject.invariants) {
    throw new Error("invariants do not hold");
  }
}

const someMoments = [
  moment("20170611T161923.345Z"),
  moment("20170611T161923.345+02:00"),
  moment("20170611T161923.345-06:00"),
  moment("20170611T011923.345+02:00"),
  moment("20170611T221923.345-06:00")
];

const someDates = someMoments.map((m) => m.toDate());

//noinspection MagicNumberJS
const someSequenceNumbers = [0, 50, 99];

const someSerials = [
  "2017061134",
  "2017061100",
  "2017061199",
  "2017061034",
  "2017061234",
  "2016022934"
];

// quick hack to test conditions
function validateConditions(conditions, args) {
  conditions.forEach(condition => {
    let conditionResult;
    try {
      conditionResult = condition.apply(undefined, args);
    }
    catch (err) {
      throw new Error("condition " + condition + " has an error: " + err);
    }
    if (!conditionResult) {
      throw new Error("condition violation for: " + condition + " (" + JSON.stringify(args) + ")");
    }
  });
}

describe("SoaSerial", function() {
  describe("constructor", function() {
    someMoments
      .map(m => m.clone())
      .concat(someDates)
      .forEach((at) =>
        someSequenceNumbers.forEach(function(sequenceNumber) {
          it("should return a serial with the  expected properties for at === \"" + moment(at).toISOString() + "\" "
             + "and sequenceNumber === " + sequenceNumber, function() {
            validateConditions(SoaSerial.constructorContract.pre, [at, sequenceNumber]);
            const result = new SoaSerial(at, sequenceNumber);
            validateConditions(SoaSerial.constructorContract.post, [at, sequenceNumber, result]);
            validateInvariants(result);
          });
        })
      );
  });
  describe("parse", function() {
    someSerials.forEach(function(serial) {
      it("should return a serial with the expected properties for \"" + serial + "\"", function() {
        const result = SoaSerial.parse(serial);
        validateInvariants(result);
      });
    });
  });
  describe("#next()", function() {
    someSerials
      .map(serial => function() {return SoaSerial.parse(serial);})
      .forEach(generateSubject =>
        someMoments
          .map(m => m.clone())
          .concat(someDates)
          .forEach(useAt => {
            const subject = generateSubject();
            it("should return a serial with the expected properties for \""
               + JSON.stringify(subject) + "\" with useAt === \"" + moment(useAt).toISOString() + "\"", function() {
              const result = subject.next(useAt);
              validateInvariants(subject);
              validateInvariants(result);
            });
          })
      )
  });
});
