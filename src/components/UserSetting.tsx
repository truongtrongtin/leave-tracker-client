import {
  Button,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  SimpleGrid,
} from '@chakra-ui/react';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
import { useQueryClient } from 'react-query';
import { User } from 'types/user';
import * as yup from 'yup';

type UserSettingProps = {
  onClose: () => void;
  isLoading?: boolean;
  onSubmit: (newUserSettings: NewUserSettings) => void;
};

export type NewUserSettings = {
  firstName: string;
  lastName: string;
  timeZone: number;
};

const userSettingSchema = yup.object().shape({
  firstName: yup.string().required(),
  lastName: yup.string().required(),
  currentPassword: yup.string().notRequired(),
  newPassword: yup.string().notRequired(),
});

function UserSetting({ onClose, isLoading, onSubmit }: UserSettingProps) {
  const queryClient = useQueryClient();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(userSettingSchema),
  });
  const currentUser: User | undefined = queryClient.getQueryData('currentUser');

  if (!currentUser) return <div>error</div>;
  return (
    <form noValidate onSubmit={handleSubmit(onSubmit)}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>User settings</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <SimpleGrid columns={2} spacing={2}>
            <FormControl isInvalid={Boolean(errors.firstName)}>
              <FormLabel htmlFor="firstName">First name</FormLabel>
              <Input
                type="text"
                defaultValue={currentUser.firstName}
                {...register('firstName')}
              />
              <FormErrorMessage>{errors.firstName?.message}</FormErrorMessage>
            </FormControl>
            <FormControl isInvalid={Boolean(errors.lastName)}>
              <FormLabel htmlFor="lastName">Last name</FormLabel>
              <Input
                type="text"
                defaultValue={currentUser.lastName}
                {...register('lastName')}
              />
              <FormErrorMessage>{errors.lastName?.message}</FormErrorMessage>
            </FormControl>
          </SimpleGrid>
          <SimpleGrid columns={2} spacing={2} mt={4}>
            <FormControl isInvalid={Boolean(errors.currentPassword)}>
              <FormLabel htmlFor="currentPassword">Current password</FormLabel>
              <Input type="text" {...register('currentPassword')} />
              <FormErrorMessage>
                {errors.currentPassword?.message}
              </FormErrorMessage>
            </FormControl>
            <FormControl isInvalid={Boolean(errors.newPassword)}>
              <FormLabel htmlFor="newPassword">New password</FormLabel>
              <Input type="text" {...register('newPassword')} />
              <FormErrorMessage>{errors.newPassword?.message}</FormErrorMessage>
            </FormControl>
          </SimpleGrid>
        </ModalBody>
        <ModalFooter>
          <Button mr={3} onClick={onClose}>
            Close
          </Button>
          <Button colorScheme="blue" type="submit" isLoading={isLoading}>
            Save
          </Button>
        </ModalFooter>
      </ModalContent>
    </form>
  );
}

export default UserSetting;
