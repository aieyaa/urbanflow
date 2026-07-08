"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { savePushSubscription, removePushSubscription } from "@/app/actions/push";
import { removeFavoriteStop, type FavoriteStop } from "@/app/actions/favorites";

type NotificationSettingsProps = {
  initialFavoriteStops: FavoriteStop[];
};

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
}

function subscribeNoop() {
  return () => {};
}

function getPushSupportSnapshot() {
  return "serviceWorker" in navigator && "PushManager" in window;
}

function getPushSupportServerSnapshot() {
  return false;
}

function usePushSupported() {
  return useSyncExternalStore(subscribeNoop, getPushSupportSnapshot, getPushSupportServerSnapshot);
}

function registerServiceWorker() {
  return navigator.serviceWorker.register("/sw.js");
}

export function NotificationSettings({ initialFavoriteStops }: NotificationSettingsProps) {
  const supported = usePushSupported();
  const [subscribed, setSubscribed] = useState(false);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [favoriteStops, setFavoriteStops] = useState(initialFavoriteStops);

  useEffect(() => {
    if (!supported) return;

    registerServiceWorker()
      .then((registration) => registration.pushManager.getSubscription())
      .then((subscription) => setSubscribed(subscription !== null))
      .catch(() => setSubscribed(false));
  }, [supported]);

  async function handleSubscribe() {
    setPending(true);
    setMessage(null);

    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setMessage("Notifications refusées. Autorisez-les dans les réglages du navigateur.");
        return;
      }

      const registration = await registerServiceWorker();
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!
        ),
      });

      const json = subscription.toJSON();
      const response = await savePushSubscription({
        endpoint: json.endpoint!,
        keys: { p256dh: json.keys!.p256dh, auth: json.keys!.auth },
      });

      if (response.success) {
        setSubscribed(true);
      } else {
        setMessage(response.message ?? "Une erreur est survenue.");
      }
    } catch {
      setMessage("Impossible d'activer les notifications sur cet appareil.");
    } finally {
      setPending(false);
    }
  }

  async function handleUnsubscribe() {
    setPending(true);
    setMessage(null);

    try {
      const registration = await registerServiceWorker();
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        const endpoint = subscription.endpoint;
        await subscription.unsubscribe();
        await removePushSubscription(endpoint);
      }

      setSubscribed(false);
    } finally {
      setPending(false);
    }
  }

  async function handleRemoveFavorite(stopId: string) {
    const response = await removeFavoriteStop(stopId);
    if (response.success) {
      setFavoriteStops((prev) => prev.filter((favorite) => favorite.stopId !== stopId));
    }
  }

  return (
    <div className="flex w-full max-w-sm flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-sm font-medium">Alertes de perturbation</h2>
        {!supported ? (
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Les notifications ne sont pas supportées sur cet appareil/navigateur.
          </p>
        ) : (
          <button
            type="button"
            onClick={subscribed ? handleUnsubscribe : handleSubscribe}
            disabled={pending}
            className="self-start rounded-full border border-black/[.1] px-4 py-2 text-sm transition-colors hover:bg-black/[.04] disabled:opacity-50 dark:border-white/[.15] dark:hover:bg-white/[.08]"
          >
            {subscribed ? "Désactiver les notifications" : "Activer les notifications"}
          </button>
        )}
        {message && (
          <p className="text-sm text-red-600 dark:text-red-400">{message}</p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <h2 className="text-sm font-medium">Arrêts favoris</h2>
        {favoriteStops.length === 0 ? (
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Aucun arrêt favori. Ajoutez-en depuis la page Horaires.
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {favoriteStops.map((favorite) => (
              <li
                key={favorite.stopId}
                className="flex items-center justify-between rounded-md border border-black/[.1] px-4 py-2 text-sm dark:border-white/[.15]"
              >
                {favorite.stopName}
                <button
                  type="button"
                  onClick={() => handleRemoveFavorite(favorite.stopId)}
                  className="text-xs text-zinc-500 hover:text-red-600 dark:hover:text-red-400"
                >
                  Retirer
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
