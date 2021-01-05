const express = require('express');
const router = express.Router();

const Note = require('../models/Cartas');
const { isAuthenticated } = require('../helpers/auth');

router.get('/notes', isAuthenticated, async (req, res) => {
    await Note.find({user: req.user.id}).sort({date: 'desc'})
      .then(documentos => {
        const contexto = {
            notes: documentos.map(documento => {
            return {
                title: documento.title,
                _id: documento._id,
                description: documento.description
            }
          })
        }
        res.render('notes/all-notes.hbs', {
       notes: contexto.notes })
      });
  });