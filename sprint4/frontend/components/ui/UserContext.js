import { createContext, useContext, useEffect, useState } from 'react';

// Create the UserContext
export const UserContext = createContext();

// Create the provider component
export const UserProvider = ({ children }) => {
  const [user, setUser] = useState({
    name: '',
    email: '',
    image: '',
  });

  useEffect(() => {
    setUser({
      email: localStorage.getItem('name'), name: localStorage
        .getItem('name')
    })
  },[])

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);