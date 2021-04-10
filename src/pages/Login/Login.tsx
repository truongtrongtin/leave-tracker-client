import {
  Alert,
  AlertDescription,
  AlertIcon,
  Box,
  Button,
  CircularProgress,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Heading,
  Input,
  Text,
} from '@chakra-ui/react';
import { yupResolver } from '@hookform/resolvers/yup';
import AppLink from 'components/AppLink';
import PasswordInput from 'components/PasswordInput';
import ability, { defineRulesFor } from 'config/ability';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useQueryClient } from 'react-query';
import { fetchData } from 'services/fetchData';
import { User } from 'types/user';
import { Redirect, useLocation } from 'wouter';
import * as yup from 'yup';

type LoginInputs = {
  email: string;
  password: string;
};

const loginSchema = yup.object().shape({
  email: yup.string().required().email(),
  password: yup.string().required(),
});

export default function Login() {
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const currentUser: User | undefined = queryClient.getQueryData('currentUser');
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(loginSchema),
  });

  const onSubmit = async ({ email, password }: LoginInputs) => {
    setIsLoading(true);
    try {
      await fetchData('/auth/login', {
        method: 'POST',
        body: new URLSearchParams({ email, password }),
      });
      const user = await fetchData('/auth/me');
      queryClient.setQueryData('currentUser', user);
      ability.update(defineRulesFor(user));
      setIsLoading(false);
      setError('');
      setLocation('/');
    } catch (error) {
      setError(error.message);
      setIsLoading(false);
    }
  };

  if (currentUser) return <Redirect to="/" />;
  return (
    <Flex align="center" height="100vh" justifyContent="center">
      <Box width="400px" p={8} borderWidth={1} borderRadius={8} boxShadow="lg">
        <Box textAlign="center">
          <Heading>Login</Heading>
        </Box>
        <Box my={4}>
          <form noValidate onSubmit={handleSubmit(onSubmit)}>
            {error && (
              <Alert my={4} status="error" borderRadius={4}>
                <AlertIcon />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <FormControl isRequired isInvalid={Boolean(errors.email)}>
              <FormLabel htmlFor="email">Email</FormLabel>
              <Input autoFocus type="email" {...register('email')} />
              <FormErrorMessage>{errors.email?.message}</FormErrorMessage>
            </FormControl>
            <FormControl isRequired isInvalid={Boolean(errors.password)} mt={6}>
              <FormLabel htmlFor="password">Password</FormLabel>
              <PasswordInput {...register('password')} />
              <FormErrorMessage>{errors.password?.message}</FormErrorMessage>
            </FormControl>
            <Button
              width="full"
              colorScheme="teal"
              variant="outline"
              type="submit"
              mt={8}
            >
              {isLoading ? (
                <CircularProgress isIndeterminate size="24px" />
              ) : (
                'Sign in'
              )}
            </Button>
          </form>
        </Box>
        <Box textAlign="center">
          <Text>
            Not a member?{' '}
            <AppLink color="teal" href="/signup">
              Signup now
            </AppLink>
          </Text>
        </Box>
      </Box>
    </Flex>
  );
}
