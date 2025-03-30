# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)

# MediConnect Face Authentication System

## Face Data Storage

The face authentication system in MediConnect stores face data in two ways:

1. **Local Storage (Browser)**:
   - Face descriptors are stored in browser's localStorage under the key `face_descriptors`
   - User account data is stored under the key `user_data`
   - This data persists even when the browser is closed, but is specific to the device/browser being used
   - To view this data: Open browser DevTools > Application tab > Storage > Local Storage

2. **Firebase (optional)**:
   - When using Firebase integration, face descriptors are stored in Firestore database
   - The collection used is `faceDescriptors` with each document ID matching the user ID
   - Each document contains the face descriptor data as an array of floating point numbers

### Data Structure

**1. User Data (in localStorage):**
```json
[
  {
    "userId": "user_1234567890",
    "email": "user@example.com",
    "username": "username",
    "password": "password123", 
    "createdAt": "2023-04-16T10:30:00.000Z",
    "hasFaceAuth": true
  },
  // More users...
]
```

**2. Face Descriptors (in localStorage):**
```json
[
  {
    "userId": "user_1234567890",
    "descriptor": [0.1, 0.2, -0.3, ...], // 128-dimension face descriptor
    "timestamp": "2023-04-16T10:30:00.000Z"
  },
  // More descriptors...
]
```

## Troubleshooting Camera Feed Issues

If the camera feed is not displaying during registration:

1. **Check Browser Permissions**: Ensure the browser has permission to access the camera
2. **Use Supported Browser**: Chrome, Firefox, or Edge are recommended
3. **Enable HTTPS**: Camera access works more reliably on HTTPS connections
4. **Check Console**: Open browser DevTools to see any error messages
5. **Clear Cache**: Try clearing browser cache and local storage
