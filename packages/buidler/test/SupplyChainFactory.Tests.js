const {
  catchRevert
} = require("./exceptionsHelper");

const SupplyChainFactory = artifacts.require("SupplyChainFactory");
const SupplyChainAsNFT = artifacts.require("SupplyChainAsNFT");

describe("SupplyChainFactory tests", function () {
  let accounts;
  let supplyChainFactoryInstance;
  before(async function () {
    accounts = await web3.eth.getAccounts();
  });
  describe("Deployment and ownership", function () {

    it("Should deploy my SupplyChainFactory", async function () {
      supplyChainFactoryInstance = await SupplyChainFactory.new();
    });

    describe("in owner role", function () {
      it("Should have an owner equal to the deployer", async function () {
        assert.isFalse(await supplyChainFactoryInstance.hasRole('0x00', accounts[1]));
      });
    });

    describe("not in owner role", function () {
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
      it("Should have an owner equal to the deployer", async function () {
        let txResponse = await supplyChainFactoryInstance.addSupplyChain('MyName', 'test', 10);

        let supplyChains = await supplyChainFactoryInstance.getSupplyChainList();

        console.log(supplyChains);
      });
    });

    describe("Non-owner does not add supply chain", function () {
      it("Should have an owner equal to the deployer", async function () {
        await catchRevert(supplyChainFactoryInstance.addSupplyChain('MyName', 'test', 10, { from: accounts[1] }));
      });
    });
  });
});
