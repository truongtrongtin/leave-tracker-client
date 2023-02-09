import {
  Box,
  Button,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Heading,
  Text,
  useToast,
} from '@chakra-ui/react';
import { yupResolver } from '@hookform/resolvers/yup';
import { resetPasswordApi } from 'api/auth';
import AppLink from 'components/AppLink';
import PasswordInput from 'components/PasswordInput';
import { useQueryParams } from 'hooks/useQueryParams';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useLocation } from 'wouter';
import { object, Schema, string } from 'yup';

type PasswordResetInputs = {
  newPassword: string;
};

const passwordResetSchema: Schema<PasswordResetInputs> = object().shape({
  newPassword: string().required(),
});

export default function PasswordReset() {
  const toast = useToast();
  const [, setLocation] = useLocation();
  const params = useQueryParams();
  const [isLoading, setIsLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PasswordResetInputs>({
    resolver: yupResolver(passwordResetSchema),
  });

  const onSubmit = async ({ newPassword }: PasswordResetInputs) => {
    setIsLoading(true);
    try {
      await resetPasswordApi(params['token'], newPassword);
      setIsLoading(false);
      toast({ description: 'Password updated', status: 'success' });
      setLocation('/login');
    } catch (error) {
      if (error instanceof Error) {
        console.log(error);
        setIsLoading(false);
        toast({ description: error.message, status: 'error' });
      }
    }
  };

  return (
    <Flex align="center" height="100vh" justifyContent="center">
      <Box width="400px" p={8} borderWidth={1} borderRadius={8} boxShadow="lg">
        <Box textAlign="center">
          <Heading>Update password</Heading>
        </Box>
        <Text mt={4}>Enter your new password</Text>
        <Box my={4}>
          <form noValidate onSubmit={handleSubmit(onSubmit)}>
            <FormControl
              isRequired
              isInvalid={Boolean(errors.newPassword)}
              mt={6}
            >
              <FormLabel htmlFor="newPassword">New password</FormLabel>
              <PasswordInput id="newPassword" {...register('newPassword')} />
              <FormErrorMessage>{errors.newPassword?.message}</FormErrorMessage>
            </FormControl>
            <Button
              width="full"
              colorScheme="teal"
              variant="outline"
              type="submit"
              mt={5}
              isLoading={isLoading}
            >
              Change password
            </Button>
          </form>
        </Box>
        <Box textAlign="center">
          <AppLink color="teal" href="/login">
            Back to signin
          </AppLink>
        </Box>
      </Box>
    </Flex>
  );
}
