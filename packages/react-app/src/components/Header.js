import React from "react";
import { PageHeader } from "antd";
import {
  EuiHeader,
  EuiHeaderSection,
  EuiHeaderSectionItem,
  EuiHeaderLink,
} from "@elastic/eui";

export default function Header(props) {
  return (
    <>
      <EuiHeader>
        <EuiHeaderSection grow={false}>
          <EuiHeaderSectionItem border="right">
            <EuiHeaderLink href="/">
              <PageHeader
                title="NFT-ME"
                subTitle=""
                style={{ cursor: "pointer" }}
              />
            </EuiHeaderLink>
          </EuiHeaderSectionItem>
          <EuiHeaderSectionItem style={{ paddingLeft: 15 }}>
            <EuiHeaderLink href="/supply-chain">Supply Chain</EuiHeaderLink>
          </EuiHeaderSectionItem>
          <EuiHeaderSectionItem style={{ paddingLeft: 15 }}>
            <EuiHeaderLink href="/ipfs">IPFS</EuiHeaderLink>
          </EuiHeaderSectionItem>
        </EuiHeaderSection>

        <EuiHeaderSection side="right">
          <EuiHeaderSectionItem>{props.children}</EuiHeaderSectionItem>
        </EuiHeaderSection>
      </EuiHeader>
    </>
  );
}
