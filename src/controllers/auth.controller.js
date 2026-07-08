const bcrypt = require("bcrypt");
const db = require("../config/db");

const { generateToken } = require("../utils/jwt");

// Register
exports.register = async (req, res) => {
    try {
        const {
            first_name,
            last_name,
            phone_number,
            email,
            password
        } = req.body;

        db.query(
            `
            SELECT email, phone_number
            FROM user
            WHERE email = ? OR phone_number = ?
            `,
            [email, phone_number],
            async (err, existing) => {

                if (err) {
                    return res.status(500).json({
                        message: "Internal server error"
                    });
                }

                const emailExists = existing.some(
                    user => user.email === email
                );

                const phoneExists = existing.some(
                    user => user.phone_number === phone_number
                );

                if (emailExists) {
                    return res.status(400).json({
                        message: "Email already exists"
                    });
                }

                if (phoneExists) {
                    return res.status(400).json({
                        message: "Phone number already exists"
                    });
                }

                const hashedPassword =
                    await bcrypt.hash(password, 10);

                db.query(
                    `
                    INSERT INTO user
                    (
                    first_name,
                    last_name,
                    phone_number,
                    email,
                    password
                    )
                    VALUES
                    (?, ?, ?, ?, ?)
                    `,
                    [
                        first_name,
                        last_name,
                        phone_number,
                        email,
                        hashedPassword
                    ],
                    (err, result) => {

                        if (err) {
                            return res.status(500).json({
                                message: "Internal server error"
                            });
                        }

                        res.status(201).json({
                            message: "Registered successfully",
                            user_id: result.insertId,
                            role: "Customer"
                        });

                    }
                );

            }
        );

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Internal server error"
        });
    }
};

// Login
exports.login = async (req, res) => {

    try {

        const {
            email,
            password
        } = req.body;

        db.query(
            `
            SELECT *
            FROM user
            WHERE email = ?
            AND active_flag = TRUE
            `,
            [email],
            async (err, users) => {

                if (err) {
                    return res.status(500).json({
                        message: "Internal server error"
                    });
                }

                if (users.length === 0) {
                    return res.status(400).json({
                        message: "Invalid email or password"
                    });
                }

                const user = users[0];

                const match =
                    await bcrypt.compare(
                        password,
                        user.password
                    );

                if (!match) {
                    return res.status(400).json({
                        message: "Invalid email or password"
                    });
                }

                const token =
                    generateToken(user);

                res.json({
                    message: "Login successful",
                    token,
                    user:{
                        user_id:user.user_id,
                        first_name:user.first_name,
                        last_name:user.last_name,
                        role:user.role
                    }
                });

            }
        );

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Internal server error"
        });

    }

};