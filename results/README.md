# Query results

These small files hold the outputs of the SQL queries, copied from MySQL Workbench. `make_charts.py` reads them to draw the charts, and `build_dashboard.py` packs them into the dashboard.

| File | Comes from |
|---|---|
| `late_by_department.csv` | `05_departments.sql`, on-time rate by department. "All other departments" is the county's 12,309 late requests minus the five departments listed. |
| `monthly_on_time.csv` | `06_dot_deep_dive.sql`, DOT on-time rate by month and all departments on-time rate by month |
| `dot_by_area.csv` | `06_dot_deep_dive.sql`, DOT on-time rate by area |
| `dot_by_district.csv` | `07_by_district.sql`, DOT on-time rate by council district |
| `department_on_time.csv` | `05_departments.sql`, on-time rate by department. "All other departments" is the county totals (527,016 closed, 12,309 late) minus the departments listed. |
| `monthly_requests.csv` | `08_advanced.sql`, monthly requests |
| `contact_source.csv` | `03_explore.sql`, how people contact 311. "Other" combines OHR Inbound, Twitter, ABS Outbound, CCL, and blanks. |
| `top_requests.csv` | `05_departments.sql`, top requests (the SNAP/Medicaid label is shortened) |
