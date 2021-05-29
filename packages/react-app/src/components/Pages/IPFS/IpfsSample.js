import React, { useEffect, useState } from "react";
import { Row, Col, Input, Button, Spin } from "antd";
import { useContractLoader, useContractReader } from "../../../hooks";
import { Address } from "../../";
import { Transactor } from "../../../helpers";

const ipfsAPI = require("ipfs-http-client");
const ipfs = ipfsAPI({
  host: "ipfs.infura.io",
  port: "5001",
  protocol: "https",
});

export default function IpfsSample(props) {
  const { TextArea } = Input;
  const { BufferList } = require("bl");
  console.log(props.readContracts);
  const myAttestation = useContractReader(
    props.readContracts,
    "Attestor",
    "attestations",
    [props.address],
    1777
  );

  const [data, setData] = useState();
  const [sending, setSending] = useState();
  const [loading, setLoading] = useState();
  const [ipfsHash, setIpfsHash] = useState();
  const [ipfsContents, setIpfsContents] = useState();
  const [attestationContents, setAttestationContents] = useState();

  const tx = Transactor(props.injectedProvider, props.gasPrice);
  const asyncGetFile = async () => {
    let result = await getFromIPFS(ipfsHash);
    setIpfsContents(result.toString());
  };

  useEffect(() => {
    if (ipfsHash) asyncGetFile();
  }, [ipfsHash]);

  let ipfsDisplay = "";
  if (ipfsHash) {
    if (!ipfsContents) {
      ipfsDisplay = <Spin />;
    } else {
      ipfsDisplay = (
        <pre
          style={{
            margin: 8,
            padding: 8,
            border: "1px solid #dddddd",
            backgroundColor: "#ededed",
          }}
        >
          {ipfsContents}
        </pre>
      );
    }
  }

  const asyncGetAttestation = async () => {
    let result = await getFromIPFS(myAttestation);
    setAttestationContents(result.toString());
  };

  useEffect(() => {
    if (myAttestation) asyncGetAttestation();
  }, [myAttestation]);

  let attestationDisplay = "";
  if (myAttestation) {
    if (!attestationContents) {
      attestationDisplay = <Spin />;
    } else {
      attestationDisplay = (
        <div>
          <Address value={props.address} /> attests to:
          <pre
            style={{
              margin: 8,
              padding: 8,
              border: "1px solid #dddddd",
              backgroundColor: "#ededed",
            }}
          >
            {attestationContents}
          </pre>
        </div>
      );
    }
  }
  const getFromIPFS = async (hashToGet) => {
    for await (const file of ipfs.get(hashToGet)) {
      console.log(file.path);
      if (!file.content) continue;
      const content = new BufferList();
      for await (const chunk of file.content) {
        content.append(chunk);
      }
      console.log(content);
      return content;
    }
  };

  const addToIPFS = async (fileToUpload) => {
    for await (const result of ipfs.add(fileToUpload)) {
      return result;
    }
  };

  return (
    <div>
      <div
        style={{
          position: "fixed",
          textAlign: "right",
          right: 0,
          top: 0,
          padding: 10,
        }}
      ></div>

      <div style={{ padding: 32, textAlign: "left" }}>
        Enter a bunch of data:
        <TextArea
          rows={10}
          value={data}
          onChange={(e) => {
            setData(e.target.value);
          }}
        />
        <Button
          style={{ margin: 8 }}
          loading={sending}
          size="large"
          shape="round"
          type="primary"
          onClick={async () => {
            console.log("UPLONG...");
            setSending(true);
            setIpfsHash();
            setIpfsContents();
            const result = await addToIPFS(data);
            if (result && result.path) {
              setIpfsHash(result.path);
            }
            setSending(false);
            console.log("RESULT:", result);
          }}
        >
          Upload to IPFS
        </Button>
      </div>

      <div style={{ padding: 32, textAlign: "left" }}>
        IPFS Hash:{" "}
        <Input
          value={ipfsHash}
          onChange={(e) => {
            setIpfsHash(e.target.value);
          }}
        />
        {ipfsDisplay}
        <Button
          disabled={!ipfsHash}
          style={{ margin: 8 }}
          size="large"
          shape="round"
          type="primary"
          onClick={async () => {
            tx(props.writeContracts["Attestor"].attest(ipfsHash));
          }}
        >
          Attest to this hash on Ethereum
        </Button>
      </div>

      <div style={{ padding: 32, textAlign: "left" }}>{attestationDisplay}</div>
    </div>
  );
}
