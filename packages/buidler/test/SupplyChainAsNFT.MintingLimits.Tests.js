const {
  catchRevert
} = require("./exceptionsHelper");

const {
  emptyAddress
} = require("./sharedFunctions");

const SupplyChainAsNFT = artifacts.require("SupplyChainAsNFT");

describe("SupplyChainAsNFT:Permissions tests", function () {
  let accounts;
  let supplyChainAsNFTInstance;
  before(async function () {
    accounts = await web3.eth.getAccounts();
  });
  describe("Deployment and ownership", function () {

    it("Should deploy my SupplyChainAsNFT", async function () {
      supplyChainAsNFTInstance = await SupplyChainAsNFT.new("test", "test", accounts[0]);
    });

    describe("in owner role", function () {
      it("Should not have an owner equal to the deployer", async function () {
        assert.isFalse(await supplyChainAsNFTInstance.hasRole('0x00', accounts[1]));
      });
    });

    describe("in minter role", function () {
      it("Should not have the minter role", async function () {
        assert.isFalse(await supplyChainAsNFTInstance.hasRole('0x9f2df0fed2c77648de5860a4cc508cd0818c85b8b8a1ab4ceeef8d981c8956a6', accounts[1]));
      });
    });

    describe("in owner role", function () {
      it("Should have an owner equal to the deployer", async function () {
        assert.isTrue(await supplyChainAsNFTInstance.hasRole('0x00', accounts[0]));
      });
    });

    describe("in minter role", function () {
      it("Should have the minter role", async function () {
        assert.isTrue(await supplyChainAsNFTInstance.hasRole('0x9f2df0fed2c77648de5860a4cc508cd0818c85b8b8a1ab4ceeef8d981c8956a6', accounts[0]));
      });
    });

    describe("Non-owner does not set token limit", function () {
      it("Cannot set limit if not owner", async function () {
        await catchRevert(supplyChainAsNFTInstance.setTokenLimit(10, { from: accounts[1] }));
      });
    });

    describe("Can set token limit", function () {
      it("Sets token limit", async function () {
        var response = await supplyChainAsNFTInstance.setTokenLimit(10);
      });
    });

    // set once above
    describe("Cannot set token limit", function () {
      it("if more than once", async function () {
        await catchRevert(supplyChainAsNFTInstance.setTokenLimit(11));
      });
    });

  });

});
