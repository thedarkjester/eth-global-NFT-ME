const { catchRevert } = require("./exceptionsHelper");

const { emptyAddress } = require("./sharedFunctions");

const SupplyChainAsNFT = artifacts.require("SupplyChainAsNFT");

describe("SupplyChainAsNFT:TokenStageDocuments tests", function () {
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

    supplyChainAsNFTInstance = await SupplyChainAsNFT.new(
      "test",
      "test",
      contractOwner,
      {
        from: contractOwner,
      }
    );

    await supplyChainAsNFTInstance.addStage("1");
    await supplyChainAsNFTInstance.addStage("2");
    await supplyChainAsNFTInstance.addStage("3");

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

    await supplyChainAsNFTInstance.addStageSupplier(1, supplierA, {
      from: contractOwner,
    });

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

    await supplyChainAsNFTInstance.mint(contractOwner);
  });

  describe("addTokenStageDocument", function () {
    describe("checks common assertions for function", async function () {
      it("fails trying to use an out of bounds stage (0 || > 3)", async function () {
        await catchRevert(
          supplyChainAsNFTInstance.addTokenStageDocument(1, 0, "SOME_HASH", {
            from: supplierA,
          })
        );
        await catchRevert(
          supplyChainAsNFTInstance.addTokenStageDocument(1, 4, "SOME_HASH", {
            from: supplierA,
          })
        );
      });
    });

    describe("checks during process", async function () {
      it("fails trying to use first stage which has not started", async function () {
        await catchRevert(
          supplyChainAsNFTInstance.addTokenStageDocument(1, 1, "SOME_HASH", {
            from: supplierA,
          })
        );
      });

      it("fails trying to use second stage which has not started", async function () {
        await catchRevert(
          supplyChainAsNFTInstance.addTokenStageDocument(1, 2, "SOME_HASH", {
            from: supplierB,
          })
        );
      });

      it("fails trying to use incorrect supplier for initial stage", async function () {
        await catchRevert(
          supplyChainAsNFTInstance.addTokenStageDocument(1, 1, "SOME_HASH", {
            from: supplierD,
          })
        );
      });

      it("succeeds now that the token stage has started", async function () {
        await supplyChainAsNFTInstance.startStage(
          1,
          1,
          supplierA,
          signatoryA,
          0,
          {
            from: contractOwner,
          }
        );
        const hash1Tx = await supplyChainAsNFTInstance.addTokenStageDocument(
          1,
          1,
          "SOME_HASH:1",
          {
            from: supplierA,
          }
        );

        const { logs: hash1Logs } = hash1Tx;
        assert.ok(Array.isArray(hash1Logs));
        assert.equal(hash1Logs.length, 1);

        const hash1Log = hash1Logs[0];
        assert.equal(hash1Log.event, "TokenStageDocumentAdded");
        assert.equal(hash1Log.args.token.toString(), "1");
        assert.equal(hash1Log.args.stage.toString(), "1");
        assert.equal(hash1Log.args.documentHash.toString(), "SOME_HASH:1");

        const hash2Added = await supplyChainAsNFTInstance.addTokenStageDocument(
          1,
          1,
          "SOME_HASH:2",
          {
            from: supplierA,
          }
        );
        // not checking for second emit event as already tested above
      });

      it("finds added documents to stage 1 for token 1", async function () {
        const stageDocuments =
          await supplyChainAsNFTInstance.getTokenStageDocuments(1, 1);
        assert(stageDocuments.length, 2);
        assert(stageDocuments[0], "SOME_HASH:1");
        assert(stageDocuments[1], "SOME_HASH:2");
      });

      it("fails adding documents to completed stage 1 for token 1", async function () {
        await supplyChainAsNFTInstance.startStage(
          1,
          2,
          supplierB,
          signatoryB,
          0,
          {
            from: signatoryA,
          }
        );
        const hash1Tx = await catchRevert(
          supplyChainAsNFTInstance.addTokenStageDocument(1, 1, "SOME_HASH:1")
        );
        assert(!hash1Tx);
      });
    });
  });
});
