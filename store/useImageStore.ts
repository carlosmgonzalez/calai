import { create } from "zustand";

interface BearState {
  image: {
    base64: string;
    uri: string;
  } | null;
  setImage: (image: { base64: string; uri: string }) => void;
  setNullImage: () => void;
}

export const useImageStore = create<BearState>()((set) => ({
  image: null,
  setImage: (image) =>
    set(() => ({ image: { base64: image.base64, uri: image.uri } })),
  setNullImage: () => set(() => ({ image: null })),
}));
