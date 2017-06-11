const SoaSerial = require("../SoaSerial");

function validateInvariants(subject) {
  if (!subject.invariants) {
    throw new Error("invariants do not hold");
  }
}

const someSerials = [
  "2017061134",
  "2017061100",
  "2017061199"
];

describe("SoaSerial", function() {
  describe("constructor", function() {
    [
      {at: new Date(2017, 5, 11, 14, 58, 34, 234), sequenceNumber: 23}
    ]
    .forEach(function(parameters) {
      it("should return a serial with the expected properties for \"" + JSON.stringify(parameters) + "\"", function() {
        const result = new SoaSerial(parameters.at, parameters.sequenceNumber);
        validateInvariants(result);
      });
    });
  });
  describe("parse", function() {
    someSerials.forEach(function(serial) {
      it("should return a serial with the expected properties for \"" + serial + "\"", function() {
        const result = SoaSerial.parse(serial);
        validateInvariants(result);
      });
    });
  });
  describe("#next", function() {
    someSerials
      .map((serial) => function() {return new SoaSerial.parse(serial)})
      .forEach(function(generateSubject) {
        [
          new Date(2017, 5, 11, 14, 58, 34, 234)
        ]
        .forEach(function(useAt) {
          const subject = generateSubject();
          it("should return a serial with the expected properties  for \""
             + JSON.stringify(subject) + "\" with \"" + useAt + "\"", function() {
            const result = subject.next(useAt);
            validateInvariants(subject);
            validateInvariants(result);
          });
        });
      });
  });
});
