package com.ai.commute.service;

import com.ai.commute.model.AnalyzeResultItem;
import com.ai.commute.model.AnalyzeResponse;
import com.ai.commute.model.SuggestionRequest;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.util.*;

@Service
public class AnalyzeService {
    private static final double KG_CO2_PER_KM_CAR = 0.171;
    private static final double KG_CO2_PER_KM_MOTORCYCLE = 0.103;
    private static final double KG_CO2_PER_KM_BUS = 0.12; // conservative
    private static final double KG_CO2_PER_KM_TRAIN = 0.041;
    private static final double KG_CO2_PER_KM_METRO = 0.05;
    private static final double KG_CO2_PER_KM_WALK_BIKE = 0.0;
    private static final double KG_CO2_PER_KM_AIR = 0.255;

    private static final double KWH_PER_KM_CAR = 0.58;
    private static final double KWH_PER_KM_MOTORCYCLE = 0.25;
    private static final double KWH_PER_KM_BUS = 0.12;
    private static final double KWH_PER_KM_TRAIN = 0.08;
    private static final double KWH_PER_KM_METRO = 0.06;
    private static final double KWH_PER_KM_WALK_BIKE = 0.0;
    private static final double KWH_PER_KM_AIR = 0.9;

    private final ObjectMapper mapper = new ObjectMapper();
    private final HttpClient http = HttpClient.newHttpClient();

    public AnalyzeResponse analyze(SuggestionRequest req) throws IOException, InterruptedException {
        var A = geocode(req.from());
        var B = geocode(req.to());

        var car = osrmRoute("driving", A, B);
        var bike = osrmRoute("cycling", A, B);
        var foot = osrmRoute("foot", A, B);

        double airDist = haversine(A[0], A[1], B[0], B[1]);
        int airMins = (int)Math.round((airDist / 850.0) * 60.0 + 60.0);

        var items = new ArrayList<AnalyzeResultItem>();
        items.add(item("Car", car.distanceKm, car.timeMins, KG_CO2_PER_KM_CAR, KWH_PER_KM_CAR));
        items.add(item("Motorcycle", car.distanceKm, (int)Math.round((car.distanceKm/50.0)*60.0), KG_CO2_PER_KM_MOTORCYCLE, KWH_PER_KM_MOTORCYCLE));
        items.add(item("Bus", car.distanceKm, (int)Math.round((car.distanceKm/28.0)*60.0), KG_CO2_PER_KM_BUS, KWH_PER_KM_BUS));
        items.add(item("Cycle", bike.distanceKm, bike.timeMins, KG_CO2_PER_KM_WALK_BIKE, KWH_PER_KM_WALK_BIKE));
        items.add(item("Walking", foot.distanceKm, foot.timeMins, KG_CO2_PER_KM_WALK_BIKE, KWH_PER_KM_WALK_BIKE));
        items.add(item("Aeroplane", airDist, airMins, KG_CO2_PER_KM_AIR, KWH_PER_KM_AIR));
        // Train/Metro approximations; for exact values, integrate OTP and replace here
        items.add(item("Train", airDist*1.18, (int)Math.round(((airDist*1.18)/90.0)*60.0+20), KG_CO2_PER_KM_TRAIN, KWH_PER_KM_TRAIN));
        items.add(item("Metro", Math.min(airDist, 40), (int)Math.round((Math.min(airDist,40)/35.0)*60.0+10), KG_CO2_PER_KM_METRO, KWH_PER_KM_METRO));

        // logical constraints similar to frontend
        var logical = new ArrayList<AnalyzeResultItem>();
        for (var i : items) {
            String m = i.mode().toLowerCase();
            if (m.equals("walking") && i.distanceKm() > 8) continue;
            if (m.equals("cycle") && i.distanceKm() > 25) continue;
            if (m.equals("metro") && i.distanceKm() > 60) continue;
            // keep aeroplane in list for visibility; we may avoid suggesting it for short trips
            if (m.equals("motorcycle") && i.distanceKm() > 200) continue;
            if (m.equals("bus") && i.distanceKm() > 800) continue;
            if (m.equals("car") && i.distanceKm() > 1200) continue;
            logical.add(i);
        }

        // Prefer not to suggest aeroplane for short trips (<500 km)
        var candidates = logical.stream().filter(x -> !(x.mode().equals("Aeroplane") && x.distanceKm() < 500)).toList();
        var pool = candidates.isEmpty() ? logical : candidates;

        AnalyzeResultItem suggested = pool.stream()
                .min(Comparator.comparingDouble(x -> x.carbonKg()*2.0 + x.timeMins()))
                .orElse(pool.get(0));

        return new AnalyzeResponse(suggested.mode(), suggested, logical);
    }

    private AnalyzeResultItem item(String label, double distKm, int mins, double kgCo2PerKm, double kwhPerKm) {
        double carbon = round(distKm * kgCo2PerKm, 3);
        double saved = round(Math.max(0.0, distKm * (KWH_PER_KM_CAR - kwhPerKm)), 3);
        if (saved > 0 && saved < 0.05) saved = 0.05;
        if (label.equals("Car") || label.equals("Aeroplane")) saved = 0.0;
        return new AnalyzeResultItem(label, round(distKm,2), mins, carbon, saved);
    }

    private record Route(double distanceKm, int timeMins) {}

    private double[] geocode(String q) throws IOException, InterruptedException {
        String url = String.format("https://nominatim.openstreetmap.org/search?q=%s&format=jsonv2&limit=1&addressdetails=1",
                URLEncoder.encode(q, StandardCharsets.UTF_8));
        var req = HttpRequest.newBuilder(URI.create(url)).header("User-Agent","ai-commute-backend/0.1").GET().build();
        var resp = http.send(req, HttpResponse.BodyHandlers.ofString());
        JsonNode arr = mapper.readTree(resp.body());
        if (!arr.isArray() || arr.size()==0) throw new IOException("geocode failed");
        var n = arr.get(0);
        return new double[]{ n.path("lat").asDouble(), n.path("lon").asDouble() };
    }

    private Route osrmRoute(String profile, double[] A, double[] B) throws IOException, InterruptedException {
        String qs = "overview=false&alternatives=true&steps=false&annotations=speed";
        String url = String.format("https://router.project-osrm.org/route/v1/%s/%f,%f;%f,%f?%s", profile, A[1], A[0], B[1], B[0], qs);
        var req = HttpRequest.newBuilder(URI.create(url)).GET().build();
        var resp = http.send(req, HttpResponse.BodyHandlers.ofString());
        JsonNode root = mapper.readTree(resp.body());
        if (!"Ok".equals(root.path("code").asText())) throw new IOException("osrm failed");
        var routes = root.path("routes");
        JsonNode pick = routes.get(0);
        double bestScore = -1;
        for (JsonNode rt : routes) {
            double hi = 0, cnt = 0;
            for (JsonNode leg : rt.path("legs")) {
                for (JsonNode s : leg.path("annotation").path("speed")) { cnt++; if (s.asDouble() >= 22.22) hi++; }
            }
            double score = cnt>0 ? hi/cnt : 0;
            if (score > bestScore) { bestScore = score; pick = rt; }
        }
        double distanceKm = round(pick.path("distance").asDouble(0)/1000.0,2);
        int timeMins = (int)Math.round(pick.path("duration").asDouble(0)/60.0);
        return new Route(distanceKm, timeMins);
    }

    private static double haversine(double lat1, double lon1, double lat2, double lon2) {
        double R = 6371.0; // km
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        double a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2)) *
                Math.sin(dLon/2) * Math.sin(dLon/2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
    }

    private static double round(double v, int d) {
        double m = Math.pow(10, d);
        return Math.round(v * m) / m;
    }
}
