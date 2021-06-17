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
import { User } from 'api/users';
import ReactDatePicker from 'react-datepicker';
import { Controller, useForm } from 'react-hook-form';
import * as yup from 'yup';
import PasswordInput from './PasswordInput';

type UserSettingProps = {
  user: User;
  onClose: () => void;
  isLoading: boolean;
  onSubmit: (newUserSettings: NewUserSettings) => void;
};

export type NewUserSettings = {
  firstName: string;
  lastName: string;
  password?: string;
  newPassword?: string;
  dateOfBirth?: Date;
};

const userSettingSchema = yup.object().shape({
  firstName: yup.string().required(),
  lastName: yup.string().required(),
  password: yup.string().notRequired(),
  newPassword: yup.string().notRequired(),
});

function UserSetting({ user, onClose, isLoading, onSubmit }: UserSettingProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
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
            <FormControl
              style={{ zIndex: 1 }}
              isInvalid={Boolean(errors.dateOfBirth)}
            >
              <FormLabel htmlFor="dateOfBirth">Date of Birth</FormLabel>
              <Controller
                name="dateOfBirth"
                control={control}
                defaultValue={
                  user.dateOfBirth ? new Date(user.dateOfBirth) : null
                }
                render={({ field: { value, onChange } }) => (
                  <ReactDatePicker
                    selected={value}
                    onChange={onChange}
                    dateFormat="MMM d, yyyy"
                    placeholderText="Date of birth"
                    showYearDropdown
                  />
                )}
              />
              <FormErrorMessage>{errors.lastName?.message}</FormErrorMessage>
            </FormControl>
          </SimpleGrid>
          <SimpleGrid columns={2} spacing={2} mt={4}>
            <FormControl isInvalid={Boolean(errors.password)}>
              <FormLabel htmlFor="password">Current password</FormLabel>
              <PasswordInput {...register('password')} />
              <FormErrorMessage>{errors.password?.message}</FormErrorMessage>
            </FormControl>
            <FormControl isInvalid={Boolean(errors.newPassword)}>
              <FormLabel htmlFor="newPassword">New password</FormLabel>
              <PasswordInput {...register('newPassword')} />
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
