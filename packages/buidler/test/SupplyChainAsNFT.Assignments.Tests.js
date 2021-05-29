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
  describe("Stages and ownership", function () {

    it("Should deploy my SupplyChainAsNFT", async function () {
      supplyChainAsNFTInstance = await SupplyChainAsNFT.new("test", "test");
    });

    describe("Assigning stages", function () {
      it("Adds a stage", async function () {
        await supplyChainAsNFTInstance.addStage("wow");
      });
      it("Adds a stage", async function () {
        await supplyChainAsNFTInstance.addStage("wee");
      });

      it("Adds adds a signatory at 1", async function () {
        await supplyChainAsNFTInstance.addStageSignatory(1, accounts[1]);
      });

      it("Adds adds a signatory at 2", async function () {
        await supplyChainAsNFTInstance.addStageSignatory(1, accounts[2]);
      });

      it("Can't add when token does not exist", async function () {
        await catchRevert(supplyChainAsNFTInstance.assignStage(1, 1, accounts[1]));
      });

      it("mints once", async function () {
        await supplyChainAsNFTInstance.mint(accounts[0]);
      });

      it("Can't assign stage 1 when not an owner", async function () {
        await catchRevert(supplyChainAsNFTInstance.assignStage(1, 1, accounts[1], { from: accounts[1] }));
      });

      it("Can assign stage 1 when an owner", async function () {
        await supplyChainAsNFTInstance.assignStage(1, 1, accounts[1], { from: accounts[0] });
      });

      it("Can't assign stage 1 when signatory does not exist", async function () {
        await catchRevert(supplyChainAsNFTInstance.assignStage(1, 1, accounts[1], { from: accounts[3] }));
      });

      //   require(
      //       !tokenStageStates[tokenId][tokenId].isComplete,
      //       "The stage is already complete"
      //   );
    });
  });

});
