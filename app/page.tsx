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
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
    const [showInstallButton, setShowInstallButton] = useState(false)
    const [userEngaged, setUserEngaged] = useState(false)

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

    // PWA functionality
    useEffect(() => {
        // Register service worker
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js')
                .then((registration) => {
                    console.log('SW registered: ', registration);
                })
                .catch((registrationError) => {
                    console.log('SW registration failed: ', registrationError);
                });
        }

        // Check if app is already installed
        const isAlreadyInstalled = window.matchMedia('(display-mode: standalone)').matches;
        if (isAlreadyInstalled) {

            setShowInstallButton(false);
            return;
        }

        // Handle install prompt
        const handleBeforeInstallPrompt = (e: any) => {

            e.preventDefault();
            setDeferredPrompt(e);
            setShowInstallButton(true);
        };

        // Check if app was installed
        window.addEventListener('appinstalled', () => {

            setShowInstallButton(false);
        });

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

        // Smart install button logic
        const checkInstallability = () => {
            const isSecure = location.protocol === 'https:' || location.hostname === 'localhost';
            const hasServiceWorker = 'serviceWorker' in navigator;
            const isNotStandalone = !window.matchMedia('(display-mode: standalone)').matches;

            console.log('Checking installability:', {
                isSecure,
                hasServiceWorker,
                isNotStandalone,
                userEngaged,
                hasDeferredPrompt: !!deferredPrompt
            });

            // Show install button if:
            // 1. We have a deferred prompt, OR
            // 2. We meet PWA criteria and user has engaged with the site
            if (deferredPrompt || (isSecure && hasServiceWorker && isNotStandalone)) {
                setShowInstallButton(true);
            } else {
                setShowInstallButton(false);
            }
        };

        // Check immediately
        checkInstallability();

        // Check again after user interaction (engagement)
        const handleUserInteraction = () => {
            setUserEngaged(true);
            checkInstallability();
            // Remove listener after first interaction
            document.removeEventListener('click', handleUserInteraction);
            document.removeEventListener('keydown', handleUserInteraction);
        };

        document.addEventListener('click', handleUserInteraction);
        document.addEventListener('keydown', handleUserInteraction);

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
            document.removeEventListener('click', handleUserInteraction);
            document.removeEventListener('keydown', handleUserInteraction);
        };
    }, [deferredPrompt])

    // Re-check installability when user engagement changes
    useEffect(() => {
        if (userEngaged) {
            const isSecure = location.protocol === 'https:' || location.hostname === 'localhost';
            const hasServiceWorker = 'serviceWorker' in navigator;
            const isNotStandalone = !window.matchMedia('(display-mode: standalone)').matches;

            if (isSecure && hasServiceWorker && isNotStandalone) {
                setShowInstallButton(true);
            }
        }
    }, [userEngaged])

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

    const handleInstallClick = async () => {
        console.log('Install button clicked');
        console.log('deferredPrompt:', deferredPrompt);

        if (deferredPrompt) {
            console.log('Showing install prompt...');
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            console.log(`User response to the install prompt: ${outcome}`);
            setDeferredPrompt(null);
            setShowInstallButton(false);
        } else {
            console.log('No deferred prompt available');
            // Show instructions for manual installation
            alert(`Install instructions:
            
📱 On Mobile:
• Android Chrome: Tap menu (⋮) → "Add to Home screen"
• iOS Safari: Tap share button → "Add to Home Screen"

💻 On Desktop:
• Look for install icon in address bar
• Or use browser menu → "Install app"

The automatic install prompt may not appear in development mode.`);
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
                    {showInstallButton && (
                        <button
                            onClick={handleInstallClick}
                            className="mt-4 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200 transform hover:scale-105 text-sm"
                        >
                            📱 Save as App
                        </button>
                    )}

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
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-lg"
                            placeholder="Enter your portfolio size"
                            inputMode="numeric"
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
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-lg"
                            placeholder="Enter risk percentage"
                            inputMode="numeric"
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
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-lg"
                            placeholder="Enter entry price"
                            inputMode="numeric"
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
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-lg"
                            placeholder="Enter stop loss price"
                            inputMode="numeric"
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
