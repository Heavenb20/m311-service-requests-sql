-- 07_by_district.sql
USE mc311;

-- Are requests without a location different?
SELECT CASE WHEN council_district IS NULL THEN 'No location'
            ELSE 'Has location' END AS location_status,
       COUNT(*) AS closed_requests,
       ROUND(AVG(on_time) * 100, 1) AS pct_on_time
FROM requests
WHERE status = 'Closed'
  AND deadline_days IS NOT NULL
GROUP BY location_status;

-- Which departments are missing locations?
SELECT department, COUNT(*) AS requests
FROM requests
WHERE council_district IS NULL
GROUP BY department
ORDER BY requests DESC
LIMIT 5;

-- On-time rate by council district
SELECT council_district,
       COUNT(*) AS closed_requests,
       SUM(on_time = 0) AS late_requests,
       ROUND(AVG(on_time) * 100, 1) AS pct_on_time
FROM requests
WHERE status = 'Closed'
  AND deadline_days IS NOT NULL
  AND council_district IS NOT NULL
GROUP BY council_district
ORDER BY council_district;

-- DOT on-time rate by council district
SELECT council_district,
       COUNT(*) AS closed_requests,
       ROUND(AVG(on_time) * 100, 1) AS pct_on_time
FROM requests
WHERE department = 'DOT'
  AND status = 'Closed'
  AND deadline_days IS NOT NULL
  AND council_district IS NOT NULL
GROUP BY council_district
ORDER BY pct_on_time;