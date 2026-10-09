package com.helpdesk;

import java.sql.*;
import java.util.*;

public class Database {

    // Change these values for your local MySQL installation.
    private static final String URL = "jdbc:mysql://localhost:3306/helpdesk";
    private static final String USER = "root";
    private static final String PASSWORD = "farfalla@1701";

    static {
        try {
            Class.forName("com.mysql.cj.jdbc.Driver");
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    public static Connection getConnection() throws SQLException {
        return DriverManager.getConnection(URL, USER, PASSWORD);
    }

    public static void insert(Ticket t) throws SQLException {
        String sql = "INSERT INTO tickets(ticket_id,employee_name,title,description,priority,assigned_to,status) VALUES(?,?,?,?,?,?,?)";

        try (Connection c = getConnection();
             PreparedStatement ps = c.prepareStatement(sql)) {

            ps.setString(1, t.id);
            ps.setString(2, t.employeeName);
            ps.setString(3, t.title);
            ps.setString(4, t.description);
            ps.setString(5, t.priority);
            ps.setString(6, t.assignedTo);
            ps.setString(7, t.status);

            ps.executeUpdate();
        }
    }

    public static List<Ticket> findAll() throws SQLException {
        List<Ticket> out = new ArrayList<>();

        try (Connection c = getConnection();
             Statement s = c.createStatement();
             ResultSet rs = s.executeQuery(
                 "SELECT * FROM tickets ORDER BY created_at DESC")) {

            while (rs.next()) {
                out.add(new Ticket(
                    rs.getString("ticket_id"),
                    rs.getString("employee_name"),
                    rs.getString("title"),
                    rs.getString("description"),
                    rs.getString("priority"),
                    rs.getString("assigned_to"),
                    rs.getString("status")
                ));
            }
        }

        return out;
    }

    public static void updateStatus(String id, String status) throws SQLException {
        try (Connection c = getConnection();
             PreparedStatement ps = c.prepareStatement(
                 "UPDATE tickets SET status=? WHERE ticket_id=?")) {

            ps.setString(1, status);
            ps.setString(2, id);

            ps.executeUpdate();
        }
    }

    // UPDATE TICKET ASSIGNEE
    public static void updateAssignedTo(String id, String assignedTo) throws SQLException {

        String sql = "UPDATE tickets SET assigned_to=? WHERE ticket_id=?";

        try (Connection c = getConnection();
             PreparedStatement ps = c.prepareStatement(sql)) {

            ps.setString(1, assignedTo);
            ps.setString(2, id);

            ps.executeUpdate();
        }
    }
}