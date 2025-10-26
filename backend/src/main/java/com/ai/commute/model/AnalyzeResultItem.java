package com.ai.commute.model;

public record AnalyzeResultItem(
        String mode,
        double distanceKm,
        int timeMins,
        double carbonKg,
        double energySavedKWh
) {}
