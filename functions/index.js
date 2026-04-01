import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { onDocumentCreated, onDocumentWritten } from "firebase-functions/v2/firestore";
import { Resend } from "resend";

initializeApp();
const db = getFirestore();

// We will use process.env.RESEND_API_KEY in the environment variables
const resend = new Resend(process.env.RESEND_API_KEY || "re_dummy");

export const onSpiritualLogCreated = onDocumentCreated("spiritualLogs/{logId}", async (event) => {
    const snapshot = event.data;
    if (!snapshot) return;

    const record = snapshot.data();
    console.log("🙏 [The Shepherd] Analyzing prayer request or spiritual log...", record);

    if (record.type === "prayer_request") {
        console.log(`[The Shepherd] Reading new prayer request: "${record.content}"`);
        // AI Logic: Detect emotional weight, extract themes
        // Action: Save tailored response to DB for user to see when they open app
        await db.collection("spiritualLogs").add({
            userId: record.userId,
            type: "encouragement",
            content: `I am praying with you about this. 'Cast all your anxiety on Him because He cares for you.' (1 Peter 5:7)`,
            isPublic: false,
            createdAt: new Date().toISOString()
        });
    }
});

export const onUserMetricsWritten = onDocumentWritten("userMetrics/{metricId}", async (event) => {
    const snapshot = event.data.after;
    if (!snapshot.exists) return; // Deleted

    const record = snapshot.data();
    const userId = record.userId;
    console.log("💪 [The Coach] Reviewing physical metrics...");

    // Fetch the last 3 metrics for this user
    const recentLogsSnapshot = await db.collection("userMetrics")
        .where("userId", "==", userId)
        .orderBy("date", "desc")
        .limit(3)
        .get();

    const recentLogs = recentLogsSnapshot.docs.map(doc => doc.data());
    const missedDaysCount = recentLogs.filter(log => log.missedDay || log.caloriesLogged === 0).length || 0;

    if (missedDaysCount >= 3) {
        console.log(`[The Coach] ⚠️ User ${userId} has missed 3 days of logging.`);
        console.log("[The Coach] Pinging The Shepherd for spiritual backup. Inserting event into ledger.");

        await db.collection("agentLedger").add({
            eventType: "COACH_ESCALATION",
            userId: userId,
            payload: {
                reason: "Missed 3 days of physical logging",
                actionRequested: "Check spiritual pulse"
            },
            createdAt: new Date().toISOString(),
            processed: false
        });
    }
});

export const onAgentLedgerCreated = onDocumentCreated("agentLedger/{ledgerId}", async (event) => {
    const snapshot = event.data;
    if (!snapshot) return;

    const record = snapshot.data();
    const ledgerId = event.params.ledgerId;

    if (record.eventType === "COACH_ESCALATION") {
        console.log(`[The Shepherd] Received escalation from The Coach for User ${record.userId}.`);

        // Check recent prayer requests for context
        const prayersSnapshot = await db.collection("spiritualLogs")
            .where("userId", "==", record.userId)
            .where("type", "==", "prayer_request")
            .orderBy("createdAt", "desc")
            .limit(1)
            .get();

        let contextualMessage = "I noticed you haven't logged meals recently. Is everything okay? 'The Lord is the strength of my life.'";

        if (!prayersSnapshot.empty) {
            const lastPrayer = prayersSnapshot.docs[0].data().content;
            if (lastPrayer && lastPrayer.toLowerCase().includes("sick")) {
                contextualMessage = `I know your heart is heavy with family right now. Don't forget to fuel your own temple so you have the strength to care for them. How can I pray for you today?`;
            }
        }

        console.log(`[The Shepherd] drafted message: ${contextualMessage}`);

        if (record.payload?.crisisLevel === "HIGH") {
            console.log(`[The Shepherd] 🚨 CRISIS DETECTED. Sending care email via Resend...`);
        }
        
        // Mark processed
        await db.collection("agentLedger").doc(ledgerId).update({
            processed: true,
            processedAt: new Date().toISOString()
        });
    }
});
