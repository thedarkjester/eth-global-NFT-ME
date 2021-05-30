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
import StageView from "./StageView";

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

async function loadStageStatus(nftContract, stages, id) {
  const promises = JSON.parse(stages).map((i) => {
    return nftContract.getTokenStageState(id, i.id);
  });
  return await Promise.all(promises);
}
export default function MainStage(props) {
  const [stageSupplData, setStageSuppliersData] = useState([]);
  const [stageSigData, setStageSigData] = useState([]);
  const [statusData, setStatusData] = useState([]);
  const [selectedStage, setSelectedStage] = useState(null);
  const { id, contract } = useParams();
  const { userAddress, tx, injectedProvider } = props;

  const [data, setData] = useState({
    id: id,
    stage: { value: -1 },
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
      if (data.stage.value === -1) {
        return;
      }
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
      const response = await loadStageStatus(nftContract, stages, id);
      console.log(">>>>>", response);
      setStatusData(response);
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

  const areAllStagesComplete = stagesFull.reduce(
    (result, stage) => result && stage.completed
  );

  let columns = [
    {
      field: "name",
      name: "name",
      sortable: true,
      render: (val, obj) => (
        <a onClick={() => setSelectedStage({ id: obj.id, name: obj.name })}>
          {val}
        </a>
      ),
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
        {areAllStagesComplete ? null : (
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
                  options={stagesFull.reduce(
                    (acc, stage) => {
                      acc.push({
                        value: stage.id,
                        text: stage.name,
                        disabled: stage.started,
                      });
                      return acc;
                    },
                    [{ value: -1, text: "Select Stage" }]
                  )}
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
                  disabled={data.stage.value === -1}
                  options={stageSupplData.reduce(
                    (acc, i) => {
                      const o = { value: i.addr, text: i.addr };
                      acc.push(o);
                      return acc;
                    },
                    [{ value: null, text: "Select Supplier" }]
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
                  disabled={data.stage.value === -1}
                  options={stageSigData.reduce(
                    (acc, i) => {
                      const o = { value: i.addr, text: i.addr };
                      acc.push(o);
                      return acc;
                    },
                    [{ value: null, text: "Select Signer" }]
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
                  disabled={data.stage.value === -1}
                  value={data.fee}
                  onChange={(e) => {
                    setData({ ...data, [e.target.name]: e.target.value });
                  }}
                />
              </EuiFormRow>
              <EuiFormRow>
                <EuiButton
                  color="primary"
                  disabled={
                    data.stage.value === -1 || !data.supplier || !data.signer
                  }
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

                    setTimeout(async () => {
                      const response = await loadStageStatus(
                        nftContract,
                        stages,
                        id
                      );
                      setStatusData(response);
                    }, 3000);
                  }}
                >
                  Start
                </EuiButton>
              </EuiFormRow>
            </EuiForm>
          </EuiFlexItem>
        )}
        <EuiFlexItem>
          Stages
          <EuiBasicTable
            columns={columns}
            items={stagesFull}
            style={{ marginLeft: 40, marginTop: 30 }}
          />
          <EuiButton
            color="primary"
            disabled={areAllStagesComplete}
            onClick={() => {
              tx(nftContract.completeFinalStage(data.id, statusData.length));

              setTimeout(async () => {
                const response = await loadStageStatus(nftContract, stages, id);
                setStatusData(response);
              }, 3000);
            }}
          >
            Finalize!
          </EuiButton>
          {areAllStagesComplete ? (
            <p style={{ paddingTop: "20px" }}>
              <h2 style={{ fontSize: "25px" }}>
                🎉 hooray, you can now sell/transfer the NFT
              </h2>
            </p>
          ) : null}
        </EuiFlexItem>
      </EuiFlexGroup>
      {selectedStage && (
        <div style={{ paddingTop: "20px" }}>
          <h3>{selectedStage.name} Stage</h3>
          <StageView
            tx={tx}
            tokenId={id}
            contractAddress={contractAddress}
            injectedProvider={injectedProvider}
            selectedStage={selectedStage}
            stageIsComplete={statusData[selectedStage.id - 1]?.isComplete}
            stageHasStarted={statusData[selectedStage.id - 1]?.hasStarted}
          />
        </div>
      )}
    </Container>
  );
}
