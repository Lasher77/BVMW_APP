declare module '*.png';

declare global {
  interface ExpoProcessEnv {
    EXPO_PUBLIC_API_URL?: string;
    [key: string]: string | undefined;
  }

  // Expo injects a minimal process shim at runtime, which we model here to avoid
  // falling back to the `any` type when reading public env variables.
  const process: {
    env: ExpoProcessEnv;
  };
}

export {};
