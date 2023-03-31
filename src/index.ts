import App from "@root/app";

(async () => {
    try {
        const app = await App.initialize();
        await app.start();
    } catch (e) {}
})();
