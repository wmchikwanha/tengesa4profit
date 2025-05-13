
/// <reference types="vite/client" />

interface Navigator {
  canShare?: (data: { files?: File[] }) => boolean;
}
