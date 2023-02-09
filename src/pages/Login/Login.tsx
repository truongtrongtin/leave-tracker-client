import {
  Alert,
  AlertDescription,
  AlertIcon,
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
import { loginApi } from 'api/auth';
import AppLink from 'components/AppLink';
import PasswordInput from 'components/PasswordInput';
import { AppContext } from 'contexts/AppContext';
import { useQueryParams } from 'hooks/useQueryParams';
import { useContext, useState } from 'react';
import { useForm } from 'react-hook-form';
import { FaFacebook, FaGithub, FaGoogle } from 'react-icons/fa';
import { useQueryClient } from 'react-query';
import { object, Schema, string } from 'yup';

type LoginInputs = {
  email: string;
  password: string;
};

const loginSchema: Schema<LoginInputs> = object().shape({
  email: string().required().email(),
  password: string().required(),
});

export default function Login() {
  const params = useQueryParams();
  const queryClient = useQueryClient();
  const { intendedRoute } = useContext(AppContext);
  const [error, setError] = useState(params['error']);
  const [isLoading, setIsLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInputs>({
    resolver: yupResolver(loginSchema),
  });

  const onSubmit = async ({ email, password }: LoginInputs) => {
    setIsLoading(true);
    try {
      const currentUser = await loginApi(email, password);
      queryClient.setQueryData('currentUser', currentUser);
      setIsLoading(false);
      setError('');
    } catch (error) {
      if (error instanceof Error) setError(error.message);
      setIsLoading(false);
    }
  };

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
              <Input autoFocus id="email" type="email" {...register('email')} />
              <FormErrorMessage>{errors.email?.message}</FormErrorMessage>
            </FormControl>
            <FormControl isRequired isInvalid={Boolean(errors.password)} mt={6}>
              <FormLabel htmlFor="password">Password</FormLabel>
              <PasswordInput id="password" {...register('password')} />
              <FormErrorMessage>{errors.password?.message}</FormErrorMessage>
            </FormControl>
            <Flex justifyContent="flex-end" marginTop={2}>
              <AppLink color="teal" href="/forgot">
                Forgot password?
              </AppLink>
            </Flex>
            <Button
              width="full"
              colorScheme="teal"
              variant="outline"
              type="submit"
              mt={5}
              isLoading={isLoading}
            >
              Sign in
            </Button>
            <Button
              as="a"
              leftIcon={<FaGoogle />}
              width="full"
              variant="outline"
              type="submit"
              mt={8}
              href={`${process.env.REACT_APP_API_URL}/auth/google?intended_url=${window.location.origin}${intendedRoute}`}
            >
              Sign in with Google
            </Button>
            <Button
              as="a"
              leftIcon={<FaFacebook />}
              width="full"
              variant="outline"
              type="submit"
              mt={2}
              href={`${process.env.REACT_APP_API_URL}/auth/facebook?intended_url=${window.location.origin}${intendedRoute}`}
            >
              Sign in with Facebook
            </Button>
            <Button
              as="a"
              leftIcon={<FaGithub />}
              width="full"
              variant="outline"
              type="submit"
              mt={2}
              href={`${process.env.REACT_APP_API_URL}/auth/github?intended_url=${window.location.origin}${intendedRoute}`}
            >
              Sign in with Github
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
