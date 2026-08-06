import "server-only";
import { getQuayIds } from "./stops";

const NAOLIB_BASE_URL = "https://api.staging.okina.fr/gateway/sem/realtime/siri/2.0";

export type ServiceAlert = {
  summary: string;
  description: string | null;
};

export type Departure = {
  line: string;
  destination: string;
  mode: string;
  aimedTime: string;
  expectedTime: string | null;
  isRealtime: boolean;
  delayMinutes: number;
};

type SiriMonitoredCall = {
  AimedDepartureTime?: string;
  ExpectedDepartureTime?: string;
};

type SiriLocalizedValue = { value?: string; lang?: string };

type SiriMonitoredVehicleJourney = {
  LineRef?: { value?: string };
  DestinationName?: SiriLocalizedValue[];
  VehicleMode?: string[];
  MonitoredCall?: SiriMonitoredCall;
};

type SiriStopMonitoringResponse = {
  Siri?: {
    ServiceDelivery?: {
      StopMonitoringDelivery?: {
        MonitoredStopVisit?: {
          MonitoredVehicleJourney?: SiriMonitoredVehicleJourney;
        }[];
      }[];
    };
  };
};

type SiriPtSituationElement = {
  Summary?: SiriLocalizedValue;
  Description?: SiriLocalizedValue;
};

type SiriSituationExchangeResponse = {
  Siri?: {
    ServiceDelivery?: {
      SituationExchangeDelivery?: {
        Situations?: {
          PtSituationElement?: SiriPtSituationElement[];
        };
      }[];
    };
  };
};

function apiKey() {
  return process.env.NAOLIB_API_KEY;
}

async function fetchSiri<T>(service: string, params: Record<string, string> = {}): Promise<T | null> {
  const key = apiKey();

  if (!key) {
    console.error(`[naolib/siri] NAOLIB_API_KEY absente, appel ${service} ignoré`);
    return null;
  }

  const url = new URL(`${NAOLIB_BASE_URL}/${service}.json`);
  url.searchParams.set("api-key", key);
  for (const [name, value] of Object.entries(params)) {
    url.searchParams.set(name, value);
  }

  const response = await fetch(url, { next: { revalidate: 120 } });

  if (!response.ok) {
    console.error(`[naolib/siri] ${service} error`, response.status, await response.text());
    return null;
  }

  return response.json();
}

export async function getStopDepartures(stopPlaceId: string): Promise<Departure[]> {
  const quayIds = await getQuayIds(stopPlaceId);

  // Okina's stop-monitoring only returns visits per platform (Quay), not per station (StopPlace).
  const responses = await Promise.all(
    quayIds.map((quayId) =>
      fetchSiri<SiriStopMonitoringResponse>("stop-monitoring", { MonitoringRef: quayId })
    )
  );

  const visits = responses.flatMap(
    (data) => data?.Siri?.ServiceDelivery?.StopMonitoringDelivery?.[0]?.MonitoredStopVisit ?? []
  );

  return visits
    .map((visit): Departure | null => {
      const journey = visit.MonitoredVehicleJourney;
      const call = journey?.MonitoredCall;
      const aimedTime = call?.AimedDepartureTime;

      if (!journey || !call || !aimedTime) {
        return null;
      }

      const expectedTime = call.ExpectedDepartureTime ?? null;
      const delayMinutes = expectedTime
        ? Math.round((new Date(expectedTime).getTime() - new Date(aimedTime).getTime()) / 60000)
        : 0;

      return {
        line: journey.LineRef?.value ?? "?",
        destination: journey.DestinationName?.[0]?.value ?? "?",
        mode: journey.VehicleMode?.[0] ?? "?",
        aimedTime,
        expectedTime,
        isRealtime: expectedTime !== null,
        delayMinutes,
      };
    })
    .filter((departure): departure is Departure => departure !== null)
    .sort((a, b) => (a.expectedTime ?? a.aimedTime).localeCompare(b.expectedTime ?? b.aimedTime));
}

export async function getServiceAlerts(): Promise<ServiceAlert[]> {
  const data = await fetchSiri<SiriSituationExchangeResponse>("situation-exchange");

  const situations =
    data?.Siri?.ServiceDelivery?.SituationExchangeDelivery?.[0]?.Situations
      ?.PtSituationElement ?? [];

  return situations
    .filter((situation) => situation.Summary?.value)
    .map((situation) => ({
      summary: situation.Summary!.value!,
      description: situation.Description?.value ?? null,
    }));
}
