const express = require('express');
const router = express.Router();

const Note = require('../models/Cartas');
const { isAuthenticated } = require('../helpers/auth');
