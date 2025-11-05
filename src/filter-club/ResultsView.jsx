import React from 'react';
import { Coffee, Star, Trophy, Download, RotateCcw } from 'lucide-react';

const ResultsView = ({ sessionResults, event, user, downloadSpreadsheet, downloadPDF, backToEventList }) => {
  if (!sessionResults || !event) {
    return (
      <div className="max-w-2xl mx-auto p-6 text-center">
        <Coffee className="w-16 h-16 mx-auto text-brand-red mb-4" />
        <h1 className="text-2xl font-bold text-brand-red mb-2">Results Not Available</h1>
        <p className="text-brand-blue">The results are not ready yet or the event hasn't been published.</p>
      </div>
    );
  }

  const isEventPublished = event.published;
  const isUserSessionOwner = sessionResults.userId === user._id;
  const isEventOrganizer = event.organizerId?._id === user._id;
  
  if (!isEventPublished && !isEventOrganizer) {
    return (
      <div className="max-w-2xl mx-auto p-6 text-center">
        <Coffee className="w-16 h-16 mx-auto text-brand-blue mb-4" />
        <h1 className="text-2xl font-bold text-brand-red mb-2">Results Pending</h1>
        <p className="text-brand-blue">The event organizer hasn't published the results yet.</p>
        <p className="mt-2 text-brand-blue">Please check back later!</p>
      </div>
    );
  }

  // Calculate detailed results from session data
  const detailedResults = sessionResults.detailedResults || new Map();
  
  // Convert Map to array for easier processing
  const resultsArray = Array.from(detailedResults.values());

  // Calculate summary statistics
  const totalPossiblePoints = sessionResults.totalPossiblePoints || 0;
  const earnedPoints = sessionResults.points || 0;
  const rankInEvent = sessionResults.rankInEvent;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center">
          <Trophy className="w-12 h-12 mr-4 text-brand-red" />
          <div className="text-left">
            <h1 className="text-2xl font-bold text-brand-red">{event.name} - Results</h1>
            <p className="text-brand-blue">Your cupping performance and results</p>
          </div>
        </div>
      </div>

      {/* Summary Card */}
      <div className="bg-gradient-to-r from-brand-red to-brand-red-secondary rounded-lg shadow-md p-6 mb-6 text-brand-white">
        <div className="flex flex-wrap justify-between items-center">
          <div>
            <h2 className="text-xl font-bold mb-2">Your Performance</h2>
            <div className="flex flex-wrap gap-6">
              <div>
                <div className="text-sm opacity-80">Total Points</div>
                <div className="text-3xl font-bold">{earnedPoints}/{totalPossiblePoints}</div>
              </div>
              <div>
                <div className="text-sm opacity-80">Rank in Event</div>
                <div className="text-3xl font-bold">#{rankInEvent}</div>
              </div>
            </div>
          </div>
          
          <div className="mt-4 md:mt-0">
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => downloadSpreadsheet(sessionResults.sessionId)}
                className="flex items-center px-4 py-2 bg-brand-white text-brand-red rounded-lg hover:bg-brand-red-secondary transition-colors font-medium"
              >
                <Download className="w-4 h-4 mr-2" />
                Download Spreadsheet
              </button>
              <button
                onClick={() => downloadPDF(sessionResults.sessionId)}
                className="flex items-center px-4 py-2 bg-brand-white text-brand-red rounded-lg hover:bg-brand-red-secondary transition-colors font-medium"
              >
                <Download className="w-4 h-4 mr-2" />
                Download PDF
              </button>
            </div>
            <button
              onClick={backToEventList}
              className="mt-3 w-full md:w-auto flex items-center justify-center px-4 py-2 bg-brand-blue text-brand-red rounded-lg hover:bg-brand-red-secondary transition-colors font-medium"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Back to Events
            </button>
          </div>
        </div>
      </div>

      {/* Results Grid */}
      <div className="bg-brand-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-bold text-brand-red mb-6">Coffee-by-Coffee Breakdown</h2>
        
        {resultsArray.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {resultsArray.map((result, index) => (
              <div key={result.coffeeId} className="border border-brand-blue rounded-lg p-5 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-brand-red">Coffee {result.label}</h3>
                    <p className="text-sm text-brand-blue">{result.name}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-brand-blue">
                      <div>Origin: {result.originCountry}</div>
                      <div>Process: {result.process}</div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  {/* Rating */}
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium text-brand-red">Your Rating</span>
                      <span className="text-sm font-bold text-brand-red">
                        {result.userRating}/10
                      </span>
                    </div>
                    <div className="w-full bg-brand-blue rounded-full h-2.5">
                      <div 
                        className="bg-brand-red h-2.5 rounded-full" 
                        style={{ width: `${(result.userRating / 10) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  {/* Origin Guess */}
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium text-brand-red">Origin Guess</span>
                      <span className={`text-sm font-bold ${result.isOriginCorrect ? 'text-green-600' : 'text-brand-red'}`}>
                        {result.isOriginCorrect ? '✓' : '✗'}
                      </span>
                    </div>
                    <div className="text-sm">
                      <div className="text-brand-blue">Your guess: <span className="font-medium">{result.userGuessOrigin || 'Not guessed'}</span></div>
                      <div className="text-brand-red">Actual: <span className="font-medium">{result.originCountry}</span></div>
                    </div>
                  </div>
                  
                  {/* Process Guess */}
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium text-brand-red">Process Guess</span>
                      <span className={`text-sm font-bold ${result.isProcessCorrect ? 'text-green-600' : 'text-brand-red'}`}>
                        {result.isProcessCorrect ? '✓' : '✗'}
                      </span>
                    </div>
                    <div className="text-sm">
                      <div className="text-brand-blue">Your guess: <span className="font-medium">{result.userGuessProcess || 'Not guessed'}</span></div>
                      <div className="text-brand-red">Actual: <span className="font-medium">{result.process}</span></div>
                    </div>
                  </div>
                  
                  {/* Points Earned */}
                  <div className="pt-2 border-t border-brand-blue">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-brand-red">Points Earned</span>
                      <span className="text-lg font-bold text-brand-red">{result.pointsEarned}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-brand-blue">
            <Coffee className="w-12 h-12 mx-auto mb-2" />
            <p>No detailed results available yet</p>
          </div>
        )}
      </div>

      {/* Event Summary */}
      <div className="bg-brand-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-brand-red mb-4">Event Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-brand-blue p-4 rounded-lg">
            <h3 className="font-semibold text-brand-red mb-2">Total Participants</h3>
            <p className="text-2xl font-bold text-brand-red">TBD</p>
          </div>
          <div className="bg-brand-blue p-4 rounded-lg">
            <h3 className="font-semibold text-brand-red mb-2">Your Rank</h3>
            <p className="text-2xl font-bold text-brand-red">#{rankInEvent}</p>
          </div>
          <div className="bg-brand-blue p-4 rounded-lg">
            <h3 className="font-semibold text-brand-red mb-2">Your Score</h3>
            <p className="text-2xl font-bold text-brand-red">{earnedPoints}/{totalPossiblePoints}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultsView;