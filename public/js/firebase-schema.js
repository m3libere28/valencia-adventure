// Firebase Collections Schema

// Collection: apartments
/*
{
    id: string (auto-generated),
    name: string,
    location: string,
    price: number,
    bedrooms: number,
    bathrooms: number,
    size: number,
    notes: string,
    createdBy: string (user ID),
    createdAt: timestamp,
    updatedAt: timestamp
}
*/

// Collection: budgets
/*
{
    id: string (auto-generated),
    userId: string,
    totalBudget: number,
    expenses: [
        {
            amount: number,
            category: string,
            description: string,
            date: timestamp
        }
    ],
    categories: [string],
    createdAt: timestamp,
    updatedAt: timestamp
}
*/

// Collection: weather
/*
{
    id: string (auto-generated),
    city: string,
    temperature: {
        current: number,
        feels_like: number,
        min: number,
        max: number
    },
    humidity: number,
    description: string,
    icon: string,
    wind: {
        speed: number,
        direction: number
    },
    timestamp: timestamp
}
*/

// Helper functions for Firebase operations
const FirebaseHelpers = {
    // Create a new apartment
    createApartment: async (data) => {
        const user = firebase.auth().currentUser;
        if (!user) throw new Error('User must be authenticated');
        
        const apartment = {
            ...data,
            createdBy: user.uid,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        };
        
        return await db.collection('apartments').add(apartment);
    },

    // Get user's apartments
    getUserApartments: async () => {
        const user = firebase.auth().currentUser;
        if (!user) throw new Error('User must be authenticated');
        
        const snapshot = await db.collection('apartments')
            .where('createdBy', '==', user.uid)
            .orderBy('createdAt', 'desc')
            .get();
            
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    },

    // Create or update user's budget
    updateBudget: async (data) => {
        const user = firebase.auth().currentUser;
        if (!user) throw new Error('User must be authenticated');
        
        const budgetRef = db.collection('budgets').doc(user.uid);
        const budget = {
            userId: user.uid,
            ...data,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        };
        
        await budgetRef.set(budget, { merge: true });
        return budget;
    },

    // Get user's budget
    getUserBudget: async () => {
        const user = firebase.auth().currentUser;
        if (!user) throw new Error('User must be authenticated');
        
        const doc = await db.collection('budgets').doc(user.uid).get();
        if (!doc.exists) {
            return {
                userId: user.uid,
                totalBudget: 0,
                expenses: [],
                categories: []
            };
        }
        return { id: doc.id, ...doc.data() };
    }
};

// Export helpers for use in other modules
window.FirebaseHelpers = FirebaseHelpers;
