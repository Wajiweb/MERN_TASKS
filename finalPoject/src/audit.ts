import {
    IProduct,
    IAuditResult,
    IAuditCounter,
    AuditBase,
    getStockStatus,
} from "./types.js";
export function createAuditCounter(): IAuditCounter {
    let audited = 0;
    let flagged = 0;
    let skipped = 0;
    return {
        increment(type: "audited" | "flagged" | "skipped"): void {
            switch (type) {
                case "audited":
                    audited++;
                    break;
                case "flagged":
                    flagged++;
                    break;
                case "skipped":
                    skipped++;
                    break;
            }
        },
        getCount(type: "audited" | "flagged" | "skipped"): number {
            switch (type) {
                case "audited":
                    return audited;
                case "flagged":
                    return flagged;
                case "skipped":
                    return skipped;
            }
        },

        getCounts(): { audited: number; flagged: number; skipped: number } {
            return { audited, flagged, skipped };
        },
        reset(): void {
            audited = 0;
            flagged = 0;
            skipped = 0;
        },
    };
}
export class AuditSession extends AuditBase {
    private counter: IAuditCounter;
    private lowStockThreshold: number;

    constructor(lowStockThreshold: number = 10) {
        super();
        this.counter = createAuditCounter();
        this.lowStockThreshold = lowStockThreshold;
    }
    runAudit(products: IProduct[]): IAuditResult[] {
        this.results = [];
        this.counter.reset();

        for (const product of products) {
            const status = getStockStatus(product.stock);
            let flagged = false;
            let reason = "OK";

            if (product.stock === 0) {
                flagged = true;
                reason = "Out of stock — needs immediate restock";
                this.counter.increment("flagged");
            }
            else if (product.stock <= this.lowStockThreshold) {
                flagged = true;
                reason = `Low stock (${product.stock} units) — reorder recommended`;
                this.counter.increment("flagged");
            }
            else {
                const lastAudit = new Date(product.lastAudited);
                const daysSince = Math.floor(
                    (Date.now() - lastAudit.getTime()) / (1000 * 60 * 60 * 24)
                );
                if (daysSince > 30) {
                    flagged = true;
                    reason = `Not audited in ${daysSince} days`;
                    this.counter.increment("flagged");
                }
            }

            if (!flagged) {
                this.counter.increment("audited");
            }
            const result: IAuditResult = {
                productId: product.id,
                sku: product.sku,
                name: product.name,
                status,
                flagged,
                reason,
                auditedAt: this.auditDate,
            };

            this.results.push(result);
        }

        return this.results;
    }
    generateReport(): string {
        const counts = this.counter.getCounts();
        const flaggedItems = this.results.filter((r) => r.flagged);

        let report = `
      <div class="audit-report">
        <div class="report-header">
          <h3>Audit Report — ${this.auditDate}</h3>
        </div>
        <div class="report-stats">
          <div class="report-stat">
            <span class="stat-number">${this.results.length}</span>
            <span class="stat-label">Total Reviewed</span>
          </div>
          <div class="report-stat stat-success">
            <span class="stat-number">${counts.audited}</span>
            <span class="stat-label">Passed</span>
          </div>
          <div class="report-stat stat-danger">
            <span class="stat-number">${counts.flagged}</span>
            <span class="stat-label">Flagged</span>
          </div>
          <div class="report-stat stat-muted">
            <span class="stat-number">${counts.skipped}</span>
            <span class="stat-label">Skipped</span>
          </div>
        </div>
        ${flaggedItems.length > 0
                ? `
          <div class="flagged-list">
            <h4>Flagged Items</h4>
            <div class="flagged-items-scroll">
              ${flaggedItems
                    .map(
                        (item) => `
                <div class="flagged-item">
                  <div class="flagged-item-header">
                    <strong>${item.name}</strong>
                    <span class="status-badge ${item.status === "out-of-stock"
                                ? "status-danger"
                                : "status-warning"
                            }">${item.status}</span>
                  </div>
                  <p class="flagged-reason">${item.reason}</p>
                </div>
              `
                    )
                    .join("")}
            </div>
          </div>
        `
                : '<p class="all-clear">All items passed audit!</p>'
            }
      </div>
    `;

        return report;
    }
    getCounter(): IAuditCounter {
        return this.counter;
    }
}
