const {
  catchRevert
} = require("./exceptionsHelper");

const {
  emptyAddress
} = require("./sharedFunctions");

const SupplyChainFactory = artifacts.require("SupplyChainFactory");

describe("SupplyChainAsNFT:AddingSupplyChains tests", function () {
  let accounts;
  let supplyChainFactoryInstance;
  before(async function () {
    accounts = await web3.eth.getAccounts();
  });
  describe("Deployment and ownership", function () {

    it("Should deploy my SupplyChainFactory", async function () {
      supplyChainFactoryInstance = await SupplyChainFactory.new();
    });

    describe("not in owner role", function () {
      it("Should not have an owner equal to the deployer", async function () {
        assert.isFalse(await supplyChainFactoryInstance.hasRole('0x00', accounts[1]));
      });
    });

    describe("in owner role", function () {
      it("Should have an owner equal to the deployer", async function () {
        assert.isTrue(await supplyChainFactoryInstance.hasRole('0x00', accounts[0]));
      });
    });
  });

  describe("Adding SupplyChains", function () {

    it("Should deploy my SupplyChainFactory", async function () {
      supplyChainFactoryInstance = await SupplyChainFactory.new();
    });

    describe("Owner adds supply chain", function () {
      it("adds and returns the supply chain in the list", async function () {
        let txResponse = await supplyChainFactoryInstance.addSupplyChain('MyName', 'test', 10);

        let supplyChains = await supplyChainFactoryInstance.getSupplyChainList();

        assert.equal(supplyChains.names.length, 1);
        assert.notEqual(supplyChains.names[0], "");
        assert.equal(supplyChains.names[0], "MyName");

        assert.equal(supplyChains.addresses.length, 1);
        assert.notEqual(supplyChains.addresses[0], emptyAddress);
      });
    });

    describe("Non-owner does not add supply chain", function () {
      it("Should have an owner equal to the deployer", async function () {
        await catchRevert(supplyChainFactoryInstance.addSupplyChain('MyName', 'test', 10, { from: accounts[1] }));
      });
    });
  });
});
