-- 02_load.sql
-- Load 2025 MC311 service requests (531,108 rows) into a raw table.
-- Every column starts as text; cleaning and converting happens in the next step.

USE mc311;

DROP TABLE IF EXISTS requests_raw;

CREATE TABLE requests_raw (
    sr_num              VARCHAR(20),
    created             VARCHAR(30),
    closed              VARCHAR(30),
    sr_stat_id          VARCHAR(20),
    department          VARCHAR(40),
    sr_area             VARCHAR(60),
    sr_sub_area         VARCHAR(60),
    faq_ques_text       VARCHAR(255),
    x_sla               VARCHAR(10),
    x_city              VARCHAR(80),
    x_zipcode           VARCHAR(10),
    sr_subtype_cd       VARCHAR(20),
    x_councildist       VARCHAR(5),
    number_of_days_open VARCHAR(10),
    within_sla_window   VARCHAR(5),
    sr_type             VARCHAR(40)
);

LOAD DATA LOCAL INFILE 'C:/Users/Brhan/OneDrive/mc311-project/mc311_2025.csv.csv'
INTO TABLE requests_raw
FIELDS TERMINATED BY ',' ENCLOSED BY '"'
LINES TERMINATED BY '\n'
IGNORE 1 LINES;

SELECT COUNT(*) AS total_rows FROM requests_raw;

-- Peek at the first 10 rows
SELECT * FROM requests_raw LIMIT 10;
