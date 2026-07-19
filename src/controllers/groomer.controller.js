const db = require("../config/db");

exports.createGroomer = (req, res) => {

    const {
        first_name,
        last_name,
        email,
        phone_number,
        specialization,
        hire_date,
        availability = []
    } = req.body;

    const staffSql = `
        INSERT INTO staff
        (
            first_name,
            last_name,
            email,
            phone_number,
            specialization,
            hire_date
        )
        VALUES (?, ?, ?, ?, ?, ?)
    `;

    db.query(
        staffSql,
        [
            first_name,
            last_name,
            email || null,
            phone_number,
            specialization,
            hire_date
        ],
        (err, result) => {

            if (err) {
                return res.status(500).json({
                    error: err.message
                });
            }

            const staffId = result.insertId;

            // No availability submitted
            if (availability.length === 0) {
                return res.status(201).json({
                    message: "Groomer created successfully",
                    staff_id: staffId
                });
            }

            const availabilityValues = availability.map(slot => [

                staffId,
                slot.day_of_week,
                slot.start_time,
                slot.end_time

            ]);

            const availabilitySql = `
                INSERT INTO staff_availability
                (
                    staff_id,
                    day_of_week,
                    start_time,
                    end_time
                )
                VALUES ?
            `;

            db.query(
                availabilitySql,
                [availabilityValues],
                (availabilityErr) => {

                    if (availabilityErr) {

                        // Remove the staff if availability insertion fails
                        db.query(
                            "DELETE FROM staff WHERE staff_id = ?",
                            [staffId]
                        );

                        return res.status(500).json({
                            error: availabilityErr.message
                        });

                    }

                    res.status(201).json({

                        message: "Groomer created successfully",

                        staff_id: staffId

                    });

                }
            );

        }
    );

};

// gets all groomers (woah)
exports.getGroomers = (req, res) => {

    const sql = `
        SELECT
            staff_id,
            first_name,
            last_name,
            email,
            phone_number,
            specialization,
            hire_date,
            active_flag,
            created_at,
            updated_at
        FROM staff
        WHERE active_flag = TRUE;
    `;

    db.query(sql, (err, results) => {

        if (err) {
            return res.status(500).json({
                error: err.message
            });
        }

        res.json(results);

    });

};

exports.getGroomerById = (req, res) => {

    const { id } = req.params;

    const sql = `
        SELECT
            staff_id,
            first_name,
            last_name,
            email,
            phone_number,
            specialization,
            hire_date,
            active_flag,
            created_at,
            updated_at
        FROM staff
        WHERE staff_id = ? AND active_flag = TRUE;
    `;

    db.query(sql, [id], (err, results) => {

        if (err) {
            return res.status(500).json({
                error: err.message
            });
        }

        if (results.length === 0) {
            return res.status(404).json({
                message: "Groomer not found"
            });
        }

        res.json(results[0]);

    });

}
exports.updateGroomer = (req, res) => {

    const { id } = req.params;


    const {
        first_name,
        last_name,
        email,
        phone_number,
        specialization,
        hire_date
    } = req.body;



    const sql = `
        UPDATE staff
        SET
            first_name = ?,
            last_name = ?,
            email = ?,
            phone_number = ?,
            specialization = ?,
            hire_date = ?,
            updated_at = NOW()

        WHERE staff_id = ?
    `;



    db.query(
        sql,

        [
            first_name,
            last_name,
            email || null,
            phone_number,
            specialization,
            hire_date,
            id
        ],

        (err, result)=>{


            if(err){

                return res.status(500).json({

                    error: err.message

                });

            }



            if(result.affectedRows === 0){

                return res.status(404).json({

                    message:"Groomer not found"

                });

            }



            res.json({

                message:"Groomer updated successfully"

            });


        }

    );

};

exports.deactivateGroomer = (req, res) => {
    const {id} = req.params;

    const sql = "UPDATE staff SET active_flag = FALSE, updated_at = NOW() WHERE staff_id = ?";

    db.query(sql, [id], (err, result) => {
        if (err) {
            return res.status(500).json({
                error: err.message
            });
        }

        if (result.affectedRows === 0) {
                return res.status(404).json({
                    message: "Groomer not found"
                });
            }

        res.json({
            message: "Groomer deleted successfully"
        });
    });
};

exports.getAvailability = (req,res)=>{

    db.query(
        `
        SELECT
            day_of_week,
            start_time,
            end_time
        FROM staff_availability
        WHERE staff_id=?
        ORDER BY FIELD(
            day_of_week,
            'Monday',
            'Tuesday',
            'Wednesday',
            'Thursday',
            'Friday',
            'Saturday',
            'Sunday'
        )
        `,
        [req.params.id],
        (err,results)=>{

            if(err)
                return res.status(500).json({error:err.message});

            res.json(results);

        }
    );

};