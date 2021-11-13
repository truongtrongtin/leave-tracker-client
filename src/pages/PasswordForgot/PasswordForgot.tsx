import {
  Box,
  Button,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Heading,
  Input,
  Text,
} from '@chakra-ui/react';
import { yupResolver } from '@hookform/resolvers/yup';
import { requestPasswordResetApi } from 'api/auth';
import AppLink from 'components/AppLink';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { object, SchemaOf, string } from 'yup';

type PasswordForgotInputs = {
  email: string;
};

const passwordForgotSchema: SchemaOf<PasswordForgotInputs> = object().shape({
  email: string().required().email(),
});

export default function PasswordForgot() {
  const [isLoading, setIsLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PasswordForgotInputs>({
    resolver: yupResolver(passwordForgotSchema),
  });

  const onSubmit = async ({ email }: PasswordForgotInputs) => {
    setIsLoading(true);
    try {
      await requestPasswordResetApi(
        email,
        `${window.location.origin}/password-reset`,
      );
      setIsLoading(false);
    } catch (error) {
      if (error instanceof Error) {
        console.log(error);
        setIsLoading(false);
      }
    }
  };

  return (
    <Flex align="center" height="100vh" justifyContent="center">
      <Box width="400px" p={8} borderWidth={1} borderRadius={8} boxShadow="lg">
        <Box textAlign="center">
          <Heading>Forgot password</Heading>
        </Box>
        <Text mt={4}>
          Enter your email address and we’ll send you a link to reset your
          password.
        </Text>
        <Box my={4}>
          <form noValidate onSubmit={handleSubmit(onSubmit)}>
            <FormControl isRequired isInvalid={Boolean(errors.email)}>
              <FormLabel htmlFor="email">Email</FormLabel>
              <Input autoFocus id="email" type="email" {...register('email')} />
              <FormErrorMessage>{errors.email?.message}</FormErrorMessage>
            </FormControl>
            <Button
              width="full"
              colorScheme="teal"
              variant="outline"
              type="submit"
              mt={5}
              isLoading={isLoading}
            >
              Send password reset link
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
