const db = require("../config/db");

const COMPLETED_STATUSES = ["Completed", "Complete", "Finished", "Done"];

function getMembershipSummary(completedAppointments) {
    if (completedAppointments >= 6) {
        return {
            loyalty_level: "Gold",
            discount_percent: 15,
            next_level: null,
            appointments_needed_for_next_level: 0,
            milestone_message: "You have unlocked Gold rewards and the best grooming discount."
        };
    }

    if (completedAppointments >= 3) {
        return {
            loyalty_level: "Silver",
            discount_percent: 10,
            next_level: "Gold",
            appointments_needed_for_next_level: 6 - completedAppointments,
            milestone_message: "A couple more completed visits will unlock Gold rewards."
        };
    }

    return {
        loyalty_level: "Bronze",
        discount_percent: 5,
        next_level: "Silver",
        appointments_needed_for_next_level: 3 - completedAppointments,
        milestone_message: "Keep booking grooming visits to unlock bigger discounts."
    };
}

function buildSummary(user, completedAppointments) {
    const membership = getMembershipSummary(completedAppointments);

    return {
        user_id: user.user_id,
        user_name: `${user.first_name || ""} ${user.last_name || ""}`.trim(),
        email: user.email,
        completed_appointments: completedAppointments,
        loyalty_level: membership.loyalty_level,
        discount_percent: membership.discount_percent,
        next_level: membership.next_level,
        appointments_needed_for_next_level: membership.appointments_needed_for_next_level,
        milestone_message: membership.milestone_message
    };
}

exports.getMyLoyalty = (req, res) => {
    const user_id = req.user.user_id;

    const sql = `
        SELECT
            o.user_id,
            o.first_name,
            o.last_name,
            o.email,
            COUNT(DISTINCT a.appointment_id) AS completed_appointments
        FROM user o
        LEFT JOIN pet p ON p.user_id = o.user_id AND p.active_flag = TRUE
        LEFT JOIN appointments a ON a.pet_id = p.pet_id
            AND a.status IN (${COMPLETED_STATUSES.map(() => "?").join(", ")})
        WHERE o.user_id = ?
        GROUP BY o.user_id, o.first_name, o.last_name, o.email
    `;

    db.query(sql, [...COMPLETED_STATUSES, user_id], (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: "user profile not found" });
        }

        const user = results[0];
        const completedAppointments = Number(user.completed_appointments || 0);

        res.json(buildSummary(user, completedAppointments));
    });
};

exports.getAdminLoyalty = (req, res) => {
    const sql = `
        SELECT
            o.user_id,
            o.first_name,
            o.last_name,
            o.email,
            COUNT(DISTINCT a.appointment_id) AS completed_appointments
        FROM user o
        LEFT JOIN pet p ON p.user_id = o.user_id AND p.active_flag = TRUE
        LEFT JOIN appointments a ON a.pet_id = p.pet_id
            AND a.status IN (${COMPLETED_STATUSES.map(() => "?").join(", ")})
        GROUP BY o.user_id, o.first_name, o.last_name, o.email
        ORDER BY completed_appointments DESC, o.last_name ASC
    `;

    db.query(sql, COMPLETED_STATUSES, (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        const summary = results.map((user) => {
            const completedAppointments = Number(user.completed_appointments || 0);
            return buildSummary(user, completedAppointments);
        });

        res.json({ data: summary });
    });
};
