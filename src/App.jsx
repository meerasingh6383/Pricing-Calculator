import React, { useState } from 'react';

const PricingCalculator = () => {
  const [activeTab, setActiveTab] = useState('single');
  
  const [slScenario, setSlScenario] = useState('new');
  const [slGpv, setSlGpv] = useState('');
  const [slCurrentModel, setSlCurrentModel] = useState('');
  const [slOtherSubFee, setSlOtherSubFee] = useState('');
  
  const [mlScenario, setMlScenario] = useState('churn');
  const [mlNumLocs, setMlNumLocs] = useState('');
  const [mlAvgGpv, setMlAvgGpv] = useState('');
  const [mlCurrentSubFee, setMlCurrentSubFee] = useState('');
  const [mlCurrentGuestFee, setMlCurrentGuestFee] = useState('');
  const [mlCurrentCxFee, setMlCurrentCxFee] = useState('');

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  const calculateSLPricing = () => {
    const gpv = parseFloat(slGpv) || 0;
    const flat = 499;
    const flex = 249 + (gpv * 0.05);
    const superFlex = 99 + (gpv * 0.10);
    const otherFee = parseFloat(slOtherSubFee) || 0;
    const other = otherFee + (gpv * 0.05);
    return { flat, flex, superFlex, other, gpv };
  };

  const getMLTierPricing = (numLocs) => {
    const locs = parseInt(numLocs) || 0;
    if (locs >= 10) return { flatBase: 299, flexBase: 149, tier: '10+', requiresApproval: true };
    if (locs >= 6) return { flatBase: 349, flexBase: 174, tier: '6+', requiresApproval: false };
    if (locs >= 3) return { flatBase: 399, flexBase: 199, tier: '3-5', requiresApproval: false };
    if (locs === 2) return { flatBase: 449, flexBase: 224, tier: '2', requiresApproval: false };
    return { flatBase: 499, flexBase: 249, tier: '1', requiresApproval: false };
  };

  const calculateMLPricing = () => {
    const numLocs = parseInt(mlNumLocs) || 0;
    const avgGpv = parseFloat(mlAvgGpv) || 0;
    const tierPricing = getMLTierPricing(numLocs);
    
    const flatPerLoc = tierPricing.flatBase;
    const flexPerLoc = tierPricing.flexBase + (avgGpv * 0.05);
    const superFlexPerLoc = 99 + (avgGpv * 0.10);
    
    return { 
      flatPerLoc, flexPerLoc, superFlexPerLoc,
      flatTotal: flatPerLoc * numLocs,
      flexTotal: flexPerLoc * numLocs,
      superFlexTotal: superFlexPerLoc * numLocs,
      tier: tierPricing.tier,
      requiresApproval: tierPricing.requiresApproval,
      numLocs, avgGpv,
      tierPricing
    };
  };

  const calculateMLChurnPricing = () => {
    const numLocs = parseInt(mlNumLocs) || 0;
    const gpv = parseFloat(mlAvgGpv) || 0;
    const currentSubFee = parseFloat(mlCurrentSubFee) || 0;
    const currentCxFee = parseFloat(mlCurrentCxFee) || 0;
    const tierPricing = getMLTierPricing(numLocs);
    
    return { 
      flatPerLoc: tierPricing.flatBase,
      flexPerLoc: tierPricing.flexBase + (gpv * 0.05),
      superFlexPerLoc: 99 + (gpv * 0.10),
      currentPerLoc: currentSubFee + (gpv * (currentCxFee / 100)),
      tier: tierPricing.tier,
      requiresApproval: tierPricing.requiresApproval,
      numLocs, gpv, tierPricing
    };
  };

  const renderSingleLocationTab = () => {
    const pricing = calculateSLPricing();
    const gpv = pricing.gpv;
    
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Customer Scenario</h3>
          <div className="flex gap-3">
            {[
              { id: 'new', label: 'New CW' },
              { id: 'churn_retention', label: 'Churn / Retention' }
            ].map(option => (
              <button
                key={option.id}
                onClick={() => {
                  setSlScenario(option.id);
                  setSlCurrentModel('');
                  setSlOtherSubFee('');
                }}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  slScenario === option.id
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            {slScenario === 'new' ? 'Expected GPV (eGPV)' : 'L30D Net GPV (from dashboard)'}
          </h3>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
            <input
              type="number"
              value={slGpv}
              onChange={(e) => setSlGpv(e.target.value)}
              placeholder="Enter GPV"
              className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </div>

        {slScenario === 'churn_retention' && (
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Current Pricing Model</h3>
            <div className="grid grid-cols-2 gap-3">
              {['Flat', 'Flex', 'Super Flex', 'Other'].map(model => (
                <button
                  key={model}
                  onClick={() => {
                    setSlCurrentModel(model);
                    if (model !== 'Other') setSlOtherSubFee('');
                  }}
                  className={`px-4 py-3 rounded-lg font-medium transition-all ${
                    slCurrentModel === model
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {model}
                </button>
              ))}
            </div>
            
            {slCurrentModel === 'Other' && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Subscription Fee
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                  <input
                    type="number"
                    value={slOtherSubFee}
                    onChange={(e) => setSlOtherSubFee(e.target.value)}
                    placeholder="Enter current subscription fee"
                    className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {slGpv && (
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              {slScenario === 'new' ? 'Recommended Pricing' : 'Pricing Comparison'}
            </h3>
            
            {slScenario === 'new' ? (
              <div>
                {gpv >= 5000 ? (
                  <div className="bg-green-50 border-2 border-green-500 rounded-lg p-6">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="bg-green-500 text-white text-xs font-bold px-2 py-1 rounded">RECOMMENDED</span>
                      <span className="text-xl font-bold text-green-700">Flat Pricing</span>
                    </div>
                    <p className="text-3xl font-bold text-green-800">{formatCurrency(499)}/mo</p>
                    <p className="text-sm text-green-600 mt-2">+ 5% guest fee</p>
                    <p className="text-sm text-gray-600 mt-3">Best for customers with eGPV ≥ $5K</p>
                  </div>
                ) : (
                  <div className="bg-blue-50 border-2 border-blue-500 rounded-lg p-6">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded">RECOMMENDED</span>
                      <span className="text-xl font-bold text-blue-700">Flex Pricing</span>
                    </div>
                    <p className="text-3xl font-bold text-blue-800">{formatCurrency(pricing.flex)}/mo</p>
                    <p className="text-sm text-blue-600 mt-2">$249 base + 5% of GPV ({formatCurrency(gpv * 0.05)}) + 5% guest fee</p>
                    <p className="text-sm text-gray-600 mt-3">Best for customers with eGPV &lt; $5K</p>
                  </div>
                )}
                
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">
                    <strong>Note:</strong> New CW customers can only be offered Flat or Flex pricing.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {[
                  { name: 'Flat', price: pricing.flat, formula: '$499', available: true },
                  { name: 'Flex', price: pricing.flex, formula: `$249 + 5% × ${formatCurrency(gpv)}`, available: true },
                  { name: 'Super Flex', price: pricing.superFlex, formula: `$99 + 10% × ${formatCurrency(gpv)}`, available: true },
                  ...(slCurrentModel === 'Other' ? [{ 
                    name: 'Current (Other)', 
                    price: pricing.other, 
                    formula: `${formatCurrency(parseFloat(slOtherSubFee) || 0)} + 5% × ${formatCurrency(gpv)}`, 
                    available: false,
                    isCurrent: true
                  }] : [])
                ].sort((a, b) => a.price - b.price).map((option, index) => {
                  const isCheapest = index === 0 && option.available;
                  const isCurrent = slCurrentModel === option.name || option.isCurrent;
                  const currentPrice = slCurrentModel === 'Flat' ? pricing.flat 
                    : slCurrentModel === 'Flex' ? pricing.flex 
                    : slCurrentModel === 'Super Flex' ? pricing.superFlex 
                    : pricing.other;
                  const savings = currentPrice - option.price;
                  
                  return (
                    <div
                      key={option.name}
                      className={`p-4 rounded-lg border-2 ${
                        isCheapest && option.available
                          ? 'bg-green-50 border-green-500'
                          : isCurrent
                          ? 'bg-yellow-50 border-yellow-400'
                          : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-2">
                            {isCheapest && option.available && (
                              <span className="bg-green-500 text-white text-xs font-bold px-2 py-1 rounded">CHEAPEST</span>
                            )}
                            {isCurrent && (
                              <span className="bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded">CURRENT</span>
                            )}
                            {!option.available && !option.isCurrent && (
                              <span className="bg-gray-400 text-white text-xs font-bold px-2 py-1 rounded">NOT AVAILABLE</span>
                            )}
                            <span className="font-semibold text-gray-800">{option.name}</span>
                          </div>
                          <p className="text-sm text-gray-500 mt-1">{option.formula}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-gray-800">{formatCurrency(option.price)}/mo</p>
                          {slCurrentModel && !isCurrent && (
                            <p className={`text-sm font-medium ${savings > 0 ? 'text-green-600' : savings < 0 ? 'text-red-600' : 'text-gray-500'}`}>
                              {savings > 0 ? `Save ${formatCurrency(savings)}/mo` : savings < 0 ? `+${formatCurrency(Math.abs(savings))}/mo` : 'Same price'}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderMultiLocationTab = () => {
    const pricing = mlScenario === 'churn' ? calculateMLChurnPricing() : calculateMLPricing();
    const numLocs = parseInt(mlNumLocs) || 0;
    const avgGpv = parseFloat(mlAvgGpv) || 0;
    
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Location Details</h3>
          <p className="text-sm text-gray-600 mb-4">Locations within a multi-loc can be on different pricing structures. Enter the eGPV of a location to see the recommended pricing.</p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Total # of Locations for CX
              </label>
              <input
                type="number"
                value={mlNumLocs}
                onChange={(e) => setMlNumLocs(e.target.value)}
                placeholder="Enter number"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {mlScenario === 'churn' ? 'L30D Net GPV (for loc in question)' : 'eGPV (for loc in question)'}
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                <input
                  type="number"
                  value={mlAvgGpv}
                  onChange={(e) => setMlAvgGpv(e.target.value)}
                  placeholder="Enter GPV"
                  className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>
          </div>
          
          {numLocs > 0 && (
            <div className="mt-4 p-3 bg-indigo-50 rounded-lg">
              <p className="text-sm text-indigo-800">
                <strong>Pricing Tier:</strong> {pricing.tier} locations 
                {pricing.requiresApproval && <span className="text-red-600 ml-2">(Requires exec approval)</span>}
              </p>
            </div>
          )}
        </div>

        {mlScenario === 'churn' && (
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Current Pricing Model</h3>
            <p className="text-sm text-gray-600 mb-4">Enter the customer's current pricing to determine if another model would be better and calculate potential savings.</p>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subscription Fee (per loc)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                  <input
                    type="number"
                    value={mlCurrentSubFee}
                    onChange={(e) => setMlCurrentSubFee(e.target.value)}
                    placeholder="Sub fee"
                    className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Guest Fee %
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={mlCurrentGuestFee}
                    onChange={(e) => setMlCurrentGuestFee(e.target.value)}
                    placeholder="e.g., 5"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">%</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Customer Fee %
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={mlCurrentCxFee}
                    onChange={(e) => setMlCurrentCxFee(e.target.value)}
                    placeholder="e.g., 5"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">%</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {mlNumLocs && mlAvgGpv && numLocs >= 2 && (
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Pricing Comparison</h3>
            
            {mlScenario === 'new' ? (
              <div className="space-y-4">
                <div className="grid gap-4 grid-cols-2">
                  {[
                    { 
                      name: 'Flex', 
                      perLoc: pricing.flexPerLoc, 
                      total: pricing.flexTotal,
                      formula: `${formatCurrency(pricing.tierPricing.flexBase)}/loc + 5% GPV + 5% guest`,
                      recommended: avgGpv > 1500,
                      show: true
                    },
                    { 
                      name: 'Super Flex', 
                      perLoc: pricing.superFlexPerLoc, 
                      total: pricing.superFlexTotal,
                      formula: `$99/loc + 10% GPV + 5% guest`,
                      recommended: avgGpv <= 1500,
                      show: avgGpv <= 1500
                    }
                  ].filter(option => option.show).map(option => (
                    <div
                      key={option.name}
                      className={`p-5 rounded-lg border-2 ${
                        option.recommended
                          ? 'bg-green-50 border-green-500'
                          : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-3">
                        {option.recommended && (
                          <span className="bg-green-500 text-white text-xs font-bold px-2 py-1 rounded">RECOMMENDED</span>
                        )}
                        <span className="text-xl font-semibold text-gray-800">{option.name}</span>
                      </div>
                      <p className="text-3xl font-bold text-gray-800">{formatCurrency(option.perLoc)}/loc/mo</p>
                      <p className="text-xl text-gray-600 mt-2">Total: {formatCurrency(option.total)}/mo</p>
                      <p className="text-base text-gray-500 mt-3">{option.formula}</p>
                    </div>
                  ))}
                </div>
                
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">
                    <strong>Tier {pricing.tier}:</strong> Flex at {formatCurrency(pricing.tierPricing.flexBase)}/loc + 5% GPV{avgGpv <= 1500 && ' | Super Flex at $99/loc + 10% GPV'}
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {(() => {
                  const options = [
                    { 
                      name: 'Flex', 
                      perLoc: pricing.flexPerLoc, 
                      formula: `${formatCurrency(pricing.tierPricing.flexBase)}/loc + 5% GPV + 5% guest`,
                      available: true
                    },
                    { 
                      name: 'Super Flex', 
                      perLoc: pricing.superFlexPerLoc, 
                      formula: `$99/loc + 10% GPV + 5% guest`,
                      available: true
                    },
                    ...(mlCurrentSubFee ? [{
                      name: 'Current',
                      perLoc: pricing.currentPerLoc,
                      formula: `${formatCurrency(parseFloat(mlCurrentSubFee))}/loc + ${mlCurrentCxFee || 0}% CX fee`,
                      available: false,
                      isCurrent: true
                    }] : [])
                  ].sort((a, b) => a.perLoc - b.perLoc);
                  
                  return options.map((option, index) => {
                    const isCheapest = index === 0 && option.available;
                    const currentPerLoc = pricing.currentPerLoc;
                    const savings = currentPerLoc - option.perLoc;
                    
                    return (
                      <div
                        key={option.name}
                        className={`p-4 rounded-lg border-2 ${
                          isCheapest
                            ? 'bg-green-50 border-green-500'
                            : option.isCurrent
                            ? 'bg-yellow-50 border-yellow-400'
                            : 'bg-gray-50 border-gray-200'
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center gap-2">
                              {isCheapest && (
                                <span className="bg-green-500 text-white text-xs font-bold px-2 py-1 rounded">CHEAPEST</span>
                              )}
                              {option.isCurrent && (
                                <span className="bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded">CURRENT</span>
                              )}
                              <span className="font-semibold text-gray-800">{option.name}</span>
                            </div>
                            <p className="text-sm text-gray-500 mt-1">{option.formula}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-gray-800">{formatCurrency(option.perLoc)}/loc/mo</p>
                            {mlCurrentSubFee && !option.isCurrent && (
                              <p className={`text-sm font-medium ${savings > 0 ? 'text-green-600' : savings < 0 ? 'text-red-600' : 'text-gray-500'}`}>
                                {savings > 0 ? `Save ${formatCurrency(savings)}/loc/mo` : savings < 0 ? `+${formatCurrency(Math.abs(savings))}/loc/mo` : 'Same price'}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
            )}
          </div>
        )}
        
        {mlNumLocs && parseInt(mlNumLocs) < 2 && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <p className="text-amber-800">
              Multi-location pricing requires at least 2 locations. For single locations, please use the Single Location tab.
            </p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Pricing Calculator</h1>
          <p className="text-gray-600 mt-2">Find the right pricing model for your customer</p>
        </div>

        <div className="flex mb-6 bg-white rounded-lg p-1 shadow-sm">
          <button
            onClick={() => setActiveTab('single')}
            className={`flex-1 py-3 px-6 rounded-lg font-medium transition-all ${
              activeTab === 'single'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Single Location
          </button>
          <button
            onClick={() => setActiveTab('multi')}
            className={`flex-1 py-3 px-6 rounded-lg font-medium transition-all ${
              activeTab === 'multi'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Multi Location (Post-Live)
          </button>
        </div>

        {activeTab === 'single' ? renderSingleLocationTab() : renderMultiLocationTab()}

        <div className="mt-8 bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Reference</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Single Location Pricing</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• <strong>Flat:</strong> $499 + 5% guest</li>
                <li>• <strong>Flex:</strong> $249 + 5% CX + 5% guest</li>
                <li>• <strong>Super Flex:</strong> $99 + 10% CX + 5% guest</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-700 mb-2">New Multi-Location Tiers</h4>
              <p className="text-sm text-gray-600 italic mb-2">New CW ML Flat and Flex tiered pricing to be rolled out in Feb</p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• <strong>2 locs:</strong> $449 (Flat) / $224 + 5% CX (Flex)</li>
                <li>• <strong>3-5 locs:</strong> $399 (Flat) / $199 + 5% CX (Flex)</li>
                <li>• <strong>6+ locs:</strong> $349 (Flat) / $174 + 5% CX (Flex)</li>
                <li>• <strong>10+ locs:</strong> $299 (Flat) / $149 + 5% CX (Flex) - exec approval</li>
                <li>• <strong>Super Flex:</strong> $99/loc + 10% CX (any tier)</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingCalculator;
