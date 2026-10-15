-- 08_advanced.sql
USE mc311;

-- Monthly requests and % change from last month (CTE + LAG)
WITH monthly AS (
  SELECT MONTH(opened_at) AS month_num,
         COUNT(*) AS requests
  FROM requests
  GROUP BY month_num
)
SELECT month_num,
       requests,
       LAG(requests) OVER (ORDER BY month_num) AS last_month,
       ROUND((requests - LAG(requests) OVER (ORDER BY month_num))
             / LAG(requests) OVER (ORDER BY month_num) * 100, 1) AS pct_change
FROM monthly
ORDER BY month_num;

-- Top 3 request types in each department (RANK)
WITH topic_counts AS (
  SELECT department, topic, COUNT(*) AS requests,
         RANK() OVER (PARTITION BY department ORDER BY COUNT(*) DESC) AS topic_rank
  FROM requests
  WHERE topic IS NOT NULL
  GROUP BY department, topic
)
SELECT department, topic_rank, topic, requests
FROM topic_counts
WHERE topic_rank <= 3
  AND department IN ('DEP', 'DOT', 'HHS')
ORDER BY department, topic_rank;

-- Each department vs. the county average
WITH dept AS (
  SELECT department,
         COUNT(*) AS closed_requests,
         AVG(on_time) * 100 AS pct_on_time
  FROM requests
  WHERE status = 'Closed'
    AND deadline_days IS NOT NULL
  GROUP BY department
  HAVING COUNT(*) >= 1000
)
SELECT department,
       ROUND(pct_on_time, 1) AS pct_on_time,
       ROUND(pct_on_time - AVG(pct_on_time) OVER (), 1) AS vs_avg
FROM dept
ORDER BY vs_avg;