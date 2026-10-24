import type { Category } from "../data/categories";
import "../utils/Dashboard.css";


const stats = [
  { label: "Active Nodes", value: "2,486", change: "+18.6%", icon: "◈" },
  { label: "Intelligence Flow", value: "84.2K", change: "+12.4%", icon: "⌁" },
  { label: "System Efficiency", value: "98.8%", change: "+4.2%", icon: "◎" },
  { label: "Live Operations", value: "1,204", change: "LIVE", icon: "↗" },
];

const activity = [
  { name: "Node Synchronization", detail: "Distributed network", time: "Just now", status: "Completed" },
  { name: "Intelligence Processing", detail: "Data analysis engine", time: "2 min ago", status: "Processing" },
  { name: "Network Optimization", detail: "Resource allocation", time: "5 min ago", status: "Completed" },
  { name: "Data Distribution", detail: "Multi-node transfer", time: "8 min ago", status: "Processing" },
];

const bars = [32, 48, 38, 67, 44, 78, 56, 88, 61, 72, 49, 96, 68, 82, 59, 90, 73, 100, 65, 84];

export function Dashboard({ cat }: { cat: Category }) {
  return (
    <section className="di-dashboard">
      <div className="di-dashboard__glow di-dashboard__glow--one" />
      <div className="di-dashboard__glow di-dashboard__glow--two" />

      <div className="di-dashboard__inner">
        <div className="di-topline">
          <span><i /> DISTRIBUTED INTELLIGENCE SYSTEM</span>
          <span className="di-live"><b /> ALL SYSTEMS ONLINE</span>
        </div>

        <header className="di-hero">
          <div className="di-hero__content">
            <span className="di-kicker">THE INTELLIGENCE NETWORK / 01</span>
            <h2>
              Think beyond
              <br />
              <span>the center.</span>
            </h2>
            <p>
              {cat.blurb || "A connected intelligence ecosystem where distributed nodes collaborate, process information, and turn data into decisions."}
            </p>

            <div className="di-hero__actions">
              <a href="#di-analytics">Explore Analytics <span>↗</span></a>
              <span className="di-hero__caption">ONE NETWORK. MANY INTELLIGENCES.</span>
            </div>
          </div>

          <div className="di-orbit" aria-label="Illustration of a distributed intelligence network">
            <div className="di-orbit__ring di-orbit__ring--outer" />
            <div className="di-orbit__ring di-orbit__ring--middle" />
            <div className="di-orbit__ring di-orbit__ring--inner" />

            <div className="di-orbit__core">
              <span>DI</span>
              <small>CORE</small>
            </div>

            <span className="di-orbit__node di-orbit__node--one">AI</span>
            <span className="di-orbit__node di-orbit__node--two">01</span>
            <span className="di-orbit__node di-orbit__node--three">DB</span>
            <span className="di-orbit__node di-orbit__node--four">ML</span>
            <span className="di-orbit__node di-orbit__node--five">↗</span>
            <span className="di-orbit__node di-orbit__node--six">∞</span>

            <div className="di-orbit__label di-orbit__label--top">DECENTRALIZED</div>
            <div className="di-orbit__label di-orbit__label--bottom">CONNECTED INTELLIGENCE</div>
          </div>
        </header>

        <div className="di-section-heading" id="di-analytics">
          <div>
            <span className="di-kicker">01 / LIVE OVERVIEW</span>
            <h3>System <span>at a glance.</span></h3>
          </div>
          <span className="di-updated">● Updated in real time*</span>
        </div>

        <div className="di-stat-grid">
          {stats.map((stat, index) => (
            <article className="di-stat" key={stat.label} style={{ animationDelay: `${index * 100}ms` }}>
              <div className="di-stat__top">
                <span>{stat.label}</span>
                <span className="di-stat__icon">{stat.icon}</span>
              </div>
              <div className="di-stat__value">{stat.value}</div>
              <div className="di-stat__bottom">
                <span className="di-stat__change">↗ {stat.change}</span>
                <span className="di-stat__period">vs last period</span>
              </div>
              <div className="di-stat__line" />
            </article>
          ))}
        </div>

        <div className="di-main-grid">
          <article className="di-panel di-activity">
            <div className="di-panel__heading">
              <div>
                <span className="di-kicker">02 / NETWORK PERFORMANCE</span>
                <h3>Intelligence flow</h3>
              </div>
              <span className="di-panel__badge">24H</span>
            </div>

            <div className="di-chart-summary">
              <strong>84,290 <span>units</span></strong>
              <span className="di-chart-positive">↗ 12.8%</span>
            </div>

            <div className="di-chart">
              {bars.map((height, index) => (
                <div className="di-chart__column" key={index}>
                  <span style={{ height: `${height}%`, animationDelay: `${index * 35}ms` }} />
                </div>
              ))}
            </div>

            <div className="di-chart__labels">
              <span>00:00</span>
              <span>06:00</span>
              <span>12:00</span>
              <span>18:00</span>
              <span>NOW</span>
            </div>
          </article>

          <article className="di-panel di-network">
            <div className="di-panel__heading">
              <div>
                <span className="di-kicker">03 / CONNECTIVITY</span>
                <h3>Network health</h3>
              </div>
              <span className="di-network__percent">98.8%</span>
            </div>

            <div className="di-network__visual">
              <div className="di-network__circle di-network__circle--outer" />
              <div className="di-network__circle di-network__circle--inner" />
              <div className="di-network__center">DI<span>CORE</span></div>
              <i className="di-network__point di-network__point--a" />
              <i className="di-network__point di-network__point--b" />
              <i className="di-network__point di-network__point--c" />
              <i className="di-network__point di-network__point--d" />
              <i className="di-network__point di-network__point--e" />
            </div>

            <div className="di-network__legend">
              <span><i /> Connected nodes</span>
              <strong>2,486 / 2,500</strong>
            </div>
            <div className="di-progress"><span /></div>
            <p className="di-network__foot">Distributed network stability is optimal.</p>
          </article>
        </div>

        <article className="di-panel di-operations">
          <div className="di-panel__heading">
            <div>
              <span className="di-kicker">04 / ACTIVITY STREAM</span>
              <h3>Recent operations</h3>
            </div>
            <a href="#di-analytics">VIEW ALL ↗</a>
          </div>

          <div className="di-table">
            {activity.map((item, index) => (
              <div className="di-table__row" key={item.name}>
                <span className="di-table__number">0{index + 1}</span>
                <div className="di-table__name">
                  <strong>{item.name}</strong>
                  <span>{item.detail}</span>
                </div>
                <span className={`di-table__status ${item.status === "Processing" ? "is-processing" : ""}`}>
                  <i /> {item.status}
                </span>
                <span className="di-table__time">{item.time}</span>
                <span className="di-table__arrow">↗</span>
              </div>
            ))}
          </div>
        </article>

        <footer className="di-dashboard__footer">
          <span>DI<span className="di-footer-dot">.</span> DISTRIBUTED INTELLIGENCE</span>
          <span>CONNECTING DATA. AMPLIFYING INTELLIGENCE.</span>
          <span>CONCEPT DASHBOARD · DEMO DATA</span>
        </footer>
      </div>
    </section>
  );
}