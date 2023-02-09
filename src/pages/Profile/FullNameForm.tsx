import {
  Box,
  Button,
  FormControl,
  FormErrorMessage,
  FormLabel,
  HStack,
  Input,
  SimpleGrid,
  Text,
  useToast,
} from '@chakra-ui/react';
import { yupResolver } from '@hookform/resolvers/yup';
import { editCurrentUserApi, User } from 'api/users';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from 'react-query';
import { object, string } from 'yup';

type FullNameFormProps = {
  isEditing: boolean;
  isDisabled: boolean;
  onEditClick: () => void;
  onCancelClick: () => void;
  firstName: string;
  lastName: string;
};

const usernameSchema = object().shape({
  firstName: string().required(),
  lastName: string().required(),
});

type InputFields = {
  firstName: string;
  lastName: string;
};

export default function FullNameForm({
  isEditing,
  isDisabled,
  onEditClick,
  onCancelClick,
  firstName,
  lastName,
}: FullNameFormProps) {
  const toast = useToast();
  const queryClient = useQueryClient();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<InputFields>({
    resolver: yupResolver(usernameSchema),
    defaultValues: { firstName, lastName },
  });

  const handleCancelClick = () => {
    onCancelClick();
    reset();
  };

  const updateUserName = useMutation(
    (fields: InputFields) => editCurrentUserApi(fields),
    {
      onSuccess: (newUser: User) => {
        queryClient.setQueryData('currentUser', newUser);
        toast({ description: 'Successfully updated', status: 'success' });
        onCancelClick();
      },
      onError: (error: Error) => {
        toast({ description: error.message, status: 'error' });
      },
    },
  );

  return (
    <Box padding={2}>
      <HStack justifyContent="space-between">
        <Text as="b">Full name</Text>
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
          onSubmit={handleSubmit((fields) => updateUserName.mutate(fields))}
        >
          <SimpleGrid columns={2} spacing={2}>
            <FormControl isInvalid={Boolean(errors.firstName)}>
              <FormLabel htmlFor="firstName">First name</FormLabel>
              <Input type="text" id="firstName" {...register('firstName')} />
              <FormErrorMessage>{errors.firstName?.message}</FormErrorMessage>
            </FormControl>
            <FormControl isInvalid={Boolean(errors.lastName)}>
              <FormLabel htmlFor="lastName">Last name</FormLabel>
              <Input type="text" id="lastName" {...register('lastName')} />
              <FormErrorMessage>{errors.lastName?.message}</FormErrorMessage>
            </FormControl>
          </SimpleGrid>
          <Button
            marginTop={3}
            colorScheme="blue"
            type="submit"
            isLoading={updateUserName.isLoading}
          >
            Save
          </Button>
        </form>
      ) : (
        <Text>
          {firstName} {lastName}
        </Text>
      )}
    </Box>
  );
}
