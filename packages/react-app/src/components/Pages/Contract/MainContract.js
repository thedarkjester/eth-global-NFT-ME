import React from "react";
import { useParams } from "react-router-dom";
import { EuiText } from "@elastic/eui";
import useExternalContractLoader from "../../../hooks/ExternalContractLoader";
//import SipplyChainAsNFT ABI
import { abi } from "../../../constants";

export default function MainContract(props) {
  const { localProvider } = props;
  const { address } = useParams();

  const contractFactory = useExternalContractLoader(
    localProvider,
    address,
    abi
  );
  console.log("uniswapFactory mainnet:", contractFactory);

  return (
    <div>
      <EuiText>{address}</EuiText>
    </div>
  );
}
