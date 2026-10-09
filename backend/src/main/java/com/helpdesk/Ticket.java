package com.helpdesk;

public class Ticket {
    public String id, employeeName, title, description, priority, assignedTo, status;

    public Ticket(String id, String employeeName, String title, String description,
                  String priority, String assignedTo, String status) {
        this.id=id; this.employeeName=employeeName; this.title=title;
        this.description=description; this.priority=priority;
        this.assignedTo=assignedTo; this.status=status;
    }
}
