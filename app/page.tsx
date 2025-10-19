'use client'

import { useState, useEffect } from 'react'

export default function Home() {
    const [portfolioSize, setPortfolioSize] = useState('')
    const [percentageToRisk, setPercentageToRisk] = useState('')
    const [entryPrice, setEntryPrice] = useState('')
    const [stopLossPrice, setStopLossPrice] = useState('')
    const [positionType, setPositionType] = useState<'long' | 'short'>('long')
    const [positionSize, setPositionSize] = useState<number | null>(null)
    const [saveToLocalStorage, setSaveToLocalStorage] = useState(false)

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
                            <label className="flex items-center">
                                <input
                                    type="radio"
                                    name="positionType"
                                    value="long"
                                    checked={positionType === 'long'}
                                    onChange={(e) => setPositionType(e.target.value as 'long' | 'short')}
                                    className="mr-2 text-blue-600 focus:ring-blue-500"
                                />
                                <span className="text-gray-700 dark:text-gray-300">Long</span>
                            </label>
                            <label className="flex items-center">
                                <input
                                    type="radio"
                                    name="positionType"
                                    value="short"
                                    checked={positionType === 'short'}
                                    onChange={(e) => setPositionType(e.target.value as 'long' | 'short')}
                                    className="mr-2 text-blue-600 focus:ring-blue-500"
                                />
                                <span className="text-gray-700 dark:text-gray-300">Short</span>
                            </label>
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
                        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6">
                            <h3 className="text-lg font-semibold text-green-800 dark:text-green-200 mb-2">
                                Position Size Result
                            </h3>
                            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                                ${positionSize.toFixed(2)}
                            </p>
                            <p className="text-sm text-green-700 dark:text-green-300 mt-2">
                                This is the recommended position size based on your risk parameters.
                            </p>
                        </div>
                    )}

                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                        <h4 className="text-sm font-semibold text-blue-800 dark:text-blue-200 mb-2">
                            Formula:
                        </h4>
                        <p className="text-xs text-blue-700 dark:text-blue-300">
                            {positionType === 'long'
                                ? '(Portfolio Size × Risk %) ÷ (1 - Stop Loss ÷ Entry Price) = Position Size'
                                : '(Portfolio Size × Risk %) ÷ (Stop Loss ÷ Entry Price - 1) = Position Size'
                            }
                        </p>
                        <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
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
