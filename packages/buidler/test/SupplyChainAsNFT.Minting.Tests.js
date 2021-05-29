const {
  catchRevert
} = require("./exceptionsHelper");

const {
  emptyAddress
} = require("./sharedFunctions");

const SupplyChainAsNFT = artifacts.require("SupplyChainAsNFT");

describe("SupplyChainAsNFT:Minting tests", function () {
  let accounts;
  let supplyChainAsNFTInstance;
  before(async function () {
    accounts = await web3.eth.getAccounts();
  });
  describe("Deployment and ownership", function () {

    it("Should deploy my SupplyChainAsNFT", async function () {
      supplyChainAsNFTInstance = await SupplyChainAsNFT.new("test", "test", accounts[0]);
    });

    // set once above
    describe("Can't mint more than the limit", function () {
      it("Sets token limit to 3", async function () {
        var response = await supplyChainAsNFTInstance.setTokenLimit(3);
      });
      it("mints once", async function () {
        await supplyChainAsNFTInstance.mint(accounts[0]);
      });
      it("mints twice", async function () {
        await supplyChainAsNFTInstance.mint(accounts[0]);
      });
      it("mints three times", async function () {
        await supplyChainAsNFTInstance.mint(accounts[0]);
      });
      it("can't mint four", async function () {
        await catchRevert(supplyChainAsNFTInstance.mint(accounts[0]));
      });
    });

  });

});
