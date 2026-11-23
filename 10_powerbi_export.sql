-- 10_powerbi_export.sql
-- Export v_dashboard to a CSV for Power BI.
-- MySQL can only write files to the folder in secure_file_priv,
-- so check that first and use that folder in the path below.
USE mc311;

SHOW VARIABLES LIKE 'secure_file_priv';

-- INTO OUTFILE has no header option, so the first SELECT adds one.
SELECT * FROM (
  SELECT 'request_id' AS request_id, 'opened_date' AS opened_date, 'month_num' AS month_num,
         'month_name' AS month_name, 'department' AS department, 'area' AS area, 'topic' AS topic,
         'source' AS source, 'council_district' AS council_district, 'deadline_days' AS deadline_days,
         'days_open' AS days_open, 'on_time' AS on_time
  UNION ALL
  SELECT request_id, opened_date, month_num, month_name,
         IFNULL(department,''), IFNULL(area,''), IFNULL(topic,''), IFNULL(source,''),
         IFNULL(council_district,''), deadline_days, IFNULL(days_open,''), on_time
  FROM v_dashboard
) t
INTO OUTFILE 'C:/ProgramData/MySQL/MySQL Server 8.0/Uploads/mc311_dashboard.csv'
FIELDS TERMINATED BY ',' OPTIONALLY ENCLOSED BY '"'
LINES TERMINATED BY '\r\n';
-- Writes 527,017 lines (527,016 rows + header).
