import React, { useState } from 'react';
import { Coffee, Plus } from 'lucide-react';

const SetupView = ({ createNewSession }) => {
  const [coffees, setCoffees] = useState([{ name: '', roaster: '', country: '' }]);
  const [members, setMembers] = useState(['']);
  const [sessionName, setSessionName] = useState('');

  const addCoffee = () => setCoffees(prev => [...prev, { name: '', roaster: '', country: '' }]);
  const addMember = () => setMembers(prev => [...prev, '']);

  const updateCoffee = (index, field, value) => {
    setCoffees(prev => prev.map((coffee, i) =>
      i === index ? { ...coffee, [field]: value } : coffee
    ));
  };

  const updateMember = (index, value) => {
    setMembers(prev => prev.map((member, i) => i === index ? value : member));
  };

  const handleSubmit = () => {
    const validCoffees = coffees.filter(c => c.name.trim() && c.roaster.trim() && c.country.trim());
    const validMembers = members.filter(m => m.trim());
    if (validCoffees.length < 2 || validMembers.length < 1) {
      alert('Please add at least 2 complete coffees (with name, roaster, and country) and 1 member');
      return;
    }
    createNewSession({
      name: sessionName || `Session ${new Date().toLocaleDateString()}`,
      coffees: validCoffees,
      members: validMembers
    });
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="text-center mb-8">
        <Coffee className="w-12 h-12 mx-auto mb-4 text-amber-600" />
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Filter Club</h1>
        <p className="text-gray-600">Set up your coffee cupping session</p>
      </div>
      <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Session Name (Optional)
          </label>
          <input
            type="text"
            value={sessionName}
            onChange={(e) => setSessionName(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            placeholder="e.g., Ethiopian Tasting"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Coffees
          </label>
          {coffees.map((coffee, index) => (
            <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-3 p-3 border border-gray-200 rounded-lg">
              <input
                type="text"
                value={coffee.name}
                onChange={(e) => updateCoffee(index, 'name', e.target.value)}
                className="p-2 border border-gray-300 rounded focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                placeholder="Coffee Name"
              />
              <input
                type="text"
                value={coffee.roaster}
                onChange={(e) => updateCoffee(index, 'roaster', e.target.value)}
                className="p-2 border border-gray-300 rounded focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                placeholder="Roaster"
              />
              <input
                type="text"
                value={coffee.country}
                onChange={(e) => updateCoffee(index, 'country', e.target.value)}
                className="p-2 border border-gray-300 rounded focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                placeholder="Country"
              />
            </div>
          ))}
          <button
            onClick={addCoffee}
            className="flex items-center text-amber-600 hover:text-amber-700 font-medium"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Coffee
          </button>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Members
          </label>
          {members.map((member, index) => (
            <input
              key={index}
              type="text"
              value={member}
              onChange={(e) => updateMember(index, e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg mb-2 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              placeholder={`Member ${index + 1}`}
            />
          ))}
          <button
            onClick={addMember}
            className="flex items-center text-amber-600 hover:text-amber-700 font-medium"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Member
          </button>
        </div>
        <button
          onClick={handleSubmit}
          className="w-full bg-amber-600 text-white py-3 px-4 rounded-lg hover:bg-amber-700 transition-colors font-medium"
        >
          Start Cupping Session
        </button>
      </div>
    </div>
  );
};

export default SetupView; 