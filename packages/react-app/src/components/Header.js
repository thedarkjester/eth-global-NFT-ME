import React from "react";
import { PageHeader } from "antd";
import {
  EuiHeader,
  EuiHeaderSection,
  EuiHeaderSectionItem,
} from "@elastic/eui";

export default function Header(props) {
  return (
    <>
      <EuiHeader>
        <EuiHeaderSection grow={false}>
          <EuiHeaderSectionItem border="right">
            <PageHeader
              title="NFT-ME"
              subTitle=""
              style={{ cursor: "pointer" }}
            />
          </EuiHeaderSectionItem>
        </EuiHeaderSection>

        <EuiHeaderSection side="right">
          <EuiHeaderSectionItem>{props.children}</EuiHeaderSectionItem>
        </EuiHeaderSection>
      </EuiHeader>
    </>
  );
}
