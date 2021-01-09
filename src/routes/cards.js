const express = require('express');
const router = express.Router();

const User = require('../models/User');
const { isAuthenticated } = require('../helpers/auth');
const passport = require('passport');
const { find } = require('../models/User');
const Group = require('../models/Group');
const Game = require('../models/Game');
const Card = require('../models/Cartas');
const Cartas = require('../models/Cartas');

