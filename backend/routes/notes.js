const express = require('express');
const router = express.Router();
var fetchuser = require('../middleware/fetchuser')
const Notes = require('../models/Notes');
const { body, validationResult } = require('express-validator');

//Route 1: get all the notes using GET "/api/notes/fetchallnotes"login required
router.get('/fetchallnotes', fetchuser, async (req, res) => {
    try {
        const notes = await Notes.find({ user: req.user.id });

        res.json(notes)
    } catch (error) {
        console.error(error.message);
        res.status(500).send("internal server error");
    }

})
//Route 2: add a new note using POST "/api/notes/addnote" login required
router.post('/addnote', fetchuser, [
    body('tittle', 'Enter a tittle for note').isLength({ min: 3 }),
    body('description', 'Description must be 5 characters').isLength({ min: 5 }),
], async (req, res) => {
    try {


        const { tittle, description, tag } = req.body;

        //if there are bad request and the arrors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const note = new Notes({
            tittle, description, tag, user: req.user.id

        })
        const saveNote = await note.save()

        res.json(saveNote)
    } catch (error) {
        console.error(error.message);
        res.status(500).send("internal server error");
    }
})
//Route 3:Update existing Note using PUT "/api/notes/updatenote/:id" login required
router.put('/updatenote/:id', fetchuser, async (req, res) => {
    const { tittle, description, tag } = req.body;
    try {
        //create a newNote object
        const newNote = {};
        if (tittle) { newNote.tittle = tittle };
        if (description) { newNote.description = description };
        if (tag) { newNote.tag = tag };

        //find the note to be updated and update it
        let note = await Notes.findById(req.params.id);
        if (!note) { return res.status(404).send("Not Found") }

        if (note.user.toString() !== req.user.id) {
            return res.status(401).send("Not Allowed");
        }
        note = await Notes.findByIdAndUpdate(req.params.id, { $set: newNote }, { new: true })
        res.json({ note });

    } catch (error) {
        console.error(error.message);
        res.status(500).send("internal server error");
    }
})

//Route 4: Delete existing Note using DELETE "/api/notes/deletenote/:id" login required
router.delete('/deletenote/:id', fetchuser, async (req, res) => {
    try {
        //find the note to be deleted and delete it
        let note = await Notes.findById(req.params.id);
        if (!note) { return res.status(404).send("Not Found") }
        //Allow deletion only if user owns this note 
        if (note.user.toString() !== req.user.id) {
            return res.status(401).send("Not Allowed");
        }
        note = await Notes.findByIdAndDelete(req.params.id)
        res.json({ "Done": "Note has been Deleted", note: note });

    } catch (error) {
        console.error(error.message);
        res.status(500).send("internal server error");
    }
})

module.exports = router