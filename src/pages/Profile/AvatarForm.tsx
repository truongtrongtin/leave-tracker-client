import {
  Avatar,
  Box,
  Button,
  FormControl,
  FormErrorMessage,
  HStack,
  Input,
  SimpleGrid,
  Text,
  useToast,
} from '@chakra-ui/react';
import { editCurrentUserAvatarApi, User } from 'api/users';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from 'react-query';

type AvatarFormProps = {
  isEditing: boolean;
  isDisabled: boolean;
  onEditClick: () => void;
  onCancelClick: () => void;
  avatar: string;
};

type InputFields = {
  files: FileList;
};

export default function AvatarForm({
  isEditing,
  isDisabled,
  onEditClick,
  onCancelClick,
  avatar,
}: AvatarFormProps) {
  const toast = useToast();
  const queryClient = useQueryClient();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<InputFields>();

  const handleCancelClick = () => {
    onCancelClick();
    reset();
  };

  const updateAvatar = useMutation(
    (fields: InputFields) => {
      const formData = new FormData();
      formData.append('file', fields.files[0]);
      return editCurrentUserAvatarApi(formData);
    },
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
        <Text as="b">Avatar</Text>
        <Button
          colorScheme="teal"
          variant="link"
          onClick={() => {
            isEditing ? handleCancelClick() : onEditClick();
          }}
          isDisabled={isDisabled}
        >
          {isEditing ? 'Cancel' : 'Edit'}
        </Button>
      </HStack>
      {isEditing ? (
        <form
          noValidate
          onSubmit={handleSubmit((fields) => updateAvatar.mutate(fields))}
        >
          <SimpleGrid columns={2} spacing={2}>
            <FormControl isInvalid={Boolean(errors.files)}>
              <Input type="file" id="files" {...register('files')} />
              <FormErrorMessage>{errors.files?.message}</FormErrorMessage>
            </FormControl>
          </SimpleGrid>
          <Button
            marginTop={3}
            colorScheme="blue"
            type="submit"
            isLoading={updateAvatar.isLoading}
          >
            Save
          </Button>
        </form>
      ) : (
        <Avatar src={avatar} />
      )}
    </Box>
  );
}
