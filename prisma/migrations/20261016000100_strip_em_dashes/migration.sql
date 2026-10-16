-- Removes em dashes (U+2014, chr(8212)) from stored profile and project text.
-- Date ranges ("Aug 2025 <dash> Present") get a hyphen, "<dash> UMT" becomes "(UMT)",
-- and any other spaced dash becomes a comma. A lone dash becomes a hyphen.
CREATE FUNCTION strip_em_dash(t text) RETURNS text
LANGUAGE sql IMMUTABLE AS $$
  SELECT replace(
    replace(
      replace(
        regexp_replace(t, '(\d{4}) ' || chr(8212) || ' ', '\1 - ', 'g'),
        ' ' || chr(8212) || ' UMT', ' (UMT)'),
      ' ' || chr(8212) || ' ', ', '),
    chr(8212), '-')
$$;

UPDATE "Profile" SET
  "name" = strip_em_dash("name"),
  "heroEyebrow" = strip_em_dash("heroEyebrow"),
  "heroLead" = strip_em_dash("heroLead"),
  "heroAccent" = strip_em_dash("heroAccent"),
  "heroSubtitle" = strip_em_dash("heroSubtitle"),
  "bioTitle" = strip_em_dash("bioTitle"),
  "bioParagraphs" = strip_em_dash("bioParagraphs"::text)::jsonb,
  "values" = strip_em_dash("values"::text)::jsonb,
  "sectionCopy" = strip_em_dash("sectionCopy"::text)::jsonb,
  "tools" = strip_em_dash("tools"::text)::jsonb,
  "experiences" = strip_em_dash("experiences"::text)::jsonb;

UPDATE "Game" SET
  "title" = strip_em_dash("title"),
  "description" = strip_em_dash("description"),
  "tag" = strip_em_dash("tag"),
  "tech" = strip_em_dash("tech"),
  "role" = strip_em_dash("role"),
  "contribution" = strip_em_dash("contribution"),
  "recognition" = strip_em_dash("recognition"),
  "platforms" = strip_em_dash("platforms"),
  "categories" = ARRAY(SELECT strip_em_dash(e) FROM unnest("categories") WITH ORDINALITY AS u(e, i) ORDER BY i),
  "contributions" = ARRAY(SELECT strip_em_dash(e) FROM unnest("contributions") WITH ORDINALITY AS u(e, i) ORDER BY i),
  "team" = ARRAY(SELECT strip_em_dash(e) FROM unnest("team") WITH ORDINALITY AS u(e, i) ORDER BY i),
  "features" = ARRAY(SELECT strip_em_dash(e) FROM unnest("features") WITH ORDINALITY AS u(e, i) ORDER BY i),
  "highlights" = ARRAY(SELECT strip_em_dash(e) FROM unnest("highlights") WITH ORDINALITY AS u(e, i) ORDER BY i);

UPDATE "Screenshot" SET "alt" = strip_em_dash("alt");
UPDATE "Video" SET "title" = strip_em_dash("title");

DROP FUNCTION strip_em_dash(text);
