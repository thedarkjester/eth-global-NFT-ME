import React from "react";
import { Link } from "react-router-dom";

import { EuiHeaderLink, EuiLink } from "@elastic/eui";

const AppLink = ({ isHeaderLink = false, to, title }) => {
  const EuiLinkType = isHeaderLink ? EuiHeaderLink : EuiLink;

  return (
    <EuiLinkType>
      <Link to={to}>{title}</Link>
    </EuiLinkType>
  );
};

export default AppLink;
