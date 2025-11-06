import { useIdleTimer } from 'react-idle-timer';
import {useAuth } from  '../context/AuthContext';
  
//const IDLE_TIMEOUT = 10 * 1000; // 10 seconds for testing
const IDLE_TIMEOUT = 15 * 60 * 1000; // 15 minutes
  
const useAutoLogoutOnIdle = () => {
  
  const {logout,getToken} = useAuth();

  const handleOnIdle = () => {
     
    if(getToken){
        logout()
    }
  };

  useIdleTimer({
    timeout: IDLE_TIMEOUT,
    onIdle: handleOnIdle,
    debounce: 500,
  });
};

export default useAutoLogoutOnIdle;
