import App from "@root/app";

import Config from "@utils/config";

(async () => {
    try {
        const app = await App.initialize();
        await app.start();
    } catch (e) {}

    if (process.env.NODE_ENV === "development") {
        await Config.dumpConfigSchema("./haunted.schema.json");
    }
})();

export { TRPCServerRouter } from "@server/trpc";
