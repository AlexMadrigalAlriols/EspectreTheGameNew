const express = require('express');
const router = express.Router();

const Note = require('../models/Note');
const { isAuthenticated } = require('../helpers/auth');

router.get('/notes/add', isAuthenticated, (req, res) => {
    res.render('notes/new-note.hbs');
});

router.post('/notes/new-note', isAuthenticated, async (req, res) => {
    const { title, description } = req.body;
    const errors = [];
    if(!title) {
        errors.push({text: 'Pleaese Write A Title'});
    }

    if (!description) {
        errors.push({text: 'Please Write a description'});
    }
    if(errors.length > 0) {
        res.render('notes/new-note.hbs', {
            errors,
            title,
            description
        });
    }else {
        const newNote = new Note({ title, description });
        newNote.user = req.user.id;
        await newNote.save();
        req.flash('success_msg', 'Note Added Successfull');
        res.redirect('/notes');
    }
});

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

  router.get(`/notes/edit/:id`, isAuthenticated, async (req, res) => {
      const note = await Note.findById(req.params.id);
      res.render('notes/edit-note.hbs', {note});
  });



  router.put('/notes/edit-note/:id', isAuthenticated, async (req, res) => {
    const { title, description } = req.body;
    await Note.findByIdAndUpdate(req.params.id, { title, description });
    req.flash('success_msg', 'Note Updated Successfully');
    res.redirect('/notes');
  });


  router.delete('/notes/delete/:id', isAuthenticated, async (req, res) => {
    await Note.findByIdAndDelete(req.params.id);
    req.flash('success_msg', 'Note Deleted Successfully');
    res.redirect('/notes');
  });

module.exports = router;