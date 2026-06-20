# Integrated Virtual Lab Assistant

An immersive WebVR-based electronics laboratory that combines interactive virtual lab environments with an AI-powered laboratory assistant.

## Features

- Virtual Reality laboratory environment
- AI-powered educational assistant
- Voice recognition and speech synthesis
- Electronics and physics knowledge base
- Laboratory safety guidance
- Persistent chat history

## Technology Stack

### Frontend
- HTML5
- CSS3
- JavaScript(ES6+)
- A-Frame
- Web Speech API
- Local Storage API

### Backend
- Node.js
- Native HTTP Server

### AI Integration
- Anthropic Claude 
- Claude Opus Model

## Important Files
- index.html
- script.js
- style.css
- server.js
- api/chat.js
- 67.glb
- package.json


## Prerequisites
Before running the application, ensure the following are installed:
- Node.js 20.12 or later
- npm
- Anthropic API Key
- Chrome or Microsoft Edge

## Installation
### Clone the Repository
```bash
git clone https://github.com/dorvloelorm7-design/integrated-virtual-lab-assistant.git
cd integrated-virtual-lab-assistant
```

### Install the Dependencies
```Bash
npm install
```

## Configuration
### Set Anthropic API Key
Window PowerShell
```
$env:ANTHROPIC_API_KEY="your-api-key"
```

Linux/macOS/Git Bash
```
export ANTHROPIC_API_KEY="your-api-key"
```

Alternatively, create a ```.env``` file.


## Running the Application
### Start the Backend Server

```bash
npm start
```
Expected output:
```Lab assistant server running at http://localhost:3000
```
### Launch the Frontend
Open:
```index.html
```
in:
- Google Chrome
- Microsoft Edge

## Usage
- Launch the backend server.
- Open the VR laboratory.
- Navigate to a laboratory station.
- Use;
    - Voice Input
    - Text Input
- Ask laboratory-related questions.
- Receive guidance from the AI assistant.

## AI Assistant Scope
The assistant currently is intentionally restricted to:
- Electronic Physics
- Circuit Analysis
- Components
- Instruments
- Calibration
- Measurement Techniques
- Electrical Laboratory Safety

## Browser Compatibility
- Chrome : Yes
- Edge : Yes
- Firefox : Limited
- Safari : Limited

## Future Improvements
Potential enhancements include:
- Multi-user collaboration
- Additional laboratory modules
- Circuit simulation integration
- Equipment interaction analytics
- Laboratory assessment system
- Student progress tracking
- Expanded engineering knowledge domains
- Deployment to cloud platforms

## Project Structure
```text
integrated-virtual-lab-assistant/
├── api/
├── index.html
├── script.js
├── style.css
├── server.js
├── package.json
└── README.md
```

## Deployment
The application can be deployed on:
- Vercel
- Render
- Railway
- Azure
- AWS
- DigitalOcean

## License
No license specified.

