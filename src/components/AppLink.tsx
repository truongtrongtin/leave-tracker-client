import { Link } from "@chakra-ui/react";
import React from "react";
import { Link as RouteLink, useRoute } from "wouter";

// type AppLinkProps = {
//   href: string;
//   activeStyle?: {};
//   children: React.ReactChild;
// };

function AppLink({ href, activeStyle, children, ...rest }: any) {
  const [isActive] = useRoute(href);

  return (
    <RouteLink href={href}>
      <Link {...rest} {...(isActive ? activeStyle : {})}>
        {children}
      </Link>
    </RouteLink>
  );
}

export default AppLink;
