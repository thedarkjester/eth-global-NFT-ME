const {
  catchRevert
} = require("./exceptionsHelper");

const {
  emptyAddress
} = require("./sharedFunctions");

const SupplyChainAsNFT = artifacts.require("SupplyChainAsNFT");

describe("SupplyChainAsNFT:AddStages tests", function () {
  let accounts;
  let supplyChainAsNFTInstance;
  before(async function () {
    accounts = await web3.eth.getAccounts();
  });
  describe("Stages and ownership", function () {

    it("Should deploy my SupplyChainAsNFT", async function () {
      supplyChainAsNFTInstance = await SupplyChainAsNFT.new("test", "test", accounts[0]);
    });

    describe("Can't add stages as non owner", function () {
      it("Adds a stage", async function () {
        await catchRevert(supplyChainAsNFTInstance.addStage("wow", { from: accounts[1] }));
      });

      it("Stage exists in the list of stages", async function () {
        var response = await supplyChainAsNFTInstance.getStages();
        assert.equal(response.length, 0);
      });
    });

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

  describe("SupplyChainAsNFT:AddSignatories", function () {

    it("Should deploy my SupplyChainAsNFT", async function () {
      supplyChainAsNFTInstance = await SupplyChainAsNFT.new("test", "test", accounts[0]);
    });

    it("Adds a stage as owner", async function () {
      var response = await supplyChainAsNFTInstance.addStage("wow");
    });

    describe("Can't add signatories as non owner", function () {
      it("Adds fails to add a signatory", async function () {
        await catchRevert(supplyChainAsNFTInstance.addStageSignatory(1, accounts[1], { from: accounts[1] }));
      });

      it("Adds fails to add a signatory at 0", async function () {
        await catchRevert(supplyChainAsNFTInstance.addStageSignatory(0, accounts[1]));
      });

      it("Adds fails to add a signatory at 2", async function () {
        await catchRevert(
          supplyChainAsNFTInstance.addStageSignatory(2, accounts[1])
        );
      });

      it("Stage signatory does not exist in the list of signatories", async function () {
        var response = await supplyChainAsNFTInstance.getStageSignatories(1);
        assert.equal(response.length, 0);
      });

      it("Adds adds a signatory at 1", async function () {
        await supplyChainAsNFTInstance.addStageSignatory(1, accounts[1]);
      });

      it("Adds adds a signatory at 1", async function () {
        await supplyChainAsNFTInstance.addStageSignatory(1, accounts[2]);
      });

      it("Adds adds a supplier at 1", async function () {
        await supplyChainAsNFTInstance.addStageSupplier(1, accounts[1]);
      });

      it("Adds adds a supplier at 1", async function () {
        await supplyChainAsNFTInstance.addStageSupplier(1, accounts[2]);
      });

      it("Stage signatory exists in the list of signatories", async function () {
        var response = await supplyChainAsNFTInstance.getStageSignatories(1);
        assert.equal(response.length, 2);
        assert.equal(response[0], accounts[1]);
        assert.equal(response[1], accounts[2]);
      });

      it("Stage supplier exists in the list of signatories", async function () {
        var response = await supplyChainAsNFTInstance.getStageSuppliers(1);
        assert.equal(response.length, 2);
        assert.equal(response[0], accounts[1]);
        assert.equal(response[1], accounts[2]);
      });

      it("Sets token limit to 3", async function () {
        var response = await supplyChainAsNFTInstance.setTokenLimit(3);
      });

      it("mints once", async function () {
        await supplyChainAsNFTInstance.mint(accounts[0]);
      });

      it("Adds succeeds when adding a signatory at 1", async function () {
        await supplyChainAsNFTInstance.addStageSignatory(1, accounts[2]);
      });

      it("mints twice", async function () {
        var response = await supplyChainAsNFTInstance.mint(accounts[0]);
      });
    });
  });
});
