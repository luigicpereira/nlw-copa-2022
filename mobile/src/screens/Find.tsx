import { Heading, VStack } from "native-base";

import { Header } from "../components/Header";

import { Input } from "../components/Input";
import { Button } from "../components/Button";

export function Find() {
  return (
    <VStack flex={1} bg="gray.900">
      <Header title="Buscar por código" showBackButton={true} />

      <VStack mx={5} alignItems="center">
        <Heading
          fontFamily="heading"
          color="white"
          fontSize="xl"
          my={8}
          textAlign="center"
        >
          Encontre um bolão através de seu código único
        </Heading>

        <Input mb={2} placeholder="Qual o código do bolão?" />

        <Button label="BUSCAR BOLÃO" />
      </VStack>
    </VStack>
  );
}
