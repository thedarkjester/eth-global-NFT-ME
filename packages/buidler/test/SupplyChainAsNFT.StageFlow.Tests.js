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
      supplyChainAsNFTInstance = await SupplyChainAsNFT.new("test", "test", accounts[0]);
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
        await supplyChainAsNFTInstance.addStageSignatory(1, accounts[8]);
      });

      it("adds suppliers at stage 1", async function () {
        await supplyChainAsNFTInstance.addStageSupplier(1, accounts[7]);
      });

      it("adds signatory at stage 2", async function () {
        await supplyChainAsNFTInstance.addStageSignatory(2, accounts[8]);
      });

      it("adds suppliers at stage 2", async function () {
        await supplyChainAsNFTInstance.addStageSupplier(2, accounts[7]);
      });

      it("Fails to start stage 2 if supplier not in list", async function () {
        await catchRevert(supplyChainAsNFTInstance.startStage(1, 2, accounts[2], accounts[3], 10000000));
      });

      it("Fails to start stage 2 if signatory not in list", async function () {
        await catchRevert(supplyChainAsNFTInstance.startStage(1, 2, accounts[3], accounts[2], 10000000));
      });

      it("Fails to start stage two if not a signatory", async function () {
        await catchRevert(supplyChainAsNFTInstance.startStage(1, 2, accounts[3], accounts[3], 10000000));
      });

      it("Starts stage 2 and completed stage 1", async function () {
        let stageState = await supplyChainAsNFTInstance.getTokenStageState(1, 1);

        await supplyChainAsNFTInstance.startStage(1, 2, accounts[3], accounts[3], 10000000, { from: accounts[2] });

        stageState = await supplyChainAsNFTInstance.getTokenStageState(1, 1);
      });

      it("Fails to start next stage without paying the fee", async function () {
        await catchRevert(supplyChainAsNFTInstance.startStage(1, 3, accounts[4], accounts[4], 10000000, { from: accounts[3] }));
      });

      it("Fails to start next stage with paying partially", async function () {
        await catchRevert(supplyChainAsNFTInstance.startStage(1, 3, accounts[4], accounts[4], 10000000, { from: accounts[3], value: 1000000 }));
      });

      it("Fails to start next stage with overpaying", async function () {
        await catchRevert(supplyChainAsNFTInstance.startStage(1, 3, accounts[4], accounts[4], 10000000, { from: accounts[3], value: 100000000 }));
      });

      it("Starts stage 3, and completes 2 and increments supplier balance", async function () {
        await supplyChainAsNFTInstance.startStage(1, 3, accounts[4], accounts[4], 10000000, { from: accounts[3], value: 10000000 });

        balance = await supplyChainAsNFTInstance.OwedBalances(accounts[3]);

        assert.equal(balance, 10000000);
      });

      it("Starts stage 4, and completes 3 and increments supplier balance", async function () {
        await supplyChainAsNFTInstance.startStage(1, 4, accounts[5], accounts[5], 10000000, { from: accounts[4], value: 10000000 });

        balance = await supplyChainAsNFTInstance.OwedBalances(accounts[4]);

        assert.equal(balance, 10000000);
      });

      it("Starts stage 5, and completes 4 and increments supplier balance", async function () {
        await supplyChainAsNFTInstance.startStage(1, 5, accounts[6], accounts[6], 10000000, { from: accounts[5], value: 10000000 });

        balance = await supplyChainAsNFTInstance.OwedBalances(accounts[5]);

        assert.equal(balance, 10000000);
      });

      it("Fails to finalise stage 5 with missing signatory", async function () {
        await catchRevert(supplyChainAsNFTInstance.completeFinalStage(1, 5, { from: accounts[5], value: 10000000 }));
      });

      it("Fails to finalise stage 5 with missing fee", async function () {
        await catchRevert(supplyChainAsNFTInstance.completeFinalStage(1, 5, { from: accounts[6] }));
      });

      it("Fails to finalise stage 5 with partial fee", async function () {
        await catchRevert(supplyChainAsNFTInstance.completeFinalStage(1, 5, { from: accounts[6], value: 1000000 }));
      });

      it("Fails to finalise stage 5 with overpayment", async function () {
        await catchRevert(supplyChainAsNFTInstance.completeFinalStage(1, 5, { from: accounts[6], value: 100000000 }));
      });

      it("Fails to transfer token if final stage is not complete", async function () {
        let stageState = await supplyChainAsNFTInstance.getTokenStageState(1, 5);

        await catchRevert(supplyChainAsNFTInstance.transferFrom(accounts[0], accounts[2], 1));
      });

      it("Fails to burn", async function () {
        await catchRevert(supplyChainAsNFTInstance.burn(1));
      });

      it("returns getSupplierView view", async function () {
        var view = await supplyChainAsNFTInstance.getSupplierView({ from: accounts[6] });

        assert.equal(1, view.length);
        assert.equal(1, view[0].token);
        assert.equal(5, view[0].stage);
        assert.equal(10000000, view[0].supplierFee);
      });

      it("returns getSignatoryView view", async function () {
        var view = await supplyChainAsNFTInstance.getSignatoryView({ from: accounts[6] });
        assert.equal(1, view.length);
        assert.equal(1, view[0].token);
        assert.equal(5, view[0].stage);
        assert.equal(10000000, view[0].supplierFee);
      });

      it("Finalises stage 5 and updates supplier balance", async function () {
        await supplyChainAsNFTInstance.completeFinalStage(1, 5, { from: accounts[6], value: 10000000 });

        balance = await supplyChainAsNFTInstance.OwedBalances(accounts[5]);

        assert.equal(balance, 10000000);
      });

      it("Supplier can withdraw balance", async function () {
        await supplyChainAsNFTInstance.withdraw({ from: accounts[5] });

        balance = await supplyChainAsNFTInstance.OwedBalances(accounts[5]);

        assert.equal(balance, 0);
      });

      it("Transfers token if final stage is complete", async function () {
        await supplyChainAsNFTInstance.transferFrom(accounts[0], accounts[2], 1);
      });
    });
  });
});
