package com.helpdesk;

import com.google.gson.Gson;
import com.sun.net.httpserver.*;
import java.io.*;
import java.net.*;
import java.nio.charset.StandardCharsets;
import java.util.*;

public class App {

    static final Gson gson = new Gson();
    static final TicketManager manager = new TicketManager();

    public static void main(String[] args) throws Exception {

        try {
            for (Ticket t : Database.findAll()) {
                manager.add(t);
            }

            System.out.println("Loaded tickets from MySQL.");

        } catch (Exception e) {
            System.out.println(
                "Database not loaded. Check MySQL credentials/schema."
            );
        }

        HttpServer server = HttpServer.create(
            new InetSocketAddress(8080), 0
        );

        server.createContext("/api/tickets", App::tickets);
        server.createContext("/api/tickets/create", App::create);
        server.createContext("/api/tickets/status", App::status);
        server.createContext("/api/tickets/assign", App::assign);
        server.createContext("/api/tickets/next", App::next);

        server.setExecutor(null);
        server.start();

        System.out.println(
            "HelpDesk API running at http://localhost:8080"
        );
    }

    static void cors(HttpExchange ex) {

        ex.getResponseHeaders().set(
            "Access-Control-Allow-Origin", "*"
        );

        ex.getResponseHeaders().set(
            "Access-Control-Allow-Headers", "Content-Type"
        );

        ex.getResponseHeaders().set(
            "Access-Control-Allow-Methods",
            "GET,POST,PUT,OPTIONS"
        );
    }

    static void send(
        HttpExchange ex,
        int code,
        String body
    ) throws IOException {

        cors(ex);

        byte[] b = body.getBytes(StandardCharsets.UTF_8);

        ex.getResponseHeaders().set(
            "Content-Type",
            "application/json"
        );

        ex.sendResponseHeaders(code, b.length);

        try (OutputStream os = ex.getResponseBody()) {
            os.write(b);
        }
    }

    static String body(HttpExchange ex) throws IOException {

        return new String(
            ex.getRequestBody().readAllBytes(),
            StandardCharsets.UTF_8
        );
    }

    static void tickets(HttpExchange ex) throws IOException {

        if ("OPTIONS".equals(ex.getRequestMethod())) {
            send(ex, 204, "");
            return;
        }

        try {
            send(
                ex,
                200,
                gson.toJson(manager.all())
            );

        } catch (Exception e) {
            send(
                ex,
                500,
                gson.toJson(
                    Map.of("error", e.getMessage())
                )
            );
        }
    }

    static void create(HttpExchange ex) throws IOException {

        if ("OPTIONS".equals(ex.getRequestMethod())) {
            send(ex, 204, "");
            return;
        }

        try {

            Ticket t = gson.fromJson(
                body(ex),
                Ticket.class
            );

            if (t.id == null || t.id.isBlank()) {
                t.id = "T-" + System.currentTimeMillis();
            }

            if (t.status == null || t.status.isBlank()) {
                t.status =
                    (t.assignedTo == null ||
                     t.assignedTo.isBlank())
                    ? "Open"
                    : "Assigned";
            }

            manager.add(t);
            Database.insert(t);

            send(
                ex,
                201,
                gson.toJson(t)
            );

        } catch (Exception e) {

            send(
                ex,
                500,
                gson.toJson(
                    Map.of("error", e.getMessage())
                )
            );
        }
    }

    static void status(HttpExchange ex) throws IOException {

        if ("OPTIONS".equals(ex.getRequestMethod())) {
            send(ex, 204, "");
            return;
        }

        try {

            Map<?, ?> data = gson.fromJson(
                body(ex),
                Map.class
            );

            String id = String.valueOf(data.get("id"));

            String newStatus =
                String.valueOf(data.get("status"));

            Ticket t = manager.find(id);

            if (t == null) {
                send(
                    ex,
                    404,
                    "{\"error\":\"Ticket not found\"}"
                );
                return;
            }

            t.status = newStatus;

            Database.updateStatus(
                id,
                newStatus
            );

            send(
                ex,
                200,
                gson.toJson(t)
            );

        } catch (Exception e) {

            send(
                ex,
                500,
                gson.toJson(
                    Map.of("error", e.getMessage())
                )
            );
        }
    }

    // ASSIGN TICKET TO TEAM MEMBER
    static void assign(HttpExchange ex) throws IOException {

        if ("OPTIONS".equals(ex.getRequestMethod())) {
            send(ex, 204, "");
            return;
        }

        try {

            Map<?, ?> data = gson.fromJson(
                body(ex),
                Map.class
            );

            String id =
                String.valueOf(data.get("id"));

            String assignedTo =
                String.valueOf(data.get("assignedTo"));

            Ticket t = manager.find(id);

            if (t == null) {
                send(
                    ex,
                    404,
                    "{\"error\":\"Ticket not found\"}"
                );
                return;
            }

            // Save assignment in MySQL
            Database.updateAssignedTo(
                id,
                assignedTo
            );

            // Update in-memory ticket
            t.assignedTo = assignedTo;

            // Change Open → Assigned
            if (t.status == null ||
                t.status.equalsIgnoreCase("Open")) {

                t.status = "Assigned";

                Database.updateStatus(
                    id,
                    "Assigned"
                );
            }

            send(
                ex,
                200,
                gson.toJson(t)
            );

        } catch (Exception e) {

            send(
                ex,
                500,
                gson.toJson(
                    Map.of("error", e.getMessage())
                )
            );
        }
    }

    static void next(HttpExchange ex) throws IOException {

        Ticket t = manager.nextPriorityTicket();

        send(
            ex,
            200,
            gson.toJson(t)
        );
    }
}