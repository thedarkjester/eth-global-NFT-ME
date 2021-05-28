import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom";

import "antd/dist/antd.css";
import { ethers } from "ethers";
import "./App.css";
import { Row, Col, Input, Button, Spin } from "antd";
import { EuiBottomBar } from "@elastic/eui";

import { Transactor } from "./helpers";
import {
  useExchangePrice,
  useGasPrice,
  useContractLoader,
  useContractReader,
} from "./hooks";
import {
  Header,
  Account,
  Provider,
  Faucet,
  Ramp,
  Address,
  Contract,
} from "./components";
import MainSupplyChain from "./components/Pages/SupplyChain/MainSupplyChain";
import IpfsSample from "./components/Pages/IPFS/IpfsSample";

const mainnetProvider = new ethers.providers.InfuraProvider(
  "mainnet",
  "2717afb6bf164045b5d5468031b93f87"
);
const localProvider = new ethers.providers.JsonRpcProvider(
  process.env.REACT_APP_PROVIDER
    ? process.env.REACT_APP_PROVIDER
    : "http://localhost:8545"
);

function App() {
  const [address, setAddress] = useState();
  const [injectedProvider, setInjectedProvider] = useState();
  const price = useExchangePrice(mainnetProvider);
  const gasPrice = useGasPrice("fast");

  const tx = Transactor(injectedProvider, gasPrice);

  const readContracts = useContractLoader(localProvider);
  const writeContracts = useContractLoader(injectedProvider);

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
          price={price}
        />
      </Header>

      <Router>
        {/* A <Switch> looks through its children <Route>s and
            renders the first one that matches the current URL. */}
        <Switch>
          <Route path="/supply-chain">
            <MainSupplyChain />
          </Route>
          <Route path="/ipfs">
            {
              <IpfsSample
                injectedProvider={injectedProvider}
                gasPrice={gasPrice}
                address={address}
                readContracts={readContracts}
                writeContracts={writeContracts}
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

      {/*<div style={{padding:64,textAlign: "left"}}>
        <Contract
          name={"Attestor"}
          provider={injectedProvider}
          address={address}
        />
      </div>*/}
      <EuiBottomBar style={{ backgroundColor: "#fff" }}>
        <div
          style={{
            bottom: 10,
            padding: 5,
          }}
        >
          <Row align="middle" gutter={4}>
            <Col span={10}>
              <Provider name={"mainnet"} provider={mainnetProvider} />
            </Col>
            <Col span={6}>
              <Provider name={"local"} provider={localProvider} />
            </Col>
            <Col span={8}>
              <Provider name={"injected"} provider={injectedProvider} />
            </Col>
          </Row>
        </div>
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
