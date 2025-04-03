import { ref, push, set, get, query, orderByChild, equalTo } from "firebase/database";
import { rtdb } from "../firebase/config";

/**
 * Service for managing prescription notifications between ASHA workers and users
 */
const notificationService = {
  /**
   * Create a prescription notification for a user
   * 
   * @param {Object} notificationData - The notification data
   * @returns {Promise<string>} - The notification ID
   */
  async createPrescriptionNotification(notificationData) {
    try {
      // Create reference for the new notification
      const notificationsRef = ref(rtdb, 'prescriptionNotifications');
      const newNotificationRef = push(notificationsRef);
      
      // Add timestamp
      const notificationWithTimestamp = {
        ...notificationData,
        createdAt: new Date().toISOString(),
        read: false
      };
      
      // Save notification
      await set(newNotificationRef, notificationWithTimestamp);
      
      return newNotificationRef.key;
    } catch (error) {
      console.error("Error creating prescription notification:", error);
      throw error;
    }
  },
  
  /**
   * Get all notifications for a specific user
   * 
   * @param {string} userId - The user ID
   * @returns {Promise<Array>} - Array of notifications
   */
  async getUserNotifications(userId) {
    try {
      if (!userId) {
        console.error("No user ID provided for fetching notifications");
        return [];
      }
      
      console.log("Fetching notifications for user:", userId);
      const notificationsRef = ref(rtdb, 'prescriptionNotifications');
      
      // Get all notifications first for debugging
      const allSnapshot = await get(notificationsRef);
      if (allSnapshot.exists()) {
        const allNotifications = [];
        allSnapshot.forEach(childSnapshot => {
          allNotifications.push({
            id: childSnapshot.key,
            ...childSnapshot.val()
          });
        });
        console.log("All notifications in DB:", allNotifications.length);
        
        // Log some sample user IDs to help diagnose issues
        const userIds = [...new Set(allNotifications.map(n => n.userId))];
        console.log("Sample user IDs in notifications:", userIds.slice(0, 5));
      } else {
        console.log("No notifications found in the database");
      }
      
      // Query notifications by userId
      const userNotificationsQuery = query(
        notificationsRef, 
        orderByChild('userId'),
        equalTo(userId)
      );
      
      console.log("Querying with userId:", userId);
      const snapshot = await get(userNotificationsQuery);
      
      if (!snapshot.exists()) {
        console.log(`No notifications found for user: ${userId}`);
        return [];
      }
      
      // Convert to array and add ID
      const notifications = [];
      snapshot.forEach(childSnapshot => {
        notifications.push({
          id: childSnapshot.key,
          ...childSnapshot.val()
        });
      });
      
      console.log(`Found ${notifications.length} notifications for user ${userId}`);
      
      // Sort by created date (newest first)
      return notifications.sort((a, b) => 
        new Date(b.createdAt) - new Date(a.createdAt)
      );
    } catch (error) {
      console.error("Error fetching user notifications:", error);
      return [];
    }
  },
  
  /**
   * Mark a notification as read
   * 
   * @param {string} notificationId - The notification ID
   * @returns {Promise<void>}
   */
  async markNotificationAsRead(notificationId) {
    try {
      const notificationRef = ref(rtdb, `prescriptionNotifications/${notificationId}`);
      await set(notificationRef, { read: true }, { merge: true });
    } catch (error) {
      console.error("Error marking notification as read:", error);
      throw error;
    }
  },
  
  /**
   * Generate a random estimate for billing and delivery
   * For demo purposes only
   * 
   * @returns {Object} - Random estimates for billing and delivery
   */
  generateRandomEstimates() {
    // Random delivery time between 30-120 minutes
    const deliveryMinutes = Math.floor(Math.random() * 90) + 30;
    
    // Random cost between 100-500 rupees
    const medicationCost = Math.floor(Math.random() * 400) + 100;
    
    // Random delivery fee between 20-50 rupees
    const deliveryFee = Math.floor(Math.random() * 30) + 20;
    
    const total = medicationCost + deliveryFee;
    
    return {
      deliveryTime: `${deliveryMinutes} minutes`,
      deliveryEstimate: new Date(Date.now() + deliveryMinutes * 60000).toISOString(),
      billing: {
        medicationCost: medicationCost,
        deliveryFee: deliveryFee,
        total: total,
        currency: "INR"
      }
    };
  }
};

export default notificationService;
