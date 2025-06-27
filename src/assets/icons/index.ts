// Browser icons
import chromeIcon from "../icons8-chrome-48.png";
import firefoxIcon from "../firefox.png";
import safariIcon from "../icons8-safari-48.png";
import edgeIcon from "../icons8-edge-48.png";
import operaIcon from "../icons8-opera-48.png";

// OS icons
import windowsIcon from "../icons8-windows-10-48.png";
import macosIcon from "../icons8-macos-48.png";
import linuxIcon from "../icons8-linux-48.png";
import androidIcon from "../icons8-android-48.png";
import iPhoneIcon from "../icons8-macos-48-m.png";

export const browserIcons = {
  chrome: chromeIcon,
  firefox: firefoxIcon,
  safari: safariIcon,
  edge: edgeIcon,
  opera: operaIcon,
};

export const osIcons = {
  windows: windowsIcon,
  macos: macosIcon,
  mac: macosIcon,
  linux: linuxIcon,
  android: androidIcon,
  iphone   : iPhoneIcon,
};

export const getBrowserIcon = (browserName: string): string | null => {
  const lowerName = browserName.toLowerCase();

  if (lowerName.includes("chrome")) return browserIcons.chrome;
  if (lowerName.includes("firefox")) return browserIcons.firefox;
  if (lowerName.includes("safari")) return browserIcons.safari;
  if (lowerName.includes("edge")) return browserIcons.edge;
  if (lowerName.includes("opera")) return browserIcons.opera;

  return null;
};

export const getOSIcon = (osName: string): string | null => {
  const lowerName = osName.toLowerCase();

  if (lowerName.includes("windows")) return osIcons.windows;
  if (lowerName.includes("macos") || lowerName.includes("mac"))
    return osIcons.macos;
  if (lowerName.includes("linux") || lowerName.includes("ubuntu") || lowerName.includes("debian") || lowerName.includes("fedora") || lowerName.includes("centos") || lowerName.includes("arch"))
    return osIcons.linux;
  if (lowerName.includes("android")) return osIcons.android;
  if (lowerName.includes("ios")) return osIcons.iphone;

  return null;
};
