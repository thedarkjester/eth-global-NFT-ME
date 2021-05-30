import React, { useState, useEffect } from "react";
import {
  EuiFlexGroup,
  EuiFlexItem,
  EuiButton,
  EuiLoadingSpinner,
} from "@elastic/eui";

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
  const filesFromIPFSWork = response.map(async (hash) => {
    const result = await getFromIPFS(hash);
    return { data: result, hash };
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
  const [isLoading, setLoading] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const filesFromIPFSResult = await loadFiles(
        nftContract,
        props.tokenId,
        props.selectedStage.id
      );
      setFiles(filesFromIPFSResult);
      setLoading(false);
    }
    load();
  }, [props.selectedStage.id]);

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
    <EuiFlexGroup>
      {props.stageIsComplete ? null : (
        <EuiFlexItem>
          <EuiFlexItem>
            <label for="myfile">Select a file:</label>
            <input
              disabled={!props.stageHasStarted}
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

                  setLoading(true);
                  setTimeout(async () => {
                    const response = await loadFiles(
                      nftContract,
                      props.tokenId,
                      props.selectedStage.id
                    );
                    setFiles(response);
                    setLoading(false);
                  }, 4000);
                }
                setSending(false);
              }}
            >
              Upload
            </EuiButton>
          </EuiFlexItem>
        </EuiFlexItem>
      )}
      <EuiFlexItem>
        {/** @TODO RYAN style these nicely */}
        {isLoading ? (
          <>
            <EuiLoadingSpinner size="xl" /> Loading...
          </>
        ) : (
          files.map((file) => (
            <p>
              <p>{file.hash}</p>
              <img src={file.data} />
            </p>
          ))
        )}
      </EuiFlexItem>
    </EuiFlexGroup>
  );
}
