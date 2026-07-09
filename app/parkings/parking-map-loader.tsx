"use client";

import dynamic from "next/dynamic";

const ParkingMap = dynamic(() => import("./parking-map"), { ssr: false });

export default ParkingMap;
