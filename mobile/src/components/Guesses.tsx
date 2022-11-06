import { useEffect, useState } from "react";
import { Box, FlatList, useToast } from "native-base";

import { api } from "../services/api";
import { Game, GameProps } from "./Game";
import { Loading } from "./Loading";
interface Props {
  poolId: string;
}

export function Guesses({ poolId }: Props) {
  const [isLoading, setIsLoading] = useState(true);
  const [games, setGames] = useState<GameProps[]>([]);

  const toast = useToast();

  async function fetchGames() {
    try {
      setIsLoading(true);

      const gamesResponse = await api.get(`/pools/${poolId}/games`);
      setGames(gamesResponse.data.games);
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

  useEffect(() => {
    fetchGames();
  }, [poolId]);

  if (isLoading) return <Loading />;

  return (
    <FlatList
      data={games}
      keyExtractor={(game) => game.id}
      renderItem={({ item: game }) => (
        <Game data={game} poolId={poolId} fetchGames={fetchGames} />
      )}
    />
  );
}
