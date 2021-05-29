import React from "react";
import { Link } from "react-router-dom";

import { EuiHeaderLink, EuiLink } from "@elastic/eui";

const AppLink = ({ isHeaderLink = false, to, title }) => {
  const euiLinkType = isHeaderLink ? EuiHeaderLink : EuiLink;

  return (
    <euiLinkType>
      <Link to={to}>{title}</Link>
    </euiLinkType>
  );
};

export default AppLink;
