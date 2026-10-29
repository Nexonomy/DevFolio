-- Luggage Frenzy's "View live project" button pointed at its own page on this site,
-- so the link went nowhere. Clear any liveUrl that points back at the portfolio.
UPDATE "Game" SET "liveUrl" = NULL
WHERE "liveUrl" LIKE '%ahsanhere.me%';
