package com.ai.commute.model;

import java.util.List;

public record AnalyzeResponse(
        String suggestedMode,
        AnalyzeResultItem suggested,
        List<AnalyzeResultItem> results
) {}
