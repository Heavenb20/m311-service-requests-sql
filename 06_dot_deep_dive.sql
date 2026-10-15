-- 06_dot_deep_dive.sql
USE mc311;

-- DOT on-time rate by area
SELECT area,
       COUNT(*) AS closed_requests,
       SUM(on_time = 0) AS late_requests,
       ROUND(AVG(on_time) * 100, 1) AS pct_on_time
FROM requests
WHERE department = 'DOT'
  AND status = 'Closed'
  AND deadline_days IS NOT NULL
GROUP BY area
HAVING COUNT(*) >= 500
ORDER BY late_requests DESC;

-- DOT request types with the most late requests
SELECT topic,
       COUNT(*) AS closed_requests,
       SUM(on_time = 0) AS late_requests,
       ROUND(AVG(on_time) * 100, 1) AS pct_on_time
FROM requests
WHERE department = 'DOT'
  AND status = 'Closed'
  AND deadline_days IS NOT NULL
GROUP BY topic
HAVING COUNT(*) >= 300
ORDER BY late_requests DESC
LIMIT 10;

-- DOT on-time rate by month
SELECT MONTH(opened_at) AS month_num,
       MONTHNAME(opened_at) AS month,
       COUNT(*) AS closed_requests,
       ROUND(AVG(on_time) * 100, 1) AS pct_on_time
FROM requests
WHERE department = 'DOT'
  AND status = 'Closed'
  AND deadline_days IS NOT NULL
GROUP BY month_num, month
ORDER BY month_num;