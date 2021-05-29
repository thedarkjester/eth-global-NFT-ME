import React from "react";
import { useParams } from "react-router-dom";
import {
  EuiText,
  EuiForm,
  EuiFormRow,
  EuiButton,
  EuiFlexGroup,
  EuiFlexItem,
} from "@elastic/eui";
import { useCustomContractLoader } from "../../../hooks/";
//import SipplyChainAsNFT ABI
import { abi } from "../../../constants";

import { ethers } from "ethers";

export default function MainContract(props) {
  const { localProvider, mainnetProvider, userAddress, tx, injectedProvider } =
    props;
  const { address } = useParams();
  if (!injectedProvider) return "loading";
  const nftContract = new ethers.Contract(
    address,
    abi,
    injectedProvider.getSigner()
  );
  console.log("wowpow", userAddress, injectedProvider, mainnetProvider);
  return (
    <div>
      <EuiText>{address}</EuiText>
      <EuiFlexGroup>
        <EuiFlexItem>
          <EuiForm component="form">
            <EuiFormRow>
              <EuiButton
                color="primary"
                iconType="plus"
                onClick={async () => {
                  //   nftContract.connect(mainnetProvider);
                  await nftContract.functions.addStage(
                    "welcome to the DANGERT ZONE"
                  );
                }}
              >
                Mint new NFT
              </EuiButton>
            </EuiFormRow>
          </EuiForm>
        </EuiFlexItem>
      </EuiFlexGroup>
    </div>
  );
}
