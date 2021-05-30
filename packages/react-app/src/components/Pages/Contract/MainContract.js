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
//import SipplyChainAsNFT ABI
import { abi } from "../../../constants";
import Container from "../../../components/Styled/Container";
import AppLink from "../../../components/Link";

export default function MainContract(props) {
  const {
    userAddress,
    tx,
    injectedProvider,
    writeContracts,
    useEventListener,
  } = props;
  const [data, setData] = useState({ name: "" });
  const [stages, setStages] = useState([]);
  const [selectedStage, setSelectedStage] = useState("");
  const [loading, setLoading] = useState(false);

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
  const newStageEvents = useEventListener(
    nftContract,
    "SupplyChainAsNFT",
    "StageAdded",
    injectedProvider,
    1
  );

  useEffect(() => {
    setLoading(true);
    async function getStages() {
      return await nftContract.getStages();
    }

    getStages().then((i) => {
      const tableFormat = [];
      for (let x = 0; x < i.length; x++) {
        const d = { id: x + 1, name: i[x] + "_" + x };
        tableFormat.push(d);
      }
      setStages(tableFormat);
    });
  }, [injectedProvider]);

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
    setLoading(false);
  }

  if (!injectedProvider) return "loading";

  const actions = [
    {
      render: () => {
        const stageId =
          Number(
            selectedStage.slice(selectedStage.indexOf("_", 1)).replace("_", "")
          ) + 1;

        return (
          <AppLink
            title="View"
            to={`/stage/${stageId}?contract=${address}&stages=${encodeURIComponent(
              JSON.stringify(stages)
            )}`}
          />
        );
      },
    },
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
                    }}
                  >
                    Add New Stage
                  </EuiButton>
                  <EuiButton
                    color="secondary"
                    fill
                    style={{ marginLeft: 30 }}
                    onClick={async () => {
                      await tx(nftContract.functions.mint(userAddress));
                    }}
                  >
                    Mint
                  </EuiButton>
                </>
              </EuiFormRow>
            </EuiForm>
          </EuiFlexItem>

          <EuiFlexItem>
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
