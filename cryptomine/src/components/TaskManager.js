import React, { useState, useEffect } from 'react';
import { doc, getDoc, updateDoc, getFirestore, collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { useFirebase } from './UserRoleContext';
import Notification from './Notification';
import { onAuthStateChanged } from 'firebase/auth';
import myGreenImage from '../green-loader.gif';
import myRedImage from '../red-loader.gif';

const TaskManager = () => {
  const [task, setTask] = useState(null);
  const [bonusTask, setBonusTask] = useState(null);
  const [completedTasks, setCompletedTasks] = useState([null]); // Add completedTasks state
  const { userImg, userEmail, userFullName, userID, userPhoneNo, userRole, userBalance, setUserBalance } = useFirebase();
  const user = auth.currentUser;
  const [notification, setNotification] = useState(null);
  const [isBtnLoading, setIsBtnLoading] = useState(false);
  const [isBonusBtnLoading, setIsBonusBtnLoading] = useState(false);

  const isTaskCompleted = completedTasks.includes(task?.taskID);
  const isBonusTaskCompleted = completedTasks.includes(bonusTask?.taskID);


  const showNotification = (message) => {
    setNotification(message);

    // Automatically close the notification after a certain duration (e.g., 3 seconds)
    setTimeout(() => {
      setNotification(null);
    }, 5000);
  };

  useEffect(() => {
    const firestore = getFirestore();
  
    // Generate the task ID for the current date in the format 'task-YYYYMMDD'
    const currentDate = new Date();
    const taskID = `task-${currentDate.getFullYear()}${(currentDate.getMonth() + 1)
      .toString()
      .padStart(2, '0')}${currentDate.getDate().toString().padStart(2, '0')}`;
  
    // Generate the bonus task ID using the same currentDate
    const bonusTaskID = `bonusTask-${currentDate.getFullYear()}${(currentDate.getMonth() + 1)
      .toString()
      .padStart(2, '0')}${currentDate.getDate().toString().padStart(2, '0')}`;
  
    const fetchDailyTask = async () => {
      const taskRef = doc(firestore, 'dailyTasks', taskID);
      const taskSnapshot = await getDoc(taskRef);
      
      if (taskSnapshot.exists()) {
        setTask(taskSnapshot.data());
      }
    };
  
    const fetchBonusTask = async () => {
      const taskRef = doc(db, 'dailyTasks', bonusTaskID);
      const taskSnapshot = await getDoc(taskRef);
      
      if (taskSnapshot.exists()) {
        setBonusTask(taskSnapshot.data());
      }
    };
  
    onAuthStateChanged(auth, (user) => {
      // fetching completed user tasks
      const fetchCompletedTasks = async () => {
        if (user) {
          const completedTasksCollection = collection(db, 'users', user.uid, 'completedTasks');
          const querySnapshot = await getDocs(completedTasksCollection);
          const completedTaskIds = querySnapshot.docs.map((doc) => doc.data().taskId);
          setCompletedTasks(completedTaskIds);
        }
      };
  
      fetchCompletedTasks();
    });
  
    // Call both fetch functions
    fetchDailyTask();
    fetchBonusTask();
  }, []);
  

   // Function to refresh completed tasks
   const refreshCompletedTasks = async () => {
     if (user) {
       const completedTasksCollection = collection(db, 'users', user.uid, 'completedTasks');
       const querySnapshot = await getDocs(completedTasksCollection);
       const completedTaskIds = querySnapshot.docs.map((doc) => doc.data().taskId);
       setCompletedTasks(completedTaskIds);
     }
     else{
      console('refresh drop not confirmed!');
     }
   };

  const completeTask = async () => {
    setIsBtnLoading(true);
    if (isTaskCompleted) {
      setIsBtnLoading(false);
      alert('You have already completed this task.');
    }
  else if (user && task && userBalance !== null && completedTasks !== null) {
      // Fetch the reward amount from the task or any other location in your database
      const rewardAmount = task.reward;
  
      const newBalance = userBalance + rewardAmount;
  
      // Update the user's balance in Firebase
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, { balance: newBalance });
  
      // Fetch the updated user balance from the server
      const userBalanceRef = doc(db, 'users', user.uid);
      const userBalanceSnapshot = await getDoc(userBalanceRef);
      
      if (userBalanceSnapshot.exists()) {
        const updatedBalance = userBalanceSnapshot.data().balance;
        
        // Update userBalance in the context
        setUserBalance(updatedBalance);
      }
      console.log(`this is the task that was set ${JSON.stringify(task)}`);
        // Mark the task as completed for the user
      const userTaskRef = collection(db, 'users', user.uid, 'completedTasks');
      await addDoc(userTaskRef, { taskId: task.taskID });

  
    
      // Refresh the completed tasks
      await refreshCompletedTasks();
      setIsBtnLoading(false);
      alert('Drop Collected!');
    } 
  };

  const completeBonusTask = async () => {
    setIsBonusBtnLoading(true);
    if (isBonusTaskCompleted) {
      setIsBonusBtnLoading(false);
      alert('You have already completed this task.');
    }
  else if (user && bonusTask && userBalance !== null && completedTasks !== null) {
      // Fetch the reward amount from the task or any other location in your database
      const rewardAmount = bonusTask.reward;
      const newBalance = userBalance + rewardAmount;
  
      // Update the user's balance in Firebase
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, { balance: newBalance });
  
      // Fetch the updated user balance from the server
      const userBalanceRef = doc(db, 'users', user.uid);
      const userBalanceSnapshot = await getDoc(userBalanceRef);
      
      if (userBalanceSnapshot.exists()) {
        const updatedBalance = userBalanceSnapshot.data().balance;
        
        // Update userBalance in the context
        setUserBalance(updatedBalance);
      }
        // Mark the task as completed for the user
      const userTaskRef = collection(db, 'users', user.uid, 'completedTasks');
      await addDoc(userTaskRef, { taskId: bonusTask.taskID });

  
    
      // Refresh the completed tasks
      await refreshCompletedTasks();
      setIsBonusBtnLoading(false);
      alert('Drop Collected!');
    } 

  };
  
  return (
    <div className='drop-list'>
      {notification && (
        <Notification 
          message={notification}
          onClose={() => setNotification(null)}
        />
      )}
      {user && task || bonusTask ? (
        <>
        {task && (
          <div className='d-flex justify-content-between i-task p-3'>
          <div className='first-part'>
          <p className='text-theme bold'>Claim your daily drop:</p>
          <p className=''>{task.description}</p>
          </div>
          <button id='myButton' className={`${task.description == 'bonus task' ? 'bonus-btn' : 'task-btn'}`} onClick={completeTask}>
            {isBtnLoading ? (
                 <img src={myRedImage} alt="Loading" width="20" height="20" />
             ) : (
               <> 
               {isTaskCompleted ? (
                "Claimed"
               ) : (
                `+${task.reward || 200} Naira`
               )}
               </>
             )}
             
          </button>
        </div>
        )}
        {/* display bonus task */}
        {bonusTask && (
          <div className='d-flex justify-content-between i-task p-3'>
            <div className='first-part'>
             <p className='success-btn bold'>Bonus Drop Available:</p>
             <p className=''>{bonusTask.description}</p>
            </div>
            <button
              id='myButton'
              className={`task-btn`}
              onClick={completeBonusTask}
            >
              
              {isBonusBtnLoading ? (
                  <img src={myRedImage} alt="Loading" width="20" height="20" />
               ) : (
                <>
                {isBonusTaskCompleted ? (
                  "Claimed"
                ) : (
                  `+${bonusTask.reward || 200} Naira`
                )}
              </>
               )}
            </button>
         </div>
        )}

        </>
      ):
      <>
      <div className={`unavailable increase_size`}>
            <p className='sm-col text-secondary d-flex justify-content-center text-center align-items-start'>
              <span className='mx-1'>    <svg
                xmlns="http://www.w3.org/2000/svg"
                width="25"
                height="25"
                fill="currentColor"
                className="bi bi-info-circle"
                viewBox="0 0 16 16"
             >
                <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z" />
                <path d="m8.93 6.588-2.29.287-.082.38.45.083c.294.07.352.176.288.469l-.738 3.468c-.194.897.105 1.319.808 1.319.545 0 1.178-.252 1.465-.598l.088-.416c-.2.176-.492.246-.686.246-.275 0-.375-.193-.304-.533L8.93 6.588zM9 4.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0z" />
              </svg>
              </span>
              <span>No Drops Available</span>
              </p>
          </div>
      </>
      }
    </div>
  );
};

export default TaskManager;
