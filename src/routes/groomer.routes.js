const express = require("express");
const router = express.Router();

const groomerController = require("../controllers/groomer.controller");
const authMiddleware = require("../middleware/auth.middleware");
const { validateGroomer } = require("../middleware/groomer.validation");

router.use(authMiddleware);

router.post("/", validateGroomer, groomerController.createGroomer);
router.get("/", groomerController.getGroomers);
router.get("/:id", groomerController.getGroomerById);
router.put("/:id", validateGroomer, groomerController.updateGroomer);
router.delete("/:id", groomerController.deactivateGroomer);

module.exports = router;