import React, { useState, useEffect } from "react";
import { EuiFlexGroup, EuiFlexItem, EuiButton } from "@elastic/eui";

import { Upload, message, Button } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { ethers } from "ethers";
import { abi } from "../../../constants";

import { Transactor } from "../../../helpers";

const ipfsAPI = require("ipfs-http-client");
const ipfs = ipfsAPI({
  host: "ipfs.infura.io",
  port: "5001",
  protocol: "https",
});

async function loadTokenStageDocumentHashes(nftContract, tokenId, stageId) {
  return nftContract.getTokenStageDocuments(tokenId, stageId);
}

const { BufferList } = require("bl");

const toBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });

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

async function loadFiles(nftContract, tokenId, stageId) {
  const response = await loadTokenStageDocumentHashes(
    nftContract,
    tokenId,
    stageId
  );
  const filesFromIPFSWork = response.map((hash) => {
    return getFromIPFS(hash);
  });
  return await Promise.all(filesFromIPFSWork);
}

export default function StageView(props) {
  const nftContract = new ethers.Contract(
    props.contractAddress,
    abi,
    props.injectedProvider.getSigner()
  );

  const [data, setData] = useState();
  const [sending, setSending] = useState();
  const [ipfsHash, setIpfsHash] = useState();
  const [ipfsContents, setIpfsContents] = useState();
  const [files, setFiles] = useState([]);

  useEffect(() => {
    async function load() {
      const filesFromIPFSResult = await loadFiles(
        nftContract,
        props.tokenId,
        props.selectedStage.id
      );
      setFiles(filesFromIPFSResult);
    }
    load();
  }, []);

  const tx = Transactor(props.injectedProvider, props.gasPrice);
  const asyncGetFile = async () => {
    let result = await getFromIPFS(ipfsHash);
    setIpfsContents(result.toString());
  };

  useEffect(() => {
    if (ipfsHash) asyncGetFile();
  }, [ipfsHash]);

  const addToIPFS = async (fileToUpload) => {
    for await (const result of ipfs.add(fileToUpload)) {
      return result;
    }
  };

  const handleFileSelection = async (e) => {
    const fileData = await toBase64(e.target.files[0]);
    setData(fileData);
  };

  useEffect(() => {
    async function l() {
      if (!ipfsHash) return;
      const content = await getFromIPFS(ipfsHash);
      setIpfsContents(content);
    }
    l();
  }, []);

  return (
    <>
      {props.selectedStage.supplierAddr}{" "}
      <EuiFlexGroup>
        <EuiFlexItem>
          <label for="myfile">Select a file:</label>
          <input
            type="file"
            id="myfile"
            name="myfile"
            onChange={handleFileSelection}
          />
        </EuiFlexItem>
        <EuiFlexItem>
          <EuiButton
            color="primary"
            onClick={async () => {
              setSending(true);
              const result = await addToIPFS(data);

              if (result && result.path) {
                props.tx(
                  nftContract.addTokenStageDocument(
                    props.tokenId,
                    props.selectedStage.id,
                    result.path
                  )
                );

                setTimeout(async () => {
                  const response = await loadFiles(
                    nftContract,
                    props.tokenId,
                    props.selectedStage.id
                  );
                  setFiles(response);
                }, 4000);
              }
              setSending(false);
            }}
          >
            Upload
          </EuiButton>

          {/** @TODO RYAN style these nicely */}
          {files.map((file) => (
            <p>
              <img src={file} />
            </p>
          ))}
        </EuiFlexItem>
      </EuiFlexGroup>
    </>
  );
}
