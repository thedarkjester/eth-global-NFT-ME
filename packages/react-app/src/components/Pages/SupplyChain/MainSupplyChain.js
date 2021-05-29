import React, { useState, useEffect } from "react";
import {
  EuiButton,
  EuiFlexGroup,
  EuiFlexItem,
  EuiFieldText,
  EuiFormRow,
  EuiForm,
  EuiFieldNumber,
  EuiText,
  EuiBasicTable,
  EuiSpacer,
} from "@elastic/eui";

import Container from "../../Styled/Container";
import factoryContract from "../../../App";
import { useContractReader } from "../../../hooks";

console.log(factoryContract);
export default function MainSupplyChain(props) {
  const { writeContracts, readContracts, tx } = props;
  const [data, setData] = useState({ name: "", symbol: "", tokenLimit: 0 });
  const [contracts, setContracts] = useState([]);

  if (!writeContracts) return "Loading..";
  async function contracts2() {
    return await writeContracts["SupplyChainFactory"].getSupplyChainList();
  }
  const r = contracts2().then((i) => {
    const names = i.names;
    const address = i.addresses;
    const tableFormat = [];
    for (let x = 0; x < i[0].length; x++) {
      const d = { name: names[x], address: address[x] };
      tableFormat.push(d);
    }
    setContracts(tableFormat);
  });

  //   const contracts2 = useContractReader(
  //     readContracts,
  //     "SupplyChainFactory",
  //     "_supplyChains"
  //   //   );
  //   console.log(contracts2);

  const columns = [
    {
      field: "name",
      name: "Name",
      sortable: true,
      truncateText: false,
    },
    {
      field: "address",
      name: "Address",
      truncateText: false,
      width: '50%"',
    },
  ];

  return (
    <Container>
      <EuiFlexGroup>
        <EuiFlexItem>
          <EuiForm component="form">
            <EuiFormRow>
              <EuiText>Create New</EuiText>
            </EuiFormRow>
            <EuiFormRow label="name">
              <EuiFieldText
                name="name"
                value={data.name}
                onChange={(e) => {
                  setData({ ...data, [e.target.name]: e.target.value });
                }}
              />
            </EuiFormRow>
            <EuiFormRow label="symbol">
              <EuiFieldText
                name="symbol"
                value={data.symbol}
                onChange={(e) => {
                  setData({ ...data, [e.target.name]: e.target.value });
                }}
              />
            </EuiFormRow>
            <EuiFormRow label="tokenLimit">
              <EuiFieldNumber
                name="tokenLimit"
                value={data.tokenLimit}
                onChange={(e) => {
                  setData({ ...data, [e.target.name]: e.target.value });
                }}
              />
            </EuiFormRow>
            <EuiFormRow>
              <EuiButton
                color="primary"
                iconType="plus"
                onClick={() => {
                  tx(
                    writeContracts["SupplyChainFactory"].addSupplyChain(
                      data.name,
                      data.symbol,
                      data.tokenLimit
                    )
                  );
                }}
              >
                Create new Supply Chain
              </EuiButton>
            </EuiFormRow>
          </EuiForm>
        </EuiFlexItem>
      </EuiFlexGroup>
      <EuiFlexGroup>
        <EuiFlexItem>
          <EuiBasicTable
            columns={columns}
            items={contracts}
            style={{ marginLeft: 40, marginTop: 30 }}
          />
        </EuiFlexItem>
      </EuiFlexGroup>
    </Container>
  );
}
