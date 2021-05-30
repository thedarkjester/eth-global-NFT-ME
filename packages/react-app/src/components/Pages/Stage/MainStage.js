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
import { abi } from "../../../constants";

import Container from "../../../components/Styled/Container";

export default function MainStage(props) {
  const { id, contract } = useParams();
  const {
    userAddress,
    tx,
    injectedProvider,
    writeContracts,
    useEventListener,
  } = props;
  const [sView, setSView] = useState([]);
  const contractAddress = getQueryVariable("contract");
  const stages = getQueryVariable("stages");
  const nftContract = new ethers.Contract(
    contractAddress,
    abi,
    injectedProvider.getSigner()
  );
  console.log(nftContract);
  useEffect(() => {
    async function getD() {
      const sigView = await nftContract
        .getSignatoryView()
        .then((i) => console.log(i));
      const supView = await nftContract.getSupplierView();
      console.log(supView, sigView);
    }
    getD();
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

  return (
    <Container>
      {id} {contract} {stages}
      {contractAddress}
      <EuiFlexGroup>
        <EuiFlexItem></EuiFlexItem>
      </EuiFlexGroup>
    </Container>
  );
}
