import React, { createContext, useContext, useState } from 'react';

const UserContext = createContext();

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export const UserProvider = ({ children }) => {
  const [users, setUsers] = useState([
    {
      id: 1,
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      phone: '(555) 123-4567',
      userType: '2',
      clinicId: '1',
      address: '123 Main St, New York, NY 10001',
      avatar: null,
      shortBiography: 'Experienced ophthalmologist specializing in retinal diseases.',
      status: 'Active',
      createdAt: '2024-01-15',
    },
    {
      id: 2,
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane.smith@example.com',
      phone: '(555) 987-6543',
      userType: '3',
      clinicId: '1',
      address: '456 Oak Ave, Los Angeles, CA 90001',
      avatar: null,
      shortBiography: 'Board-certified doctor with 10 years of experience.',
      status: 'Active',
      createdAt: '2024-02-20',
    },
    {
      id: 3,
      firstName: 'Michael',
      lastName: 'Johnson',
      email: 'michael.j@example.com',
      phone: '(555) 456-7890',
      userType: '4',
      clinicId: '2',
      address: '789 Pine Rd, Chicago, IL 60601',
      avatar: null,
      shortBiography: 'Dedicated medical assistant with expertise in patient care.',
      status: 'Active',
      createdAt: '2024-03-10',
    },
    {
      id: 4,
      firstName: 'Sarah',
      lastName: 'Williams',
      email: 'sarah.w@example.com',
      phone: '(555) 321-0987',
      userType: '6',
      clinicId: '1',
      address: '321 Elm St, Houston, TX 77001',
      avatar: null,
      shortBiography: 'Clinic administrator managing daily operations.',
      status: 'Inactive',
      createdAt: '2024-01-25',
    },
  ]);

  const addUser = (user) => {
    const newUser = {
      ...user,
      id: Date.now(),
      createdAt: new Date().toISOString().split('T')[0],
    };
    setUsers([...users, newUser]);
    return newUser;
  };

  const updateUser = (id, updatedUser) => {
    setUsers(users.map((user) => (user.id === id ? { ...user, ...updatedUser } : user)));
  };

  const deleteUser = (id) => {
    setUsers(users.filter((user) => user.id !== id));
  };

  const getUserById = (id) => {
    return users.find((user) => user.id === parseInt(id));
  };

  const getUsersByClinic = (clinicId) => {
    return users.filter((user) => user.clinicId === clinicId);
  };

  const getUsersByType = (userType) => {
    return users.filter((user) => user.userType === userType);
  };

  const getActiveUsers = () => {
    return users.filter((user) => user.status === 'Active');
  };

  const getInactiveUsers = () => {
    return users.filter((user) => user.status === 'Inactive');
  };

  const value = {
    users,
    addUser,
    updateUser,
    deleteUser,
    getUserById,
    getUsersByClinic,
    getUsersByType,
    getActiveUsers,
    getInactiveUsers,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

