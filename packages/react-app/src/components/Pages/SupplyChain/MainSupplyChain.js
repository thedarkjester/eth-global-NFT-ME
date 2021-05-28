import React, { useState } from "react";
import {
  EuiButton,
  EuiFlexGroup,
  EuiFlexItem,
  EuiFieldText,
  EuiFormRow,
  EuiForm,
  EuiFieldNumber,
  EuiText,
} from "@elastic/eui";

import Container from "../../Styled/Container";

export default function MainSupplyChain(props) {
  const { writeContracts, readContracts, tx } = props;
  const [data, setData] = useState({ name: "", symbol: "", tokenLimit: 0 });
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
        <EuiFlexItem>{props.newSupplyChainEvents.map((i) => i)}</EuiFlexItem>
      </EuiFlexGroup>
    </Container>
  );
}
