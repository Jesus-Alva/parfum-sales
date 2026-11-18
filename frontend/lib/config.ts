const configuredApiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost/api/v1";
const appLanIp = process.env.NEXT_PUBLIC_APP_LAN_IP?.trim();

export const API_BASE_URL = appLanIp
  ? configuredApiUrl.replace(
      /^(https?:\/\/)(localhost|127\.0\.0\.1)(?=[:/]|$)/,
      `$1${appLanIp}`,
    )
  : configuredApiUrl;
