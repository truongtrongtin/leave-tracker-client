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
  IconButton,
  Input,
  InputGroup,
  InputRightElement,
  Text,
} from "@chakra-ui/react";
import { yupResolver } from "@hookform/resolvers/yup";
import AppContext from "AppContext";
import AppLink from "components/AppLink";
import ability, { defineRulesFor } from "config/ability";
import React, { useContext, useState } from "react";
import { useForm } from "react-hook-form";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { fetchData } from "services/fetchData";
import { Redirect, useLocation } from "wouter";
import * as yup from "yup";

type LoginInputs = {
  email: string;
  password: string;
};

const loginSchema = yup.object().shape({
  email: yup.string().required().email(),
  password: yup.string().required(),
});

export default function Login() {
  const { currentUser, setCurrentUser } = useContext(AppContext);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [, setLocation] = useLocation();
  const { register, handleSubmit, errors } = useForm({
    resolver: yupResolver(loginSchema),
  });

  const onSubmit = async ({ email, password }: LoginInputs) => {
    setIsLoading(true);
    try {
      await fetchData("/auth/login", {
        method: "POST",
        body: new URLSearchParams({ email, password }),
      });
      const user = await fetchData("/auth/me");
      setCurrentUser(user);
      ability.update(defineRulesFor(user));
      setIsLoading(false);
      setShowPassword(false);
      setError("");
      setLocation("/");
    } catch (error) {
      setError(error.message);
      setIsLoading(false);
      setShowPassword(false);
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
              <Input
                autoFocus
                type="email"
                name="email"
                ref={register}
                size="lg"
              />
              <FormErrorMessage>{errors.email?.message}</FormErrorMessage>
            </FormControl>
            <FormControl isRequired isInvalid={Boolean(errors.password)} mt={6}>
              <FormLabel htmlFor="password">Password</FormLabel>
              <InputGroup size="lg">
                <Input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  ref={register}
                />
                <InputRightElement>
                  <IconButton
                    aria-label="Toggle password"
                    onClick={() => setShowPassword(!showPassword)}
                    icon={
                      showPassword ? (
                        <AiOutlineEyeInvisible />
                      ) : (
                        <AiOutlineEye />
                      )
                    }
                  />
                </InputRightElement>
              </InputGroup>
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
                "Sign in"
              )}
            </Button>
          </form>
        </Box>
        <Box textAlign="center">
          <Text>
            Not a member?{" "}
            <AppLink color="teal.600" href="/signup">
              Signup now
            </AppLink>
          </Text>
        </Box>
      </Box>
    </Flex>
  );
}
