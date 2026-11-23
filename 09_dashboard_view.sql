-- 09_dashboard_view.sql
USE mc311;

-- Clean data for dashboards and charts
CREATE OR REPLACE VIEW v_dashboard AS
SELECT request_id,
       DATE(opened_at) AS opened_date,
       MONTH(opened_at) AS month_num,
       MONTHNAME(opened_at) AS month_name,
       department,
       area,
       topic,
       source,
       council_district,
       deadline_days,
       days_open,
       on_time
FROM requests
WHERE status = 'Closed'
  AND deadline_days IS NOT NULL;

-- Check: should be 527016
SELECT COUNT(*) AS dashboard_rows FROM v_dashboard;
