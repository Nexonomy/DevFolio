-- Projects can be flagged as currently in development.
ALTER TABLE "Game" ADD COLUMN "inDevelopment" BOOLEAN NOT NULL DEFAULT false;

-- Keep each game's old detailed genre as a category (unless it is already one).
UPDATE "Game"
SET "categories" = array_append("categories", "tag")
WHERE "portfolioSection" = 'GAME'
  AND "tag" NOT IN ('Casual & Puzzle', 'Platformer & Arcade', 'Action & Shooter', 'Multiplayer & Sports', 'Simulation', 'Horror & Adventure', 'AR/VR & Tools')
  AND NOT EXISTS (SELECT 1 FROM unnest("categories") AS existing WHERE lower(existing) = lower("tag"));

-- Fold the many specific genres into seven broad ones. Anything unrecognised is left as is.
UPDATE "Game"
SET "tag" = CASE
  WHEN "tag" ~* '(horror|adventure)' THEN 'Horror & Adventure'
  WHEN "tag" ~* '(\mar\M|\mxr\M|\mvr\M|bridge|tool)' THEN 'AR/VR & Tools'
  WHEN "tag" ~* 'simulation' THEN 'Simulation'
  WHEN "tag" ~* '(multiplayer|racing|sport|pvp)' THEN 'Multiplayer & Sports'
  WHEN "tag" ~* '(shooter|fps|action|roguelike|survival)' THEN 'Action & Shooter'
  WHEN "tag" ~* '(platform|arcade|runner)' THEN 'Platformer & Arcade'
  WHEN "tag" ~* '(casual|puzzle)' THEN 'Casual & Puzzle'
  ELSE "tag"
END
WHERE "portfolioSection" = 'GAME'
  AND "tag" NOT IN ('Casual & Puzzle', 'Platformer & Arcade', 'Action & Shooter', 'Multiplayer & Sports', 'Simulation', 'Horror & Adventure', 'AR/VR & Tools');
