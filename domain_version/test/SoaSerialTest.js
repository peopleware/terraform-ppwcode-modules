const SoaSerial = require("../SoaSerial");

describe("SoaSerial", function() {
  describe("parse", function() {
    ["2017061134", "2017061100", "2017061199"].forEach(function(serial) {
      it("should return a serial with the expected arguments for \"" + serial + "\"", function() {
        const result = SoaSerial.parse(serial);
        if (!result.invariants) {
          throw new Error("invariants do not hold");
        }
      });
    });
  });
});
