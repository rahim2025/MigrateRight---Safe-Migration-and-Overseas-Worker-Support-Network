# Migration Cost Calculator - Example API Responses

## 1. Get Available Countries

**Request:**
```http
GET /api/calculator/countries
```

**Response:**
```json
{
  "success": true,
  "data": {
    "countries": [
      "Malaysia",
      "Qatar",
      "Saudi Arabia",
      "Singapore",
      "United Arab Emirates"
    ],
    "count": 5
  }
}
```

---

## 2. Get Job Types by Country

**Request:**
```http
GET /api/calculator/countries/Saudi%20Arabia/jobs
```

**Response:**
```json
{
  "success": true,
  "data": {
    "country": "Saudi Arabia",
    "jobTypes": [
      "construction",
      "domestic_work"
    ],
    "count": 2
  }
}
```

---

## 3. Calculate Migration Cost - SAFE Fee (Within Legal Range)

**Request:**
```http
POST /api/calculator/calculate
Content-Type: application/json

{
  "destinationCountry": "Saudi Arabia",
  "jobType": "construction",
  "agencyFee": 150000,
  "additionalCosts": {
    "airfare": 35000,
    "documentation": 5000,
    "insurance": 3000
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "calculation": {
      "destinationCountry": "Saudi Arabia",
      "jobType": "construction",
      "userInputs": {
        "agencyFee": 150000,
        "additionalCosts": {
          "agencyFee": 150000,
          "governmentFees": 36050,
          "airfare": 35000,
          "documentation": 5000,
          "insurance": 3000,
          "other": 0
        }
      },
      "totalUserCost": 229050
    },
    "legalFeeRange": {
      "agencyFee": {
        "min": 95000,
        "max": 165000,
        "currency": "BDT"
      },
      "totalCost": {
        "min": 159050,
        "max": 234050,
        "currency": "BDT"
      }
    },
    "comparison": {
      "userFee": 150000,
      "legalRange": {
        "min": 95000,
        "max": 165000,
        "currency": "BDT"
      },
      "difference": -15000,
      "percentAboveMax": 0,
      "percentBelowMin": 0,
      "isWithinLegalRange": true,
      "warnings": [
        {
          "level": "safe",
          "type": "within_range",
          "message": "This fee is within the government-approved legal range.",
          "recommendation": "Still verify the agency is licensed and get everything in writing."
        }
      ]
    },
    "breakdown": {
      "recruitmentFee": {
        "min": 95000,
        "max": 165000,
        "currency": "BDT",
        "description": "Agency recruitment fee (legal range)"
      },
      "governmentFees": {
        "visa": 8000,
        "passport": 3550,
        "medicalTest": 2500,
        "trainingFee": 15000,
        "emigrationClearance": 2000,
        "other": 5000,
        "total": 36050,
        "currency": "BDT",
        "description": "Mandatory government fees"
      },
      "estimatedCosts": {
        "airfare": {
          "min": 25000,
          "max": 45000,
          "description": "Flight ticket (estimated range)"
        },
        "documentation": {
          "amount": 5000,
          "description": "Document preparation and notarization"
        },
        "insurance": {
          "amount": 3000,
          "description": "Travel and health insurance"
        },
        "currency": "BDT"
      },
      "totalCost": {
        "minimum": 159050,
        "maximum": 234050,
        "currency": "BDT",
        "description": "Total estimated migration cost range"
      }
    },
    "warnings": [
      {
        "level": "safe",
        "type": "within_range",
        "message": "This fee is within the government-approved legal range.",
        "recommendation": "Still verify the agency is licensed and get everything in writing."
      }
    ],
    "recommendations": {
      "verifyAgency": true,
      "getWrittenAgreement": true,
      "checkBMETLicense": true,
      "reportSuspiciousFees": false,
      "additionalAdvice": [
        "The quoted fee is within legal limits, but always verify the agency is BMET-licensed.",
        "Request a detailed written breakdown of all costs before making any payment.",
        "Never pay cash without a proper receipt.",
        "Keep all documents and receipts safe.",
        "Verify the job offer letter is genuine before making any payments."
      ]
    },
    "resources": {
      "bmetWebsite": "https://www.old.bmet.gov.bd",
      "complaintPortal": "https://www.old.bmet.gov.bd/BMET/complaintAction",
      "verifyAgency": "https://www.old.bmet.gov.bd/BMET/agencyList",
      "helpline": "16106 (BMET Hotline)"
    }
  }
}
```

---

## 4. Calculate Migration Cost - ILLEGAL Fee (Above Legal Maximum)

**Request:**
```http
POST /api/calculator/calculate
Content-Type: application/json

{
  "destinationCountry": "Saudi Arabia",
  "jobType": "construction",
  "agencyFee": 250000
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "calculation": {
      "destinationCountry": "Saudi Arabia",
      "jobType": "construction",
      "userInputs": {
        "agencyFee": 250000,
        "additionalCosts": {
          "agencyFee": 250000,
          "governmentFees": 36050,
          "airfare": 0,
          "documentation": 5000,
          "insurance": 3000,
          "other": 0
        }
      },
      "totalUserCost": 294050
    },
    "legalFeeRange": {
      "agencyFee": {
        "min": 95000,
        "max": 165000,
        "currency": "BDT"
      },
      "totalCost": {
        "min": 159050,
        "max": 234050,
        "currency": "BDT"
      }
    },
    "comparison": {
      "userFee": 250000,
      "legalRange": {
        "min": 95000,
        "max": 165000,
        "currency": "BDT"
      },
      "difference": 85000,
      "percentAboveMax": 51.5,
      "percentBelowMin": 0,
      "isWithinLegalRange": false,
      "warnings": [
        {
          "level": "severe",
          "type": "illegal_overcharge",
          "message": "This fee is 51.5% above the legal maximum. This is ILLEGAL and constitutes exploitation.",
          "recommendation": "Do NOT pay this amount. Report this agency to BMET immediately. Seek help from verified agencies.",
          "reportUrl": "https://www.old.bmet.gov.bd/BMET/complaintAction"
        }
      ]
    },
    "breakdown": {
      "recruitmentFee": {
        "min": 95000,
        "max": 165000,
        "currency": "BDT",
        "description": "Agency recruitment fee (legal range)"
      },
      "governmentFees": {
        "visa": 8000,
        "passport": 3550,
        "medicalTest": 2500,
        "trainingFee": 15000,
        "emigrationClearance": 2000,
        "other": 5000,
        "total": 36050,
        "currency": "BDT",
        "description": "Mandatory government fees"
      },
      "estimatedCosts": {
        "airfare": {
          "min": 25000,
          "max": 45000,
          "description": "Flight ticket (estimated range)"
        },
        "documentation": {
          "amount": 5000,
          "description": "Document preparation and notarization"
        },
        "insurance": {
          "amount": 3000,
          "description": "Travel and health insurance"
        },
        "currency": "BDT"
      },
      "totalCost": {
        "minimum": 159050,
        "maximum": 234050,
        "currency": "BDT",
        "description": "Total estimated migration cost range"
      }
    },
    "warnings": [
      {
        "level": "severe",
        "type": "illegal_overcharge",
        "message": "This fee is 51.5% above the legal maximum. This is ILLEGAL and constitutes exploitation.",
        "recommendation": "Do NOT pay this amount. Report this agency to BMET immediately. Seek help from verified agencies.",
        "reportUrl": "https://www.old.bmet.gov.bd/BMET/complaintAction"
      }
    ],
    "recommendations": {
      "verifyAgency": true,
      "getWrittenAgreement": true,
      "checkBMETLicense": true,
      "reportSuspiciousFees": true,
      "additionalAdvice": [
        "DO NOT pay this amount without verification. Contact BMET immediately.",
        "Ask the agency to justify why their fee exceeds the legal maximum.",
        "Consider reporting this agency if they refuse to lower the fee.",
        "Common scams for Saudi Arabia: Be aware of agencies promising guaranteed jobs or asking for extra \"processing fees\".",
        "Never pay cash without a proper receipt.",
        "Keep all documents and receipts safe.",
        "Verify the job offer letter is genuine before making any payments."
      ]
    },
    "resources": {
      "bmetWebsite": "https://www.old.bmet.gov.bd",
      "complaintPortal": "https://www.old.bmet.gov.bd/BMET/complaintAction",
      "verifyAgency": "https://www.old.bmet.gov.bd/BMET/agencyList",
      "helpline": "16106 (BMET Hotline)"
    }
  }
}
```

---

## 5. Calculate Migration Cost - SUSPICIOUS Fee (Below Minimum)

**Request:**
```http
POST /api/calculator/calculate
Content-Type: application/json

{
  "destinationCountry": "Saudi Arabia",
  "jobType": "construction",
  "agencyFee": 40000
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "calculation": {
      "destinationCountry": "Saudi Arabia",
      "jobType": "construction",
      "userInputs": {
        "agencyFee": 40000,
        "additionalCosts": {
          "agencyFee": 40000,
          "governmentFees": 36050,
          "airfare": 0,
          "documentation": 5000,
          "insurance": 3000,
          "other": 0
        }
      },
      "totalUserCost": 84050
    },
    "legalFeeRange": {
      "agencyFee": {
        "min": 95000,
        "max": 165000,
        "currency": "BDT"
      },
      "totalCost": {
        "min": 159050,
        "max": 234050,
        "currency": "BDT"
      }
    },
    "comparison": {
      "userFee": 40000,
      "legalRange": {
        "min": 95000,
        "max": 165000,
        "currency": "BDT"
      },
      "difference": -125000,
      "percentAboveMax": 0,
      "percentBelowMin": 57.9,
      "isWithinLegalRange": false,
      "warnings": [
        {
          "level": "severe",
          "type": "suspiciously_low",
          "message": "This fee is significantly below the legal minimum. This is highly suspicious and may indicate a scam or hidden fees.",
          "recommendation": "Do not proceed. Verify with BMET and request detailed cost breakdown."
        }
      ]
    },
    "breakdown": {
      "recruitmentFee": {
        "min": 95000,
        "max": 165000,
        "currency": "BDT",
        "description": "Agency recruitment fee (legal range)"
      },
      "governmentFees": {
        "visa": 8000,
        "passport": 3550,
        "medicalTest": 2500,
        "trainingFee": 15000,
        "emigrationClearance": 2000,
        "other": 5000,
        "total": 36050,
        "currency": "BDT",
        "description": "Mandatory government fees"
      },
      "estimatedCosts": {
        "airfare": {
          "min": 25000,
          "max": 45000,
          "description": "Flight ticket (estimated range)"
        },
        "documentation": {
          "amount": 5000,
          "description": "Document preparation and notarization"
        },
        "insurance": {
          "amount": 3000,
          "description": "Travel and health insurance"
        },
        "currency": "BDT"
      },
      "totalCost": {
        "minimum": 159050,
        "maximum": 234050,
        "currency": "BDT",
        "description": "Total estimated migration cost range"
      }
    },
    "warnings": [
      {
        "level": "severe",
        "type": "suspiciously_low",
        "message": "This fee is significantly below the legal minimum. This is highly suspicious and may indicate a scam or hidden fees.",
        "recommendation": "Do not proceed. Verify with BMET and request detailed cost breakdown."
      }
    ],
    "recommendations": {
      "verifyAgency": true,
      "getWrittenAgreement": true,
      "checkBMETLicense": true,
      "reportSuspiciousFees": false,
      "additionalAdvice": [
        "Be very cautious of fees significantly below the legal minimum.",
        "There may be hidden costs or this could be a scam.",
        "Ask for a complete written cost breakdown including all fees.",
        "Common scams for Saudi Arabia: Be aware of agencies promising guaranteed jobs or asking for extra \"processing fees\".",
        "Never pay cash without a proper receipt.",
        "Keep all documents and receipts safe.",
        "Verify the job offer letter is genuine before making any payments."
      ]
    },
    "resources": {
      "bmetWebsite": "https://www.old.bmet.gov.bd",
      "complaintPortal": "https://www.old.bmet.gov.bd/BMET/complaintAction",
      "verifyAgency": "https://www.old.bmet.gov.bd/BMET/agencyList",
      "helpline": "16106 (BMET Hotline)"
    }
  }
}
```

---

## 6. Get Fee Rule Details

**Request:**
```http
GET /api/calculator/fee-rules?country=Saudi%20Arabia&jobType=construction
```

**Response:**
```json
{
  "success": true,
  "data": {
    "feeRule": {
      "destinationCountry": "Saudi Arabia",
      "jobType": "construction",
      "fees": {
        "recruitmentFee": {
          "min": 95000,
          "max": 165000,
          "currency": "BDT"
        },
        "governmentFees": {
          "visa": { "amount": 8000, "currency": "BDT" },
          "passport": { "amount": 3550, "currency": "BDT" },
          "medicalTest": { "amount": 2500, "currency": "BDT" },
          "trainingFee": { "amount": 15000, "currency": "BDT" },
          "emigrationClearance": { "amount": 2000, "currency": "BDT" },
          "other": { "amount": 5000, "currency": "BDT" }
        },
        "estimatedCosts": {
          "airfare": { "min": 25000, "max": 45000, "currency": "BDT" },
          "documentation": { "amount": 5000, "currency": "BDT" },
          "insurance": { "amount": 3000, "currency": "BDT" }
        }
      },
      "legalReference": {
        "governmentAgency": "Bureau of Manpower, Employment and Training (BMET)",
        "regulationNumber": "BMET/2023/SA/001",
        "effectiveDate": "2023-01-01T00:00:00.000Z",
        "sourceUrl": "https://www.old.bmet.gov.bd",
        "lastVerifiedDate": "2026-01-02T00:00:00.000Z"
      },
      "costBreakdown": {
        "recruitmentFee": {
          "min": 95000,
          "max": 165000,
          "currency": "BDT",
          "description": "Agency recruitment fee (legal range)"
        },
        "governmentFees": {
          "visa": 8000,
          "passport": 3550,
          "medicalTest": 2500,
          "trainingFee": 15000,
          "emigrationClearance": 2000,
          "other": 5000,
          "total": 36050,
          "currency": "BDT",
          "description": "Mandatory government fees"
        },
        "estimatedCosts": {
          "airfare": {
            "min": 25000,
            "max": 45000,
            "description": "Flight ticket (estimated range)"
          },
          "documentation": {
            "amount": 5000,
            "description": "Document preparation and notarization"
          },
          "insurance": {
            "amount": 3000,
            "description": "Travel and health insurance"
          },
          "currency": "BDT"
        },
        "totalCost": {
          "minimum": 159050,
          "maximum": 234050,
          "currency": "BDT",
          "description": "Total estimated migration cost range"
        }
      },
      "commonScams": [
        {
          "description": "Fake visa promises",
          "redFlags": [
            "No proper documentation",
            "Cash-only payments",
            "Guaranteed job without interview"
          ]
        }
      ],
      "notes": "Fees are based on BMET-approved costs for Saudi Arabia. Workers must verify agency license before payment."
    }
  }
}
```

---

## 7. Error Response - No Fee Rule Found

**Request:**
```http
POST /api/calculator/calculate
Content-Type: application/json

{
  "destinationCountry": "Unknown Country",
  "jobType": "construction",
  "agencyFee": 100000
}
```

**Response:**
```json
{
  "success": false,
  "error": "NotFoundError",
  "message": "No fee rules found for construction jobs in Unknown Country. This may be a new destination or job type not yet regulated.",
  "statusCode": 404,
  "timestamp": "2026-01-02T10:30:00.000Z"
}
```

---

## 8. Error Response - Missing Required Fields

**Request:**
```http
POST /api/calculator/calculate
Content-Type: application/json

{
  "destinationCountry": "Saudi Arabia"
}
```

**Response:**
```json
{
  "success": false,
  "error": "BadRequestError",
  "message": "Destination country, job type, and agency fee are required",
  "statusCode": 400,
  "timestamp": "2026-01-02T10:30:00.000Z"
}
```
