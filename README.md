# Position Size Calculator

A simple Next.js application for calculating position size in futures trading.

## Formula

The position size is calculated using the following formula:

```
(portfolio_size × percentage_to_risk / 100) / (1 - stop_loss_price / entry_price) = position_size
```

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Features

- Clean, modern UI with dark mode support
- Real-time position size calculation
- Input validation
- Responsive design
- Formula display for reference

## Usage

1. Enter your portfolio size (total capital)
2. Enter the percentage of your portfolio you want to risk
3. Enter the entry price for your trade
4. Enter the stop loss price
5. Click "Calculate" to get the recommended position size

The calculator will show you the optimal position size based on your risk parameters.
