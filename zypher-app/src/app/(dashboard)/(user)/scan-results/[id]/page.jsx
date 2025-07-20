'use client';

import { useParams, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

const ScanResult = () => {
    const [scanData, setScanData] = useState([]);
    const [scanDataType, setScanDataType] = useState('');

    const { id: scanID } = useParams(); // dynamic route param
    const searchParams = useSearchParams(); // query params
    const type = searchParams.get("type");

    useEffect(() => {
        setScanDataType(type);
    }, [type]);

    useEffect(() => {
        if (!scanID || !scanDataType) return;

        const fetchScanData = async () => {
            try {
                const res = await fetch(`/api/scan-results/${scanID}?type=${scanDataType}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                const data = await res.json();

                if (!res.ok) {
                    throw new Error(data.error || "Failed to fetch scan data");
                }

                setScanData(data);
                console.log(data);
            } catch (error) {
                console.error(error);
            }
        };

        fetchScanData();
    }, [scanID, scanDataType]);

    return (
        <div>
            <h2>Scan ID: {scanID}</h2>
            <p>Type: {scanDataType}</p>
        </div>
    );
};

export default ScanResult;

