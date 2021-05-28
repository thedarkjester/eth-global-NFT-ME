import React from "react";
import { EuiButton, EuiFlexGroup, EuiFlexItem } from "@elastic/eui";

import Container from "../../Styled/Container";

export default function CreateNew() {
  return (
    <Container>
      <EuiFlexGroup>
        <EuiFlexItem>
          Welcome to the jungle
          <EuiButton color="primary" iconType="plus">
            Create new Supply Chain
          </EuiButton>
        </EuiFlexItem>
      </EuiFlexGroup>
    </Container>
  );
}
