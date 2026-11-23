# Query results

These small files hold the outputs of the SQL queries, copied from MySQL Workbench. `make_charts.py` reads them to draw the charts.

| File | Comes from |
|---|---|
| `late_by_department.csv` | `05_departments.sql`, on-time rate by department. "All other departments" is the county's 12,309 late requests minus the five departments listed. |
| `monthly_on_time.csv` | `06_dot_deep_dive.sql`, DOT on-time rate by month and all departments on-time rate by month |
| `dot_by_area.csv` | `06_dot_deep_dive.sql`, DOT on-time rate by area |
| `dot_by_district.csv` | `07_by_district.sql`, DOT on-time rate by council district |
