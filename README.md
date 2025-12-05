# Guess Optimizer

**GeoGuessr Expectation Simulator**

[Live Demo](http://mug.sh/guess-optimizer/)  
[GitHub Repository](https://github.com/sh-mug/guess-optimizer)

## Overview

Guess Optimizer is an expectation simulator for the popular geography game GeoGuessr. It is designed to analyze and optimize guessing strategies by simulating various guess scenarios, providing insights into potential outcomes based on location, distances, and scores.

## Features

- **GeoGuessr Simulation**: Simulate guess placements and evaluate expected scores across different locations.
- **Score Analysis**: Calculate expected scores based on user-defined guess strategies.
- **Strategy Optimization**: Experiment with different approaches to maximize expected points.
- **Customizable Inputs**: Adjust simulation parameters for fine-tuned results.
- **Interactive Web Interface**: Intuitive web-based UI for easy experimentation and visualization.

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (latest LTS recommended)
- [pnpm](https://pnpm.io/) or npm/yarn

### Installation

1. Clone this repository:
    ```bash
    git clone https://github.com/sh-mug/guess-optimizer.git
    cd guess-optimizer
    ```

2. Install dependencies:
    ```bash
    pnpm install
    # or
    npm install
    ```

### Usage

#### Development Server

Start the local development server:
```bash
pnpm dev
# or
npm run dev
```
Visit `http://localhost:5173` in your browser.

#### Production Build

Create a production build:
```bash
pnpm build
# or
npm run build
```

Serve the built files:
```bash
pnpm preview
# or
npm run preview
```

### Running Tests

You may run available tests using:
```bash
pnpm test
# or
npm run test
```

## Project Structure

- `src/` – Source code including core logic and components
- `public/` – Static assets
- `scripts/` – Utility and support scripts
- `tests/` – Unit and integration tests
- `index.html` – Main HTML entry point
- `vite.config.ts` – Build and dev server configuration

## License

This project currently does not define a license. Please contact the repository owner for usage details.

## Author

- [sh-mug](https://github.com/sh-mug)
