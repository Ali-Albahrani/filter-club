const PDFDocument = require('pdfkit');
const Event = require('../models/Event');
const Session = require('../models/Session');
const fs = require('fs');

// Generate a PDF report for an event's results
const generateEventResultsPDF = async (eventId) => {
  try {
    // Get event with coffee stats
    const event = await Event.findById(eventId).populate('organizerId', 'name email');
    if (!event) {
      throw new Error('Event not found');
    }

    if (!event.published) {
      throw new Error('Event results have not been published yet');
    }

    // Get all sessions for the event with user details
    const sessions = await Session.find({ eventId: eventId })
      .populate('userId', 'name email');

    // Create a PDF document
    const doc = new PDFDocument();
    const buffers = [];

    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => {});

    // Add title
    doc.fontSize(20).text(`Disco Spoons - ${event.name}`, 100, 50);
    doc.fontSize(12).text(`Event Date: ${event.startTs.toLocaleDateString()} at ${event.location}`, 100, 80);
    doc.moveDown();

    // Add coffee results table
    doc.fontSize(16).text('Coffee Results', 100, doc.y);
    doc.moveDown();

    // Table headers
    let yPosition = doc.y;
    doc.fontSize(10);
    doc.text('Label', 100, yPosition);
    doc.text('Avg Score', 180, yPosition);
    doc.text('Origin', 260, yPosition);
    doc.text('Process', 340, yPosition);
    doc.text('Roaster', 420, yPosition);
    yPosition += 20;
    
    // Add underline for headers
    doc.moveTo(100, yPosition - 5)
       .lineTo(520, yPosition - 5)
       .stroke();
    
    // Add coffee details
    for (const coffee of event.coffees) {
      const coffeeStat = event.coffeeStats && event.coffeeStats[coffee._id.toString()] || { average: 0 };
      
      doc.text(coffee.label, 100, yPosition);
      doc.text(coffeeStat.average ? coffeeStat.average.toFixed(2) : 'N/A', 180, yPosition);
      doc.text(coffee.originCountry, 260, yPosition);
      doc.text(coffee.process, 340, yPosition);
      doc.text(coffee.roaster, 420, yPosition);
      
      yPosition += 20;
      
      // Add line for each row
      doc.moveTo(100, yPosition - 5)
         .lineTo(520, yPosition - 5)
         .stroke();
         
      // Add a page break if needed
      if (yPosition > 700) {
        doc.addPage();
        yPosition = 50;
      }
    }
    
    yPosition += 30;
    doc.y = yPosition;

    // Add participant results
    doc.fontSize(16).text('Participant Results', 100, doc.y);
    doc.moveDown();

    // Sort sessions by points to show rankings
    const sortedSessions = [...sessions].sort((a, b) => (b.points || 0) - (a.points || 0));
    
    yPosition = doc.y;
    doc.fontSize(10);
    doc.text('Rank', 100, yPosition);
    doc.text('Name', 150, yPosition);
    doc.text('Points', 300, yPosition);
    yPosition += 20;
    
    // Add underline for headers
    doc.moveTo(100, yPosition - 5)
       .lineTo(400, yPosition - 5)
       .stroke();
    
    // Add participant details
    for (let i = 0; i < sortedSessions.length; i++) {
      const session = sortedSessions[i];
      const rank = i + 1;
      
      doc.text(rank.toString(), 100, yPosition);
      doc.text(session.userId ? session.userId.name : 'Anonymous', 150, yPosition);
      doc.text((session.points || 0).toString(), 300, yPosition);
      
      yPosition += 20;
      
      // Add line for each row  
      doc.moveTo(100, yPosition - 5)
         .lineTo(400, yPosition - 5)
         .stroke();
         
      // Add a page break if needed
      if (yPosition > 700) {
        doc.addPage();
        yPosition = 50;
      }
    }

    // Finalize the PDF
    doc.end();

    // Convert buffers to single buffer
    const buffer = Buffer.concat(buffers);
    
    return {
      filename: `disco-spoons-results-${event.name}-${event._id}.pdf`,
      buffer
    };
  } catch (error) {
    throw error;
  }
};

// Generate a PDF report for an individual's results
const generateIndividualResultsPDF = async (sessionId) => {
  try {
    // Get session with detailed results
    const session = await Session.findById(sessionId)
      .populate('userId', 'name email')
      .populate('eventId', 'name published');
    
    if (!session) {
      throw new Error('Session not found');
    }

    if (!session.eventId.published) {
      throw new Error('Event results have not been published yet');
    }

    // Create a PDF document
    const doc = new PDFDocument();
    const buffers = [];

    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => {});

    // Add title
    const userName = session.userId ? session.userId.name : 'Anonymous';
    doc.fontSize(20).text(`Disco Spoons - Your Results`, 100, 50);
    doc.fontSize(12).text(`Event: ${session.eventId.name}`, 100, 80);
    doc.fontSize(12).text(`Participant: ${userName}`, 100, 100);
    doc.moveDown(2);

    // Add personal stats
    doc.fontSize(14).text('Your Performance', 100, doc.y);
    doc.moveDown();
    
    doc.fontSize(12);
    doc.text(`Total Points: ${session.points || 0}`, 120, doc.y);
    doc.moveDown();
    doc.text(`Rank in Event: ${session.results?.rankInEvent || 'N/A'}`, 120, doc.y);
    doc.moveDown(2);

    // Add coffee-by-coffee breakdown
    doc.fontSize(14).text('Coffee Breakdown', 100, doc.y);
    doc.moveDown();

    // Detailed results table
    let yPosition = doc.y;
    doc.fontSize(10);
    doc.text('Label', 100, yPosition);
    doc.text('Your Rating', 180, yPosition);
    doc.text('Your Guess (Origin)', 260, yPosition);
    doc.text('Actual Origin', 360, yPosition);
    doc.text('Correct?', 460, yPosition);
    yPosition += 20;
    
    // Add underline for headers
    doc.moveTo(100, yPosition - 5)
       .lineTo(500, yPosition - 5)
       .stroke();
    
    // Add detailed results
    if (session.results && session.results.detailedResults) {
      for (const [coffeeId, result] of session.results.detailedResults) {
        doc.text(result.label, 100, yPosition);
        doc.text(result.userRating ? result.userRating.toString() : 'N/A', 180, yPosition);
        doc.text(result.userGuessOrigin || 'N/A', 260, yPosition);
        doc.text(result.originCountry || 'N/A', 360, yPosition);
        doc.text(result.isOriginCorrect ? 'Yes' : 'No', 460, yPosition);
        
        yPosition += 20;
        
        // Add line for each row
        doc.moveTo(100, yPosition - 5)
           .lineTo(500, yPosition - 5)
           .stroke();
           
        // Add process row too
        doc.text('', 100, yPosition); // Empty label column
        doc.text('', 180, yPosition); // Empty rating column
        doc.text(result.userGuessProcess || 'N/A', 260, yPosition);
        doc.text(result.process || 'N/A', 360, yPosition);
        doc.text(result.isProcessCorrect ? 'Yes' : 'No', 460, yPosition);
        
        yPosition += 25; // Extra space between coffee entries
        
        // Add a page break if needed
        if (yPosition > 700) {
          doc.addPage();
          yPosition = 50;
        }
      }
    }

    // Finalize the PDF
    doc.end();

    // Convert buffers to single buffer
    const buffer = Buffer.concat(buffers);
    
    return {
      filename: `disco-spoons-individual-results-${userName}-${sessionId}.pdf`,
      buffer
    };
  } catch (error) {
    throw error;
  }
};

module.exports = {
  generateEventResultsPDF,
  generateIndividualResultsPDF
};