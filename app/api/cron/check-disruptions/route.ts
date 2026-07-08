import { createHash } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import webpush from "web-push";
import { getServiceAlerts } from "@/lib/naolib/siri";
import { createAdminClient } from "@/lib/supabase/admin";

function situationKey(summary: string, description: string | null) {
  return createHash("sha1").update(`${summary}|${description ?? ""}`).digest("hex");
}

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");

  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const alerts = await getServiceAlerts();

  if (alerts.length === 0) {
    return NextResponse.json({ notified: 0 });
  }

  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT!,
    process.env.VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!
  );

  const supabase = createAdminClient();

  const { data: favorites } = await supabase.from("favorite_stops").select("user_id");
  const userIds = [...new Set((favorites ?? []).map((row) => row.user_id))];

  if (userIds.length === 0) {
    return NextResponse.json({ notified: 0 });
  }

  const { data: subscriptions } = await supabase
    .from("push_subscriptions")
    .select("user_id, endpoint, p256dh, auth_key")
    .in("user_id", userIds);

  let notified = 0;

  for (const alert of alerts) {
    const key = situationKey(alert.summary, alert.description);

    for (const userId of userIds) {
      const { error: insertError } = await supabase
        .from("sent_alert_notifications")
        .insert({ user_id: userId, situation_key: key });

      if (insertError) {
        // Contrainte (user_id, situation_key) déjà violée : déjà notifié, on ignore.
        continue;
      }

      const userSubscriptions = (subscriptions ?? []).filter((sub) => sub.user_id === userId);

      for (const subscription of userSubscriptions) {
        try {
          await webpush.sendNotification(
            {
              endpoint: subscription.endpoint,
              keys: { p256dh: subscription.p256dh, auth: subscription.auth_key },
            },
            JSON.stringify({
              title: "Perturbation Naolib",
              body: alert.summary,
              url: "/horaires",
            })
          );
          notified++;
        } catch (error) {
          const statusCode = (error as { statusCode?: number }).statusCode;
          if (statusCode === 404 || statusCode === 410) {
            await supabase.from("push_subscriptions").delete().eq("endpoint", subscription.endpoint);
          } else {
            console.error("[cron/check-disruptions] push error", error);
          }
        }
      }
    }
  }

  return NextResponse.json({ notified });
}
