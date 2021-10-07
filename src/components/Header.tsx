import {
  Avatar,
  Flex,
  HStack,
  Image,
  Link,
  Menu,
  MenuButton,
  MenuDivider,
  MenuItem,
  MenuList,
  Spacer,
} from '@chakra-ui/react';
import { logoutApi } from 'api/auth';
import { User } from 'api/users';
import logo from 'assets/icons/react.svg';
import { useQueryClient } from 'react-query';
import { Link as RouteLink, useLocation } from 'wouter';
import ThemeToggler from './ThemeToggler';

export default function Header() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const currentUser: User | undefined = queryClient.getQueryData('currentUser');

  const logout = async () => {
    try {
      await logoutApi();
      queryClient.setQueryData('currentUser', undefined);
    } catch (error) {
      console.log(error);
    }
  };

  if (!currentUser) return null;
  return (
    <HStack
      position="fixed"
      top={0}
      width="100%"
      as="nav"
      height={14}
      alignItems="center"
      borderBottom="1px"
      borderBottomColor="gray.200"
      boxShadow="base"
      zIndex={5}
      paddingX={5}
    >
      <Flex justifyContent="center" width={{ base: 20, md: 56 }}>
        <RouteLink href="/">
          <Link>
            <Image width="40px" height="40px" src={logo} alt="logo" />
          </Link>
        </RouteLink>
      </Flex>
      <Spacer />
      <ThemeToggler />
      <Menu>
        <MenuButton>
          <Avatar
            name={currentUser.firstName}
            src={currentUser.avatar}
            size="sm"
          />
        </MenuButton>
        <MenuList minWidth="fit-content">
          <MenuItem onClick={() => setLocation('/profile')}>Profile</MenuItem>
          <MenuDivider />
          <MenuItem onClick={logout}>Log out</MenuItem>
        </MenuList>
      </Menu>
    </HStack>
  );
}
