import { useCallback, useState } from "react";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { VStack, Icon, useToast, FlatList } from "native-base";
import { Octicons } from "@expo/vector-icons";

import { api } from "../services/api";

import { Button } from "../components/Button";
import { Header } from "../components/Header";
import { Loading } from "../components/Loading";
import { PoolCard, PoolCardProps } from "../components/PoolCard";
import { EmptyPoolList } from "../components/EmptyPoolList";

export function Pools() {
  const [isLoading, setIsLoading] = useState(false);
  const [pools, setPools] = useState<PoolCardProps[]>([]);

  const { navigate } = useNavigation();
  const toast = useToast();

  async function fetchPools() {
    try {
      setIsLoading(true);
      const poolListResponse = await api.get("/pools");

      setPools(poolListResponse.data.pools);
    } catch (error) {
      console.error(error);

      toast.show({
        title: "Não foi possível carregar os bolões",
        placement: "top",
        bgColor: "red.500",
      });
    } finally {
      setIsLoading(false);
    }
  }

  useFocusEffect(
    useCallback(() => {
      fetchPools();
    }, [])
  );

  return (
    <VStack flex={1} bg="gray.900">
      <Header title="Meus bolões" />
      <VStack
        mt={6}
        mx={5}
        borderBottomWidth={1}
        borderBottomColor="gray.600"
        pb={4}
        mb={4}
      >
        <Button
          label="BUSCAR BOLÃO POR CÓDIGO"
          leftIcon={
            <Icon as={Octicons} name="search" color="black" size="md" />
          }
          onPress={() => navigate("find")}
        />
      </VStack>

      {isLoading ? (
        <Loading />
      ) : (
        <FlatList
          data={pools}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <PoolCard
              data={item}
              onPress={() => navigate("details", { id: item.id })}
            />
          )}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={EmptyPoolList}
          px={5}
          _contentContainerStyle={{ pb: 10 }}
        />
      )}
    </VStack>
  );
}
