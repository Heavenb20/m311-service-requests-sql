-- 04_clean.sql
USE mc311;

DROP TABLE IF EXISTS requests;

CREATE TABLE requests AS
SELECT
  sr_num                                                AS request_id,
  STR_TO_DATE(LEFT(created, 19), '%Y-%m-%dT%H:%i:%s')   AS opened_at,
  STR_TO_DATE(LEFT(NULLIF(closed, ''), 19), '%Y-%m-%dT%H:%i:%s') AS closed_at,
  sr_stat_id                                            AS status,
  department,
  NULLIF(sr_area, '')                                   AS area,
  NULLIF(faq_ques_text, '')                             AS topic,
  CAST(NULLIF(x_sla, '') AS UNSIGNED)                   AS deadline_days,
  CAST(number_of_days_open AS UNSIGNED)                 AS days_open,
  (within_sla_window = 'Yes')                           AS on_time,
  UPPER(TRIM(NULLIF(x_city, '')))                       AS city,
  NULLIF(x_zipcode, '')                                 AS zip,
  NULLIF(sr_subtype_cd, '')                             AS source,
  NULLIF(x_councildist, '')                             AS council_district
FROM requests_raw;

-- Make request_id the primary key
ALTER TABLE requests ADD PRIMARY KEY (request_id);

SELECT COUNT(*) AS total_rows FROM requests;

SELECT COUNT(DISTINCT city) AS distinct_cities FROM requests;

SELECT * FROM requests LIMIT 10;
