const express = require('express');
const userService = require('../src/features/user/service.js');

const router = express.Router()
router.post('/users',userService.createUser);
router.post('/login', userService.loginUser);


module.exports=router;