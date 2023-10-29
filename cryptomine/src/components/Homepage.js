import { useState, useEffect } from 'react';
import { getFirestore, doc, getDoc, collection, onSnapshot } from 'firebase/firestore';
import { useFirebase } from './UserRoleContext';
import TradingViewWidget from './TradingView';
import TickerTapeWidget from './TickerTape';

const HomePage = () => {
  const {userImg, userEmail, userFullName, userID, userPhoneNo ,userRole } = useFirebase();

  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    // Initialize Firebase
    const db = getFirestore();
    // Fetch tasks from Firebase
    const tasksRef = collection(db, 'tasks');
    onSnapshot(tasksRef, (snapshot) => {
      const tasksData = [];
      snapshot.forEach((doc) => {
        tasksData.push({ id: doc.id, ...doc.data() });
      });
      setTasks(tasksData);
    });
  }, []);

  return (
    <div>
      <div className="welcome-section">
        {/* welcome message */}
      </div>
      <div className="task-section">
        <h2>Tasks</h2>
        <ul>
          {tasks.map((task) => (
            <li key={task.id}>
              <div className="task-item">
                <span>{task.title}</span>
                <button className='bg-danger mx-auto' onClick={() => completeTask(task.id, task.bonus)}>Complete</button>
              </div>
            </li>
          ))}
        </ul>
      </div>
      <div className='trading_view'>
            <TickerTapeWidget />
            <TradingViewWidget />
      </div>
    </div>
  );
};

// Function to complete a task and update the balance in Firebase
const completeTask = (taskId, bonus) => {
  // Update user's balance in Firebase, you need to implement this logic
  // You may also want to check if the task is completed already to prevent multiple completions
  // Then, you can remove the task from the list or mark it as completed in Firebase
};

export default HomePage;
