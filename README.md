# Remote Timer

![Image](https://github.com/user-attachments/assets/ac856850-aabc-41e5-9825-ee54e1557de7)

A remote timer application that consists of a controller and a display. The controller allows you to set and update the timer, while the display shows the remaining time.

## Features

- **Controller**: Set and update the timer.
- **Display**: Shows the remaining time with visual effects.
- **WebSocket Communication**: Real-time updates between the controller and the display.
- **Responsive Design**: Optimized for various screen sizes.

## Technologies Used

- **Frontend**: React, TypeScript, Bootstrap, Bootstrap Icons
- **Backend**: Node.js, WebSocket
- **Styling**: CSS

## Getting Started

### Prerequisites

- Node.js
- npm or yarn

### Installation

1. Clone the repository:

    ```sh
    git clone https://github.com/aro-wolo/remote-timer
    cd remote-timer
    ```

2. Install dependencies for the client:

    ```sh
    cd client
    npm install
    ```

3. Install dependencies for the server:

    ```sh
    cd ../server
    npm install
    ```

### Running the Application

1. Start the WebSocket server:

    ```sh
    npm run dev
    ```

2. Start the React client:

    ```sh
    cd ../client
    npm start
    ```

3. Open your browser and navigate to `http://localhost:3000`.

### Usage

- **Controller**: Navigate to `http://localhost:3000/control` to set and update the timer.
- **Display**: Navigate to `http://localhost:3000/display` to view the remaining time.

## License

This project is licensed under the MIT License.
