import {
  Box,
  Button,
  FormControl,
  FormErrorMessage,
  FormLabel,
  HStack,
  SimpleGrid,
  Text,
  useToast,
} from '@chakra-ui/react';
import { yupResolver } from '@hookform/resolvers/yup';
import { updateCurrentUserPasswordApi, User } from 'api/users';
import PasswordInput from 'components/PasswordInput';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from 'react-query';
import { AnyObjectSchema, object, string } from 'yup';

type PasswordFormProps = {
  isEditing: boolean;
  isDisabled: boolean;
  onEditClick: () => void;
  onCancelClick: () => void;
};

const updatePasswordSchema: AnyObjectSchema = object().shape({
  currentPassword: string().required(),
  newPassword: string().required(),
});

type InputFields = {
  currentPassword: string;
  newPassword: string;
};

export default function PasswordForm({
  isEditing,
  isDisabled,
  onEditClick,
  onCancelClick,
}: PasswordFormProps) {
  const toast = useToast();
  const queryClient = useQueryClient();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<InputFields>({
    resolver: yupResolver(updatePasswordSchema),
  });

  const handleCancelClick = () => {
    onCancelClick();
    reset();
  };

  const updatePassword = useMutation(
    (fields: InputFields) => updateCurrentUserPasswordApi(fields),
    {
      onSuccess: (newUser: User) => {
        queryClient.setQueryData('currentUser', newUser);
        toast({ description: 'Successfully updated', status: 'success' });
        handleCancelClick();
      },
      onError: (error: Error) => {
        toast({ description: error.message, status: 'error' });
      },
    },
  );

  return (
    <Box padding={2}>
      <HStack justifyContent="space-between">
        <Text as="b">Password</Text>
        <Button
          colorScheme="teal"
          variant="link"
          onClick={isEditing ? handleCancelClick : onEditClick}
          isDisabled={isDisabled}
        >
          {isEditing ? 'Cancel' : 'Edit'}
        </Button>
      </HStack>
      {isEditing ? (
        <form
          noValidate
          onSubmit={handleSubmit((fields) => updatePassword.mutate(fields))}
        >
          <SimpleGrid columns={2} spacing={2} mt={4}>
            <FormControl isInvalid={Boolean(errors.currentPassword)}>
              <FormLabel htmlFor="currentPassword">Current password</FormLabel>
              <PasswordInput
                id="currentPassword"
                {...register('currentPassword')}
              />
              <FormErrorMessage>
                {errors.currentPassword?.message}
              </FormErrorMessage>
            </FormControl>
            <FormControl isInvalid={Boolean(errors.newPassword)}>
              <FormLabel htmlFor="newPassword">New password</FormLabel>
              <PasswordInput id="newPassword" {...register('newPassword')} />
              <FormErrorMessage>{errors.newPassword?.message}</FormErrorMessage>
            </FormControl>
          </SimpleGrid>
          <Button
            marginTop={3}
            colorScheme="blue"
            type="submit"
            isLoading={updatePassword.isLoading}
          >
            Save
          </Button>
        </form>
      ) : (
        <Text>1 month from last update</Text>
      )}
    </Box>
  );
}
