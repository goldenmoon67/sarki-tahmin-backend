const express = require('express');
const userService = require('../src/features/user/service.js');

const router = express.Router()
router.post('/users',userService.createUser);


module.exports=router;