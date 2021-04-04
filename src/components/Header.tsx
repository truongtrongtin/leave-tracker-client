import {
  Box,
  Button,
  Flex,
  HStack,
  IconButton,
  Image,
  Input,
  InputGroup,
  InputRightElement,
  Link,
  Modal,
  Spacer,
  Text,
  useColorMode,
  useDisclosure,
} from '@chakra-ui/react';
import logo from 'assets/icons/react.svg';
import { User } from 'types/user';
import { AiOutlineMenu, AiOutlineSearch } from 'react-icons/ai';
import { FaRegMoon, FaRegSun } from 'react-icons/fa';
import { FiSettings } from 'react-icons/fi';
import { useQueryClient } from 'react-query';
import { fetchData } from 'services/fetchData';
import { Link as RouteLink, useLocation } from 'wouter';
import UserSetting, { NewUserSettings } from './UserSetting';

export default function Header() {
  const [, setLocation] = useLocation();
  const { colorMode, toggleColorMode } = useColorMode();
  const queryClient = useQueryClient();
  const {
    isOpen: isOpenUserSetting,
    onOpen: onOpenUserSetting,
    onClose: onCloseUserSetting,
  } = useDisclosure();
  const currentUser: User | undefined = queryClient.getQueryData('currentUser');

  const logout = async () => {
    try {
      await fetchData('/auth/logout', {
        method: 'POST',
      });
      queryClient.removeQueries('currentUser');
      setLocation('/login');
    } catch (error) {
      console.log(error);
    }
  };

  const handleUserSettingSubmit = (newUserSettings: NewUserSettings) => {
    console.log('newUserSettings', newUserSettings);
  };

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
      backgroundColor="white"
      zIndex={5}
    >
      <Flex justifyContent="center" width={56}>
        <RouteLink href="/">
          <Link>
            <Image width="40px" height="40px" src={logo} alt="logo" />
          </Link>
        </RouteLink>
      </Flex>
      <IconButton
        backgroundColor="inherit"
        aria-label="Toggle sidebar"
        icon={<AiOutlineMenu />}
      />
      <IconButton
        onClick={toggleColorMode}
        backgroundColor="inherit"
        aria-label="Toggle sidebar"
        icon={colorMode === 'light' ? <FaRegMoon /> : <FaRegSun />}
      />
      <Text>Welcome {currentUser?.firstName}</Text>
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
      <IconButton
        onClick={onOpenUserSetting}
        backgroundColor="inherit"
        aria-label="Toggle sidebar"
        icon={<FiSettings />}
      />
      <Button onClick={logout}>Log out</Button>
      <Modal isOpen={isOpenUserSetting} onClose={onCloseUserSetting}>
        <UserSetting
          onClose={onCloseUserSetting}
          onSubmit={handleUserSettingSubmit}
        />
      </Modal>
    </HStack>
  );
}
