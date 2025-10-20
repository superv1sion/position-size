'use client'

import { useState, useEffect } from 'react'

export default function Home() {
    const [portfolioSize, setPortfolioSize] = useState('')
    const [percentageToRisk, setPercentageToRisk] = useState('')
    const [entryPrice, setEntryPrice] = useState('')
    const [stopLossPrice, setStopLossPrice] = useState('')
    const [positionType, setPositionType] = useState<'long' | 'short'>('long')
    const [positionSize, setPositionSize] = useState<number | null>(null)
    const [maxLeverage, setMaxLeverage] = useState<number | null>(null)
    const [saveToLocalStorage, setSaveToLocalStorage] = useState(false)
    const [marginRequirement, setMarginRequirement] = useState(0)
    const [copyMessage, setCopyMessage] = useState('')

    // Load saved portfolio size and checkbox state from local storage on component mount
    useEffect(() => {
        const savedPortfolioSize = localStorage.getItem('portfolioSize')
        const savedCheckboxState = localStorage.getItem('saveToLocalStorage')

        if (savedPortfolioSize) {
            setPortfolioSize(savedPortfolioSize)
        }

        if (savedCheckboxState === 'true') {
            setSaveToLocalStorage(true)
        }
    }, [])

    // Save portfolio size to local storage when checkbox is checked and value changes
    useEffect(() => {
        if (saveToLocalStorage && portfolioSize) {
            localStorage.setItem('portfolioSize', portfolioSize)
        }
    }, [portfolioSize, saveToLocalStorage])

    // Save checkbox state to local storage whenever it changes
    useEffect(() => {
        localStorage.setItem('saveToLocalStorage', saveToLocalStorage.toString())
    }, [saveToLocalStorage])

    const calculatePositionSize = () => {
        const portfolio = parseFloat(portfolioSize)
        const riskPercentage = parseFloat(percentageToRisk)
        const entry = parseFloat(entryPrice)
        const stopLoss = parseFloat(stopLossPrice)

        if (portfolio && riskPercentage && entry && stopLoss) {
            const riskAmount = (portfolio * riskPercentage) / 100
            let riskPerUnit: number
            let validationMessage: string

            if (positionType === 'long') {
                riskPerUnit = 1 - (stopLoss / entry)
                validationMessage = 'Stop loss price must be lower than entry price for long positions'
            } else {
                riskPerUnit = (stopLoss / entry) - 1
                validationMessage = 'Stop loss price must be higher than entry price for short positions'
            }

            if (riskPerUnit > 0) {
                const calculatedPositionSize = riskAmount / riskPerUnit
                setPositionSize(calculatedPositionSize)

                // Calculate maximum leverage for isolated position
                // Leverage = Position Size / Risk Amount (margin required)
                const calculatedMaxLeverage = Math.floor(calculatedPositionSize / riskAmount)
                setMaxLeverage(calculatedMaxLeverage)
                setMarginRequirement(calculatedPositionSize / calculatedMaxLeverage)

            } else {
                alert(validationMessage)
            }
        } else {
            alert('Please fill in all fields')
        }
    }

    const resetForm = () => {
        if (!saveToLocalStorage) {
            setPortfolioSize('')
        }
        setPercentageToRisk('')
        setEntryPrice('')
        setStopLossPrice('')
        setPositionSize(null)
        setMaxLeverage(null)
    }

    const copyToClipboard = async (text: string) => {
        try {
            await navigator.clipboard.writeText(text)
            setCopyMessage('Copied!')

            // Show visual indicator
            const indicator = document.getElementById('copy-indicator')
            if (indicator) {
                indicator.style.opacity = '1'
                setTimeout(() => {
                    indicator.style.opacity = '0'
                }, 1500)
            }

            setTimeout(() => setCopyMessage(''), 2000)
        } catch (err) {
            console.error('Failed to copy: ', err)
            setCopyMessage('Copy failed')
            setTimeout(() => setCopyMessage(''), 2000)
        }
    }

    return (
        <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 w-full max-w-md">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                        Position Size Calculator
                    </h1>
                    <p className="text-gray-600 dark:text-gray-300">
                        Calculate position size for futures trading
                    </p>
                </div>

                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Position Type
                        </label>
                        <div className="flex space-x-4">
                            <button
                                type="button"
                                onClick={() => setPositionType('long')}
                                className={`flex-1 py-3 px-6 rounded-lg font-semibold transition duration-200 transform hover:scale-105 ${positionType === 'long'
                                    ? 'bg-green-600 hover:bg-green-700 text-white shadow-lg'
                                    : 'bg-green-100 hover:bg-green-200 text-green-700 dark:bg-green-900/30 dark:hover:bg-green-800/50 dark:text-green-300'
                                    }`}
                            >
                                Long
                            </button>
                            <button
                                type="button"
                                onClick={() => setPositionType('short')}
                                className={`flex-1 py-3 px-6 rounded-lg font-semibold transition duration-200 transform hover:scale-105 ${positionType === 'short'
                                    ? 'bg-red-600 hover:bg-red-700 text-white shadow-lg'
                                    : 'bg-red-100 hover:bg-red-200 text-red-700 dark:bg-red-900/30 dark:hover:bg-red-800/50 dark:text-red-300'
                                    }`}
                            >
                                Short
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Portfolio Size ($)
                        </label>
                        <input
                            type="number"
                            value={portfolioSize}
                            onChange={(e) => setPortfolioSize(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                            placeholder="Enter your portfolio size"
                        />
                        <div className="mt-2">
                            <label className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                                <input
                                    type="checkbox"
                                    checked={saveToLocalStorage}
                                    onChange={(e) => setSaveToLocalStorage(e.target.checked)}
                                    className="mr-2 text-blue-600 focus:ring-blue-500 rounded"
                                />
                                Save portfolio size for next usage
                            </label>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Risk Percentage (%)
                        </label>
                        <input
                            type="number"
                            value={percentageToRisk}
                            onChange={(e) => setPercentageToRisk(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                            placeholder="Enter risk percentage"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Entry Price ($)
                        </label>
                        <input
                            type="number"
                            value={entryPrice}
                            onChange={(e) => setEntryPrice(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                            placeholder="Enter entry price"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Stop Loss Price ($)
                        </label>
                        <input
                            type="number"
                            value={stopLossPrice}
                            onChange={(e) => setStopLossPrice(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                            placeholder="Enter stop loss price"
                        />
                        {portfolioSize && percentageToRisk && (
                            <p className="text-sm text-red-600 dark:text-red-400 mt-2 font-medium">
                                If price hits stop loss based on the above parameters, this would result in a ${((parseFloat(portfolioSize) * parseFloat(percentageToRisk)) / 100).toFixed(2)} loss.
                            </p>
                        )}
                    </div>

                    <div className="flex space-x-4">
                        <button
                            onClick={calculatePositionSize}
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 transform hover:scale-105"
                        >
                            Calculate
                        </button>
                        <button
                            onClick={resetForm}
                            className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 transform hover:scale-105"
                        >
                            Reset
                        </button>
                    </div>

                    {positionSize !== null && (
                        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
                            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                Position Size: <br />
                                <span
                                    className="text-3xl font-extrabold text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-800/30 px-3 py-1 rounded-lg cursor-pointer hover:bg-blue-200 dark:hover:bg-blue-700/50 transition-all duration-200 select-none relative"
                                    onClick={() => copyToClipboard(positionSize.toFixed(2))}
                                    title="Click to copy number"
                                >
                                    ${positionSize.toFixed(2)}
                                    <span className="absolute -top-1 -right-1 text-xs bg-green-500 text-white px-1.5 py-0.5 rounded-full opacity-0 transition-opacity duration-200" id="copy-indicator">
                                        ✓
                                    </span>
                                </span>
                            </p>
                            <br></br>
                            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                Margin Requirement: <br />
                                <span className="text-3xl font-extrabold text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-800/30 px-3 py-1 rounded-lg">
                                    ${marginRequirement.toFixed(2)}
                                </span>
                            </p>
                            <br></br>
                            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                Maximum Leverage: <br />
                                <span className="text-3xl font-extrabold text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-800/30 px-3 py-1 rounded-lg">
                                    {maxLeverage}x
                                </span>
                            </p>

                            <p className="text-sm text-blue-700 dark:text-blue-300 mt-2">
                                This is the recommended position size based on your risk parameters.
                            </p>
                            {copyMessage && (
                                <div className="mt-2 text-sm font-medium text-green-600 dark:text-green-400">
                                    {copyMessage}
                                </div>
                            )}
                        </div>
                    )}

                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                        <h4 className="text-sm font-semibold text-blue-800 dark:text-blue-200 mb-2">
                            Formulas:
                        </h4>
                        <p className="text-xs text-blue-700 dark:text-blue-300">
                            <strong>Position Size:</strong> {positionType === 'long'
                                ? '(Portfolio Size × Risk %) ÷ (1 - Stop Loss ÷ Entry Price)'
                                : '(Portfolio Size × Risk %) ÷ (Stop Loss ÷ Entry Price - 1)'
                            }
                        </p>
                        <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                            <strong>Max Leverage:</strong> Position Size ÷ Risk Amount
                        </p>
                        <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
                            {positionType === 'long'
                                ? 'For long positions: Stop Loss < Entry Price'
                                : 'For short positions: Stop Loss > Entry Price'
                            }
                        </p>
                    </div>
                </div>
            </div>
        </main>
    )
}
