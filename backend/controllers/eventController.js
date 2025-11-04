const Event = require('../models/Event');
const User = require('../models/User');

// @desc    Get all events
// @route   GET /api/events
// @access  Public
const getEvents = async (req, res) => {
  try {
    const { organizerId, startDate, endDate } = req.query;
    
    let filter = {};
    
    if (organizerId) {
      filter.organizerId = organizerId;
    }
    
    if (startDate || endDate) {
      filter.startTs = {};
      if (startDate) filter.startTs.$gte = new Date(startDate);
      if (endDate) filter.startTs.$lte = new Date(endDate);
    }
    
    const events = await Event.find(filter).populate('organizerId', 'name email');
    
    res.json(events);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Get single event
// @route   GET /api/events/:id
// @access  Public
const getEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('organizerId', 'name email')
      .populate('coffees.createdBy', 'name email');
    
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    res.json(event);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Create new event
// @route   POST /api/events
// @access  Private
const createEvent = async (req, res) => {
  try {
    // Verify the user exists and is authorized
    const organizer = await User.findById(req.user.id);
    if (!organizer) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Assign the logged-in user as the organizer
    const eventData = {
      ...req.body,
      organizerId: req.user.id
    };

    // Ensure coffees have the createdBy field set to the organizer
    if (req.body.coffees && Array.isArray(req.body.coffees)) {
      eventData.coffees = req.body.coffees.map(coffee => ({
        ...coffee,
        createdBy: req.user.id
      }));
    }

    const event = new Event(eventData);
    const createdEvent = await event.save();
    
    res.status(201).json(createdEvent);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// @desc    Update event
// @route   PATCH /api/events/:id
// @access  Private (organizer only)
const updateEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    // Check if user is the organizer
    if (event.organizerId.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to update this event' });
    }
    
    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    res.json(updatedEvent);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// @desc    Delete event
// @route   DELETE /api/events/:id
// @access  Private (organizer only)
const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    // Check if user is the organizer
    if (event.organizerId.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to delete this event' });
    }
    
    await Event.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Event removed' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  getEvents,
  getEvent,
  createEvent,
  updateEvent,
  deleteEvent
};