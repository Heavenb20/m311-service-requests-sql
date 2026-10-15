-- 05_departments.sql
USE mc311;

-- Top 10 requests
SELECT topic, COUNT(*) AS requests
FROM requests
GROUP BY topic
ORDER BY requests DESC
LIMIT 10;

-- Overall on-time rate
SELECT COUNT(*) AS closed_requests,
       ROUND(AVG(on_time) * 100, 1) AS pct_on_time
FROM requests
WHERE status = 'Closed'
  AND deadline_days IS NOT NULL;

-- On-time rate by department (1,000+ requests)
SELECT department,
       COUNT(*) AS closed_requests,
       SUM(on_time = 0) AS late_requests,
       ROUND(AVG(on_time) * 100, 1) AS pct_on_time
FROM requests
WHERE status = 'Closed'
  AND deadline_days IS NOT NULL
GROUP BY department
HAVING COUNT(*) >= 1000
ORDER BY pct_on_time ASC;