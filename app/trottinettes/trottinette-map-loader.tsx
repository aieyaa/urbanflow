"use client";

import dynamic from "next/dynamic";

const TrottinetteMap = dynamic(() => import("./trottinette-map"), { ssr: false });

export default TrottinetteMap;
