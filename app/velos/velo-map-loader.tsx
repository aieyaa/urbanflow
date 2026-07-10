"use client";

import dynamic from "next/dynamic";

const VeloMap = dynamic(() => import("./velo-map"), { ssr: false });

export default VeloMap;
