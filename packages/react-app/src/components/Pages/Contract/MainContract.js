import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  EuiText,
  EuiForm,
  EuiFormRow,
  EuiButton,
  EuiFlexGroup,
  EuiFlexItem,
  EuiFieldText,
  EuiSpacer,
  EuiBasicTable,
  EuiLink,
} from "@elastic/eui";
//import SipplyChainAsNFT ABI
import { abi } from "../../../constants";
import Container from "../../../components/Styled/Container";

import { ethers } from "ethers";

export default function MainContract(props) {
  const { userAddress, tx, injectedProvider, writeContracts } = props;
  const [data, setData] = useState({});
  const [stages, setStages] = useState([]);

  const { address } = useParams();

  const nftContract = new ethers.Contract(
    address,
    abi,
    injectedProvider.getSigner()
  );
  useEffect(() => {
    async function getStages() {
      return await nftContract.getStages();
    }
    getStages().then((i) => {
      // const names = i.names;
      // const address = i.addresses;
      const tableFormat = [];
      for (let x = 0; x < i.length; x++) {
        const d = { name: i[x] };
        tableFormat.push(d);
      }
      setStages(tableFormat);
    });
  }, []);
  if (!injectedProvider) return "loading";

  const columns = [
    {
      field: "name",
      name: "Name",
      sortable: true,
      truncateText: false,
      render: (item) => <span>{item}</span>,
    },
    {
      field: "address",
      name: "Address",
      truncateText: false,
      render: (item) => <EuiLink href={`/contract/${item}`}>{item}</EuiLink>,
    },
  ];

  return (
    <div>
      <EuiSpacer />
      <EuiText>NFT Contract: {address}</EuiText>
      <Container>
        <EuiFlexGroup>
          <EuiFlexItem>
            <EuiForm component="form">
              <EuiFormRow>
                <EuiText>New Stage</EuiText>
              </EuiFormRow>
              <EuiFormRow label="Name">
                <EuiFieldText
                  name="name"
                  value={data.name}
                  onChange={(e) => {
                    setData({ ...data, [e.target.name]: e.target.value });
                  }}
                />
              </EuiFormRow>

              <EuiFormRow>
                <EuiButton
                  color="primary"
                  iconType="plus"
                  onClick={async () => {
                    await nftContract.functions.addStage(data.name);
                  }}
                >
                  Add New Stage
                </EuiButton>
              </EuiFormRow>
            </EuiForm>
          </EuiFlexItem>
        </EuiFlexGroup>
        <EuiFlexGroup>
          <EuiFlexItem>
            <EuiBasicTable
              columns={columns}
              items={stages}
              style={{ marginLeft: 40, marginTop: 30 }}
            />
          </EuiFlexItem>
        </EuiFlexGroup>
      </Container>
    </div>
  );
}
