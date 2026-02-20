# IVR System for Call Management

This project implements a **modular IVR** using **XState** for state machine management and **Asterisk ARI** for handling telephone calls.

The IVR is designed as a scalable system that supports:

- Navigation through multiple department menus.  
- Limited attempts per menu.  
- DTMF input with timeout handling.  
- Dynamic text-to-speech audio using **eSpeak**.  
- Integration with Asterisk ARI to answer and hang up calls.

---

## 🎛 Base Machine (`withAttempts`)

The **base machine** is the core of the IVR menu system. Its purpose is to:

- Provide uniform **retry control** for all menus.  
- Define user input handling and state transitions.  
- Serve as a template for all department-specific machines.

Each department machine can define its own states and actions without duplicating retry or input logic, ensuring consistency and maintainability.

---

## 🏢 Main Machine and Department Menus

The IVR consists of multiple state machines representing each department menu, all **inheriting logic from the base machine**, which ensures retry control, DTMF handling, and safe state transitions.

### Main Machine

The main machine serves as the entry point for incoming calls. Callers are greeted and presented with the department menu:

- Press `1` for **Billing**  
- Press `2` for **HR**

### HR Department

Within HR, the user can choose between:

- **Payroll**:  
  The system requests the DNI (8 digits) via DTMF. A simulated API call (`getUser`) retrieves user data, and a message with the user’s name and a mock payroll is played.

- **Recruitment**:  
  The IVR plays a message indicating that the request will be handled and ends the call.

### Billing Department

Within Billing, the user can choose between:

- **Check Invoices**:  
  Simulated invoice lookup (logs).  

- **Pay Invoices**:  
  Simulated invoice payment (logs).

---

The **main machine** coordinates all departments, ensuring smooth, secure, and consistent navigation, while each department machine maintains its own logic and leverages base machine functionality.

---

## 📞 DTMF Handling (`listenDtmf`)

The `listenDtmf` function captures user input from the phone keypad during a call. It allows the IVR to determine which option the user selected and enables the state machines to respond appropriately.

Key features:  

- Define the number of digits expected and the termination character (e.g., `#`).  
- Set a maximum input timeout (default 10 seconds).  
- Automatically hang up if no input is received within the timeout period.

---

## 🔊 Text-to-Speech (TTS) with eSpeak

The IVR generates dynamic audio messages using **eSpeak**:

1. Text is sent via HTTP POST to the eSpeak microservice.  
2. A `.wav` audio file is generated on the server.  
3. Audio is played in the call via ARI.  
4. Optionally, the call can be ended after playback.

This allows dynamic messages to be played at any state of the machine.

---

## 🛠 General IVR Workflow

When a call arrives:

1. The call is automatically answered using `answerChannel`.  
2. The **main machine** is started, presenting the department selection menu.  
3. Based on the user’s DTMF input, the corresponding department machine is invoked.  
4. Each department machine can handle sub-menus, play messages, request input, or end the call.  
5. After a department machine finishes, the call can return to the main menu or be terminated automatically.