function __() {
    return ({} as any as import("@trpc-server/trpc-server.service").TRPCServerService).getRouter();
}

export type Router = ReturnType<typeof __>;
