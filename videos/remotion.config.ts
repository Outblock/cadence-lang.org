import { Config } from "@remotion/cli/config";
import { enableTailwind } from "@remotion/tailwind-v4";

Config.overrideWebpackConfig((currentConfiguration) => {
  return enableTailwind(currentConfiguration);
});

// Required for proper Three.js rendering
Config.setChromiumOpenGlRenderer("angle");
