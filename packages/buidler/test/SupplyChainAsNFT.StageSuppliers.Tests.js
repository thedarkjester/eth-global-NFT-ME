const { catchRevert } = require("./exceptionsHelper");

const { emptyAddress } = require("./sharedFunctions");

const SupplyChainAsNFT = artifacts.require("SupplyChainAsNFT");

describe("SupplyChainAsNFT:StageSuppliers tests", function () {
  let accounts;
  let contractOwner;
  let signatoryA;
  let signatoryB;
  let signatoryC;
  let signatoryD;
  let supplierA;
  let supplierB;
  let supplierC;
  let supplierD;
  let supplierE;
  let supplyChainAsNFTInstance;

  before(async function () {
    accounts = await web3.eth.getAccounts();
    contractOwner = accounts[0];
    signatoryA = accounts[1];
    signatoryB = accounts[2];
    signatoryC = accounts[3];
    signatoryD = accounts[4];
    supplierA = accounts[5];
    supplierB = accounts[6];
    supplierC = accounts[7];
    supplierD = accounts[8];
    supplierE = accounts[9];

    supplyChainAsNFTInstance = await SupplyChainAsNFT.new("test", "test", contractOwner, {
      from: contractOwner,
    });

    await supplyChainAsNFTInstance.addStage("1");
    await supplyChainAsNFTInstance.addStage("2");
    await supplyChainAsNFTInstance.addStage("3");
  });

  describe("addStageSupplier", function () {
    describe("checks common assertions for function", async function () {
      it("fails trying to use an out of bounds stage (0 || > 3)", async function () {
        await catchRevert(
          supplyChainAsNFTInstance.addStageSupplier(0, supplierA)
        );
        await catchRevert(
          supplyChainAsNFTInstance.addStageSupplier(4, supplierA)
        );
      });
    });

    describe("initial stage checks", async function () {
      it("fails on stage 1 if not default admin role", async function () {
        await catchRevert(
          supplyChainAsNFTInstance.addStageSupplier(1, supplierA, {
            from: signatoryA,
          })
        );
      });

      it("default admin role can set stage 1 supplier", async function () {
        await supplyChainAsNFTInstance.addStageSupplier(1, supplierA, {
          from: contractOwner,
        });
      });
    });

    describe("handles checking signatories before adding", async function () {
      before(async function () {
        await supplyChainAsNFTInstance.addStageSignatory(1, signatoryA, {
          from: contractOwner,
        });
        await supplyChainAsNFTInstance.addStageSignatory(2, signatoryB, {
          from: contractOwner,
        });
        await supplyChainAsNFTInstance.addStageSignatory(2, signatoryC, {
          from: contractOwner,
        });
        await supplyChainAsNFTInstance.addStageSignatory(3, signatoryD, {
          from: contractOwner,
        });
      });

      it("fails when adding supplier for subsequent stage that is not the owner signatory from the previous stage", async function () {
        await catchRevert(
          supplyChainAsNFTInstance.addStageSupplier(2, supplierB, {
            from: signatoryC,
          })
        );
      });
    });

    describe("tests happy path functionality", () => {
      it("allows previous stage signatory to set supplier on next stage", async function () {
        await supplyChainAsNFTInstance.addStageSupplier(2, supplierB, {
          from: contractOwner,
        });

        await supplyChainAsNFTInstance.addStageSupplier(2, supplierC, {
          from: contractOwner,
        });

        await supplyChainAsNFTInstance.addStageSupplier(3, supplierD, {
          from: contractOwner,
        });

        await supplyChainAsNFTInstance.addStageSupplier(3, supplierE, {
          from: contractOwner,
        });
      });

      it("retrieve suppliers at each stage", async function () {
        var stage1Suppliers = await supplyChainAsNFTInstance.getStageSuppliers(
          1
        );
        assert.equal(stage1Suppliers.length, 1);
        assert.equal(stage1Suppliers[0], supplierA);

        var stage2Suppliers = await supplyChainAsNFTInstance.getStageSuppliers(
          2
        );
        assert.equal(stage2Suppliers.length, 2);
        assert.equal(stage2Suppliers[0], supplierB);
        assert.equal(stage2Suppliers[1], supplierC);

        var stage3Suppliers = await supplyChainAsNFTInstance.getStageSuppliers(
          3
        );
        assert.equal(stage3Suppliers.length, 2);
        assert.equal(stage3Suppliers[0], supplierD);
        assert.equal(stage3Suppliers[1], supplierE);
      });
    });
  });
});
