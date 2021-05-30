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
  EuiFieldNumber,
  EuiSelect,
  EuiSpacer,
  EuiBasicTable,
  EuiLink,
  EuiDragDropContext,
  EuiDraggable,
  EuiDroppable,
  EuiIcon,
  EuiPanel,
  euiDragDropReorder,
  EuiHorizontalRule,
} from "@elastic/eui";

import { ethers } from "ethers";
import { abi } from "../../../constants";

import Container from "../../../components/Styled/Container";

async function loadStageData(nftContract, selectedStage) {
  const stageSigsData = await nftContract.getStageSignatories(selectedStage);
  const stageSuppliersData = await nftContract.getStageSuppliers(selectedStage);
  if (
    !stageSigsData ||
    !stageSigsData.length ||
    !stageSuppliersData ||
    !stageSuppliersData.length
  ) {
    return { stageSignatories: [], stageSuppliers: [] };
  }

  return {
    stageSignatories: stageSigsData.map((item) => ({ addr: item })),
    stageSuppliers: stageSuppliersData.map((item) => ({ addr: item })),
  };
}

export default function MainStage(props) {
  const [stageSupplData, setStageSuppliersData] = useState([]);
  const [stageSigData, setStageSigData] = useState([]);
  const [statusData, setStatusData] = useState([]);
  const { id, contract } = useParams();
  const { userAddress, tx, injectedProvider } = props;

  const [data, setData] = useState({
    id: id,
    stage: { value: 1, text: 1 },
    supplier: "",
    signer: "",
    fee: "",
  });
  const contractAddress = getQueryVariable("contract");
  const stages = getQueryVariable("stages");

  const nftContract = new ethers.Contract(
    contractAddress,
    abi,
    injectedProvider.getSigner()
  );
  useEffect(() => {
    async function a() {
      const ata = await loadStageData(nftContract, data.stage.value);
      setStageSigData(ata?.stageSignatories);
      setStageSuppliersData(ata?.stageSuppliers);
    }
    a();
  }, [data.stage.value]);

  // useEffect(() => {
  //   async function getD() {
  //     const sigView = await nftContract
  //       .getSignatoryView()
  //       .then((i) => console.log(i));
  //     const supView = await nftContract.getSupplierView();
  //     //   console.log(supView, sigView);
  //   }
  //   getD();
  // }, []);

  useEffect(() => {
    async function t() {
      const promises = JSON.parse(stages).map((i) => {
        return nftContract.getTokenStageState(id, i.id);
      });
      const v = await Promise.all(promises);
      setStatusData(v);
    }
    t();
  }, []);

  function getQueryVariable(variable) {
    var query = window.location.search.substring(1);
    var vars = query.split("&");
    for (var i = 0; i < vars.length; i++) {
      var pair = vars[i].split("=");
      if (decodeURIComponent(pair[0]) == variable) {
        return decodeURIComponent(pair[1]);
      }
    }
  }

  const stagesFull = JSON.parse(stages).map((item, index) => {
    const o = {
      id: item.id,
      name: item.name.slice(0, item.name.indexOf("_")),
      started: statusData[index]?.hasStarted,
      completed: statusData[index]?.isComplete,
    };
    return o;
  });

  let columns = [
    {
      field: "name",
      name: "name",
      sortable: true,
    },
    {
      field: "started",
      name: "Started",
      sortable: true,
      truncateText: false,
      //   render: (item) => <span>{item}</span>,
    },
    {
      field: "completed",
      name: "Completed",
      sortable: true,
      truncateText: false,
      //   render: (item) => <span>{item}</span>,
    },
  ];
  return (
    <Container>
      {/* {id} {contract} {stages} */}
      {contractAddress}
      <EuiFlexGroup>
        <EuiFlexItem>
          <EuiForm component="form">
            <EuiFormRow>
              <EuiText>Start</EuiText>
            </EuiFormRow>
            <EuiFormRow label="Token ID">
              <EuiFieldText
                name="id"
                disabled
                value={data.id}
                onChange={(e) => {
                  setData({ ...data, [e.target.name]: e.target.value });
                }}
              />
            </EuiFormRow>
            <EuiFormRow label="Stage">
              <EuiSelect
                name="stage"
                value={data.stage.value}
                options={stagesFull.map((stage) => {
                  const o = {
                    value: stage.id,
                    text: stage.name,
                  };
                  return o;
                })}
                onChange={(e) => {
                  setData({
                    ...data,
                    stage: { value: Number(e.target.value) },
                  });
                }}
              />
            </EuiFormRow>
            <EuiFormRow label="Supplier">
              <EuiSelect
                name="supplier"
                options={stageSupplData.reduce(
                  (acc, i) => {
                    const o = { value: i.addr, text: i.addr };
                    acc.push(o);
                    return acc;
                  },
                  [{ value: "Select", text: "Select Supplier" }]
                )}
                value={data.supplier}
                onChange={(e) => {
                  setData({ ...data, [e.target.name]: e.target.value });
                }}
              />
            </EuiFormRow>
            <EuiFormRow label="Signer">
              <EuiSelect
                name="signer"
                options={stageSigData.reduce(
                  (acc, i) => {
                    const o = { value: i.addr, text: i.addr };
                    acc.push(o);
                    return acc;
                  },
                  [{ value: "Select", text: "Select Signer" }]
                )}
                value={data.signer}
                onChange={(e) => {
                  setData({ ...data, [e.target.name]: e.target.value });
                }}
              />
            </EuiFormRow>
            <EuiFormRow label="Fee">
              <EuiFieldNumber
                name="fee"
                value={data.fee}
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
                    nftContract.startStage(
                      data.id,
                      data.stage.value,
                      data.supplier,
                      data.signer,
                      data.fee
                    )
                  );
                }}
              >
                Start
              </EuiButton>
            </EuiFormRow>
          </EuiForm>
        </EuiFlexItem>
        <EuiFlexItem>
          Stages
          <EuiBasicTable
            columns={columns}
            items={stagesFull}
            style={{ marginLeft: 40, marginTop: 30 }}
          />
        </EuiFlexItem>
      </EuiFlexGroup>
    </Container>
  );
}
