import { useEffect, useState } from "react";
import { Button, HStack, Text, useTheme, useToast, VStack } from "native-base";
import { X, Check } from "phosphor-react-native";
import { getName } from "country-list";
import dayjs from "dayjs";
import ptBR from "dayjs/locale/pt-br";

import { api } from "../services/api";

import { Team } from "./Team";
import { AxiosError } from "axios";

interface GuessProps {
  id: string;
  gameId: string;
  createdAt: string;
  participantId: string;
  firstTeamPoints: number;
  secondTeamPoints: number;
}

export interface GameProps {
  id: string;
  date: string;
  firstTeamCountryCode: string;
  secondTeamCountryCode: string;
  guess: null | GuessProps;
}

interface Props {
  data: GameProps;
  poolId: string;
  fetchGames: () => void;
}

export function Game({ data, poolId, fetchGames }: Props) {
  const [isLoading, setIsLoading] = useState(false);
  const [firstTeamPoints, setFirstTeamPoints] = useState<string | undefined>(
    ""
  );
  const [secondTeamPoints, setSecondTeamPoints] = useState<string | undefined>(
    ""
  );

  const { colors, sizes } = useTheme();
  const toast = useToast();

  const formattedDate = dayjs(data.date)
    .locale(ptBR)
    .format("DD [de] MMMM [de] YYYY [às] HH:00[h]");

  async function handleGuessConfirm() {
    try {
      setIsLoading(true);

      if (!firstTeamPoints?.trim() || !secondTeamPoints?.trim()) {
        return toast.show({
          title: "Informe o placar do palpite",
          placement: "top",
          bgColor: "red.500",
        });
      }

      await api.post(`/pools/${poolId}/games/${data.id}/guesses`, {
        firstTeamPoints: Number(firstTeamPoints),
        secondTeamPoints: Number(secondTeamPoints),
      });

      fetchGames();
    } catch (error) {
      console.error(error);

      const axiosError = error as AxiosError;
      const responseData = axiosError.response?.data as { message: string };

      if (responseData.message) {
        return toast.show({
          title: responseData.message,
          placement: "top",
          bgColor: "red.500",
        });
      }

      toast.show({
        title: "Não foi possível salvar o palpite",
        placement: "top",
        bgColor: "red.500",
      });
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (!data.guess) {
      setFirstTeamPoints(undefined);
      setSecondTeamPoints(undefined);
    } else {
      setFirstTeamPoints(String(data.guess.firstTeamPoints));
      setSecondTeamPoints(String(data.guess.secondTeamPoints));
    }
  }, [data.guess]);

  return (
    <VStack
      w="full"
      bgColor="gray.800"
      rounded="sm"
      alignItems="center"
      borderBottomWidth={3}
      borderBottomColor="yellow.500"
      mb={3}
      p={4}
    >
      <Text color="gray.100" fontFamily="heading" fontSize="sm">
        {getName(data.firstTeamCountryCode)} vs.{" "}
        {getName(data.secondTeamCountryCode)}
      </Text>

      <Text color="gray.200" fontSize="xs">
        {formattedDate}
      </Text>

      <HStack
        mt={4}
        w="full"
        justifyContent="space-between"
        alignItems="center"
      >
        <Team
          code={data.firstTeamCountryCode}
          position="right"
          onChangeText={setFirstTeamPoints}
          value={firstTeamPoints}
        />

        <X color={colors.gray[300]} size={sizes[6]} />

        <Team
          code={data.secondTeamCountryCode}
          position="left"
          onChangeText={setSecondTeamPoints}
          value={secondTeamPoints}
        />
      </HStack>

      {!data.guess && (
        <Button
          size="xs"
          w="full"
          bgColor="green.500"
          mt={4}
          onPress={handleGuessConfirm}
          isLoading={isLoading}
        >
          <HStack alignItems="center">
            <Text color="white" fontSize="xs" fontFamily="heading" mr={3}>
              CONFIRMAR PALPITE
            </Text>

            <Check color={colors.white} size={sizes[4]} />
          </HStack>
        </Button>
      )}
    </VStack>
  );
}
