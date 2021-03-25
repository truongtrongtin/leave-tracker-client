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
  useColorMode,
} from '@chakra-ui/react';
import AppContext from 'AppContext';
import logo from 'assets/icons/react.svg';
import { useContext } from 'react';
import { AiOutlineMenu, AiOutlineSearch } from 'react-icons/ai';
import { BsBell, BsChat } from 'react-icons/bs';
import { FaRegMoon, FaRegSun } from 'react-icons/fa';
import { Link as RouteLink, useLocation } from 'wouter';

export default function Header() {
  const [, setLocation] = useLocation();
  const { setCurrentUser } = useContext(AppContext);
  const { colorMode, toggleColorMode } = useColorMode();

  const logout = async () => {
    await fetch('/auth/logout', {
      method: 'POST',
    });
    setCurrentUser(null);
    setLocation('/login');
  };

  return (
    <Flex
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
      <Box>
        <IconButton
          backgroundColor="inherit"
          aria-label="Toggle sidebar"
          icon={<AiOutlineMenu />}
        />
      </Box>
      <IconButton
        onClick={toggleColorMode}
        backgroundColor="inherit"
        aria-label="Toggle sidebar"
        icon={colorMode === 'light' ? <FaRegMoon /> : <FaRegSun />}
      />
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
