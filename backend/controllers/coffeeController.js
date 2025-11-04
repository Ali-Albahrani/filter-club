const Event = require('../models/Event');

// @desc    Add coffee to event
// @route   POST /api/events/:eventId/coffees
// @access  Private (organizer only)
const addCoffee = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { label, name, roaster, originCountry, process } = req.body;

    // Validate required fields
    if (!label || !name || !roaster || !originCountry || !process) {
      return res.status(400).json({ 
        error: 'ValidationError', 
        details: 'label, name, roaster, originCountry, and process are required' 
      });
    }

    // Check if process is valid
    const validProcesses = ['washed', 'honey', 'natural', 'experimental'];
    if (!validProcesses.includes(process)) {
      return res.status(400).json({ 
        error: 'ValidationError', 
        details: 'process must be one of: washed, honey, natural, experimental' 
      });
    }

    // Find the event
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Check if user is the organizer
    if (event.organizerId.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to add coffee to this event' });
    }

    // Check if label already exists in this event (for uniqueness)
    const labelExists = event.coffees.some(coffee => coffee.label === label);
    if (labelExists) {
      return res.status(400).json({ 
        error: 'ValidationError', 
        details: `Coffee with label '${label}' already exists in this event` 
      });
    }

    // Add the new coffee
    const newCoffee = {
      label,
      name,
      roaster,
      originCountry,
      process,
      createdBy: req.user.id
    };

    event.coffees.push(newCoffee);
    await event.save();

    // Return the newly added coffee
    const addedCoffee = event.coffees.find(coffee => coffee.label === label);
    res.status(201).json(addedCoffee);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Get coffees for an event
// @route   GET /api/events/:eventId/coffees
// @access  Public
const getCoffees = async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    res.json(event.coffees);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Update coffee in event
// @route   PATCH /api/events/:eventId/coffees/:coffeeId
// @access  Private (organizer only)
const updateCoffee = async (req, res) => {
  try {
    const { eventId, coffeeId } = req.params;

    // Find the event
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Check if user is the organizer
    if (event.organizerId.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to update coffee in this event' });
    }

    // Find the coffee in the event
    const coffeeIndex = event.coffees.findIndex(coffee => coffee._id.toString() === coffeeId);
    if (coffeeIndex === -1) {
      return res.status(404).json({ error: 'Coffee not found in this event' });
    }

    // If updating the label, check for uniqueness within the event
    if (req.body.label) {
      // Check if another coffee in the event already has this label
      const labelExists = event.coffees.some((coffee, idx) => 
        idx !== coffeeIndex && coffee.label === req.body.label
      );
      
      if (labelExists) {
        return res.status(400).json({ 
          error: 'ValidationError', 
          details: `Coffee with label '${req.body.label}' already exists in this event` 
        });
      }
    }

    // Update the coffee with the new values
    const updatedFields = {};
    if (req.body.label) updatedFields['coffees.' + coffeeIndex + '.label'] = req.body.label;
    if (req.body.name) updatedFields['coffees.' + coffeeIndex + '.name'] = req.body.name;
    if (req.body.roaster) updatedFields['coffees.' + coffeeIndex + '.roaster'] = req.body.roaster;
    if (req.body.originCountry) updatedFields['coffees.' + coffeeIndex + '.originCountry'] = req.body.originCountry;
    if (req.body.process) {
      const validProcesses = ['washed', 'honey', 'natural', 'experimental'];
      if (!validProcesses.includes(req.body.process)) {
        return res.status(400).json({ 
          error: 'ValidationError', 
          details: 'process must be one of: washed, honey, natural, experimental' 
        });
      }
      updatedFields['coffees.' + coffeeIndex + '.process'] = req.body.process;
    }

    const updatedEvent = await Event.findByIdAndUpdate(
      eventId,
      { $set: updatedFields },
      { new: true }
    );

    res.json(updatedEvent.coffees[coffeeIndex]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Remove coffee from event
// @route   DELETE /api/events/:eventId/coffees/:coffeeId
// @access  Private (organizer only)
const removeCoffee = async (req, res) => {
  try {
    const { eventId, coffeeId } = req.params;

    // Find the event
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Check if user is the organizer
    if (event.organizerId.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to remove coffee from this event' });
    }

    // Check if coffee exists in the event
    const coffeeIndex = event.coffees.findIndex(coffee => coffee._id.toString() === coffeeId);
    if (coffeeIndex === -1) {
      return res.status(404).json({ error: 'Coffee not found in this event' });
    }

    // Remove the coffee
    event.coffees.splice(coffeeIndex, 1);
    await event.save();

    res.json({ message: 'Coffee removed from event' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  addCoffee,
  getCoffees,
  updateCoffee,
  removeCoffee
};