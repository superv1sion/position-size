'use client'

import { useState, useEffect } from 'react'
import { Analytics } from "@vercel/analytics/next"
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
    const [isMobile, setIsMobile] = useState(false)
    const [isPortfolioEditing, setIsPortfolioEditing] = useState(false)
    const [isRiskPercentageEditing, setIsRiskPercentageEditing] = useState(false)
    const [isEntryPriceEditing, setIsEntryPriceEditing] = useState(false)
    const [isStopLossEditing, setIsStopLossEditing] = useState(false)
    const [isFixedRiskEditing, setIsFixedRiskEditing] = useState(false)
    const [riskInputType, setRiskInputType] = useState<'percentage' | 'fixed'>('percentage')
    const [fixedRiskAmount, setFixedRiskAmount] = useState('')
    const [takeProfitPrice, setTakeProfitPrice] = useState('')
    const [isTakeProfitEditing, setIsTakeProfitEditing] = useState(false)
    const [riskRewardRatio, setRiskRewardRatio] = useState<number | null>(null)
    const [potentialProfit, setPotentialProfit] = useState<number | null>(null)
    const [updateAvailable, setUpdateAvailable] = useState(false)
    const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null)
    const [isPWA, setIsPWA] = useState(false)

    // Format number with spaces every 3 digits
    const formatNumberWithSpaces = (value: string) => {
        if (!value) return ''
        const numericValue = value.replace(/\D/g, '') // Remove non-digits
        return numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
    }

    // Format price input with commas and proper decimal handling
    const formatPriceInput = (value: string) => {
        if (!value) return ''

        // Remove all non-numeric characters except decimal point
        let cleanValue = value.replace(/[^\d.]/g, '')

        // Ensure only one decimal point
        const decimalParts = cleanValue.split('.')
        if (decimalParts.length > 2) {
            cleanValue = decimalParts[0] + '.' + decimalParts.slice(1).join('')
        }

        // Split into integer and decimal parts
        const [integerPart, decimalPart] = cleanValue.split('.')

        // Add commas to integer part
        const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',')

        // Handle decimal part (limit to 2 digits)
        let formattedDecimal = ''
        if (decimalPart !== undefined) {
            formattedDecimal = '.' + decimalPart.substring(0, 2)
        }

        return formattedInteger + formattedDecimal
    }

    // Parse formatted price string to number
    const parseFormattedPrice = (value: string): number => {
        if (!value) return 0
        const cleanValue = value.replace(/,/g, '')
        return parseFloat(cleanValue) || 0
    }

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

        // Detect mobile device
        const checkMobile = () => {
            const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera
            const isMobileDevice = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent)
            const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0
            setIsMobile(isMobileDevice || isTouchDevice)
        }

        checkMobile()
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
                    setRegistration(registration);

                    // Check for updates
                    registration.addEventListener('updatefound', () => {
                        const newWorker = registration.installing;
                        if (newWorker) {
                            newWorker.addEventListener('statechange', () => {
                                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                                    // New content is available, show update notification
                                    setUpdateAvailable(true);
                                }
                            });
                        }
                    });
                })
                .catch((registrationError) => {
                    console.log('SW registration failed: ', registrationError);
                });
        }

        // Check if app is already installed
        const isAlreadyInstalled = window.matchMedia('(display-mode: standalone)').matches;
        setIsPWA(isAlreadyInstalled);
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
        const portfolio = parseFormattedPrice(portfolioSize)
        const entry = parseFormattedPrice(entryPrice)
        const stopLoss = parseFormattedPrice(stopLossPrice)
        const takeProfit = parseFormattedPrice(takeProfitPrice)

        // Calculate risk amount based on input type
        let riskAmount: number
        if (riskInputType === 'percentage') {
            const riskPercentage = parseFloat(percentageToRisk)
            if (!portfolio || !riskPercentage) {
                alert('Please fill in portfolio size and risk percentage')
                return
            }
            riskAmount = (portfolio * riskPercentage) / 100
        } else {
            const fixedAmount = parseFloat(fixedRiskAmount)
            if (!fixedAmount) {
                alert('Please enter a fixed risk amount')
                return
            }
            riskAmount = fixedAmount
        }

        if (portfolio && riskAmount && entry && stopLoss) {
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

                // Calculate risk/reward ratio and potential profit if take profit is provided
                if (takeProfit > 0) {
                    let rewardPerUnit: number
                    let takeProfitValidationMessage: string

                    if (positionType === 'long') {
                        rewardPerUnit = (takeProfit / entry) - 1
                        takeProfitValidationMessage = 'Take profit price must be higher than entry price for long positions'
                    } else {
                        rewardPerUnit = 1 - (takeProfit / entry)
                        takeProfitValidationMessage = 'Take profit price must be lower than entry price for short positions'
                    }

                    if (rewardPerUnit > 0) {
                        const calculatedRiskRewardRatio = rewardPerUnit / riskPerUnit
                        const calculatedPotentialProfit = calculatedPositionSize * rewardPerUnit
                        setRiskRewardRatio(calculatedRiskRewardRatio)
                        setPotentialProfit(calculatedPotentialProfit)
                    } else {
                        alert(takeProfitValidationMessage)
                        setRiskRewardRatio(null)
                        setPotentialProfit(null)
                    }
                } else {
                    setRiskRewardRatio(null)
                    setPotentialProfit(null)
                }

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
        setFixedRiskAmount('')
        setEntryPrice('')
        setStopLossPrice('')
        setTakeProfitPrice('')
        setPositionSize(null)
        setMaxLeverage(null)
        setRiskRewardRatio(null)
        setPotentialProfit(null)
        setIsFixedRiskEditing(false)
        setIsRiskPercentageEditing(false)
        setIsTakeProfitEditing(false)
    }

    const copyToClipboard = async (text: string) => {
        try {
            // Try modern clipboard API first (works best on desktop and modern mobile browsers)
            if (navigator.clipboard && window.isSecureContext) {
                await navigator.clipboard.writeText(text)
                showCopySuccess()
                return
            }

            // Fallback for mobile and older browsers
            const textArea = document.createElement('textarea')
            textArea.value = text
            textArea.style.position = 'fixed'
            textArea.style.left = '-999999px'
            textArea.style.top = '-999999px'
            textArea.style.opacity = '0'
            textArea.setAttribute('readonly', '')
            document.body.appendChild(textArea)

            // For mobile devices, we need to handle selection differently
            if (isMobile) {
                textArea.style.position = 'absolute'
                textArea.style.left = '50%'
                textArea.style.top = '50%'
                textArea.style.transform = 'translate(-50%, -50%)'
                textArea.style.zIndex = '9999'
                textArea.style.fontSize = '16px' // Prevents zoom on iOS
            }

            textArea.focus()
            textArea.select()
            textArea.setSelectionRange(0, 99999) // For mobile devices

            try {
                const successful = document.execCommand('copy')
                if (successful) {
                    showCopySuccess()
                } else {
                    throw new Error('execCommand failed')
                }
            } catch (err) {
                throw new Error('execCommand failed')
            } finally {
                document.body.removeChild(textArea)
            }
        } catch (err) {
            console.error('Failed to copy: ', err)
            if (isMobile) {
                setCopyMessage('Tap and hold the number to copy it manually')
            } else {
                setCopyMessage('Copy failed - try selecting the number manually')
            }
            setTimeout(() => setCopyMessage(''), 3000)
        }
    }

    const showCopySuccess = () => {
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

    const handleUpdateClick = () => {
        if (registration && registration.waiting) {
            // Tell the waiting service worker to skip waiting and become active
            registration.waiting.postMessage({ type: 'SKIP_WAITING' });
            setUpdateAvailable(false);
            // Reload the page to get the new version
            (window as any).location.reload();
        }
    }

    const handleForceRefresh = () => {
        // Clear all caches and reload
        if ('caches' in window) {
            caches.keys().then((cacheNames) => {
                cacheNames.forEach((cacheName) => {
                    caches.delete(cacheName);
                });
            }).then(() => {
                (window as any).location.reload();
            });
        } else {
            (window as any).location.reload();
        }
    }

    return (
        <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4 relative">
            {/* Refresh button in top-right corner - only visible in PWA mode */}
            {isPWA && (
                <button
                    onClick={() => window.location.reload()}
                    className="absolute top-4 right-4 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 z-10"
                    title="Refresh page"
                >
                    <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                        />
                    </svg>
                </button>
            )}

            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 w-full max-w-md">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                        Position Size Calculator
                    </h1>
                    <p className="text-gray-600 dark:text-gray-300">
                        Calculate position size for futures trading
                    </p>
                    {showInstallButton && isMobile && (
                        <button
                            onClick={handleInstallClick}
                            className="mt-4 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200 transform hover:scale-105 text-sm"
                        >
                            📱 Save as App
                        </button>
                    )}

                    {updateAvailable && (
                        <div className="mt-4 p-3 bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-300 dark:border-yellow-700 rounded-lg">
                            <p className="text-yellow-800 dark:text-yellow-200 text-sm font-medium mb-2">
                                🔄 Update Available
                            </p>
                            <div className="flex space-x-2">
                                <button
                                    onClick={handleUpdateClick}
                                    className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white font-semibold py-1.5 px-3 rounded text-xs transition duration-200"
                                >
                                    Update Now
                                </button>
                                <button
                                    onClick={handleForceRefresh}
                                    className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-1.5 px-3 rounded text-xs transition duration-200"
                                >
                                    Force Refresh
                                </button>
                            </div>
                        </div>
                    )}

                </div>

                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Position Side
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
                        <label className="block text-lg font-bold  text-gray-700 dark:text-gray-300 mb-2">
                            Portfolio Size ($)
                        </label>
                        {isPortfolioEditing ? (
                            <input
                                type="text"
                                value={portfolioSize}
                                onChange={(e) => setPortfolioSize(formatPriceInput(e.target.value))}
                                onBlur={() => setIsPortfolioEditing(false)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        setIsPortfolioEditing(false)
                                    }
                                }}
                                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-lg"
                                placeholder="Enter your portfolio size"
                                inputMode="decimal"
                                autoFocus
                            />
                        ) : (
                            <div
                                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200 flex items-center justify-between"
                                onClick={() => setIsPortfolioEditing(true)}
                            >
                                <span className="text-gray-900 dark:text-white">
                                    {portfolioSize ? `$${portfolioSize}` : 'Enter portfolio size'}
                                </span>
                                <svg
                                    className="w-5 h-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                            </div>
                        )}
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
                        <div className="flex space-x-4 mb-2">
                            <button
                                type="button"
                                onClick={() => setRiskInputType('percentage')}
                                className={`flex-1 py-2 px-4 rounded-lg font-semibold transition duration-200 transform hover:scale-105 ${riskInputType === 'percentage'
                                    ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg'
                                    : 'bg-blue-100 hover:bg-blue-200 text-blue-700 dark:bg-blue-900/30 dark:hover:bg-blue-800/50 dark:text-blue-300'
                                    }`}
                            >
                                Percentage (%)
                            </button>
                            <button
                                type="button"
                                onClick={() => setRiskInputType('fixed')}
                                className={`flex-1 py-2 px-4 rounded-lg font-semibold transition duration-200 transform hover:scale-105 ${riskInputType === 'fixed'
                                    ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg'
                                    : 'bg-blue-100 hover:bg-blue-200 text-blue-700 dark:bg-blue-900/30 dark:hover:bg-blue-800/50 dark:text-blue-300'
                                    }`}
                            >
                                Fixed Amount ($)
                            </button>
                        </div>
                        {riskInputType === 'percentage' ? (
                            isRiskPercentageEditing ? (
                                <input
                                    type="number"
                                    value={percentageToRisk}
                                    onChange={(e) => setPercentageToRisk(e.target.value)}
                                    onBlur={() => setIsRiskPercentageEditing(false)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            setIsRiskPercentageEditing(false)
                                        }
                                    }}
                                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-lg"
                                    placeholder="Enter risk percentage"
                                    inputMode="decimal"
                                    autoFocus
                                />
                            ) : (
                                <div
                                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200 flex items-center justify-between"
                                    onClick={() => setIsRiskPercentageEditing(true)}
                                >
                                    <span className="text-gray-900 dark:text-gray-300">
                                        {percentageToRisk ? `${percentageToRisk}%` : 'Enter risk percentage'}
                                    </span>
                                    <svg
                                        className="w-5 h-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                </div>
                            )
                        ) : (
                            isFixedRiskEditing ? (
                                <input
                                    type="text"
                                    value={fixedRiskAmount}
                                    onChange={(e) => setFixedRiskAmount(formatPriceInput(e.target.value))}
                                    onBlur={() => setIsFixedRiskEditing(false)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            setIsFixedRiskEditing(false)
                                        }
                                    }}
                                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-lg"
                                    placeholder="Enter fixed risk amount"
                                    inputMode="decimal"
                                    autoFocus
                                />
                            ) : (
                                <div
                                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200 flex items-center justify-between"
                                    onClick={() => setIsFixedRiskEditing(true)}
                                >
                                    <span className="text-gray-900 dark:text-gray-300">
                                        {fixedRiskAmount ? `$${fixedRiskAmount}` : 'Enter fixed risk amount'}
                                    </span>
                                    <svg
                                        className="w-5 h-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                </div>
                            )
                        )}
                    </div>

                    <div>
                        <label className="block text-lg font-bold  text-gray-700 dark:text-gray-300 mb-2">
                            Entry Price ($)
                        </label>
                        {isEntryPriceEditing ? (
                            <input
                                type="text"
                                value={entryPrice}
                                onChange={(e) => setEntryPrice(formatPriceInput(e.target.value))}
                                onBlur={() => setIsEntryPriceEditing(false)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        setIsEntryPriceEditing(false)
                                    }
                                }}
                                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-lg"
                                placeholder="Enter entry price"
                                inputMode="decimal"
                                autoFocus
                            />
                        ) : (
                            <div
                                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200 flex items-center justify-between"
                                onClick={() => setIsEntryPriceEditing(true)}
                            >
                                <span className="text-gray-900 dark:text-gray-300">
                                    {entryPrice ? `$${entryPrice}` : 'Enter entry price'}
                                </span>
                                <svg
                                    className="w-5 h-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                            </div>
                        )}
                    </div>

                    <div>
                        <label className="block text-lg font-bold  text-gray-700 dark:text-gray-300 mb-2">
                            Stop Loss Price ($)
                        </label>
                        {isStopLossEditing ? (
                            <input
                                type="text"
                                value={stopLossPrice}
                                onChange={(e) => setStopLossPrice(formatPriceInput(e.target.value))}
                                onBlur={() => setIsStopLossEditing(false)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        setIsStopLossEditing(false)
                                    }
                                }}
                                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-lg"
                                placeholder="Enter stop loss price"
                                inputMode="decimal"
                                autoFocus
                            />
                        ) : (
                            <div
                                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200 flex items-center justify-between"
                                onClick={() => setIsStopLossEditing(true)}
                            >
                                <span className="text-gray-900 dark:text-gray-300">
                                    {stopLossPrice ? `$${stopLossPrice}` : 'Enter stop loss price'}
                                </span>
                                <svg
                                    className="w-5 h-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                            </div>
                        )}
                        {portfolioSize && ((riskInputType === 'percentage' && percentageToRisk) || (riskInputType === 'fixed' && fixedRiskAmount)) && (
                            <p className="text-sm text-red-600 dark:text-red-400 mt-2 font-medium">
                                If price hits stop loss based on the above parameters, this would result in a ${riskInputType === 'percentage'
                                    ? ((parseFormattedPrice(portfolioSize) * parseFloat(percentageToRisk)) / 100).toFixed(2)
                                    : parseFloat(fixedRiskAmount).toFixed(2)
                                } loss.
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="block text-lg font-bold text-gray-700 dark:text-gray-300 mb-2">
                            Take Profit Target ($) <span className="text-sm font-normal text-gray-500 dark:text-gray-400">(Optional)</span>
                        </label>
                        {isTakeProfitEditing ? (
                            <input
                                type="text"
                                value={takeProfitPrice}
                                onChange={(e) => setTakeProfitPrice(formatPriceInput(e.target.value))}
                                onBlur={() => setIsTakeProfitEditing(false)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        setIsTakeProfitEditing(false)
                                    }
                                }}
                                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-lg"
                                placeholder="Enter take profit price"
                                inputMode="decimal"
                                autoFocus
                            />
                        ) : (
                            <div
                                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200 flex items-center justify-between"
                                onClick={() => setIsTakeProfitEditing(true)}
                            >
                                <span className="text-gray-900 dark:text-gray-300">
                                    {takeProfitPrice ? `$${takeProfitPrice}` : 'Enter take profit price'}
                                </span>
                                <svg
                                    className="w-5 h-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                            </div>
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
                                    className={`text-3xl font-extrabold text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-800/30 px-3 py-1 rounded-lg cursor-pointer hover:bg-blue-200 dark:hover:bg-blue-700/50 active:bg-blue-300 dark:active:bg-blue-600/50 transition-all duration-200 relative touch-manipulation ${isMobile ? 'select-text' : 'select-none'} inline-flex items-center gap-2`}
                                    onClick={() => copyToClipboard(Math.floor(positionSize).toString())}
                                    title={isMobile ? "Tap to copy or tap and hold to select" : "Click to copy number"}
                                >
                                    ${positionSize.toFixed(2)}
                                    <svg
                                        className="w-4 h-4 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 transition-colors duration-200 flex-shrink-0"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                    </svg>
                                    <span className="absolute -top-1 -right-1 text-xs bg-green-500 text-white px-1.5 py-0.5 rounded-full opacity-0 transition-opacity duration-200" id="copy-indicator">
                                        ✓
                                    </span>
                                </span>
                            </p>
                            <br></br>
                            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                Recommended Margin: <br />
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
                            <br></br>
                            {riskRewardRatio !== null && (
                                <>
                                    <p className={`text-2xl font-bold ${riskRewardRatio < 1 ? 'text-red-600 dark:text-red-400' : 'text-blue-600 dark:text-blue-400'}`}>
                                        Risk/Reward Ratio: <br />
                                        <span className={`text-3xl font-extrabold px-3 py-1 rounded-lg ${riskRewardRatio < 1
                                            ? 'text-red-700 dark:text-red-300 bg-red-100 dark:bg-red-800/30'
                                            : 'text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-800/30'
                                            }`}>
                                            1:{riskRewardRatio.toFixed(2)}
                                        </span>
                                    </p>
                                    <br></br>
                                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                                        Potential Profit: <br />
                                        <span className={`text-3xl font-extrabold px-3 py-1 rounded-lg text-green-700 dark:text-green-300 bg-green-100 dark:bg-green-800/30`}>
                                            ${potentialProfit?.toFixed(2)}
                                        </span>
                                    </p>
                                </>
                            )}

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
                        <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                            <strong>Risk/Reward Ratio:</strong> {positionType === 'long'
                                ? '(Take Profit ÷ Entry Price - 1) ÷ (1 - Stop Loss ÷ Entry Price)'
                                : '(1 - Take Profit ÷ Entry Price) ÷ (Stop Loss ÷ Entry Price - 1)'
                            }
                        </p>
                        <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                            <strong>Potential Profit:</strong> Position Size × {positionType === 'long'
                                ? '(Take Profit ÷ Entry Price - 1)'
                                : '(1 - Take Profit ÷ Entry Price)'
                            }
                        </p>
                        <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
                            {positionType === 'long'
                                ? 'For long positions: Stop Loss < Entry Price < Take Profit'
                                : 'For short positions: Take Profit < Entry Price < Stop Loss'
                            }
                        </p>
                    </div>
                </div>
            </div>
            <Analytics />
        </main>
    )
}
