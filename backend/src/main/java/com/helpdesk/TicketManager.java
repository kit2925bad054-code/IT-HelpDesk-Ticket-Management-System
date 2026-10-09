package com.helpdesk;

import java.util.*;

public class TicketManager {
    // HashMap: O(1) average lookup by Ticket ID.
    private final HashMap<String, Ticket> ticketMap = new HashMap<>();

    // PriorityQueue: highest priority ticket is processed first.
    private final PriorityQueue<Ticket> priorityQueue = new PriorityQueue<>(
        Comparator.comparingInt((Ticket t) -> priorityValue(t.priority)).reversed()
                  .thenComparing(t -> t.id)
    );

    private int priorityValue(String p) {
        return switch (p) {
            case "Critical" -> 4;
            case "High" -> 3;
            case "Medium" -> 2;
            default -> 1;
        };
    }

    public synchronized void add(Ticket ticket) {
        ticketMap.put(ticket.id, ticket);
        if (!"Resolved".equals(ticket.status)) priorityQueue.offer(ticket);
    }

    public synchronized Ticket find(String id) { return ticketMap.get(id); }

    public synchronized List<Ticket> all() { return new ArrayList<>(ticketMap.values()); }

    public synchronized Ticket nextPriorityTicket() {
        while (!priorityQueue.isEmpty()) {
            Ticket t = priorityQueue.poll();
            if (ticketMap.containsKey(t.id) && !"Resolved".equals(t.status)) return t;
        }
        return null;
    }
}
