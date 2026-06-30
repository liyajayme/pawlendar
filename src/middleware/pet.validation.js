module.exports.validatePet = (req, res, next) => {
    const {
        pet_name,
        species,
        breed,
        gender
    } = req.body;

    if (
        !pet_name ||
        !species ||
        !breed ||
        !gender
    ) {
        return res.status(400).json({
            message: "Missing required pet information"
        });
    }

    if (!["M", "F"].includes(gender)) {
        return res.status(400).json({
            message: "Invalid gender"
        });
    }

    next();
};