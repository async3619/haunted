import { TRPCServerService } from "@trpc-server/trpc-server.service";

export type Router = ReturnType<TRPCServerService["getRouter"]>;
