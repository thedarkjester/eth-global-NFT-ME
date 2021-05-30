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
  EuiDragDropContext,
  EuiDraggable,
  EuiDroppable,
  EuiIcon,
  EuiPanel,
  euiDragDropReorder,
  EuiHorizontalRule,
} from "@elastic/eui";
import { ethers } from "ethers";
import Blockies from "react-blockies";
//import SipplyChainAsNFT ABI
import { abi } from "../../../constants";
import Container from "../../../components/Styled/Container";
import AppLink from "../../../components/Link";

async function loadData(nftContract) {
  const response = await nftContract.getStages();
  if (!response) {
    return [];
  }

  const tableFormat = [];
  for (let x = 0; x < response.length; x++) {
    const d = { id: x + 1, name: response[x] + "_" + x };
    tableFormat.push(d);
  }

  return tableFormat;
}

async function loadSupplyData(nftContract) {
  const response = await nftContract.totalSupply();
  if (!response) {
    return "";
  }
  const f = ethers.utils.bigNumberify(response._hex).toNumber();

  return f;
}

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

export default function MainContract(props) {
  const {
    userAddress,
    tx,
    injectedProvider,
    writeContracts,
    useEventListener,
    readContracts,
  } = props;
  const [data, setData] = useState({ name: "" });
  const [stages, setStages] = useState([]);
  const [stageSupplData, setStageSuppliersData] = useState([]);
  const [stageSigData, setStageSigData] = useState([]);
  const [selectedStage, setSelectedStage] = useState("");
  const [loading, setLoading] = useState(false);
  const [tokenList, setTokenList] = useState([]);
  const [stageList, setStageList] = useState([]);
  const [sigList, setSigList] = useState([]);

  const onStageDragEnd = ({ source, destination }) => {
    if (source && destination) {
      const items = euiDragDropReorder(
        stageList,
        source.index,
        destination.index
      );

      setStageList(items);
    }
  };
  const onSigDragEnd = ({ source, destination }) => {
    if (source && destination) {
      const items = euiDragDropReorder(
        sigList,
        source.index,
        destination.index
      );

      setSigList(items);
    }
  };

  const { address } = useParams();

  const nftContract = new ethers.Contract(
    address,
    abi,
    injectedProvider.getSigner()
  );

  useEffect(() => {
    async function getMe() {
      const r = await loadSupplyData(nftContract);
      console.log("<<<< ", r);
      setTokenList(r);
    }
    getMe();
  }, []);

  useEffect(() => {
    setLoading(true);
    async function getStages() {
      const data = await loadData(nftContract);
      setStages(data);
    }

    getStages();
  }, [injectedProvider]);

  useEffect(() => {
    async function getStageData() {
      const stageId =
        Number(
          selectedStage.slice(selectedStage.indexOf("_", 1)).replace("_", "")
        ) + 1;
      const data = await loadStageData(nftContract, stageId);
      setStageSigData(data?.stageSignatories);
      setStageSuppliersData(data?.stageSuppliers);
    }
    getStageData();
  }, [selectedStage]);

  async function uploadData() {
    // loop over each stage, then loop over each signatory
    setLoading(true);
    // get stageId to update
    const stageId =
      Number(
        selectedStage.slice(selectedStage.indexOf("_", 1)).replace("_", "")
      ) + 1;
    console.log(stageId);
    for (let x = 0; x < stageList.length; x++) {
      const result = await tx(
        nftContract.addStageSupplier(stageId, stageList[x].address)
      );
      console.log("added supplier " + result);
    }
    for (let x = 0; x < sigList.length; x++) {
      const result = await tx(
        nftContract.addStageSignatory(stageId, sigList[x].address)
      );
      console.log("added signatory " + result);
    }

    // hacking the reload since it might take a second for hardhat to commit
    setTimeout(async () => {
      const data = await loadStageData(nftContract, stageId);
      setStageSigData(data?.stageSignatories);
      setStageSuppliersData(data?.stageSuppliers);
    }, 3000);
    setLoading(false);
  }

  if (!injectedProvider) return "loading";

  const actions = [
    // {
    //   render: () => {
    //     const stageId =
    //       Number(
    //         selectedStage.slice(selectedStage.indexOf("_", 1)).replace("_", "")
    //       ) + 1;
    //     return (
    //       <AppLink
    //         title="View"
    //         to={`/stage/${stageId}?contract=${address}&stages=${encodeURIComponent(
    //           JSON.stringify(stages)
    //         )}`}
    //       />
    //     );
    //   },
    // },
  ];
  const columns = [
    {
      field: "id",
      name: "Id",
      truncateText: false,
      render: (item) => <span>{item}</span>,
      width: "10%",
    },
    {
      field: "name",
      name: "Name",
      sortable: true,
      truncateText: false,
      render: (item) => (
        <EuiLink
          onClick={(e) => {
            e.persist();
            console.log(e);
            setSelectedStage(item);
          }}
        >
          {item.slice(0, item.indexOf("_"))}
        </EuiLink>
      ),
    },
    { name: "View", actions },
  ];

  const stageSigColumns = [
    {
      field: "addr",
      name: "Blockie",
      sortable: true,
      truncateText: false,
      render: (item) => {
        return <Blockies seed={item?.toLowerCase()} size={16} scale={4} />;
      },
    },
    {
      field: "addr",
      name: "Address",
      sortable: true,
      truncateText: false,
      render: (item) => {
        return item;
      },
    },
  ];

  const stageSupplColumns = [
    {
      field: "addr",
      name: "Blockie",
      sortable: true,
      truncateText: false,
      render: (item) => {
        return <Blockies seed={item?.toLowerCase()} size={16} scale={4} />;
      },
    },
    {
      field: "addr",
      name: "Address",
      sortable: true,
      truncateText: false,
      render: (item) => {
        return item;
      },
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
                <>
                  <EuiButton
                    color="primary"
                    iconType="plus"
                    onClick={async () => {
                      await tx(nftContract.functions.addStage(data.name));

                      setTimeout(async () => {
                        const reloadedData = await loadData(nftContract);
                        setStages(reloadedData);
                      }, 3000);
                    }}
                  >
                    Add New Stage
                  </EuiButton>
                  <EuiButton
                    color="secondary"
                    fill
                    style={{ marginLeft: 30 }}
                    onClick={async () => {
                      await tx(nftContract.mint(userAddress));

                      setTimeout(async () => {
                        const newTokenList = await loadSupplyData(nftContract);
                        setTokenList(newTokenList);
                      }, 3000);
                    }}
                  >
                    Mint
                  </EuiButton>
                </>
              </EuiFormRow>
            </EuiForm>
            <EuiSpacer />
            <EuiSpacer />

            <span className="poop">
              {new Array(tokenList).fill("undefined").map((i, idx) => {
                return (
                  <ul key={idx}>
                    <li>
                      <AppLink
                        to={`/token/${
                          idx + 1
                        }?contract=${address}&stages=${encodeURIComponent(
                          JSON.stringify(stages)
                        )}`}
                        title={`Token: ${idx + 1}`}
                      >
                        {idx + 1}
                      </AppLink>
                      <EuiSpacer />
                    </li>
                  </ul>
                );
              })}
            </span>
          </EuiFlexItem>

          <EuiFlexItem>
            <EuiText>Stages</EuiText>
            <EuiBasicTable
              columns={columns}
              items={stages}
              style={{ marginLeft: 40, marginTop: 30 }}
            />
          </EuiFlexItem>
        </EuiFlexGroup>
        <EuiSpacer />
        <EuiSpacer />
        <EuiSpacer />
        <EuiSpacer />

        {selectedStage && (
          <>
            Signatories:
            <EuiBasicTable
              columns={stageSigColumns}
              items={stageSigData}
              style={{ marginLeft: 40, marginTop: 30, width: "100%" }}
            />
            Suppliers:
            <EuiBasicTable
              columns={stageSupplColumns}
              items={stageSupplData}
              style={{ marginLeft: 40, marginTop: 30, width: "100%" }}
            />
          </>
        )}

        {selectedStage && (
          <EuiText>
            {selectedStage.slice(0, selectedStage.indexOf("_"))}
          </EuiText>
        )}

        {selectedStage && (
          <EuiFlexGroup>
            <EuiFlexItem>
              <EuiText>Add Stage Supplier</EuiText>
              <EuiHorizontalRule />
              <EuiButton
                style={{ width: "30%" }}
                onClick={() => {
                  const d = { address: "" };
                  setStageList([...stageList, d]);
                }}
              >
                + Supplier
              </EuiButton>
              <EuiSpacer />
              {stageList.length > 0 && (
                <EuiDragDropContext onDragEnd={onStageDragEnd}>
                  <EuiDroppable
                    droppableId="CUSTOM_HANDLE_DROPPABLE_AREA"
                    spacing="m"
                    withPanel
                  >
                    {stageList.map(({ address }, idx) => (
                      <EuiDraggable
                        spacing="m"
                        key={Math.random()}
                        index={idx}
                        draggableId={"1" + idx.toString()}
                        customDragHandle={true}
                      >
                        {(provided) => (
                          <EuiPanel className="custom" paddingSize="m">
                            <EuiFlexGroup>
                              <EuiFlexItem grow={false}>
                                <div
                                  {...provided.dragHandleProps}
                                  aria-label="Drag Handle"
                                >
                                  <EuiIcon type="grab" />
                                </div>
                              </EuiFlexItem>
                              <EuiFlexItem>
                                <EuiFormRow label="Address">
                                  <EuiFieldText
                                    value={stageList[idx].address}
                                    onChange={(e) => {
                                      const newList = [...stageList];
                                      newList[idx].address = e.target.value;
                                      setStageList(newList);
                                    }}
                                  />
                                </EuiFormRow>
                              </EuiFlexItem>
                            </EuiFlexGroup>
                          </EuiPanel>
                        )}
                      </EuiDraggable>
                    ))}
                  </EuiDroppable>
                </EuiDragDropContext>
              )}
            </EuiFlexItem>

            <EuiFlexItem>
              <EuiText>Add Stage Signatory</EuiText>
              <EuiHorizontalRule />
              <EuiButton
                style={{ width: "30%" }}
                onClick={() => {
                  const d = { address: "" };
                  setSigList([...sigList, d]);
                }}
              >
                + Signatory
              </EuiButton>
              <EuiSpacer />
              {sigList.length > 0 && (
                <EuiDragDropContext onDragEnd={onSigDragEnd}>
                  <EuiDroppable
                    droppableId="CUSTOM_HANDLE_DROPPABLE_AREA"
                    spacing="m"
                    withPanel
                  >
                    {sigList.map(({ address }, idx) => (
                      <EuiDraggable
                        spacing="m"
                        key={Math.random()}
                        index={idx}
                        draggableId={"2" + idx.toString()}
                        customDragHandle={true}
                      >
                        {(provided) => (
                          <EuiPanel className="custom" paddingSize="m">
                            <EuiFlexGroup>
                              <EuiFlexItem grow={false}>
                                <div
                                  {...provided.dragHandleProps}
                                  aria-label="Drag Handle"
                                >
                                  <EuiIcon type="grab" />
                                </div>
                              </EuiFlexItem>
                              <EuiFlexItem>
                                <EuiFormRow label="Address">
                                  <EuiFieldText
                                    value={sigList[idx].address}
                                    onChange={(e) => {
                                      const newList = [...sigList];
                                      newList[idx].address = e.target.value;
                                      setSigList(newList);
                                    }}
                                  />
                                </EuiFormRow>
                              </EuiFlexItem>
                            </EuiFlexGroup>
                          </EuiPanel>
                        )}
                      </EuiDraggable>
                    ))}
                  </EuiDroppable>
                </EuiDragDropContext>
              )}
            </EuiFlexItem>
          </EuiFlexGroup>
        )}
        {selectedStage && (
          <EuiFlexGroup justifyContent="flexEnd" alignItems="flexEnd">
            <EuiFlexItem grow={false}>
              <EuiButton
                onClick={() => uploadData()}
                color="secondary"
                iconType="save"
              >
                <EuiText>
                  Save {selectedStage.slice(0, selectedStage.indexOf("_"))}
                </EuiText>
              </EuiButton>
            </EuiFlexItem>
          </EuiFlexGroup>
        )}
      </Container>
      <EuiSpacer />
      <EuiSpacer />
      <EuiSpacer />
      <EuiSpacer />
      <EuiSpacer />
      <EuiSpacer />
      <EuiSpacer />
      <EuiSpacer />
      <EuiSpacer />
      <EuiSpacer />
      <EuiSpacer />
    </div>
  );
}
