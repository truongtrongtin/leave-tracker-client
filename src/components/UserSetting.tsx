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
import { User } from 'types/user';
import * as yup from 'yup';

type UserSettingProps = {
  user: User;
  onClose: () => void;
  isLoading?: boolean;
  onSubmit: (newUserSettings: NewUserSettings) => void;
};

export type NewUserSettings = {
  firstName: string;
  lastName: string;
  currentPassword?: string;
  newPassword?: string;
};

const userSettingSchema = yup.object().shape({
  firstName: yup.string().required(),
  lastName: yup.string().required(),
  currentPassword: yup.string().notRequired(),
  newPassword: yup.string().notRequired(),
});

function UserSetting({ user, onClose, isLoading, onSubmit }: UserSettingProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(userSettingSchema),
  });
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
                defaultValue={user.firstName}
                {...register('firstName')}
              />
              <FormErrorMessage>{errors.firstName?.message}</FormErrorMessage>
            </FormControl>
            <FormControl isInvalid={Boolean(errors.lastName)}>
              <FormLabel htmlFor="lastName">Last name</FormLabel>
              <Input
                type="text"
                defaultValue={user.lastName}
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
