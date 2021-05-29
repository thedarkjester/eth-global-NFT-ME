import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom";

import "antd/dist/antd.css";
import { ethers } from "ethers";
import "./App.css";
import { Row, Col } from "antd";
import { EuiBottomBar } from "@elastic/eui";

import { Transactor } from "./helpers";
import {
  useGasPrice,
  useContractLoader,
  useContractReader,
  useEventListener,
  useExchangePrice,
} from "./hooks";
import {
  Header,
  Account,
  Provider,
  Faucet,
  Ramp,
  Contract,
} from "./components";
import MainSupplyChain from "./components/Pages/SupplyChain/MainSupplyChain";
import MainContract from "./components/Pages/Contract/MainContract";
import IpfsSample from "./components/Pages/IPFS/IpfsSample";

const mainnetProvider = new ethers.providers.JsonRpcProvider(
  "http://localhost:8545/"
);
// const mainnetProvider = new ethers.providers.InfuraProvider(
//   "mainnet",
//   "2717afb6bf164045b5d5468031b93f87"
// );
const localProvider = new ethers.providers.JsonRpcProvider(
  process.env.REACT_APP_PROVIDER
    ? process.env.REACT_APP_PROVIDER
    : "http://localhost:8545"
);

export const factoryContract = "SupplyChainFactory";

console.log("providers", mainnetProvider, localProvider);
function App() {
  const [address, setAddress] = useState();
  const [injectedProvider, setInjectedProvider] = useState();
  const price = 90000000000;
  const gasPrice = useGasPrice("fast");

  const tx = Transactor(injectedProvider, gasPrice);
  console.log(">>>> ", injectedProvider);
  const readContracts = useContractLoader(injectedProvider);
  const writeContracts = useContractLoader(injectedProvider);

  console.log("READ, WRITE CONTRACTS", readContracts, writeContracts);

  const newSupplyChainEvents = useEventListener(
    readContracts,
    factoryContract,
    "SupplyChainCreated",
    localProvider,
    1
  );

  return (
    <div className="App">
      <Header>
        <Account
          address={address}
          setAddress={setAddress}
          localProvider={localProvider}
          injectedProvider={injectedProvider}
          setInjectedProvider={setInjectedProvider}
          mainnetProvider={mainnetProvider}
        />
      </Header>

      <Router>
        <Switch>
          <Route path="/supply-chain">
            <MainSupplyChain
              readContracts={readContracts}
              writeContracts={writeContracts}
              newSupplyChainEvents={newSupplyChainEvents}
              tx={tx}
              userAddress={address}
            />
          </Route>
          <Route path="/contract/:address">
            <MainContract
              readContracts={readContracts}
              writeContracts={writeContracts}
              newSupplyChainEvents={newSupplyChainEvents}
              tx={tx}
              localProvider={localProvider}
              mainnetProvider={mainnetProvider}
              userAddress={address}
              injectedProvider={injectedProvider}
            />
          </Route>
          <Route path="/ipfs">
            {
              <IpfsSample
                injectedProvider={injectedProvider}
                gasPrice={gasPrice}
                userAddress={address}
                readContracts={readContracts}
                writeContracts={writeContracts}
                tx={tx}
              />
            }
          </Route>
          <Route path="/">{/* <Home /> */}</Route>
        </Switch>
      </Router>

      <div
        style={{
          position: "fixed",
          textAlign: "right",
          right: 0,
          top: 0,
          padding: 10,
        }}
      ></div>

      <EuiBottomBar style={{ backgroundColor: "#fff" }}>
        <div
          style={{
            bottom: 10,
            padding: 5,
          }}
        >
          <Row align="middle" gutter={4}>
            <Col span={9}>
              <Ramp price={price} address={address} />
            </Col>
            <Col span={15}>
              <Faucet localProvider={localProvider} price={price} />
            </Col>
          </Row>
        </div>
      </EuiBottomBar>
    </div>
  );
}

export default App;
