import {
  Button,
  Flex,
  HStack,
  IconButton,
  Image,
  Link,
  Modal,
  Spacer,
  Text,
  useDisclosure,
  useToast,
} from '@chakra-ui/react';
import logo from 'assets/icons/react.svg';
import { FiSettings } from 'react-icons/fi';
import { useMutation, useQueryClient } from 'react-query';
import { fetchData } from 'services/fetchData';
import { DateOfBirth } from 'types/dateOfBirth';
import { User } from 'types/user';
import { Link as RouteLink, useLocation } from 'wouter';
import UserSetting, { NewUserSettings } from './UserSetting';

export default function Header() {
  const toast = useToast();
  const [, setLocation] = useLocation();
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

  const updateCurrentUserMutation = useMutation(
    (newUserSettings: NewUserSettings) => {
      const {
        firstName,
        lastName,
        password,
        newPassword,
        dateOfBirth,
      } = newUserSettings;
      return fetchData('/users/edit/me', {
        method: 'POST',
        body: new URLSearchParams({
          firstName,
          lastName,
          ...(password && { currentPassword: password }),
          ...(newPassword && { newPassword }),
          ...(dateOfBirth && { dateOfBirth: dateOfBirth.toISOString() }),
        }),
      });
    },
    {
      onSuccess: (newUser: User) => {
        queryClient.setQueryData('currentUser', newUser);
        queryClient.setQueryData('dateOfBirths', (old: any) => {
          const newDateOfBirths = old.map((dateOfBirth: DateOfBirth) => {
            if (dateOfBirth.id === newUser.id) {
              return { ...dateOfBirth, dateOfBirth: newUser.dateOfBirth };
            }
            return dateOfBirth;
          });
          return newDateOfBirths;
        });
        onCloseUserSetting();
        toast({ description: 'Successfully updated', status: 'success' });
      },
      onError: (error: Error) => {
        toast({ description: error.message, status: 'error' });
      },
    },
  );

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
      <Flex justifyContent="center" width={{ base: 20, md: 56 }}>
        <RouteLink href="/">
          <Link>
            <Image width="40px" height="40px" src={logo} alt="logo" />
          </Link>
        </RouteLink>
      </Flex>
      <Text>
        Welcome{' '}
        <Text as="span" fontWeight="bold">
          {currentUser?.firstName}
        </Text>
      </Text>
      <Spacer />
      <IconButton
        onClick={onOpenUserSetting}
        backgroundColor="inherit"
        aria-label="Toggle sidebar"
        icon={<FiSettings />}
      />
      <Button onClick={logout}>Log out</Button>
      {currentUser && (
        <Modal isOpen={isOpenUserSetting} onClose={onCloseUserSetting}>
          <UserSetting
            onClose={onCloseUserSetting}
            onSubmit={(newUserSettings) =>
              updateCurrentUserMutation.mutate(newUserSettings)
            }
            user={currentUser}
            isLoading={updateCurrentUserMutation.isLoading}
          />
        </Modal>
      )}
    </HStack>
  );
}
