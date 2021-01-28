import {
  Box,
  Button,
  Flex,
  Icon,
  IconButton,
  Image,
  Input,
  InputGroup,
  InputRightElement,
  Link,
  Spacer,
} from "@chakra-ui/react";
import AppContext from "AppContext";
import logo from "assets/icons/react.svg";
import React, { useContext } from "react";
import { AiOutlineMenu, AiOutlineSearch } from "react-icons/ai";
import { BsBell, BsChat } from "react-icons/bs";
import { Link as RouteLink, useLocation } from "wouter";

export default function Header() {
  const [, setLocation] = useLocation();
  const { setCurrentUser } = useContext(AppContext);

  const logout = async () => {
    await fetch("/auth/logout", {
      method: "POST",
    });
    setCurrentUser(null);
    setLocation("/login");
  };

  return (
    <Flex
      position="fixed"
      top={0}
      left={0}
      right={0}
      as="nav"
      height={14}
      alignItems="center"
      borderBottom="1px"
      borderBottomColor="gray.200"
      boxShadow="base"
    >
      <Flex justifyContent="center" width={56}>
        <RouteLink href="/leaves">
          <Link>
            <Image width="40px" height="40px" src={logo} alt="logo" />
          </Link>
        </RouteLink>
      </Flex>
      <Box>
        <IconButton
          backgroundColor="inherit"
          aria-label="Toggle sidebar"
          icon={<AiOutlineMenu />}
        />
      </Box>
      <Spacer />
      <Box>
        <InputGroup>
          <Input placeholder="Search here" />
          <InputRightElement>
            <IconButton
              size="sm"
              aria-label="Search"
              icon={<AiOutlineSearch />}
            />
          </InputRightElement>
        </InputGroup>
      </Box>
      <Box>
        <Icon as={BsBell} />
      </Box>
      <Box>
        <Icon as={BsChat} />
      </Box>
      <Button onClick={logout}>Log out</Button>
    </Flex>
  );
}
