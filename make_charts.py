# make_charts.py
# Turns the SQL query results in results/ into the charts in charts/.

import pandas as pd
import matplotlib.pyplot as plt

BLUE = "#3A5DA6"    # highlight (DOT)
GRAY = "#B8BCC6"    # everything else
PINK = "#C25B80"    # county comparison line
INK = "#1D1C24"
MUTED = "#5A5963"

plt.rcParams.update({
    "font.size": 11, "text.color": INK, "axes.labelcolor": MUTED,
    "xtick.color": MUTED, "ytick.color": INK, "axes.edgecolor": "#E3E1DC",
    "axes.spines.top": False, "axes.spines.right": False, "axes.spines.left": False,
    "axes.grid": True, "grid.color": "#ECEAE5", "axes.axisbelow": True,
    "xtick.major.size": 0, "ytick.major.size": 0, "savefig.dpi": 160,
})


def titles(fig, title, subtitle):
    fig.text(0.03, 0.95, title, fontsize=15, fontweight="bold", va="top")
    fig.text(0.03, 0.885, subtitle, fontsize=10.5, color=MUTED, va="top")


# 1. Late requests by department
d = pd.read_csv("results/late_by_department.csv").iloc[::-1]
fig, ax = plt.subplots(figsize=(9, 5))
fig.subplots_adjust(left=0.25, right=0.95, top=0.78, bottom=0.12)
colors = [BLUE if x == "DOT" else GRAY for x in d.department]
ax.barh(d.department, d.late_requests, color=colors, height=0.6)
for i, v in enumerate(d.late_requests):
    ax.text(v + 80, i, f"{v:,}", va="center", fontsize=10)
ax.grid(axis="y", visible=False)
ax.set_xlabel("Late requests in 2025")
titles(fig, "Transportation (DOT) caused over half of all late requests",
       "6,449 of 12,309 late MC311 requests in 2025 belonged to DOT")
fig.savefig("charts/01_late_by_department.png")

# 2. On-time rate by month: DOT vs. county
m = pd.read_csv("results/monthly_on_time.csv")
fig, ax = plt.subplots(figsize=(9, 5))
fig.subplots_adjust(left=0.08, right=0.88, top=0.78, bottom=0.12)
ax.plot(m.month, m.county_pct_on_time, color=PINK, lw=2.2, marker="o", ms=6)
ax.plot(m.month, m.dot_pct_on_time, color=BLUE, lw=2.4, marker="o", ms=6)
ax.text(11.2, m.county_pct_on_time.iloc[-1], "All departments", va="center", fontweight="bold")
ax.text(11.2, m.dot_pct_on_time.iloc[-1], "DOT", va="center", fontweight="bold")
low = m.loc[m.dot_pct_on_time.idxmin()]
ax.annotate(f"{low.dot_pct_on_time}% in {low.month}", (low.month_num - 1, low.dot_pct_on_time),
            xytext=(0, -22), textcoords="offset points", ha="center", fontsize=10)
ax.set_ylim(80, 100)
ax.set_ylabel("% closed on time")
ax.grid(axis="x", visible=False)
titles(fig, "DOT falls furthest behind in late spring and summer",
       "Share of closed requests resolved within the county's deadline, by month opened (2025)")
fig.savefig("charts/02_on_time_by_month.png")

# 3. DOT on-time rate by area
a = pd.read_csv("results/dot_by_area.csv").sort_values("pct_on_time", ascending=False)
fig, ax = plt.subplots(figsize=(9, 5))
fig.subplots_adjust(left=0.22, right=0.95, top=0.78, bottom=0.12)
colors = [BLUE if x == "Tree Maintenance" else GRAY for x in a.area]
ax.barh(a.area, a.pct_on_time, color=colors, height=0.6)
for i, (p, late) in enumerate(zip(a.pct_on_time, a.late_requests)):
    ax.text(p + 0.5, i, f"{p}%  ({late:,} late)", va="center", fontsize=10)
ax.set_xlim(0, 115)
ax.set_xticks([0, 25, 50, 75, 100])
ax.grid(axis="y", visible=False)
ax.set_xlabel("% closed on time")
titles(fig, "Tree requests are DOT's biggest gap",
       "DOT on-time rate by service area, closed requests in 2025")
fig.savefig("charts/03_dot_by_area.png")

# 4. DOT on-time rate by council district
c = pd.read_csv("results/dot_by_district.csv").sort_values("council_district")
fig, ax = plt.subplots(figsize=(9, 5))
fig.subplots_adjust(left=0.08, right=0.95, top=0.78, bottom=0.14)
labels = [f"District {x}" for x in c.council_district]
colors = [BLUE if p < 82 else GRAY for p in c.pct_on_time]
ax.bar(labels, c.pct_on_time, color=colors, width=0.6)
for i, p in enumerate(c.pct_on_time):
    ax.text(i, p + 1.5, f"{p}%", ha="center", fontsize=10, fontweight="bold")
ax.set_ylim(0, 100)
ax.set_ylabel("% closed on time")
ax.grid(axis="x", visible=False)
titles(fig, "DOT is slowest in Districts 4, 6, and 7",
       "DOT on-time rate by council district (requests with a location, 2025)")
fig.savefig("charts/04_dot_by_district.png")

print("Charts saved to charts/")
