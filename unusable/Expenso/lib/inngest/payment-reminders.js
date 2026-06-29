import { ConvexHttpClient } from "convex/browser";
import { api } from "../../convex/_generated/api";
import { inngest } from "./client";
import sanitizeHTML from "sanitize-html";

// Initialize Convex client
const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL);

export const paymentReminders = inngest.createFunction(
    { id: "send-payment-reminders" },
    { cron: "0 10 * * *" }, // daily at 10 AM UTC
    async ({ step }) => {
        /* 1. fetch all users that still owe money */
        const users = await step.run("fetch‑debts", () =>
            convex.query(api.inngest.getUsersWithOutstandingDebts)
        );

        /* 2. build & send one e‑mail per user */
        const results = await step.run("send‑emails", async () => {
            return Promise.all(
                users.map(async (user) => {
                    const rows = user.debts
                        .map(
                            (d) => `
                <tr>
                  <td style="padding:4px 8px;">${d.name}</td>
                  <td style="padding:4px 8px;">$${d.amount.toFixed(2)}</td>
                </tr>
              `
                        )
                        .join("");

                    if (!rows) return { userId: user._id, skipped: true };

                    const html = `
            <div role="region" aria-label="Payment Reminder">
              <h2>Expenso – Payment Reminder</h2>
              <p>Hi <span>${sanitizeHTML(user.name)}</span>, you have the following outstanding balances:</p>
              <table class="payment-table">
                <caption>Outstanding Balance Details</caption>
                <thead>
                  <tr>
                    <th scope="col">To</th>
                    <th scope="col">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  ${sanitizeHTML(rows)}
                </tbody>
              </table>
              <p>Please settle up soon. Thanks!</p>
            </div>
          `;

                    try {
                        await convex.action(api.email.sendEmail, {
                            to: user.email,
                            subject: "You have pending payments on Expenso",
                            html:html,
                            apiKey: process.env.RESEND_API_KEY,
                        });
                        return { userId: user._id, success: true };
                    } catch (err) {
                        return { userId: user._id, success: false, error: err.message };
                    }
                })
            );
        });

        return {
            processed: results.length,
            successes: results.filter((r) => r.success).length,
            failures: results.filter((r) => r.success === false).length,
        };
    }
);