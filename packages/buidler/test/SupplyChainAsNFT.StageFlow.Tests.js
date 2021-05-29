const {
  catchRevert
} = require("./exceptionsHelper");

const {
  emptyAddress
} = require("./sharedFunctions");

const SupplyChainAsNFT = artifacts.require("SupplyChainAsNFT");

describe("SupplyChainAsNFT:StageStarting tests", function () {
  let accounts;
  let supplyChainAsNFTInstance;

  before(async function () {
    accounts = await web3.eth.getAccounts();
  });
  describe("Deploying", function () {

    it("Should deploy my SupplyChainAsNFT", async function () {
      supplyChainAsNFTInstance = await SupplyChainAsNFT.new("test", "test");
    });

    describe("Starting stages", function () {
      it("Adds a stage", async function () {
        await supplyChainAsNFTInstance.addStage("wow");
      });
      it("Adds a stage", async function () {
        await supplyChainAsNFTInstance.addStage("wee");
      });
      it("Adds a stage", async function () {
        await supplyChainAsNFTInstance.addStage("man");
      });
      it("Adds a stage", async function () {
        await supplyChainAsNFTInstance.addStage("this");
      });
      it("Adds a stage", async function () {
        await supplyChainAsNFTInstance.addStage("wirks");
      });

      it("fails to start stage with no signers", async function () {
        await catchRevert(supplyChainAsNFTInstance.startStage(1, 1, accounts[1], accounts[2], 0));
      })

      it("Adds adds a signatory at stage 1", async function () {
        await supplyChainAsNFTInstance.addStageSignatory(1, accounts[2]);
      });

      it("fails to start stage with no suppliers", async function () {
        await catchRevert(supplyChainAsNFTInstance.startStage(1, 1, accounts[1], accounts[2], 0));
      })

      it("Adds adds a supplier at stage 1", async function () {
        await supplyChainAsNFTInstance.addStageSupplier(1, accounts[3]);
      });

      it("fails to start stage with no token", async function () {
        await catchRevert(supplyChainAsNFTInstance.startStage(1, 1, accounts[1], accounts[2], 0));
      })

      it("fails to start when supplier not in list", async function () {
        await catchRevert(supplyChainAsNFTInstance.startStage(1, 1, accounts[1], accounts[2], 0));
      });

      it("fails to start when signatory not in list", async function () {
        await catchRevert(supplyChainAsNFTInstance.startStage(1, 1, accounts[2], accounts[2], 0));
      });

      it("Fails to start missing suppliers for each stage", async function () {
        await catchRevert(supplyChainAsNFTInstance.startStage(1, 1, accounts[3], accounts[2], 0));
      });

      it("adds suppliers for each stage", async function () {
        await supplyChainAsNFTInstance.addStageSupplier(2, accounts[3]);
        await supplyChainAsNFTInstance.addStageSupplier(3, accounts[4]);
        await supplyChainAsNFTInstance.addStageSupplier(4, accounts[5]);
        await supplyChainAsNFTInstance.addStageSupplier(5, accounts[6]);
      });

      it("Fails to start missing signatories for each stage", async function () {
        await catchRevert(supplyChainAsNFTInstance.startStage(1, 1, accounts[3], accounts[2], 0));
      });

      it("adds signatories for each stage", async function () {
        await supplyChainAsNFTInstance.addStageSignatory(2, accounts[3]);
        await supplyChainAsNFTInstance.addStageSignatory(3, accounts[4]);
        await supplyChainAsNFTInstance.addStageSignatory(4, accounts[5]);
        await supplyChainAsNFTInstance.addStageSignatory(5, accounts[6]);
      });

      it("mints once", async function () {
        await supplyChainAsNFTInstance.mint(accounts[0]);
      });

      it("fails for nonOwner starting stage 1", async function () {
        await catchRevert(supplyChainAsNFTInstance.startStage(1, 1, accounts[3], accounts[2], 0, { from: accounts[2] }));
      });

      it("Starts stage at 1", async function () {
        await supplyChainAsNFTInstance.startStage(1, 1, accounts[3], accounts[2], 0);
      });

      it("fails to restart stage at 1", async function () {
        await catchRevert(supplyChainAsNFTInstance.startStage(1, 1, accounts[3], accounts[2], 0));
      });

      it("adds signatory at stage 1", async function () {
        await supplyChainAsNFTInstance.addStageSignatory(5, accounts[7]);
      });

      it("adds suppliers at stage 1", async function () {
        await supplyChainAsNFTInstance.addStageSupplier(5, accounts[7]);
      });
    });
  });
});
