import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";

export const loadGeist = async () => {
  await loadFont({
    family: "Geist",
    url: staticFile("fonts/Geist-Variable.woff2"),
    weight: "100 900",
  });
};

export const loadGeistMono = async () => {
  await loadFont({
    family: "Geist Mono",
    url: staticFile("fonts/GeistMono-Variable.woff2"),
    weight: "100 900",
  });
};

export const FONT_FAMILY = "Geist, sans-serif";
export const MONO_FONT_FAMILY = "Geist Mono, monospace";
