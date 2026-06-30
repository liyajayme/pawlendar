const express = require("express");
const router = express.Router();

const petController = require("../controllers/pet.controller");
const authMiddleware = require("../middleware/auth.middleware");
const { validatePet } = require("../middleware/pet.validation");

router.use(authMiddleware);

router.post("/", validatePet, petController.createPet);
router.get("/", petController.getPets);
router.get("/:id", petController.getPetById);
router.put("/:id", validatePet, petController.updatePet);
router.delete("/:id", petController.deletePet);

module.exports = router;