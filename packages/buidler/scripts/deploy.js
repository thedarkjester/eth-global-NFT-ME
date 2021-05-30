const fs = require("fs");
const chalk = require("chalk");
async function main() {
  console.log("📡 Deploy \n");
  // auto deploy to read contract directory and deploy them all (add ".args" files for arguments)
  //await autoDeploy();
  // OR
  // custom deploy (to use deployed addresses dynamically for example:)
  const supplyChainFactory = await deploy("SupplyChainFactory");
  const attestor = await deploy("Attestor");

  //const smartContractWallet = await deploy("SmartContractWallet",[exampleToken.address,examplePriceOracle.address])
  await supplyChainFactory.grantRole(
    "0x00",
    "0xFA6443D6F6Cb53e195D41038D4c42D5c0dE7988B"
  );
  await supplyChainFactory.grantRole(
    "0x00",
    "0xeeB25D90d4aA5c9e3aC6BB00ecE55C23076Ea3b2"
  );
  // await supplyChainFactory.addSupplyChain("one", "ONE", 1000);
}
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

async function deploy(name, _args) {
  let args = [];
  if (_args) {
    args = _args;
  }
  console.log("📄 " + name);
  const contractArtifacts = artifacts.require(name);
  const contract = await contractArtifacts.new(...args);
  console.log(
    chalk.cyan(name),
    "deployed to:",
    chalk.magenta(contract.address)
  );
  fs.writeFileSync("artifacts/" + name + ".address", contract.address);
  console.log("\n");
  return contract;
}

async function autoDeploy() {
  let contractList = fs.readdirSync("./contracts");
  for (let c in contractList) {
    if (
      contractList[c].indexOf(".sol") >= 0 &&
      contractList[c].indexOf(".swp.") < 0
    ) {
      const name = contractList[c].replace(".sol", "");
      let args = [];
      try {
        const argsFile = "./contracts/" + name + ".args";
        if (fs.existsSync(argsFile)) {
          args = JSON.parse(fs.readFileSync(argsFile));
        }
      } catch (e) {
        console.log(e);
      }
      await deploy(name, args);
    }
  }
}
