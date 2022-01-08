import { Box, Flex } from '@chakra-ui/react';
import Header from 'components/Header';
import Sidebar from 'components/Sidebar';

type DashboardLayoutProps = {
  children: React.ReactChild;
};

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <>
      <Header />
      <Flex marginTop={14} height="calc(100vh - 56px)">
        <Sidebar />
        <Box flex={1} overflow="auto">
          {/* <Breadcrumb mb={4}>
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
              </Breadcrumb> */}
          {children}
        </Box>
      </Flex>
    </>
  );
}
