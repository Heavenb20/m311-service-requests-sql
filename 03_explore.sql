-- 03_explore.sql
USE mc311;

-- Check for duplicate IDs
SELECT COUNT(*) AS total_rows,
       COUNT(DISTINCT sr_num) AS unique_requests
FROM requests_raw;

-- Date range
SELECT MIN(created) AS first_request,
       MAX(created) AS last_request
FROM requests_raw;

-- Open vs. closed
SELECT sr_stat_id AS status, COUNT(*) AS requests
FROM requests_raw
GROUP BY sr_stat_id;

-- Requests by department
SELECT department, COUNT(*) AS requests
FROM requests_raw
GROUP BY department
ORDER BY requests DESC;

-- How people contact 311
SELECT sr_subtype_cd AS source, COUNT(*) AS requests
FROM requests_raw
GROUP BY sr_subtype_cd
ORDER BY requests DESC;

-- Missing values
SELECT
  SUM(closed = '')        AS missing_closed_date,
  SUM(x_sla = '')         AS missing_deadline,
  SUM(x_city = '')        AS missing_city,
  SUM(x_zipcode = '')     AS missing_zip,
  SUM(x_councildist = '') AS missing_council_district
FROM requests_raw;