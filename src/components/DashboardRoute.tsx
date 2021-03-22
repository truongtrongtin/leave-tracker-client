import {
  Flex,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Box,
} from "@chakra-ui/react";
import AppContext from "AppContext";
import React, { useContext } from "react";
import { Link, Redirect, Route } from "wouter";
import Header from "./Header";
import Sidebar from "./Sidebar";

type DashboardRouteProps = {
  path: string;
  children: React.ReactChild;
};

export default function DashboardRoute({
  path,
  children,
}: DashboardRouteProps) {
  const { currentUser, isLoading } = useContext(AppContext);

  if (!currentUser && !isLoading) return <Redirect to="/login" />;
  return (
    <Route path={path}>
      <Header />
      <Flex marginTop={14} height="calc(100vh - 56px)">
        <Sidebar />
        <Box flex={1} padding={4} overflow="auto">
          <Breadcrumb mb={4}>
            <BreadcrumbItem>
              <Link href="/">
                <BreadcrumbLink>Home</BreadcrumbLink>
              </Link>
            </BreadcrumbItem>

            <BreadcrumbItem isCurrentPage>
              <BreadcrumbLink href={path}>
                {path
                  .replace(/\//g, "")
                  .split(" ")
                  .map((w) => w[0].toUpperCase() + w.substr(1).toLowerCase())
                  .join(" ")}
              </BreadcrumbLink>
            </BreadcrumbItem>
          </Breadcrumb>
          {children}
        </Box>
      </Flex>
    </Route>
  );
}
