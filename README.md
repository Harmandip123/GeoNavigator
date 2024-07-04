# GeoNavigator
GeoNavigator is an interactive web application designed to track and manage workout locations using maps. 

1. Built with HTML, CSS, and JavaScript, this application provides users with a seamless experience **to log workouts,visualize them on a map, and store data locally for future reference.**
  
2. The workflow of the application is designed to be intuitive and user-friendly, ensuring an efficient way to manage workout data.

 3. **Application Flow**

     1. **Page Loads**:  The application starts by loading the page.
    
     2. **Get Current**: Location Coordinates (Async):The app retrieves the user's current geographic coordinates asynchronously.
  
     3. **Render Map on Current Location**: Once the coordinates are obtained, the map is rendered centered on the user's current location.
  
     4. **Load Workouts from Local Storage**: The app loads previously stored workouts from the local storage, if any.
  
     5. **User Interaction**:
   
        a. User Clicks on Map: When the user clicks on the map, a workout form is displayed, allowing the user to enter new workout details.
  
        b. User Submits New Workout:The user fills out the form and submits a new workout. 
  
        c. The new workout is then rendered on the map and added to the workout list.
  
        d. The new workout details are stored in local storage for future use.
  
        e. User Clicks on Workout in List:Clicking on a workout in the list moves the map to the workout's location and highlights the workout on the map.
