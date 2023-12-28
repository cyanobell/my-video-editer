import { Config } from "@remotion/cli/config"

Config.setStudioPort(8123);
Config.setEntryPoint("./src/remotionStudios/index.ts");
Config.setCachingEnabled(true);