export type ArrayElement<A> = A extends readonly (infer T)[] ? T : never;

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
