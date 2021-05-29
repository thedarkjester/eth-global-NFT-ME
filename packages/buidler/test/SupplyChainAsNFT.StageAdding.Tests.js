const {
  catchRevert
} = require("./exceptionsHelper");

const {
  emptyAddress
} = require("./sharedFunctions");

const SupplyChainAsNFT = artifacts.require("SupplyChainAsNFT");

describe("SupplyChainAsNFT tests", function () {
  let accounts;
  let supplyChainAsNFTInstance;
  before(async function () {
    accounts = await web3.eth.getAccounts();
  });
  describe("Deployment and ownership", function () {

    it("Should deploy my SupplyChainAsNFT", async function () {
      supplyChainAsNFTInstance = await SupplyChainAsNFT.new("test", "test");
    });

    // set once above
    describe("Can add stages as owner", function () {
      it("Adds a stage", async function () {
        var response = await supplyChainAsNFTInstance.addStage("wow");
      });
      it("Stage exists in the list of stages", async function () {
        var response = await supplyChainAsNFTInstance.getStages();
        assert.equal(response.length, 1);
        assert.equal(response[0], "wow");
      });
      it("Can add a second stage", async function () {
        await supplyChainAsNFTInstance.addStage("wee");
      });
      it("Stage exists in the list of stages", async function () {
        var response = await supplyChainAsNFTInstance.getStages();
        assert.equal(response.length, 2);
        assert.equal(response[0], "wow");
        assert.equal(response[1], "wee");
      });
    });

  });

});
