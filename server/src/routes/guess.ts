import { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { authenticate } from "../plugins/authenticate";

interface Guess {
  firstTeamPoints: number | null;
  secondTeamPoints: number | null;
}

export async function guessRoutes(fastify: FastifyInstance) {
  fastify.get("/guesses/count", async () => {
    const count = await prisma.guess.count();

    return { count };
  });

  fastify.post(
    "/pools/:poolId/games/:gameId/guesses",
    {
      onRequest: [authenticate],
    },
    async (request, reply) => {
      const createGuessParams = z.object({
        poolId: z.string(),
        gameId: z.string(),
      });

      const { poolId, gameId } = createGuessParams.parse(request.params);

      const createGuessBody = z.object({
        firstTeamPoints: z.number(),
        secondTeamPoints: z.number(),
      });

      const { firstTeamPoints, secondTeamPoints } = createGuessBody.parse(
        request.body
      );

      const game = await prisma.game.findUnique({
        where: {
          id: gameId,
        },
      });

      if (!game) {
        return reply.status(400).send({
          message: "Game doesn't exist",
        });
      }

      const participant = await prisma.participant.findUnique({
        where: {
          userId_poolId: {
            poolId,
            userId: request.user.sub,
          },
        },
      });

      if (!participant) {
        return reply.status(400).send({
          message: "You're not allowed to create a guess in this pool",
        });
      }

      const guess = await prisma.guess.findUnique({
        where: {
          participantId_gameId: {
            participantId: participant.id,
            gameId,
          },
        },
      });

      if (guess) {
        return reply.status(400).send({
          message: "You already created a guess in this pool for this game",
        });
      }

      if (game.date < new Date()) {
        return reply.status(400).send({
          message: "You cannot create a guess after game ended",
        });
      }

      await prisma.guess.create({
        data: {
          firstTeamPoints,
          secondTeamPoints,
          gameId,
          participantId: participant.id,
        },
      });

      return reply.status(201).send();
    }
  );

  fastify.get(
    "/pools/:poolId/games/:gameId/guesses",
    {
      onRequest: [authenticate],
    },
    async (request, reply) => {
      const createGuessParams = z.object({
        poolId: z.string(),
        gameId: z.string(),
      });

      const { poolId, gameId } = createGuessParams.parse(request.params);

      const participant = await prisma.participant.findUnique({
        where: {
          userId_poolId: {
            poolId,
            userId: request.user.sub,
          },
        },
      });

      let guess: Guess;
      if (!participant) {
        guess = {
          firstTeamPoints: null,
          secondTeamPoints: null,
        };
      } else {
        guess = (await prisma.guess.findUnique({
          where: {
            participantId_gameId: {
              gameId,
              participantId: participant.id,
            },
          },
          select: {
            firstTeamPoints: true,
            secondTeamPoints: true,
          },
        })) as Guess;
      }

      return guess;
    }
  );
}
