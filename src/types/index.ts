export type ArrayElement<A> = A extends readonly (infer T)[] ? T : never;

export type Game = {
  npCommunicationId: string;
  titleId: string;
  name: string;
  genres: GameGenres[];
  description: string;
  iconUrl: string;
  coverUrl: string;
  screenshots: string[];
  previewVideoUrl: string | null;
  publisher: string;
  developer: string | null;
  platforms: GamePlatforms[];
  psStoreUrl: string;
  platPricesUrl: string;
  rating: string | null;
  ps4Size: bigint | null;
  ps5Size: bigint | null;
};

export const GameGenres = [
  "RPG",
  "Action",
  "Adventure",
  "TPS",
  "FPS",
  "MMO",
  "Platformer",
  "Fighting",
  "Simulation",
  "Arcade",
  "Strategy",
  "Sports",
  "Puzzle",
  "Music",
  "Racing",
  "Horror",
  "IntStory",
] as const;

export type GameGenres = typeof GameGenres[number];

export const GamePlatforms = ["PS4", "PS5"] as const;

export type GamePlatforms = typeof GamePlatforms[number];
