import { defineConfig } from "vite";
import { getMapsOptimizers, getMapsScripts } from "wa-map-optimizer-vite";

export default defineConfig({
    base: "./",
    build: {
        rollupOptions: {
            input: {
                index: "./index.html",
                jobWallet: "./views/jobWallet/jobWallet.html",
                jobWalletTS: "./views/jobWallet/jobWallet.ts",
                invitationReceived: "./views/lobby/invitationReceived.html",
                playerList: "./views/lobby/playerList.html",
                waitingForAnswer: "./views/lobby/waitingForAnswer.html",
                youAreGoingToBeRedirected: "./views/lobby/youAreGoingToBeRedirected.html",
                ...getMapsScripts("./maps"),
            },
        },
    },
    plugins: [...getMapsOptimizers(undefined, "./maps")],
    server: {
        host: "localhost",
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
            "Access-Control-Allow-Headers": "X-Requested-With, content-type, Authorization",
            "Cache-Control": "no-cache, no-store, must-revalidate",
        },
        open: "/",
    },
});
