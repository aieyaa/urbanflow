"use client";

import dynamic from "next/dynamic";

const CovoiturageMap = dynamic(() => import("./covoiturage-map"), { ssr: false });

export default CovoiturageMap;
