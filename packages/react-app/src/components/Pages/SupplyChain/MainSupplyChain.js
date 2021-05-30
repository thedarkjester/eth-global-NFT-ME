import React, { useState, useEffect } from "react";
import useEventListener from "../../../hooks/EventListener";
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
  EuiLoadingSpinner,
} from "@elastic/eui";

import Link from "../../Link";
import Container from "../../Styled/Container";

// async function getDataFromServer(writeContracts) {
//   const response = await writeContracts[
//     "SupplyChainFactory"
//   ].getSupplyChainList();
//   const names = response.names;
//   const address = response.addresses;
//   const tableFormat = [];
//   for (let x = 0; x < response[0].length; x++) {
//     const d = { name: names[x], address: address[x] };
//     tableFormat.push(d);
//   }
//   return tableFormat;
// }

function extractDataForTable(data) {
  if (!data || !data.length) {
    return [];
  }
  return data.map((item) => ({
    name: item.name,
    address: item.supplyChainAddress,
  }));
}

export default function MainSupplyChain(props) {
  const {
    writeContracts,
    readContracts,
    tx,
    injectedProvider,
    userAddress,
    contractName,
  } = props;
  const [data, setData] = useState({ name: "", symbol: "", tokenLimit: 0 });
  const [creatingActionInProgress, setCreatingActionInProgress] =
    useState(false);
  // const [contracts, setContracts] = useState([]);

  // useEffect(() => {
  //   async function loadData() {
  //     const data = await getDataFromServer(writeContracts);
  //     setContracts(data);
  //   }
  //   loadData();
  // }, [writeContracts]);

  // NOTE: this is a hack to have it autoload events instead of calling the
  //       the get function. this gives real-time updates without much work.
  const events = useEventListener(
    readContracts,
    contractName,
    "SupplyChainCreated",
    injectedProvider,
    1
  );
  const contracts = extractDataForTable(events);

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
      render: (item) => <Link to={`/contract/${item}`} title={item} />,
    },
  ];
  if (!writeContracts) return "Loading..";

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
                disabled={creatingActionInProgress}
                onClick={async () => {
                  setCreatingActionInProgress(true);
                  await tx(
                    writeContracts["SupplyChainFactory"].addSupplyChain(
                      data.name,
                      data.symbol,
                      data.tokenLimit
                    )
                  );
                  setCreatingActionInProgress(false);
                }}
              >
                {creatingActionInProgress ? <EuiLoadingSpinner /> : null}
                Create new Supply Chain
              </EuiButton>
            </EuiFormRow>
          </EuiForm>
        </EuiFlexItem>
        <EuiFlexItem>
          <EuiBasicTable
            columns={columns}
            items={contracts}
            style={{ marginLeft: 40, marginTop: 30, width: "100%" }}
          />
        </EuiFlexItem>
      </EuiFlexGroup>
    </Container>
  );
}
