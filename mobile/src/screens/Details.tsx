import { useEffect, useState } from "react";
import { useRoute } from "@react-navigation/native";
import { HStack, Text, useToast, VStack } from "native-base";

import { Header } from "../components/Header";
import { api } from "../services/api";
import { Loading } from "../components/Loading";
import { PoolCardProps } from "../components/PoolCard";
import { PoolHeader } from "../components/PoolHeader";
import { EmptyMyPoolList } from "../components/EmptyMyPoolList";
import { Option } from "../components/Option";
import { Share } from "react-native";
import { Guesses } from "../components/Guesses";
import { EmptyRakingList } from "../components/EmptyRakingList";

interface RouteParams {
  id: string;
}

type OptionTitle = "Seus palpites" | "Ranking do grupo";
const optionTitles: OptionTitle[] = ["Seus palpites", "Ranking do grupo"];

export function Details() {
  const [isLoading, setIsLoading] = useState(true);
  const [poolDetails, setPoolDetails] = useState<PoolCardProps>(
    {} as PoolCardProps
  );
  const [optionSelected, setOptionSelected] =
    useState<OptionTitle>("Seus palpites");

  const toast = useToast();

  const route = useRoute();
  const { id } = route.params as RouteParams;

  async function fetchPoolDetails() {
    try {
      setIsLoading(true);

      const poolDetailResponse = await api.get(`/pools/${id}`);

      setPoolDetails(poolDetailResponse.data);
    } catch (error) {
      console.error(error);

      toast.show({
        title: "Não foi possível carregar os detalhes do bolão",
        placement: "top",
        bgColor: "red.500",
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function handlePoolCodeShare() {
    await Share.share({
      message: poolDetails.code,
    });
  }

  useEffect(() => {
    fetchPoolDetails();
  }, [id]);

  if (isLoading) return <Loading />;

  return (
    <VStack flex={1} bgColor="gray.900">
      <Header
        title={poolDetails.title}
        showBackButton
        showShareButton
        onShareButtonPress={handlePoolCodeShare}
      />

      <VStack px={5} flex={1}>
        <PoolHeader data={poolDetails} />

        {poolDetails?._count?.participants === 0 ? (
          <EmptyMyPoolList code={poolDetails.code} />
        ) : (
          <>
            <HStack bgColor="gray.800" rounded="sm" mb={5}>
              {optionTitles.map((option) => (
                <Option
                  key={option}
                  title={option}
                  isSelected={optionSelected === option}
                  onPress={() => setOptionSelected(option)}
                />
              ))}
            </HStack>

            {optionSelected === "Seus palpites" ? (
              <Guesses poolId={poolDetails.id} />
            ) : (
              <EmptyRakingList />
            )}
          </>
        )}
      </VStack>
    </VStack>
  );
}
